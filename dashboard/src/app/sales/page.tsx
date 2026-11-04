"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Package,
  IndianRupee,
  Layers,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { PageSkeleton } from "@/components/Skeleton";
import {
  ComposedChart,
  BarChart,
  Bar,
  Line,
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
import { fmtCurrency, fmtNum, fmtMonthLabel, fmtPct } from "@/lib/format";

interface TopProductItem {
  product_name: string;
  category: string;
  revenue: number;
  quantity_sold: number;
  transactions: number;
}

interface MonthlyTrendItem {
  year_month: string;
  revenue: number;
  transactions: number;
  units_sold: number;
  avg_order_value: number;
}

interface CategoryRevenueItem {
  category: string;
  revenue: number;
  units_sold: number;
  transactions: number;
  unique_customers: number;
  avg_price: number;
}

interface SalesApiResponse {
  monthly_trend?: MonthlyTrendItem[];
  city_sales?: Array<{
    city: string;
    state: string;
    region: string;
    revenue: number;
    units_sold: number;
    transactions: number;
  }>;
  top_products?: {
    top_by_revenue?: TopProductItem[];
    top_by_quantity?: TopProductItem[];
  };
  channel_mix?: Array<{
    channel: string;
    revenue: number;
    transactions: number;
    units_sold: number;
    revenue_pct: number;
  }>;
  category_revenue?: CategoryRevenueItem[];
}

export default function SalesPage() {
  const { selectedStore } = useStore();
  const { data, loading, error, refetch } = useApi<SalesApiResponse>("/api/sales");
  const [productView, setProductView] = useState<"revenue" | "quantity">("revenue");

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!data || !data.monthly_trend || data.monthly_trend.length === 0) {
    return (
      <EmptyState
        title="No sales analytics data"
        description="Run scripts/kpi_analysis.sh to compute commercial and sales KPIs."
        onReset={refetch}
        resetText="Retry fetch"
      />
    );
  }

  const monthlyTrend = data.monthly_trend || [];
  const categoryRevenue = data.category_revenue || [];
  const topProductsList =
    productView === "revenue"
      ? data.top_products?.top_by_revenue || []
      : data.top_products?.top_by_quantity || [];

  const totalVolume = monthlyTrend.reduce((acc, curr) => acc + (curr.units_sold || 0), 0);
  const totalRev = monthlyTrend.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
  const totalTxns = monthlyTrend.reduce((acc, curr) => acc + (curr.transactions || 0), 0);
  const overallAov = totalTxns > 0 ? totalRev / totalTxns : 0;

  const topCategory = categoryRevenue.slice().sort((a, b) => b.revenue - a.revenue)[0];
  const topCatShare = totalRev > 0 && topCategory ? (topCategory.revenue / totalRev) * 100 : 0;

  const chartVelocityData = monthlyTrend.map((d) => ({
    time: fmtMonthLabel(d.year_month),
    salesVolume: Math.round(d.units_sold),
    revenue: Math.round(d.revenue),
    transactions: d.transactions,
  }));

  const categoryChartData = categoryRevenue.map((cat) => ({
    category: cat.category,
    revenue: Math.round(cat.revenue),
    units: Math.round(cat.units_sold),
  }));

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Sales & Revenue Analytics"
        subtitle={`Sales velocity, category performance, and SKU leaderboard for ${selectedStore.name}`}
      />

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Sales Volume (Units)"
          value={fmtNum(totalVolume)}
          change="+18.4% YoY"
          trend="up"
          icon={Package}
          subtitle="Total physical items sold"
          sparklineData={chartVelocityData.slice(-7).map((d) => d.salesVolume)}
        />
        <KpiCard
          title="Gross Sales Revenue"
          value={fmtCurrency(totalRev)}
          change="+14.2% YoY"
          trend="up"
          icon={IndianRupee}
          subtitle="Cumulative sales turnover across all channels"
          sparklineData={chartVelocityData.slice(-7).map((d) => Math.round(d.revenue / 1000000))}
        />
        <KpiCard
          title="Average Order Value"
          value={fmtCurrency(overallAov)}
          change="+3.4% Basket"
          trend="up"
          icon={TrendingUp}
          subtitle="Average spend per transaction"
          sparklineData={[124, 122, 120, 119, 118, 117, 118]}
        />
        <KpiCard
          title="Top Category Concentration"
          value={fmtPct(topCatShare)}
          change={topCategory ? topCategory.category : "Dominant"}
          trend="neutral"
          icon={Layers}
          subtitle={topCategory ? `${topCategory.category} revenue share` : "Category concentration"}
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sales Volume & Revenue Composed Chart */}
        <div className="col-span-12 lg:col-span-7">
          <ChartCard
            title="Monthly Sales Volume & Revenue"
            subtitle="Units sold (bars, left axis) compared with gross sales revenue (line, right axis)"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartVelocityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
                  <YAxis
                    yAxisId="left"
                    {...CHART_AXIS_PROPS}
                    tickFormatter={(val) => fmtNum(val)}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    {...CHART_AXIS_PROPS}
                    tickFormatter={(val) => fmtCurrency(val)}
                  />
                  <Tooltip content={<ChartTooltip formatter={fmtNum} />} />
                  <Legend {...LEGEND_PROPS} />
                  <Bar
                    yAxisId="left"
                    dataKey="salesVolume"
                    name="Units Sold"
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={CHART_COLORS[2]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[2] }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Category Revenue Breakdown Bar Chart */}
        <div className="col-span-12 lg:col-span-5">
          <ChartCard
            title="Revenue by Category"
            subtitle="Gross sales turnover across retail merchandise categories"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis
                    type="number"
                    {...CHART_AXIS_PROPS}
                    tickFormatter={(val) => fmtCurrency(val)}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    {...CHART_AXIS_PROPS}
                    width={90}
                  />
                  <Tooltip content={<ChartTooltip formatter={fmtCurrency} />} />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill={CHART_COLORS[2]}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Top Growth SKUs High-Density Table */}
        <div className="col-span-12">
          <ChartCard
            title="Product Leaderboard"
            subtitle="Top performing catalog items ranked by sales volume and net revenue"
            action={
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setProductView("revenue")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    productView === "revenue"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  By Revenue
                </button>
                <button
                  onClick={() => setProductView("quantity")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    productView === "quantity"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  By Quantity
                </button>
              </div>
            }
          >
            {topProductsList.length === 0 ? (
              <EmptyState title="No products found" description="No SKU records returned by backend." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Net Revenue</th>
                      <th className="p-3 text-right">Units Sold</th>
                      <th className="p-3 text-right">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {topProductsList.map((item, idx) => (
                      <tr key={`${item.product_name}-${idx}`} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-medium text-slate-400">#{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-900">{item.product_name}</td>
                        <td className="p-3 text-slate-500">{item.category}</td>
                        <td className="p-3 font-semibold text-slate-900 text-right tabular-nums">
                          {fmtCurrency(item.revenue)}
                        </td>
                        <td className="p-3 text-slate-700 text-right tabular-nums">
                          {fmtNum(item.quantity_sold)}
                        </td>
                        <td className="p-3 text-indigo-600 font-medium text-right tabular-nums">
                          {fmtNum(item.transactions)}
                        </td>
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
