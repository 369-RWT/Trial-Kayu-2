import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { Plus, Search, Package } from "lucide-react";
import { formatCurrency, formatNumber, formatDateShort, getStatusColor } from "@/lib/utils";

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
            />
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {logs.map((log) => (
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

        {logs.length === 0 && (
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
      </div>
    </div>
  );
}
