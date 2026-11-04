"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  Database,
  Layers,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { PageSkeleton } from "@/components/Skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/context/StoreContext";
import { useApi } from "@/hooks/useApi";
import { API_BASE } from "@/config";
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS } from "@/lib/theme";
import { fmtNum } from "@/lib/format";

interface TableMeta {
  name: string;
  description: string;
  format: string;
  rows: number;
  columns: number;
}

type TableRegistry = Record<string, TableMeta[]>;

interface TableRowsResponse {
  rows: Array<Record<string, unknown>>;
  page: number;
  page_size: number;
  total_rows: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export default function TablesPage() {
  const { selectedStore } = useStore();
  const [selectedLayer, setSelectedLayer] = useState<string>("gold");
  const [selectedTable, setSelectedTable] = useState<string>("fact_sales");
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: registry, loading: loadingRegistry, error: registryError, refetch: refetchRegistry } =
    useApi<TableRegistry>("/api/tables");

  const rowsEndpoint = `/api/tables/rows/${selectedLayer}/${selectedTable}?page=${page}&page_size=20`;
  const { data: rowsData, loading: loadingRows, error: rowsError, refetch: refetchRows } =
    useApi<TableRowsResponse>(rowsEndpoint);

  if (loadingRegistry) {
    return <PageSkeleton />;
  }

  if (registryError) {
    return <ErrorState message={registryError} onRetry={refetchRegistry} />;
  }

  if (!registry || Object.keys(registry).length === 0) {
    return (
      <EmptyState
        title="No database tables found"
        description="Run scripts/run_pipeline.sh to ingest and build Bronze, Silver, and Gold parquet layers."
        onReset={refetchRegistry}
        resetText="Retry fetch"
      />
    );
  }

  const availableTables = registry[selectedLayer] || [];
  const currentTableMeta = availableTables.find((t) => t.name === selectedTable) || availableTables[0];

  const handleLayerChange = (layer: string) => {
    setSelectedLayer(layer);
    const tables = registry[layer] || [];
    if (tables.length > 0) {
      setSelectedTable(tables[0].name);
    }
    setPage(1);
    setSearchQuery("");
  };

  const handleTableChange = (name: string) => {
    setSelectedTable(name);
    setPage(1);
    setSearchQuery("");
  };

  const rawRows = rowsData?.rows || [];
  const columns = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];

  const filteredRows = rawRows.filter((row) => {
    if (!searchQuery.trim()) return true;
    return Object.values(row).some((val) =>
      String(val ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const downloadUrl = `${API_BASE}/api/tables/download/${selectedLayer}/${selectedTable}?format=csv`;

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Raw Data Explorer & Datagrid"
        subtitle={`Search, filter, tabular inspect, and export database tables across Medallion architecture for ${selectedStore.name}`}
        action={
          <div className="flex items-center gap-3">
            {/* Layer Selector */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs font-medium">
              {(["bronze", "silver", "gold"] as const).map((layer) => (
                <button
                  key={layer}
                  onClick={() => handleLayerChange(layer)}
                  className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                    selectedLayer === layer
                      ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {layer}
                </button>
              ))}
            </div>

            {/* Table Selector */}
            <select
              value={selectedTable}
              onChange={(e) => handleTableChange(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono font-medium focus:border-indigo-600"
            >
              {availableTables.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name} ({fmtNum(t.rows)} rows)
                </option>
              ))}
            </select>

            {/* Export CSV Download */}
            <a
              href={downloadUrl}
              download
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Export CSV</span>
            </a>
          </div>
        }
      />

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Table"
          value={selectedTable}
          change={`${selectedLayer.toUpperCase()} Layer`}
          trend="neutral"
          icon={Database}
          subtitle={currentTableMeta?.description || "Medallion analytics dataset"}
        />
        <KpiCard
          title="Total Table Records"
          value={fmtNum(rowsData?.total_rows ?? currentTableMeta?.rows ?? 0)}
          change="Physical rows on disk"
          trend="up"
          icon={Layers}
          subtitle={`Stored in ${currentTableMeta?.format || "parquet"} format`}
          sparklineData={[230, 235, 238, 242, 245, 247, 248]}
        />
        <KpiCard
          title="Schema Dimension"
          value={`${currentTableMeta?.columns ?? columns.length} Columns`}
          change="Columnar Layout"
          trend="neutral"
          icon={FileSpreadsheet}
          subtitle="Fields per record schema"
        />
        <KpiCard
          title="Pagination Progress"
          value={`Page ${page} of ${rowsData?.total_pages ?? 1}`}
          change="20 rows / page"
          trend="neutral"
          icon={Database}
          subtitle="Indexed stream view"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Layer Table Volumes Chart */}
        <div className="col-span-12">
          <ChartCard
            title={`${selectedLayer.toUpperCase()} Layer Record Volume`}
            subtitle="Total physical records stored per table in this Medallion layer"
          >
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={availableTables} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="name" {...CHART_AXIS_PROPS} />
                  <YAxis {...CHART_AXIS_PROPS} tickFormatter={(v) => fmtNum(v)} />
                  <Tooltip content={<ChartTooltip formatter={fmtNum} />} />
                  <Bar
                    dataKey="rows"
                    name="Record Count"
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="col-span-12">
          <ChartCard
            title={`${selectedLayer.toUpperCase()} / ${selectedTable}`}
            subtitle={currentTableMeta?.description || "Browse and inspect table records with pagination"}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter visible page records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none w-full font-medium"
                />
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  disabled={!rowsData?.has_prev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-slate-600 font-medium px-2">
                  Page {page} of {rowsData?.total_pages ?? 1}
                </span>
                <button
                  disabled={!rowsData?.has_next}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            {loadingRows ? (
              <div className="p-12 text-center text-xs text-slate-500 animate-pulse">Loading table records...</div>
            ) : rowsError ? (
              <ErrorState message={rowsError} onRetry={refetchRows} />
            ) : filteredRows.length === 0 ? (
              <EmptyState
                title="No rows matching query"
                description={`No records in current view matched "${searchQuery}".`}
                onReset={() => setSearchQuery("")}
                resetText="Clear filter"
              />
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      {columns.map((col) => (
                        <th key={col} className="p-3 whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                        {columns.map((col) => {
                          const val = row[col];
                          const strVal = val === null || val === undefined ? "—" : String(val);
                          return (
                            <td key={col} className="p-3 text-slate-800 font-medium whitespace-nowrap tabular-nums">
                              {strVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
