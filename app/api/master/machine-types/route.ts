import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createMachineTypeSchema = z.object({
  machineName: z.string().min(2).max(100),
  description: z.string().optional(),
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

    const machineTypes = await prisma.machineType.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { machineName: "asc" },
    });

    return NextResponse.json({ machineTypes });
  } catch (error) {
    console.error("Error fetching machine types:", error);
    return NextResponse.json(
      { error: "Failed to fetch machine types" },
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
        { error: "Forbidden", message: "Only ADMIN or MANAGER can create machine types" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createMachineTypeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const existing = await prisma.machineType.findUnique({
      where: { machineName: validation.data.machineName },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Machine type ${validation.data.machineName} already exists` },
        { status: 409 }
      );
    }

    const machineType = await prisma.machineType.create({
      data: validation.data,
    });

    return NextResponse.json(
      { message: "Machine type created successfully", machineType },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating machine type:", error);
    return NextResponse.json(
      { error: "Failed to create machine type" },
      { status: 500 }
    );
  }
}
