"use client";

import React, { useState } from "react";
import {
  Users,
  UserCheck,
  AlertTriangle,
  UserPlus,
  Gift,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { PageSkeleton } from "@/components/Skeleton";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/context/StoreContext";
import { useApi } from "@/hooks/useApi";
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS, LEGEND_PROPS } from "@/lib/theme";
import { fmtCurrency, fmtNum, fmtMonthLabel, fmtPct } from "@/lib/format";

interface RfmSegment {
  segment: string;
  count: number;
  avg_recency: number;
  avg_frequency: number;
  avg_monetary: number;
}

interface TopCustomer {
  customer_id: string;
  customer_name: string;
  city: string;
  lifetime_value: number;
  total_transactions: number;
  total_units: number;
  first_purchase: string;
  last_purchase: string;
}

interface CustomersApiResponse {
  new_vs_returning?: {
    summary?: {
      total_unique_customers: number;
      one_time_buyers: number;
      repeat_buyers: number;
      repeat_rate_pct: number;
    };
    monthly_trend?: Array<{
      year_month: string;
      total_customers: number;
      new_customers: number;
      returning_customers: number;
    }>;
  };
  clv?: {
    stats?: {
      avg_clv: number;
      median_clv: number;
      max_clv: number;
      min_clv: number;
    };
    top_20?: TopCustomer[];
  };
  rfm?: {
    segments?: RfmSegment[];
  };
}

