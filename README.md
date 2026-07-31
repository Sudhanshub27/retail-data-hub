# 🛍️ Retail Data & Operations Hub

> **Executive-Grade Retail Analytics, Medallion Architecture Data Pipeline, AI Copilot, and Real-Time Operations Engine** built with **Next.js 14 (App Router)**, **Tailwind CSS**, **DuckDB**, **FastAPI**, **PyTorch**, and **Google Gemini AI**.

---

## 🌐 Live Deployments

* **Frontend Dashboard (Vercel)**: [Retail Data Hub on Vercel](https://retail-data-hub.vercel.app)
* **Backend API (Railway)**: [Retail Analytics FastAPI on Railway](https://retail-data-hub-production.up.railway.app)

> ⚡ **Backend Cold Start Note**: The FastAPI backend is deployed on Railway's serverless environment. If the server has been idle, the initial API call or query may take **15–30 seconds** to wake up the backend instance. Subsequent requests will execute with zero latency.

---

## 🎨 Visual Identity & Design System

The platform features an executive-grade **vibrant light aesthetic** (`bg-slate-50` / `bg-white`) optimized for data density, legibility, and executive presentations:

* **Typography**: Inter / Outfit modern sans-serif hierarchy.
* **Palette**: Slate-900 typography with vibrant semantic accents (Indigo for revenue, Emerald for SLA compliance, Rose for fraud alerts, Amber for stockout risks).
* **Interactivity**: Micro-animations powered by **Framer Motion**, interactive **Recharts** visualizations, and customized modal dialogs.

---

## 🏗️ Technical Architecture (Medallion Pattern)

The core data processing pipeline implements a **Medallion Architecture** using **DuckDB** for in-process OLAP speed and **Apache Parquet** for columnar compression.

```
       ┌────────────────┐
       │   RAW DATA     │  POS Sales (CSV), Web Orders (JSON), Inventory, Shipments
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │  BRONZE LAYER  │  Schema Validation & Parquet Conversion
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │  SILVER LAYER  │  Deduplication, Quarantine Rejected Rows, Unified Sales
       └───────┬────────┘
               │
               ▼
       ┌────────────────┐
       │   GOLD LAYER   │  Star Schema (fact_sales, dim_product, dim_customer SCD2)
       └───────┬────────┘
               │
               ▼
 ┌───────────────────────────┐
 │   ANALYTICS & AI LAYER    │  FastAPI, PyTorch LSTM Forecast, Gemini Natural SQL
 └───────────────────────────┘
```

1. **Bronze Layer**: Schema enforcement, type coercion, and Parquet storage.
2. **Silver Layer**: Data cleansing, quality quarantine (`rejected_rows`), and POS + Web unified transaction merge.
3. **Gold Layer**: Dimensional star-schema modelling:
   * `fact_sales`: Transactional grain with revenue, margins, and customer keys.
   * `dim_customer`: **SCD Type 2** tracking customer address/city changes over time with surrogate keys.
   * `dim_product`, `dim_store`, `dim_date`: Comprehensive dimensional analytical tables.
4. **Analytics Layer**: Automated calculation of Commercial KPIs, Operations metrics, RFM Customer Segments, and Demand Forecasts.

---

## 📊 Analytical Modules & Capabilities

The platform comprises **13 specialized dashboard pages**:

| Module | Features & Capabilities |
| :--- | :--- |
| **Executive Overview** | Macro commercial health, total revenue, transaction counts, and channel breakdown. |
| **Sales Analytics** | Regional sales distribution across 50+ stores, top SKUs, and category revenue. |
| **Demand Forecast** | AI-powered 30-day demand prediction using a **PyTorch Neural LSTM** model. |
| **Customer Intelligence** | RFM Segmentation (Champions, At Risk, Hibernating), CLV, and retention rates. |
| **Inventory Health** | Stockout probability radar, turnover ratios, and automated Purchase Order reorders. |
| **Logistics & Delivery** | Carrier SLA performance, delivery bottlenecks, and transit duration tracking. |
| **Fraud Detection** | Rule-based velocity scoring engine isolating compromised orders and high-risk IPs. |
| **Anomaly Detection** | Statistical Z-Score & IQR outlier detection identifying revenue and transaction spikes. |
| **Market Basket Mining** | Association rule mining using the **Apriori Algorithm** (`support`, `confidence`, `lift`). |
| **Data Quality & DAG** | Real-time SLA monitors, pipeline data quality checks, and interactive DAG lineage flow. |
| **Data Explorer** | High-density Datagrid with pagination, column search, and instant CSV/JSON exports. |
| **Live Operations** | Real-time WebSocket stream (`/ws/live`) simulating live store POS transactions. |
| **AI Copilot & SQL** | Gemini AI natural language translator rendering live SQL queries & Recharts graphs. |
| **Automated Alerts** | Configurable notification trigger rules for Slack, PagerDuty, Email, and Webhooks. |

---

## 💻 Local Setup & Data Generation Guide

> 📌 **Data Generation Note**: To mirror enterprise scale without committing multi-gigabyte files to git, **all data is generated locally using synthetic data generation scripts**. Follow the steps below to populate your local DuckDB database and analytics layers.

### 1. Prerequisites
* **Python 3.9+**
* **Node.js 18+** & `npm`

---

### 2. Installation & Setup Steps

#### Step A: Clone Repository & Setup Virtual Environment
```bash
git clone https://github.com/Sudhanshub27/retail-data-hub.git
cd retail-data-hub

# Create Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python backend dependencies
pip install -r requirements.txt
```

#### Step B: Run Data Generation & Pipeline Scripts
Execute the automated bash scripts to generate synthetic raw data and process it through the Medallion architecture:

```bash
# 1. Generate Raw POS sales, Web orders, Warehouse inventory, & Shipments
bash scripts/generation.sh

# 2. Ingest Raw datasets into Bronze Parquet storage with schema validation
bash scripts/ingestion.sh

# 3. Clean & transform data into Silver & Gold Star Schema tables
bash scripts/transform.sh

# 4. Compute Gold layer KPI analytics (Commercial, Operations, Customer)
bash scripts/kpi_analysis.sh

# Optional: Run Machine Learning Models (Demand Forecast & Quality Checks)
bash scripts/forecast.sh
bash scripts/quality_checks.sh
```

#### Step C: Launch FastAPI Backend Server
```bash
# Start FastAPI backend server on http://localhost:8000
bash scripts/api.sh
```
> The API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

#### Step D: Launch Next.js Frontend Dashboard
Open a new terminal window:
```bash
cd dashboard

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
> Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

---

## 📂 Project Directory Structure

```
retail-data-hub/
├── data/                       # Local DuckDB, Parquet, and Analytics JSON (Git Ignored)
│   ├── raw/                    # Generated POS CSVs, Web JSONs, Inventory CSVs
│   ├── bronze/                 # Validated Parquet tables
│   ├── silver/                 # Cleaned unified sales & warehouse tables
│   ├── gold/                   # Star Schema fact_sales & dimension tables
│   └── analytics/              # Computed KPI summary JSON files
├── dashboard/                  # Next.js 14 App Router Frontend
│   ├── public/                 # Branding assets (logo.png)
│   └── src/
│       ├── app/                # Route pages (13 analytical modules)
│       ├── components/         # TopHeader, Sidebar, AlertConfigModal, Recharts components
│       └── context/            # StoreContext for multi-store selection
├── src/                        # Python Analytics & Machine Learning Pipeline
│   ├── analytics/              # Commercial, Operations, Customer KPI scripts
│   ├── api/                    # FastAPI backend (`api.py`) & AI Copilot (`chat_engine.py`)
│   ├── data_generation/        # Synthetic POS, Web, Warehouse generators
│   ├── ingestion/              # Batch & Realtime streaming ingestors
│   ├── ml/                     # PyTorch LSTM Demand Forecasting
│   ├── quality/                # Automated Data Quality check suites
│   └── transformation/         # Bronze → Silver → Gold ETL transformers
├── scripts/                    # Terminal execution scripts (.sh)
├── requirements.txt            # Python dependencies
└── README.md                   # Project documentation
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more details.
