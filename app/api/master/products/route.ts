import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


export const dynamic = 'force-dynamic';
const createProductSchema = z.object({
  productCode: z.string().min(2).max(20),
  productName: z.string().min(2).max(100),
  machineTypeId: z.number().int().positive().optional(),
  standardWasteRate: z.number().min(0).max(1).default(0),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const activeOnly = searchParams.get("activeOnly") === "true";

    const products = await prisma.product.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      include: { machineType: true },
      orderBy: { productCode: "asc" },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = session.user.role;
    if (!["ADMIN", "MANAGER"].includes(userRole)) {
      return NextResponse.json(
        { error: "Forbidden", message: "Only ADMIN or MANAGER can create products" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({
      where: { productCode: validation.data.productCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Product with code ${validation.data.productCode} already exists` },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: validation.data,
      include: { machineType: true },
    });

    return NextResponse.json(
      { message: "Product created successfully", product },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
