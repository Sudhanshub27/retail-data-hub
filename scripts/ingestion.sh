#!/bin/bash
# ============================================================
# Step 2: Ingest -> Bronze Layer
# ============================================================
set -e

PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR"
source .venv/bin/activate

echo "============================================================"
echo "STEP 2 — INGESTING TO BRONZE LAYER"
echo "============================================================"
echo ""

python3 src/ingestion/ingest_batch.py
echo ""
python3 src/ingestion/ingest_realtime.py

echo ""
echo "============================================================"
echo "[OK] Bronze layer ready -> data/bronze/"
echo "============================================================"
