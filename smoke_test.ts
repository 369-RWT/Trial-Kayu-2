/**
 * Smoke Test Suite for Al Fath Kayu Costing System
 * Tests critical user journeys and core functionality
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  status: "PASS" | "FAIL";
  message: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<void>
): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    results.push({
      name,
      status: "PASS",
      message: "Test passed successfully",
      duration: Date.now() - start,
    });
  } catch (error) {
    results.push({
      name,
      status: "FAIL",
      message: error instanceof Error ? error.message : String(error),
      duration: Date.now() - start,
    });
  }
}

async function runAllTests() {
  // Test 1: Database Connection
  await runTest("Database Connection", async () => {
    const count = await prisma.user.count();
    if (count === 0) throw new Error("No users found in database");
  });

  // Test 2: Master Data Existence
  await runTest("Master Data - Wood Types", async () => {
    const woodTypes = await prisma.woodType.findMany();
    if (woodTypes.length === 0) throw new Error("No wood types found");
  });

  await runTest("Master Data - Suppliers", async () => {
    const suppliers = await prisma.supplier.findMany();
    if (suppliers.length === 0) throw new Error("No suppliers found");
  });

  await runTest("Master Data - Products", async () => {
    const products = await prisma.product.findMany();
    if (products.length === 0) throw new Error("No products found");
  });

  // Test 3: Inventory Data
  await runTest("Inventory - Log Inventory", async () => {
    const logs = await prisma.logInventory.findMany();
    if (logs.length === 0) throw new Error("No log inventory found");
  });

  await runTest("Inventory - Valuations", async () => {
    const valuations = await prisma.inventoryValuation.findMany();
    if (valuations.length === 0)
      throw new Error("No inventory valuations found");
  });

  // Test 4: User Authentication Data
  await runTest("Authentication - Users Exist", async () => {
    const users = await prisma.user.findMany();
    const roles = users.map((u) => u.role);
    const requiredRoles = ["ADMIN", "MANAGER", "OPERATOR", "VIEWER"];

    for (const role of requiredRoles) {
      if (!roles.includes(role)) {
        throw new Error(`Missing user with role: ${role}`);
      }
    }
  });

  // Test 5: Product Pricing Matrix
  await runTest("Product Pricing Matrix", async () => {
    const pricing = await prisma.productPricing.findMany();
    if (pricing.length === 0)
      throw new Error("No product pricing entries found");
  });

  // Test 6: WAC Calculation Integrity
  await runTest("WAC Calculation Integrity", async () => {
    const valuations = await prisma.inventoryValuation.findMany({
      where: { closingKubikasi: { gt: 0 } },
    });

    for (const val of valuations) {
      const expectedWac = val.closingValue / val.closingKubikasi;
      const diff = Math.abs(val.wacPerKubik - expectedWac);

      if (diff > 0.01) {
        throw new Error(
          `WAC mismatch for wood type ${val.woodTypeId}: expected ${expectedWac}, got ${val.wacPerKubik}`
        );
      }
    }
  });

  // Test 7: Log Tag Uniqueness
  await runTest("Log Tag Uniqueness", async () => {
    const logs = await prisma.logInventory.findMany({
      select: { logTag: true },
    });

    const tags = logs.map((l) => l.logTag);
    const uniqueTags = new Set(tags);

    if (tags.length !== uniqueTags.size) {
      throw new Error("Duplicate log tags found");
    }
  });

  // Test 8: Inventory Status Consistency
  await runTest("Inventory Status Consistency", async () => {
    const logs = await prisma.logInventory.findMany();

    for (const log of logs) {
      if (log.remainingKubikasi === 0 && log.status !== "Consumed") {
        throw new Error(
          `Log ${log.logTag} has 0 remaining but status is ${log.status}`
        );
      }

      if (log.remainingKubikasi > log.kubikasiFinal) {
        throw new Error(`Log ${log.logTag} has remaining > final kubikasi`);
      }
    }
  });

  // Print Results
  console.log("\n" + "=".repeat(80));
  console.log("SMOKE TEST RESULTS");
  console.log("=".repeat(80) + "\n");

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  results.forEach((result) => {
    const icon = result.status === "PASS" ? "✓" : "✗";
    const color = result.status === "PASS" ? "\x1b[32m" : "\x1b[31m";
    const reset = "\x1b[0m";

    console.log(
      `${color}${icon}${reset} ${result.name.padEnd(40)} ${result.duration}ms`
    );

    if (result.status === "FAIL") {
      console.log(`  ${color}Error: ${result.message}${reset}`);
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log(
    `Total: ${results.length} tests | Passed: ${passed} | Failed: ${failed} | Duration: ${totalDuration}ms`
  );
  console.log("=".repeat(80) + "\n");

  await prisma.$disconnect();

  process.exit(failed > 0 ? 1 : 0);
}

runAllTests().catch((error) => {
  console.error("Fatal error running tests:", error);
  process.exit(1);
});
