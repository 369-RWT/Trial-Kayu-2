/**
 * Database Load Testing Suite
 *
 * Tests database performance with:
 * - Bulk inserts
 * - Concurrent transactions
 * - Complex queries (WAC calculations)
 * - Index performance
 * - Transaction isolation
 */

import { PrismaClient } from '@prisma/client';
import {
  generateLogPurchaseBatch,
  calculateExpectedKubikasi,
  type LogPurchaseData,
} from './data-generator';

const prisma = new PrismaClient();

interface DatabaseMetrics {
  operation: string;
  totalRecords: number;
  duration: number;
  recordsPerSecond: number;
  avgTimePerRecord: number;
  errors: number;
}

/**
 * Test bulk insert performance
 */
export async function testBulkInsert(recordCount: number): Promise<DatabaseMetrics> {
  console.log(`\n📝 Testing Bulk Insert (${recordCount} records)...`);

  const purchases = generateLogPurchaseBatch(recordCount);
  const startTime = Date.now();
  let errors = 0;

  try {
    // Insert records one by one (simulating API behavior)
    for (const purchase of purchases) {
      try {
        const kubikasi = calculateExpectedKubikasi(purchase);
        const totalCost = kubikasi * purchase.hargaPerKubik;

        await prisma.logInventory.create({
          data: {
            logTag: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            woodTypeId: purchase.woodTypeId,
            supplierId: purchase.supplierId,
            purchaseDate: new Date(purchase.purchaseDate),
            lingkarCm: purchase.lingkarCm,
            panjangM: purchase.panjangM,
            jumlahLog: purchase.jumlahLog,
            kubikasiTotal: kubikasi,
            kubikasiFinal: kubikasi,
            hargaPerKubik: purchase.hargaPerKubik,
            totalCost,
            status: 'Available',
            remainingKubikasi: kubikasi,
          },
        });
      } catch (error) {
        errors++;
      }
    }
  } catch (error) {
    console.error('Bulk insert error:', error);
  }

  const duration = Date.now() - startTime;
  const successfulRecords = recordCount - errors;

  return {
    operation: 'Bulk Insert',
    totalRecords: successfulRecords,
    duration,
    recordsPerSecond: (successfulRecords / duration) * 1000,
    avgTimePerRecord: duration / successfulRecords,
    errors,
  };
}

/**
 * Test concurrent transactions
 */
