import { PrismaClient } from "@prisma/client";
import { TrendingUp } from "lucide-react";
import { formatNumber, formatCurrency, formatPercentage } from "@/lib/utils";

const prisma = new PrismaClient();

async function getCostBreakdownData() {
    // Get batch line items with full cost details
    const batchLines = await prisma.batchLineItem.findMany({
        include: {
            batch: true,
            woodType: true,
            product: true,
            worker: true,
        },
        orderBy: {
            batch: {
                productionDate: "desc",
            },
        },
        take: 100, // Limit for performance
    });

    // Aggregate stats
    const totals = await prisma.batchLineItem.aggregate({
        _sum: {
            actualOutputKubikasi: true,
            totalInputKubikasi: true,
            materialCostDirect: true,
            materialCostWaste: true,
            materialCostTotal: true,
        },
        _avg: {
            materialCostPerKubik: true,
            sellingPricePerKubik: true,
        },
    });

    // Calculate profit margins
    const totalRevenue = batchLines.reduce(
        (sum, line) =>
            sum + (line.actualOutputKubikasi || 0) * (line.sellingPricePerKubik || 0),
        0
    );
    const totalCost = totals._sum.materialCostTotal || 0;
    const totalProfit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
        batchLines,
        totals,
        totalRevenue,
        totalCost,
        totalProfit,
        profitMargin,
    };
}

export default async function CostBreakdownPage() {
    const data = await getCostBreakdownData();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cost Breakdown</h1>
                <p className="text-neutral-600 mt-1">
                    Detailed cost analysis with material, waste, and margin tracking
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="stat-card">
                    <div className="stat-label">Total Revenue</div>
                    <div className="stat-value text-green-600">
                        {formatCurrency(data.totalRevenue)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Cost</div>
                    <div className="stat-value text-red-600">
                        {formatCurrency(data.totalCost)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Profit</div>
                    <div className="stat-value">
                        {formatCurrency(data.totalProfit)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Profit Margin</div>
                    <div className="stat-value">
                        {formatPercentage(data.profitMargin)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Avg Cost/m³</div>
                    <div className="stat-value text-sm">
                        {formatCurrency(data.totals._avg.materialCostPerKubik || 0)}
                    </div>
                </div>
            </div>

            {/* Cost Components */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card p-6">
                    <h3 className="font-semibold text-neutral-900 mb-4">Direct Material Cost</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                        {formatCurrency(data.totals._sum.materialCostDirect || 0)}
                    </div>
                    <p className="text-sm text-neutral-600">
                        Cost for {formatNumber(data.totals._sum.actualOutputKubikasi || 0, 1)} m³ output
                    </p>
                </div>
                <div className="card p-6">
                    <h3 className="font-semibold text-neutral-900 mb-4">Waste Allocation Cost</h3>
                    <div className="text-3xl font-bold text-red-600 mb-2">
                        {formatCurrency(data.totals._sum.materialCostWaste || 0)}
                    </div>
                    <p className="text-sm text-neutral-600">
                        Cost for {formatNumber((data.totals._sum.totalInputKubikasi || 0) - (data.totals._sum.actualOutputKubikasi || 0), 1)} m³ waste
                    </p>
                </div>
                <div className="card p-6">
                    <h3 className="font-semibold text-neutral-900 mb-4">Total Material Cost</h3>
                    <div className="text-3xl font-bold text-neutral-900 mb-2">
                        {formatCurrency(data.totals._sum.materialCostTotal || 0)}
                    </div>
                    <p className="text-sm text-neutral-600">
                        For {formatNumber(data.totals._sum.totalInputKubikasi || 0, 1)} m³ input
                    </p>
                </div>
            </div>

            {/* Detailed Breakdown Table */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-neutral-200">
                    <h2 className="text-xl font-semibold">Cost Details by Production</h2>
                    <p className="text-sm text-neutral-600 mt-1">Latest 100 production line items</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Batch ID</th>
                                <th>Date</th>
                                <th>Product</th>
                                <th>Wood Type</th>
                                <th>Output (m³)</th>
                                <th>Input (m³)</th>
                                <th>Direct Cost</th>
                                <th>Waste Cost</th>
                                <th>Total Cost</th>
                                <th>Cost/m³</th>
                                <th>Selling Price/m³</th>
                                <th>Margin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.batchLines.map((line) => {
                                const revenue = (line.actualOutputKubikasi || 0) * (line.sellingPricePerKubik || 0);
                                const cost = line.materialCostTotal || 0;
                                const profit = revenue - cost;
                                const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

                                return (
                                    <tr key={line.id}>
                                        <td className="font-mono text-sm">{line.batchId}</td>
                                        <td className="text-sm">
                                            {new Date(line.batch.productionDate).toLocaleDateString()}
                                        </td>
                                        <td className="text-sm">{line.product.productName}</td>
                                        <td>
                                            <span className="badge badge-neutral">
                                                {line.woodType.woodCode}
                                            </span>
                                        </td>
                                        <td className="font-mono">
                                            {formatNumber(line.actualOutputKubikasi || 0, 2)}
                                        </td>
                                        <td className="font-mono text-neutral-600">
                                            {formatNumber(line.totalInputKubikasi || 0, 2)}
                                        </td>
                                        <td className="font-mono text-blue-600">
                                            {formatCurrency(line.materialCostDirect || 0)}
                                        </td>
                                        <td className="font-mono text-red-600">
                                            {formatCurrency(line.materialCostWaste || 0)}
                                        </td>
                                        <td className="font-mono font-semibold">
                                            {formatCurrency(cost)}
                                        </td>
                                        <td className="font-mono text-sm">
                                            {formatCurrency(line.materialCostPerKubik || 0)}
                                        </td>
                                        <td className="font-mono text-sm text-green-600">
                                            {formatCurrency(line.sellingPricePerKubik || 0)}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${margin >= 30
                                                        ? "badge-success"
                                                        : margin >= 15
                                                            ? "badge-warning"
                                                            : "badge-danger"
                                                    }`}
                                            >
                                                {formatPercentage(margin)}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {data.batchLines.length === 0 && (
                    <div className="p-12 text-center">
                        <TrendingUp className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-neutral-900 mb-2">
                            No cost data available
                        </h3>
                        <p className="text-neutral-600">
                            Cost breakdown will appear here once production batches are processed
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
