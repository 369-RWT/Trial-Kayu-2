import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePricingSchema = z.object({
    productId: z.number().optional(),
    woodTypeId: z.number().optional(),
    sellingPricePerKubik: z.number().min(0).optional(),
    effectiveDate: z.string().transform((str) => new Date(str)).optional(),
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

        const pricing = await prisma.productPricing.findUnique({
            where: { id: parseInt(params.id) },
            include: {
                product: true,
                woodType: true,
            },
        });

        if (!pricing) {
            return NextResponse.json(
                { error: "Pricing not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ pricing });
    } catch (error) {
        console.error("Error fetching pricing:", error);
        return NextResponse.json(
            { error: "Failed to fetch pricing" },
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
                { error: "Forbidden", message: "Only ADMIN or MANAGER can update pricing" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validation = updatePricingSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.errors },
                { status: 400 }
            );
        }

        const pricing = await prisma.productPricing.update({
            where: { id: parseInt(params.id) },
            data: validation.data,
            include: {
                product: true,
                woodType: true,
            },
        });

        return NextResponse.json({
            message: "Pricing updated successfully",
            pricing,
        });
    } catch (error) {
        console.error("Error updating pricing:", error);
        return NextResponse.json(
            { error: "Failed to update pricing" },
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
                { error: "Forbidden", message: "Only ADMIN can delete pricing" },
                { status: 403 }
            );
        }

        await prisma.productPricing.delete({
            where: { id: parseInt(params.id) },
        });

        return NextResponse.json({
            message: "Pricing deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting pricing:", error);
        return NextResponse.json(
            { error: "Failed to delete pricing" },
            { status: 500 }
        );
    }
}
