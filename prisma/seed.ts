import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // =========================================================================
  // CLEAR EXISTING DATA (Optional - for clean seeding)
  // =========================================================================
  console.log('\n🗑️  Clearing existing data...');

  await prisma.auditLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.systemConfig.deleteMany({});
  await prisma.supplierWoodPerformance.deleteMany({});
  await prisma.wasteDeviation.deleteMany({});
  await prisma.productionOutput.deleteMany({});
  await prisma.logConsumption.deleteMany({});
  await prisma.batchLineItem.deleteMany({});
  await prisma.productionBatch.deleteMany({});
  await prisma.inventoryLedger.deleteMany({});
  await prisma.inventoryValuation.deleteMany({});
  await prisma.logInventory.deleteMany({});
  await prisma.productPricing.deleteMany({});
  await prisma.worker.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.machineType.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.woodType.deleteMany({});

  console.log('✓ Cleared existing data\n');

  // =========================================================================
  // CREATE DEFAULT USERS (ADMIN, MANAGER, OPERATOR, VIEWER)
  // =========================================================================
  console.log('👤 Creating default users...');

  const defaultUsers = [
    {
      email: 'admin@alfathkayu.com',
      name: 'System Administrator',
      role: 'ADMIN',
      password: 'Admin123!',
    },
    {
      email: 'manager@alfathkayu.com',
      name: 'Test Manager',
      role: 'MANAGER',
      password: 'Manager123!',
    },
    {
      email: 'operator@alfathkayu.com',
      name: 'Test Operator',
      role: 'OPERATOR',
      password: 'Operator123!',
    },
    {
      email: 'viewer@alfathkayu.com',
      name: 'Test Viewer',
      role: 'VIEWER',
      password: 'Viewer123!',
    },
  ];

  const users = [];

  for (const userData of defaultUsers) {
    const passwordHash = await bcrypt.hash(userData.password, 12);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        passwordHash,
        role: userData.role,
        isActive: true,
      },
    });

    users.push({ ...userData, id: user.id });
  }

  console.log(`✓ Created ${users.length} users\n`);
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    🔐 DEFAULT USER CREDENTIALS                 ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');

  for (const user of users) {
    console.log('║                                                                ║');
    console.log(`║  Role: ${user.role.padEnd(54)}║`);
    console.log(`║  Email: ${user.email.padEnd(53)}║`);
    console.log(`║  Password: ${user.password.padEnd(50)}║`);
    console.log('║                                                                ║');
    if (user.role === 'ADMIN') {
      console.log('║  ⚠️  SECURITY WARNING: CHANGE PASSWORD IMMEDIATELY!           ║');
      console.log('║                                                                ║');
    }
    console.log('╠════════════════════════════════════════════════════════════════╣');
  }

  console.log('║  Access the system at: http://localhost:3000/auth/signin      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');

  // =========================================================================
  // SYSTEM CONFIGURATION
  // =========================================================================
  console.log('⚙️  Creating system configuration...');

  const systemConfigs = [
    {
      key: 'KUBIKASI_ROUNDING_METHOD',
      value: 'FLOOR',
      dataType: 'STRING',
      category: 'CALCULATION',
      description: 'Method for rounding kubikasi calculations (FLOOR, CEIL, ROUND)',
    },
    {
      key: 'DEFAULT_WASTE_ALLOCATION_METHOD',
      value: 'PROPORTIONAL',
      dataType: 'STRING',
      category: 'CALCULATION',
      description: 'Default method for waste cost allocation',
    },
    {
      key: 'SESSION_TIMEOUT_MINUTES',
      value: '60',
      dataType: 'NUMBER',
      category: 'SECURITY',
      description: 'Session timeout in minutes',
    },
    {
      key: 'PASSWORD_MIN_LENGTH',
      value: '8',
      dataType: 'NUMBER',
      category: 'SECURITY',
      description: 'Minimum password length',
    },
    {
      key: 'ENABLE_AUDIT_LOGGING',
      value: 'true',
      dataType: 'BOOLEAN',
      category: 'SECURITY',
      description: 'Enable comprehensive audit logging',
    },
    {
      key: 'COMPANY_NAME',
      value: 'Al Fath Kayu',
      dataType: 'STRING',
      category: 'GENERAL',
      description: 'Company name for reports and documents',
    },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.create({ data: config });
  }

  console.log(`✓ Created ${systemConfigs.length} system configuration entries`);

  // =========================================================================
  // MASTER DATA
  // =========================================================================

  // Create Wood Types
  const woodTypes = await Promise.all([
    prisma.woodType.create({
      data: {
        woodCode: 'JT',
        woodName: 'Jati',
        avgWasteRate: 12.3,
        isActive: true,
      },
    }),
    prisma.woodType.create({
      data: {
        woodCode: 'MR',
        woodName: 'Meranti',
        avgWasteRate: 22.3,
        isActive: true,
      },
    }),
    prisma.woodType.create({
      data: {
        woodCode: 'MH',
        woodName: 'Mahoni',
        avgWasteRate: 18.0,
        isActive: true,
      },
    }),
    prisma.woodType.create({
      data: {
        woodCode: 'SG',
        woodName: 'Sengon',
        avgWasteRate: 28.0,
        isActive: true,
      },
    }),
    prisma.woodType.create({
      data: {
        woodCode: 'KP',
        woodName: 'Kamper',
        avgWasteRate: 14.3,
        isActive: true,
      },
    }),
  ]);

  console.log(`✓ Created ${woodTypes.length} wood types`);

  // Create Suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        supplierCode: 'SUP01',
        supplierName: 'PT Kayu Nusantara',
        contactPerson: 'Budi Santoso',
        phone: '08123456789',
        address: 'Jl. Industri No. 123, Jakarta',
        paymentTerms: 'Net 30',
        isActive: true,
      },
    }),
    prisma.supplier.create({
      data: {
        supplierCode: 'SUP02',
        supplierName: 'CV Sumber Kayu',
        contactPerson: 'Andi Wijaya',
        phone: '08198765432',
        address: 'Jl. Raya Bogor KM 45',
        paymentTerms: 'Net 45',
        isActive: true,
      },
    }),
    prisma.supplier.create({
      data: {
        supplierCode: 'SUP03',
        supplierName: 'UD Hutan Jaya',
        contactPerson: 'Siti Nurhaliza',
        phone: '08111222333',
        address: 'Jl. Kalimantan No. 88',
        paymentTerms: 'Cash',
        isActive: true,
      },
    }),
  ]);

  console.log(`✓ Created ${suppliers.length} suppliers`);

  // Create Machine Types
  const machines = await Promise.all([
    prisma.machineType.create({
      data: {
        machineName: 'Bandsaw Machine 1',
        description: 'High precision bandsaw for premium cuts',
        isActive: true,
      },
    }),
    prisma.machineType.create({
      data: {
        machineName: 'Circular Saw Machine 2',
        description: 'Heavy-duty circular saw for structural beams',
        isActive: true,
      },
    }),
    prisma.machineType.create({
      data: {
        machineName: 'Panel Saw Machine 3',
        description: 'Panel saw for board production',
        isActive: true,
      },
    }),
  ]);

  console.log(`✓ Created ${machines.length} machine types`);

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        productCode: 'HBEAM',
        productName: 'Horizontal Beams',
        machineTypeId: machines[0].id,
        standardWasteRate: 15.0,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'BSTRUK',
        productName: 'Balok Struktural',
        machineTypeId: machines[1].id,
        standardWasteRate: 20.0,
        isActive: true,
      },
    }),
    prisma.product.create({
      data: {
        productCode: 'PCOR',
        productName: 'Papan Cor',
        machineTypeId: machines[2].id,
        standardWasteRate: 25.0,
        isActive: true,
      },
    }),
  ]);

  console.log(`✓ Created ${products.length} products`);

  // Create Workers
  const workers = await Promise.all([
    prisma.worker.create({
      data: {
        workerCode: 'WKR001',
        workerName: 'Agus Setiawan',
        phone: '08123456001',
        position: 'Senior Operator',
        isActive: true,
      },
    }),
    prisma.worker.create({
      data: {
        workerCode: 'WKR002',
        workerName: 'Dedi Prasetyo',
        phone: '08123456002',
        position: 'Operator',
        isActive: true,
      },
    }),
    prisma.worker.create({
      data: {
        workerCode: 'WKR003',
        workerName: 'Eko Susanto',
        phone: '08123456003',
        position: 'Junior Operator',
        isActive: true,
      },
    }),
  ]);

  console.log(`✓ Created ${workers.length} workers`);

  // Create Product Pricing Matrix (Product × Wood Type)
  const pricingData = [
    // Horizontal Beams
    { productId: products[0].id, woodTypeId: woodTypes[0].id, price: 5500000 }, // Jati
    { productId: products[0].id, woodTypeId: woodTypes[1].id, price: 3800000 }, // Meranti
    { productId: products[0].id, woodTypeId: woodTypes[2].id, price: 4200000 }, // Mahoni
    { productId: products[0].id, woodTypeId: woodTypes[3].id, price: 2500000 }, // Sengon
    { productId: products[0].id, woodTypeId: woodTypes[4].id, price: 4500000 }, // Kamper

    // Balok Struktural
    { productId: products[1].id, woodTypeId: woodTypes[0].id, price: 5200000 },
    { productId: products[1].id, woodTypeId: woodTypes[1].id, price: 3500000 },
    { productId: products[1].id, woodTypeId: woodTypes[2].id, price: 4000000 },
    { productId: products[1].id, woodTypeId: woodTypes[3].id, price: 2300000 },
    { productId: products[1].id, woodTypeId: woodTypes[4].id, price: 4300000 },

    // Papan Cor
    { productId: products[2].id, woodTypeId: woodTypes[0].id, price: 4800000 },
    { productId: products[2].id, woodTypeId: woodTypes[1].id, price: 3200000 },
    { productId: products[2].id, woodTypeId: woodTypes[2].id, price: 3700000 },
    { productId: products[2].id, woodTypeId: woodTypes[3].id, price: 2000000 },
    { productId: products[2].id, woodTypeId: woodTypes[4].id, price: 3900000 },
  ];

  const effectiveDate = new Date('2024-11-01');

  for (const pricing of pricingData) {
    await prisma.productPricing.create({
      data: {
        productId: pricing.productId,
        woodTypeId: pricing.woodTypeId,
        sellingPricePerKubik: pricing.price,
        effectiveDate,
        isActive: true,
      },
    });
  }

  console.log(`✓ Created ${pricingData.length} product pricing entries`);

  // =========================================================================
  // LOG INVENTORY & LEDGERS
  // =========================================================================

  const currentDate = new Date('2024-11-02');

  const logs = await Promise.all([
    // Jati logs
    prisma.logInventory.create({
      data: {
        logTag: 'JT-SUP01-20241102-001',
        woodTypeId: woodTypes[0].id,
        supplierId: suppliers[0].id,
        purchaseDate: currentDate,
        lingkarCm: 125.0,
        panjangM: 4.5,
        jumlahLog: 8,
        kubikasiTotal: 100.234,
        kubikasiFinal: 100.0,
        hargaPerKubik: 4000000,
        totalCost: 400000000,
        status: 'Available',
        remainingKubikasi: 100.0,
      },
    }),

    // Meranti logs
    prisma.logInventory.create({
      data: {
        logTag: 'MR-SUP03-20241101-001',
        woodTypeId: woodTypes[1].id,
        supplierId: suppliers[2].id,
        purchaseDate: new Date('2024-11-01'),
        lingkarCm: 140.0,
        panjangM: 5.0,
        jumlahLog: 6,
        kubikasiTotal: 85.567,
        kubikasiFinal: 85.0,
        hargaPerKubik: 2500000,
        totalCost: 212500000,
        status: 'Available',
        remainingKubikasi: 85.0,
      },
    }),

    // Mahoni logs
    prisma.logInventory.create({
      data: {
        logTag: 'MH-SUP02-20241028-001',
        woodTypeId: woodTypes[2].id,
        supplierId: suppliers[1].id,
        purchaseDate: new Date('2024-10-28'),
        lingkarCm: 130.0,
        panjangM: 4.8,
        jumlahLog: 7,
        kubikasiTotal: 95.123,
        kubikasiFinal: 95.0,
        hargaPerKubik: 3200000,
        totalCost: 304000000,
        status: 'Available',
        remainingKubikasi: 95.0,
      },
    }),

    // Sengon logs
    prisma.logInventory.create({
      data: {
        logTag: 'SG-SUP01-20241102-001',
        woodTypeId: woodTypes[3].id,
        supplierId: suppliers[0].id,
        purchaseDate: currentDate,
        lingkarCm: 150.0,
        panjangM: 5.5,
        jumlahLog: 10,
        kubikasiTotal: 150.891,
        kubikasiFinal: 150.0,
        hargaPerKubik: 1800000,
        totalCost: 270000000,
        status: 'Available',
        remainingKubikasi: 150.0,
      },
    }),

    // Kamper logs
    prisma.logInventory.create({
      data: {
        logTag: 'KP-SUP02-20241101-001',
        woodTypeId: woodTypes[4].id,
        supplierId: suppliers[1].id,
        purchaseDate: new Date('2024-11-01'),
        lingkarCm: 120.0,
        panjangM: 4.0,
        jumlahLog: 5,
        kubikasiTotal: 40.234,
        kubikasiFinal: 40.0,
        hargaPerKubik: 3500000,
        totalCost: 140000000,
        status: 'Available',
        remainingKubikasi: 40.0,
      },
    }),
  ]);

  console.log(`✓ Created ${logs.length} log inventory entries`);

  // Create Inventory Ledgers for purchases
  let ledgerCount = 0;
  for (const log of logs) {
    await prisma.inventoryLedger.create({
      data: {
        woodTypeId: log.woodTypeId,
        transactionDate: log.purchaseDate,
        type: 'IN',
        category: 'PURCHASE',
        referenceId: log.logTag,
        kubikasiChange: log.kubikasiFinal,
        runningBalance: log.kubikasiFinal,
        notes: `Purchase from supplier - ${log.jumlahLog} logs`,
      },
    });
    ledgerCount++;
  }

  console.log(`✓ Created ${ledgerCount} inventory ledger entries`);

  // Create Inventory Valuations for each wood type
  let valuationCount = 0;
  for (const woodType of woodTypes) {
    const woodLogs = logs.filter(log => log.woodTypeId === woodType.id);
    const totalKubikasi = woodLogs.reduce((sum, log) => sum + log.kubikasiFinal, 0);
    const totalValue = woodLogs.reduce((sum, log) => sum + log.totalCost, 0);
    const wac = totalKubikasi > 0 ? totalValue / totalKubikasi : 0;

    await prisma.inventoryValuation.create({
      data: {
        woodTypeId: woodType.id,
        valuationDate: currentDate,
        openingKubikasi: 0,
        openingValue: 0,
        purchaseKubikasi: totalKubikasi,
        purchaseValue: totalValue,
        consumedKubikasi: 0,
        consumedValue: 0,
        closingKubikasi: totalKubikasi,
        closingValue: totalValue,
        wacPerKubik: wac,
      },
    });
    valuationCount++;
  }

  console.log(`✓ Created ${valuationCount} inventory valuations`);

  // =========================================================================
  // PRODUCTION BATCHES & LINE ITEMS
  // =========================================================================

  console.log('\n🏭 Creating production batches...');

  const batch1 = await prisma.productionBatch.create({
    data: {
      id: 'B-20241103-001',
      productionDate: new Date('2024-11-03'),
      shift: 1,
      status: 'Completed',
    },
  });

  // Batch Line Item 1: Jati Horizontal Beams
  const batchLine1 = await prisma.batchLineItem.create({
    data: {
      batchId: batch1.id,
      lineNumber: 1,
      woodTypeId: woodTypes[0].id, // Jati
      productId: products[0].id, // Horizontal Beams
      targetKubikasi: 20.0,
      actualOutputKubikasi: 18.5,
      totalInputKubikasi: 22.0,
      totalWasteKubikasi: 3.5,
      wacPerKubik: 4000000,
      materialCostDirect: 74000000, // 18.5 * 4000000
      materialCostWaste: 14000000, // 3.5 * 4000000
      materialCostTotal: 88000000,
      materialCostPerKubik: 4756756.76, // 88000000 / 18.5
      workerId: workers[0].id,
      machineTypeId: machines[0].id,
      sellingPricePerKubik: 5500000,
    },
  });

  // Log Consumption for Batch Line 1
  await prisma.logConsumption.create({
    data: {
      batchLineId: batchLine1.id,
      logTag: logs[0].logTag, // JT log
      woodTypeId: woodTypes[0].id,
      supplierId: suppliers[0].id,
      purchaseDate: logs[0].purchaseDate,
      kubikasiConsumed: 22.0,
      wacPerKubik: 4000000,
      materialCost: 88000000,
    },
  });

  // Production Output for Batch Line 1
  await prisma.productionOutput.create({
    data: {
      batchLineId: batchLine1.id,
      woodTypeId: woodTypes[0].id,
      productId: products[0].id,
      kubikasiProduced: 18.5,
      materialCostDirect: 74000000,
      materialCostAllocatedWaste: 14000000,
      totalMaterialCost: 88000000,
    },
  });

  // Waste Deviation for Batch Line 1
  await prisma.wasteDeviation.create({
    data: {
      batchLineId: batchLine1.id,
      logTag: logs[0].logTag,
      woodTypeId: woodTypes[0].id,
      supplierId: suppliers[0].id,
      workerId: workers[0].id,
      wasteType: 'Crack',
      kubikasiWaste: 3.5,
      wasteCost: 14000000,
      disposition: 'Scrap',
      recoveryValue: 0,
      netWasteCost: 14000000,
      notes: 'Natural cracks found during processing',
    },
  });

  // Update log inventory
  await prisma.logInventory.update({
    where: { logTag: logs[0].logTag },
    data: {
      remainingKubikasi: logs[0].kubikasiFinal - 22.0,
      status: 'Partial',
    },
  });

  // Create inventory ledger for consumption
  await prisma.inventoryLedger.create({
    data: {
      woodTypeId: woodTypes[0].id,
      transactionDate: new Date('2024-11-03'),
      type: 'OUT',
      category: 'PRODUCTION',
      referenceId: batch1.id,
      kubikasiChange: -22.0,
      runningBalance: logs[0].kubikasiFinal - 22.0,
      notes: `Production batch ${batch1.id} - Line 1`,
    },
  });

  console.log('✓ Created production batch with line items, consumptions, and outputs');

  // =========================================================================
  // SUPPLIER PERFORMANCE
  // =========================================================================

  console.log('\n📊 Creating supplier performance metrics...');

  await prisma.supplierWoodPerformance.create({
    data: {
      supplierId: suppliers[0].id,
      woodTypeId: woodTypes[0].id,
      periodStart: new Date('2024-11-01'),
      periodEnd: new Date('2024-11-30'),
      totalKubikasi: 22.0,
      totalWasteKubikasi: 3.5,
      wasteRate: 15.91, // (3.5 / 22.0) * 100
      qualityScore: 85,
      bentWoodPct: 0,
      hollowCenterPct: 0,
      crackPct: 15.91,
    },
  });

  console.log('✓ Created supplier performance metrics');

  // =========================================================================
  // AUDIT LOGS
  // =========================================================================

  console.log('\n📝 Creating audit logs...');

  const auditLogs = [
    {
      userId: users[0].id,
      action: 'CREATE',
      entity: 'LogInventory',
      entityId: logs[0].logTag,
      changes: JSON.stringify({ kubikasiFinal: 100.0, status: 'Available' }),
      ipAddress: '127.0.0.1',
      userAgent: 'Seeder Script',
    },
    {
      userId: users[0].id,
      action: 'CREATE',
      entity: 'ProductionBatch',
      entityId: batch1.id,
      changes: JSON.stringify({ status: 'Completed', shift: 1 }),
      ipAddress: '127.0.0.1',
      userAgent: 'Seeder Script',
    },
    {
      userId: users[0].id,
      action: 'UPDATE',
      entity: 'LogInventory',
      entityId: logs[0].logTag,
      changes: JSON.stringify({
        remainingKubikasi: { from: 100.0, to: 78.0 },
        status: { from: 'Available', to: 'Partial' }
      }),
      ipAddress: '127.0.0.1',
      userAgent: 'Seeder Script',
    },
  ];

  for (const auditLog of auditLogs) {
    await prisma.auditLog.create({ data: auditLog });
  }

  console.log(`✓ Created ${auditLogs.length} audit log entries`);

  // =========================================================================
  // SUMMARY
  // =========================================================================

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ SEEDING COMPLETED                        ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║  Users: ${users.length.toString().padEnd(57)}║`);
  console.log(`║  Wood Types: ${woodTypes.length.toString().padEnd(52)}║`);
  console.log(`║  Suppliers: ${suppliers.length.toString().padEnd(53)}║`);
  console.log(`║  Products: ${products.length.toString().padEnd(54)}║`);
  console.log(`║  Workers: ${workers.length.toString().padEnd(55)}║`);
  console.log(`║  Machine Types: ${machines.length.toString().padEnd(49)}║`);
  console.log(`║  Product Pricing: ${pricingData.length.toString().padEnd(47)}║`);
  console.log(`║  Log Inventory: ${logs.length.toString().padEnd(49)}║`);
  console.log(`║  Inventory Ledgers: ${ledgerCount.toString().padEnd(45)}║`);
  console.log(`║  Inventory Valuations: ${valuationCount.toString().padEnd(42)}║`);
  console.log(`║  Production Batches: 1${' '.padEnd(44)}║`);
  console.log(`║  System Configs: ${systemConfigs.length.toString().padEnd(48)}║`);
  console.log(`║  Audit Logs: ${auditLogs.length.toString().padEnd(52)}║`);
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
