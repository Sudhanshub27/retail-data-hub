"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Sparkles,
  Layers,
  IndianRupee,
  CheckCircle2,
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
import { fmtCurrency, fmtNum } from "@/lib/format";

interface ForecastItem {
  date: string;
  category: string;
  predicted_revenue: number;
  lower: number;
  upper: number;
}

interface CategorySummaryItem {
  category: string;
  next_30d_predicted: number;
  last_30d_actual: number;
  trend: string;
  change_pct: number;
}

interface ForecastApiResponse {
  summary?: {
    total_30d_predicted_revenue: number;
    top_growth_category: string;
    top_growth_pct: number;
    categories_trained: number;
  };
  model_metrics?: {
    avg_r2: number;
    avg_mae: number;
    avg_mse: number;
  };
  category_summary?: CategorySummaryItem[];
  forecast?: ForecastItem[];
}

export default function ForecastPage() {
  const { selectedStore } = useStore();
  const { data, loading, error, refetch } = useApi<ForecastApiResponse>("/api/forecast");

  // What-If Scenario Sliders
  const [priceChange, setPriceChange] = useState(0); // -20% to +20%
  const [promoDiscount, setPromoDiscount] = useState(10); // 0% to 30%
  const [marketingSpend, setMarketingSpend] = useState(250000); // ₹50k to ₹10L
  const [selectedCategory, setSelectedCategory] = useState("all");

  const summary = data?.summary;
  const metrics = data?.model_metrics;
  const categorySummaries = data?.category_summary || [];
  const rawForecast = useMemo(() => data?.forecast || [], [data?.forecast]);

  // Calculate elasticity adjustment factor
  const elasticityFactor =
    1 +
    -priceChange * 0.015 +
    (promoDiscount - 10) * 0.008 +
    ((marketingSpend - 250000) / 100000) * 0.05;

  const chartData = useMemo(() => {
    if (!rawForecast.length) return [];
    const filtered =
      selectedCategory === "all"
        ? rawForecast
        : rawForecast.filter((f) => f.category === selectedCategory);

    // Group by date
    const byDate = new Map<string, { predicted: number; lower: number; upper: number }>();
    filtered.forEach((item) => {
      const prev = byDate.get(item.date) || { predicted: 0, lower: 0, upper: 0 };
      byDate.set(item.date, {
        predicted: prev.predicted + item.predicted_revenue,
        lower: prev.lower + item.lower,
        upper: prev.upper + item.upper,
      });
    });

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, vals]) => {
        const shortDate = date.slice(5); // MM-DD
        return {
          date: shortDate,
          predicted: Math.round(vals.predicted * elasticityFactor),
          lower: Math.round(vals.lower * elasticityFactor),
          upper: Math.round(vals.upper * elasticityFactor),
        };
      });
  }, [rawForecast, selectedCategory, elasticityFactor]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!data || !summary || !summary.total_30d_predicted_revenue) {
    return (
      <EmptyState
        title="No demand forecast data"
        description="Run src/ml/demand_forecast.py to train PyTorch LSTM model and generate demand forecasts."
        onReset={refetch}
        resetText="Retry fetch"
      />
    );
  }

  const base30dRevenue = summary.total_30d_predicted_revenue;
  const simulated30dRevenue = Math.round(base30dRevenue * elasticityFactor);

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Demand Forecasting & Predictions"
        subtitle={`PyTorch LSTM predictive demand, confidence intervals, and scenario simulations for ${selectedStore.name}`}
      />

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="30-Day Predicted Demand"
          value={fmtCurrency(simulated30dRevenue)}
          change={`Baseline: ${fmtCurrency(base30dRevenue)}`}
          trend="up"
          icon={IndianRupee}
          subtitle="Forecasted aggregate gross sales revenue"
          sparklineData={[42, 45, 48, 52, 58, 62, 68]}
        />
        <KpiCard
          title="Top Growth Category"
          value={summary.top_growth_category}
          change={`+${summary.top_growth_pct}% 30-day projection`}
          trend="up"
          icon={TrendingUp}
          subtitle="Highest momentum merchandise division"
        />
        <KpiCard
          title="Trained Deep Models"
          value={`${summary.categories_trained} Categories`}
          change="LSTM Architecture"
          trend="neutral"
          icon={Layers}
          subtitle="Category-specific PyTorch sequence forecasters"
        />
        <KpiCard
          title="Model Mean Error (MAE)"
          value={fmtCurrency(metrics?.avg_mae ?? 0)}
          change="Cross-category average"
          trend="neutral"
          icon={CheckCircle2}
          subtitle="Average absolute daily deviation"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Forecast Curve with Confidence Intervals */}
        <div className="col-span-12">
          <ChartCard
            title="30-Day Demand Forecast & Confidence Bounds"
            subtitle="PyTorch LSTM projected daily revenue with upper and lower confidence intervals"
            action={
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs font-medium focus:border-indigo-600"
              >
                <option value="all">All Categories</option>
                {categorySummaries.map((c) => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
              </select>
            }
          >
            <div className="h-72 w-full">
              {chartData.length === 0 ? (
                <EmptyState title="No forecast data" description="Unable to generate forecast projection." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ciBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...CHART_GRID_PROPS} />
                    <XAxis dataKey="date" {...CHART_AXIS_PROPS} />
                    <YAxis {...CHART_AXIS_PROPS} tickFormatter={(v) => fmtCurrency(v)} />
                    <Tooltip content={<ChartTooltip formatter={fmtCurrency} />} />
                    <Legend {...LEGEND_PROPS} />
                    <Area
                      type="monotone"
                      dataKey="upper"
                      name="Upper Bound"
                      stroke={CHART_COLORS[1]}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      fill="url(#ciBand)"
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      name="Predicted Revenue"
                      stroke={CHART_COLORS[0]}
                      strokeWidth={2}
                      fill="none"
                    />
                    <Area
                      type="monotone"
                      dataKey="lower"
                      name="Lower Bound"
                      stroke={CHART_COLORS[2]}
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      fill="none"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Category Breakdown Table */}
        <div className="col-span-12">
          <ChartCard
            title="Category Growth & 30-Day Outlook"
            subtitle="Model forecast comparisons against the preceding 30-day baseline"
          >
            {categorySummaries.length === 0 ? (
              <EmptyState title="No categories found" description="No category predictions available." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Last 30D Actual</th>
                      <th className="p-3 text-right">Next 30D Forecast</th>
                      <th className="p-3 text-right">Projected Change</th>
                      <th className="p-3">Trend Direction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {categorySummaries.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">{c.category}</td>
                        <td className="p-3 text-slate-600 text-right tabular-nums">
                          {fmtCurrency(c.last_30d_actual)}
                        </td>
                        <td className="p-3 font-semibold text-slate-900 text-right tabular-nums">
                          {fmtCurrency(c.next_30d_predicted)}
                        </td>
                        <td
                          className={`p-3 font-semibold text-right tabular-nums ${
                            c.change_pct >= 0 ? "text-emerald-700" : "text-rose-700"
                          }`}
                        >
                          {c.change_pct >= 0 ? `+${c.change_pct}%` : `${c.change_pct}%`}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                              c.trend === "rising"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {c.trend}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Interactive Scenario Controls */}
        <div className="col-span-12">
          <ChartCard
            title="Price & Promotion Simulator"
            subtitle="Adjust retail price, promotional discounts, or ad budgets to evaluate predicted demand elasticity"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">Retail Price Adjustment</span>
                  <span className={`font-semibold tabular-nums ${priceChange >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                    {priceChange >= 0 ? `+${priceChange}%` : `${priceChange}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="20"
                  value={priceChange}
                  onChange={(e) => setPriceChange(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                  aria-label="Retail Price Adjustment"
                />
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>-20% Discount</span>
                  <span>Baseline 0%</span>
                  <span>+20% Premium</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">Promotional Discount Rate</span>
                  <span className="font-semibold text-indigo-600 tabular-nums">{promoDiscount}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={promoDiscount}
                  onChange={(e) => setPromoDiscount(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                  aria-label="Promotional Discount Rate"
                />
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>0% Promo</span>
                  <span>15% Standard</span>
                  <span>30% Flash Sale</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">Monthly Ad Budget</span>
                  <span className="font-semibold text-emerald-700 tabular-nums">{fmtCurrency(marketingSpend)}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="1000000"
                  step="50000"
                  value={marketingSpend}
                  onChange={(e) => setMarketingSpend(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                  aria-label="Monthly Ad Budget"
                />
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>₹50K Budget</span>
                  <span>₹2.5L Standard</span>
                  <span>₹10L Blitz</span>
                </div>
              </div>
            </div>

            {/* Renamed to Preview Demand Response */}
            <div className="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-indigo-900">Preview Demand Response</div>
                  <div className="text-sm text-slate-700 font-medium">
                    Adjusted Demand Rate: <span className="text-emerald-700 font-semibold">{((elasticityFactor - 1) >= 0 ? "+" : "") + ((elasticityFactor - 1) * 100).toFixed(1)}%</span> compared to standard baseline
                  </div>
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-xs uppercase font-medium text-slate-500">Preview 30-Day Sales</div>
                <div className="text-xl font-semibold text-emerald-700 tabular-nums">{fmtCurrency(simulated30dRevenue)}</div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
