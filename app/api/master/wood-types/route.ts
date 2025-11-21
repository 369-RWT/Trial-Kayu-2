import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


export const dynamic = 'force-dynamic';
// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const createWoodTypeSchema = z.object({
  woodCode: z.string().min(2).max(10).toUpperCase(),
  woodName: z.string().min(2).max(100),
  avgWasteRate: z.number().min(0).max(1).default(0),
  isActive: z.boolean().default(true),
});

const updateWoodTypeSchema = z.object({
  woodCode: z.string().min(2).max(10).toUpperCase().optional(),
  woodName: z.string().min(2).max(100).optional(),
  avgWasteRate: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// GET: List all wood types
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const activeOnly = searchParams.get("activeOnly") === "true";

    const where: any = {};
    if (activeOnly) where.isActive = true;

    const woodTypes = await prisma.woodType.findMany({
      where,
      orderBy: { woodCode: "asc" },
    });

    return NextResponse.json({ woodTypes });
  } catch (error) {
    console.error("Error fetching wood types:", error);
    return NextResponse.json(
      { error: "Failed to fetch wood types" },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Create new wood type
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Authentication & Authorization
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (!["ADMIN", "MANAGER"].includes(userRole)) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only ADMIN or MANAGER can create wood types",
        },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = createWoodTypeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check for duplicate wood code
    const existing = await prisma.woodType.findUnique({
      where: { woodCode: data.woodCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Wood type with code ${data.woodCode} already exists` },
        { status: 409 }
      );
    }

    // Create wood type
    const woodType = await prisma.woodType.create({
      data,
    });

    return NextResponse.json(
      {
        message: "Wood type created successfully",
        woodType,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating wood type:", error);
    return NextResponse.json(
      {
        error: "Failed to create wood type",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
