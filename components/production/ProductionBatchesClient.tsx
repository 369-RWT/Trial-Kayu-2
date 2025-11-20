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

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
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
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">
                        {batch.batchLineItems.length} items
                      </span>
                      {batch.batchLineItems.length > 0 && (
                        <div className="flex gap-1">
                          {batch.batchLineItems.slice(0, 3).map((item, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-neutral-100 px-2 py-1 rounded"
                            >
                              {item.woodType.woodCode} → {item.product.productCode}
                            </span>
                          ))}
                          {batch.batchLineItems.length > 3 && (
                            <span className="text-xs text-neutral-500 px-2 py-1">
                              +{batch.batchLineItems.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
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

        {/* Mobile Card View - Visible only on mobile */}
        <div className="md:hidden space-y-4 p-4">
          {filteredBatches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-xl p-5 space-y-4 border border-neutral-200/60 animate-fade-in"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)'
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-base font-bold text-neutral-900 tracking-tight">
                    Batch #{batch.id}
                  </div>
                  <div className="text-sm text-neutral-600 mt-2 font-medium">
                    {formatDateShort(batch.productionDate)} • Shift {batch.shift}
                  </div>
                </div>
                <span className={`badge ${getStatusColor(batch.status)}`}>
                  {batch.status}
                </span>
              </div>

              {/* Line Items */}
              <div className="pt-2">
                <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wide mb-2">
                  {batch.batchLineItems.length} Line Items
                </div>
                <div className="flex flex-wrap gap-2">
                  {batch.batchLineItems.slice(0, 5).map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-gradient-to-br from-neutral-100 to-neutral-50 border border-neutral-200/50 px-2.5 py-1 rounded-md font-semibold shadow-sm"
                    >
                      {item.woodType.woodCode} → {item.product.productCode}
                    </span>
                  ))}
                  {batch.batchLineItems.length > 5 && (
                    <span className="text-xs text-neutral-500 px-2.5 py-1">
                      +{batch.batchLineItems.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/production/batches/${batch.id}`}
                className="block w-full text-center btn btn-outline text-sm py-2.5 mt-2"
              >
                View Details
              </Link>
            </div>
          ))}
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
