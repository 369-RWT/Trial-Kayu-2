import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "@/lib/prisma";

describe("Reports Integration Tests", () => {
  let testWoodTypeId: number;
  let testSupplierId: number;

  beforeAll(async () => {
    // Create test data for reports
    const woodType = await prisma.woodType.create({
      data: {
        woodCode: "RPT-TEST",
        woodName: "Report Test Wood",
        avgWasteRate: 0.18,
        isActive: true,
      },
    });
    testWoodTypeId = woodType.id;

    const supplier = await prisma.supplier.findFirst();
    testSupplierId = supplier?.id || 1;

    // Create test inventory
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await prisma.logInventory.create({
      data: {
        logTag: "RPT-TEST-001",
        woodTypeId: testWoodTypeId,
        supplierId: testSupplierId,
        purchaseDate: thirtyDaysAgo,
        lingkarCm: 150,
        panjangM: 6,
        jumlahLog: 15,
        kubikasiTotal: 10.0,
        kubikasiFinal: 10.0,
        hargaPerKubik: 4000000,
        totalCost: 40000000,
        status: "Available",
        remainingKubikasi: 10.0,
      },
    });

    await prisma.logInventory.create({
      data: {
        logTag: "RPT-TEST-002",
        woodTypeId: testWoodTypeId,
        supplierId: testSupplierId,
        purchaseDate: new Date(),
        lingkarCm: 140,
        panjangM: 5.5,
        jumlahLog: 12,
        kubikasiTotal: 8.0,
        kubikasiFinal: 8.0,
        hargaPerKubik: 4200000,
        totalCost: 33600000,
        status: "Partial",
        remainingKubikasi: 5.0,
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.inventoryValuation.deleteMany({
      where: { woodTypeId: testWoodTypeId },
    });

    await prisma.logInventory.deleteMany({
      where: { logTag: { startsWith: "RPT-TEST" } },
    });

    if (testWoodTypeId) {
      await prisma.woodType.delete({ where: { id: testWoodTypeId } });
    }

    await prisma.$disconnect();
  });

  describe("Inventory Valuation Report", () => {
    it("should calculate current inventory totals", async () => {
      const logs = await prisma.logInventory.findMany({
        where: {
          woodTypeId: testWoodTypeId,
          status: { in: ["Available", "Partial"] },
        },
      });

      const totalKubikasi = logs.reduce(
        (sum, log) => sum + log.remainingKubikasi,
        0
      );
      const totalValue = logs.reduce((sum, log) => sum + log.totalCost, 0);

      expect(totalKubikasi).toBe(15.0); // 10.0 + 5.0
      expect(totalValue).toBe(73600000); // 40000000 + 33600000
    });

    it("should calculate WAC correctly", async () => {
      const logs = await prisma.logInventory.findMany({
        where: {
          woodTypeId: testWoodTypeId,
          status: { in: ["Available", "Partial"] },
        },
      });

      const totalValue = logs.reduce((sum, log) => sum + log.totalCost, 0);
      const totalKubikasi = logs.reduce(
        (sum, log) => sum + log.remainingKubikasi,
        0
      );

      const wac = totalKubikasi > 0 ? totalValue / totalKubikasi : 0;

      expect(wac).toBeCloseTo(4906666.67, 0); // 73600000 / 15.0
    });

    it("should group inventory by supplier", async () => {
      const logs = await prisma.logInventory.findMany({
        where: {
          woodTypeId: testWoodTypeId,
          status: { in: ["Available", "Partial"] },
        },
        include: { supplier: true },
      });

      const supplierBreakdown = logs.reduce((acc, log) => {
        const supplierId = log.supplierId;
        if (!acc[supplierId]) {
          acc[supplierId] = {
            supplierId,
            supplierCode: log.supplier.supplierCode,
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

      const suppliers = Object.values(supplierBreakdown);
      expect(suppliers.length).toBeGreaterThan(0);
      expect(suppliers[0].kubikasi).toBe(15.0);
      expect(suppliers[0].logCount).toBe(2);
    });

    it("should calculate purchase summary for date range", async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPurchases = await prisma.logInventory.findMany({
        where: {
          woodTypeId: testWoodTypeId,
          purchaseDate: {
            gte: thirtyDaysAgo,
            lte: today,
          },
        },
      });

      const purchaseKubikasi = recentPurchases.reduce(
        (sum, log) => sum + log.kubikasiFinal,
        0
      );

      expect(recentPurchases.length).toBe(2);
      expect(purchaseKubikasi).toBe(18.0); // 10.0 + 8.0
    });
  });

  describe("Daily Production Report", () => {
    let testBatchId: string;
    let testProductId: number;

    beforeAll(async () => {
      // Create test production data
      const product = await prisma.product.create({
        data: {
          productCode: "RPT-PROD",
          productName: "Report Test Product",
          isActive: true,
        },
      });
      testProductId = product.id;

      const today = new Date();
      const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
      testBatchId = `B-${dateStr}-999`;

      await prisma.productionBatch.create({
        data: {
          id: testBatchId,
          productionDate: today,
          shift: 1,
          status: "Completed",
          createdById: 1,
        },
      });

      await prisma.batchLineItem.create({
        data: {
          batchId: testBatchId,
          lineNumber: 1,
          woodTypeId: testWoodTypeId,
          productId: testProductId,
          targetKubikasi: 5.0,
          actualOutputKubikasi: 4.5,
          totalInputKubikasi: 5.5,
          totalWasteKubikasi: 1.0,
          wacPerKubik: 4000000,
          materialCostDirect: 18000000,
          materialCostWaste: 4000000,
          materialCostTotal: 22000000,
          materialCostPerKubik: 4888888.89,
        },
      });
    });

    afterAll(async () => {
      // Cleanup
      if (testBatchId) {
        await prisma.batchLineItem.deleteMany({
          where: { batchId: testBatchId },
        });
        await prisma.productionBatch.delete({
          where: { id: testBatchId },
        });
      }
      if (testProductId) {
        await prisma.product.delete({ where: { id: testProductId } });
      }
    });

    it("should calculate waste rate from line item", async () => {
      const lineItem = await prisma.batchLineItem.findFirst({
        where: { batchId: testBatchId },
      });

      expect(lineItem).toBeDefined();

      const wasteRate =
        lineItem && lineItem.totalInputKubikasi && lineItem.totalWasteKubikasi
          ? lineItem.totalWasteKubikasi / lineItem.totalInputKubikasi
          : 0;

      expect(wasteRate).toBeCloseTo(0.1818, 2); // 1.0 / 5.5
    });

    it("should calculate production efficiency", async () => {
      const lineItem = await prisma.batchLineItem.findFirst({
        where: { batchId: testBatchId },
      });

      expect(lineItem).toBeDefined();

      const efficiency =
        lineItem && lineItem.targetKubikasi && lineItem.actualOutputKubikasi
          ? (lineItem.actualOutputKubikasi / lineItem.targetKubikasi) * 100
          : 0;

      expect(efficiency).toBe(90); // (4.5 / 5.0) * 100
    });

    it("should fetch production batches for date range", async () => {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const batches = await prisma.productionBatch.findMany({
        where: {
          productionDate: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          batchLineItems: {
            include: {
              woodType: true,
              product: true,
            },
          },
        },
      });

      expect(batches.length).toBeGreaterThan(0);
      const testBatch = batches.find((b) => b.id === testBatchId);
      expect(testBatch).toBeDefined();
      expect(testBatch?.batchLineItems.length).toBe(1);
    });

    it("should calculate material cost per kubikasi", async () => {
      const lineItem = await prisma.batchLineItem.findFirst({
        where: { batchId: testBatchId },
      });

      expect(lineItem).toBeDefined();

      const costPerKubik =
        lineItem && lineItem.actualOutputKubikasi && lineItem.materialCostTotal
          ? lineItem.materialCostTotal / lineItem.actualOutputKubikasi
          : 0;

      expect(costPerKubik).toBeCloseTo(4888888.89, 0); // 22000000 / 4.5
    });
  });

  describe("Report Date Filtering", () => {
    it("should filter logs by date range", async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const recentLogs = await prisma.logInventory.count({
        where: {
          woodTypeId: testWoodTypeId,
          purchaseDate: {
            gte: thirtyDaysAgo,
            lte: today,
          },
        },
      });

      const allLogs = await prisma.logInventory.count({
        where: { woodTypeId: testWoodTypeId },
      });

      expect(recentLogs).toBeLessThanOrEqual(allLogs);
      expect(recentLogs).toBeGreaterThan(0);
    });
  });
});
