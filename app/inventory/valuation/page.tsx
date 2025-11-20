import { PrismaClient } from "@prisma/client";
import { formatCurrency, formatNumber, formatDateShort } from "@/lib/utils";
import { TrendingUp, Package } from "lucide-react";

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

async function getValuationData() {
  // Get latest valuation for each wood type
  const woodTypes = await prisma.woodType.findMany({
    where: { isActive: true },
    include: {
      inventoryValuations: {
        orderBy: { valuationDate: "desc" },
        take: 1,
      },
    },
  });

  return woodTypes.map((wt) => ({
    woodType: wt.woodName,
    woodCode: wt.woodCode,
    avgWasteRate: wt.avgWasteRate,
    latestValuation: wt.inventoryValuations[0] || null,
  }));
}

export default async function InventoryValuationPage() {
  const valuations = await getValuationData();

  const totalValue = valuations.reduce(
    (sum, v) => sum + (v.latestValuation?.closingValue || 0),
    0
  );
  const totalKubikasi = valuations.reduce(
    (sum, v) => sum + (v.latestValuation?.closingKubikasi || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Inventory Valuation
        </h1>
        <p className="text-neutral-600 mt-1">
          Weighted average cost by wood type
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-label">Total Inventory Value</div>
          <div className="stat-value text-2xl">
            {formatCurrency(totalValue)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Kubikasi</div>
          <div className="stat-value">{formatNumber(totalKubikasi, 1)} m³</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Wood Types</div>
          <div className="stat-value">{valuations.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-neutral-200">
          <h2 className="font-semibold text-lg">Valuation by Wood Type</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Wood Type</th>
                <th>Valuation Date</th>
                <th className="text-right">Opening (m³)</th>
                <th className="text-right">Purchases (m³)</th>
                <th className="text-right">Consumed (m³)</th>
                <th className="text-right">Closing (m³)</th>
                <th className="text-right">WAC / m³</th>
                <th className="text-right">Total Value</th>
              </tr>
            </thead>
            <tbody>
              {valuations.map((item, index) => {
                const val = item.latestValuation;
                return (
                  <tr key={index}>
                    <td>
                      <div className="flex items-center">
                        <span className="font-mono text-xs bg-neutral-100 px-2 py-1 rounded mr-2">
                          {item.woodCode}
                        </span>
                        <span className="font-medium">{item.woodType}</span>
                      </div>
                    </td>
                    <td>
                      {val ? formatDateShort(val.valuationDate) : "-"}
                    </td>
                    <td className="text-right font-mono">
                      {val ? formatNumber(val.openingKubikasi, 1) : "-"}
                    </td>
                    <td className="text-right font-mono">
                      {val ? formatNumber(val.purchaseKubikasi, 1) : "-"}
                    </td>
                    <td className="text-right font-mono">
                      {val ? formatNumber(val.consumedKubikasi, 1) : "-"}
                    </td>
                    <td className="text-right font-mono font-semibold">
                      {val ? formatNumber(val.closingKubikasi, 1) : "-"}
                    </td>
                    <td className="text-right font-mono">
                      {val ? formatCurrency(val.wacPerKubik) : "-"}
                    </td>
                    <td className="text-right font-mono font-semibold">
                      {val ? formatCurrency(val.closingValue) : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {valuations.length === 0 && (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="font-semibold text-neutral-900 mb-2">
              No valuation data
            </h3>
            <p className="text-neutral-600">
              Valuations will appear after log purchases
            </p>
          </div>
        )}
      </div>

      <div className="alert alert-info">
        <div className="flex items-start">
          <TrendingUp className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold">Weighted Average Cost (WAC)</h4>
            <p className="text-sm mt-1">
              WAC is calculated separately for each wood type. Formula: Total
              Inventory Value ÷ Total Inventory Kubikasi. Updated after each
              purchase and consumption.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

