import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Reviewing Load Test Simulation Data\n");
    console.log("=".repeat(70));

    // 1. Master Data Review
    console.log("\n📦 MASTER DATA");
    console.log("-".repeat(70));

    const woodTypeCount = await prisma.woodType.count();
    const supplierCount = await prisma.supplier.count();
    const productCount = await prisma.product.count();
    const workerCount = await prisma.worker.count();
    const machineCount = await prisma.machineType.count();
    const pricingCount = await prisma.productPricing.count();

    console.log(`Wood Types:        ${woodTypeCount}`);
    console.log(`Suppliers:         ${supplierCount}`);
    console.log(`Products:          ${productCount}`);
    console.log(`Workers:           ${workerCount}`);
    console.log(`Machine Types:     ${machineCount}`);
    console.log(`Pricing Entries:   ${pricingCount}`);

    // 2. Transactional Data Review
    console.log("\n📊 TRANSACTIONAL DATA");
    console.log("-".repeat(70));

    const logCount = await prisma.logInventory.count();
    const batchCount = await prisma.productionBatch.count();
    const lineItemCount = await prisma.batchLineItem.count();
    const consumptionCount = await prisma.logConsumption.count();
    const outputCount = await prisma.productionOutput.count();

    console.log(`Log Inventory:         ${logCount}`);
    console.log(`Production Batches:    ${batchCount}`);
    console.log(`Batch Line Items:      ${lineItemCount}`);
    console.log(`Log Consumptions:      ${consumptionCount}`);
    console.log(`Production Outputs:    ${outputCount}`);

    // 3. Daily Breakdown
    console.log("\n📅 DAILY BREAKDOWN");
    console.log("-".repeat(70));

    const batches = await prisma.productionBatch.findMany({
        include: {
            batchLineItems: true,
        },
        orderBy: {
            productionDate: 'asc',
        },
    });

    const dailyStats = new Map();
    for (const batch of batches) {
        const date = batch.productionDate.toISOString().split('T')[0];
        if (!dailyStats.has(date)) {
            dailyStats.set(date, { batches: 0, productions: 0 });
        }
        const stats = dailyStats.get(date)!;
        stats.batches++;
        stats.productions += batch.batchLineItems.length;
    }

    dailyStats.forEach((stats, date) => {
        console.log(`${date}: ${stats.batches} batches, ${stats.productions} productions`);
    });

    // 4. Product Distribution
    console.log("\n🏭 PRODUCTION BY PRODUCT");
    console.log("-".repeat(70));

    const productStats = await prisma.batchLineItem.groupBy({
        by: ['productId'],
        _count: {
            id: true,
        },
    });

    for (const stat of productStats) {
        const product = await prisma.product.findUnique({
            where: { id: stat.productId },
        });
        console.log(`${product?.productName.padEnd(25)} ${stat._count.id} productions`);
    }

    // 5. Wood Type Distribution
    console.log("\n🌲 PRODUCTION BY WOOD TYPE");
    console.log("-".repeat(70));

    const woodStats = await prisma.batchLineItem.groupBy({
        by: ['woodTypeId'],
        _count: {
            id: true,
        },
    });

    for (const stat of woodStats) {
        const wood = await prisma.woodType.findUnique({
            where: { id: stat.woodTypeId },
        });
        console.log(`${wood?.woodName.padEnd(25)} ${stat._count.id} productions`);
    }

    // 6. Kubikasi Summary
    console.log("\n📐 KUBIKASI SUMMARY");
    console.log("-".repeat(70));

    const kubikasiStats = await prisma.batchLineItem.aggregate({
        _sum: {
            targetKubikasi: true,
            actualOutputKubikasi: true,
            totalInputKubikasi: true,
            totalWasteKubikasi: true,
        },
        _avg: {
            totalWasteKubikasi: true,
        },
    });

    console.log(`Total Target:          ${kubikasiStats._sum.targetKubikasi?.toFixed(2)} m³`);
    console.log(`Total Output:          ${kubikasiStats._sum.actualOutputKubikasi?.toFixed(2)} m³`);
    console.log(`Total Input:           ${kubikasiStats._sum.totalInputKubikasi?.toFixed(2)} m³`);
    console.log(`Total Waste:           ${kubikasiStats._sum.totalWasteKubikasi?.toFixed(2)} m³`);
    console.log(`Avg Waste per Prod:    ${kubikasiStats._avg.totalWasteKubikasi?.toFixed(4)} m³`);

    const wasteRate = ((kubikasiStats._sum.totalWasteKubikasi || 0) / (kubikasiStats._sum.totalInputKubikasi || 1)) * 100;
    console.log(`Overall Waste Rate:    ${wasteRate.toFixed(2)}%`);

    // 7. Cost Summary
    console.log("\n💰 COST SUMMARY");
    console.log("-".repeat(70));

    const costStats = await prisma.batchLineItem.aggregate({
        _sum: {
            materialCostDirect: true,
            materialCostWaste: true,
            materialCostTotal: true,
        },
    });

    console.log(`Total Direct Cost:     Rp ${(costStats._sum.materialCostDirect || 0).toLocaleString('id-ID')}`);
    console.log(`Total Waste Cost:      Rp ${(costStats._sum.materialCostWaste || 0).toLocaleString('id-ID')}`);
    console.log(`Total Material Cost:   Rp ${(costStats._sum.materialCostTotal || 0).toLocaleString('id-ID')}`);

    // 8. Log Inventory Status
    console.log("\n📦 LOG INVENTORY STATUS");
    console.log("-".repeat(70));

    const logStatus = await prisma.logInventory.groupBy({
        by: ['status'],
        _count: {
            id: true,
        },
        _sum: {
            remainingKubikasi: true,
        },
    });

    for (const stat of logStatus) {
        console.log(`${stat.status.padEnd(15)} ${stat._count.id} logs, ${stat._sum.remainingKubikasi?.toFixed(2)} m³ remaining`);
    }

    // 9. Data Integrity Checks
    console.log("\n✅ DATA INTEGRITY CHECKS");
    console.log("-".repeat(70));

    const checks = [];

    // Check 1: All line items have consumption records
    const lineItemsWithoutConsumption = await prisma.batchLineItem.count({
        where: {
            logConsumptions: {
                none: {},
            },
        },
    });
    checks.push({
        name: "Line items with consumption",
        pass: lineItemsWithoutConsumption === 0,
        detail: `${lineItemCount - lineItemsWithoutConsumption}/${lineItemCount}`,
    });

    // Check 2: All line items have output records
    const lineItemsWithoutOutput = await prisma.batchLineItem.count({
        where: {
            productionOutputs: {
                none: {},
            },
        },
    });
    checks.push({
        name: "Line items with output",
        pass: lineItemsWithoutOutput === 0,
        detail: `${lineItemCount - lineItemsWithoutOutput}/${lineItemCount}`,
    });

    // Check 3: Batches have expected line items
    const expectedPerDay = 1000;
    const daysCount = dailyStats.size;
    const expectedTotal = expectedPerDay * daysCount;
    checks.push({
        name: "Production count target",
        pass: lineItemCount === expectedTotal,
        detail: `${lineItemCount}/${expectedTotal}`,
    });

    for (const check of checks) {
        const status = check.pass ? "✓ PASS" : "✗ FAIL";
        console.log(`${status.padEnd(10)} ${check.name.padEnd(35)} ${check.detail}`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ Review completed successfully!\n");
}

main()
    .catch((e) => {
        console.error("❌ Review failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
