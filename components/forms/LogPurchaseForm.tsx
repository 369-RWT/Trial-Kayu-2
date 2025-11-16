"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WoodType, Supplier } from "@prisma/client";
import { calculateKubikasi, formatCurrency, formatNumber } from "@/lib/utils";
import { Calculator, Save, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/Spinner";

interface Props {
  woodTypes: WoodType[];
  suppliers: Supplier[];
}

export default function LogPurchaseForm({ woodTypes, suppliers }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Field-level validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Calculated values
  const [calculation, setCalculation] = useState({
    diameter: 0,
    kubikasiTotal: 0,
    kubikasiFinal: 0,
    totalCost: 0,
  });

  // Validate individual field
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "woodTypeId":
        return value ? "" : "Please select a wood type";
      case "supplierId":
        return value ? "" : "Please select a supplier";
      case "lingkarCm":
        const lingkar = parseFloat(value);
        if (!value) return "Lingkar is required";
        if (isNaN(lingkar)) return "Must be a valid number";
        if (lingkar < 1) return "Minimum value is 1 cm";
        if (lingkar > 1000) return "Maximum value is 1000 cm";
        return "";
      case "panjangM":
        const panjang = parseFloat(value);
        if (!value) return "Panjang is required";
        if (isNaN(panjang)) return "Must be a valid number";
        if (panjang < 0.1) return "Minimum value is 0.1 m";
        if (panjang > 100) return "Maximum value is 100 m";
        return "";
      case "jumlahLog":
        const jumlah = parseInt(value);
        if (!value) return "Jumlah log is required";
        if (isNaN(jumlah)) return "Must be a valid number";
        if (jumlah < 1) return "Minimum value is 1";
        if (jumlah > 10000) return "Maximum value is 10,000";
        return "";
      case "hargaPerKubik":
        const harga = parseFloat(value);
        if (!value) return "Price is required";
        if (isNaN(harga)) return "Must be a valid number";
        if (harga < 1000) return "Minimum value is Rp 1,000";
        if (harga > 1000000000) return "Maximum value is Rp 1,000,000,000";
        return "";
      case "nilaiDasar":
        const nilai = parseFloat(value);
        if (!value) return "Nilai Dasar is required";
        if (isNaN(nilai)) return "Must be a valid number";
        if (nilai < 1) return "Minimum value is 1";
        if (nilai > 10000) return "Maximum value is 10,000";
        return "";
      default:
        return "";
    }
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate field
    const error = validateField(name, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

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
    setError(""); // Clear any previous errors

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

      const data = await response.json();
      toast.success("Log purchase created successfully!", {
        description: `Log tag: ${data.log.logTag}`
      });

      router.push("/inventory/logs");
      router.refresh();
    } catch (error) {
      console.error("Error creating log purchase:", error);
      toast.error("Failed to create log purchase", {
        description: error instanceof Error ? error.message : "Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg" role="alert">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-6">Purchase Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Purchase Date */}
          <div>
            <label className="label">Purchase Date <span className="text-red-600">*</span></label>
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
            <label className="label">Wood Type <span className="text-red-600">*</span></label>
            <select
              name="woodTypeId"
              value={formData.woodTypeId}
              onChange={handleChange}
              className={`input ${fieldErrors.woodTypeId ? 'border-red-500 focus:ring-red-500' : ''}`}
              required
              aria-invalid={!!fieldErrors.woodTypeId}
              aria-describedby={fieldErrors.woodTypeId ? "woodTypeId-error" : undefined}
            >
              <option value="">Select wood type...</option>
              {woodTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.woodCode} - {type.woodName}
                </option>
              ))}
            </select>
            {fieldErrors.woodTypeId && (
              <p id="woodTypeId-error" className="text-sm text-red-600 mt-1" role="alert">
                {fieldErrors.woodTypeId}
              </p>
            )}
          </div>

          {/* Supplier */}
          <div className="md:col-span-2">
            <label className="label">Supplier <span className="text-red-600">*</span></label>
            <select
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              className={`input ${fieldErrors.supplierId ? 'border-red-500 focus:ring-red-500' : ''}`}
              required
              aria-invalid={!!fieldErrors.supplierId}
              aria-describedby={fieldErrors.supplierId ? "supplierId-error" : undefined}
            >
              <option value="">Select supplier...</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplierCode} - {supplier.supplierName}
                </option>
              ))}
            </select>
            {fieldErrors.supplierId && (
              <p id="supplierId-error" className="text-sm text-red-600 mt-1" role="alert">
                {fieldErrors.supplierId}
              </p>
            )}
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
            <label className="label">Lingkar Kayu (cm) <span className="text-red-600">*</span></label>
            <input
              type="number"
              name="lingkarCm"
              value={formData.lingkarCm}
              onChange={handleChange}
              step="0.01"
              min="1"
              max="1000"
              className={`input ${fieldErrors.lingkarCm ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., 125.00"
              required
              aria-invalid={!!fieldErrors.lingkarCm}
              aria-describedby={fieldErrors.lingkarCm ? "lingkarCm-error" : undefined}
            />
            {fieldErrors.lingkarCm && (
              <p id="lingkarCm-error" className="text-sm text-red-600 mt-1" role="alert">
                {fieldErrors.lingkarCm}
              </p>
            )}
          </div>

          {/* Panjang */}
          <div>
            <label className="label">Panjang Kayu (m) <span className="text-red-600">*</span></label>
            <input
              type="number"
              name="panjangM"
              value={formData.panjangM}
              onChange={handleChange}
              step="0.01"
              min="0.1"
              max="100"
              className={`input ${fieldErrors.panjangM ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., 4.50"
              required
              aria-invalid={!!fieldErrors.panjangM}
              aria-describedby={fieldErrors.panjangM ? "panjangM-error" : undefined}
            />
            {fieldErrors.panjangM && (
              <p id="panjangM-error" className="text-sm text-red-600 mt-1" role="alert">
                {fieldErrors.panjangM}
              </p>
            )}
          </div>

          {/* Jumlah Log */}
          <div>
            <label className="label">Jumlah Log <span className="text-red-600">*</span></label>
            <input
              type="number"
              name="jumlahLog"
              value={formData.jumlahLog}
              onChange={handleChange}
              min="1"
              max="10000"
              className={`input ${fieldErrors.jumlahLog ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., 8"
              required
              aria-invalid={!!fieldErrors.jumlahLog}
              aria-describedby={fieldErrors.jumlahLog ? "jumlahLog-error" : undefined}
            />
            {fieldErrors.jumlahLog && (
              <p id="jumlahLog-error" className="text-sm text-red-600 mt-1" role="alert">
                {fieldErrors.jumlahLog}
              </p>
            )}
          </div>

          {/* Nilai Dasar - NEW FIELD */}
          <div className="md:col-span-3">
            <div className="flex items-center space-x-2 mb-1.5">
              <label className="label mb-0">Nilai Dasar (Calculation Constant) <span className="text-red-600">*</span></label>
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
              className={`input max-w-xs ${fieldErrors.nilaiDasar ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="785"
              required
              aria-invalid={!!fieldErrors.nilaiDasar}
              aria-describedby={fieldErrors.nilaiDasar ? "nilaiDasar-error" : undefined}
            />
            {fieldErrors.nilaiDasar ? (
              <p id="nilaiDasar-error" className="text-sm text-red-600 mt-1" role="alert">
                {fieldErrors.nilaiDasar}
              </p>
            ) : (
              <p className="text-xs text-neutral-500 mt-1">
                Industry standard constant for volume calculation (default: 785)
              </p>
            )}
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
            <label className="label">Harga Pasar per Kubik (Rp) <span className="text-red-600">*</span></label>
            <input
              type="number"
              name="hargaPerKubik"
              value={formData.hargaPerKubik}
              onChange={handleChange}
              step="1000"
              min="1000"
              max="1000000000"
              className={`input ${fieldErrors.hargaPerKubik ? 'border-red-500 focus:ring-red-500' : ''}`}
              placeholder="e.g., 4000000"
              required
              aria-invalid={!!fieldErrors.hargaPerKubik}
              aria-describedby={fieldErrors.hargaPerKubik ? "hargaPerKubik-error" : undefined}
            />
            {fieldErrors.hargaPerKubik && (
              <p id="hargaPerKubik-error" className="text-sm text-red-600 mt-1" role="alert">
                {fieldErrors.hargaPerKubik}
              </p>
            )}
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
