"use client";

import { useState } from "react";
import { FileText, Download } from "lucide-react";

type ReportDimension = "woodType" | "product" | "supplier" | "worker" | "batch";
type ReportMetric = "kubikasi" | "cost" | "waste" | "revenue" | "profit";

export default function CustomReportPage() {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [selectedDimensions, setSelectedDimensions] = useState<ReportDimension[]>([]);
    const [selectedMetrics, setSelectedMetrics] = useState<ReportMetric[]>([]);
    const [reportData, setReportData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const dimensions: { value: ReportDimension; label: string }[] = [
        { value: "woodType", label: "Wood Type" },
        { value: "product", label: "Product" },
        { value: "supplier", label: "Supplier" },
        { value: "worker", label: "Worker" },
        { value: "batch", label: "Batch" },
    ];

    const metrics: { value: ReportMetric; label: string }[] = [
        { value: "kubikasi", label: "Kubikasi (m³)" },
        { value: "cost", label: "Cost" },
        { value: "waste", label: "Waste" },
        { value: "revenue", label: "Revenue" },
        { value: "profit", label: "Profit" },
    ];

    const toggleDimension = (dim: ReportDimension) => {
        setSelectedDimensions((prev) =>
            prev.includes(dim) ? prev.filter((d) => d !== dim) : [...prev, dim]
        );
    };

    const toggleMetric = (metric: ReportMetric) => {
        setSelectedMetrics((prev) =>
            prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
        );
    };

    const generateReport = async () => {
        if (!dateFrom || !dateTo || selectedDimensions.length === 0 || selectedMetrics.length === 0) {
            alert("Please select date range, at least one dimension, and at least one metric");
            return;
        }

        setIsLoading(true);
        // Here you would typically call an API endpoint
        // For now, we'll just show a placeholder
        setTimeout(() => {
            setReportData({
                dimensions: selectedDimensions,
                metrics: selectedMetrics,
                period: { from: dateFrom, to: dateTo },
                generated: new Date().toISOString(),
            });
            setIsLoading(false);
        }, 1000);
    };

    const exportReport = (format: "csv" | "pdf") => {
        alert(`Exporting report as ${format.toUpperCase()}...`);
        // Implementation would go here
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Custom Report Builder</h1>
                <p className="text-neutral-600 mt-1">
                    Create custom reports with your choice of dimensions and metrics
                </p>
            </div>

            {/* Report Builder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Date Range */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-neutral-900 mb-4">Date Range</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-2">
                                    From
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-700 block mb-2">
                                    To
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dimensions */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-neutral-900 mb-4">
                            Group By (Dimensions)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {dimensions.map((dim) => (
                                <button
                                    key={dim.value}
                                    onClick={() => toggleDimension(dim.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedDimensions.includes(dim.value)
                                            ? "bg-primary-600 text-white"
                                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                        }`}
                                >
                                    {dim.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Metrics */}
                    <div className="card p-6">
                        <h3 className="font-semibold text-neutral-900 mb-4">Metrics to Show</h3>
                        <div className="flex flex-wrap gap-2">
                            {metrics.map((metric) => (
                                <button
                                    key={metric.value}
                                    onClick={() => toggleMetric(metric.value)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedMetrics.includes(metric.value)
                                            ? "bg-green-600 text-white"
                                            : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                                        }`}
                                >
                                    {metric.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <button
                        onClick={generateReport}
                        disabled={isLoading}
                        className="btn btn-primary w-full py-3"
                    >
                        {isLoading ? "Generating..." : "Generate Report"}
                    </button>
                </div>

                {/* Summary Panel */}
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="font-semibold text-neutral-900 mb-4">Report Summary</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <div className="text-neutral-600 mb-1">Date Range:</div>
                                <div className="font-medium">
                                    {dateFrom && dateTo
                                        ? `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`
                                        : "Not selected"}
                                </div>
                            </div>
                            <div>
                                <div className="text-neutral-600 mb-1">Dimensions:</div>
                                <div className="font-medium">
                                    {selectedDimensions.length > 0
                                        ? selectedDimensions
                                            .map((d) => dimensions.find((dim) => dim.value === d)?.label)
                                            .join(", ")
                                        : "None selected"}
                                </div>
                            </div>
                            <div>
                                <div className="text-neutral-600 mb-1">Metrics:</div>
                                <div className="font-medium">
                                    {selectedMetrics.length > 0
                                        ? selectedMetrics
                                            .map((m) => metrics.find((metric) => metric.value === m)?.label)
                                            .join(", ")
                                        : "None selected"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {reportData && (
                        <div className="card p-6">
                            <h3 className="font-semibold text-neutral-900 mb-4">Export Options</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => exportReport("csv")}
                                    className="btn btn-outline w-full"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as CSV
                                </button>
                                <button
                                    onClick={() => exportReport("pdf")}
                                    className="btn btn-outline w-full"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export as PDF
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Report Results */}
            {reportData && (
                <div className="card p-6">
                    <h2 className="text-xl font-semibold mb-4">Report Results</h2>
                    <div className="bg-neutral-50 p-6 rounded-lg">
                        <div className="text-center text-neutral-600">
                            <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                            <h3 className="font-semibold text-neutral-900 mb-2">
                                Report Generated Successfully
                            </h3>
                            <p className="text-sm">
                                Generated on {new Date(reportData.generated).toLocaleString()}
                            </p>
                            <p className="text-sm mt-2">
                                This is a placeholder. The actual report implementation would fetch and
                                display data based on your selections.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
