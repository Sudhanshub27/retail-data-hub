#!/bin/bash
# ============================================================
# Start Next.js Dashboard
# ============================================================
set -e

PROJ_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJ_DIR/dashboard"

echo "============================================================"
echo "STARTING DASHBOARD"
echo "   URL -> http://localhost:3000"
echo "============================================================"
echo ""

npm run dev
