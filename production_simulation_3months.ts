import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SimulationConfig {
  startDate: Date;
  durationDays: number;
  productsPerDay: number;
  woodTypes: string[]; // Wood codes to use
}

interface ProductionResult {
  date: string;
  batchId: string;
  productsCreated: number;
  woodTypeUsed: string;
  logConsumed: number;
  outputVolume: number;
  wasteVolume: number;
  materialCost: number;
}

async function getAvailableLogs(woodTypeId: number) {
  return await prisma.logInventory.findMany({
    where: {
      woodTypeId,
      status: { in: ['AVAILABLE', 'Available', 'PARTIAL', 'Partial'] },
      remainingKubikasi: { gt: 0 },
    },
    orderBy: { purchaseDate: 'asc' }, // FIFO
    include: {
      woodType: true,
      supplier: true,
    },
  });
}

async function getProductsForWoodType(woodTypeId: number) {
  return await prisma.product.findMany({
    where: { isActive: true },
    include: {
      productPricing: {
        where: { woodTypeId },
        orderBy: { effectiveDate: 'desc' },
        take: 1,
      },
    },
  });
}

async function getWorkers() {
  return await prisma.worker.findMany({
    where: { isActive: true },
  });
}

async function getMachineTypes() {
  return await prisma.machineType.findMany({
    where: { isActive: true },
  });
}

async function createProductionBatch(
  date: Date,
  shift: 'SHIFT_1' | 'SHIFT_2' | 'SHIFT_3',
  woodTypeId: number,
  productId: number,
  targetKubikasi: number,
  workerId: number,
  machineTypeId: number
) {
  // Generate batch ID: B-YYYYMMDD-XXX
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const existingBatches = await prisma.productionBatch.count({
    where: {
      id: { startsWith: `B-${dateStr}` },
    },
  });
  const batchId = `B-${dateStr}-${String(existingBatches + 1).padStart(3, '0')}`;
  
  // Convert shift to number
  const shiftNumber = shift === 'SHIFT_1' ? 1 : shift === 'SHIFT_2' ? 2 : 3;
  
  // Create batch
  const batch = await prisma.productionBatch.create({
    data: {
      id: batchId,
      productionDate: date,
      shift: shiftNumber,
      status: 'COMPLETED',
    },
  });

  // Get current WAC for the wood type
  const logs = await prisma.logInventory.findMany({
    where: { woodTypeId, status: { in: ['AVAILABLE', 'Available', 'PARTIAL', 'Partial'] } },
  });
  const totalValue = logs.reduce((sum, log) => sum + log.remainingKubikasi * log.hargaPerKubik, 0);
  const totalKubikasi = logs.reduce((sum, log) => sum + log.remainingKubikasi, 0);
  const wacPerKubik = totalKubikasi > 0 ? totalValue / totalKubikasi : 0;

  // Create batch line item
  const lineItem = await prisma.batchLineItem.create({
    data: {
      batchId: batch.id,
      lineNumber: 1,
      woodTypeId,
      productId,
      targetKubikasi,
      wacPerKubik,
      workerId,
      machineTypeId,
    },
  });

  return { batch, lineItem };
}

async function consumeLog(
  logId: number,
  batchLineItemId: number,
  volumeConsumed: number,
  date: Date
) {
  // Get log details
  const log = await prisma.logInventory.findUnique({
    where: { id: logId },
    include: { woodType: true, supplier: true },
  });

  if (!log) throw new Error(`Log ${logId} not found`);

  const materialCost = volumeConsumed * log.hargaPerKubik;

  // Create log consumption record
  await prisma.logConsumption.create({
    data: {
      batchLineId: batchLineItemId,
      logTag: log.logTag,
      woodTypeId: log.woodTypeId,
      supplierId: log.supplierId,
      purchaseDate: log.purchaseDate,
      kubikasiConsumed: volumeConsumed,
      wacPerKubik: log.hargaPerKubik,
      materialCost,
      consumptionTimestamp: date,
    },
  });

  // Update log remaining volume
  const newRemaining = log.remainingKubikasi - volumeConsumed;
  await prisma.logInventory.update({
    where: { id: logId },
    data: {
      remainingKubikasi: newRemaining,
      status: newRemaining <= 0 ? 'CONSUMED' : newRemaining < log.kubikasiFinal ? 'PARTIAL' : 'AVAILABLE',
    },
  });

  return materialCost;
}

async function createProductionOutput(
  batchLineItemId: number,
  productId: number,
  woodTypeId: number,
  actualOutput: number,
  totalMaterialCost: number,
  date: Date
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) throw new Error(`Product ${productId} not found`);

  // Allocate material cost (simplified - direct cost only for now)
  const materialCostDirect = totalMaterialCost;
  const materialCostAllocatedWaste = 0; // Simplified

  // Create production output
  await prisma.productionOutput.create({
    data: {
      batchLineId: batchLineItemId,
      productId,
      woodTypeId,
      kubikasiProduced: actualOutput,
      materialCostDirect,
      materialCostAllocatedWaste,
      totalMaterialCost,
    },
  });
}

