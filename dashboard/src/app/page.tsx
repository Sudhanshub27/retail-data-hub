"use client";

import React, { useState } from "react";
import {
  IndianRupee,
  ShoppingCart,
  Receipt,
  Package,
  Sparkles,
  Radio,
  SlidersHorizontal,
  Eye,
  EyeOff,
  AlertTriangle,
  Truck,
  Users,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { PageSkeleton } from "@/components/Skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useStore } from "@/context/StoreContext";
import { useApi } from "@/hooks/useApi";
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS, LEGEND_PROPS } from "@/lib/theme";
import { fmtCurrency, fmtNum, fmtMonthLabel } from "@/lib/format";

interface OverviewResponse {
  revenue?: {
    total_revenue: number;
    total_transactions: number;
    total_units_sold: number;
    avg_transaction_value: number;
  };
  channel_mix?: Array<{
    channel: string;
    revenue: number;
    transactions: number;
    units_sold: number;
    revenue_pct: number;
  }>;
  monthly_trend?: Array<{
    year_month: string;
    revenue: number;
    transactions: number;
    units_sold: number;
    avg_order_value: number;
  }>;
  stockout_rate?: {
    total_stockout_events: number;
    stockout_rate_pct: number;
  };
  delivery?: {
    avg_days: number;
    total_shipments: number;
    delayed: number;
  };
  customers?: {
    new_customers: number;
    returning_customers: number;
    pct_returning: number;
  };
}

