#!/bin/bash
# ============================================================
# Step 5b: LSTM Demand Forecasting
# ============================================================
set -e

PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR"
[ -f .venv/bin/activate ] && source .venv/bin/activate || true

echo "============================================================"
echo "STEP 5b — LSTM DEMAND FORECASTING"
echo "============================================================"
echo ""

python3 src/ml/demand_forecast.py

echo ""
echo "============================================================"
echo "[OK] Forecast -> data/analytics/demand_forecast.json"
echo "============================================================"
