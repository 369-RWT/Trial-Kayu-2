import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addLogPurchases() {
  console.log('🌳 Adding large log purchases to inventory...\n');

  // Get wood types and suppliers
  const woodTypes = await prisma.woodType.findMany();
  const suppliers = await prisma.supplier.findMany();

  if (woodTypes.length === 0 || suppliers.length === 0) {
    throw new Error('No wood types or suppliers found');
  }

  let totalLogs = 0;
  let totalValue = 0;

  // For 3 months of production (90 days), 100 products/day, 4 wood types
  // Estimate: ~0.03 m³ per product, with 15% waste = ~0.035 m³ input needed
  // Total needed: 90 days × 100 products × 0.035 m³ = 315 m³
  // Per wood type: 315 / 4 = ~79 m³ per wood type
  // Add buffer: 100 m³ per wood type to be safe
  // Distribute across multiple logs: ~20 logs per wood type, ~5 m³ each

  const logsPerWoodType = 20;
  const kubikasiPerLog = 5.0; // m³

  for (const woodType of woodTypes) {
    console.log(`📦 Adding logs for ${woodType.woodName} (${woodType.woodCode})...`);

    for (let i = 0; i < logsPerWoodType; i++) {
      // Rotate through suppliers
      const supplier = suppliers[i % suppliers.length];

      // Random variation in volume (4.5 - 5.5 m³)
      const kubikasi = kubikasiPerLog + (Math.random() - 0.5);

      // Calculate log dimensions
      // Assuming average log: 100cm circumference, 4-5m length, 1 log
      const lingkarCm = 90 + Math.random() * 20; // 90-110 cm
      const panjangM = 4 + Math.random() * 2; // 4-6 m
      const jumlahLog = 1;
      
      // Calculate kubikasi using formula: (Lingkar² × Panjang) / (4 × π) ÷ 10000
      const kubikasiTotal = (lingkarCm * lingkarCm * panjangM) / (4 * Math.PI * 10000);
      const kubikasiFinal = Math.floor(kubikasiTotal * 100) / 100; // Round down to 2 decimals

      // Price per m³ with some variation
      const basePricePerM3 = 3500000 + Math.random() * 500000; // Rp 3.5M - 4M per m³
      const totalPrice = kubikasiFinal * basePricePerM3;

      // Generate log tag
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const existingLogs = await prisma.logInventory.count({
        where: {
          logTag: { startsWith: `${woodType.woodCode}-SUP0${(i % 3) + 1}-${dateStr}` },
        },
      });
      const logTag = `${woodType.woodCode}-SUP0${(i % 3) + 1}-${dateStr}-LT${String(existingLogs + 1).padStart(2, '0')}`;

      // Create log purchase
      await prisma.logInventory.create({
        data: {
          logTag,
          woodTypeId: woodType.id,
          supplierId: supplier.id,
          purchaseDate: new Date(),
          lingkarCm,
          panjangM,
          jumlahLog,
          kubikasiTotal,
          kubikasiFinal,
          hargaPerKubik: basePricePerM3,
          totalCost: totalPrice,
          remainingKubikasi: kubikasiFinal,
          status: 'AVAILABLE',
        },
      });

      totalLogs++;
      totalValue += totalPrice;

      if ((i + 1) % 5 === 0) {
        console.log(`  ✓ Added ${i + 1}/${logsPerWoodType} logs`);
      }
    }

    console.log(`  ✅ Completed ${woodType.woodCode}: ${logsPerWoodType} logs, ~${(logsPerWoodType * kubikasiPerLog).toFixed(1)} m³\n`);
  }

  console.log('=' .repeat(80));
  console.log('PURCHASE SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total logs added: ${totalLogs}`);
  console.log(`Total volume: ~${(totalLogs * kubikasiPerLog).toFixed(1)} m³`);
  console.log(`Total value: Rp ${totalValue.toLocaleString('id-ID')}`);
  console.log('='.repeat(80));
  console.log('\n✅ Log purchases completed successfully!');
}

async function main() {
  try {
    await addLogPurchases();
  } catch (error) {
    console.error('❌ Failed to add log purchases:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
