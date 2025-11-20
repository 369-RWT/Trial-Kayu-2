import { PrismaClient } from "@prisma/client";
import { AlertTriangle } from "lucide-react";
import { formatNumber, formatCurrency } from "@/lib/utils";

const prisma = new PrismaClient();

async function getWasteAnalysisData() {
    // Get waste deviations with related data
    const wasteData = await prisma.wasteDeviation.findMany({
        include: {
            woodType: true,
            supplier: true,
            worker: true,
            batchLineItem: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 100, // Limit to recent 100 for performance
    });

    // Aggregate by waste type
    const byType = await prisma.wasteDeviation.groupBy({
        by: ["wasteType"],
        _sum: {
            kubikasiWaste: true,
            wasteCost: true,
            recoveryValue: true,
        },
        _count: true,
    });

    // Aggregate by wood type
    const byWoodType = await prisma.wasteDeviation.groupBy({
        by: ["woodTypeId"],
        _sum: {
            kubikasiWaste: true,
            wasteCost: true,
        },
    });

    const woodTypeData = await Promise.all(
        byWoodType.map(async (item) => {
            const woodType = await prisma.woodType.findUnique({
                where: { id: item.woodTypeId },
            });
            return {
                woodType: woodType?.woodName || "Unknown",
                kubikasi: item._sum.kubikasiWaste || 0,
                cost: item._sum.wasteCost || 0,
            };
        })
    );

    // Calculate totals
    const totalWaste = wasteData.reduce((sum, w) => sum + w.kubikasiWaste, 0);
    const totalCost = wasteData.reduce((sum, w) => sum + w.wasteCost, 0);
    const totalRecovery = wasteData.reduce((sum, w) => sum + w.recoveryValue, 0);

    return {
        wasteData,
        byType,
        byWoodType: woodTypeData,
        totalWaste,
        totalCost,
        totalRecovery,
    };
}

export default async function WasteAnalysisPage() {
    const data = await getWasteAnalysisData();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Waste Analysis</h1>
                <p className="text-neutral-600 mt-1">
                    Detailed breakdown of waste by type, cause, and disposition
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="stat-label">Total Waste</div>
                    <div className="stat-value">{formatNumber(data.totalWaste, 1)} m³</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Waste Cost</div>
                    <div className="stat-value text-red-600">
                        {formatCurrency(data.totalCost)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Recovery Value</div>
                    <div className="stat-value text-green-600">
                        {formatCurrency(data.totalRecovery)}
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Net Waste Cost</div>
                    <div className="stat-value">
                        {formatCurrency(data.totalCost - data.totalRecovery)}
                    </div>
                </div>
            </div>

            {/* Waste by Type */}
            <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Waste by Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data.byType.map((type) => (
                        <div key={type.wasteType} className="p-4 bg-neutral-50 rounded-lg">
                            <div className="font-semibold text-neutral-900 mb-2">
                                {type.wasteType}
                            </div>
                            <div className="space-y-1 text-sm">
                                <div>
                                    Volume: {formatNumber(type._sum.kubikasiWaste || 0, 1)} m³
                                </div>
                                <div>Cost: {formatCurrency(type._sum.wasteCost || 0)}</div>
                                <div>Count: {type._count} incidents</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Waste by Wood Type */}
            <div className="card p-6">
                <h2 className="text-xl font-semibold mb-4">Waste by Wood Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.byWoodType.map((item, idx) => (
                        <div key={idx} className="p-4 bg-neutral-50 rounded-lg">
                            <div className="font-semibold text-neutral-900 mb-2">
                                {item.woodType}
                            </div>
                            <div className="space-y-1 text-sm">
                                <div>Volume: {formatNumber(item.kubikasi, 1)} m³</div>
                                <div>Cost: {formatCurrency(item.cost)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Waste Events */}
            <div className="card overflow-hidden">
                <div className="p-4 border-b border-neutral-200">
                    <h2 className="text-xl font-semibold">Recent Waste Events</h2>
                    <p className="text-sm text-neutral-600 mt-1">Last 100 waste incidents</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Wood Type</th>
                                <th>Product</th>
                                <th>Waste Type</th>
                                <th>Volume</th>
                                <th>Cost</th>
                                <th>Recovery</th>
                                <th>Disposition</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.wasteData.map((waste) => (
                                <tr key={waste.id}>
                                    <td className="text-sm">
                                        {new Date(waste.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <span className="badge badge-neutral">
                                            {waste.woodType.woodCode}
                                        </span>
                                    </td>
                                    <td className="text-sm">
                                        {waste.batchLineItem.product.productName}
                                    </td>
                                    <td>
                                        <span className="text-sm font-medium">{waste.wasteType}</span>
                                    </td>
                                    <td className="font-mono">
                                        {formatNumber(waste.kubikasiWaste, 2)} m³
                                    </td>
                                    <td className="font-mono text-red-600">
                                        {formatCurrency(waste.wasteCost)}
                                    </td>
                                    <td className="font-mono text-green-600">
                                        {formatCurrency(waste.recoveryValue)}
                                    </td>
                                    <td>
                                        <span className="text-sm">{waste.disposition}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {data.wasteData.length === 0 && (
                    <div className="p-12 text-center">
                        <AlertTriangle className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-neutral-900 mb-2">
                            No waste data available
                        </h3>
                        <p className="text-neutral-600">
                            Waste tracking data will appear here once production begins
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