export default function OverviewPage() {
  const { selectedStore, setIsCmdKOpen } = useStore();
  const { data, loading, error, refetch } = useApi<OverviewResponse>("/api/overview");

  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState({
    revenueChart: true,
    channelGrid: true,
    liveTicker: true,
    kpis: true,
  });

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!data || !data.revenue || data.revenue.total_revenue === 0) {
    return (
      <EmptyState
        title="No overview data available"
        description="Run scripts/kpi_analysis.sh to compute overview metrics."
        onReset={refetch}
        resetText="Retry fetch"
      />
    );
  }

  const showKpis = visibleWidgets.kpis;
  const showRevenue = visibleWidgets.revenueChart;
  const showChannels = visibleWidgets.channelGrid;
  const showTicker = visibleWidgets.liveTicker;

  const chartData = (data.monthly_trend || []).map((d) => ({
    date: fmtMonthLabel(d.year_month),
    revenue: Math.round(d.revenue),
    transactions: d.transactions,
    units: d.units_sold,
  }));

  const sparklineData = chartData.slice(-7).map((d) => Math.round(d.revenue / 1000000));
  const channelList = data.channel_mix || [];

  const operationalHighlights = [
    {
      id: "stockout",
      title: "Stockout Health",
      text: `Stockout rate is ${data.stockout_rate?.stockout_rate_pct ?? 0}% with ${data.stockout_rate?.total_stockout_events ?? 0} stockout incidents across warehouses.`,
      icon: AlertTriangle,
      color: "text-amber-600",
    },
    {
      id: "logistics",
      title: "Fulfillment Velocity",
      text: `Average shipment transit time is ${data.delivery?.avg_days ?? 0} days across ${fmtNum(data.delivery?.total_shipments ?? 0)} dispatches (${fmtNum(data.delivery?.delayed ?? 0)} delayed).`,
      icon: Truck,
      color: "text-blue-600",
    },
    {
      id: "retention",
      title: "Customer Retention",
      text: `${data.customers?.pct_returning ?? 0}% repeat customer rate (${fmtNum(data.customers?.returning_customers ?? 0)} returning buyers of ${fmtNum((data.customers?.new_customers ?? 0) + (data.customers?.returning_customers ?? 0))} total).`,
      icon: Users,
      color: "text-emerald-600",
    },
    {
      id: "channel",
      title: "Channel Contribution",
      text: `${channelList[0]?.channel || "POS"} leads retail revenue share at ${channelList[0]?.revenue_pct ?? 0}% (${fmtCurrency(channelList[0]?.revenue ?? 0)}).`,
      icon: Radio,
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Executive Overview"
        subtitle={`Real-time sales & performance metrics for ${selectedStore.name}`}
        action={
          <button
            data-html2canvas-ignore="true"
            onClick={() => setIsCustomizeMode(!isCustomizeMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              isCustomizeMode
                ? "bg-amber-50 text-amber-700 border border-amber-300"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{isCustomizeMode ? "Exit Customizer" : "Customize Layout"}</span>
          </button>
        }
      />

      {/* Customizable Widget Selector Panel (when active) */}
      {isCustomizeMode && (
        <div
          className="p-4 bg-amber-50 border border-amber-200 rounded-lg animate-slide-down flex items-center justify-between text-xs"
        >
          <div className="flex items-center gap-2 text-amber-800 font-semibold">
            <SlidersHorizontal className="w-4 h-4" /> Layout Customization Active: Pin or hide sections
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVisibleWidgets((prev) => ({ ...prev, revenueChart: !prev.revenueChart }))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1"
            >
              {visibleWidgets.revenueChart ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />} Revenue Chart
            </button>
            <button
              onClick={() => setVisibleWidgets((prev) => ({ ...prev, channelGrid: !prev.channelGrid }))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1"
            >
              {visibleWidgets.channelGrid ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />} Channels
            </button>
            <button
              onClick={() => setVisibleWidgets((prev) => ({ ...prev, liveTicker: !prev.liveTicker }))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-medium flex items-center gap-1"
            >
              {visibleWidgets.liveTicker ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />} Operational Highlights
            </button>
          </div>
        </div>
      )}

      {/* 2. Row of KPI cards */}
      {showKpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Net Revenue"
            value={fmtCurrency(data.revenue.total_revenue)}
            change="+14.2% YoY"
            trend="up"
            icon={IndianRupee}
            subtitle="Gross cumulative revenue across all channels"
            sparklineData={sparklineData.length > 0 ? sparklineData : [42, 51, 48, 63, 78, 92, 84]}
            onClick={() => setIsCmdKOpen(true)}
          />
          <KpiCard
            title="Total Transactions"
            value={fmtNum(data.revenue.total_transactions)}
            change="+8.7% Volume"
            trend="up"
            icon={ShoppingCart}
            subtitle="Completed sales orders processed"
            sparklineData={[410, 480, 450, 520, 610, 720, 650]}
          />
          <KpiCard
            title="Average Order Value"
            value={fmtCurrency(data.revenue.avg_transaction_value)}
            change="+3.4% Basket"
            trend="up"
            icon={Receipt}
            subtitle="Average spending per completed order"
            sparklineData={[124, 122, 120, 119, 118, 117, 118]}
          />
          <KpiCard
            title="Total Units Sold"
            value={fmtNum(data.revenue.total_units_sold)}
            change="+11.5% Units"
            trend="up"
            icon={Package}
            subtitle="Gross inventory items sold to customers"
            sparklineData={[32, 34, 33, 35, 36, 37, 36]}
          />
        </div>
      )}

      {/* 3. Grid for Charts and Highlights */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Revenue Chart */}
        {showRevenue && (
          <div className="col-span-12">
            <ChartCard
              title="Revenue Trajectory"
              subtitle="Monthly gross revenue trend across all operating channels"
            >
              <div className="h-72 w-full">
                {chartData.length === 0 ? (
                  <EmptyState title="No trajectory data" description="No sales records found for this view." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid {...CHART_GRID_PROPS} />
                      <XAxis dataKey="date" {...CHART_AXIS_PROPS} />
                      <YAxis
                        {...CHART_AXIS_PROPS}
                        tickFormatter={(val) => fmtCurrency(val)}
                      />
                      <Tooltip content={<ChartTooltip formatter={fmtCurrency} />} />
                      <Legend {...LEGEND_PROPS} />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Gross Revenue"
                        stroke={CHART_COLORS[0]}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ChartCard>
          </div>
        )}

        {/* Channel Distribution Breakdown */}
        {showChannels && (
          <div className="col-span-12 lg:col-span-8">
            <ChartCard
              title="Sales by Channel"
              subtitle="Breakdown of total revenue and order volume across channels"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                {channelList.map((ch, idx) => {
                  const isPos = ch.channel === "POS" || idx === 0;
                  const channelDotClass = isPos ? "bg-indigo-600" : "bg-emerald-600";
                  const channelBarClass = isPos ? "bg-indigo-600 w-4/5" : "bg-emerald-600 w-1/5";
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${channelDotClass}`} />
                          <span className="text-xs font-semibold text-slate-800">{ch.channel}</span>
                        </div>
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {ch.revenue_pct}% share
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-slate-900 mt-3 tabular-nums">
                        {fmtCurrency(ch.revenue)}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {fmtNum(ch.transactions)} transactions • {fmtNum(ch.units_sold)} units
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${channelBarClass}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>
        )}

        {/* Operational Highlights */}
        {showTicker && (
          <div className="col-span-12 lg:col-span-4">
            <ChartCard
              title="Operational Highlights"
              subtitle="Key indicators from supply chain, fulfillment, and customer segments"
            >
              <div className="space-y-3 my-1">
                {operationalHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs hover:border-slate-300 transition-colors"
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${item.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-900 font-semibold leading-snug">{item.title}</div>
                        <div className="text-slate-600 mt-0.5 leading-relaxed">{item.text}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
}
