import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Format number as Indonesian Rupiah currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format number with thousand separators
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format date to Indonesian format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

/**
 * Format date to short format (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Calculate kubikasi from log dimensions
 * Formula: (Diameter × Diameter × Panjang × 785) × Jumlah Log
 * Where Diameter = Lingkar ÷ 4
 */
export function calculateKubikasi(
  lingkarCm: number,
  panjangM: number,
  jumlahLog: number,
  nilaiDasar: number = 785
): { kubikasiTotal: number; kubikasiFinal: number; diameter: number } {
  const diameter = lingkarCm / 4;
  const kubikasiTotal =
    ((diameter * diameter * panjangM * nilaiDasar) / 10000) * jumlahLog;
  const kubikasiFinal = Math.floor(kubikasiTotal);

  return {
    diameter,
    kubikasiTotal,
    kubikasiFinal,
  };
}

/**
 * Generate log tag
 * Format: [Wood Code]-[Supplier Code]-[Date]-[Sequence]
 * Example: JT-SUP01-20251102-001
 */
export function generateLogTag(
  woodCode: string,
  supplierCode: string,
  date: Date,
  sequence: number
): string {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const seqStr = sequence.toString().padStart(3, "0");
  return `${woodCode}-${supplierCode}-${dateStr}-${seqStr}`;
}

/**
 * Calculate waste percentage
 */
export function calculateWastePercentage(
  wasteKubikasi: number,
  totalInputKubikasi: number
): number {
  if (totalInputKubikasi === 0) return 0;
  return (wasteKubikasi / totalInputKubikasi) * 100;
}

/**
 * Calculate margin percentage
 */
export function calculateMarginPercentage(
  sellingPrice: number,
  cost: number
): number {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - cost) / sellingPrice) * 100;
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    Available: "badge-success",
    Partial: "badge-warning",
    Consumed: "badge-neutral",
    Planned: "badge-info",
    "In-Progress": "badge-warning",
    Completed: "badge-success",
  };
  return statusMap[status] || "badge-neutral";
}

/**
 * Get waste type label
 */
export function getWasteTypeLabel(wasteType: string): string {
  const labels: Record<string, string> = {
    Bent: "Bent Wood",
    Hollow: "Hollow Center",
    Crack: "Crack",
    Method: "Production Method",
  };
  return labels[wasteType] || wasteType;
}

/**
 * Get disposition label
 */
export function getDispositionLabel(disposition: string): string {
  const labels: Record<string, string> = {
    Scrap: "Scrap - No Value",
    Resale: "Resale",
    Alternative: "Alternative Production",
  };
  return labels[disposition] || disposition;
}

/**
 * Calculate days between dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * Get quality score color
 */
export function getQualityScoreColor(score: number): string {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-yellow-600";
  return "text-red-600";
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
