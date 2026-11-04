# Retail Data & Operations Hub

> Executive-Grade Retail Analytics, Medallion Architecture Data Pipeline, AI Copilot, and Real-Time Operations Engine built with Next.js 14 (App Router), Tailwind CSS, DuckDB, FastAPI, PyTorch, and Google Gemini AI.

---

## Live Deployments

- Frontend Dashboard (Vercel): [Retail Data Hub on Vercel](https://retail-data-hub.vercel.app)
- Backend API (Render): [Retail Analytics FastAPI on Render](https://retail-data-hub-1n2u.onrender.com)

> Backend Cold Start Note: The FastAPI backend is deployed on Render. If the backend has been idle for 15+ minutes, Render spins down the free instance. The initial API request may take 15-30 seconds to wake up the server instance. Subsequent requests execute with sub-second latency.

---

## Tech Stack Architecture

| Layer | Technologies & Frameworks | Description |
| :--- | :--- | :--- |
| **Frontend UI/UX** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide Icons | Executive interface with 13 analytical modules, responsive charts, Indian currency (INR) formatting, and real-time WebSocket feeds. |
| **Backend API** | FastAPI, Uvicorn, Pydantic v2, WebSockets | Asynchronous RESTful API framework serving live KPI data, store-filtered analytics, AI chat, and streaming transactions. |
| **OLAP Engine & Storage** | DuckDB, Apache Parquet | In-process analytical database engine executing Star Schema SQL queries on columnar Parquet datasets. |
| **Artificial Intelligence** | Google Gemini 2.5 Flash (`google-genai` SDK) | Conversational copilot translating natural language questions into verified DuckDB SQL queries with structured table and chart visualization. |
| **Machine Learning** | PyTorch, Scikit-Learn, mlxtend | 2-Layer LSTM neural model for 30-day demand prediction; Apriori algorithm for market basket association mining; Isolation Forest, IQR, and Z-score anomaly detectors. |
| **DevOps & Infrastructure** | Render, Vercel, Docker, Shell (Bash) | Cloud deployment with automated synthetic data generators, Medallion pipeline execution, and containerized runtime. |

---

## Dashboard Pages

The dashboard consists of 13 purpose-built operational and analytical pages:

| # | Route | Page Name | Description | Key Visualizations |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `/` | **Executive Overview** | Cross-functional executive view of gross revenue, margin, delivery SLA, stockout risk, and regional trajectory. | KPI cards with sparklines, Revenue vs Target area chart, Category revenue bar chart, Channel mix donut. |
| 2 | `/sales` | **Sales Performance** | Revenue trends, sales channels, store/city rankings, and category velocity. | Monthly sales trend area chart, Channel breakdown bar chart, Top store sales chart. |
| 3 | `/logistics` | **Logistics & Supply Chain** | Delivery timelines, carrier performance, SLA compliance, and regional transit bottlenecks. | Carrier duration comparison bar chart, SLA breach distribution, Route performance table. |
| 4 | `/customers` | **Customer Intelligence** | RFM segmentation, customer lifetime value (CLV), retention cohorts, and churn risk. | RFM segment distribution bar chart, CLV cohort distribution, Repeat customer metrics. |
| 5 | `/inventory` | **Inventory Health** | Stock levels, turnover ratios, critical stockout warnings, and automated reorder recommendations. | Category stock vs safety stock bar chart, High-risk stockout SKU table with reorder quantities. |
| 6 | `/forecast` | **Demand Forecasting** | PyTorch 2-layer LSTM 30-day revenue predictions across 8 product categories. | Historical vs forecasted revenue line charts, Category growth projections, Confidence intervals. |
| 7 | `/market-basket` | **Market Basket Analysis** | Omnichannel Apriori association mining identifying cross-sell patterns and product affinities. | Top association rules table (support, confidence, lift), Category co-occurrence matrix. |
| 8 | `/anomalies` | **Anomaly Detection** | Statistical (Z-score, IQR) and Machine Learning (Isolation Forest) outlier detection on sales and pricing. | Severity breakdown bar chart, Anomaly detection timeline, Detailed anomaly incident table. |
| 9 | `/fraud` | **Fraud Detection** | Rule-based composite scoring engine tracking rapid card velocity, off-hours spikes, and transaction anomalies. | Risk score distribution bar chart, Risk signal frequency chart, Flagged transaction inspection table. |
| 10 | `/data-quality` | **Data Quality & Governance** | Automated data profiling, null/duplicate checks, schema validation, and quarantine table logging. | Pass/fail status gauges, Quarantined record breakdown, Column-level quality audit table. |
| 11 | `/tables` | **Warehouse Tables** | Schema inspection, record counts, and columnar profiles for all Gold layer Parquet star-schema tables. | Row count distribution bar chart, Table schema viewer, Sample data explorer. |
| 12 | `/live` | **Live Operations Stream** | Real-time WebSocket feed streaming live simulated POS/e-commerce transactions and rolling revenue. | Auto-reconnecting WebSocket status pill, Rolling transaction feed, Live throughput metrics. |
| 13 | `/chat` | **AI Assistant & Copilot** | Natural language Text-to-SQL assistant querying the DuckDB Gold layer with Google Gemini 2.5 Flash. | Interactive chat stream, auto-generated SQL viewer, query result table, dynamic Recharts renderer. |

---

## Complete REST API & WebSocket Reference

### Analytics Endpoints

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | - | Backend health and analytics file status. |
| `GET` | `/api/overview` | `store_id` (optional) | Executive summary KPIs, revenue trends, and category distribution. |
| `GET` | `/api/summary` | - | Executive summary report and AI executive brief. |
| `GET` | `/api/commercial` | `store_id` (optional) | Commercial revenue totals, category margins, and channel performance. |
| `GET` | `/api/operations` | `store_id` (optional) | Logistics SLA compliance, carrier duration, and stockout rates. |
| `GET` | `/api/customers` | - | Customer health, RFM segmentation, and retention metrics. |
| `GET` | `/api/sales` | `store_id` (optional) | Sales trends, category breakdown, and city rankings. |
| `GET` | `/api/inventory` | `store_id` (optional) | Warehouse stock levels, turnover, and replenishment alerts. |
| `GET` | `/api/logistics` | `store_id` (optional) | Delivery duration, carrier performance, and shipping SLA metrics. |
| `GET` | `/api/forecast` | - | PyTorch 30-day LSTM category demand predictions. |
| `GET` | `/api/market-basket` | - | Apriori association rules (support, confidence, lift). |
| `GET` | `/api/anomalies` | `store_id` (optional) | Statistical and Isolation Forest outlier records. |
| `GET` | `/api/fraud` | `store_id` (optional) | Scored fraud transactions and risk signal distribution. |
| `GET` | `/api/data-quality` | - | Data pipeline quality test suite results and quarantine stats. |
| `GET` | `/api/tables` | - | Gold layer table metadata, schemas, and row counts. |
| `GET` | `/api/stores` | - | List of all stores (id, name, city) from `dim_store`. |

### AI Copilot & Automated Alerting Endpoints

| Method | Endpoint | Description | Request Payload / Response |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/chat/health` | AI Chat status (Gemini API key status, model name, Gold data status). | `{"key_configured": true, "model": "gemini-2.5-flash", "data_loaded": true}` |
| `POST` | `/api/chat` | Natural language Text-to-SQL assistant. | Payload: `{"message": "Top 5 products by revenue", "history": [...]}` |
| `GET` | `/api/alerts` | Fetch active alert rules and webhook configuration. | `{"rules": [...], "slack_webhook": "...", "pagerduty_policy": "..."}` |
| `POST` | `/api/alerts/save` | Update active alert rules and webhook endpoints. | Payload: `{"rules": [...], "slack_webhook": "..."}` |
| `POST` | `/api/alerts/test` | Trigger a test alert notification. | Payload: `{"target": "Slack", "rule_name": "Stockout Warning"}` |

### Real-Time WebSocket Endpoints

| Protocol | Endpoint | Direction | Description |
| :--- | :--- | :--- | :--- |
| `WS` | `/ws/live` | Server -> Client | Broadcasts streaming POS and online transactions to the dashboard. |
| `WS` | `/ws/simulator` | Simulator -> Server | Ingests synthetic transactions from the live simulator process. |

---

## Medallion Architecture

```
       +----------------+
       |   RAW DATA     |  POS Sales (CSV), Web Orders (JSON), Inventory, Shipments
       +-------+--------+
               |
               v
       +----------------+
       |  BRONZE LAYER  |  Schema Validation & Parquet Conversion (data/bronze/)
       +-------+--------+
               |
               v
       +----------------+
       |  SILVER LAYER  |  Deduplication, Quarantine Rejected Rows, Unified Sales (data/silver/)
       +-------+--------+
               |
               v
       +----------------+
       |   GOLD LAYER   |  Star Schema Parquet (data/gold/)
       +-------+--------+  fact_sales, dim_store, dim_product, dim_customer (SCD2), dim_date
               |
               v
 +----------------------------+
 |    ANALYTICS & AI LAYER    |  FastAPI, DuckDB OLAP, PyTorch LSTM Forecast, Gemini 2.5 Flash
 +----------------------------+
```

1. **Raw Layer**: Synthetic transaction generators produce POS sales CSVs, web order JSONs, warehouse inventory snapshots, and carrier shipment logs.
2. **Bronze Layer**: Schema enforcement, data validation, and lossless conversion to Apache Parquet storage.
3. **Silver Layer**: Data cleaning, deduplication, quarantine of malformed rows (`rejected_rows.parquet`), and omnichannel sales unification.
4. **Gold Layer**: Star-schema relational modelling:
   - `fact_sales`: Transactional grain with revenue, cost, profit, and dimensional foreign keys.
   - `dim_customer`: Slowly Changing Dimension Type 2 (SCD2) tracking address and city changes over time.
   - `dim_store`: Store metadata (store ID, store name, city, state, store type, square footage).
   - `dim_product`: Product hierarchy (product ID, name, category, subcategory, unit cost, retail price).
   - `dim_date`: Complete calendar dimension with fiscal quarters, day of week, and holiday flags.
5. **Analytics & AI**: Sub-second DuckDB OLAP queries, PyTorch neural forecasting, and Google Gemini 2.5 Flash Text-to-SQL conversion.

---

## Local Setup & Execution Guide

### 1. Prerequisites

- Python 3.10+ (recommended 3.11)
- Node.js 18+ and `npm`

---

### 2. Backend Setup

#### Step A: Clone Repository & Create Virtual Environment

```bash
git clone https://github.com/Sudhanshub27/retail-data-hub.git
cd retail-data-hub

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

#### Step B: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Required for AI Assistant & Copilot
GEMINI_API_KEY="your-gemini-api-key-here"

# Optional configuration (defaults shown)
GEMINI_MODEL="gemini-2.5-flash"
CORS_ORIGINS="*"
```

> **How to get a Gemini API Key**: Visit [Google AI Studio](https://aistudio.google.com/), sign in with your Google account, and click **Create API Key**. Copy the key and set it in your `.env` file or export it:
> ```bash
> export GEMINI_API_KEY="AIzaSy..."
> ```

#### Step C: Run Data Pipeline & Precompute Analytics

Execute the pipeline scripts in order:

```bash
# 1. Generate synthetic raw data (POS sales, Web orders, Inventory, Shipments)
bash scripts/generation.sh

# 2. Ingest raw data into Bronze Parquet layer
bash scripts/ingestion.sh

# 3. Clean and transform Bronze -> Silver -> Gold star-schema tables
bash scripts/transform.sh

# 4. Compute analytics and machine learning reports (KPIs, Market Basket, Anomalies, Fraud)
bash scripts/kpi_analysis.sh

# 5. Train LSTM neural network for 30-day demand forecasting
bash scripts/forecast.sh
```

#### Step D: Start FastAPI Backend Server

```bash
# Start backend on http://localhost:8000
bash scripts/api.sh
```

Alternatively, run uvicorn directly:

```bash
uvicorn src.api.api:app --host 0.0.0.0 --port 8000 --reload
```

Interactive OpenAPI Swagger documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 3. Frontend Dashboard Setup

In a new terminal window:

```bash
cd dashboard

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To configure the backend URL for the dashboard, create `dashboard/.env.local` if using a non-default host:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/live
```

---

### 4. Optional: Run Real-Time Transaction Simulator

To stream live transaction events into the `/live` page:

```bash
# Run the background simulator
bash scripts/live_simulator.sh
```

---

## Project Structure

```
retail-data-hub/
├── render.yaml                 # Render cloud deployment configuration
├── Dockerfile                  # Production container build
├── README.md                   # Project documentation
├── requirements.txt            # Python dependencies (pinned)
├── data/                       # Local Bronze, Silver, Gold, and Analytics files (git ignored)
├── dashboard/                  # Next.js 14 App Router frontend
│   ├── README.md               # Frontend documentation
│   ├── vercel.json             # Vercel deployment configuration
│   └── src/
│       ├── app/                # 13 Analytical module pages
│       ├── components/         # Reusable UI components & Recharts visualizers
│       ├── context/            # StoreContext (omnichannel store selector)
│       ├── hooks/              # useApi data-fetching hook
│       └── lib/                # Theme colors and formatters (INR digit grouping)
├── src/                        # Python analytics and machine learning pipeline
│   ├── analytics/              # Commercial, Operations, Customer, Market Basket, Anomaly, Fraud scripts
│   ├── api/                    # FastAPI app (api.py) and Gemini AI copilot (chat_engine.py)
│   ├── data_generation/        # Synthetic POS, Web, Warehouse generators
│   ├── ingestion/              # Bronze Parquet ingestion modules
│   ├── ml/                     # PyTorch LSTM demand forecasting
│   ├── quality/                # Data quality validation suites
│   └── transformation/         # Bronze -> Silver -> Gold transformation scripts
└── scripts/                    # Automation shell scripts
```

---

## License

Distributed under the MIT License. See `LICENSE` for details.
