import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { generateLogTag } from "@/lib/utils";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Get wood type and supplier for log tag generation
    const [woodType, supplier] = await Promise.all([
      prisma.woodType.findUnique({ where: { id: data.woodTypeId } }),
      prisma.supplier.findUnique({ where: { id: data.supplierId } }),
    ]);

    if (!woodType || !supplier) {
      return NextResponse.json(
        { error: "Wood type or supplier not found" },
        { status: 404 }
      );
    }

    // Get sequence number for this wood type + supplier + date
    const purchaseDate = new Date(data.purchaseDate);
    const dateStr = purchaseDate.toISOString().split("T")[0];

    const existingLogs = await prisma.logInventory.findMany({
      where: {
        woodTypeId: data.woodTypeId,
        supplierId: data.supplierId,
        purchaseDate: {
          gte: new Date(dateStr),
          lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    const sequence = existingLogs.length + 1;

    // Generate log tag
    const logTag = generateLogTag(
      woodType.woodCode,
      supplier.supplierCode,
      purchaseDate,
      sequence
    );

    // Create log inventory
    const log = await prisma.logInventory.create({
      data: {
        logTag,
        woodTypeId: data.woodTypeId,
        supplierId: data.supplierId,
        purchaseDate,
        lingkarCm: data.lingkarCm,
        panjangM: data.panjangM,
        jumlahLog: data.jumlahLog,
        kubikasiTotal: data.kubikasiTotal,
        kubikasiFinal: data.kubikasiFinal,
        hargaPerKubik: data.hargaPerKubik,
        totalCost: data.totalCost,
        status: "Available",
        remainingKubikasi: data.kubikasiFinal,
      },
    });

    // Update or create inventory valuation for this wood type
    const today = new Date(dateStr);

    const existingValuation = await prisma.inventoryValuation.findUnique({
      where: {
        woodTypeId_valuationDate: {
          woodTypeId: data.woodTypeId,
          valuationDate: today,
        },
      },
    });

    if (existingValuation) {
      // Update existing valuation
      const newClosingKubikasi =
        existingValuation.closingKubikasi + data.kubikasiFinal;
      const newClosingValue = existingValuation.closingValue + data.totalCost;
      const newWac =
        newClosingKubikasi > 0 ? newClosingValue / newClosingKubikasi : 0;

      await prisma.inventoryValuation.update({
        where: { id: existingValuation.id },
        data: {
          purchaseKubikasi:
            existingValuation.purchaseKubikasi + data.kubikasiFinal,
          purchaseValue: existingValuation.purchaseValue + data.totalCost,
          closingKubikasi: newClosingKubikasi,
          closingValue: newClosingValue,
          wacPerKubik: newWac,
        },
      });
    } else {
      // Get previous day's valuation for opening balance
      const previousValuation = await prisma.inventoryValuation.findFirst({
        where: {
          woodTypeId: data.woodTypeId,
          valuationDate: { lt: today },
        },
        orderBy: { valuationDate: "desc" },
      });

      const openingKubikasi = previousValuation?.closingKubikasi || 0;
      const openingValue = previousValuation?.closingValue || 0;

      const closingKubikasi = openingKubikasi + data.kubikasiFinal;
      const closingValue = openingValue + data.totalCost;
      const wac = closingKubikasi > 0 ? closingValue / closingKubikasi : 0;

      await prisma.inventoryValuation.create({
        data: {
          woodTypeId: data.woodTypeId,
          valuationDate: today,
          openingKubikasi,
          openingValue,
          purchaseKubikasi: data.kubikasiFinal,
          purchaseValue: data.totalCost,
          consumedKubikasi: 0,
          consumedValue: 0,
          closingKubikasi,
          closingValue,
          wacPerKubik: wac,
        },
      });
    }

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Error creating log purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