async function runSimulation(config: SimulationConfig): Promise<ProductionResult[]> {
  console.log('🏭 Starting 3-Month Production Simulation...');
  console.log(`📅 Duration: ${config.durationDays} days (~${Math.round(config.durationDays / 30)} months)`);
  console.log(`📦 Products per day: ${config.productsPerDay}`);
  console.log(`🌳 Wood types: ${config.woodTypes.join(', ')}\n`);

  const results: ProductionResult[] = [];
  const workers = await getWorkers();
  const machines = await getMachineTypes();

  if (workers.length === 0 || machines.length === 0) {
    throw new Error('No workers or machines available');
  }

  // Get wood types
  const woodTypes = await prisma.woodType.findMany({
    where: { woodCode: { in: config.woodTypes } },
  });

  if (woodTypes.length === 0) {
    throw new Error('No wood types found for the specified codes');
  }

  let insufficientLogCount = 0;

  for (let day = 0; day < config.durationDays; day++) {
    const currentDate = new Date(config.startDate);
    currentDate.setDate(currentDate.getDate() + day);

    // Progress indicator every 10 days
    if (day % 10 === 0 || day === config.durationDays - 1) {
      console.log(`\n📅 Day ${day + 1}/${config.durationDays} - ${currentDate.toLocaleDateString()}`);
    }

    // Distribute products across wood types
    const productsPerWoodType = Math.floor(config.productsPerDay / woodTypes.length);

    for (const woodType of woodTypes) {
      // Get available products for this wood type
      const products = await getProductsForWoodType(woodType.id);
      if (products.length === 0) {
        console.log(`    ⚠️  No products available for ${woodType.woodName}`);
        continue;
      }

      // Select a random product
      const product = products[Math.floor(Math.random() * products.length)];

      // Calculate target volume (assuming each product needs ~0.01-0.05 m³)
      const volumePerProduct = 0.02 + Math.random() * 0.03; // 0.02-0.05 m³
      const targetVolume = productsPerWoodType * volumePerProduct;

      // Select random worker and machine
      const worker = workers[Math.floor(Math.random() * workers.length)];
      const machine = machines[Math.floor(Math.random() * machines.length)];

      // Determine shift based on time of day
      const shifts: ('SHIFT_1' | 'SHIFT_2' | 'SHIFT_3')[] = ['SHIFT_1', 'SHIFT_2', 'SHIFT_3'];
      const shift = shifts[day % 3];

      // Create production batch
      const { batch, lineItem } = await createProductionBatch(
        currentDate,
        shift,
        woodType.id,
        product.id,
        targetVolume,
        worker.id,
        machine.id
      );

      // Consume logs (FIFO)
      let remainingVolume = targetVolume * (1 + product.standardWasteRate / 100); // Include waste
      let totalMaterialCost = 0;
      const availableLogs = await getAvailableLogs(woodType.id);

      for (const log of availableLogs) {
        if (remainingVolume <= 0) break;

        const volumeToConsume = Math.min(remainingVolume, log.remainingKubikasi);
        const cost = await consumeLog(log.id, lineItem.id, volumeToConsume, currentDate);
        totalMaterialCost += cost;
        remainingVolume -= volumeToConsume;
      }

      if (remainingVolume > 0) {
        insufficientLogCount++;
        if (insufficientLogCount <= 5) {
          console.log(`      ⚠️  Insufficient logs for ${woodType.woodCode}! Short by ${remainingVolume.toFixed(2)} m³`);
        }
      }

      // Create production output
      const actualOutput = targetVolume;

      await createProductionOutput(
        lineItem.id,
        product.id,
        woodType.id,
        actualOutput,
        totalMaterialCost,
        currentDate
      );

      // Update batch status
      await prisma.productionBatch.update({
        where: { id: batch.id },
        data: { status: 'COMPLETED' },
      });

      const totalInput = targetVolume * (1 + product.standardWasteRate / 100);
      const wasteVolume = totalInput - actualOutput;

      results.push({
        date: currentDate.toISOString().split('T')[0],
        batchId: batch.id,
        productsCreated: productsPerWoodType,
        woodTypeUsed: woodType.woodCode,
        logConsumed: totalInput,
        outputVolume: actualOutput,
        wasteVolume,
        materialCost: totalMaterialCost,
      });
    }
  }

  if (insufficientLogCount > 5) {
    console.log(`\n⚠️  Total insufficient log warnings: ${insufficientLogCount} (showing first 5 only)`);
  }

  console.log('\n✅ Simulation completed successfully!');
  return results;
}

async function main() {
  try {
    const config: SimulationConfig = {
      startDate: new Date('2025-11-17'), // Start from Nov 17, 2025
      durationDays: 90, // 3 months
      productsPerDay: 100,
      woodTypes: ['JT', 'MH', 'MR', 'SG'], // Jati, Mahoni, Meranti, Sengon (excluding Kamper)
    };

    const results = await runSimulation(config);

    // Print summary
    console.log('\n' + '='.repeat(80));
    console.log('3-MONTH SIMULATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total batches created: ${results.length}`);
    console.log(`Total products: ${results.reduce((sum, r) => sum + r.productsCreated, 0).toLocaleString()}`);
    console.log(`Total output volume: ${results.reduce((sum, r) => sum + r.outputVolume, 0).toFixed(2)} m³`);
    console.log(`Total waste volume: ${results.reduce((sum, r) => sum + r.wasteVolume, 0).toFixed(2)} m³`);
    console.log(`Total material cost: Rp ${results.reduce((sum, r) => sum + r.materialCost, 0).toLocaleString('id-ID')}`);
    console.log('='.repeat(80));

    console.log('\n✅ Production simulation completed successfully!');
    console.log('📊 Check the website for detailed reports and analytics.');
  } catch (error) {
    console.error('❌ Simulation failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
