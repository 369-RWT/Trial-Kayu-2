import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Verifying database state...");

    const counts = await Promise.all([
        prisma.woodType.count(),
        prisma.supplier.count(),
        prisma.product.count(),
        prisma.logInventory.count(),
        prisma.productionBatch.count(),
        prisma.user.count(),
    ]);

    console.log("Wood Types:", counts[0]);
    console.log("Suppliers:", counts[1]);
    console.log("Products:", counts[2]);
    console.log("Log Inventory:", counts[3]);
    console.log("Production Batches:", counts[4]);
    console.log("Users:", counts[5]);

    if (counts[0] === 0 && counts[1] === 0 && counts[2] === 0 && counts[3] === 0 && counts[4] === 0 && counts[5] > 0) {
        console.log("✅ Verification PASSED: Database is clean (users preserved).");
    } else {
        console.error("❌ Verification FAILED: Database is not clean.");
        process.exit(1);
    }
}

main()
    .catch((e) => {
        console.error("❌ Verification failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
