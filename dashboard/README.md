# Retail Data Hub — Frontend Dashboard

## Overview

The Retail Data Hub Dashboard is an enterprise-grade analytics interface built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Recharts**.

It visualizes retail performance metrics across sales, logistics, customer lifetime value, warehouse inventory, PyTorch LSTM demand forecasts, market basket associations, statistical anomaly detection, fraud analysis, and data governance. It also features a real-time WebSocket transaction monitor and an AI Copilot powered by Google Gemini 2.5 Flash and DuckDB Text-to-SQL.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | React Server & Client Components, file-system routing |
| **Language** | TypeScript | Strict type safety across API schemas and UI components |
| **Styling** | Tailwind CSS | High-density enterprise layout and design system |
| **Data Visualization** | Recharts | Composable SVG charts with unified brand color palette |
| **Icons** | Lucide React | Consistent iconography across navigation and KPI cards |
| **State Management** | React Context (`StoreContext`) | Omnichannel store filtering across pages |
| **Data Fetching** | `useApi` custom hook | AbortController cancellation, refetch support, error handling |
| **Backend Integration** | FastAPI & WebSockets | REST API communication and streaming real-time events |

---

## Dashboard Pages

| # | Route | Page Name | Description | Key Components |
| :--- | :--- | :--- | :--- | :--- |
| 1 | `/` | **Overview** | Executive performance summary across sales, margins, and orders. | ExecutiveSummary, KPI cards, Revenue trend area chart, Category bar chart, Channel donut. |
| 2 | `/sales` | **Sales Performance** | Revenue trajectories, omnichannel mix, and regional sales velocity. | Sales trend chart, Channel comparison bar chart, Top store sales chart. |
| 3 | `/logistics` | **Logistics & Supply Chain** | Delivery timelines, carrier SLAs, and regional transit bottlenecks. | Carrier duration comparison bar chart, SLA breach distribution, Route performance table. |
| 4 | `/customers` | **Customer Intelligence** | RFM customer segmentation, CLV distributions, and retention cohorts. | RFM segment bar chart, CLV cohort distribution, Repeat purchase analysis. |
| 5 | `/inventory` | **Inventory Health** | Stockout warnings, warehouse turnover ratios, and replenishment. | Category stock vs safety stock bar chart, High-risk stockout SKU table. |
| 6 | `/forecast` | **Demand Forecasting** | PyTorch 2-layer LSTM 30-day revenue projections by category. | Historical vs forecasted revenue line charts, Category growth projections. |
| 7 | `/market-basket` | **Market Basket Analysis** | Apriori association mining identifying product affinities. | Association rules table (support, confidence, lift), Category co-occurrence matrix. |
| 8 | `/anomalies` | **Anomaly Detection** | Statistical (Z-score, IQR) and Isolation Forest outlier detection. | Severity breakdown bar chart, Anomaly detection timeline, Anomaly incident table. |
| 9 | `/fraud` | **Fraud Detection** | Rule-based composite scoring engine tracking card velocity and risk signals. | Risk score distribution bar chart, Risk signal frequency chart, Flagged transaction table. |
| 10 | `/data-quality` | **Data Quality & Governance** | Data profiling, null/duplicate checks, and quarantine logging. | Pass/fail status gauges, Quarantined record breakdown, Column quality table. |
| 11 | `/tables` | **Warehouse Tables** | Schema inspection and record counts for all Gold layer Parquet tables. | Table row count bar chart, Schema viewer, Sample data explorer. |
| 12 | `/live` | **Live Operations Stream** | Real-time WebSocket feed streaming live transactions and rolling revenue. | Auto-reconnecting WebSocket status indicator, Rolling transaction stream, Throughput metrics. |
| 13 | `/chat` | **AI Assistant & Copilot** | Natural language Text-to-SQL assistant querying DuckDB Gold layer. | Interactive chat stream, auto-generated SQL viewer, query result table, dynamic Recharts renderer. |

---

## Data Architecture & Integration

```
Gold Parquet Tables (data/gold/)
        |
        v
DuckDB OLAP Engine (in-process)
        |
        v
FastAPI Backend (src/api/api.py)  <--- GEMINI_API_KEY (AI Copilot)
        |  REST JSON & WebSockets
        v
Next.js Frontend (dashboard/src/app)
```

- **Currency & Number Formatting**: All values are formatted in Indian Rupee (INR, ₹) with Indian digit grouping (Lakhs, Crores) via `src/lib/format.ts`.
- **Dynamic Store Scope**: The header store selector fetches store locations directly from `GET /api/stores` and filters supported pages via `?store_id=`.
- **Design System Palette**: All charts and components import styling variables from `src/lib/theme.ts` (`CHART_COLORS`, `CHART_GRID_PROPS`, `CHART_AXIS_PROPS`, `LEGEND_PROPS`, and `THEME_COLORS`).

---

## Local Setup & Development

### 1. Prerequisites

- Node.js 18.0 or later
- npm or yarn
- FastAPI backend running on `http://localhost:8000`

### 2. Configure Environment

Create a `.env.local` file in the `dashboard` directory if connecting to a non-default backend address:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/live
```

> Note: To enable the AI Assistant on the `/chat` page, set `GEMINI_API_KEY` in the backend environment (`retail-data-hub/.env`).

### 3. Install & Run

```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
# Verify TypeScript types and build optimized production bundle
npm run build

# Run ESLint validation
npm run lint

# Start production server
npm start
```
