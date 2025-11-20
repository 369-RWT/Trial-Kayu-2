import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import LogInventoryClient from "@/components/inventory/LogInventoryClient";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function getLogInventory() {
  const logs = await prisma.logInventory.findMany({
    include: {
      woodType: true,
      supplier: true,
    },
    orderBy: {
      purchaseDate: "desc",
    },
  });

  return logs;
}

export default async function LogInventoryPage() {
  const logs = await getLogInventory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log Inventory</h1>
          <p className="text-neutral-600 mt-1">
            {logs.length} logs in inventory
          </p>
        </div>
        <Link href="/inventory/logs/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Add Log Purchase
        </Link>
      </div>

      {/* Client Component with Search & Table */}
      <LogInventoryClient logs={logs} />
    </div>
  );
}
