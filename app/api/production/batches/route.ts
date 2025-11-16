import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ratelimit } from "@/lib/ratelimit";
import { z } from "zod";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const batchLineItemSchema = z.object({
  woodTypeId: z.number().int().positive(),
  productId: z.number().int().positive(),
  targetKubikasi: z.number().positive(),
  workerId: z.number().int().positive().optional(),
  machineTypeId: z.number().int().positive().optional(),
});

const createBatchSchema = z.object({
  productionDate: z.string().datetime(),
  shift: z.number().int().min(1).max(2),
  lineItems: z.array(batchLineItemSchema).min(1).max(20),
});

// ============================================================================
// GET: List production batches with filters
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (startDate || endDate) {
      where.productionDate = {};
      if (startDate) where.productionDate.gte = new Date(startDate);
      if (endDate) where.productionDate.lte = new Date(endDate);
    }

    // Fetch batches with pagination
    const [batches, total] = await Promise.all([
      prisma.productionBatch.findMany({
        where,
        include: {
          batchLineItems: {
            include: {
              woodType: true,
              product: true,
              worker: true,
              machineType: true,
            },
          },
        },
        orderBy: { productionDate: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.productionBatch.count({ where }),
    ]);

    return NextResponse.json({
      batches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching production batches:", error);
    return NextResponse.json(
      { error: "Failed to fetch production batches" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Create new production batch
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      request.ip ||
      "unknown";

    const { success, limit, remaining, reset } = await ratelimit.limit(
      `production:${identifier}`
    );

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: `Too many requests. Please try again in ${retryAfter} seconds.`,
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

    // Authentication & Authorization
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (!["ADMIN", "MANAGER", "OPERATOR"].includes(userRole)) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only ADMIN, MANAGER, or OPERATOR can create production batches",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createBatchSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { productionDate, shift, lineItems } = validation.data;

    // Generate batch ID: B-YYYYMMDD-XXX
    const prodDate = new Date(productionDate);
    const dateStr = prodDate.toISOString().split("T")[0].replace(/-/g, "");

    // Find the last batch for this date
    const lastBatch = await prisma.productionBatch.findFirst({
      where: {
        id: {
          startsWith: `B-${dateStr}`,
        },
      },
      orderBy: { id: "desc" },
    });

    let sequence = 1;
    if (lastBatch) {
      const lastSequence = parseInt(lastBatch.id.split("-")[2]);
      sequence = lastSequence + 1;
    }

    const batchId = `B-${dateStr}-${sequence.toString().padStart(3, "0")}`;

    // Create production batch with line items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the production batch
      const batch = await tx.productionBatch.create({
        data: {
          id: batchId,
          productionDate: prodDate,
          shift,
          status: "Planned",
          createdById: parseInt(session.user.id),
        },
      });

      // Calculate WAC for each wood type
      const woodTypeIds = [...new Set(lineItems.map((item) => item.woodTypeId))];
      const wacMap = new Map<number, number>();

      for (const woodTypeId of woodTypeIds) {
        // Get current inventory valuation for WAC
        const valuation = await tx.inventoryValuation.findFirst({
          where: { woodTypeId },
          orderBy: { valuationDate: "desc" },
        });

        if (valuation && valuation.closingKubikasi > 0) {
          wacMap.set(woodTypeId, valuation.wacPerKubik);
        } else {
          // Fallback: calculate from available logs
          const logs = await tx.logInventory.findMany({
            where: {
              woodTypeId,
              status: { in: ["Available", "Partial"] },
            },
          });

          const totalValue = logs.reduce(
            (sum, log) => sum + log.totalCost,
            0
          );
          const totalKubikasi = logs.reduce(
            (sum, log) => sum + log.remainingKubikasi,
            0
          );

          const wac = totalKubikasi > 0 ? totalValue / totalKubikasi : 0;
          wacMap.set(woodTypeId, wac);
        }
      }

      // Create batch line items
      const createdLineItems = await Promise.all(
        lineItems.map((item, index) =>
          tx.batchLineItem.create({
            data: {
              batchId: batch.id,
              lineNumber: index + 1,
              woodTypeId: item.woodTypeId,
              productId: item.productId,
              targetKubikasi: item.targetKubikasi,
              wacPerKubik: wacMap.get(item.woodTypeId) || 0,
              workerId: item.workerId,
              machineTypeId: item.machineTypeId,
            },
          })
        )
      );

      return { batch, lineItems: createdLineItems };
    });

    // Fetch complete batch with relations
    const completeBatch = await prisma.productionBatch.findUnique({
      where: { id: batchId },
      include: {
        batchLineItems: {
          include: {
            woodType: true,
            product: true,
            worker: true,
            machineType: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Production batch created successfully",
        batch: completeBatch,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating production batch:", error);
    return NextResponse.json(
      {
        error: "Failed to create production batch",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
