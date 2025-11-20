import { PrismaClient } from "@prisma/client";
import { BarChart3 } from "lucide-react";
import { formatNumber, formatPercentage, formatCurrency } from "@/lib/utils";

const prisma = new PrismaClient();

async function getSupplierPerformanceData() {
    // Get all supplier performance records
    const performances = await prisma.supplierWoodPerformance.findMany({
        include: {
            supplier: true,
            woodType: true,
        },
        orderBy: [
            { supplierId: "asc" },
            { woodTypeId: "asc" },
        ],
    });

    // Get summary stats
    const totalKubikasi = performances.reduce((sum, p) => sum + p.totalKubikasi, 0);
    const totalWaste = performances.reduce((sum, p) => sum + p.totalWasteKubikasi, 0);
    const avgWasteRate = totalKubikasi > 0 ? (totalWaste / totalKubikasi) * 100 : 0;

    return {
        performances,
        totalKubikasi,
        totalWaste,
        avgWasteRate,
    };
}

export default async function SupplierPerformancePage() {
    const data = await getSupplierPerformanceData();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Supplier Performance</h1>
                <p className="text-neutral-600 mt-1">
                    Analyze supplier quality and waste rates by wood type
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="stat-card">
                    <div className="stat-label">Total Volume Supplied</div>
                    <div className="stat-value">{formatNumber(data.totalKubikasi, 1)} m³</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Waste</div>
                    <div className="stat-value">{formatNumber(data.totalWaste, 1)} m³</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Average Waste Rate</div>
                    <div className="stat-value">{formatPercentage(data.avgWasteRate)}</div>
                </div>
            </div>

            {/* Performance Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Supplier</th>
                                <th>Wood Type</th>
                                <th>Period</th>
                                <th>Total Kubikasi</th>
                                <th>Waste Kubikasi</th>
                                <th>Waste Rate</th>
                                <th>Quality Score</th>
                                <th>Defects</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.performances.map((perf) => (
                                <tr key={perf.id}>
                                    <td className="font-medium">{perf.supplier.supplierName}</td>
                                    <td>
                                        <span className="badge badge-neutral">
                                            {perf.woodType.woodCode}
                                        </span>
                                        <span className="ml-2 text-sm text-neutral-600">
                                            {perf.woodType.woodName}
                                        </span>
                                    </td>
                                    <td className="text-sm">
                                        {new Date(perf.periodStart).toLocaleDateString()} -{" "}
                                        {new Date(perf.periodEnd).toLocaleDateString()}
                                    </td>
                                    <td className="font-mono">{formatNumber(perf.totalKubikasi, 1)} m³</td>
                                    <td className="font-mono">{formatNumber(perf.totalWasteKubikasi, 1)} m³</td>
                                    <td>
                                        <span
                                            className={`badge ${perf.wasteRate < 0.15
                                                    ? "badge-success"
                                                    : perf.wasteRate < 0.25
                                                        ? "badge-warning"
                                                        : "badge-danger"
                                                }`}
                                        >
                                            {formatPercentage(perf.wasteRate * 100)}
                                        </span>
                                    </td>
                                    <td>
                                        {perf.qualityScore ? (
                                            <span className="font-semibold">{perf.qualityScore}/100</span>
                                        ) : (
                                            <span className="text-neutral-400">N/A</span>
                                        )}
                                    </td>
                                    <td className="text-sm">
                                        <div className="space-y-1">
                                            {perf.bentWoodPct > 0 && (
                                                <div>Bent: {formatPercentage(perf.bentWoodPct)}</div>
                                            )}
                                            {perf.hollowCenterPct > 0 && (
                                                <div>Hollow: {formatPercentage(perf.hollowCenterPct)}</div>
                                            )}
                                            {perf.crackPct > 0 && (
                                                <div>Crack: {formatPercentage(perf.crackPct)}</div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {data.performances.length === 0 && (
                    <div className="p-12 text-center">
                        <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-neutral-900 mb-2">
                            No performance data available
                        </h3>
                        <p className="text-neutral-600">
                            Performance metrics will appear here once production batches are processed
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
