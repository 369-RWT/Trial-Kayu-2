/**
 * Kubikasi Formula Calibration Dataset
 *
 * This dataset should be verified with domain experts (wood industry professionals)
 * to ensure calculation accuracy before production use.
 *
 * IMPORTANT: The values marked as "Expected" are ESTIMATES and must be validated
 * against real-world measurements from actual log processing.
 */

export interface CalibrationSample {
  id: string;
  description: string;
  input: {
    lingkarCm: number;
    panjangM: number;
    jumlahLog: number;
    nilaiDasar: number;
  };
  calculated: {
    diameter: number;
    kubikasiTotal: number;
    kubikasiFinal: number;
  };
  expected?: {
    kubikasiMin: number;
    kubikasiMax: number;
    notes: string;
  };
  realWorld?: {
    actual: number;
    variance: number;
    verifiedBy: string;
    verifiedDate: string;
  };
}

export const calibrationDataset: CalibrationSample[] = [
  {
    id: 'CAL-001',
    description: 'Standard Jati log from documentation example',
    input: {
      lingkarCm: 125,
      panjangM: 4.5,
      jumlahLog: 8,
      nilaiDasar: 785,
    },
    calculated: {
      diameter: 31.25,
      kubikasiTotal: 2759.766,
      kubikasiFinal: 2759,
    },
    expected: {
      kubikasiMin: 90,
      kubikasiMax: 110,
      notes: 'Documentation suggests ~100m³ but calculation gives 2,759m³. REQUIRES VERIFICATION',
    },
  },
  {
    id: 'CAL-002',
    description: 'Small Meranti log',
    input: {
      lingkarCm: 100,
      panjangM: 3.0,
      jumlahLog: 5,
      nilaiDasar: 785,
    },
    calculated: {
      diameter: 25,
      kubikasiTotal: 1171.875,
      kubikasiFinal: 1171,
    },
    expected: {
      kubikasiMin: 35,
      kubikasiMax: 45,
      notes: 'Needs verification with supplier measurements',
    },
  },
  {
    id: 'CAL-003',
    description: 'Large Mahoni log',
    input: {
      lingkarCm: 150,
      panjangM: 6.0,
      jumlahLog: 10,
      nilaiDasar: 785,
    },
    calculated: {
      diameter: 37.5,
      kubikasiTotal: 6621.094,
      kubikasiFinal: 6621,
    },
    expected: {
      kubikasiMin: 200,
      kubikasiMax: 250,
      notes: 'Large log sample - verify with actual measurements',
    },
  },
  {
    id: 'CAL-004',
    description: 'Test with alternative nilaiDasar value',
    input: {
      lingkarCm: 125,
      panjangM: 4.5,
      jumlahLog: 8,
      nilaiDasar: 1000, // Alternative constant
    },
    calculated: {
      diameter: 31.25,
      kubikasiTotal: 3515.625,
      kubikasiFinal: 3515,
    },
    expected: {
      kubikasiMin: 115,
      kubikasiMax: 140,
      notes: 'Testing if different nilaiDasar aligns better with expected ~100m³',
    },
  },
  {
    id: 'CAL-005',
    description: 'Test with geometric circle formula (π)',
    input: {
      lingkarCm: 125,
      panjangM: 4.5,
      jumlahLog: 8,
      nilaiDasar: 785,
    },
    calculated: {
      diameter: 39.79, // Using π instead of /4
      kubikasiTotal: 4473.2, // Recalculated with correct diameter
      kubikasiFinal: 4473,
    },
    expected: {
      kubikasiMin: 135,
      kubikasiMax: 165,
      notes: 'Using geometrically correct diameter = lingkar/π instead of lingkar/4',
    },
  },
];

/**
 * Calibration Test Results
 *
 * To run calibration tests:
 * 1. Obtain real-world measurements from wood processing facility
 * 2. Update the realWorld field for each sample
 * 3. Run tests to compare calculated vs actual
 * 4. Adjust nilaiDasar or formula if necessary
 */

export const calibrationInstructions = `
KUBIKASI FORMULA CALIBRATION INSTRUCTIONS
==========================================

CRITICAL: This formula MUST be verified before production use!

STEPS TO CALIBRATE:

1. GATHER REAL-WORLD DATA
   - Collect at least 10 samples from actual log processing
   - Measure: lingkar (cm), panjang (m), jumlah
   - Record: actual kubikasi (verified by industry standard measurement)

2. COMPARE CALCULATED VS ACTUAL
   - Run calculation with current formula
   - Compare with actual measurements
   - Calculate variance percentage

3. ADJUST IF NECESSARY
   - If variance > 5%, formula needs adjustment
   - Possible adjustments:
     a) Change nilaiDasar constant (currently 785)
     b) Use correct diameter formula (lingkar/π instead of lingkar/4)
     c) Verify measurement units and conversions

4. DOCUMENT RESULTS
   - Update calibrationDataset with realWorld values
   - Document formula changes
   - Get approval from domain expert

5. ACCEPTANCE CRITERIA
   - Variance < 5% for at least 90% of samples
   - Domain expert sign-off
   - Cross-verify with industry standards

CURRENT ISSUES:
- Documentation example expects ~100m³ but formula gives 2,759m³
- This is a 27x discrepancy - UNACCEPTABLE
- Possible explanations:
  1. Wrong nilaiDasar value
  2. Incorrect diameter calculation (should be lingkar/π)
  3. Missing unit conversion
  4. Documentation error

ACTION REQUIRED:
✅ Consult with wood industry expert
✅ Obtain calibration samples from suppliers
✅ Verify measurement standards
✅ Update formula if necessary
`;

export function getCalibrationStatus() {
  const verified = calibrationDataset.filter(s => s.realWorld).length;
  const total = calibrationDataset.length;

  return {
    verified,
    total,
    percentage: (verified / total) * 100,
    status: verified === 0 ? 'NOT_CALIBRATED' : verified < total ? 'PARTIAL' : 'COMPLETE',
  };
}
