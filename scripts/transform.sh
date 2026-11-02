#!/bin/bash
# ============================================================
# Step 3 & 4: Bronze -> Silver -> Gold (Star Schema)
# ============================================================
set -e

PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR"
source .venv/bin/activate

echo "============================================================"
echo "STEP 3 — BRONZE -> SILVER TRANSFORMATION"
echo "============================================================"
echo ""

python3 src/transformation/bronze_to_silver.py

echo ""
echo "============================================================"
echo "STEP 4 — SILVER -> GOLD (STAR SCHEMA)"
echo "============================================================"
echo ""

python3 src/transformation/silver_to_gold.py

echo ""
echo "============================================================"
echo "[OK] Transformations complete!"
echo "   Silver -> data/silver/"
echo "   Gold   -> data/gold/"
echo "============================================================"
