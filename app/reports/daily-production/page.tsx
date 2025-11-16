"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Download, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";

interface ProductionReport {
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  productionBatches: Array<{
    batchId: string;
    productionDate: string;
    shift: number;
    status: string;
    lineItems: Array<{
      lineNumber: number;
      woodType: { code: string; name: string };
      product: { code: string; name: string };
      worker: { code: string; name: string } | null;
      machineType: string | null;
      targetKubikasi: number;
      actualOutputKubikasi: number;
      totalInputKubikasi: number;
      totalWasteKubikasi: number;
      wasteRate: number;
      wacPerKubik: number;
      materialCost: number;
      materialCostPerKubik: number;
      efficiency: number;
      status: string;
    }>;
    totals: {
      targetKubikasi: number;
      actualOutputKubikasi: number;
      totalInputKubikasi: number;
      totalWasteKubikasi: number;
      materialCost: number;
      wasteRate: number;
      efficiency: number;
    };
  }>;
  summary: {
    targetKubikasi: number;
    actualOutputKubikasi: number;
    totalInputKubikasi: number;
    totalWasteKubikasi: number;
    materialCost: number;
    batchCount: number;
    averageWasteRate: number;
    overallEfficiency: number;
    averageCostPerKubik: number;
  };
  generatedAt: string;
  generatedBy: string;
}

export default function DailyProductionReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ProductionReport | null>(null);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && startDate && endDate) {
      fetchReport();
    }
  }, [status, startDate, endDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/reports/daily-production?startDate=${startDate}&endDate=${endDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Achieved":
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Partial":
      case "In-Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Not Started":
      case "Planned":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Daily Production Summary
          </h1>
          <p className="text-gray-600">
            Production performance, efficiency, and material usage analysis
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={fetchReport}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              {loading ? "Loading..." : "Generate Report"}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Print / Export
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Report Content */}
        {report && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total Batches</div>
                <div className="text-2xl font-bold text-gray-900">
                  {report.summary.batchCount}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Output (Actual/Target)</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(report.summary.actualOutputKubikasi)} m³
                </div>
                <div className="text-sm text-gray-500">
                  Target: {formatNumber(report.summary.targetKubikasi)} m³
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Overall Efficiency</div>
                <div
                  className={`text-2xl font-bold ${
                    report.summary.overallEfficiency >= 100
                      ? "text-green-600"
                      : report.summary.overallEfficiency >= 80
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {formatPercentage(report.summary.overallEfficiency)}
                </div>
                <div className="flex items-center text-sm mt-1">
                  {report.summary.overallEfficiency >= 100 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Avg Waste Rate</div>
                <div
                  className={`text-2xl font-bold ${
                    report.summary.averageWasteRate <= 0.15
                      ? "text-green-600"
                      : report.summary.averageWasteRate <= 0.25
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {formatPercentage(report.summary.averageWasteRate * 100)}
                </div>
              </div>
            </div>

            {/* Material Cost Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Material Cost Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Material Cost</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(report.summary.materialCost)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Avg Cost Per Kubikasi</div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(report.summary.averageCostPerKubik)} / m³
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Input</div>
                  <div className="text-xl font-bold text-gray-900">
                    {formatNumber(report.summary.totalInputKubikasi)} m³
                  </div>
                </div>
              </div>
            </div>

            {/* Production Batches */}
            {report.productionBatches.map((batch) => (
              <div key={batch.batchId} className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Batch {batch.batchId}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(batch.productionDate).toLocaleDateString()} - Shift{" "}
                        {batch.shift}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        batch.status
                      )}`}
                    >
                      {batch.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  {/* Line Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left font-semibold">#</th>
                          <th className="px-4 py-3 text-left font-semibold">Wood</th>
                          <th className="px-4 py-3 text-left font-semibold">Product</th>
                          <th className="px-4 py-3 text-right font-semibold">
                            Target (m³)
                          </th>
                          <th className="px-4 py-3 text-right font-semibold">
                            Actual (m³)
                          </th>
                          <th className="px-4 py-3 text-right font-semibold">
                            Efficiency
                          </th>
                          <th className="px-4 py-3 text-right font-semibold">
                            Waste Rate
                          </th>
                          <th className="px-4 py-3 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batch.lineItems.map((item) => (
                          <tr key={item.lineNumber} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{item.lineNumber}</td>
                            <td className="px-4 py-3">
                              {item.woodType.code}
                            </td>
                            <td className="px-4 py-3">{item.product.code}</td>
                            <td className="px-4 py-3 text-right">
                              {formatNumber(item.targetKubikasi)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {formatNumber(item.actualOutputKubikasi)}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-medium ${
                                item.efficiency >= 100
                                  ? "text-green-600"
                                  : item.efficiency >= 80
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatPercentage(item.efficiency)}
                            </td>
                            <td
                              className={`px-4 py-3 text-right font-medium ${
                                item.wasteRate <= 0.15
                                  ? "text-green-600"
                                  : item.wasteRate <= 0.25
                                  ? "text-yellow-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatPercentage(item.wasteRate * 100)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded text-xs ${getStatusColor(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 font-semibold">
                        <tr>
                          <td colSpan={3} className="px-4 py-3">
                            Batch Totals
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatNumber(batch.totals.targetKubikasi)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatNumber(batch.totals.actualOutputKubikasi)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatPercentage(batch.totals.efficiency)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {formatPercentage(batch.totals.wasteRate * 100)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            ))}

            {/* No Data Message */}
            {report.productionBatches.length === 0 && (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500">
                  No production batches found for the selected date range.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
              Generated on {new Date(report.generatedAt).toLocaleString()} by{" "}
              {report.generatedBy}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
