import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateMachineTypeSchema = z.object({
    machineName: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
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

        const machineType = await prisma.machineType.findUnique({
            where: { id: parseInt(params.id) },
        });

        if (!machineType) {
            return NextResponse.json(
                { error: "Machine type not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ machineType });
    } catch (error) {
        console.error("Error fetching machine type:", error);
        return NextResponse.json(
            { error: "Failed to fetch machine type" },
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
                { error: "Forbidden", message: "Only ADMIN or MANAGER can update machine types" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validation = updateMachineTypeSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.errors },
                { status: 400 }
            );
        }

        const machineType = await prisma.machineType.update({
            where: { id: parseInt(params.id) },
            data: validation.data,
        });

        return NextResponse.json({
            message: "Machine type updated successfully",
            machineType,
        });
    } catch (error) {
        console.error("Error updating machine type:", error);
        return NextResponse.json(
            { error: "Failed to update machine type" },
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
                { error: "Forbidden", message: "Only ADMIN can delete machine types" },
                { status: 403 }
            );
        }

        await prisma.machineType.delete({
            where: { id: parseInt(params.id) },
        });

        return NextResponse.json({
            message: "Machine type deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting machine type:", error);
        return NextResponse.json(
            { error: "Failed to delete machine type" },
            { status: 500 }
        );
    }
}
