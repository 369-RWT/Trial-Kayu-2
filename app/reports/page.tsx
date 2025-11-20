import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Package,
  AlertTriangle,
  FileText,
  Users,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function getReportData() {
  // Get inventory summary
  const inventorySummary = await prisma.logInventory.groupBy({
    by: ["woodTypeId"],
    where: {
      status: { in: ["Available", "Partial"] },
    },
    _sum: {
      remainingKubikasi: true,
      totalCost: true,
    },
  });

  const inventoryWithWoodTypes = await Promise.all(
    inventorySummary.map(async (inv) => {
      const woodType = await prisma.woodType.findUnique({
        where: { id: inv.woodTypeId },
      });
      return {
        woodType: woodType?.woodName || "Unknown",
        kubikasi: inv._sum.remainingKubikasi || 0,
        value: inv._sum.totalCost || 0,
        avgWasteRate: woodType?.avgWasteRate || 0,
      };
    })
  );

  // Get waste statistics
  const totalWaste = await prisma.wasteDeviation.aggregate({
    _sum: {
      kubikasiWaste: true,
      wasteCost: true,
      recoveryValue: true,
    },
  });

  // Get batch statistics
  const batches = await prisma.productionBatch.count();

  return {
    inventory: inventoryWithWoodTypes,
    totalInventoryValue:
      inventorySummary.reduce((sum, inv) => sum + (inv._sum.totalCost || 0), 0),
    totalWasteKubikasi: totalWaste._sum.kubikasiWaste || 0,
    totalWasteCost: totalWaste._sum.wasteCost || 0,
    totalRecoveryValue: totalWaste._sum.recoveryValue || 0,
    totalBatches: batches,
  };
}

export default async function ReportsPage() {
  const data = await getReportData();

  const reports = [
    {
      title: "Daily Production Summary",
      description:
        "Production output by wood type × product type with waste analysis",
      href: "/reports/daily-production",
      icon: BarChart3,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Inventory Valuation",
      description:
        "Inventory by wood type with WAC, log tags, and aging analysis",
      href: "/reports/inventory-valuation",
      icon: Package,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Supplier Performance",
      description: "Waste rates and quality scores by wood type × supplier",
      href: "/reports/supplier-performance",
      icon: Users,
      color: "bg-purple-100 text-purple-700",
    },
    {
      title: "Waste Analysis",
      description: "Waste breakdown by wood type, cause, and disposition",
      href: "/reports/waste-analysis",
      icon: AlertTriangle,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      title: "Cost Breakdown",
      description:
        "Detailed cost analysis with material, waste, and margin tracking",
      href: "/reports/cost-breakdown",
      icon: TrendingUp,
      color: "bg-red-100 text-red-700",
    },
    {
      title: "Custom Report",
      description: "Build custom reports with filters and date ranges",
      href: "/reports/custom",
      icon: FileText,
      color: "bg-neutral-100 text-neutral-700",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="border-b border-neutral-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Reports & Analytics
        </h1>
        <p className="text-neutral-600 mt-2">
          Comprehensive insights for wood costing and production efficiency
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-label">Total Inventory Value</div>
          <div className="stat-value text-2xl">
            {formatCurrency(data.totalInventoryValue)}
          </div>
          <div className="text-sm text-neutral-500 mt-2">
            {data.inventory.length} wood types
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Production Batches</div>
          <div className="stat-value">{data.totalBatches}</div>
          <div className="text-sm text-neutral-500 mt-2">Total processed</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Waste</div>
          <div className="stat-value">
            {formatNumber(data.totalWasteKubikasi, 1)} m³
          </div>
          <div className="text-sm text-neutral-500 mt-2">
            {formatCurrency(data.totalWasteCost)}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Waste Recovery</div>
          <div className="stat-value text-2xl">
            {formatCurrency(data.totalRecoveryValue)}
          </div>
          <div className="text-sm text-green-600 mt-2">
            {data.totalWasteCost > 0
              ? formatPercentage(
                (data.totalRecoveryValue / data.totalWasteCost) * 100
              )
              : "0%"}{" "}
            recovery rate
          </div>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Link
            key={report.href}
            href={report.href}
            className="card card-hover p-6 group"
          >
            <div className="flex items-start space-x-4">
              <div
                className={`${report.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}
              >
                <report.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-neutral-900 mb-2">
                  {report.title}
                </h3>
                <p className="text-sm text-neutral-600 mb-3">
                  {report.description}
                </p>
                <div className="text-sm text-primary-600 font-medium group-hover:translate-x-1 transition-transform inline-block">
                  View Report →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Insights */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Inventory Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.inventory.map((item, index) => (
            <div key={index} className="p-4 bg-neutral-50 rounded-lg">
              <div className="font-semibold text-neutral-900 mb-2">
                {item.woodType}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Kubikasi:</span>
                  <span className="font-mono font-medium">
                    {formatNumber(item.kubikasi, 1)} m³
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Value:</span>
                  <span className="font-mono font-medium">
                    {formatCurrency(item.value)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Avg Waste:</span>
                  <span className="font-mono font-medium">
                    {formatPercentage(item.avgWasteRate)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

