# 🛍️ Retail Data & Operations Hub

> **Executive-Grade Retail Analytics, Medallion Architecture Data Pipeline, AI Copilot, and Real-Time Operations Engine** built with **Next.js 14 (App Router)**, **Tailwind CSS**, **DuckDB**, **FastAPI**, **PyTorch**, and **Google Gemini AI**.

---

## 🌐 Live Deployments

* **Frontend Dashboard (Vercel)**: [Retail Data Hub on Vercel](https://retail-data-hub.vercel.app)
* **Backend API (Railway)**: [Retail Analytics FastAPI on Railway](https://retail-data-hub-production.up.railway.app)

> ⚡ **Backend Cold Start Note**: The FastAPI backend is deployed on Railway's serverless environment. If the backend has been idle, the initial API call or query may take **15–30 seconds** to wake up the server instance. Subsequent requests execute with zero latency.

---

## 🛠️ Complete Tech Stack Architecture

| Layer | Technologies & Frameworks | Description |
| :--- | :--- | :--- |
| **Frontend UI/UX** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, Lucide Icons | High-density executive interface with responsive charts, micro-animations, slate/vibrant themes, and client context management. |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2, WebSockets | Asynchronous RESTful API framework serving live KPI data, chat engines, and streaming WebSocket transaction feeds. |
| **OLAP Engine & Storage** | DuckDB, Apache Parquet | In-process analytical database (OLAP) processing millions of rows in milliseconds using columnar Parquet storage. |
| **Artificial Intelligence** | Google Gemini AI (`gemini-1.5-flash`, `gemini-1.5-pro`) | Executive AI Copilot generating natural language insights, dynamic DuckDB SQL queries, and Recharts JSON payloads. |
| **Machine Learning** | PyTorch, Scikit-Learn, mlxtend | 2-Layer LSTM Neural Model for 30-day demand prediction; Apriori algorithm for market basket association mining; IQR/Z-score anomaly detectors. |
| **DevOps & Infrastructure** | Docker, Railway, Vercel, Shell (Bash) | Containerized build pipelines, automated synthetic data generators, and cloud hosting for frontend & backend services. |

---

## 🔌 Complete REST API & WebSocket Reference

### 🟢 Core Analytics Endpoints

| Method | Endpoint | Description | Query Params / Body | Sample Output Key |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System health monitor & analytical file validation | None | `{"status": "ok", "data_files": {...}}` |
| `GET` | `/api/summary` | Executive summary KPIs & Gemini AI business insights | None | `{"kpis": {...}, "ai_summary": "..."}` |
| `GET` | `/api/commercial` | Revenue totals, city performance, category sales, monthly trends | None | `{"revenue": {...}, "city_sales": [...]}` |
| `GET` | `/api/operations` | Logistics SLA compliance, carrier duration, stockout rates | None | `{"stockout_rate": {...}, "delivery_times": {...}}` |
| `GET` | `/api/customer` | Customer health, RFM segmentation, retention, CLV | None | `{"rfm": {...}, "clv": {...}}` |
| `GET` | `/api/forecast` | PyTorch 30-day neural LSTM category demand predictions | None | `{"total_30d_predicted_revenue": 1420000, ...}` |
| `GET` | `/api/market-basket` | Association rule mining (`support`, `confidence`, `lift`) | None | `{"rules": [{"antecedents": [...], "lift": 2.4}]}` |
| `GET` | `/api/quality` | Data quality checks, null/duplicate counts, quarantine log | None | `{"pass_rate": 99.2, "quarantined_rows": 525}` |
| `GET` | `/api/datagrid` | Paginated raw transactions with column search & filters | `page=1&limit=50&search=Mumbai` | `{"data": [...], "total_pages": 42}` |

---

### 🤖 AI Copilot & Automated Alerting Endpoints

| Method | Endpoint | Description | Request Payload | Response Schema |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/chat` | AI Executive Assistant (Gemini + DuckDB SQL Generator) | `{"message": "Top revenue SKUs with return rate > 10%"}` | `{"text": "...", "sqlQuery": "...", "data_type": "table", "tableData": {...}}` |
| `GET` | `/api/alerts` | Fetch active trigger rules & webhook integrations | None | `{"rules": [...], "slack_webhook": "...", "pagerduty_policy": "..."}` |
| `POST` | `/api/alerts/save` | Save updated trigger rules & webhook channels to disk | `{"rules": [...], "slack_webhook": "..."}` | `{"status": "success", "message": "Saved 3 rules"}` |
| `POST` | `/api/alerts/test` | Trigger live test notification dispatch | `{"target": "Slack", "rule_name": "Stockout Risk"}` | `{"status": "success", "delivered": true}` |

---

### ⚡ Live WebSockets Stream

| Protocol | Endpoint | Direction | Description |
| :--- | :--- | :--- | :--- |
| `WS` | `/ws/live` | Server → Client | Streams real-time POS transaction events, rolling revenue, anomaly alerts, and store activity to the dashboard UI. |
| `WS` | `/ws/simulator` | Simulator → Server | Accepts raw JSON transaction payloads from the background simulator process and broadcasts to connected clients. |

---

## 🏗️ Medallion Architecture & Data Pipeline

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

1. **Raw Layer**: Synthetic transaction generators producing POS CSVs, Web Order JSONs, Warehouse Inventory, and Shipments.
2. **Bronze Layer**: Schema enforcement, data validation, and conversion to Apache Parquet format.
3. **Silver Layer**: Data cleaning, deduplication, quarantine of malformed rows (`rejected_rows.parquet`), and unified store/web sales merging.
4. **Gold Layer**: Star-schema relational modelling:
   * `fact_sales`: Transactional grain with revenue, margins, and customer keys.
   * `dim_customer`: **SCD Type 2** tracking customer address and city changes over time with surrogate keys.
   * `dim_product`, `dim_store`, `dim_date`: Analytics-ready dimension tables.
5. **Analytics & AI**: High-performance DuckDB OLAP queries, PyTorch demand forecasting, and Gemini AI natural language translation.

---

## 💻 Local Setup & Data Pipeline Execution

> 📌 **Synthetic Data Note**: To mirror enterprise scale without committing multi-gigabyte data files to git, **all data is generated locally using synthetic data scripts**.

### 1. Prerequisites
* **Python 3.9+**
* **Node.js 18+** & `npm`

---

### 2. Installation Steps

#### Step A: Clone & Environment Setup
```bash
git clone https://github.com/Sudhanshub27/retail-data-hub.git
cd retail-data-hub

# Create Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install backend dependencies
pip install -r requirements.txt
```

#### Step B: Generate Data & Run Medallion Pipeline
Run the automated pipeline scripts in sequence to populate raw datasets and process them into the Gold analytics layer:

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

#### Step C: Launch Backend API Server
```bash
# Start FastAPI backend server on http://localhost:8000
bash scripts/api.sh
```
> Interactive API Swagger UI available at [http://localhost:8000/docs](http://localhost:8000/docs).

#### Step D: Launch Frontend Dashboard
Open a new terminal window:
```bash
cd dashboard

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
> Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Directory Structure

```
retail-data-hub/
├── Dockerfile                  # Production Docker container build for Railway
├── railway.json                # Railway deployment configuration
├── README.md                   # Comprehensive project documentation
├── requirements.txt            # Python dependencies
├── data/                       # Local DuckDB, Parquet, and Analytics JSON (Git Ignored)
├── dashboard/                  # Next.js 14 App Router Frontend
│   ├── vercel.json             # Vercel deployment configuration
│   ├── public/                 # Branding logo and assets
│   └── src/
│       ├── app/                # 13 Analytical module route pages
│       ├── components/         # TopHeader, Sidebar, AlertConfigModal, Recharts components
│       └── context/            # StoreContext state management
├── src/                        # Python Analytics & Machine Learning Pipeline
│   ├── analytics/              # Commercial, Operations, Customer KPI scripts
│   ├── api/                    # FastAPI backend (`api.py`) & AI Copilot (`chat_engine.py`)
│   ├── data_generation/        # Synthetic POS, Web, Warehouse generators
│   ├── ingestion/              # Batch & Realtime streaming ingestors
│   ├── ml/                     # PyTorch LSTM Demand Forecasting
│   ├── quality/                # Automated Data Quality check suites
│   └── transformation/         # Bronze → Silver → Gold ETL transformers
└── scripts/                    # Automation bash execution scripts
```

---

## 🛡️ License

Distributed under the MIT License. See `LICENSE` for more details.
