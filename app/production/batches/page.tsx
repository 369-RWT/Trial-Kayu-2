import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProductionBatchesClient from "@/components/production/ProductionBatchesClient";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function getProductionBatches() {
  const batches = await prisma.productionBatch.findMany({
    include: {
      batchLineItems: {
        include: {
          woodType: true,
          product: true,
        },
      },
    },
    orderBy: {
      productionDate: "desc",
    },
  });

  return batches;
}

export default async function ProductionBatchesPage() {
  const batches = await getProductionBatches();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Production Batches
          </h1>
          <p className="text-neutral-600 mt-1">
            {batches.length} batches total
          </p>
        </div>
        <Link href="/production/batches/new" className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Link>
      </div>

      {/* Client Component with Search & Table */}
      <ProductionBatchesClient batches={batches} />
    </div>
  );
}

