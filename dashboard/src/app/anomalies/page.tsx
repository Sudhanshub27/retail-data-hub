"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MapPin,
  Package,
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
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS } from "@/lib/theme";
import { fmtCurrency, fmtNum } from "@/lib/format";

interface AnomalyRecord {
  type: string;
  store_id: string;
  city: string;
  date: string;
  daily_revenue?: number;
  mean_revenue?: number;
  z_score?: number;
  severity: "Critical" | "High" | "Medium" | "Low";
  score: number;
  description: string;
}

interface AnomalyApiResponse {
  summary?: {
    total_anomalies: number;
    severity_distribution: {
      Critical: number;
      High: number;
      Medium: number;
      Low: number;
    };
    most_affected_city: string;
    most_affected_product: string;
  };
  timeline?: Array<{ date: string; count: number }>;
  by_city?: Array<{ city: string; count: number }>;
  top_anomalies?: AnomalyRecord[];
  all_anomalies?: AnomalyRecord[];
}

export default function AnomaliesPage() {
  const { selectedStore } = useStore();
  const endpoint =
    selectedStore.id && selectedStore.id !== "all"
      ? `/api/anomalies?store_id=${selectedStore.id}`
      : "/api/anomalies";

  const { data, loading, error, refetch } = useApi<AnomalyApiResponse>(endpoint);

  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const summary = data?.summary;
  const anomaliesList = data?.top_anomalies || data?.all_anomalies || [];

  if (!data || !summary) {
    return (
      <EmptyState
        title="No anomaly reports available"
        description="Run scripts/kpi_analysis.sh to compute statistical and z-score anomaly scans."
        onReset={refetch}
        resetText="Retry fetch"
      />
    );
  }

  const filteredAnomalies =
    severityFilter === "All"
      ? anomaliesList
      : anomaliesList.filter((a) => a.severity.toLowerCase() === severityFilter.toLowerCase());

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Anomaly & Irregularity Detection"
        subtitle={`Statistical outlier scans, z-score spikes, and operational discrepancies for ${selectedStore.name}`}
        action={
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs font-medium">
            <span className="text-slate-500 px-2 font-mono">Severity:</span>
            {["All", "Critical", "High", "Medium", "Low"].map((s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  severityFilter === s
                    ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        }
      />

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Anomalies Flagged"
          value={fmtNum(summary.total_anomalies)}
          change={`${summary.severity_distribution.Critical} Critical`}
          trend="down"
          icon={AlertTriangle}
          subtitle="Z-score outliers across revenue and order velocity"
          sparklineData={[42, 38, 45, 52, 60, 58, 65]}
        />
        <KpiCard
          title="Critical Severity Incidents"
          value={fmtNum(summary.severity_distribution.Critical)}
          change="Immediate action"
          trend="down"
          icon={AlertTriangle}
          subtitle="Events with Z-score deviation > 3.0 sigma"
        />
        <KpiCard
          title="Most Affected City"
          value={summary.most_affected_city}
          change="Highest incident hub"
          trend="neutral"
          icon={MapPin}
          subtitle="Geographic center with most flagged anomalies"
        />
        <KpiCard
          title="Most Flagged Product"
          value={summary.most_affected_product}
          change="Inventory volatility"
          trend="neutral"
          icon={Package}
          subtitle="Catalog SKU showing highest transaction variance"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Severity Summary Tiers */}
        <div className="col-span-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-rose-900">Critical Incidents</div>
                <div className="text-xl font-semibold text-slate-900 mt-1 tabular-nums">
                  {summary.severity_distribution.Critical} Events
                </div>
                <p className="text-xs text-slate-500 font-medium">Z-Score &gt; 3.0σ (Immediate review)</p>
              </div>
              <span className="px-2.5 py-0.5 bg-rose-100 rounded-lg text-rose-800 text-xs font-medium border border-rose-200">
                Critical
              </span>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-900">High &amp; Medium Incidents</div>
                <div className="text-xl font-semibold text-slate-900 mt-1 tabular-nums">
                  {(summary.severity_distribution.High || 0) + (summary.severity_distribution.Medium || 0)} Events
                </div>
                <p className="text-xs text-slate-500 font-medium">Z-Score 2.0σ – 3.0σ (Review within 24h)</p>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 rounded-lg text-amber-800 text-xs font-medium border border-amber-200">
                Warning
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800">Low Variance Alerts</div>
                <div className="text-xl font-semibold text-slate-900 mt-1 tabular-nums">
                  {summary.severity_distribution.Low || 0} Events
                </div>
                <p className="text-xs text-slate-500 font-medium">Z-Score 1.5σ – 2.0σ (Monitored)</p>
              </div>
              <span className="px-2.5 py-0.5 bg-slate-100 rounded-lg text-slate-700 text-xs font-medium border border-slate-200">
                Informational
              </span>
            </div>
          </div>
        </div>

        {/* Geographic Anomaly Concentration */}
        <div className="col-span-12">
          <ChartCard
            title="Geographic Anomaly Frequency"
            subtitle="Flagged statistical anomalies grouped by regional market and city"
          >
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.by_city || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="city" {...CHART_AXIS_PROPS} />
                  <YAxis {...CHART_AXIS_PROPS} tickFormatter={(v) => fmtNum(v)} />
                  <Tooltip content={<ChartTooltip formatter={fmtNum} />} />
                  <Bar
                    dataKey="count"
                    name="Anomaly Count"
                    fill={CHART_COLORS[4]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Expandable Root-Cause Diagnostic List */}
        <div className="col-span-12">
          <ChartCard
            title="Incident Diagnostics & Outlier Records"
            subtitle="Click on any incident to inspect recorded deviations and store context"
          >
            {filteredAnomalies.length === 0 ? (
              <EmptyState title="No anomalies match filter" description="No incidents recorded for this severity selection." />
            ) : (
              <div className="space-y-3 my-1">
                {filteredAnomalies.slice(0, 15).map((item, idx) => {
                  const isExpanded = expandedIndex === idx;
                  const sevBadge =
                    item.severity === "Critical"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : item.severity === "High" || item.severity === "Medium"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-slate-100 text-slate-700 border-slate-200";

                  return (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-lg bg-white overflow-hidden transition-colors"
                    >
                      <div
                        onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setExpandedIndex(isExpanded ? null : idx);
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              item.severity === "Critical"
                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-indigo-600 font-semibold">{item.store_id || "ALL"}</span>
                              <span className="font-semibold text-slate-900 text-xs capitalize">
                                {item.type.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Location: <span className="text-slate-800 font-medium">{item.city}</span> • Date: {item.date}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {item.daily_revenue !== undefined && (
                            <div className="text-right">
                              <div className="text-xs font-semibold text-rose-700 tabular-nums">
                                {fmtCurrency(item.daily_revenue)}
                              </div>
                              <div className="text-xs text-slate-400">Observed Value</div>
                            </div>
                          )}
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${sevBadge}`}>
                            {item.severity}
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Expandable Diagnostic Drawer */}
                      {isExpanded && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs animate-slide-down">
                          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-600" />
                              <span className="font-semibold text-slate-900">Statistical Analysis:</span>
                            </div>
                            {item.z_score !== undefined && (
                              <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100 font-mono">
                                Deviation: {item.z_score}σ (Score: {item.score})
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 font-sans leading-relaxed">{item.description}</p>
                          {item.mean_revenue !== undefined && (
                            <div className="text-xs text-slate-500">
                              Historical Baseline Average: <span className="font-medium text-slate-800">{fmtCurrency(item.mean_revenue)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
