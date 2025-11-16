// Test kubikasi calculation accuracy
function calculateKubikasi(lingkarCm: number, panjangM: number, jumlahLog: number, nilaiDasar: number = 785) {
  const diameter = lingkarCm / 4;
  const kubikasiTotal = ((diameter * diameter * panjangM * nilaiDasar) / 10000) * jumlahLog;
  const kubikasiFinal = Math.floor(kubikasiTotal);
  return { diameter, kubikasiTotal, kubikasiFinal };
}

console.log("=== LAYER 3: CALCULATION VALIDATION ===\n");
console.log("3.1 Kubikasi Calculation Tests");

// Test Case 1: Sample from documentation
console.log("\nTest 1: Sample Log (Lingkar=125cm, Panjang=4.5m, Jumlah=8)");
const test1 = calculateKubikasi(125, 4.5, 8);
console.log("  Diameter:", test1.diameter.toFixed(2), "cm");
console.log("  Kubikasi Total:", test1.kubikasiTotal.toFixed(3), "m³");
console.log("  Kubikasi Final:", test1.kubikasiFinal, "m³");
console.log("  Expected: ~100 m³");
console.log("  Status:", test1.kubikasiFinal >= 99 && test1.kubikasiFinal <= 101 ? "✓ PASS" : "✗ FAIL");

// Test Case 2: Edge case - Zero values
console.log("\nTest 2: Edge Case - Zero Lingkar");
const test2 = calculateKubikasi(0, 4.5, 8);
console.log("  Result:", test2.kubikasiFinal, "m³");
console.log("  Status:", test2.kubikasiFinal === 0 ? "✓ PASS" : "✗ FAIL");

// Test Case 3: Edge case - Negative values
console.log("\nTest 3: Edge Case - Negative Values");
const test3 = calculateKubikasi(-125, 4.5, 8);
console.log("  Result:", test3.kubikasiFinal, "m³");
console.log("  Status:", test3.kubikasiFinal >= 0 ? "✓ PASS (handles negative)" : "✗ FAIL (negative result)");

// Test Case 4: Very large values
console.log("\nTest 4: Edge Case - Very Large Values");
const test4 = calculateKubikasi(10000, 100, 1000);
console.log("  Result:", test4.kubikasiFinal.toLocaleString(), "m³");
console.log("  Status:", !isNaN(test4.kubikasiFinal) && isFinite(test4.kubikasiFinal) ? "✓ PASS" : "✗ FAIL");

// Test Case 5: Decimal precision
console.log("\nTest 5: Decimal Precision - FLOOR vs ROUND");
const test5 = calculateKubikasi(125, 4.5, 8);
console.log("  Kubikasi Total:", test5.kubikasiTotal.toFixed(3), "m³");
console.log("  FLOOR Result:", test5.kubikasiFinal, "m³");
console.log("  ROUND Result:", Math.round(test5.kubikasiTotal), "m³");
console.log("  Difference:", Math.round(test5.kubikasiTotal) - test5.kubikasiFinal, "m³");
console.log("  Status:", test5.kubikasiFinal === Math.floor(test5.kubikasiTotal) ? "✓ PASS (FLOOR correct)" : "✗ FAIL");

// Test WAC Calculation
console.log("\n3.2 Weighted Average Cost (WAC) Tests");

console.log("\nTest 6: WAC Calculation - Single Purchase");
const inv1 = { kubikasi: 100, value: 400000000 };
const wac1 = inv1.value / inv1.kubikasi;
console.log("  100 m³ at Rp 4,000,000/m³");
console.log("  WAC:", wac1.toLocaleString(), "Rp/m³");
console.log("  Expected: 4,000,000 Rp/m³");
console.log("  Status:", wac1 === 4000000 ? "✓ PASS" : "✗ FAIL");

console.log("\nTest 7: WAC Calculation - Multiple Purchases");
const inv2Opening = { kubikasi: 100, value: 400000000 };
const inv2Purchase = { kubikasi: 50, value: 225000000 }; // 50 m³ at 4,500,000/m³
const inv2Closing = {
  kubikasi: inv2Opening.kubikasi + inv2Purchase.kubikasi,
  value: inv2Opening.value + inv2Purchase.value
};
const wac2 = inv2Closing.value / inv2Closing.kubikasi;
console.log("  Opening: 100 m³ at Rp 4,000,000/m³");
console.log("  Purchase: 50 m³ at Rp 4,500,000/m³");
console.log("  Closing: 150 m³");
console.log("  WAC:", wac2.toLocaleString(), "Rp/m³");
console.log("  Expected: 4,166,667 Rp/m³");
console.log("  Status:", Math.abs(wac2 - 4166666.67) < 1 ? "✓ PASS" : "✗ FAIL");

console.log("\nTest 8: Division by Zero Protection");
const inv3 = { kubikasi: 0, value: 0 };
const wac3 = inv3.kubikasi > 0 ? inv3.value / inv3.kubikasi : 0;
console.log("  0 m³ inventory");
console.log("  WAC:", wac3, "Rp/m³");
console.log("  Status:", wac3 === 0 ? "✓ PASS (protected)" : "✗ FAIL");

console.log("\n3.3 Material Cost Allocation Tests");

console.log("\nTest 9: Material Cost with Waste");
const production = {
  input: 18,
  output: 15.2,
  waste: 2.8,
  wac: 4166667
};
const directCost = production.output * production.wac;
const wasteCost = production.waste * production.wac;
const totalMaterialCost = directCost + wasteCost;
const costPerUnit = totalMaterialCost / production.output;

console.log("  Input: 18 m³ at WAC Rp 4,166,667/m³");
console.log("  Output: 15.2 m³");
console.log("  Waste: 2.8 m³");
console.log("  Direct Cost:", directCost.toLocaleString(), "Rp");
console.log("  Waste Cost:", wasteCost.toLocaleString(), "Rp");
console.log("  Total Material Cost:", totalMaterialCost.toLocaleString(), "Rp");
console.log("  Cost/m³:", costPerUnit.toLocaleString(), "Rp/m³");
console.log("  Expected: ~4,802,632 Rp/m³");
console.log("  Status:", Math.abs(costPerUnit - 4802632) < 10 ? "✓ PASS" : "✗ FAIL");

console.log("\n3.4 Margin Calculation Tests");

console.log("\nTest 10: Profit Margin");
const sellingPrice = 5500000;
const cost = 4802632;
const margin = sellingPrice - cost;
const marginPct = (margin / sellingPrice) * 100;

console.log("  Selling Price: Rp", sellingPrice.toLocaleString(), "/m³");
console.log("  Cost: Rp", cost.toLocaleString(), "/m³");
console.log("  Margin: Rp", margin.toLocaleString(), "/m³");
console.log("  Margin %:", marginPct.toFixed(1), "%");
console.log("  Expected: ~12.7%");
console.log("  Status:", Math.abs(marginPct - 12.7) < 0.1 ? "✓ PASS" : "✗ FAIL");

console.log("\n=== CALCULATION TESTS COMPLETE ===");
