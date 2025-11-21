import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: Daily Production Summary Report
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let queryStartDate: Date;
    let queryEndDate: Date;

    if (startDate && endDate) {
      queryStartDate = new Date(startDate);
      queryEndDate = new Date(endDate);
    } else if (date) {
      queryStartDate = new Date(date);
      queryEndDate = new Date(date);
    } else {
      // Default to today
      queryStartDate = new Date();
      queryEndDate = new Date();
    }

    // Set time to start and end of day
    queryStartDate.setHours(0, 0, 0, 0);
    queryEndDate.setHours(23, 59, 59, 999);

    // Get all production batches in the date range
    const batches = await prisma.productionBatch.findMany({
      where: {
        productionDate: {
          gte: queryStartDate,
          lte: queryEndDate,
        },
      },
      include: {
        batchLineItems: {
          include: {
            woodType: true,
            product: true,
            worker: true,
            machineType: true,
            logConsumptions: true,
            productionOutputs: true,
            wasteDeviations: true,
          },
        },
      },
      orderBy: { productionDate: "desc" },
    });

    // Calculate production statistics
    const productionSummary = batches.map((batch) => {
      const lineItemsSummary = batch.batchLineItems.map((lineItem) => {
        const totalInputKubikasi =
          lineItem.logConsumptions.reduce(
            (sum, consumption) => sum + consumption.kubikasiConsumed,
            0
          ) || 0;

        const totalOutputKubikasi =
          lineItem.productionOutputs.reduce(
            (sum, output) => sum + output.kubikasiProduced,
            0
          ) || 0;

        const totalWasteKubikasi =
          lineItem.wasteDeviations.reduce(
            (sum, waste) => sum + waste.kubikasiWaste,
            0
          ) || 0;

        const materialCost =
          lineItem.logConsumptions.reduce(
            (sum, consumption) => sum + consumption.materialCost,
            0
          ) || 0;

        const actualWasteRate =
          totalInputKubikasi > 0 ? totalWasteKubikasi / totalInputKubikasi : 0;

        const efficiency =
          lineItem.targetKubikasi > 0
            ? (totalOutputKubikasi / lineItem.targetKubikasi) * 100
            : 0;

        return {
          lineNumber: lineItem.lineNumber,
          woodType: {
            code: lineItem.woodType.woodCode,
            name: lineItem.woodType.woodName,
          },
          product: {
            code: lineItem.product.productCode,
            name: lineItem.product.productName,
          },
          worker: lineItem.worker
            ? {
              code: lineItem.worker.workerCode,
              name: lineItem.worker.workerName,
            }
            : null,
          machineType: lineItem.machineType?.machineName || null,
          targetKubikasi: lineItem.targetKubikasi,
          actualOutputKubikasi: totalOutputKubikasi,
          totalInputKubikasi,
          totalWasteKubikasi,
          wasteRate: actualWasteRate,
          wacPerKubik: lineItem.wacPerKubik,
          materialCost,
          materialCostPerKubik:
            totalOutputKubikasi > 0 ? materialCost / totalOutputKubikasi : 0,
          efficiency,
          status:
            totalOutputKubikasi >= lineItem.targetKubikasi
              ? "Achieved"
              : totalOutputKubikasi > 0
                ? "Partial"
                : "Not Started",
        };
      });

      const batchTotals = lineItemsSummary.reduce(
        (acc, item) => ({
          targetKubikasi: acc.targetKubikasi + item.targetKubikasi,
          actualOutputKubikasi:
            acc.actualOutputKubikasi + item.actualOutputKubikasi,
          totalInputKubikasi: acc.totalInputKubikasi + item.totalInputKubikasi,
          totalWasteKubikasi: acc.totalWasteKubikasi + item.totalWasteKubikasi,
          materialCost: acc.materialCost + item.materialCost,
        }),
        {
          targetKubikasi: 0,
          actualOutputKubikasi: 0,
          totalInputKubikasi: 0,
          totalWasteKubikasi: 0,
          materialCost: 0,
        }
      );

      return {
        batchId: batch.id,
        productionDate: batch.productionDate.toISOString(),
        shift: batch.shift,
        status: batch.status,
        lineItems: lineItemsSummary,
        totals: {
          ...batchTotals,
          wasteRate:
            batchTotals.totalInputKubikasi > 0
              ? batchTotals.totalWasteKubikasi / batchTotals.totalInputKubikasi
              : 0,
          efficiency:
            batchTotals.targetKubikasi > 0
              ? (batchTotals.actualOutputKubikasi / batchTotals.targetKubikasi) *
              100
              : 0,
        },
      };
    });

    // Calculate overall totals
    const overallTotals = productionSummary.reduce(
      (acc, batch) => ({
        targetKubikasi: acc.targetKubikasi + batch.totals.targetKubikasi,
        actualOutputKubikasi:
          acc.actualOutputKubikasi + batch.totals.actualOutputKubikasi,
        totalInputKubikasi:
          acc.totalInputKubikasi + batch.totals.totalInputKubikasi,
        totalWasteKubikasi:
          acc.totalWasteKubikasi + batch.totals.totalWasteKubikasi,
        materialCost: acc.materialCost + batch.totals.materialCost,
        batchCount: acc.batchCount + 1,
      }),
      {
        targetKubikasi: 0,
        actualOutputKubikasi: 0,
        totalInputKubikasi: 0,
        totalWasteKubikasi: 0,
        materialCost: 0,
        batchCount: 0,
      }
    );

    // Calculate averages
    const averageWasteRate =
      overallTotals.totalInputKubikasi > 0
        ? overallTotals.totalWasteKubikasi / overallTotals.totalInputKubikasi
        : 0;

    const overallEfficiency =
      overallTotals.targetKubikasi > 0
        ? (overallTotals.actualOutputKubikasi / overallTotals.targetKubikasi) *
        100
        : 0;

    const averageCostPerKubik =
      overallTotals.actualOutputKubikasi > 0
        ? overallTotals.materialCost / overallTotals.actualOutputKubikasi
        : 0;

    return NextResponse.json({
      reportPeriod: {
        startDate: queryStartDate.toISOString(),
        endDate: queryEndDate.toISOString(),
      },
      productionBatches: productionSummary,
      summary: {
        ...overallTotals,
        averageWasteRate,
        overallEfficiency,
        averageCostPerKubik,
      },
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.email,
    });
  } catch (error) {
    console.error("Error generating daily production report:", error);
    return NextResponse.json(
      {
        error: "Failed to generate daily production report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
