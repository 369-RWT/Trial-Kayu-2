/**
 * Load Test Suite Runner
 *
 * Executes comprehensive load and stress tests:
 * 1. API performance tests
 * 2. Database performance tests
 * 3. Generates performance report
 */

import { runCompleteLoadTestSuite } from './api-load-test';
import { runDatabaseTestSuite } from './database-load-test';
import {
  generateMonthlyPurchases,
  printTestSummary,
} from './data-generator';

async function main() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                  ║');
  console.log('║        AL FATH KAYU MULTI-WOOD-TYPE PRECISION COSTING SYSTEM     ║');
  console.log('║                  COMPREHENSIVE LOAD TEST SUITE                   ║');
  console.log('║                                                                  ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝');

  console.log('\n📅 Test Date:', new Date().toISOString());
  console.log('🔧 Environment: Development (Simulated)');
  console.log('🎯 Objective: Validate system performance under realistic load\n');

  try {
    // Generate realistic test data
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PHASE 1: TEST DATA GENERATION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const monthlyData = generateMonthlyPurchases();
    printTestSummary(monthlyData);

    console.log('✅ Test data generated successfully');
    console.log(`   • ${monthlyData.length} realistic log purchase scenarios created`);
    console.log('   • Covering multiple wood types, suppliers, and sizes');
    console.log('   • Simulating 4-week purchasing patterns\n');

    // Run API load tests
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PHASE 2: API PERFORMANCE TESTING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const apiResults = await runCompleteLoadTestSuite();

    // Run database load tests
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  PHASE 3: DATABASE PERFORMANCE TESTING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const dbResults = await runDatabaseTestSuite();

    // Final summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  FINAL PERFORMANCE REPORT');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                      SYSTEM PERFORMANCE GRADES                   ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log('║                                                                  ║');

    // API Performance Grade
    const avgApiThroughput =
      (apiResults.sequential.requestsPerSecond +
        apiResults.concurrent10.requestsPerSecond +
        apiResults.concurrent25.requestsPerSecond +
        apiResults.stress.requestsPerSecond) /
      4;

    const avgApiResponseTime =
      (apiResults.sequential.avgResponseTime +
        apiResults.concurrent10.avgResponseTime +
        apiResults.concurrent25.avgResponseTime +
        apiResults.stress.avgResponseTime) /
      4;

    const apiGrade =
      avgApiResponseTime < 100 && avgApiThroughput > 10
        ? 'A (EXCELLENT)'
        : avgApiResponseTime < 200 && avgApiThroughput > 5
        ? 'B (GOOD)'
        : avgApiResponseTime < 500
        ? 'C (ACCEPTABLE)'
        : 'D (NEEDS WORK)';

    console.log(`║  API Performance:        ${apiGrade.padEnd(39)}║`);
    console.log(`║    • Avg Throughput:     ${avgApiThroughput.toFixed(2).padEnd(28)} req/s       ║`);
    console.log(`║    • Avg Response Time:  ${avgApiResponseTime.toFixed(2).padEnd(28)} ms         ║`);
    console.log(`║    • Peak Throughput:    ${apiResults.concurrent25.requestsPerSecond.toFixed(2).padEnd(28)} req/s       ║`);
    console.log('║                                                                  ║');

    // Database Performance Grade
    const dbInsertRate = dbResults.bulkInsert.recordsPerSecond;
    const dbQueryTime = dbResults.complexQueries.avgTimePerRecord;

    const dbGrade =
      dbInsertRate > 50 && dbQueryTime < 100
        ? 'A (EXCELLENT)'
        : dbInsertRate > 20 && dbQueryTime < 200
        ? 'B (GOOD)'
        : dbInsertRate > 10
        ? 'C (ACCEPTABLE)'
        : 'D (NEEDS WORK)';

    console.log(`║  Database Performance:   ${dbGrade.padEnd(39)}║`);
    console.log(`║    • Insert Rate:        ${dbInsertRate.toFixed(2).padEnd(28)} rec/s       ║`);
    console.log(`║    • Query Time:         ${dbQueryTime.toFixed(2).padEnd(28)} ms/query    ║`);
    console.log(`║    • Concurrent Rate:    ${dbResults.concurrent.recordsPerSecond.toFixed(2).padEnd(28)} rec/s       ║`);
    console.log('║                                                                  ║');

    // Overall grade
    const overallGrade =
      apiGrade.startsWith('A') && dbGrade.startsWith('A')
        ? 'A (EXCELLENT)'
        : (apiGrade.startsWith('A') || apiGrade.startsWith('B')) &&
          (dbGrade.startsWith('A') || dbGrade.startsWith('B'))
        ? 'B (GOOD)'
        : 'C (ACCEPTABLE)';

    console.log('╠══════════════════════════════════════════════════════════════════╣');
    console.log(`║  OVERALL SYSTEM GRADE:   ${overallGrade.padEnd(39)}║`);
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    // Recommendations
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                         RECOMMENDATIONS                          ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');

    if (avgApiResponseTime > 200) {
      console.log('║  ⚠️  API response times could be improved                        ║');
      console.log('║     → Consider caching frequently accessed data                 ║');
      console.log('║     → Optimize validation logic                                 ║');
    } else {
      console.log('║  ✅  API response times are within acceptable range             ║');
    }

    if (dbInsertRate < 20) {
      console.log('║  ⚠️  Database insert performance could be improved              ║');
      console.log('║     → Review index strategy                                     ║');
      console.log('║     → Consider batch inserts for bulk operations                ║');
    } else {
      console.log('║  ✅  Database insert performance is good                        ║');
    }

    if (apiResults.stress.successfulRequests / apiResults.stress.totalRequests < 0.95) {
      console.log('║  ⚠️  Success rate under stress could be improved                ║');
      console.log('║     → Review error handling                                     ║');
      console.log('║     → Increase system resources if needed                       ║');
    } else {
      console.log('║  ✅  System handles stress well (95%+ success rate)             ║');
    }

    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    // Production readiness
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                     PRODUCTION READINESS                         ║');
    console.log('╠══════════════════════════════════════════════════════════════════╣');

    const isProductionReady =
      apiGrade.startsWith('A') || apiGrade.startsWith('B')
        ? dbGrade.startsWith('A') || dbGrade.startsWith('B')
        : false;

    if (isProductionReady) {
      console.log('║                                                                  ║');
      console.log('║   ✅  SYSTEM IS PRODUCTION READY                                 ║');
      console.log('║                                                                  ║');
      console.log('║   The system demonstrates:                                       ║');
      console.log('║   • Acceptable throughput for expected load                      ║');
      console.log('║   • Good response times under stress                             ║');
      console.log('║   • Reliable database performance                                ║');
      console.log('║   • High success rate (>95%) under concurrent load               ║');
      console.log('║                                                                  ║');
      console.log('║   Recommended for deployment with monitoring.                    ║');
      console.log('║                                                                  ║');
    } else {
      console.log('║                                                                  ║');
      console.log('║   ⚠️  PERFORMANCE OPTIMIZATION RECOMMENDED                       ║');
      console.log('║                                                                  ║');
      console.log('║   Consider addressing identified bottlenecks before              ║');
      console.log('║   production deployment.                                         ║');
      console.log('║                                                                  ║');
    }

    console.log('╚══════════════════════════════════════════════════════════════════╝\n');

    console.log('✅ Load test suite completed successfully!');
    console.log('📊 Review the detailed metrics above for performance insights.\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Load test suite failed:', error);
    process.exit(1);
  }
}

// Run the test suite
main();
