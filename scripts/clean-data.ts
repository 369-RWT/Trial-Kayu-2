import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Starting database cleanup...");

    // 1. Delete Transactional Data (Child tables first)
    console.log("Deleting transactional data...");
    await prisma.supplierWoodPerformance.deleteMany();
    await prisma.wasteDeviation.deleteMany();
    await prisma.productionOutput.deleteMany();
    await prisma.logConsumption.deleteMany();
    await prisma.batchLineItem.deleteMany();
    await prisma.productionBatch.deleteMany();
    await prisma.inventoryValuation.deleteMany();
    await prisma.logInventory.deleteMany();

    // 2. Delete Master Data
    console.log("Deleting master data...");
    await prisma.productPricing.deleteMany();
    await prisma.product.deleteMany();
    await prisma.machineType.deleteMany();
    await prisma.worker.deleteMany();
    await prisma.supplier.deleteMany();
    await prisma.woodType.deleteMany();

    // 3. Delete System/Audit Data (Optional, but good for clean slate)
    console.log("Deleting audit logs and sessions...");
    await prisma.auditLog.deleteMany();
    // We keep sessions so the current user doesn't get logged out immediately, 
    // or we can delete them if we want to force re-login. 
    // Let's keep sessions for convenience unless requested otherwise.
    // await prisma.session.deleteMany(); 

    // We DO NOT delete Users, so the user can still log in.
    const userCount = await prisma.user.count();
    console.log(`ℹ️  Kept ${userCount} users.`);

    console.log("✅ Database cleanup completed successfully.");
}

main()
    .catch((e) => {
        console.error("❌ Cleanup failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
