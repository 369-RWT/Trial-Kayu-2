/**
 * Zod Validation Schemas for Al Fath Kayu Costing System
 *
 * All API inputs MUST be validated through these schemas to prevent:
 * - SQL Injection
 * - Integer Overflow
 * - Negative Value Injection
 * - Type Confusion
 * - NaN/Infinity propagation
 */

import { z } from "zod";

// ============================================================================
// LOG PURCHASE VALIDATION
// ============================================================================

export const LogPurchaseSchema = z.object({
  woodTypeId: z
    .number()
    .int("Wood type must be an integer")
    .positive("Wood type ID must be positive")
    .max(1000, "Invalid wood type ID"),

  supplierId: z
    .number()
    .int("Supplier must be an integer")
    .positive("Supplier ID must be positive")
    .max(1000, "Invalid supplier ID"),

  purchaseDate: z
    .string()
    .datetime("Invalid date format")
    .or(z.date()),

  lingkarCm: z
    .number()
    .min(1, "Lingkar must be at least 1 cm")
    .max(1000, "Lingkar cannot exceed 1000 cm")
    .finite("Lingkar must be a finite number"),

  panjangM: z
    .number()
    .min(0.1, "Panjang must be at least 0.1 m")
    .max(100, "Panjang cannot exceed 100 m")
    .finite("Panjang must be a finite number"),

  jumlahLog: z
    .number()
    .int("Jumlah log must be an integer")
    .min(1, "Must have at least 1 log")
    .max(10000, "Cannot exceed 10,000 logs per purchase"),

  hargaPerKubik: z
    .number()
    .min(1000, "Price must be at least Rp 1,000/m³")
    .max(1000000000, "Price cannot exceed Rp 1,000,000,000/m³")
    .finite("Price must be a finite number"),

  nilaiDasar: z
    .number()
    .min(1, "Nilai dasar must be positive")
    .max(10000, "Nilai dasar cannot exceed 10,000")
    .default(785)
    .optional(),

  kubikasiTotal: z
    .number()
    .positive("Kubikasi total must be positive")
    .finite("Kubikasi total must be finite")
    .optional(),

  kubikasiFinal: z
    .number()
    .int("Kubikasi final must be an integer")
    .positive("Kubikasi final must be positive")
    .max(1000000, "Kubikasi final cannot exceed 1,000,000 m³")
    .optional(),

  totalCost: z
    .number()
    .positive("Total cost must be positive")
    .max(100000000000000, "Total cost exceeds maximum")
    .finite("Total cost must be finite")
    .optional(),
});

export type LogPurchaseInput = z.infer<typeof LogPurchaseSchema>;

// ============================================================================
// PRODUCTION BATCH VALIDATION
// ============================================================================

export const BatchLineItemSchema = z.object({
  woodTypeId: z.number().int().positive(),
  productId: z.number().int().positive(),
  targetKubikasi: z.number().positive().max(100000),
  workerId: z.number().int().positive().optional(),
  machineTypeId: z.number().int().positive().optional(),
});

export const ProductionBatchSchema = z.object({
  productionDate: z.string().datetime().or(z.date()),
  shift: z.number().int().min(1).max(3),
  lineItems: z
    .array(BatchLineItemSchema)
    .min(1, "Batch must have at least one line item")
    .max(50, "Batch cannot exceed 50 line items"),
});

export type ProductionBatchInput = z.infer<typeof ProductionBatchSchema>;

// ============================================================================
// WASTE DEVIATION VALIDATION
// ============================================================================

export const WasteDeviationSchema = z.object({
  batchLineId: z.number().int().positive(),
  logTag: z.string().regex(/^[A-Z]{2}-[A-Z0-9]+-\d{8}-\d{3}$/, "Invalid log tag format"),
  wasteType: z.enum(["Bent", "Hollow", "Crack", "Method"]),
  kubikasiWaste: z.number().positive().max(10000),
  disposition: z.enum(["Scrap", "Resale", "Alternative"]),
  recoveryValue: z.number().min(0).max(1000000000).default(0),
  notes: z.string().max(500).optional(),
});

export type WasteDeviationInput = z.infer<typeof WasteDeviationSchema>;

// ============================================================================
// AUTHENTICATION VALIDATION
// ============================================================================

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number"
    ),
  role: z.enum(["ADMIN", "MANAGER", "OPERATOR", "VIEWER"]).default("VIEWER"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;

// ============================================================================
// MASTER DATA VALIDATION
// ============================================================================

export const WoodTypeSchema = z.object({
  woodCode: z.string().length(2, "Wood code must be 2 characters").toUpperCase(),
  woodName: z.string().min(2).max(50),
  avgWasteRate: z.number().min(0).max(100),
  isActive: z.boolean().default(true),
});

export const SupplierSchema = z.object({
  supplierCode: z.string().min(3).max(20).toUpperCase(),
  supplierName: z.string().min(2).max(100),
  contactPerson: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  paymentTerms: z.string().max(100).optional(),
  isActive: z.boolean().default(true),
});

export const ProductSchema = z.object({
  productCode: z.string().min(2).max(20).toUpperCase(),
  productName: z.string().min(2).max(100),
  machineTypeId: z.number().int().positive().optional(),
  standardWasteRate: z.number().min(0).max(100).default(0),
  isActive: z.boolean().default(true),
});

export const ProductPricingSchema = z.object({
  productId: z.number().int().positive(),
  woodTypeId: z.number().int().positive(),
  sellingPricePerKubik: z.number().positive().max(1000000000),
  effectiveDate: z.string().datetime().or(z.date()),
  isActive: z.boolean().default(true),
});

// ============================================================================
// QUERY PARAMETER VALIDATION
// ============================================================================

export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const DateRangeSchema = z.object({
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
});

export const LogInventoryQuerySchema = z.object({
  woodTypeId: z.number().int().positive().optional(),
  supplierId: z.number().int().positive().optional(),
  status: z.enum(["Available", "Partial", "Consumed"]).optional(),
  ...PaginationSchema.shape,
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Safely parse and validate input with detailed error messages
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.errors.map((err) => {
    const path = err.path.join(".");
    return `${path}: ${err.message}`;
  });

  return { success: false, errors };
}

/**
 * Middleware helper for API route validation
 */
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (data: unknown): T => {
    const result = validateInput(schema, data);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.errors.join(", ")}`);
    }
    return result.data;
  };
}
