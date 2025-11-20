"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";

interface LedgerEntry {
    id: number;
    transactionDate: string;
    type: "IN" | "OUT";
    category: string;
    referenceId: string;
    kubikasiChange: number;
    runningBalance: number;
    notes: string;
    woodType: {
        woodName: string;
        woodCode: string;
    };
}

interface WoodType {
    id: number;
    woodName: string;
}

export default function InventoryLedgerPage() {
    const [entries, setEntries] = useState<LedgerEntry[]>([]);
    const [woodTypes, setWoodTypes] = useState<WoodType[]>([]);
    const [selectedWoodTypeId, setSelectedWoodTypeId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWoodTypes();
    }, []);

    useEffect(() => {
        if (selectedWoodTypeId) {
            fetchLedger(selectedWoodTypeId);
        }
    }, [selectedWoodTypeId]);

    const fetchWoodTypes = async () => {
        try {
            const res = await fetch("/api/master/wood-types");
            const data = await res.json();
            const types = data.woodTypes || [];
            setWoodTypes(types);
            if (types.length > 0) {
                setSelectedWoodTypeId(types[0].id.toString());
            }
        } catch (error) {
            console.error("Failed to fetch wood types", error);
        }
    };

    const fetchLedger = async (woodTypeId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/inventory/ledger?woodTypeId=${woodTypeId}`);
            const data = await res.json();
            setEntries(data);
        } catch (error) {
            console.error("Failed to fetch ledger", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Inventory Ledger
                    </h1>
                    <p className="text-slate-500 mt-2">
                        Track inventory movements and historical balance
                    </p>
                </div>
                <div className="w-[200px]">
                    <select
                        value={selectedWoodTypeId}
                        onChange={(e) => setSelectedWoodTypeId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        <option value="" disabled>Select Wood Type</option>
                        {woodTypes.map((wt) => (
                            <option key={wt.id} value={wt.id.toString()}>
                                {wt.woodName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Change (m³)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance (m³)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : entries.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {format(new Date(entry.transactionDate), "dd MMM yyyy HH:mm")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.type === "IN"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                    }`}
                                            >
                                                {entry.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {entry.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                            {entry.referenceId || "-"}
                                        </td>
                                        <td
                                            className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${entry.kubikasiChange > 0
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                                }`}
                                        >
                                            {entry.kubikasiChange > 0 ? "+" : ""}
                                            {entry.kubikasiChange.toFixed(4)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                                            {entry.runningBalance.toFixed(4)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {entry.notes}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
