import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateWoodTypeSchema = z.object({
  woodCode: z.string().min(2).max(10).toUpperCase().optional(),
  woodName: z.string().min(2).max(100).optional(),
  avgWasteRate: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// GET: Get single wood type
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const woodType = await prisma.woodType.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!woodType) {
      return NextResponse.json(
        { error: "Wood type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ woodType });
  } catch (error) {
    console.error("Error fetching wood type:", error);
    return NextResponse.json(
      { error: "Failed to fetch wood type" },
      { status: 500 }
    );
  }
}

// ============================================================================
// PATCH: Update wood type
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (!["ADMIN", "MANAGER"].includes(userRole)) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only ADMIN or MANAGER can update wood types",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = updateWoodTypeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const woodType = await prisma.woodType.update({
      where: { id: parseInt(params.id) },
      data: validation.data,
    });

    return NextResponse.json({
      message: "Wood type updated successfully",
      woodType,
    });
  } catch (error) {
    console.error("Error updating wood type:", error);
    return NextResponse.json(
      { error: "Failed to update wood type" },
      { status: 500 }
    );
  }
}

// ============================================================================
// DELETE: Delete wood type
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Only ADMIN can delete wood types",
        },
        { status: 403 }
      );
    }

    await prisma.woodType.delete({
      where: { id: parseInt(params.id) },
    });

    return NextResponse.json({
      message: "Wood type deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting wood type:", error);
    return NextResponse.json(
      { error: "Failed to delete wood type. It may be in use." },
      { status: 500 }
    );
  }
}
