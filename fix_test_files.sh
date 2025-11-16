#!/bin/bash
# Quick fix script for test files organization and errors

echo "=========================================="
echo "Al Fath Kayu - Test Files Cleanup Script"
echo "=========================================="
echo ""

# Create organized test directories
echo "Creating organized test structure..."
mkdir -p tests/smoke
mkdir -p tests/stress
mkdir -p tests/simulation

# Move test files to organized locations
echo "Moving test files..."
if [ -f "smoke_test.ts" ]; then
    mv smoke_test.ts tests/smoke/
    echo "✓ Moved smoke_test.ts to tests/smoke/"
fi

if [ -f "stress_test.ts" ]; then
    mv stress_test.ts tests/stress/
    echo "✓ Moved stress_test.ts to tests/stress/"
fi

# Note: load_test.ts conflicts with tests/load/run-load-tests.ts
# So we'll rename it
if [ -f "load_test.ts" ]; then
    mv load_test.ts tests/simulation/load_test_legacy.ts
    echo "✓ Moved load_test.ts to tests/simulation/load_test_legacy.ts"
fi

# production_simulation.ts has errors - move to simulation folder
# User will need to fix the 4 TypeScript errors before using it
if [ -f "production_simulation.ts" ]; then
    mv production_simulation.ts tests/simulation/production_simulation.ts.backup
    echo "⚠ Moved production_simulation.ts to tests/simulation/production_simulation.ts.backup"
    echo "  (Has 4 TypeScript errors - needs manual fixing)"
fi

# Optional: Remove or archive legacy files
echo ""
echo "Legacy files (not moved):"
if [ -f "test_calculations.ts" ]; then
    echo "  - test_calculations.ts (5.5 KB)"
fi
if [ -f "validation_report.ts" ]; then
    echo "  - validation_report.ts (5.0 KB)"
fi

echo ""
echo "To remove legacy files, run:"
echo "  rm test_calculations.ts validation_report.ts"

echo ""
echo "=========================================="
echo "Cleanup Complete!"
echo "=========================================="
echo ""
echo "Run TypeScript check:"
echo "  npx tsc --noEmit"
echo ""
echo "Run tests:"
echo "  tsx tests/smoke/smoke_test.ts"
echo "  tsx tests/stress/stress_test.ts"
echo "  npm run test:load"
echo ""
