import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateWorkerSchema = z.object({
    workerCode: z.string().min(2).max(20).optional(),
    workerName: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    position: z.string().optional(),
    isActive: z.boolean().optional(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const worker = await prisma.worker.findUnique({
            where: { id: parseInt(params.id) },
        });

        if (!worker) {
            return NextResponse.json(
                { error: "Worker not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ worker });
    } catch (error) {
        console.error("Error fetching worker:", error);
        return NextResponse.json(
            { error: "Failed to fetch worker" },
            { status: 500 }
        );
    }
}

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
                { error: "Forbidden", message: "Only ADMIN or MANAGER can update workers" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validation = updateWorkerSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.errors },
                { status: 400 }
            );
        }

        const worker = await prisma.worker.update({
            where: { id: parseInt(params.id) },
            data: validation.data,
        });

        return NextResponse.json({
            message: "Worker updated successfully",
            worker,
        });
    } catch (error) {
        console.error("Error updating worker:", error);
        return NextResponse.json(
            { error: "Failed to update worker" },
            { status: 500 }
        );
    }
}

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
                { error: "Forbidden", message: "Only ADMIN can delete workers" },
                { status: 403 }
            );
        }

        await prisma.worker.delete({
            where: { id: parseInt(params.id) },
        });

        return NextResponse.json({
            message: "Worker deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting worker:", error);
        return NextResponse.json(
            { error: "Failed to delete worker" },
            { status: 500 }
        );
    }
}
