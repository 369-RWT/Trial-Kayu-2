import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runValidation() {
  console.log("\n=== LAYER 5: DATA INTEGRITY & BUSINESS LOGIC ===\n");

  // 5.1 Check inventory balance
  console.log("5.1 Inventory Balance Check");
  const logs = await prisma.logInventory.findMany();
  const totalKubikasi = logs.reduce((sum, log) => sum + log.kubikasiFinal, 0);
  const totalRemaining = logs.reduce((sum, log) => sum + log.remainingKubikasi, 0);
  console.log(`  Total Kubikasi: ${totalKubikasi} m³`);
  console.log(`  Remaining: ${totalRemaining} m³`);
  console.log(`  Consumed: ${totalKubikasi - totalRemaining} m³`);
  console.log(`  Status: ${totalRemaining <= totalKubikasi ? "✓ PASS" : "✗ FAIL - Remaining > Total!"}`);

  // 5.2 WAC Calculation Consistency
  console.log("\n5.2 WAC Calculation Consistency");
  const valuations = await prisma.inventoryValuation.findMany();
  let wacIssues = 0;

  for (const val of valuations) {
    if (val.closingKubikasi > 0) {
      const calculatedWAC = val.closingValue / val.closingKubikasi;
      const diff = Math.abs(val.wacPerKubik - calculatedWAC);
      if (diff > 0.01) {
        console.log(`  ✗ Wood Type ${val.woodTypeId}: WAC mismatch`);
        console.log(`    Stored: ${val.wacPerKubik}`);
        console.log(`    Calculated: ${calculatedWAC}`);
        console.log(`    Diff: ${diff}`);
        wacIssues++;
      }
    }
  }
  console.log(`  Status: ${wacIssues === 0 ? "✓ PASS - All WAC calculations correct" : `✗ FAIL - ${wacIssues} discrepancies found`}`);

  // 5.3 Negative Value Detection
  console.log("\n5.3 Negative Value Detection");
  const negativeChecks = [
    { table: "log_inventory", field: "kubikasiFinal", data: logs.filter(l => l.kubikasiFinal < 0) },
    { table: "log_inventory", field: "remainingKubikasi", data: logs.filter(l => l.remainingKubikasi < 0) },
    { table: "log_inventory", field: "totalCost", data: logs.filter(l => l.totalCost < 0) },
  ];

  let negativeIssues = 0;
  for (const check of negativeChecks) {
    if (check.data.length > 0) {
      console.log(`  ✗ ${check.table}.${check.field}: ${check.data.length} negative values`);
      negativeIssues++;
    }
  }
  console.log(`  Status: ${negativeIssues === 0 ? "✓ PASS - No negative values" : `✗ FAIL - ${negativeIssues} issues`}`);

  // 5.4 Unique Constraint Check
  console.log("\n5.4 Unique Constraint Validation");
  const logTags = logs.map(l => l.logTag);
  const uniqueLogTags = new Set(logTags);
  console.log(`  Total logs: ${logs.length}`);
  console.log(`  Unique log tags: ${uniqueLogTags.size}`);
  console.log(`  Status: ${logs.length === uniqueLogTags.size ? "✓ PASS - All log tags unique" : "✗ FAIL - Duplicate log tags!"}`);

  // 5.5 Pricing Matrix Coverage
  console.log("\n5.5 Product × Wood Type Pricing Coverage");
  const products = await prisma.product.findMany({ where: { isActive: true } });
  const woodTypes = await prisma.woodType.findMany({ where: { isActive: true } });
  const pricing = await prisma.productPricing.findMany({ where: { isActive: true } });

  const expectedCombinations = products.length * woodTypes.length;
  console.log(`  Products: ${products.length}`);
  console.log(`  Wood Types: ${woodTypes.length}`);
  console.log(`  Expected combinations: ${expectedCombinations}`);
  console.log(`  Actual pricing entries: ${pricing.length}`);
  console.log(`  Status: ${pricing.length >= expectedCombinations ? "✓ PASS - Full coverage" : "⚠️  WARNING - Incomplete coverage"}`);

  // 5.6 Master Data Integrity
  console.log("\n5.6 Master Data Integrity");
  const suppliers = await prisma.supplier.findMany();
  const workers = await prisma.worker.findMany();
  const machines = await prisma.machineType.findMany();

  console.log(`  Suppliers: ${suppliers.length}`);
  console.log(`  Workers: ${workers.length}`);
  console.log(`  Machines: ${machines.length}`);
  console.log(`  Status: ${suppliers.length > 0 && workers.length > 0 && machines.length > 0 ? "✓ PASS" : "✗ FAIL - Missing master data"}`);

  console.log("\n=== LAYER 6: PERFORMANCE & EDGE CASES ===\n");

  // 6.1 Large Number Handling
  console.log("6.1 Large Number Handling Test");
  const maxValue = Math.max(...logs.map(l => l.totalCost));
  const maxKubikasi = Math.max(...logs.map(l => l.kubikasiFinal));
  console.log(`  Max Total Cost: Rp ${maxValue.toLocaleString()}`);
  console.log(`  Max Kubikasi: ${maxKubikasi} m³`);
  console.log(`  Status: ${isFinite(maxValue) && isFinite(maxKubikasi) ? "✓ PASS - Values finite" : "✗ FAIL - Infinity detected"}`);

  // 6.2 Decimal Precision
  console.log("\n6.2 Decimal Precision Check");
  const hasDecimalIssue = logs.some(l => {
    const recalculated = Math.floor(l.kubikasiTotal);
    return Math.abs(l.kubikasiFinal - recalculated) > 0.01;
  });
  console.log(`  Status: ${!hasDecimalIssue ? "✓ PASS - FLOOR applied correctly" : "✗ FAIL - Decimal precision issues"}`);

  await prisma.$disconnect();
}

runValidation().catch(console.error);
