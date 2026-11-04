"""
silver_to_gold.py
=================
Transforms Silver-layer cleaned data into Gold-layer star schema tables.

Star Schema:
  Fact Tables:
    - fact_sales         (unified POS + Web transactions with dimension FKs)

  Dimension Tables:
    - dim_date           (date spine covering full range)
    - dim_product        (unique products with surrogate keys)
    - dim_store          (unique stores with surrogate keys)
    - dim_customer       (SCD Type 2 — built by scd_handler.py)

Inputs : data/silver/unified_sales.parquet
         data/silver/warehouse_inventory.parquet
         data/silver/shipments.parquet

Outputs: data/gold/fact_sales.parquet
         data/gold/dim_date.parquet
         data/gold/dim_product.parquet
         data/gold/dim_store.parquet
         data/gold/dim_customer.parquet  (via scd_handler)

Usage:
    python src/transformation/silver_to_gold.py
"""

import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime

# ── project paths ───────────────────────────────────────────────────
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SILVER_DIR = os.path.join(ROOT_DIR, "data", "silver")
GOLD_DIR = os.path.join(ROOT_DIR, "data", "gold")
os.makedirs(GOLD_DIR, exist_ok=True)

# ── Import SCD handler ──────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(__file__))
from scd_handler import build_dim_customer_scd2, get_customer_sk

# ── Import store metadata from data generation ──────────────────────
sys.path.insert(0, os.path.join(ROOT_DIR, "src", "data_generation"))
from generate_pos import STORES, CITIES


# ══════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════

def load_silver(filename: str) -> pd.DataFrame:
    """Load a Parquet file from Silver layer."""
    path = os.path.join(SILVER_DIR, filename)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Silver file not found: {path}")
    df = pd.read_parquet(path)
    print(f"  [OK] Loaded {filename}: {len(df):,} rows × {len(df.columns)} cols")
    return df


def save_gold(df: pd.DataFrame, filename: str) -> str:
    """Save a DataFrame to Gold layer as Parquet."""
    path = os.path.join(GOLD_DIR, filename)
    df.to_parquet(path, index=False, engine="pyarrow")
    print(f"  [OK] Saved → {path} ({len(df):,} rows)")
    return path


# ══════════════════════════════════════════════════════════════════════
# 1. DIM_DATE — date spine
# ══════════════════════════════════════════════════════════════════════

def build_dim_date(min_date, max_date) -> pd.DataFrame:
    """Generate a dim_date table spanning the full date range."""
    print("[INFO] Building dim_date …")

    dates = pd.date_range(start=min_date, end=max_date, freq="D")

    df = pd.DataFrame({
        "date_key": range(1, len(dates) + 1),
        "full_date": dates,
        "year": dates.year,
        "quarter": dates.quarter,
        "month": dates.month,
        "month_name": dates.strftime("%B"),
        "week_of_year": dates.isocalendar().week.astype(int),
        "day_of_month": dates.day,
        "day_of_week": dates.dayofweek,  # Mon=0, Sun=6
        "day_name": dates.strftime("%A"),
        "is_weekend": dates.dayofweek >= 5,
        "is_festive_season": dates.month.isin([10, 11, 12, 1]),
        "year_month": dates.strftime("%Y-%m"),
    })

    print(f"  [OK] dim_date: {len(df)} days ({min_date.date()} → {max_date.date()})")
    return df


# ══════════════════════════════════════════════════════════════════════
# 2. DIM_PRODUCT — unique products
# ══════════════════════════════════════════════════════════════════════

def build_dim_product(sales_df: pd.DataFrame) -> pd.DataFrame:
    """Extract unique products from sales data with surrogate keys."""
    print("[INFO] Building dim_product …")

    products = sales_df[["product_id", "product_name", "category"]].drop_duplicates()
    products = products.sort_values("product_id").reset_index(drop=True)
    products.insert(0, "product_sk", range(1, len(products) + 1))

    print(f"  [OK] dim_product: {len(products)} unique products across {products['category'].nunique()} categories")
    return products


# ══════════════════════════════════════════════════════════════════════
# 3. DIM_STORE — unique stores
# ══════════════════════════════════════════════════════════════════════

def build_dim_store() -> pd.DataFrame:
    """Build dim_store from the store universe."""
    print("[INFO] Building dim_store …")

    rows = []
    for i, store in enumerate(STORES, start=1):
        rows.append({
            "store_sk": i,
            "store_id": store["store_id"],
            "city": store["city"],
            "state": store["state"],
            "region": get_region(store["state"]),
        })

    # Add a Web channel placeholder store
    rows.append({
        "store_sk": len(rows) + 1,
        "store_id": "WEB-ONLINE",
        "city": "Online",
        "state": "Online",
        "region": "Online",
    })

    df = pd.DataFrame(rows)
    print(f"  [OK] dim_store: {len(df)} stores across {df['city'].nunique()} cities")
    return df


