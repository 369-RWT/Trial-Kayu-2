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
            <div
              key={log.id}
              className="bg-white rounded-xl p-5 space-y-4 border border-neutral-200/60 animate-fade-in"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)'
              }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-base font-bold text-neutral-900 tracking-tight">
                    {log.logTag}
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="font-mono text-xs bg-gradient-to-br from-neutral-100 to-neutral-50 border border-neutral-200/50 px-2.5 py-1 rounded-md mr-2 font-semibold shadow-sm">
                      {log.woodType.woodCode}
                    </span>
                    <span className="text-sm text-neutral-700 font-medium">{log.woodType.woodName}</span>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(log.status)}`}>
                  {log.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                <div>
                  <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wide mb-1">Supplier</div>
                  <div className="font-semibold text-neutral-900">{log.supplier.supplierName}</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wide mb-1">Date</div>
                  <div className="font-semibold text-neutral-900">{formatDateShort(log.purchaseDate)}</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wide mb-1">Kubikasi</div>
                  <div className="font-mono font-semibold text-neutral-900">{formatNumber(log.kubikasiFinal)} m³</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wide mb-1">Remaining</div>
                  <div className="font-mono font-semibold text-neutral-900">{formatNumber(log.remainingKubikasi)} m³</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wide mb-1">Price/m³</div>
                  <div className="font-mono font-semibold text-neutral-900">{formatCurrency(log.hargaPerKubik)}</div>
                </div>
                <div>
                  <div className="text-neutral-500 text-xs font-semibold uppercase tracking-wide mb-1">Total Cost</div>
                  <div className="font-mono font-bold text-primary-700 text-base">
                    {formatCurrency(log.totalCost)}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={`/inventory/logs/${log.logTag}`}
                className="block w-full text-center btn btn-outline text-sm py-2.5 mt-2"
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
