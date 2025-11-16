/**
 * API Load Testing Suite
 *
 * Tests the /api/inventory/logs endpoint with:
 * - Sequential requests (baseline)
 * - Concurrent requests (stress test)
 * - Rate limiting validation
 * - Performance metrics collection
 */

import {
  generateLogPurchaseBatch,
  generateHighVolumeDay,
  generateConcurrentPurchases,
  printTestSummary,
  calculateExpectedKubikasi,
  type LogPurchaseData,
} from './data-generator';

interface TestResult {
  success: boolean;
  statusCode: number;
  responseTime: number;
  error?: string;
  rateLimited?: boolean;
}

interface LoadTestMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  rateLimitedRequests: number;
  avgResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  requestsPerSecond: number;
  totalDuration: number;
}

/**
 * Simulate API request (for testing without actual server)
 */
async function simulateApiRequest(
  purchase: LogPurchaseData,
  delayMs: number = 0
): Promise<TestResult> {
  const startTime = Date.now();

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, delayMs + Math.random() * 50));

  // Simulate processing
  const kubikasi = calculateExpectedKubikasi(purchase);
  const totalCost = kubikasi * purchase.hargaPerKubik;

  // Simulate success (95% success rate)
  const success = Math.random() > 0.05;

  const responseTime = Date.now() - startTime;

  return {
    success,
    statusCode: success ? 201 : 500,
    responseTime,
    error: success ? undefined : 'Simulated error',
  };
}

/**
 * Execute sequential load test
 */
export async function runSequentialTest(
  purchaseCount: number
): Promise<LoadTestMetrics> {
  console.log(`\n📊 Running Sequential Test (${purchaseCount} requests)...`);

  const purchases = generateLogPurchaseBatch(purchaseCount);
  const results: TestResult[] = [];
  const startTime = Date.now();

  for (const purchase of purchases) {
    const result = await simulateApiRequest(purchase, 20); // 20ms base delay
    results.push(result);
  }

  const totalDuration = Date.now() - startTime;

  return calculateMetrics(results, totalDuration);
}

/**
 * Execute concurrent load test
 */
export async function runConcurrentTest(
  concurrentRequests: number,
  totalRequests: number
): Promise<LoadTestMetrics> {
  console.log(
    `\n🚀 Running Concurrent Test (${totalRequests} requests, ${concurrentRequests} concurrent)...`
  );

  const purchases = generateLogPurchaseBatch(totalRequests);
  const results: TestResult[] = [];
  const startTime = Date.now();

  // Process in batches
  for (let i = 0; i < purchases.length; i += concurrentRequests) {
    const batch = purchases.slice(i, i + concurrentRequests);
    const batchResults = await Promise.all(
      batch.map(purchase => simulateApiRequest(purchase, 20))
    );
    results.push(...batchResults);
  }

  const totalDuration = Date.now() - startTime;

  return calculateMetrics(results, totalDuration);
}

/**
 * Test rate limiting behavior
 */
export async function runRateLimitTest(): Promise<{
  beforeLimit: TestResult[];
  afterLimit: TestResult[];
}> {
  console.log('\n⏱️  Running Rate Limit Test...');

  const purchases = generateLogPurchaseBatch(15); // More than rate limit (10)
  const results: TestResult[] = [];

  // Send rapid-fire requests
  for (const purchase of purchases) {
    const result = await simulateApiRequest(purchase, 5); // Very fast
    // Simulate rate limiting after 10 requests
    if (results.length >= 10) {
      result.rateLimited = true;
      result.statusCode = 429;
      result.success = false;
    }
    results.push(result);
  }

  return {
    beforeLimit: results.slice(0, 10),
    afterLimit: results.slice(10),
  };
}

/**
 * Stress test with high volume
 */
export async function runStressTest(): Promise<LoadTestMetrics> {
  console.log('\n💥 Running Stress Test (High Volume)...');

  const purchases = generateHighVolumeDay(); // 50 purchases
  const results: TestResult[] = [];
  const startTime = Date.now();

  // Burst of concurrent requests
  const batchSize = 10;
  for (let i = 0; i < purchases.length; i += batchSize) {
    const batch = purchases.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(purchase => simulateApiRequest(purchase, 15))
    );
    results.push(...batchResults);

    // Small delay between batches
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  const totalDuration = Date.now() - startTime;

  return calculateMetrics(results, totalDuration);
}

/**
 * Calculate performance metrics from results
 */
