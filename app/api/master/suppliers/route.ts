import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSupplierSchema = z.object({
  supplierCode: z.string().min(2).max(20),
  supplierName: z.string().min(2).max(100),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  paymentTerms: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("activeOnly") === "true";

    const suppliers = await prisma.supplier.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { supplierCode: "asc" },
    });

    return NextResponse.json({ suppliers });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { error: "Failed to fetch suppliers" },
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
        { error: "Forbidden", message: "Only ADMIN or MANAGER can create suppliers" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createSupplierSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const existing = await prisma.supplier.findUnique({
      where: { supplierCode: validation.data.supplierCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Supplier with code ${validation.data.supplierCode} already exists` },
        { status: 409 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: validation.data,
    });

    return NextResponse.json(
      { message: "Supplier created successfully", supplier },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 }
    );
  }
}
