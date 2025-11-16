/**
 * Load Test Suite for Al Fath Kayu Costing System
 * Simulates realistic production workload with concurrent operations
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LoadTestResult {
  scenario: string;
  totalOperations: number;
  successCount: number;
  failureCount: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  throughput: number; // operations per second
}

const results: LoadTestResult[] = [];

// Helper function to generate realistic log data
function generateLogData(woodTypeId: number, supplierId: number, index: number) {
  const lingkar = 80 + Math.random() * 120; // 80-200 cm
  const panjang = 3 + Math.random() * 9; // 3-12 m
  const jumlah = Math.floor(1 + Math.random() * 10); // 1-10 logs
  const harga = 2000000 + Math.random() * 3000000; // Rp 2M - 5M per m³

  const diameter = lingkar / 4;
  const kubikasiTotal = ((diameter * diameter * panjang * 785) / 10000) * jumlah;
  const kubikasiFinal = Math.floor(kubikasiTotal);

  return {
    woodTypeId,
    supplierId,
    lingkarCm: lingkar,
    panjangM: panjang,
    jumlahLog: jumlah,
    hargaPerKubik: harga,
    kubikasiTotal,
    kubikasiFinal,
    totalCost: kubikasiFinal * harga,
  };
}

// Scenario 1: Concurrent Log Purchases
async function testConcurrentLogPurchases() {
  console.log("\n📦 Running: Concurrent Log Purchases Test...");

  const woodTypes = await prisma.woodType.findMany();
  const suppliers = await prisma.supplier.findMany();

  const operations = 100; // Create 100 logs concurrently
  const durations: number[] = [];
  let successCount = 0;
  let failureCount = 0;

  const startTime = Date.now();

  const promises = Array.from({ length: operations }, async (_, i) => {
    const opStart = Date.now();
    try {
      const woodType = woodTypes[i % woodTypes.length];
      const supplier = suppliers[i % suppliers.length];
      const logData = generateLogData(woodType.id, supplier.id, i);

      const purchaseDate = new Date();
      purchaseDate.setDate(purchaseDate.getDate() - Math.floor(Math.random() * 30));

      await prisma.$transaction(async (tx) => {
        // Generate unique log tag
        const dateStr = purchaseDate.toISOString().split("T")[0].replace(/-/g, "");
        const logTag = `${woodType.woodCode}-${supplier.supplierCode}-${dateStr}-${String(i).padStart(3, "0")}-LT${i}`;

        await tx.logInventory.create({
          data: {
            logTag,
            woodTypeId: logData.woodTypeId,
            supplierId: logData.supplierId,
            purchaseDate,
            lingkarCm: logData.lingkarCm,
            panjangM: logData.panjangM,
            jumlahLog: logData.jumlahLog,
            kubikasiTotal: logData.kubikasiTotal,
            kubikasiFinal: logData.kubikasiFinal,
            hargaPerKubik: logData.hargaPerKubik,
            totalCost: logData.totalCost,
            status: "Available",
            remainingKubikasi: logData.kubikasiFinal,
          },
        });
      });

      const duration = Date.now() - opStart;
      durations.push(duration);
      successCount++;
    } catch (error) {
      failureCount++;
      console.error(`  ✗ Operation ${i} failed:`, error instanceof Error ? error.message : error);
    }
  });

  await Promise.all(promises);

  const totalDuration = Date.now() - startTime;
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  results.push({
    scenario: "Concurrent Log Purchases",
    totalOperations: operations,
    successCount,
    failureCount,
    avgDuration,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    throughput: (successCount / totalDuration) * 1000,
  });

  console.log(`  ✓ Completed: ${successCount}/${operations} successful`);
}

// Scenario 2: Bulk Inventory Valuation Queries
async function testBulkInventoryQueries() {
  console.log("\n📊 Running: Bulk Inventory Valuation Queries...");

  const operations = 50;
  const durations: number[] = [];
  let successCount = 0;
  let failureCount = 0;

  const startTime = Date.now();

  const promises = Array.from({ length: operations }, async (_, i) => {
    const opStart = Date.now();
    try {
      const woodTypes = await prisma.woodType.findMany({
        where: { isActive: true },
      });

      for (const woodType of woodTypes) {
        await prisma.inventoryValuation.findFirst({
          where: { woodTypeId: woodType.id },
          orderBy: { valuationDate: "desc" },
        });

        await prisma.logInventory.aggregate({
          where: {
            woodTypeId: woodType.id,
            status: { in: ["Available", "Partial"] },
          },
          _sum: {
            remainingKubikasi: true,
            totalCost: true,
          },
        });
      }

      const duration = Date.now() - opStart;
      durations.push(duration);
      successCount++;
    } catch (error) {
      failureCount++;
    }
  });

  await Promise.all(promises);

  const totalDuration = Date.now() - startTime;
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  results.push({
    scenario: "Bulk Inventory Queries",
    totalOperations: operations,
    successCount,
    failureCount,
    avgDuration,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    throughput: (successCount / totalDuration) * 1000,
  });

  console.log(`  ✓ Completed: ${successCount}/${operations} successful`);
}

// Scenario 3: Complex Report Generation
async function testComplexReportGeneration() {
  console.log("\n📈 Running: Complex Report Generation...");

  const operations = 20;
  const durations: number[] = [];
  let successCount = 0;
  let failureCount = 0;

  const startTime = Date.now();

  const promises = Array.from({ length: operations }, async (_, i) => {
    const opStart = Date.now();
    try {
      // Simulate complex report query
      const woodTypes = await prisma.woodType.findMany({
        where: { isActive: true },
        include: {
          logs: {
            where: { status: { in: ["Available", "Partial"] } },
            include: { supplier: true },
          },
          inventoryValuations: {
            orderBy: { valuationDate: "desc" },
            take: 1,
          },
        },
      });

      // Calculate summary statistics
      for (const woodType of woodTypes) {
        const totalKubikasi = woodType.logs.reduce(
          (sum, log) => sum + log.remainingKubikasi,
          0
        );
        const totalValue = woodType.logs.reduce(
          (sum, log) => sum + (log.remainingKubikasi * log.hargaPerKubik),
          0
        );
        const avgAge = woodType.logs.length > 0
          ? woodType.logs.reduce((sum, log) => {
              const age = (Date.now() - log.purchaseDate.getTime()) / (1000 * 60 * 60 * 24);
              return sum + age;
            }, 0) / woodType.logs.length
          : 0;
      }

      const duration = Date.now() - opStart;
      durations.push(duration);
      successCount++;
    } catch (error) {
      failureCount++;
    }
  });

  await Promise.all(promises);

  const totalDuration = Date.now() - startTime;
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

  results.push({
    scenario: "Complex Report Generation",
    totalOperations: operations,
    successCount,
    failureCount,
    avgDuration,
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    throughput: (successCount / totalDuration) * 1000,
  });

  console.log(`  ✓ Completed: ${successCount}/${operations} successful`);
}

// Main execution
async function runLoadTests() {
  console.log("=".repeat(80));
  console.log("LOAD TEST SUITE - Al Fath Kayu Costing System");
  console.log("=".repeat(80));

  const testStart = Date.now();

  await testConcurrentLogPurchases();
  await testBulkInventoryQueries();
  await testComplexReportGeneration();

  const totalTestDuration = Date.now() - testStart;

  // Print Summary
  console.log("\n" + "=".repeat(80));
  console.log("LOAD TEST RESULTS SUMMARY");
  console.log("=".repeat(80) + "\n");

  results.forEach((result) => {
    console.log(`Scenario: ${result.scenario}`);
    console.log(`  Operations: ${result.totalOperations}`);
    console.log(`  Success: ${result.successCount} | Failures: ${result.failureCount}`);
    console.log(`  Avg Duration: ${result.avgDuration.toFixed(2)}ms`);
    console.log(`  Min/Max: ${result.minDuration}ms / ${result.maxDuration}ms`);
    console.log(`  Throughput: ${result.throughput.toFixed(2)} ops/sec`);
    console.log("");
  });

  const totalOps = results.reduce((sum, r) => sum + r.totalOperations, 0);
  const totalSuccess = results.reduce((sum, r) => sum + r.successCount, 0);
  const totalFailures = results.reduce((sum, r) => sum + r.failureCount, 0);

  console.log("=".repeat(80));
  console.log(`Total Operations: ${totalOps}`);
  console.log(`Total Success: ${totalSuccess} (${((totalSuccess / totalOps) * 100).toFixed(1)}%)`);
  console.log(`Total Failures: ${totalFailures} (${((totalFailures / totalOps) * 100).toFixed(1)}%)`);
  console.log(`Total Duration: ${(totalTestDuration / 1000).toFixed(2)}s`);
  console.log("=".repeat(80) + "\n");

  await prisma.$disconnect();

  process.exit(totalFailures > 0 ? 1 : 0);
}

runLoadTests().catch((error) => {
  console.error("Fatal error running load tests:", error);
  process.exit(1);
});