export async function testConcurrentTransactions(
  batchCount: number
): Promise<DatabaseMetrics> {
  console.log(`\n⚡ Testing Concurrent Transactions (${batchCount} batches)...`);

  const startTime = Date.now();
  let totalRecords = 0;
  let errors = 0;

  try {
    const batches = Array.from({ length: batchCount }, () =>
      generateLogPurchaseBatch(5)
    );

    const promises = batches.map(async batch => {
      for (const purchase of batch) {
        try {
          await prisma.$transaction(async tx => {
            const kubikasi = calculateExpectedKubikasi(purchase);
            const totalCost = kubikasi * purchase.hargaPerKubik;

            await tx.logInventory.create({
              data: {
                logTag: `CONCURRENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                woodTypeId: purchase.woodTypeId,
                supplierId: purchase.supplierId,
                purchaseDate: new Date(purchase.purchaseDate),
                lingkarCm: purchase.lingkarCm,
                panjangM: purchase.panjangM,
                jumlahLog: purchase.jumlahLog,
                kubikasiTotal: kubikasi,
                kubikasiFinal: kubikasi,
                hargaPerKubik: purchase.hargaPerKubik,
                totalCost,
                status: 'Available',
                remainingKubikasi: kubikasi,
              },
            });
            totalRecords++;
          });
        } catch (error) {
          errors++;
        }
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Concurrent transaction error:', error);
  }

  const duration = Date.now() - startTime;

  return {
    operation: 'Concurrent Transactions',
    totalRecords,
    duration,
    recordsPerSecond: (totalRecords / duration) * 1000,
    avgTimePerRecord: duration / totalRecords,
    errors,
  };
}

/**
 * Test complex query performance (WAC calculations)
 */
export async function testComplexQueries(): Promise<DatabaseMetrics> {
  console.log('\n🔍 Testing Complex Queries (WAC calculations)...');

  const startTime = Date.now();
  let queryCount = 0;
  let errors = 0;

  try {
    // Query 1: Get all inventory with WAC
    const inventory = await prisma.logInventory.findMany({
      where: { status: 'Available' },
      include: {
        woodType: true,
        supplier: true,
      },
    });
    queryCount++;

    // Query 2: Calculate WAC per wood type
    const woodTypes = [1, 2, 3, 4, 5];
    for (const woodTypeId of woodTypes) {
      const logs = await prisma.logInventory.findMany({
        where: {
          woodTypeId,
          status: 'Available',
        },
      });

      const totalKubikasi = logs.reduce((sum, log) => sum + log.kubikasiFinal, 0);
      const totalValue = logs.reduce((sum, log) => sum + log.totalCost, 0);
      const wac = totalKubikasi > 0 ? totalValue / totalKubikasi : 0;

      queryCount++;
    }

    // Query 3: Get inventory valuation
    const valuations = await prisma.inventoryValuation.findMany({
      include: {
        woodType: true,
      },
      orderBy: {
        valuationDate: 'desc',
      },
      take: 10,
    });
    queryCount++;

    // Query 4: Aggregate queries
    const aggregates = await prisma.logInventory.groupBy({
      by: ['woodTypeId', 'status'],
      _sum: {
        kubikasiFinal: true,
        totalCost: true,
      },
      _count: {
        id: true,
      },
    });
    queryCount++;
  } catch (error) {
    console.error('Complex query error:', error);
    errors++;
  }

  const duration = Date.now() - startTime;

  return {
    operation: 'Complex Queries',
    totalRecords: queryCount,
    duration,
    recordsPerSecond: (queryCount / duration) * 1000,
    avgTimePerRecord: duration / queryCount,
    errors,
  };
}

/**
 * Test index performance
 */
export async function testIndexPerformance(): Promise<DatabaseMetrics> {
  console.log('\n📊 Testing Index Performance...');

  const startTime = Date.now();
  let queryCount = 0;
  let errors = 0;

  try {
    // Test indexed column queries
    await prisma.logInventory.findMany({
      where: { woodTypeId: 1, status: 'Available' },
    });
    queryCount++;

    await prisma.logInventory.findMany({
      where: {
        purchaseDate: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });
    queryCount++;

    await prisma.logInventory.findUnique({
      where: { logTag: 'JT-SUP01-20241102-001' },
    });
    queryCount++;

    // Test composite index
    await prisma.inventoryValuation.findUnique({
      where: {
        woodTypeId_valuationDate: {
          woodTypeId: 1,
          valuationDate: new Date(),
        },
      },
    });
    queryCount++;
  } catch (error) {
    errors++;
  }

  const duration = Date.now() - startTime;

  return {
    operation: 'Index Performance',
    totalRecords: queryCount,
    duration,
    recordsPerSecond: (queryCount / duration) * 1000,
    avgTimePerRecord: duration / queryCount,
    errors,
  };
}

/**
 * Clean up test data
 */
export async function cleanupTestData(): Promise<void> {
  console.log('\n🧹 Cleaning up test data...');

  try {
    // Delete test records
    await prisma.logInventory.deleteMany({
      where: {
        OR: [
          { logTag: { startsWith: 'TEST-' } },
          { logTag: { startsWith: 'CONCURRENT-' } },
        ],
      },
    });

    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('Error cleaning up:', error);
  }
}

/**
 * Print database metrics
 */
export function printDatabaseMetrics(metrics: DatabaseMetrics) {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log(`║  ${metrics.operation.padEnd(60)}  ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Records: ${metrics.totalRecords.toString().padEnd(47)}║`);
  console.log(`║  Duration: ${metrics.duration.toFixed(0).padEnd(52)}ms ║`);
  console.log(`║  Records/Second: ${metrics.recordsPerSecond.toFixed(2).padEnd(44)}║`);
  console.log(`║  Avg Time/Record: ${metrics.avgTimePerRecord.toFixed(2).padEnd(42)}ms ║`);
  console.log(`║  Errors: ${metrics.errors.toString().padEnd(54)}║`);
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

/**
 * Run complete database test suite
 */
export async function runDatabaseTestSuite() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         AL FATH KAYU - DATABASE PERFORMANCE TEST SUITE         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  try {
    const results = {
      bulkInsert: await testBulkInsert(20),
      concurrent: await testConcurrentTransactions(10),
      complexQueries: await testComplexQueries(),
      indexPerformance: await testIndexPerformance(),
    };

    printDatabaseMetrics(results.bulkInsert);
    printDatabaseMetrics(results.concurrent);
    printDatabaseMetrics(results.complexQueries);
    printDatabaseMetrics(results.indexPerformance);

    // Overall summary
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                   DATABASE PERFORMANCE SUMMARY                 ║');
    console.log('╠════════════════════════════════════════════════════════════════╣');

    const totalRecords =
      results.bulkInsert.totalRecords + results.concurrent.totalRecords;
    const totalDuration =
      results.bulkInsert.duration +
      results.concurrent.duration +
      results.complexQueries.duration +
      results.indexPerformance.duration;

    console.log(`║  Total Records Processed: ${totalRecords.toString().padEnd(37)}║`);
    console.log(`║  Total Test Duration: ${totalDuration.toFixed(0).padEnd(41)}ms ║`);
    console.log(`║  Average Insert Rate: ${results.bulkInsert.recordsPerSecond.toFixed(2).padEnd(37)} rec/s ║`);
    console.log(`║  Concurrent Performance: ${results.concurrent.recordsPerSecond.toFixed(2).padEnd(34)} rec/s ║`);
    console.log(`║  Query Performance: ${results.complexQueries.avgTimePerRecord.toFixed(2).padEnd(40)}ms/query ║`);

    const grade =
      results.bulkInsert.recordsPerSecond > 50 &&
      results.complexQueries.avgTimePerRecord < 100
        ? 'EXCELLENT'
        : results.bulkInsert.recordsPerSecond > 20
        ? 'GOOD'
        : 'NEEDS OPTIMIZATION';

    console.log('╠════════════════════════════════════════════════════════════════╣');
    console.log(`║  Database Performance Grade: ${grade.padEnd(34)}║`);
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    // Cleanup
    await cleanupTestData();

    return results;
  } catch (error) {
    console.error('Database test suite error:', error);
    await cleanupTestData();
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}
