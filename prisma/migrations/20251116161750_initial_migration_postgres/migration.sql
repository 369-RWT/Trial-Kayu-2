-- CreateTable
CREATE TABLE "wood_types" (
    "id" SERIAL NOT NULL,
    "woodCode" TEXT NOT NULL,
    "woodName" TEXT NOT NULL,
    "avgWasteRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wood_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "supplierCode" TEXT NOT NULL,
    "supplierName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "paymentTerms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "productCode" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "machineTypeId" INTEGER,
    "standardWasteRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "machine_types" (
    "id" SERIAL NOT NULL,
    "machineName" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machine_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" SERIAL NOT NULL,
    "workerCode" TEXT NOT NULL,
    "workerName" TEXT NOT NULL,
    "phone" TEXT,
    "position" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_pricing" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "woodTypeId" INTEGER NOT NULL,
    "sellingPricePerKubik" DOUBLE PRECISION NOT NULL,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_inventory" (
    "id" SERIAL NOT NULL,
    "logTag" TEXT NOT NULL,
    "woodTypeId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "lingkarCm" DOUBLE PRECISION NOT NULL,
    "panjangM" DOUBLE PRECISION NOT NULL,
    "jumlahLog" INTEGER NOT NULL,
    "kubikasiTotal" DOUBLE PRECISION NOT NULL,
    "kubikasiFinal" DOUBLE PRECISION NOT NULL,
    "hargaPerKubik" DOUBLE PRECISION NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "remainingKubikasi" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "log_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_valuations" (
    "id" SERIAL NOT NULL,
    "woodTypeId" INTEGER NOT NULL,
    "valuationDate" TIMESTAMP(3) NOT NULL,
    "openingKubikasi" DOUBLE PRECISION NOT NULL,
    "openingValue" DOUBLE PRECISION NOT NULL,
    "purchaseKubikasi" DOUBLE PRECISION NOT NULL,
    "purchaseValue" DOUBLE PRECISION NOT NULL,
    "consumedKubikasi" DOUBLE PRECISION NOT NULL,
    "consumedValue" DOUBLE PRECISION NOT NULL,
    "closingKubikasi" DOUBLE PRECISION NOT NULL,
    "closingValue" DOUBLE PRECISION NOT NULL,
    "wacPerKubik" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_valuations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_batches" (
    "id" TEXT NOT NULL,
    "productionDate" TIMESTAMP(3) NOT NULL,
    "shift" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Planned',
    "createdById" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_line_items" (
    "id" SERIAL NOT NULL,
    "batchId" TEXT NOT NULL,
    "lineNumber" INTEGER NOT NULL,
    "woodTypeId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "targetKubikasi" DOUBLE PRECISION NOT NULL,
    "actualOutputKubikasi" DOUBLE PRECISION,
    "totalInputKubikasi" DOUBLE PRECISION,
    "totalWasteKubikasi" DOUBLE PRECISION,
    "wacPerKubik" DOUBLE PRECISION NOT NULL,
    "materialCostDirect" DOUBLE PRECISION,
    "materialCostWaste" DOUBLE PRECISION,
    "materialCostTotal" DOUBLE PRECISION,
    "materialCostPerKubik" DOUBLE PRECISION,
    "workerId" INTEGER,
    "machineTypeId" INTEGER,
    "sellingPricePerKubik" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batch_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_consumptions" (
    "id" SERIAL NOT NULL,
    "batchLineId" INTEGER NOT NULL,
    "logTag" TEXT NOT NULL,
    "woodTypeId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL,
    "kubikasiConsumed" DOUBLE PRECISION NOT NULL,
    "wacPerKubik" DOUBLE PRECISION NOT NULL,
    "materialCost" DOUBLE PRECISION NOT NULL,
    "consumptionTimestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "log_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_outputs" (
    "id" SERIAL NOT NULL,
    "batchLineId" INTEGER NOT NULL,
    "woodTypeId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "kubikasiProduced" DOUBLE PRECISION NOT NULL,
    "materialCostDirect" DOUBLE PRECISION NOT NULL,
    "materialCostAllocatedWaste" DOUBLE PRECISION NOT NULL,
    "totalMaterialCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_outputs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waste_deviations" (
    "id" SERIAL NOT NULL,
    "batchLineId" INTEGER NOT NULL,
    "logTag" TEXT NOT NULL,
    "consumptionId" INTEGER,
    "woodTypeId" INTEGER NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "workerId" INTEGER,
    "wasteType" TEXT NOT NULL,
    "kubikasiWaste" DOUBLE PRECISION NOT NULL,
    "wasteCost" DOUBLE PRECISION NOT NULL,
    "disposition" TEXT NOT NULL,
    "recoveryValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "netWasteCost" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "waste_deviations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_wood_performances" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "woodTypeId" INTEGER NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "totalKubikasi" DOUBLE PRECISION NOT NULL,
    "totalWasteKubikasi" DOUBLE PRECISION NOT NULL,
    "wasteRate" DOUBLE PRECISION NOT NULL,
    "qualityScore" INTEGER,
    "bentWoodPct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "hollowCenterPct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "crackPct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_wood_performances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "changes" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wood_types_woodCode_key" ON "wood_types"("woodCode");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_supplierCode_key" ON "suppliers"("supplierCode");

-- CreateIndex
CREATE UNIQUE INDEX "products_productCode_key" ON "products"("productCode");

-- CreateIndex
CREATE UNIQUE INDEX "machine_types_machineName_key" ON "machine_types"("machineName");

-- CreateIndex
CREATE UNIQUE INDEX "workers_workerCode_key" ON "workers"("workerCode");

-- CreateIndex
CREATE UNIQUE INDEX "product_pricing_productId_woodTypeId_effectiveDate_key" ON "product_pricing"("productId", "woodTypeId", "effectiveDate");

-- CreateIndex
CREATE UNIQUE INDEX "log_inventory_logTag_key" ON "log_inventory"("logTag");

-- CreateIndex
CREATE INDEX "log_inventory_woodTypeId_status_idx" ON "log_inventory"("woodTypeId", "status");

-- CreateIndex
CREATE INDEX "log_inventory_purchaseDate_idx" ON "log_inventory"("purchaseDate");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_valuations_woodTypeId_valuationDate_key" ON "inventory_valuations"("woodTypeId", "valuationDate");

-- CreateIndex
CREATE INDEX "production_batches_productionDate_status_idx" ON "production_batches"("productionDate", "status");

-- CreateIndex
CREATE INDEX "batch_line_items_woodTypeId_productId_idx" ON "batch_line_items"("woodTypeId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "batch_line_items_batchId_lineNumber_key" ON "batch_line_items"("batchId", "lineNumber");

-- CreateIndex
CREATE INDEX "log_consumptions_batchLineId_idx" ON "log_consumptions"("batchLineId");

-- CreateIndex
CREATE INDEX "log_consumptions_logTag_idx" ON "log_consumptions"("logTag");

-- CreateIndex
CREATE INDEX "waste_deviations_batchLineId_idx" ON "waste_deviations"("batchLineId");

-- CreateIndex
CREATE INDEX "waste_deviations_woodTypeId_wasteType_idx" ON "waste_deviations"("woodTypeId", "wasteType");

-- CreateIndex
CREATE UNIQUE INDEX "supplier_wood_performances_supplierId_woodTypeId_periodStar_key" ON "supplier_wood_performances"("supplierId", "woodTypeId", "periodStart", "periodEnd");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_isActive_idx" ON "users"("role", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_sessionToken_idx" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_action_idx" ON "audit_logs"("entity", "action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_machineTypeId_fkey" FOREIGN KEY ("machineTypeId") REFERENCES "machine_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_pricing" ADD CONSTRAINT "product_pricing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_pricing" ADD CONSTRAINT "product_pricing_woodTypeId_fkey" FOREIGN KEY ("woodTypeId") REFERENCES "wood_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_inventory" ADD CONSTRAINT "log_inventory_woodTypeId_fkey" FOREIGN KEY ("woodTypeId") REFERENCES "wood_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_inventory" ADD CONSTRAINT "log_inventory_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_valuations" ADD CONSTRAINT "inventory_valuations_woodTypeId_fkey" FOREIGN KEY ("woodTypeId") REFERENCES "wood_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_line_items" ADD CONSTRAINT "batch_line_items_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "production_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_line_items" ADD CONSTRAINT "batch_line_items_woodTypeId_fkey" FOREIGN KEY ("woodTypeId") REFERENCES "wood_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_line_items" ADD CONSTRAINT "batch_line_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_line_items" ADD CONSTRAINT "batch_line_items_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "batch_line_items" ADD CONSTRAINT "batch_line_items_machineTypeId_fkey" FOREIGN KEY ("machineTypeId") REFERENCES "machine_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_consumptions" ADD CONSTRAINT "log_consumptions_batchLineId_fkey" FOREIGN KEY ("batchLineId") REFERENCES "batch_line_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_consumptions" ADD CONSTRAINT "log_consumptions_logTag_fkey" FOREIGN KEY ("logTag") REFERENCES "log_inventory"("logTag") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_consumptions" ADD CONSTRAINT "log_consumptions_woodTypeId_fkey" FOREIGN KEY ("woodTypeId") REFERENCES "wood_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_consumptions" ADD CONSTRAINT "log_consumptions_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_outputs" ADD CONSTRAINT "production_outputs_batchLineId_fkey" FOREIGN KEY ("batchLineId") REFERENCES "batch_line_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_outputs" ADD CONSTRAINT "production_outputs_woodTypeId_fkey" FOREIGN KEY ("woodTypeId") REFERENCES "wood_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_outputs" ADD CONSTRAINT "production_outputs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_deviations" ADD CONSTRAINT "waste_deviations_batchLineId_fkey" FOREIGN KEY ("batchLineId") REFERENCES "batch_line_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_deviations" ADD CONSTRAINT "waste_deviations_logTag_fkey" FOREIGN KEY ("logTag") REFERENCES "log_inventory"("logTag") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_deviations" ADD CONSTRAINT "waste_deviations_woodTypeId_fkey" FOREIGN KEY ("woodTypeId") REFERENCES "wood_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_deviations" ADD CONSTRAINT "waste_deviations_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "waste_deviations" ADD CONSTRAINT "waste_deviations_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_wood_performances" ADD CONSTRAINT "supplier_wood_performances_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_wood_performances" ADD CONSTRAINT "supplier_wood_performances_woodTypeId_fkey" FOREIGN KEY ("woodTypeId") REFERENCES "wood_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
