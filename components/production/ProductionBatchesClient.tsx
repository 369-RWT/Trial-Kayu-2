"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Factory, Plus } from "lucide-react";
import { formatDateShort, getStatusColor } from "@/lib/utils";
import type { ProductionBatch, BatchLineItem, WoodType, Product } from "@prisma/client";

type LineItemWithRelations = BatchLineItem & {
  woodType: WoodType;
  product: Product;
};

type BatchWithRelations = ProductionBatch & {
  batchLineItems: LineItemWithRelations[];
};

interface Props {
  batches: BatchWithRelations[];
}

export default function ProductionBatchesClient({ batches }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter batches based on search term
  const filteredBatches = batches.filter((batch) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      batch.id.toString().includes(searchLower) ||
      batch.status.toLowerCase().includes(searchLower) ||
      batch.shift.toString().includes(searchLower) ||
      batch.batchLineItems.some(
        (item) =>
          item.woodType.woodCode.toLowerCase().includes(searchLower) ||
          item.woodType.woodName.toLowerCase().includes(searchLower) ||
          item.product.productCode.toLowerCase().includes(searchLower) ||
          item.product.productName.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <>
      {/* Stats */}
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

      {/* Table */}
      <div className="card">
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by batch ID, wood type, product, or status..."
              className="input border-0 focus:ring-0 px-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search batches"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-neutral-600 mt-2">
              Found {filteredBatches.length} {filteredBatches.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

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
              {filteredBatches.map((batch) => (
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

        {filteredBatches.length === 0 && !searchTerm && (
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

        {filteredBatches.length === 0 && searchTerm && (
          <div className="p-12 text-center">
            <Search className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="font-semibold text-neutral-900 mb-2">
              No results found
            </h3>
            <p className="text-neutral-600 mb-4">
              Try searching with different keywords
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="btn btn-outline"
            >
              Clear search
            </button>
          </div>
        )}
      </div>
    </>
  );
}
