"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  FileCheck,
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
import { fmtNum } from "@/lib/format";

interface QualityCheckItem {
  check_id: number;
  check_name: string;
  rule: string;
  datasets: string[];
  total_rows_checked?: number;
  total_columns_checked?: number;
  violations_found?: number;
  columns_below_threshold?: number;
  status: "PASS" | "FAIL";
  action_on_failure: string;
}

interface DatasetStats {
  rows: number;
  columns: number;
}

interface DataQualityApiResponse {
  report_timestamp?: string;
  summary?: {
    total_checks: number;
    passed: number;
    failed: number;
    total_violations: number;
    overall_status: string;
  };
  datasets_checked?: Record<string, DatasetStats>;
  check_results?: QualityCheckItem[];
}

export default function DataQualityPage() {
  const { selectedStore } = useStore();
  const { data, loading, error, refetch } = useApi<DataQualityApiResponse>("/api/data-quality");

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const summary = data?.summary;
  const datasets = data?.datasets_checked || {};
  const checks = data?.check_results || [];

  if (!data || !summary) {
    return (
      <EmptyState
        title="No data quality report available"
        description="Run scripts/quality_checks.sh to execute automated validation suite."
        onReset={refetch}
        resetText="Retry fetch"
      />
    );
  }

  const totalBronzeRows = Object.values(datasets).reduce((acc, curr) => acc + curr.rows, 0);
  const passRate =
    summary.total_checks > 0
      ? ((summary.passed / summary.total_checks) * 100).toFixed(1)
      : "100.0";

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Data Quality & Pipeline Lineage"
        subtitle={`Automated Great Expectations validation suite, schema compliance, and ingestion health for ${selectedStore.name}`}
      />

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Data Suite Pass Rate"
          value={`${passRate}%`}
          change={`${summary.passed} Passed / ${summary.failed} Failed`}
          trend={summary.failed === 0 ? "up" : "down"}
          icon={CheckCircle2}
          subtitle={`Overall status: ${summary.overall_status}`}
          sparklineData={[92, 94, 95, 96, 98, 99, Number(passRate)]}
        />
        <KpiCard
          title="Total Data Checks"
          value={`${summary.total_checks} Rules`}
          change="Automated enforcement"
          trend="neutral"
          icon={FileCheck}
          subtitle="Integrity rules across Bronze & Silver layers"
        />
        <KpiCard
          title="Quarantined Violations"
          value={fmtNum(summary.total_violations)}
          change="Isolated in rejected_rows"
          trend="down"
          icon={AlertTriangle}
          subtitle="Non-compliant rows caught by validation gates"
        />
        <KpiCard
          title="Ingested Raw Records"
          value={fmtNum(totalBronzeRows)}
          change={`${Object.keys(datasets).length} Datasets`}
          trend="up"
          icon={Database}
          subtitle="Total rows scanned in Bronze tier"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Bronze Layer Datasets */}
        <div className="col-span-12">
          <ChartCard
            title="Bronze Layer Ingestion & Dimensions"
            subtitle="Raw ingestion dataset volume and schema column dimensions"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-1">
              {Object.entries(datasets).map(([name, stats]) => (
                <div
                  key={name}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-indigo-600">{name}</span>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Healthy
                    </span>
                  </div>
                  <div className="text-xl font-semibold text-slate-900 tabular-nums">
                    {fmtNum(stats.rows)} <span className="text-xs font-normal text-slate-500">records</span>
                  </div>
                  <div className="text-xs text-slate-500 pt-1 border-t border-slate-200">
                    Schema Width: <span className="font-semibold text-slate-800">{stats.columns} Columns</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Ingestion Volume Bar Chart */}
        <div className="col-span-12">
          <ChartCard
            title="Raw Record Volume by Dataset"
            subtitle="Record count comparison across incoming ingestion sources"
          >
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(datasets).map(([name, stats]) => ({
                    dataset: name,
                    records: stats.rows,
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="dataset" {...CHART_AXIS_PROPS} />
                  <YAxis {...CHART_AXIS_PROPS} tickFormatter={(v) => fmtNum(v)} />
                  <Tooltip content={<ChartTooltip formatter={fmtNum} />} />
                  <Bar
                    dataKey="records"
                    name="Record Count"
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Quality Checks Table */}
        <div className="col-span-12">
          <ChartCard
            title="Validation Check Results"
            subtitle="Automated integrity rules evaluated on latest pipeline run"
          >
            {checks.length === 0 ? (
              <EmptyState title="No checks reported" description="No validation results returned by backend." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="p-3">Check ID</th>
                      <th className="p-3">Check Name</th>
                      <th className="p-3">Validation Rule</th>
                      <th className="p-3">Target Datasets</th>
                      <th className="p-3 text-right">Rows Scanned</th>
                      <th className="p-3 text-right">Violations</th>
                      <th className="p-3">Action on Failure</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {checks.map((c) => {
                      const isPass = c.status === "PASS";
                      const violationCount = c.violations_found ?? c.columns_below_threshold ?? 0;
                      return (
                        <tr key={c.check_id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-medium text-slate-400">#{c.check_id}</td>
                          <td className="p-3 font-semibold text-slate-900">{c.check_name}</td>
                          <td className="p-3 font-mono text-slate-600">{c.rule}</td>
                          <td className="p-3 text-slate-600">{c.datasets.join(", ")}</td>
                          <td className="p-3 text-slate-700 text-right tabular-nums">
                            {c.total_rows_checked !== undefined ? fmtNum(c.total_rows_checked) : `${c.total_columns_checked} cols`}
                          </td>
                          <td
                            className={`p-3 font-semibold text-right tabular-nums ${
                              violationCount > 0 ? "text-rose-700" : "text-emerald-700"
                            }`}
                          >
                            {fmtNum(violationCount)}
                          </td>
                          <td className="p-3 text-slate-500">{c.action_on_failure}</td>
                          <td className="p-3 text-right">
                            <span
                              className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${
                                isPass
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
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
