/**
 * Input Validation Tests
 * Testing Zod schemas for security vulnerabilities
 */

import { describe, it, expect } from 'vitest';
import { LogPurchaseSchema, validateInput } from '../lib/validation';

describe('Log Purchase Validation Tests', () => {
  const validInput = {
    woodTypeId: 1,
    supplierId: 1,
    purchaseDate: new Date().toISOString(),
    lingkarCm: 125,
    panjangM: 4.5,
    jumlahLog: 8,
    hargaPerKubik: 4000000,
    nilaiDasar: 785,
  };

  it('should accept valid input', () => {
    const result = validateInput(LogPurchaseSchema, validInput);
    expect(result.success).toBe(true);
  });

  it('should reject negative lingkarCm', () => {
    const result = validateInput(LogPurchaseSchema, {
      ...validInput,
      lingkarCm: -100,
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative hargaPerKubik', () => {
    const result = validateInput(LogPurchaseSchema, {
      ...validInput,
      hargaPerKubik: -1000000,
    });
    expect(result.success).toBe(false);
  });

  it('should reject non-integer woodTypeId', () => {
    const result = validateInput(LogPurchaseSchema, {
      ...validInput,
      woodTypeId: 1.5,
    });
    expect(result.success).toBe(false);
  });

  it('should reject lingkarCm exceeding maximum', () => {
    const result = validateInput(LogPurchaseSchema, {
      ...validInput,
      lingkarCm: 2000,
    });
    expect(result.success).toBe(false);
  });

  it('should reject jumlahLog exceeding maximum', () => {
    const result = validateInput(LogPurchaseSchema, {
      ...validInput,
      jumlahLog: 20000,
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid date format', () => {
    const result = validateInput(LogPurchaseSchema, {
      ...validInput,
      purchaseDate: 'invalid-date',
    });
    expect(result.success).toBe(false);
  });

  it('should use default nilaiDasar if not provided', () => {
    const { nilaiDasar, ...inputWithoutNilaiDasar } = validInput;
    const result = validateInput(LogPurchaseSchema, inputWithoutNilaiDasar);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.nilaiDasar).toBe(785);
    }
  });

  it('should reject nilaiDasar outside valid range', () => {
    const result = validateInput(LogPurchaseSchema, {
      ...validInput,
      nilaiDasar: 15000,
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const { woodTypeId, ...incomplete } = validInput;
    const result = validateInput(LogPurchaseSchema, incomplete);
    expect(result.success).toBe(false);
  });
});

describe('Security Attack Vector Tests', () => {
  it('should prevent SQL injection via type confusion', () => {
    const result = validateInput(LogPurchaseSchema, {
      woodTypeId: "1 OR 1=1",
      supplierId: 1,
      purchaseDate: new Date().toISOString(),
      lingkarCm: 125,
      panjangM: 4.5,
      jumlahLog: 8,
      hargaPerKubik: 4000000,
    });
    expect(result.success).toBe(false);
  });

  it('should prevent integer overflow', () => {
    const result = validateInput(LogPurchaseSchema, {
      woodTypeId: 1,
      supplierId: 1,
      purchaseDate: new Date().toISOString(),
      lingkarCm: Number.MAX_SAFE_INTEGER,
      panjangM: 4.5,
      jumlahLog: 8,
      hargaPerKubik: 4000000,
    });
    expect(result.success).toBe(false);
  });

  it('should prevent NaN injection', () => {
    const result = validateInput(LogPurchaseSchema, {
      woodTypeId: 1,
      supplierId: 1,
      purchaseDate: new Date().toISOString(),
      lingkarCm: NaN,
      panjangM: 4.5,
      jumlahLog: 8,
      hargaPerKubik: 4000000,
    });
    expect(result.success).toBe(false);
  });

  it('should prevent Infinity injection', () => {
    const result = validateInput(LogPurchaseSchema, {
      woodTypeId: 1,
      supplierId: 1,
      purchaseDate: new Date().toISOString(),
      lingkarCm: Infinity,
      panjangM: 4.5,
      jumlahLog: 8,
      hargaPerKubik: 4000000,
    });
    expect(result.success).toBe(false);
  });
});
