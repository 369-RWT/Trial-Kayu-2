import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ============================================================================
// GET: Inventory Valuation Report
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    // Use provided date or today
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    // Get all wood types
    const woodTypes = await prisma.woodType.findMany({
      where: { isActive: true },
      orderBy: { woodCode: "asc" },
    });

    // Build comprehensive inventory report for each wood type
    const inventoryReport = await Promise.all(
      woodTypes.map(async (woodType) => {
        // Get latest inventory valuation up to target date
        const latestValuation = await prisma.inventoryValuation.findFirst({
          where: {
            woodTypeId: woodType.id,
            valuationDate: { lte: targetDate },
          },
          orderBy: { valuationDate: "desc" },
        });

        // Get current inventory (all Available and Partial logs)
        const currentLogs = await prisma.logInventory.findMany({
          where: {
            woodTypeId: woodType.id,
            status: { in: ["Available", "Partial"] },
          },
          include: { supplier: true },
        });

        const totalKubikasi = currentLogs.reduce(
          (sum, log) => sum + log.remainingKubikasi,
          0
        );
        const totalValue = currentLogs.reduce(
          (sum, log) => sum + log.totalCost,
          0
        );
        const wac = totalKubikasi > 0 ? totalValue / totalKubikasi : 0;

        // Get purchase summary for date range (last 30 days)
        const thirtyDaysAgo = new Date(targetDate);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentPurchases = await prisma.logInventory.findMany({
          where: {
            woodTypeId: woodType.id,
            purchaseDate: {
              gte: thirtyDaysAgo,
              lte: targetDate,
            },
          },
        });

        const purchaseKubikasi = recentPurchases.reduce(
          (sum, log) => sum + log.kubikasiFinal,
          0
        );
        const purchaseValue = recentPurchases.reduce(
          (sum, log) => sum + log.totalCost,
          0
        );

        // Get consumption summary for date range (last 30 days)
        const recentConsumptions = await prisma.logConsumption.findMany({
          where: {
            woodTypeId: woodType.id,
            consumptionTimestamp: {
              gte: thirtyDaysAgo,
              lte: targetDate,
            },
          },
        });

        const consumedKubikasi = recentConsumptions.reduce(
          (sum, consumption) => sum + consumption.kubikasiConsumed,
          0
        );
        const consumedValue = recentConsumptions.reduce(
          (sum, consumption) => sum + consumption.materialCost,
          0
        );

        // Calculate closing inventory (current inventory)
        const closingKubikasi = totalKubikasi;
        const closingValue = totalValue;

        // Supplier breakdown
        const supplierBreakdown = currentLogs.reduce((acc, log) => {
          const supplierId = log.supplierId;
          if (!acc[supplierId]) {
            acc[supplierId] = {
              supplierId,
              supplierCode: log.supplier.supplierCode,
              supplierName: log.supplier.supplierName,
              kubikasi: 0,
              value: 0,
              logCount: 0,
            };
          }
          acc[supplierId].kubikasi += log.remainingKubikasi;
          acc[supplierId].value += log.totalCost;
          acc[supplierId].logCount += 1;
          return acc;
        }, {} as Record<number, any>);

        return {
          woodType: {
            id: woodType.id,
            woodCode: woodType.woodCode,
            woodName: woodType.woodName,
          },
          valuation: {
            valuationDate: targetDate.toISOString(),
            openingKubikasi: latestValuation?.closingKubikasi || 0,
            openingValue: latestValuation?.closingValue || 0,
            purchaseKubikasi,
            purchaseValue,
            consumedKubikasi,
            consumedValue,
            closingKubikasi,
            closingValue,
            wacPerKubik: wac,
          },
          currentInventory: {
            totalKubikasi,
            totalValue,
            totalLogs: currentLogs.length,
            supplierBreakdown: Object.values(supplierBreakdown),
          },
        };
      })
    );

    // Calculate totals
    const totals = inventoryReport.reduce(
      (acc, item) => ({
        openingValue: acc.openingValue + item.valuation.openingValue,
        purchaseValue: acc.purchaseValue + item.valuation.purchaseValue,
        consumedValue: acc.consumedValue + item.valuation.consumedValue,
        closingValue: acc.closingValue + item.valuation.closingValue,
        totalKubikasi: acc.totalKubikasi + item.currentInventory.totalKubikasi,
        totalLogs: acc.totalLogs + item.currentInventory.totalLogs,
      }),
      {
        openingValue: 0,
        purchaseValue: 0,
        consumedValue: 0,
        closingValue: 0,
        totalKubikasi: 0,
        totalLogs: 0,
      }
    );

    return NextResponse.json({
      reportDate: targetDate.toISOString(),
      reportPeriod: {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: targetDate.toISOString(),
      },
      inventoryByWoodType: inventoryReport,
      totals,
      generatedAt: new Date().toISOString(),
      generatedBy: session.user.email,
    });
  } catch (error) {
    console.error("Error generating inventory valuation report:", error);
    return NextResponse.json(
      {
        error: "Failed to generate inventory valuation report",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
