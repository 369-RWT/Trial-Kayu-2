"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Package, Plus } from "lucide-react";
import { formatCurrency, formatNumber, formatDateShort, getStatusColor } from "@/lib/utils";
import type { LogInventory, WoodType, Supplier } from "@prisma/client";

type LogWithRelations = LogInventory & {
  woodType: WoodType;
  supplier: Supplier;
};

interface Props {
  logs: LogWithRelations[];
}

export default function LogInventoryClient({ logs }: Props) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter logs based on search term
  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      log.logTag.toLowerCase().includes(searchLower) ||
      log.woodType.woodName.toLowerCase().includes(searchLower) ||
      log.woodType.woodCode.toLowerCase().includes(searchLower) ||
      log.supplier.supplierName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-label">Total Logs</div>
          <div className="stat-value">{logs.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available</div>
          <div className="stat-value">
            {logs.filter((l) => l.status === "Available").length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Partial</div>
          <div className="stat-value">
            {logs.filter((l) => l.status === "Partial").length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Value</div>
          <div className="stat-value text-xl">
            {formatCurrency(
              logs
                .filter((l) => l.status !== "Consumed")
                .reduce((sum, l) => sum + l.totalCost, 0)
            )}
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
              placeholder="Search by log tag, wood type, or supplier..."
              className="input border-0 focus:ring-0 px-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search logs"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-neutral-600 mt-2">
              Found {filteredLogs.length} {filteredLogs.length === 1 ? 'result' : 'results'}
            </p>
          )}
        </div>

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden md:block overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Log Tag</th>
                <th>Wood Type</th>
                <th>Supplier</th>
                <th>Purchase Date</th>
                <th className="text-right">Kubikasi</th>
                <th className="text-right">Remaining</th>
                <th className="text-right">Price/m³</th>
                <th className="text-right">Total Cost</th>
                <th className="text-center">Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span className="font-mono text-sm font-medium">
                      {log.logTag}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center">
                      <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded mr-2">
                        {log.woodType.woodCode}
                      </span>
                      <span>{log.woodType.woodName}</span>
                    </div>
                  </td>
                  <td>{log.supplier.supplierName}</td>
                  <td>{formatDateShort(log.purchaseDate)}</td>
                  <td className="text-right font-mono">
                    {formatNumber(log.kubikasiFinal)} m³
                  </td>
                  <td className="text-right font-mono">
                    {formatNumber(log.remainingKubikasi)} m³
                  </td>
                  <td className="text-right font-mono">
                    {formatCurrency(log.hargaPerKubik)}
                  </td>
                  <td className="text-right font-mono font-semibold">
                    {formatCurrency(log.totalCost)}
                  </td>
                  <td className="text-center">
                    <span className={`badge ${getStatusColor(log.status)}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <Link
                      href={`/inventory/logs/${log.logTag}`}
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
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-neutral-50 rounded-lg p-4 space-y-3 border border-neutral-200">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-sm font-bold text-neutral-900">
                    {log.logTag}
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="font-mono text-xs bg-neutral-200 px-2 py-0.5 rounded mr-2">
                      {log.woodType.woodCode}
                    </span>
                    <span className="text-sm text-neutral-700">{log.woodType.woodName}</span>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(log.status)}`}>
                  {log.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-neutral-500 text-xs">Supplier</div>
                  <div className="font-medium">{log.supplier.supplierName}</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs">Date</div>
                  <div className="font-medium">{formatDateShort(log.purchaseDate)}</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs">Kubikasi</div>
                  <div className="font-mono font-medium">{formatNumber(log.kubikasiFinal)} m³</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs">Remaining</div>
                  <div className="font-mono font-medium">{formatNumber(log.remainingKubikasi)} m³</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs">Price/m³</div>
                  <div className="font-mono font-medium">{formatCurrency(log.hargaPerKubik)}</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs">Total Cost</div>
                  <div className="font-mono font-semibold text-primary-700">
                    {formatCurrency(log.totalCost)}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/inventory/logs/${log.logTag}`}
                className="block w-full text-center btn btn-outline text-sm py-2"
              >
                View Details
              </Link>
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && !searchTerm && (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="font-semibold text-neutral-900 mb-2">
              No logs in inventory
            </h3>
            <p className="text-neutral-600 mb-4">
              Get started by adding your first log purchase
            </p>
            <Link href="/inventory/logs/new" className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Log Purchase
            </Link>
          </div>
        )}

        {filteredLogs.length === 0 && searchTerm && (
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
