#!/bin/bash
# ============================================================
# Step 6: Data Quality Checks
# ============================================================
set -e

PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR"
[ -f .venv/bin/activate ] && source .venv/bin/activate || true

echo "============================================================"
echo "STEP 6 — DATA QUALITY CHECKS"
echo "============================================================"
echo ""

python3 src/quality/quality_checks.py

echo ""
echo "============================================================"
echo "[OK] Quality report -> data/data_quality_report.json"
echo "============================================================"