def get_region(state: str) -> str:
    """Map Indian states to broad regions."""
    regions = {
        "Maharashtra": "West",
        "Gujarat": "West",
        "Rajasthan": "West",
        "Delhi": "North",
        "Uttar Pradesh": "North",
        "Karnataka": "South",
        "Tamil Nadu": "South",
        "Telangana": "South",
        "West Bengal": "East",
        "Online": "Online",
    }
    return regions.get(state, "Other")


# ══════════════════════════════════════════════════════════════════════
# 4. FACT_SALES — with dimension FK lookups
# ══════════════════════════════════════════════════════════════════════

def build_fact_sales(
    sales_df: pd.DataFrame,
    dim_date: pd.DataFrame,
    dim_product: pd.DataFrame,
    dim_store: pd.DataFrame,
    dim_customer: pd.DataFrame,
) -> pd.DataFrame:
    """Build fact_sales table with FK references to all dimensions."""
    print("[INFO] Building fact_sales …")

    fact = sales_df.copy()

    # ── Date key lookup ──────────────────────────────────────────
    fact["transaction_date"] = pd.to_datetime(fact["transaction_date"])
    date_lookup = dim_date.set_index("full_date")["date_key"]
    fact["date_key"] = fact["transaction_date"].dt.normalize().map(date_lookup)
    fact["date_key"] = fact["date_key"].fillna(-1).astype(int)

    # ── Product key lookup ───────────────────────────────────────
    prod_lookup = dim_product.set_index("product_id")["product_sk"]
    fact["product_sk"] = fact["product_id"].map(prod_lookup)
    fact["product_sk"] = fact["product_sk"].fillna(-1).astype(int)

    # ── Store key lookup ─────────────────────────────────────────
    store_lookup = dim_store.set_index("store_id")["store_sk"]
    fact["store_sk"] = fact["store_id"].map(store_lookup)
    fact["store_sk"] = fact["store_sk"].fillna(-1).astype(int)

    # ── Customer key lookup (SCD-aware) ──────────────────────────
    print("  [INFO] Resolving customer surrogate keys (SCD Type 2) …")
    fact["customer_sk"] = fact.apply(
        lambda row: get_customer_sk(dim_customer, row["customer_id"], row["transaction_date"]),
        axis=1,
    )

    # ── Select final columns ─────────────────────────────────────
    fact_cols = [
        "sale_id", "transaction_id", "transaction_date",
        "date_key", "product_sk", "store_sk", "customer_sk",
        "quantity", "unit_price", "total_amount", "channel",
    ]
    fact = fact[[c for c in fact_cols if c in fact.columns]]

    # Add year/month partition columns
    fact["year"] = fact["transaction_date"].dt.year
    fact["month"] = fact["transaction_date"].dt.month

    print(f"  [OK] fact_sales: {len(fact):,} rows, "
          f"date coverage: {fact['transaction_date'].min().date()} → {fact['transaction_date'].max().date()}")

    return fact


# ══════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════

def run_silver_to_gold():
    """Execute the full Silver → Gold transformation pipeline."""
    print("=" * 60)
    print("SILVER → GOLD TRANSFORMATION (Star Schema)")
    print("=" * 60)

    # ── Load Silver data ─────────────────────────────────────────
    print("\n[INFO] Loading Silver layer …")
    sales_df = load_silver("unified_sales.parquet")

    # ── Build dimensions ─────────────────────────────────────────
    print("\n[INFO] Building dimension tables …")

    # dim_date from sales date range
    min_date = pd.to_datetime(sales_df["transaction_date"]).min()
    max_date = pd.to_datetime(sales_df["transaction_date"]).max()
    dim_date = build_dim_date(min_date, max_date)

    # dim_product
    dim_product = build_dim_product(sales_df)

    # dim_store
    dim_store = build_dim_store()

    # dim_customer (SCD Type 2)
    dim_customer = build_dim_customer_scd2()

    # ── Build fact table ─────────────────────────────────────────
    print("\n[INFO] Building fact table …")
    fact_sales = build_fact_sales(sales_df, dim_date, dim_product, dim_store, dim_customer)

    # ── Save Gold layer ──────────────────────────────────────────
    print("\n[INFO] Saving Gold layer …")
    save_gold(dim_date, "dim_date.parquet")
    save_gold(dim_product, "dim_product.parquet")
    save_gold(dim_store, "dim_store.parquet")
    save_gold(dim_customer, "dim_customer.parquet")
    save_gold(fact_sales, "fact_sales.parquet")

    # ── Summary ──────────────────────────────────────────────────
    print(f"\n{'=' * 60}")
    print("[OK] Silver → Gold complete!")
    print(f"   fact_sales     : {len(fact_sales):,} rows")
    print(f"   dim_date       : {len(dim_date):,} rows")
    print(f"   dim_product    : {len(dim_product):,} rows")
    print(f"   dim_store      : {len(dim_store):,} rows")
    print(f"   dim_customer   : {len(dim_customer):,} rows")
    print(f"{'=' * 60}")

    return {
        "fact_sales": fact_sales,
        "dim_date": dim_date,
        "dim_product": dim_product,
        "dim_store": dim_store,
        "dim_customer": dim_customer,
    }


if __name__ == "__main__":
    run_silver_to_gold()
