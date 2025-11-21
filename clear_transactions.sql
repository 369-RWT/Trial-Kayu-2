-- ============================================================================
-- CLEAR TRANSACTION DATA (Operational Data)
-- ============================================================================
-- Deleting in reverse order of dependencies to avoid foreign key constraint violations

-- 1. Audit Logs (References Users)
DELETE FROM "audit_logs";

-- 2. Supplier Performance (References Suppliers, WoodTypes)
DELETE FROM "supplier_wood_performances";

-- 3. Waste Deviations (References BatchLineItems, LogInventory, WoodTypes, Suppliers, Workers)
DELETE FROM "waste_deviations";

-- 4. Production Outputs (References BatchLineItems, WoodTypes, Products)
DELETE FROM "production_outputs";

-- 5. Log Consumptions (References BatchLineItems, LogInventory, WoodTypes, Suppliers)
DELETE FROM "log_consumptions";

-- 6. Batch Line Items (References ProductionBatches, WoodTypes, Products, Workers, MachineTypes)
DELETE FROM "batch_line_items";

-- 7. Production Batches (Parent of BatchLineItems)
DELETE FROM "production_batches";

-- 8. Inventory Ledgers (References WoodTypes)
DELETE FROM "inventory_ledger";

-- 9. Inventory Valuations (References WoodTypes)
DELETE FROM "inventory_valuations";

-- 10. Log Inventory (References WoodTypes, Suppliers)
DELETE FROM "log_inventory";

-- ============================================================================
-- OPTIONAL: CLEAR MASTER DATA (Uncomment if needed)
-- ============================================================================

-- DELETE FROM "sessions";
-- DELETE FROM "users";
-- DELETE FROM "system_config";
-- DELETE FROM "product_pricing";
-- DELETE FROM "workers";
-- DELETE FROM "products";
-- DELETE FROM "machine_types";
-- DELETE FROM "suppliers";
-- DELETE FROM "wood_types";
