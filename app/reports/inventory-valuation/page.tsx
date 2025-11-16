"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Calendar, Download, RefreshCw } from "lucide-react";

interface InventoryReport {
  reportDate: string;
  reportPeriod: {
    startDate: string;
    endDate: string;
  };
  inventoryByWoodType: Array<{
    woodType: {
      id: number;
      woodCode: string;
      woodName: string;
    };
    valuation: {
      valuationDate: string;
      openingKubikasi: number;
      openingValue: number;
      purchaseKubikasi: number;
      purchaseValue: number;
      consumedKubikasi: number;
      consumedValue: number;
      closingKubikasi: number;
      closingValue: number;
      wacPerKubik: number;
    };
    currentInventory: {
      totalKubikasi: number;
      totalValue: number;
      totalLogs: number;
      supplierBreakdown: Array<{
        supplierCode: string;
        supplierName: string;
        kubikasi: number;
        value: number;
        logCount: number;
      }>;
    };
  }>;
  totals: {
    openingValue: number;
    purchaseValue: number;
    consumedValue: number;
    closingValue: number;
    totalKubikasi: number;
    totalLogs: number;
  };
  generatedAt: string;
  generatedBy: string;
}

export default function InventoryValuationReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<InventoryReport | null>(null);
  const [error, setError] = useState("");
  const [reportDate, setReportDate] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setReportDate(today);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && reportDate) {
      fetchReport();
    }
  }, [status, reportDate]);

  const fetchReport = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `/api/reports/inventory-valuation?date=${reportDate}`
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
            Inventory Valuation Report
          </h1>
          <p className="text-gray-600">
            Current inventory levels, valuations, and movements by wood type
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
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
                <div className="text-sm text-gray-600 mb-1">Total Inventory Value</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(report.totals.closingValue)}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total Kubikasi</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(report.totals.totalKubikasi)} m³
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Total Logs</div>
                <div className="text-2xl font-bold text-gray-900">
                  {report.totals.totalLogs}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600 mb-1">Purchase Value (30d)</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(report.totals.purchaseValue)}
                </div>
              </div>
            </div>

            {/* Wood Type Details */}
            {report.inventoryByWoodType.map((item) => (
              <div key={item.woodType.id} className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {item.woodType.woodCode} - {item.woodType.woodName}
                  </h3>
                </div>
                <div className="p-6">
                  {/* Valuation Summary */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Opening</div>
                      <div className="font-semibold">
                        {formatNumber(item.valuation.openingKubikasi)} m³
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.valuation.openingValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Purchased (30d)</div>
                      <div className="font-semibold text-green-600">
                        +{formatNumber(item.valuation.purchaseKubikasi)} m³
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.valuation.purchaseValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Consumed (30d)</div>
                      <div className="font-semibold text-red-600">
                        -{formatNumber(item.valuation.consumedKubikasi)} m³
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.valuation.consumedValue)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Closing</div>
                      <div className="font-semibold">
                        {formatNumber(item.valuation.closingKubikasi)} m³
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(item.valuation.closingValue)}
                      </div>
                    </div>
                  </div>

                  {/* WAC and Supplier Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Weighted Average Cost (WAC)
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatCurrency(item.valuation.wacPerKubik)} / m³
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Supplier Breakdown
                      </div>
                      {item.currentInventory.supplierBreakdown.length > 0 ? (
                        <div className="space-y-2">
                          {item.currentInventory.supplierBreakdown.map((supplier) => (
                            <div
                              key={supplier.supplierCode}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-700">
                                {supplier.supplierCode} - {supplier.supplierName}
                              </span>
                              <span className="font-medium">
                                {formatNumber(supplier.kubikasi)} m³
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          No inventory for this wood type
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

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
