import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


export const dynamic = 'force-dynamic';
const createWorkerSchema = z.object({
  workerCode: z.string().min(2).max(20),
  workerName: z.string().min(2).max(100),
  phone: z.string().optional(),
  position: z.string().optional(),
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

    const workers = await prisma.worker.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { workerCode: "asc" },
    });

    return NextResponse.json({ workers });
  } catch (error) {
    console.error("Error fetching workers:", error);
    return NextResponse.json(
      { error: "Failed to fetch workers" },
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
        { error: "Forbidden", message: "Only ADMIN or MANAGER can create workers" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createWorkerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.errors },
        { status: 400 }
      );
    }

    const existing = await prisma.worker.findUnique({
      where: { workerCode: validation.data.workerCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Worker with code ${validation.data.workerCode} already exists` },
        { status: 409 }
      );
    }

    const worker = await prisma.worker.create({
      data: validation.data,
    });

    return NextResponse.json(
      { message: "Worker created successfully", worker },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating worker:", error);
    return NextResponse.json(
      { error: "Failed to create worker" },
      { status: 500 }
    );
  }
}
