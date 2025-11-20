import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { inventoryLedger } from "@/lib/inventory-ledger";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const woodTypeId = searchParams.get("woodTypeId");

        if (!woodTypeId) {
            return NextResponse.json(
                { error: "Wood Type ID is required" },
                { status: 400 }
            );
        }

        const history = await inventoryLedger.getHistory(parseInt(woodTypeId));

        return NextResponse.json(history);
    } catch (error) {
        console.error("[API] Ledger fetch error:", error);
        return NextResponse.json(
            { error: "Failed to fetch ledger history" },
            { status: 500 }
        );
    }
}
