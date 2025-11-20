import { prisma } from "@/lib/prisma";

export type LedgerTransactionType = "IN" | "OUT";
export type LedgerCategory = "PURCHASE" | "PRODUCTION" | "WASTE" | "ADJUSTMENT" | "INITIAL";

interface RecordLedgerEntryParams {
    woodTypeId: number;
    transactionDate?: Date;
    type: LedgerTransactionType;
    category: LedgerCategory;
    referenceId?: string;
    kubikasiChange: number;
    notes?: string;
}

export const inventoryLedger = {
    /**
     * Records a new ledger entry and updates the running balance.
     * Uses a transaction to ensure data integrity.
     */
    async recordEntry(params: RecordLedgerEntryParams, txClient?: any) {
        const { woodTypeId, transactionDate = new Date(), type, category, referenceId, kubikasiChange, notes } = params;

        // Ensure kubikasiChange sign matches type
        const change = type === "IN" ? Math.abs(kubikasiChange) : -Math.abs(kubikasiChange);

        const db = txClient || prisma;

        // Get the last entry to calculate running balance
        const lastEntry = await db.inventoryLedger.findFirst({
            where: { woodTypeId },
            orderBy: { transactionDate: "desc" },
        });

        const previousBalance = lastEntry?.runningBalance || 0;
        const newBalance = previousBalance + change;

        const entry = await db.inventoryLedger.create({
            data: {
                woodTypeId,
                transactionDate,
                type,
                category,
                referenceId,
                kubikasiChange: change,
                runningBalance: newBalance,
                notes,
            },
        });

        return entry;
    },

    /**
     * Retrieves the ledger history for a specific wood type.
     */
    async getHistory(woodTypeId: number) {
        return await prisma.inventoryLedger.findMany({
            where: { woodTypeId },
            orderBy: { transactionDate: "desc" },
            include: {
                woodType: true,
            },
        });
    },
};
