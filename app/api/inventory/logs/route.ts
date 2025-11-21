import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateLogTag } from "@/lib/utils";
import { LogPurchaseSchema, validateInput } from "@/lib/validation";
import { nanoid } from "nanoid";
import { ratelimit } from "@/lib/ratelimit";
import { inventoryLedger } from "@/lib/inventory-ledger";

/**
 * POST /api/inventory/logs
 *
 * Create new log purchase with:
 * - Rate limiting (10 requests per 10 seconds)
 * - Input validation (prevents injection, overflow, negative values)
 * - Database transactions (atomic operations)
 * - Race condition prevention (unique constraint + retry)
 * - Audit logging
 *
 * Security: Requires authentication + RBAC (enforced by middleware)
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================================================
    // PHASE 1.4: RATE LIMITING
    // ========================================================================
    const identifier =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.ip ||
      "unknown";

    const { success, limit, remaining, reset } = await ratelimit.limit(
      `inventory:${identifier}`
    );

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);

      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
          limit,
          remaining: 0,
          resetAt: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": String(remaining),
            "X-RateLimit-Reset": new Date(reset).toISOString(),
          },
        }
      );
    }

    // Parse request body
    const rawData = await request.json();

    // ========================================================================
    // PHASE 1.2: INPUT VALIDATION
    // ========================================================================
    const validation = validateInput(LogPurchaseSchema, rawData);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Get nilaiDasar from request or use default
    const nilaiDasar = data.nilaiDasar ?? 785;

    // Recalculate kubikasi server-side (don't trust client)
    const diameter = data.lingkarCm / 4;
    const kubikasiTotal =
      ((diameter * diameter * data.panjangM * nilaiDasar) / 10000) *
      data.jumlahLog;
    const kubikasiFinal = Math.floor(kubikasiTotal);
    const totalCost = kubikasiFinal * data.hargaPerKubik;

    // Validate calculated values match client (within 1% tolerance)
    if (data.kubikasiFinal) {
      const diff = Math.abs(data.kubikasiFinal - kubikasiFinal);
      if (diff > kubikasiFinal * 0.01) {
        return NextResponse.json(
          {
            error: "Calculation mismatch",
            details: [
              `Client calculated ${data.kubikasiFinal} m³ but server calculated ${kubikasiFinal} m³`,
            ],
          },
          { status: 400 }
        );
      }
    }

    // ========================================================================
    // PHASE 1.5: DATABASE TRANSACTION (Atomic Operation)
    // ========================================================================
    const result = await prisma.$transaction(
      async (tx) => {
        // Get wood type and supplier
        const [woodType, supplier] = await Promise.all([
          tx.woodType.findUnique({ where: { id: data.woodTypeId } }),
          tx.supplier.findUnique({ where: { id: data.supplierId } }),
        ]);

        if (!woodType || !supplier) {
          throw new Error("Wood type or supplier not found");
        }

        // ====================================================================
        // PHASE 1.6: FIX RACE CONDITION in Log Tag Generation
        // ====================================================================
        // Use optimistic locking with retry and unique ID suffix
        const purchaseDate = new Date(data.purchaseDate);
        const dateStr = purchaseDate.toISOString().split("T")[0];

        let logTag: string;
        let sequence = 1;
        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
          // Get count for sequence (within transaction for isolation)
          const existingLogs = await tx.logInventory.findMany({
            where: {
              woodTypeId: data.woodTypeId,
              supplierId: data.supplierId,
              purchaseDate: {
                gte: new Date(dateStr),
                lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
              },
            },
            select: { logTag: true },
          });

          sequence = existingLogs.length + 1;

          // Generate log tag with unique suffix to prevent duplicates
          const baseTag = generateLogTag(
            woodType.woodCode,
            supplier.supplierCode,
            purchaseDate,
            sequence
          );

          // Add nano ID suffix for uniqueness in high-concurrency scenarios
          logTag = `${baseTag}-${nanoid(6).toUpperCase()}`;

          // Check if this exact tag exists
          const exists = await tx.logInventory.findUnique({
            where: { logTag },
          });

          if (!exists) {
            break; // Success - unique tag found
          }

          attempts++;
          if (attempts >= maxAttempts) {
            throw new Error("Failed to generate unique log tag after 10 attempts");
          }
        }

        // Create log inventory
        const log = await tx.logInventory.create({
          data: {
            logTag: logTag!,
            woodTypeId: data.woodTypeId,
            supplierId: data.supplierId,
            purchaseDate,
            lingkarCm: data.lingkarCm,
            panjangM: data.panjangM,
            jumlahLog: data.jumlahLog,
            kubikasiTotal,
            kubikasiFinal,
            hargaPerKubik: data.hargaPerKubik,
            totalCost,
            status: "Available",
            remainingKubikasi: kubikasiFinal,
          },
        });

        // Update or create inventory valuation
        const today = new Date(dateStr);

        const existingValuation = await tx.inventoryValuation.findUnique({
          where: {
            woodTypeId_valuationDate: {
              woodTypeId: data.woodTypeId,
              valuationDate: today,
            },
          },
        });

        if (existingValuation) {
          // Update existing valuation
          const newClosingKubikasi =
            existingValuation.closingKubikasi + kubikasiFinal;
          const newClosingValue = existingValuation.closingValue + totalCost;
          const newWac =
            newClosingKubikasi > 0 ? newClosingValue / newClosingKubikasi : 0;

          await tx.inventoryValuation.update({
            where: { id: existingValuation.id },
            data: {
              purchaseKubikasi: existingValuation.purchaseKubikasi + kubikasiFinal,
              purchaseValue: existingValuation.purchaseValue + totalCost,
              closingKubikasi: newClosingKubikasi,
              closingValue: newClosingValue,
              wacPerKubik: newWac,
            },
          });
        } else {
          // Get previous day's valuation for opening balance
          const previousValuation = await tx.inventoryValuation.findFirst({
            where: {
              woodTypeId: data.woodTypeId,
              valuationDate: { lt: today },
            },
            orderBy: { valuationDate: "desc" },
          });

          const openingKubikasi = previousValuation?.closingKubikasi || 0;
          const openingValue = previousValuation?.closingValue || 0;

          const closingKubikasi = openingKubikasi + kubikasiFinal;
          const closingValue = openingValue + totalCost;
          const wac = closingKubikasi > 0 ? closingValue / closingKubikasi : 0;

          await tx.inventoryValuation.create({
            data: {
              woodTypeId: data.woodTypeId,
              valuationDate: today,
              openingKubikasi,
              openingValue,
              purchaseKubikasi: kubikasiFinal,
              purchaseValue: totalCost,
              consumedKubikasi: 0,
              consumedValue: 0,
              closingKubikasi,
              closingValue,
              wacPerKubik: wac,
            },
          });
        }

        // ====================================================================
        // PHASE 3.3: AUDIT LOGGING
        // ====================================================================
        const ipAddress =
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown";
        const userAgent = request.headers.get("user-agent") || "unknown";

        await tx.auditLog.create({
          data: {
            userId: null, // TODO: Add after authentication
            action: "CREATE",
            entity: "LogInventory",
            entityId: log.logTag,
            changes: JSON.stringify({
              woodType: woodType.woodName,
              supplier: supplier.supplierName,
              kubikasi: kubikasiFinal,
              cost: totalCost,
            }),
            userAgent,
          },
        });

        // ====================================================================
        // PHASE 4: INVENTORY LEDGER
        // ====================================================================
        await inventoryLedger.recordEntry(
          {
            woodTypeId: data.woodTypeId,
            transactionDate: purchaseDate,
            type: "IN",
            category: "PURCHASE",
            referenceId: log.logTag,
            kubikasiChange: kubikasiFinal,
            notes: `Purchase from ${supplier.supplierName}`,
          },
          tx
        );

        return log;
      },
      {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
        isolationLevel: "Serializable", // Strongest isolation
      }
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    // ========================================================================
    // SECURE ERROR HANDLING
    // ========================================================================
    console.error("[API] Log purchase error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    // Never expose internal errors to client
    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { error: "Invalid wood type or supplier" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("Validation")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Generic error response
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") || "20"),
      100
    );
    const skip = (page - 1) * pageSize;

    const woodTypeId = searchParams.get("woodTypeId");
    const supplierId = searchParams.get("supplierId");
    const status = searchParams.get("status");

    const where = {
      ...(woodTypeId && { woodTypeId: parseInt(woodTypeId) }),
      ...(supplierId && { supplierId: parseInt(supplierId) }),
      ...(status && { status }),
    };

    const [logs, total] = await Promise.all([
      prisma.logInventory.findMany({
        where,
        include: {
          woodType: true,
          supplier: true,
        },
        orderBy: { purchaseDate: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.logInventory.count({ where }),
    ]);

    return NextResponse.json({
      data: logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("[API] Log inventory fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory" },
      { status: 500 }
    );
  }
}