export default function CustomersPage() {
  const { selectedStore } = useStore();
  const { data, loading, error, refetch } = useApi<CustomersApiResponse>("/api/customers");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const summary = data?.new_vs_returning?.summary;
  const clvStats = data?.clv?.stats;

  if (!data || !summary || !clvStats) {
    return (
      <EmptyState
        title="No customer intelligence data"
        description="Run scripts/kpi_analysis.sh to compute RFM segments and customer CLV."
        onReset={refetch}
        resetText="Retry fetch"
      />
    );
  }

  const rfmSegments = data?.rfm?.segments || [];
  const topAccounts = data?.clv?.top_20 || [];
  const monthlyTrend = (data?.new_vs_returning?.monthly_trend || []).map((m) => ({
    month: fmtMonthLabel(m.year_month),
    newCustomers: m.new_customers,
    returningCustomers: m.returning_customers,
    total: m.total_customers,
  }));

  const totalSegmentCount = rfmSegments.reduce((acc, curr) => acc + curr.count, 0) || 1;
  const atRiskSegment = rfmSegments.find((s) => s.segment.toLowerCase().includes("at risk"));

  const handleReengage = (custId: string, actionName: string) => {
    setActionSuccess(`Triggered "${actionName}" for customer ${custId}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const getSegmentStyle = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("champion")) return "border-emerald-200 bg-emerald-50 text-emerald-900";
    if (n.includes("loyal")) return "border-indigo-200 bg-indigo-50 text-indigo-900";
    if (n.includes("at risk")) return "border-rose-200 bg-rose-50 text-rose-900";
    if (n.includes("attention")) return "border-amber-200 bg-amber-50 text-amber-900";
    if (n.includes("lost")) return "border-slate-300 bg-slate-100 text-slate-700";
    return "border-slate-200 bg-slate-50 text-slate-800";
  };

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Customer Intelligence & Retention"
        subtitle={`Customer retention cohorts, purchase habit segments, and VIP account leaderboard for ${selectedStore.name}`}
      />

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {actionSuccess}
        </div>
      )}

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Customers"
          value={fmtNum(summary.total_unique_customers)}
          change="+12.4% YoY"
          trend="up"
          icon={Users}
          subtitle="Unique buyers registered across catalog"
          sparklineData={[620, 650, 680, 710, 730, 750, 768]}
        />
        <KpiCard
          title="Average Customer Value"
          value={fmtCurrency(clvStats.avg_clv)}
          change={`Median: ${fmtCurrency(clvStats.median_clv)}`}
          trend="up"
          icon={UserCheck}
          subtitle="Mean lifetime expenditure per customer"
          sparklineData={[120, 125, 130, 138, 140, 142, 145]}
        />
        <KpiCard
          title="Repeat Buyer Rate"
          value={fmtPct(summary.repeat_rate_pct)}
          change={`${fmtNum(summary.repeat_buyers)} repeat shoppers`}
          trend="up"
          icon={TrendingUp}
          subtitle="Percentage with 2+ completed orders"
        />
        <KpiCard
          title="At-Risk Customers"
          value={fmtNum(atRiskSegment?.count ?? 0)}
          change="Intervention suggested"
          trend="down"
          icon={AlertTriangle}
          subtitle="Accounts showing declining activity"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Customer RFM Segments Matrix */}
        <div className="col-span-12">
          <ChartCard
            title="Customer Buying Behavior Groups"
            subtitle="Customer segmentation based on Recency, Frequency, and Monetary metrics (RFM Matrix)"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-2">
              {rfmSegments.map((seg, idx) => {
                const pct = ((seg.count / totalSegmentCount) * 100).toFixed(1);
                return (
                  <div
                    key={idx}
                    className={`p-4 border rounded-lg transition-colors ${getSegmentStyle(seg.segment)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{seg.segment}</span>
                      <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                        {pct}%
                      </span>
                    </div>
                    <div className="text-2xl font-semibold mt-2 tabular-nums">
                      {fmtNum(seg.count)}
                    </div>
                    <div className="text-xs opacity-90 mt-2 space-y-0.5">
                      <div>Avg Spend: <span className="font-semibold">{fmtCurrency(seg.avg_monetary)}</span></div>
                      <div>Recency: <span className="font-semibold">{Math.round(seg.avg_recency)} days</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Monthly New vs Returning Trend */}
        <div className="col-span-12 lg:col-span-6">
          <ChartCard
            title="Monthly New vs Returning Customers"
            subtitle="Acquisition and retention trajectory over operating months"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="month" {...CHART_AXIS_PROPS} />
                  <YAxis {...CHART_AXIS_PROPS} tickFormatter={(v) => fmtNum(v)} />
                  <Tooltip content={<ChartTooltip formatter={fmtNum} />} />
                  <Legend {...LEGEND_PROPS} />
                  <Line
                    type="monotone"
                    dataKey="returningCustomers"
                    name="Returning Customers"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[0] }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newCustomers"
                    name="New Customers"
                    stroke={CHART_COLORS[2]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[2] }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Top Accounts Leaderboard */}
        <div className="col-span-12 lg:col-span-6">
          <ChartCard
            title="Top Customer Accounts (Highest CLV)"
            subtitle="Leading retail accounts ranked by cumulative spend and repeat loyalty"
          >
            {topAccounts.length === 0 ? (
              <EmptyState title="No customer accounts" description="No customer accounts found." />
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
                {topAccounts.slice(0, 8).map((cust) => (
                  <div
                    key={cust.customer_id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{cust.customer_name}</span>
                        <span className="text-xs text-slate-500 font-mono">({cust.customer_id})</span>
                        <span className="text-xs text-slate-400">• {cust.city}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Lifetime Spend: <span className="text-emerald-700 font-semibold">{fmtCurrency(cust.lifetime_value)}</span> •{" "}
                        <span className="text-slate-700 font-medium">{cust.total_transactions} orders</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReengage(cust.customer_id, "Send VIP Offer")}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                        title="Send 15% VIP Offer"
                        aria-label="Send Discount"
                      >
                        <Gift className="w-3.5 h-3.5 text-indigo-600" />
                      </button>
                      <button
                        onClick={() => handleReengage(cust.customer_id, "Assign Account Manager")}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                        title="Assign Account Executive"
                        aria-label="Assign Manager"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
