import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Configuration
const DAYS = 7;
const PRODUCTIONS_PER_DAY = 1000;
const START_DATE = new Date("2024-11-10");

// Helper to generate random number in range
function random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to generate random float
function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

async function main() {
    console.log("🚀 Starting load test simulation...");
    console.log(`📊 Parameters: ${DAYS} days, ${PRODUCTIONS_PER_DAY} productions/day`);

    // 1. Create Master Data
    console.log("\n📦 Creating master data...");

    const woodTypes = await Promise.all([
        prisma.woodType.create({ data: { woodCode: "JT", woodName: "Jati", avgWasteRate: 0.123, isActive: true } }),
        prisma.woodType.create({ data: { woodCode: "MR", woodName: "Meranti", avgWasteRate: 0.223, isActive: true } }),
        prisma.woodType.create({ data: { woodCode: "MH", woodName: "Mahoni", avgWasteRate: 0.18, isActive: true } }),
        prisma.woodType.create({ data: { woodCode: "SG", woodName: "Sengon", avgWasteRate: 0.28, isActive: true } }),
        prisma.woodType.create({ data: { woodCode: "KP", woodName: "Kamper", avgWasteRate: 0.143, isActive: true } }),
    ]);
    console.log(`✓ Created ${woodTypes.length} wood types`);

    const suppliers = await Promise.all([
        prisma.supplier.create({ data: { supplierCode: "SUP01", supplierName: "PT Kayu Nusantara", isActive: true } }),
        prisma.supplier.create({ data: { supplierCode: "SUP02", supplierName: "CV Sumber Kayu", isActive: true } }),
        prisma.supplier.create({ data: { supplierCode: "SUP03", supplierName: "UD Hutan Jaya", isActive: true } }),
    ]);
    console.log(`✓ Created ${suppliers.length} suppliers`);

    const machines = await Promise.all([
        prisma.machineType.create({ data: { machineName: "Bandsaw Machine 1", isActive: true } }),
        prisma.machineType.create({ data: { machineName: "Circular Saw Machine 2", isActive: true } }),
        prisma.machineType.create({ data: { machineName: "Panel Saw Machine 3", isActive: true } }),
    ]);
    console.log(`✓ Created ${machines.length} machine types`);

    const products = await Promise.all([
        prisma.product.create({ data: { productCode: "HBEAM", productName: "Horizontal Beams", machineTypeId: machines[0].id, standardWasteRate: 0.15, isActive: true } }),
        prisma.product.create({ data: { productCode: "BSTRUK", productName: "Balok Struktural", machineTypeId: machines[1].id, standardWasteRate: 0.20, isActive: true } }),
        prisma.product.create({ data: { productCode: "PCOR", productName: "Papan Cor", machineTypeId: machines[2].id, standardWasteRate: 0.25, isActive: true } }),
        prisma.product.create({ data: { productCode: "FLOOR", productName: "Flooring", machineTypeId: machines[0].id, standardWasteRate: 0.18, isActive: true } }),
        prisma.product.create({ data: { productCode: "DECK", productName: "Decking", machineTypeId: machines[1].id, standardWasteRate: 0.22, isActive: true } }),
    ]);
    console.log(`✓ Created ${products.length} products`);

    const workers = await Promise.all([
        prisma.worker.create({ data: { workerCode: "WKR001", workerName: "Agus Setiawan", position: "Senior Operator", isActive: true } }),
        prisma.worker.create({ data: { workerCode: "WKR002", workerName: "Dedi Prasetyo", position: "Operator", isActive: true } }),
        prisma.worker.create({ data: { workerCode: "WKR003", workerName: "Eko Susanto", position: "Junior Operator", isActive: true } }),
    ]);
    console.log(`✓ Created ${workers.length} workers`);

    // Create pricing matrix
    const pricingData = [];
    for (const product of products) {
        for (const woodType of woodTypes) {
            pricingData.push({
                productId: product.id,
                woodTypeId: woodType.id,
                sellingPricePerKubik: randomFloat(2000000, 6000000),
                effectiveDate: new Date("2024-11-01"),
                isActive: true,
            });
        }
    }
    await prisma.productPricing.createMany({ data: pricingData });
    console.log(`✓ Created ${pricingData.length} pricing entries`);

    // 2. Generate data for each day
    let totalLogs = 0;
    let totalBatches = 0;
    let totalLineItems = 0;

    for (let day = 0; day < DAYS; day++) {
        const currentDate = new Date(START_DATE);
        currentDate.setDate(currentDate.getDate() + day);

        console.log(`\n📅 Day ${day + 1}/${DAYS} - ${currentDate.toISOString().split('T')[0]}`);

        // Calculate required kubikasi for the day
        const targetKubikasiPerProduction = randomFloat(0.5, 2.0);
        const totalRequiredKubikasi = PRODUCTIONS_PER_DAY * targetKubikasiPerProduction * 1.3; // 30% buffer for waste

        // Purchase logs for each wood type
        const logsForDay = [];
        for (const woodType of woodTypes) {
            const numLogs = random(5, 15);
            for (let i = 0; i < numLogs; i++) {
                const supplier = suppliers[random(0, suppliers.length - 1)];
                const lingkar = randomFloat(100, 180);
                const panjang = randomFloat(3.5, 6.0);
                const jumlahLog = random(5, 12);
                const kubikasiTotal = (lingkar * lingkar * panjang * jumlahLog) / (4 * Math.PI * 10000);
                const kubikasiFinal = Math.floor(kubikasiTotal);
                const hargaPerKubik = randomFloat(1500000, 4500000);
                const totalCost = kubikasiFinal * hargaPerKubik;

                const log = await prisma.logInventory.create({
                    data: {
                        logTag: `${woodType.woodCode}-${supplier.supplierCode}-${currentDate.toISOString().split('T')[0].replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
                        woodTypeId: woodType.id,
                        supplierId: supplier.id,
                        purchaseDate: currentDate,
                        lingkarCm: lingkar,
                        panjangM: panjang,
                        jumlahLog: jumlahLog,
                        kubikasiTotal: kubikasiTotal,
                        kubikasiFinal: kubikasiFinal,
                        hargaPerKubik: hargaPerKubik,
                        totalCost: totalCost,
                        status: "Available",
                        remainingKubikasi: kubikasiFinal,
                    },
                });
                logsForDay.push(log);
                totalLogs++;
            }
        }
        console.log(`  ✓ Created ${logsForDay.length} log inventory entries`);

        // Create production batches (split into shifts)
        const batchesPerShift = Math.ceil(PRODUCTIONS_PER_DAY / 2);

        for (let shift = 1; shift <= 2; shift++) {
            const batchId = `B-${currentDate.toISOString().split('T')[0].replace(/-/g, '')}-${shift}`;

            const batch = await prisma.productionBatch.create({
                data: {
                    id: batchId,
                    productionDate: currentDate,
                    shift: shift,
                    status: "Completed",
                },
            });
            totalBatches++;

            // Create line items for this batch
            const lineItemsForBatch = shift === 1 ? batchesPerShift : (PRODUCTIONS_PER_DAY - batchesPerShift);

            for (let line = 1; line <= lineItemsForBatch; line++) {
                const woodType = woodTypes[random(0, woodTypes.length - 1)];
                const product = products[random(0, products.length - 1)];
                const worker = workers[random(0, workers.length - 1)];
                const targetKubikasi = randomFloat(0.5, 2.0);
                const wasteRate = randomFloat(0.1, 0.35);
                const actualOutput = targetKubikasi;
                const totalInput = actualOutput / (1 - wasteRate);
                const totalWaste = totalInput - actualOutput;
                const wac = randomFloat(2000000, 4000000);
                const materialCostDirect = actualOutput * wac;
                const materialCostWaste = totalWaste * wac;
                const materialCostTotal = materialCostDirect + materialCostWaste;
                const materialCostPerKubik = materialCostTotal / actualOutput;

                const lineItem = await prisma.batchLineItem.create({
                    data: {
                        batchId: batchId,
                        lineNumber: line,
                        woodTypeId: woodType.id,
                        productId: product.id,
                        targetKubikasi: targetKubikasi,
                        actualOutputKubikasi: actualOutput,
                        totalInputKubikasi: totalInput,
                        totalWasteKubikasi: totalWaste,
                        wacPerKubik: wac,
                        materialCostDirect: materialCostDirect,
                        materialCostWaste: materialCostWaste,
                        materialCostTotal: materialCostTotal,
                        materialCostPerKubik: materialCostPerKubik,
                        workerId: worker.id,
                        machineTypeId: product.machineTypeId,
                        sellingPricePerKubik: randomFloat(3000000, 7000000),
                    },
                });
                totalLineItems++;

                // Create log consumption (simplified - use available logs)
                const availableLogs = logsForDay.filter(l => l.woodTypeId === woodType.id && l.remainingKubikasi > 0);
                if (availableLogs.length > 0) {
                    const log = availableLogs[0];
                    const consumedKubikasi = Math.min(totalInput, log.remainingKubikasi);

                    await prisma.logConsumption.create({
                        data: {
                            batchLineId: lineItem.id,
                            logTag: log.logTag,
                            woodTypeId: woodType.id,
                            supplierId: log.supplierId,
                            purchaseDate: log.purchaseDate,
                            kubikasiConsumed: consumedKubikasi,
                            wacPerKubik: wac,
                            materialCost: consumedKubikasi * wac,
                        },
                    });

                    // Update log remaining
                    await prisma.logInventory.update({
                        where: { id: log.id },
                        data: {
                            remainingKubikasi: log.remainingKubikasi - consumedKubikasi,
                            status: log.remainingKubikasi - consumedKubikasi <= 0 ? "Consumed" : "Partial",
                        },
                    });
                }

                // Create production output
                await prisma.productionOutput.create({
                    data: {
                        batchLineId: lineItem.id,
                        woodTypeId: woodType.id,
                        productId: product.id,
                        kubikasiProduced: actualOutput,
                        materialCostDirect: materialCostDirect,
                        materialCostAllocatedWaste: materialCostWaste,
                        totalMaterialCost: materialCostTotal,
                    },
                });
            }

            console.log(`  ✓ Shift ${shift}: Created batch with ${lineItemsForBatch} line items`);
        }
    }

    console.log("\n✅ Simulation completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Total logs: ${totalLogs}`);
    console.log(`   - Total batches: ${totalBatches}`);
    console.log(`   - Total line items: ${totalLineItems}`);
    console.log(`   - Total productions: ${totalLineItems}`);
}

main()
    .catch((e) => {
        console.error("❌ Simulation failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
