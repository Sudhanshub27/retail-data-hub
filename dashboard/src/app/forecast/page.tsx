"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Package,
  IndianRupee,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Legend,
} from "recharts";
import { useStore } from "@/context/StoreContext";
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS } from "@/lib/theme";
import { fmtCurrency, fmtNum } from "@/lib/format";

const FORECAST_BASE = [
  { day: "Day 1", actual: 4200, predicted: 4200, ci80Upper: 4400, ci80Lower: 4000, ci95Upper: 4600, ci95Lower: 3800 },
  { day: "Day 3", actual: 4800, predicted: 4750, ci80Upper: 5000, ci80Lower: 4500, ci95Upper: 5200, ci95Lower: 4300 },
  { day: "Day 7", actual: 5100, predicted: 5150, ci80Upper: 5500, ci80Lower: 4800, ci95Upper: 5800, ci95Lower: 4500 },
  { day: "Day 10", actual: null, predicted: 5600, ci80Upper: 6100, ci80Lower: 5100, ci95Upper: 6500, ci95Lower: 4700 },
  { day: "Day 14", actual: null, predicted: 6200, ci80Upper: 6800, ci80Lower: 5600, ci95Upper: 7300, ci95Lower: 5100 },
  { day: "Day 21", actual: null, predicted: 6900, ci80Upper: 7700, ci80Lower: 6100, ci95Upper: 8200, ci95Lower: 5600 },
  { day: "Day 30", actual: null, predicted: 7500, ci80Upper: 8500, ci80Lower: 6500, ci95Upper: 9200, ci95Lower: 5800 },
];

export default function ForecastPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  // What-If Scenario Sliders
  const [priceChange, setPriceChange] = useState(0); // -20% to +20%
  const [promoDiscount, setPromoDiscount] = useState(10); // 0% to 30%
  const [marketingSpend, setMarketingSpend] = useState(250000); // ₹50k to ₹10L

  // Calculate dynamic demand modifier based on what-if scenario
  const elasticityFactor = 1 + (-priceChange * 0.015) + ((promoDiscount - 10) * 0.008) + (((marketingSpend - 250000) / 100000) * 0.05);

  const dynamicForecastData = FORECAST_BASE.map((item) => {
    const modPredicted = Math.round(item.predicted * elasticityFactor * mult);
    return {
      ...item,
      actual: item.actual !== null ? Math.round(item.actual * mult) : null,
      predicted: modPredicted,
      ci80Upper: Math.round(item.ci80Upper * elasticityFactor * mult),
      ci80Lower: Math.round(item.ci80Lower * elasticityFactor * mult),
      ci95Upper: Math.round(item.ci95Upper * elasticityFactor * mult),
      ci95Lower: Math.round(item.ci95Lower * elasticityFactor * mult),
    };
  });

  const projected30DayUnits = dynamicForecastData[dynamicForecastData.length - 1].predicted * 30;
  const projected30DayRev = Math.round(projected30DayUnits * 1180);

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Demand Forecasting & Predictions"
        subtitle={`Expected sales trajectory, stock depletion risk, and pricing scenario simulation for ${selectedStore.name}`}
      />

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="7-Day Depletion Risk"
          value={`${Math.round(4 * mult)} Products`}
          change="Urgent reorder"
          trend="down"
          icon={AlertTriangle}
          subtitle="Products likely to exhaust warehouse stock within 7 days"
        />
        <KpiCard
          title="14-Day Depletion Buffer"
          value={`${Math.round(14 * mult)} Products`}
          change="Lead time alert"
          trend="down"
          icon={Package}
          subtitle="Products nearing safety threshold before supplier replenishment"
        />
        <KpiCard
          title="30-Day Estimated Demand"
          value={`${fmtNum(projected30DayUnits)} Units`}
          change="+14.2% Growth"
          trend="up"
          icon={TrendingUp}
          subtitle="Estimated total units required over the next 30 days"
          sparklineData={[4200, 4750, 5150, 5600, 6200, 6900, 7500]}
        />
        <KpiCard
          title="Projected 30-Day Sales"
          value={fmtCurrency(projected30DayRev)}
          change="+9.8% vs Target"
          trend="up"
          icon={IndianRupee}
          subtitle="Estimated revenue forecast under current simulation conditions"
          sparklineData={[38, 41, 45, 52, 60, 68, 75]}
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Forecast Curve with 80% & 95% Confidence Intervals */}
        <div className="col-span-12">
          <ChartCard
            title="Sales Demand Forecast & Confidence Bounds"
            subtitle="Past sales volume compared with expected future demand; shaded zones display 80% and 95% prediction confidence ranges"
          >
            <div className="h-72 w-full">
              {dynamicForecastData.length === 0 ? (
                <EmptyState title="No forecast data" description="Unable to generate forecast projection." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dynamicForecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="ci95" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id="ci80" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...CHART_GRID_PROPS} />
                    <XAxis dataKey="day" {...CHART_AXIS_PROPS} />
                    <YAxis {...CHART_AXIS_PROPS} tickFormatter={(v) => fmtNum(v)} />
                    <Tooltip content={<ChartTooltip formatter={fmtNum} />} />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
                    />

                    {/* 95% CI Shaded Area */}
                    <Area type="monotone" dataKey="ci95Upper" name="95% Range High" stroke="none" fill="url(#ci95)" />
                    <Area type="monotone" dataKey="ci95Lower" name="95% Range Low" stroke="none" fill="url(#ci95)" />

                    {/* 80% CI Shaded Area */}
                    <Area type="monotone" dataKey="ci80Upper" name="80% Range High" stroke="none" fill="url(#ci80)" />

                    {/* Forecast & Actual Lines */}
                    <Line type="monotone" dataKey="predicted" name="Expected Sales" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ fill: CHART_COLORS[0] }} />
                    <Line type="monotone" dataKey="actual" name="Recorded Sales" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ fill: CHART_COLORS[2] }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </ChartCard>
        </div>

        {/* Interactive What-If Scenario Slider Controls */}
        <div className="col-span-12">
          <ChartCard
            title="Price & Promotion Simulator"
            subtitle="Test how adjusting retail price, promotional discounts, or ad budgets impacts projected buyer demand"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2">
              {/* Price Change Slider */}
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

              {/* Promo Discount Slider */}
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

              {/* Marketing Spend Slider */}
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
                  <span>₹5L Standard</span>
                  <span>₹10L Blitz</span>
                </div>
              </div>
            </div>

            {/* Dynamic Simulation Result Pill */}
            <div className="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-indigo-900">Simulated Demand Response</div>
                  <div className="text-sm text-slate-700 font-medium">
                    Adjusted Demand Rate: <span className="text-emerald-700 font-semibold">{((elasticityFactor - 1) >= 0 ? "+" : "") + ((elasticityFactor - 1) * 100).toFixed(1)}%</span> compared to standard baseline
                  </div>
                </div>
              </div>
              <div className="sm:text-right">
                <div className="text-xs uppercase font-medium text-slate-500">Projected 30-Day Sales</div>
                <div className="text-xl font-semibold text-emerald-700 tabular-nums">{fmtCurrency(projected30DayRev)}</div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
