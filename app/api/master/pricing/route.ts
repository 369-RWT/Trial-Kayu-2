import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";


export const dynamic = 'force-dynamic';
const createPricingSchema = z.object({
    productId: z.number(),
    woodTypeId: z.number(),
    sellingPricePerKubik: z.number().min(0),
    effectiveDate: z.string().transform((str) => new Date(str)),
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

        const pricing = await prisma.productPricing.findMany({
            where: activeOnly ? { isActive: true } : undefined,
            include: {
                product: true,
                woodType: true,
            },
            orderBy: [
                { product: { productCode: "asc" } },
                { woodType: { woodCode: "asc" } },
            ],
        });

        return NextResponse.json({ pricing });
    } catch (error) {
        console.error("Error fetching pricing:", error);
        return NextResponse.json(
            { error: "Failed to fetch pricing" },
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
                { error: "Forbidden", message: "Only ADMIN or MANAGER can create pricing" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validation = createPricingSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.errors },
                { status: 400 }
            );
        }

        const pricing = await prisma.productPricing.create({
            data: validation.data,
            include: {
                product: true,
                woodType: true,
            },
        });

        return NextResponse.json(
            { message: "Pricing created successfully", pricing },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating pricing:", error);
        return NextResponse.json(
            { error: "Failed to create pricing" },
            { status: 500 }
        );
    }
}
