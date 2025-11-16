/**
 * Realistic Test Data Generator for Load Testing
 *
 * Simulates real-world wood purchasing scenarios with:
 * - Multiple suppliers
 * - Varied log dimensions
 * - Different wood types
 * - Realistic pricing
 * - Time-based patterns
 */

export interface LogPurchaseData {
  woodTypeId: number;
  supplierId: number;
  purchaseDate: string;
  lingkarCm: number;
  panjangM: number;
  jumlahLog: number;
  hargaPerKubik: number;
  nilaiDasar: number;
}

// Real-world wood type pricing (Rp per m³)
const woodTypePricing = {
  1: { min: 3500000, max: 4500000, name: 'Jati' },      // Premium
  2: { min: 2000000, max: 3000000, name: 'Meranti' },   // Mid-range
  3: { min: 2500000, max: 3500000, name: 'Mahoni' },    // Mid-range
  4: { min: 1500000, max: 2500000, name: 'Sengon' },    // Economy
  5: { min: 3000000, max: 4000000, name: 'Kamper' },    // Premium
};

// Typical log dimensions (Indonesian wood industry standards)
const logDimensions = {
  small: { lingkar: [80, 100], panjang: [3, 4], jumlah: [5, 15] },
  medium: { lingkar: [100, 140], panjang: [4, 6], jumlah: [8, 25] },
  large: { lingkar: [140, 180], panjang: [5, 7], jumlah: [15, 40] },
  bulk: { lingkar: [120, 160], panjang: [4, 6], jumlah: [30, 80] },
};

/**
 * Generate random number within range
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float within range
 */
function randomFloatInRange(min: number, max: number, decimals: number = 1): number {
  const value = Math.random() * (max - min) + min;
  return Number(value.toFixed(decimals));
}

/**
 * Generate realistic purchase date (last 90 days)
 */
function generatePurchaseDate(daysAgo?: number): string {
  const date = new Date();
  const offset = daysAgo ?? randomInRange(0, 90);
  date.setDate(date.getDate() - offset);
  return date.toISOString();
}

/**
 * Generate single log purchase with realistic data
 */
export function generateLogPurchase(
  woodTypeId?: number,
  supplierId?: number,
  size?: 'small' | 'medium' | 'large' | 'bulk'
): LogPurchaseData {
  const selectedWoodType = woodTypeId ?? randomInRange(1, 5);
  const selectedSupplier = supplierId ?? randomInRange(1, 3);
  const selectedSize = size ?? (['small', 'medium', 'large', 'bulk'][randomInRange(0, 3)] as keyof typeof logDimensions);

  const dimensions = logDimensions[selectedSize];
  const pricing = woodTypePricing[selectedWoodType as keyof typeof woodTypePricing];

  const lingkarCm = randomInRange(dimensions.lingkar[0], dimensions.lingkar[1]);
  const panjangM = randomFloatInRange(dimensions.panjang[0], dimensions.panjang[1], 1);
  const jumlahLog = randomInRange(dimensions.jumlah[0], dimensions.jumlah[1]);
  const hargaPerKubik = randomInRange(pricing.min, pricing.max);

  // Use standard nilaiDasar with slight variation
  const nilaiDasar = randomInRange(775, 795);

  return {
    woodTypeId: selectedWoodType,
    supplierId: selectedSupplier,
    purchaseDate: generatePurchaseDate(),
    lingkarCm,
    panjangM,
    jumlahLog,
    hargaPerKubik,
    nilaiDasar,
  };
}

/**
 * Generate batch of log purchases
 */
export function generateLogPurchaseBatch(count: number): LogPurchaseData[] {
  const purchases: LogPurchaseData[] = [];

  for (let i = 0; i < count; i++) {
    purchases.push(generateLogPurchase());
  }

  return purchases;
}

/**
 * Generate realistic scenario: Weekly purchasing pattern
 */
export function generateWeeklyPurchases(): LogPurchaseData[] {
  const purchases: LogPurchaseData[] = [];

  // Monday: Bulk Jati purchase from primary supplier
  for (let i = 0; i < 3; i++) {
    purchases.push(generateLogPurchase(1, 1, 'bulk'));
  }

  // Tuesday: Mixed purchases
  purchases.push(generateLogPurchase(2, 2, 'medium'));
  purchases.push(generateLogPurchase(3, 2, 'medium'));

  // Wednesday: Sengon bulk (economy wood)
  for (let i = 0; i < 5; i++) {
    purchases.push(generateLogPurchase(4, 3, 'bulk'));
  }

  // Thursday: Premium wood mix
  purchases.push(generateLogPurchase(1, 1, 'large'));
  purchases.push(generateLogPurchase(5, 2, 'large'));

  // Friday: Various suppliers, small batches
  purchases.push(generateLogPurchase(2, 1, 'small'));
  purchases.push(generateLogPurchase(3, 3, 'small'));
  purchases.push(generateLogPurchase(4, 2, 'small'));

  return purchases;
}

