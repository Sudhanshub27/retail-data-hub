#!/bin/bash
# ============================================================
# Step 5: Run KPI Analytics
# ============================================================
set -e

PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR"
[ -f .venv/bin/activate ] && source .venv/bin/activate || true

echo "============================================================"
echo "STEP 5 — RUNNING KPI ANALYTICS"
echo "============================================================"
echo ""

python3 src/analytics/commercial_kpis.py
echo ""
python3 src/analytics/operations_kpis.py
echo ""
python3 src/analytics/customer_kpis.py
echo ""
python3 src/analytics/market_basket.py
echo ""
if [ ! -f data/analytics/demand_forecast.json ]; then
  echo "[INFO] Generating missing demand forecast..."
  python3 src/ml/demand_forecast.py
  echo ""
fi
python3 src/analytics/executive_summary.py
echo ""
python3 src/analytics/anomaly_detection.py
echo ""
python3 src/analytics/fraud_detection.py

echo ""
echo "============================================================"
echo "[OK] KPI analytics complete -> data/analytics/"
echo "============================================================"