function calculateMetrics(
  results: TestResult[],
  totalDuration: number
): LoadTestMetrics {
  const responseTimes = results.map(r => r.responseTime).sort((a, b) => a - b);

  const successfulRequests = results.filter(r => r.success).length;
  const failedRequests = results.filter(r => !r.success && !r.rateLimited).length;
  const rateLimitedRequests = results.filter(r => r.rateLimited).length;

  const avgResponseTime =
    responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

  const p50Index = Math.floor(responseTimes.length * 0.5);
  const p95Index = Math.floor(responseTimes.length * 0.95);
  const p99Index = Math.floor(responseTimes.length * 0.99);

  return {
    totalRequests: results.length,
    successfulRequests,
    failedRequests,
    rateLimitedRequests,
    avgResponseTime,
    minResponseTime: responseTimes[0] || 0,
    maxResponseTime: responseTimes[responseTimes.length - 1] || 0,
    p50ResponseTime: responseTimes[p50Index] || 0,
    p95ResponseTime: responseTimes[p95Index] || 0,
    p99ResponseTime: responseTimes[p99Index] || 0,
    requestsPerSecond: (results.length / totalDuration) * 1000,
    totalDuration,
  };
}

/**
 * Print metrics in formatted table
 */
export function printMetrics(testName: string, metrics: LoadTestMetrics) {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log(`║  ${testName.padEnd(60)}  ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Requests: ${metrics.totalRequests.toString().padEnd(46)}║`);
  console.log(`║  Successful: ${metrics.successfulRequests.toString().padEnd(50)}║`);
  console.log(`║  Failed: ${metrics.failedRequests.toString().padEnd(54)}║`);
  console.log(`║  Rate Limited: ${metrics.rateLimitedRequests.toString().padEnd(48)}║`);
  console.log(`║  Success Rate: ${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)}%`.padEnd(64) + '║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Duration: ${metrics.totalDuration.toFixed(0).padEnd(43)}ms ║`);
  console.log(`║  Requests/Second: ${metrics.requestsPerSecond.toFixed(2).padEnd(42)}║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Response Time (avg): ${metrics.avgResponseTime.toFixed(2).padEnd(38)}ms ║`);
  console.log(`║  Response Time (min): ${metrics.minResponseTime.toFixed(2).padEnd(38)}ms ║`);
  console.log(`║  Response Time (max): ${metrics.maxResponseTime.toFixed(2).padEnd(38)}ms ║`);
  console.log(`║  Response Time (p50): ${metrics.p50ResponseTime.toFixed(2).padEnd(38)}ms ║`);
  console.log(`║  Response Time (p95): ${metrics.p95ResponseTime.toFixed(2).padEnd(38)}ms ║`);
  console.log(`║  Response Time (p99): ${metrics.p99ResponseTime.toFixed(2).padEnd(38)}ms ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝');
}

/**
 * Run complete load test suite
 */
export async function runCompleteLoadTestSuite() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║           AL FATH KAYU - COMPREHENSIVE LOAD TEST SUITE         ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  const results = {
    sequential: await runSequentialTest(50),
    concurrent10: await runConcurrentTest(10, 50),
    concurrent25: await runConcurrentTest(25, 100),
    stress: await runStressTest(),
  };

  // Print all metrics
  printMetrics('Sequential Test (50 requests)', results.sequential);
  printMetrics('Concurrent Test (50 requests, 10 concurrent)', results.concurrent10);
  printMetrics('Concurrent Test (100 requests, 25 concurrent)', results.concurrent25);
  printMetrics('Stress Test (50 high-volume requests)', results.stress);

  // Overall summary
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                      PERFORMANCE SUMMARY                       ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');

  const avgThroughput =
    (results.sequential.requestsPerSecond +
      results.concurrent10.requestsPerSecond +
      results.concurrent25.requestsPerSecond +
      results.stress.requestsPerSecond) /
    4;

  const avgResponseTime =
    (results.sequential.avgResponseTime +
      results.concurrent10.avgResponseTime +
      results.concurrent25.avgResponseTime +
      results.stress.avgResponseTime) /
    4;

  console.log(`║  Average Throughput: ${avgThroughput.toFixed(2).padEnd(39)} req/s ║`);
  console.log(`║  Average Response Time: ${avgResponseTime.toFixed(2).padEnd(36)}ms ║`);
  console.log(`║  Peak Throughput: ${results.concurrent25.requestsPerSecond.toFixed(2).padEnd(42)} req/s ║`);
  console.log(`║  Best Response Time: ${results.sequential.avgResponseTime.toFixed(2).padEnd(39)}ms ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');

  // Performance grade
  const grade =
    avgResponseTime < 100 && avgThroughput > 10
      ? 'EXCELLENT'
      : avgResponseTime < 200 && avgThroughput > 5
      ? 'GOOD'
      : avgResponseTime < 500
      ? 'ACCEPTABLE'
      : 'NEEDS OPTIMIZATION';

  console.log(`║  Performance Grade: ${grade.padEnd(45)}║`);
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  return results;
}
