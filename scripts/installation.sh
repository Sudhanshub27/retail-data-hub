#!/bin/bash
# ============================================================
# Retail Data Hub — Full Installation
# ============================================================
set -e

PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR"

echo "============================================================"
echo "RETAIL DATA HUB — INSTALLATION"
echo "============================================================"
echo ""

# 1. Python virtual environment
echo "[INFO] Setting up Python virtual environment…"
if [ ! -d ".venv" ]; then
    python3 -m venv .venv
    echo "   [OK] Created .venv"
else
    echo "   [OK] .venv already exists"
fi
source .venv/bin/activate
echo "   [OK] Activated .venv"
echo ""

# 2. Python dependencies
echo "[INFO] Installing Python dependencies (this may take a minute)…"
pip install --upgrade pip
pip install -r requirements.txt
echo "   [OK] Installed requirements.txt"
echo ""

# 3. Verify DuckDB
echo "[INFO] Verifying DuckDB…"
python3 -c "import duckdb; print(f'   [OK] DuckDB {duckdb.__version__} installed')"
echo ""

# 4. Node.js / Dashboard dependencies
echo "[INFO] Installing Dashboard dependencies (running npm install)…"
cd "$PROJ_DIR/dashboard"
npm install
echo "   [OK] Installed npm packages"
cd "$PROJ_DIR"
echo ""

# 5. Create data directories
echo "[INFO] Ensuring data directories exist…"
mkdir -p data/raw data/bronze data/silver data/gold data/analytics
echo "   [OK] Data directories ready"
echo ""

echo "============================================================"
echo "[OK] Installation complete!"
echo "   Python env : .venv ($(python3 --version))"
echo "   Node.js    : $(node --version)"
echo "   npm        : $(npm --version)"
echo "============================================================"
