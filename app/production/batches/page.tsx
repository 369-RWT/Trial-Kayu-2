import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus, Factory } from "lucide-react";
import { formatDateShort, getStatusColor } from "@/lib/utils";

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-label">Total Batches</div>
          <div className="stat-value">{batches.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">
            {batches.filter((b) => b.status === "Completed").length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">
            {batches.filter((b) => b.status === "In-Progress").length}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Date</th>
                <th>Shift</th>
                <th>Line Items</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id}>
                  <td>
                    <span className="font-mono font-medium">{batch.id}</span>
                  </td>
                  <td>{formatDateShort(batch.productionDate)}</td>
                  <td>Shift {batch.shift}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {batch.batchLineItems.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-neutral-100 px-2 py-1 rounded"
                        >
                          {item.woodType.woodCode} → {item.product.productCode}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/production/batches/${batch.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {batches.length === 0 && (
          <div className="p-12 text-center">
            <Factory className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="font-semibold text-neutral-900 mb-2">
              No production batches yet
            </h3>
            <p className="text-neutral-600 mb-4">
              Create your first production batch to start tracking
            </p>
            <Link href="/production/batches/new" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Batch
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
