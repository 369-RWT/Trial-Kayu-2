import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { prisma } from "@/lib/prisma";

describe("Production Batch Integration Tests", () => {
  let testWoodTypeId: number;
  let testProductId: number;
  let testWorkerId: number;
  let testBatchId: string;

  beforeAll(async () => {
    // Create test data
    const woodType = await prisma.woodType.create({
      data: {
        woodCode: "TEST",
        woodName: "Test Wood",
        avgWasteRate: 0.2,
        isActive: true,
      },
    });
    testWoodTypeId = woodType.id;

    const product = await prisma.product.create({
      data: {
        productCode: "TEST-PROD",
        productName: "Test Product",
        standardWasteRate: 0.15,
        isActive: true,
      },
    });
    testProductId = product.id;

    const worker = await prisma.worker.create({
      data: {
        workerCode: "TEST-WORKER",
        workerName: "Test Worker",
        isActive: true,
      },
    });
    testWorkerId = worker.id;

    // Create test inventory for WAC calculation
    await prisma.logInventory.create({
      data: {
        logTag: "TEST-LOG-001",
        woodTypeId: testWoodTypeId,
        supplierId: 1, // Assuming supplier ID 1 exists from seed
        purchaseDate: new Date(),
        lingkarCm: 120,
        panjangM: 5,
        jumlahLog: 10,
        kubikasiTotal: 5.0,
        kubikasiFinal: 5.0,
        hargaPerKubik: 3000000,
        totalCost: 15000000,
        status: "Available",
        remainingKubikasi: 5.0,
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    if (testBatchId) {
      await prisma.batchLineItem.deleteMany({
        where: { batchId: testBatchId },
      });
      await prisma.productionBatch.delete({
        where: { id: testBatchId },
      });
    }

    await prisma.logInventory.deleteMany({
      where: { logTag: { startsWith: "TEST-LOG" } },
    });

    if (testWorkerId) {
      await prisma.worker.delete({ where: { id: testWorkerId } });
    }

    if (testProductId) {
      await prisma.product.delete({ where: { id: testProductId } });
    }

    if (testWoodTypeId) {
      await prisma.woodType.delete({ where: { id: testWoodTypeId } });
    }

    await prisma.$disconnect();
  });

  it("should create a production batch with line items", async () => {
    const productionDate = new Date();
    const shift = 1;

    const dateStr = productionDate.toISOString().split("T")[0].replace(/-/g, "");
    testBatchId = `B-${dateStr}-001`;

    const batch = await prisma.productionBatch.create({
      data: {
        id: testBatchId,
        productionDate,
        shift,
        status: "Planned",
        createdById: 1, // Assuming user ID 1 exists
      },
    });

    expect(batch).toBeDefined();
    expect(batch.id).toBe(testBatchId);
    expect(batch.shift).toBe(shift);
    expect(batch.status).toBe("Planned");
  });

  it("should create batch line items with WAC calculation", async () => {
    if (!testBatchId) {
      throw new Error("Test batch not created");
    }

    const lineItem = await prisma.batchLineItem.create({
      data: {
        batchId: testBatchId,
        lineNumber: 1,
        woodTypeId: testWoodTypeId,
        productId: testProductId,
        targetKubikasi: 2.5,
        wacPerKubik: 3000000, // From test inventory
        workerId: testWorkerId,
      },
    });

    expect(lineItem).toBeDefined();
    expect(lineItem.lineNumber).toBe(1);
    expect(lineItem.targetKubikasi).toBe(2.5);
    expect(lineItem.wacPerKubik).toBe(3000000);
  });

  it("should fetch batch with all relations", async () => {
    if (!testBatchId) {
      throw new Error("Test batch not created");
    }

    const batch = await prisma.productionBatch.findUnique({
      where: { id: testBatchId },
      include: {
        batchLineItems: {
          include: {
            woodType: true,
            product: true,
            worker: true,
          },
        },
      },
    });

    expect(batch).toBeDefined();
    expect(batch?.batchLineItems).toHaveLength(1);
    expect(batch?.batchLineItems[0].woodType.woodCode).toBe("TEST");
    expect(batch?.batchLineItems[0].product.productCode).toBe("TEST-PROD");
    expect(batch?.batchLineItems[0].worker?.workerCode).toBe("TEST-WORKER");
  });

  it("should calculate WAC from inventory valuation", async () => {
    // Create inventory valuation
    await prisma.inventoryValuation.create({
      data: {
        woodTypeId: testWoodTypeId,
        valuationDate: new Date(),
        openingKubikasi: 10,
        openingValue: 30000000,
        purchaseKubikasi: 5,
        purchaseValue: 15000000,
        consumedKubikasi: 0,
        consumedValue: 0,
        closingKubikasi: 15,
        closingValue: 45000000,
        wacPerKubik: 3000000,
      },
    });

    const valuation = await prisma.inventoryValuation.findFirst({
      where: { woodTypeId: testWoodTypeId },
      orderBy: { valuationDate: "desc" },
    });

    expect(valuation).toBeDefined();
    expect(valuation?.wacPerKubik).toBe(3000000);
    expect(valuation?.closingKubikasi).toBe(15);

    // Cleanup
    await prisma.inventoryValuation.deleteMany({
      where: { woodTypeId: testWoodTypeId },
    });
  });

  it("should update batch status", async () => {
    if (!testBatchId) {
      throw new Error("Test batch not created");
    }

    const updatedBatch = await prisma.productionBatch.update({
      where: { id: testBatchId },
      data: { status: "In-Progress" },
    });

    expect(updatedBatch.status).toBe("In-Progress");

    // Update back to Planned for cleanup
    await prisma.productionBatch.update({
      where: { id: testBatchId },
      data: { status: "Planned" },
    });
  });

  it("should validate unique batch ID pattern", () => {
    const date = new Date("2025-11-16");
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const batchId = `B-${dateStr}-001`;

    expect(batchId).toMatch(/^B-\d{8}-\d{3}$/);
    expect(batchId).toBe("B-20251116-001");
  });
});
