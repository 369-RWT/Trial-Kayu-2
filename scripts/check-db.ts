import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🔍 Quick Database Check\n");

    const batchCount = await prisma.productionBatch.count();
    const lineItemCount = await prisma.batchLineItem.count();

    console.log(`Production Batches: ${batchCount}`);
    console.log(`Batch Line Items: ${lineItemCount}`);

    if (batchCount > 0) {
        console.log("\nFirst 5 batches:");
        const batches = await prisma.productionBatch.findMany({
            take: 5,
            include: {
                batchLineItems: {
                    take: 1,
                },
            },
            orderBy: {
                productionDate: 'desc',
            },
        });

        for (const batch of batches) {
            console.log(`  ${batch.id} - ${batch.productionDate.toISOString().split('T')[0]} - Shift ${batch.shift} - ${batch.batchLineItems.length}+ items`);
        }
    }
}

main()
    .catch((e) => {
        console.error("❌ Check failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
