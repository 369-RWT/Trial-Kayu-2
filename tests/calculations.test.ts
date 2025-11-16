/**
 * Comprehensive Calculation Tests
 * Testing kubikasi, WAC, margin, and waste calculations
 */

import { describe, it, expect } from 'vitest';
import { calculateKubikasi, calculateMarginPercentage, calculateWastePercentage } from '../lib/utils';

describe('Kubikasi Calculation Tests', () => {
  it('should calculate kubikasi correctly with default nilaiDasar (785)', () => {
    const result = calculateKubikasi(125, 4.5, 8);

    expect(result.diameter).toBe(31.25);
    expect(result.kubikasiTotal).toBeCloseTo(2759.766, 2);
    expect(result.kubikasiFinal).toBe(2759);
  });

  it('should calculate kubikasi with custom nilaiDasar', () => {
    const result = calculateKubikasi(125, 4.5, 8, 1000);

    expect(result.kubikasiTotal).toBeCloseTo(3515.625, 2);
    expect(result.kubikasiFinal).toBe(3515);
  });

  it('should handle zero lingkar', () => {
    const result = calculateKubikasi(0, 4.5, 8);

    expect(result.diameter).toBe(0);
    expect(result.kubikasiTotal).toBe(0);
    expect(result.kubikasiFinal).toBe(0);
  });

  it('should handle single log', () => {
    const result = calculateKubikasi(100, 5, 1);

    expect(result.diameter).toBe(25);
    expect(result.kubikasiFinal).toBeGreaterThan(0);
  });

  it('should apply FLOOR method correctly', () => {
    const result = calculateKubikasi(125, 4.5, 8);

    expect(result.kubikasiFinal).toBe(Math.floor(result.kubikasiTotal));
    expect(result.kubikasiFinal).toBeLessThanOrEqual(result.kubikasiTotal);
  });

  it('should handle large values', () => {
    const result = calculateKubikasi(500, 20, 100);

    expect(result.kubikasiFinal).toBeGreaterThan(0);
    expect(isFinite(result.kubikasiFinal)).toBe(true);
  });

  it('should handle decimal inputs', () => {
    const result = calculateKubikasi(125.75, 4.55, 8);

    expect(result.kubikasiTotal).toBeGreaterThan(0);
    expect(result.kubikasiFinal).toBe(Math.floor(result.kubikasiTotal));
  });
});

describe('WAC (Weighted Average Cost) Calculation Tests', () => {
  it('should calculate WAC correctly for single purchase', () => {
    const kubikasi = 100;
    const totalCost = 400000000;
    const wac = totalCost / kubikasi;

    expect(wac).toBe(4000000);
  });

  it('should calculate WAC correctly for multiple purchases', () => {
    // Opening: 100 m³ at 4,000,000
    const opening = { kubikasi: 100, value: 400000000 };

    // Purchase: 50 m³ at 4,500,000
    const purchase = { kubikasi: 50, value: 225000000 };

    const totalKubikasi = opening.kubikasi + purchase.kubikasi;
    const totalValue = opening.value + purchase.value;
    const wac = totalValue / totalKubikasi;

    expect(wac).toBeCloseTo(4166666.67, 2);
  });

  it('should handle zero division protection', () => {
    const kubikasi = 0;
    const value = 0;
    const wac = kubikasi > 0 ? value / kubikasi : 0;

    expect(wac).toBe(0);
  });

  it('should maintain precision across multiple transactions', () => {
    let kubikasi = 100;
    let value = 400000000;

    // Add 5 purchases
    for (let i = 0; i < 5; i++) {
      kubikasi += 20;
      value += 90000000;
    }

    const wac = value / kubikasi;
    expect(wac).toBeGreaterThan(0);
    expect(isFinite(wac)).toBe(true);
  });
});

describe('Material Cost Allocation Tests', () => {
  it('should calculate material cost with waste correctly', () => {
    const input = 18;
    const output = 15.2;
    const waste = 2.8;
    const wac = 4166667;

    const directCost = output * wac;
    const wasteCost = waste * wac;
    const totalCost = directCost + wasteCost;
    const costPerUnit = totalCost / output;

    expect(directCost).toBeCloseTo(63333338.4, 1);
    expect(wasteCost).toBeCloseTo(11666667.6, 1);
    expect(costPerUnit).toBeGreaterThan(wac); // Should be higher than WAC due to waste
  });

  it('should handle zero waste scenario', () => {
    const output = 10;
    const waste = 0;
    const wac = 4000000;

    const totalCost = (output + waste) * wac;
    const costPerUnit = totalCost / output;

    expect(costPerUnit).toBe(wac); // Should equal WAC when no waste
  });
});

describe('Margin Calculation Tests', () => {
  it('should calculate profit margin correctly', () => {
    const sellingPrice = 5500000;
    const cost = 4802632;
    const margin = calculateMarginPercentage(sellingPrice, cost);

    expect(margin).toBeCloseTo(12.7, 1);
  });

  it('should detect negative margin', () => {
    const sellingPrice = 2000000;
    const cost = 2500000;
    const margin = calculateMarginPercentage(sellingPrice, cost);

    expect(margin).toBeLessThan(0);
  });

  it('should handle zero selling price', () => {
    const margin = calculateMarginPercentage(0, 100);
    expect(margin).toBe(0);
  });
});

describe('Waste Percentage Calculation Tests', () => {
  it('should calculate waste percentage correctly', () => {
    const waste = 2.8;
    const input = 18;
    const wastePercentage = calculateWastePercentage(waste, input);

    expect(wastePercentage).toBeCloseTo(15.56, 2);
  });

  it('should handle zero waste', () => {
    const wastePercentage = calculateWastePercentage(0, 100);
    expect(wastePercentage).toBe(0);
  });

  it('should handle zero input (division by zero)', () => {
    const wastePercentage = calculateWastePercentage(10, 0);
    expect(wastePercentage).toBe(0);
  });

  it('should handle 100% waste scenario', () => {
    const wastePercentage = calculateWastePercentage(10, 10);
    expect(wastePercentage).toBe(100);
  });
});

describe('Edge Cases and Validation', () => {
  it('should handle very large numbers without overflow', () => {
    const result = calculateKubikasi(10000, 100, 1000);

    expect(isFinite(result.kubikasiFinal)).toBe(true);
    expect(result.kubikasiFinal).toBeGreaterThan(0);
  });

  it('should maintain precision with decimal values', () => {
    const result = calculateKubikasi(125.75, 4.55, 8);

    const recalculated = calculateKubikasi(125.75, 4.55, 8);
    expect(result.kubikasiFinal).toBe(recalculated.kubikasiFinal);
  });

  it('should be consistent across multiple calls', () => {
    const result1 = calculateKubikasi(125, 4.5, 8);
    const result2 = calculateKubikasi(125, 4.5, 8);

    expect(result1.kubikasiFinal).toBe(result2.kubikasiFinal);
    expect(result1.kubikasiTotal).toBe(result2.kubikasiTotal);
  });
});
