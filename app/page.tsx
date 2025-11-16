import { PrismaClient } from "@prisma/client";
import { formatCurrency, formatNumber } from "@/lib/utils";
import Link from "next/link";
import {
  BarChart3,
  Package,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Database,
  Factory,
  FileText,
} from "lucide-react";

const prisma = new PrismaClient();

async function getDashboardData() {
  const [woodTypes, logs, totalInventoryValue, recentBatches] =
    await Promise.all([
      prisma.woodType.count({ where: { isActive: true } }),
      prisma.logInventory.count(),
      prisma.logInventory.aggregate({
        _sum: { totalCost: true },
        where: { status: { in: ["Available", "Partial"] } },
      }),
      prisma.productionBatch.count(),
    ]);

  // Get inventory by wood type
  const inventoryByWoodType = await prisma.logInventory.groupBy({
    by: ["woodTypeId"],
    where: {
      status: { in: ["Available", "Partial"] },
    },
    _sum: {
      remainingKubikasi: true,
      totalCost: true,
    },
  });

  const inventoryDetails = await Promise.all(
    inventoryByWoodType.map(async (inv) => {
      const woodType = await prisma.woodType.findUnique({
        where: { id: inv.woodTypeId },
      });

      const wac =
        inv._sum.remainingKubikasi && inv._sum.totalCost
          ? inv._sum.totalCost / inv._sum.remainingKubikasi
          : 0;

      return {
        woodType: woodType?.woodName || "Unknown",
        woodCode: woodType?.woodCode || "??",
        kubikasi: inv._sum.remainingKubikasi || 0,
        value: inv._sum.totalCost || 0,
        wac,
      };
    })
  );

  // Check for low stock alerts (< 50 m³)
  const lowStockItems = inventoryDetails.filter((item) => item.kubikasi < 50);

  return {
    stats: {
      woodTypes,
      logs,
      totalInventoryValue: totalInventoryValue._sum.totalCost || 0,
      productionBatches: recentBatches,
    },
    inventoryDetails: inventoryDetails.sort((a, b) => b.value - a.value),
    lowStockItems,
  };
}

export default async function HomePage() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-neutral-200 pb-6">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-900">
          Al Fath Kayu
        </h1>
        <p className="text-neutral-600 mt-2">
          Multi-Wood-Type Precision Costing System
        </p>
      </div>

      {/* Alerts */}
      {data.lowStockItems.length > 0 && (
        <div className="alert alert-warning">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold">Low Stock Alert</h4>
              <p className="text-sm mt-1">
                {data.lowStockItems.length} wood type(s) below 50 m³:{" "}
                {data.lowStockItems.map((item) => item.woodType).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-label">Wood Types</div>
          <div className="stat-value">{data.stats.woodTypes}</div>
          <div className="text-sm text-neutral-500 mt-2">Active types</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Logs</div>
          <div className="stat-value">{data.stats.logs}</div>
          <div className="text-sm text-neutral-500 mt-2">In inventory</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Inventory Value</div>
          <div className="stat-value text-2xl">
            {formatCurrency(data.stats.totalInventoryValue)}
          </div>
          <div className="text-sm text-neutral-500 mt-2">Current stock</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Production Batches</div>
          <div className="stat-value">{data.stats.productionBatches}</div>
          <div className="text-sm text-neutral-500 mt-2">Total processed</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/inventory/logs/new"
          className="card card-hover p-6 flex items-center space-x-4 group"
        >
          <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
            <Package className="h-6 w-6 text-primary-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">
              Record Log Purchase
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Add new log to inventory
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
        </Link>

        <Link
          href="/production/batches/new"
          className="card card-hover p-6 flex items-center space-x-4 group"
        >
          <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
            <Factory className="h-6 w-6 text-primary-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">
              Create Production Batch
            </h3>
            <p className="text-sm text-neutral-600 mt-1">
              Plan new production run
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
        </Link>

        <Link
          href="/reports"
          className="card card-hover p-6 flex items-center space-x-4 group"
        >
          <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-200 transition-colors">
            <FileText className="h-6 w-6 text-primary-700" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-neutral-900">View Reports</h3>
            <p className="text-sm text-neutral-600 mt-1">
              Analytics and insights
            </p>
          </div>
          <ArrowRight className="h-5 w-5 text-neutral-400 group-hover:text-neutral-600 transition-colors" />
        </Link>
      </div>

      {/* Inventory Overview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Inventory by Wood Type</h2>
          <Link
            href="/inventory/logs"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
          >
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Wood Type</th>
                <th className="text-right">Kubikasi (m³)</th>
                <th className="text-right">WAC / m³</th>
                <th className="text-right">Total Value</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.inventoryDetails.map((item, index) => (
                <tr key={index}>
                  <td>
                    <div className="flex items-center">
                      <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded mr-2">
                        {item.woodCode}
                      </span>
                      <span className="font-medium">{item.woodType}</span>
                    </div>
                  </td>
                  <td className="text-right font-mono">
                    {formatNumber(item.kubikasi)}
                  </td>
                  <td className="text-right font-mono">
                    {formatCurrency(item.wac)}
                  </td>
                  <td className="text-right font-mono font-semibold">
                    {formatCurrency(item.value)}
                  </td>
                  <td className="text-center">
                    {item.kubikasi < 50 ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : item.kubikasi < 100 ? (
                      <span className="badge badge-info">Moderate</span>
                    ) : (
                      <span className="badge badge-success">Adequate</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold">Inventory Management</h3>
          </div>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li>• Multi-wood type tracking</li>
            <li>• Weighted average costing</li>
            <li>• FIFO log allocation</li>
            <li>• Real-time valuation</li>
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Factory className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold">Production Tracking</h3>
          </div>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li>• Batch planning system</li>
            <li>• Wood type segregation</li>
            <li>• Waste attribution</li>
            <li>• Cost allocation</li>
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BarChart3 className="h-5 w-5 text-primary-600" />
            <h3 className="font-semibold">Analytics & Reports</h3>
          </div>
          <ul className="space-y-2 text-sm text-neutral-600">
            <li>• Supplier performance</li>
            <li>• Waste analysis</li>
            <li>• Margin tracking</li>
            <li>• Inventory insights</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