/**
 * Generate month-long purchasing scenario
 */
export function generateMonthlyPurchases(): LogPurchaseData[] {
  const purchases: LogPurchaseData[] = [];
  const weeksInMonth = 4;

  for (let week = 0; week < weeksInMonth; week++) {
    const weeklyPurchases = generateWeeklyPurchases();
    // Offset dates by week
    weeklyPurchases.forEach(purchase => {
      const date = new Date(purchase.purchaseDate);
      date.setDate(date.getDate() - (week * 7));
      purchase.purchaseDate = date.toISOString();
    });
    purchases.push(...weeklyPurchases);
  }

  return purchases;
}

/**
 * Generate stress test scenario: High-volume day
 */
export function generateHighVolumeDay(): LogPurchaseData[] {
  const purchases: LogPurchaseData[] = [];
  const today = new Date().toISOString();

  // Simulate 50 purchases in a single day (realistic peak load)
  for (let i = 0; i < 50; i++) {
    const purchase = generateLogPurchase();
    purchase.purchaseDate = today;
    purchases.push(purchase);
  }

  return purchases;
}

/**
 * Generate concurrent test scenario: Simultaneous purchases
 */
export function generateConcurrentPurchases(
  concurrentBatches: number,
  purchasesPerBatch: number
): LogPurchaseData[][] {
  const batches: LogPurchaseData[][] = [];

  for (let i = 0; i < concurrentBatches; i++) {
    batches.push(generateLogPurchaseBatch(purchasesPerBatch));
  }

  return batches;
}

/**
 * Calculate expected kubikasi for validation
 */
export function calculateExpectedKubikasi(purchase: LogPurchaseData): number {
  const diameter = purchase.lingkarCm / 4;
  const kubikasiTotal =
    ((diameter * diameter * purchase.panjangM * purchase.nilaiDasar) / 10000) *
    purchase.jumlahLog;
  return Math.floor(kubikasiTotal);
}

/**
 * Generate test statistics
 */
export function generateTestStatistics(purchases: LogPurchaseData[]) {
  const stats = {
    totalPurchases: purchases.length,
    byWoodType: {} as Record<number, number>,
    bySupplier: {} as Record<number, number>,
    totalKubikasi: 0,
    totalValue: 0,
    avgLogSize: 0,
    avgPurchaseValue: 0,
  };

  let totalLingkar = 0;

  purchases.forEach(purchase => {
    // Count by wood type
    stats.byWoodType[purchase.woodTypeId] =
      (stats.byWoodType[purchase.woodTypeId] || 0) + 1;

    // Count by supplier
    stats.bySupplier[purchase.supplierId] =
      (stats.bySupplier[purchase.supplierId] || 0) + 1;

    // Calculate kubikasi
    const kubikasi = calculateExpectedKubikasi(purchase);
    stats.totalKubikasi += kubikasi;
    stats.totalValue += kubikasi * purchase.hargaPerKubik;
    totalLingkar += purchase.lingkarCm;
  });

  stats.avgLogSize = totalLingkar / purchases.length;
  stats.avgPurchaseValue = stats.totalValue / purchases.length;

  return stats;
}

/**
 * Print test data summary
 */
export function printTestSummary(purchases: LogPurchaseData[]) {
  const stats = generateTestStatistics(purchases);

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                   LOAD TEST DATA SUMMARY                       ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Total Purchases: ${stats.totalPurchases.toString().padEnd(47)}║`);
  console.log(`║  Total Kubikasi: ${stats.totalKubikasi.toFixed(2).padEnd(48)}m³ ║`);
  console.log(`║  Total Value: Rp ${stats.totalValue.toLocaleString('id-ID').padEnd(44)}║`);
  console.log(`║  Avg Log Size: ${stats.avgLogSize.toFixed(1).padEnd(45)}cm ║`);
  console.log(`║  Avg Purchase Value: Rp ${stats.avgPurchaseValue.toLocaleString('id-ID').padEnd(37)}║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  Distribution by Wood Type:                                    ║');

  Object.entries(stats.byWoodType).forEach(([woodType, count]) => {
    const name = woodTypePricing[Number(woodType) as keyof typeof woodTypePricing].name;
    console.log(`║    ${name.padEnd(20)}: ${count.toString().padEnd(32)}║`);
  });

  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║  Distribution by Supplier:                                     ║');

  Object.entries(stats.bySupplier).forEach(([supplier, count]) => {
    console.log(`║    Supplier ${supplier.padEnd(12)}: ${count.toString().padEnd(32)}║`);
  });

  console.log('╚════════════════════════════════════════════════════════════════╝\n');
}
