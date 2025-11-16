"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WoodType, Supplier } from "@prisma/client";
import { calculateKubikasi, formatCurrency, formatNumber } from "@/lib/utils";
import { Calculator, Save, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";

interface Props {
  woodTypes: WoodType[];
  suppliers: Supplier[];
}

export default function LogPurchaseForm({ woodTypes, suppliers }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form state with nilaiDasar
  const [formData, setFormData] = useState({
    purchaseDate: new Date().toISOString().split("T")[0],
    woodTypeId: "",
    supplierId: "",
    lingkarCm: "",
    panjangM: "",
    jumlahLog: "",
    hargaPerKubik: "",
    nilaiDasar: "785", // User-configurable constant
  });

  // Calculated values
  const [calculation, setCalculation] = useState({
    diameter: 0,
    kubikasiTotal: 0,
    kubikasiFinal: 0,
    totalCost: 0,
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Recalculate if dimension fields change
    if (
      ["lingkarCm", "panjangM", "jumlahLog", "hargaPerKubik", "nilaiDasar"].includes(name)
    ) {
      const updatedData = { ...formData, [name]: value };
      calculateValues(updatedData);
    }
  };

  // Calculate kubikasi and costs
  const calculateValues = (data: typeof formData) => {
    const lingkar = parseFloat(data.lingkarCm) || 0;
    const panjang = parseFloat(data.panjangM) || 0;
    const jumlah = parseInt(data.jumlahLog) || 0;
    const harga = parseFloat(data.hargaPerKubik) || 0;
    const nilaiDasar = parseFloat(data.nilaiDasar) || 785;

    if (lingkar > 0 && panjang > 0 && jumlah > 0) {
      const result = calculateKubikasi(lingkar, panjang, jumlah, nilaiDasar);
      const totalCost = result.kubikasiFinal * harga;

      setCalculation({
        diameter: result.diameter,
        kubikasiTotal: result.kubikasiTotal,
        kubikasiFinal: result.kubikasiFinal,
        totalCost,
      });
    } else {
      setCalculation({
        diameter: 0,
        kubikasiTotal: 0,
        kubikasiFinal: 0,
        totalCost: 0,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/inventory/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          woodTypeId: parseInt(formData.woodTypeId),
          supplierId: parseInt(formData.supplierId),
          lingkarCm: parseFloat(formData.lingkarCm),
          panjangM: parseFloat(formData.panjangM),
          jumlahLog: parseInt(formData.jumlahLog),
          hargaPerKubik: parseFloat(formData.hargaPerKubik),
          nilaiDasar: parseFloat(formData.nilaiDasar),
          kubikasiTotal: calculation.kubikasiTotal,
          kubikasiFinal: calculation.kubikasiFinal,
          totalCost: calculation.totalCost,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details?.join(", ") || error.error || "Failed to create log purchase");
      }

      router.push("/inventory/logs");
      router.refresh();
    } catch (error) {
      console.error("Error creating log purchase:", error);
      alert(error instanceof Error ? error.message : "Failed to create log purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Purchase Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purchase Date */}
          <div>
            <label className="label">Purchase Date</label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          {/* Wood Type */}
          <div>
            <label className="label">Wood Type</label>
            <select
              name="woodTypeId"
              value={formData.woodTypeId}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select wood type...</option>
              {woodTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.woodCode} - {type.woodName}
                </option>
              ))}
            </select>
          </div>

          {/* Supplier */}
          <div className="md:col-span-2">
            <label className="label">Supplier</label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select supplier...</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplierCode} - {supplier.supplierName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Calculator className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-semibold">Log Dimensions & Calculation</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Lingkar */}
          <div>
            <label className="label">Lingkar Kayu (cm)</label>
            <input
              type="number"
              name="lingkarCm"
              value={formData.lingkarCm}
              onChange={handleChange}
              step="0.01"
              min="1"
              max="1000"
              className="input"
              placeholder="e.g., 125.00"
              required
            />
          </div>

          {/* Panjang */}
          <div>
            <label className="label">Panjang Kayu (m)</label>
            <input
              type="number"
              name="panjangM"
              value={formData.panjangM}
              onChange={handleChange}
              step="0.01"
              min="0.1"
              max="100"
              className="input"
              placeholder="e.g., 4.50"
              required
            />
          </div>

          {/* Jumlah Log */}
          <div>
            <label className="label">Jumlah Log</label>
            <input
              type="number"
              name="jumlahLog"
              value={formData.jumlahLog}
              onChange={handleChange}
              min="1"
              max="10000"
              className="input"
              placeholder="e.g., 8"
              required
            />
          </div>

          {/* Nilai Dasar - NEW FIELD */}
          <div className="md:col-span-3">
            <div className="flex items-center space-x-2 mb-1.5">
              <label className="label mb-0">Nilai Dasar (Calculation Constant)</label>
              <div className="group relative">
                <Info className="h-4 w-4 text-neutral-400 cursor-help" />
                <div className="invisible group-hover:visible absolute z-10 w-80 p-3 bg-neutral-900 text-white text-xs rounded-lg shadow-lg -top-2 left-6">
                  <p className="font-semibold mb-1">What is Nilai Dasar?</p>
                  <p className="mb-2">
                    This constant (typically 785) is used in the kubikasi calculation formula.
                    It may vary based on wood type, measurement standards, or local industry practices.
                  </p>
                  <p className="text-neutral-300">
                    Formula: (Diameter² × Length × Nilai Dasar / 10000) × Quantity
                  </p>
                  <p className="text-neutral-300 mt-1">
                    Default: 785 | Valid range: 1-10,000
                  </p>
                </div>
              </div>
            </div>
            <input
              type="number"
              name="nilaiDasar"
              value={formData.nilaiDasar}
              onChange={handleChange}
              min="1"
              max="10000"
              step="1"
              className="input max-w-xs"
              placeholder="785"
              required
            />
            <p className="text-xs text-neutral-500 mt-1">
              Industry standard constant for volume calculation (default: 785)
            </p>
          </div>
        </div>

        {/* Calculation Results */}
        {calculation.kubikasiFinal > 0 && (
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <h3 className="font-semibold text-sm text-neutral-700 mb-3">
              Calculation Results
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-neutral-600">Diameter</div>
                <div className="font-mono font-semibold">
                  {formatNumber(calculation.diameter, 2)} cm
                </div>
              </div>
              <div>
                <div className="text-neutral-600">Kubikasi Total</div>
                <div className="font-mono font-semibold">
                  {formatNumber(calculation.kubikasiTotal, 3)} m³
                </div>
              </div>
              <div>
                <div className="text-neutral-600">Kubikasi Final</div>
                <div className="font-mono font-semibold text-primary-700">
                  {formatNumber(calculation.kubikasiFinal, 0)} m³
                </div>
                <div className="text-xs text-neutral-500">
                  (FLOOR method)
                </div>
              </div>
              <div>
                <div className="text-neutral-600">Formula Used</div>
                <div className="text-xs text-neutral-500 font-mono">
                  (D² × L × {formData.nilaiDasar}) / 10000 × N
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Harga Per Kubik */}
          <div>
            <label className="label">Harga Pasar per Kubik (Rp)</label>
            <input
              type="number"
              name="hargaPerKubik"
              value={formData.hargaPerKubik}
              onChange={handleChange}
              step="1000"
              min="1000"
              max="1000000000"
              className="input"
              placeholder="e.g., 4000000"
              required
            />
          </div>

          {/* Total Cost */}
          <div>
            <label className="label">Total Cost</label>
            <div className="input bg-neutral-50 font-mono font-bold text-lg text-primary-700">
              {formatCurrency(calculation.totalCost)}
            </div>
            {calculation.kubikasiFinal > 0 && (
              <div className="text-xs text-neutral-500 mt-1">
                {formatNumber(calculation.kubikasiFinal, 0)} m³ ×{" "}
                {formatCurrency(parseFloat(formData.hargaPerKubik) || 0)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link href="/inventory/logs" className="btn btn-outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading || calculation.kubikasiFinal === 0}
          className="btn btn-primary"
        >
          {loading ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Log Purchase
            </>
          )}
        </button>
      </div>
    </form>
  );
}
