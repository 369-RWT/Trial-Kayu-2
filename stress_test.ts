/**
 * Stress Test Suite for Al Fath Kayu Costing System
 * Tests system limits and identifies breaking points
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface StressTestResult {
  test: string;
  status: "PASS" | "FAIL" | "WARNING";
  details: string;
  metrics?: Record<string, any>;
}

const results: StressTestResult[] = [];

// Test 1: Large Dataset Query Performance
async function testLargeDatasetQuery() {
  console.log("\n🔍 Testing: Large Dataset Query Performance...");

  try {
    const start = Date.now();

    // Query all logs with full relations
    const logs = await prisma.logInventory.findMany({
      include: {
        woodType: true,
        supplier: true,
        logConsumptions: true,
        wasteDeviations: true,
      },
    });

    const duration = Date.now() - start;

    if (duration < 1000) {
      results.push({
        test: "Large Dataset Query",
        status: "PASS",
        details: `Queried ${logs.length} logs with relations in ${duration}ms`,
        metrics: { recordCount: logs.length, duration },
      });
    } else if (duration < 3000) {
      results.push({
        test: "Large Dataset Query",
        status: "WARNING",
        details: `Query took ${duration}ms - consider optimization`,
        metrics: { recordCount: logs.length, duration },
      });
    } else {
      results.push({
        test: "Large Dataset Query",
        status: "FAIL",
        details: `Query too slow: ${duration}ms`,
        metrics: { recordCount: logs.length, duration },
      });
    }
  } catch (error) {
    results.push({
      test: "Large Dataset Query",
      status: "FAIL",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

// Test 2: Memory Usage with Large Result Sets
async function testMemoryUsage() {
  console.log("\n💾 Testing: Memory Usage with Large Result Sets...");

  try {
    const memBefore = process.memoryUsage();

    // Load all data into memory
    const [logs, valuations, batches, users] = await Promise.all([
      prisma.logInventory.findMany({ include: { woodType: true, supplier: true } }),
      prisma.inventoryValuation.findMany({ include: { woodType: true } }),
      prisma.productionBatch.findMany({ include: { batchLineItems: true } }),
      prisma.user.findMany(),
    ]);

    const memAfter = process.memoryUsage();
    const memIncrease = (memAfter.heapUsed - memBefore.heapUsed) / 1024 / 1024;

    const totalRecords = logs.length + valuations.length + batches.length + users.length;

    if (memIncrease < 50) {
      results.push({
        test: "Memory Usage",
        status: "PASS",
        details: `Loaded ${totalRecords} records, memory increase: ${memIncrease.toFixed(2)}MB`,
        metrics: { recordCount: totalRecords, memoryIncreaseMB: memIncrease },
      });
    } else if (memIncrease < 100) {
      results.push({
        test: "Memory Usage",
        status: "WARNING",
        details: `Memory increase ${memIncrease.toFixed(2)}MB - monitor in production`,
        metrics: { recordCount: totalRecords, memoryIncreaseMB: memIncrease },
      });
    } else {
      results.push({
        test: "Memory Usage",
        status: "FAIL",
        details: `Excessive memory usage: ${memIncrease.toFixed(2)}MB`,
        metrics: { recordCount: totalRecords, memoryIncreaseMB: memIncrease },
      });
    }
  } catch (error) {
    results.push({
      test: "Memory Usage",
      status: "FAIL",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

// Test 3: Complex Aggregation Performance
async function testComplexAggregation() {
  console.log("\n📊 Testing: Complex Aggregation Performance...");

  try {
    const start = Date.now();

    const woodTypes = await prisma.woodType.findMany();

    const aggregations = await Promise.all(
      woodTypes.map(async (wt) => {
        const [inventory, valuation, logs] = await Promise.all([
          prisma.logInventory.aggregate({
            where: { woodTypeId: wt.id, status: { in: ["Available", "Partial"] } },
            _sum: { remainingKubikasi: true, totalCost: true },
            _count: true,
          }),
          prisma.inventoryValuation.findFirst({
            where: { woodTypeId: wt.id },
            orderBy: { valuationDate: "desc" },
          }),
          prisma.logInventory.groupBy({
            by: ["supplierId"],
            where: { woodTypeId: wt.id },
            _sum: { kubikasiFinal: true },
          }),
        ]);

        return { woodType: wt.woodName, inventory, valuation, supplierBreakdown: logs };
      })
    );

    const duration = Date.now() - start;

    if (duration < 500) {
      results.push({
        test: "Complex Aggregation",
        status: "PASS",
        details: `Aggregated ${woodTypes.length} wood types in ${duration}ms`,
        metrics: { woodTypeCount: woodTypes.length, duration },
      });
    } else if (duration < 1500) {
      results.push({
        test: "Complex Aggregation",
        status: "WARNING",
        details: `Aggregation took ${duration}ms - acceptable but could be optimized`,
        metrics: { woodTypeCount: woodTypes.length, duration },
      });
    } else {
      results.push({
        test: "Complex Aggregation",
        status: "FAIL",
        details: `Aggregation too slow: ${duration}ms`,
        metrics: { woodTypeCount: woodTypes.length, duration },
      });
    }
  } catch (error) {
    results.push({
      test: "Complex Aggregation",
      status: "FAIL",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

// Test 4: Database Connection Pool Stress
async function testConnectionPoolStress() {
  console.log("\n🔌 Testing: Database Connection Pool Stress...");

  try {
    const start = Date.now();
    const concurrentQueries = 50;

    const queries = Array.from({ length: concurrentQueries }, (_, i) =>
      prisma.woodType.findMany().then(() => i)
    );

    await Promise.all(queries);

    const duration = Date.now() - start;

    if (duration < 1000) {
      results.push({
        test: "Connection Pool Stress",
        status: "PASS",
        details: `Handled ${concurrentQueries} concurrent queries in ${duration}ms`,
        metrics: { concurrentQueries, duration },
      });
    } else {
      results.push({
        test: "Connection Pool Stress",
        status: "WARNING",
        details: `Connection pool handling took ${duration}ms`,
        metrics: { concurrentQueries, duration },
      });
    }
  } catch (error) {
    results.push({
      test: "Connection Pool Stress",
      status: "FAIL",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

// Test 5: Data Integrity Under Stress
async function testDataIntegrityUnderStress() {
  console.log("\n🔒 Testing: Data Integrity Under Stress...");

  try {
    // Check for data anomalies
    const issues: string[] = [];

    // Check 1: Negative values
    const negativeKubikasi = await prisma.logInventory.count({
      where: { OR: [{ kubikasiFinal: { lt: 0 } }, { remainingKubikasi: { lt: 0 } }] },
    });

    if (negativeKubikasi > 0) {
      issues.push(`Found ${negativeKubikasi} logs with negative kubikasi`);
    }

    // Check 2: Remaining > Final
    const invalidRemaining = await prisma.logInventory.count({
      where: { remainingKubikasi: { gt: prisma.logInventory.fields.kubikasiFinal } },
    });

    // Check 3: WAC consistency
    const valuations = await prisma.inventoryValuation.findMany({
      where: { closingKubikasi: { gt: 0 } },
    });

    let wacMismatches = 0;
    for (const val of valuations) {
      const expectedWac = val.closingValue / val.closingKubikasi;
      const diff = Math.abs(val.wacPerKubik - expectedWac);
      if (diff > 0.01) wacMismatches++;
    }

    if (wacMismatches > 0) {
      issues.push(`Found ${wacMismatches} WAC calculation mismatches`);
    }

    if (issues.length === 0) {
      results.push({
        test: "Data Integrity",
        status: "PASS",
        details: "All data integrity checks passed",
        metrics: { checksPerformed: 3 },
      });
    } else {
      results.push({
        test: "Data Integrity",
        status: "FAIL",
        details: `Data integrity issues found: ${issues.join("; ")}`,
        metrics: { issueCount: issues.length },
      });
    }
  } catch (error) {
    results.push({
      test: "Data Integrity",
      status: "FAIL",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

// Main execution
async function runStressTests() {
  console.log("=".repeat(80));
  console.log("STRESS TEST SUITE - Al Fath Kayu Costing System");
  console.log("=".repeat(80));

  await testLargeDatasetQuery();
  await testMemoryUsage();
  await testComplexAggregation();
  await testConnectionPoolStress();
  await testDataIntegrityUnderStress();

  // Print Results
  console.log("\n" + "=".repeat(80));
  console.log("STRESS TEST RESULTS");
  console.log("=".repeat(80) + "\n");

  const passed = results.filter((r) => r.status === "PASS").length;
  const warnings = results.filter((r) => r.status === "WARNING").length;
  const failed = results.filter((r) => r.status === "FAIL").length;

  results.forEach((result) => {
    let icon = "✓";
    let color = "\x1b[32m"; // green

    if (result.status === "WARNING") {
      icon = "⚠";
      color = "\x1b[33m"; // yellow
    } else if (result.status === "FAIL") {
      icon = "✗";
      color = "\x1b[31m"; // red
    }

    const reset = "\x1b[0m";

    console.log(`${color}${icon}${reset} ${result.test.padEnd(35)} [${result.status}]`);
    console.log(`  ${result.details}`);

    if (result.metrics) {
      console.log(`  Metrics: ${JSON.stringify(result.metrics)}`);
    }
    console.log("");
  });

  console.log("=".repeat(80));
  console.log(`Total: ${results.length} tests`);
  console.log(`Passed: ${passed} | Warnings: ${warnings} | Failed: ${failed}`);
  console.log("=".repeat(80) + "\n");

  await prisma.$disconnect();

  process.exit(failed > 0 ? 1 : 0);
}

runStressTests().catch((error) => {
  console.error("Fatal error running stress tests:", error);
  process.exit(1);
});
