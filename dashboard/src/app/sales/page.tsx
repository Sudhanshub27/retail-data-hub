"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Percent,
  Package,
  IndianRupee,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend,
} from "recharts";
import { useStore } from "@/context/StoreContext";
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS } from "@/lib/theme";
import { fmtCurrency, fmtNum } from "@/lib/format";

const VELOCITY_DATA = [
  { time: "Wk 1", salesVolume: 1240, velocity: 142 },
  { time: "Wk 2", salesVolume: 1380, velocity: 158 },
  { time: "Wk 3", salesVolume: 1650, velocity: 184 },
  { time: "Wk 4", salesVolume: 1920, velocity: 215 },
  { time: "Wk 5", salesVolume: 2100, velocity: 240 },
  { time: "Wk 6", salesVolume: 2450, velocity: 282 },
  { time: "Wk 7", salesVolume: 2890, velocity: 320 },
  { time: "Wk 8", salesVolume: 3120, velocity: 355 },
];

const SCATTER_BASKET_DATA = [
  { discount: 5, basketValue: 1450, orders: 420 },
  { discount: 10, basketValue: 1850, orders: 890 },
  { discount: 15, basketValue: 2200, orders: 1240 },
  { discount: 20, basketValue: 1900, orders: 980 },
  { discount: 25, basketValue: 1600, orders: 640 },
  { discount: 30, basketValue: 1300, orders: 310 },
];

const TOP_SKUS = [
  { rank: 1, sku: "SKU-8842", name: "Wireless Noise-Canceling Headphones", category: "Electronics", rev: 14250000, units: 570, velocity: "+34.2%", status: "High Velocity" },
  { rank: 2, sku: "SKU-3109", name: "Organic Espresso Dark Roast 1kg", category: "Grocery", rev: 9840000, units: 5318, velocity: "+28.1%", status: "High Velocity" },
  { rank: 3, sku: "SKU-9901", name: "Ergonomic Mesh Executive Chair", category: "Office", rev: 8420000, units: 263, velocity: "+22.5%", status: "Steady" },
  { rank: 4, sku: "SKU-4412", name: "Smart Fitness Watch Series V", category: "Electronics", rev: 7680000, units: 384, velocity: "+19.8%", status: "Steady" },
  { rank: 5, sku: "SKU-2041", name: "Stainless Steel Insulated Tumbler", category: "Home", rev: 5410000, units: 1803, velocity: "+16.4%", status: "Steady" },
  { rank: 6, sku: "SKU-7721", name: "Mechanical Gaming Keyboard RGB", category: "Electronics", rev: 4890000, units: 376, velocity: "+14.2%", status: "Steady" },
  { rank: 7, sku: "SKU-1192", name: "Cold Brew Maker Pitcher 1.5L", category: "Home", rev: 4120000, units: 1030, velocity: "+11.0%", status: "Steady" },
  { rank: 8, sku: "SKU-6630", name: "Ultra-Fast USB-C Charging Hub", category: "Electronics", rev: 3850000, units: 1100, velocity: "+9.5%", status: "Steady" },
];

export default function SalesPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [dateRange, setDateRange] = useState("30D");
  const [channelFilter, setChannelFilter] = useState("All Channels");

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Sales & Revenue Analytics"
        subtitle={`Sales velocity, basket discount correlation, and SKU growth analysis for ${selectedStore.name}`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Picker */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs">
              {["7D", "30D", "QTD", "YTD"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    dateRange === range
                      ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Channel Filter Selector */}
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="bg-white border border-slate-200 text-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium focus:border-indigo-600"
            >
              <option value="All Channels">All Sales Channels</option>
              <option value="Online Store">Online Store</option>
              <option value="POS Physical">In-Store Point of Sale</option>
              <option value="Mobile App">Mobile App</option>
            </select>
          </div>
        }
      />

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Sales Volume (Units)"
          value={fmtNum(Math.round(18420 * mult))}
          change="+18.4%"
          trend="up"
          icon={Package}
          subtitle={`Total physical items sold (${dateRange})`}
          sparklineData={[1240, 1380, 1650, 1920, 2100, 2450, 3120]}
        />
        <KpiCard
          title="Sales Speed (Units / Hour)"
          value={fmtNum(Math.round(355 * mult))}
          change="+12.1% acceleration"
          trend="up"
          icon={TrendingUp}
          subtitle="Hourly turnover rate during peak operating hours"
          sparklineData={[142, 158, 184, 215, 240, 282, 355]}
        />
        <KpiCard
          title="Discount Order Share"
          value="14.2%"
          change="-2.1% margin recovery"
          trend="up"
          icon={Percent}
          subtitle="Percentage of customer purchases with promo codes"
        />
        <KpiCard
          title="Top Product Concentration"
          value="34.8%"
          change="Stable distribution"
          trend="neutral"
          icon={IndianRupee}
          subtitle="Revenue percentage generated by top 10 products"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sales Velocity Bar & Line Overlay Chart */}
        <div className="col-span-12 lg:col-span-8">
          <ChartCard
            title="Sales Volume & Hourly Speed Overlay"
            subtitle="Weekly units sold (bars) compared with hourly sales velocity (line)"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={VELOCITY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
                  <YAxis
                    yAxisId="left"
                    {...CHART_AXIS_PROPS}
                    tickFormatter={(val) => fmtNum(Math.round(val * mult))}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    {...CHART_AXIS_PROPS}
                    tickFormatter={(val) => `${val}/hr`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="salesVolume"
                    name="Sales Volume (Units)"
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="velocity"
                    name="Speed (Units/Hr)"
                    stroke={CHART_COLORS[2]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[2] }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Basket Value vs Discount Scatter Plot */}
        <div className="col-span-12 lg:col-span-4">
          <ChartCard
            title="Basket Size vs Discount Rate"
            subtitle="Customer order total in rupees vs promotional discount percentage"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis
                    type="number"
                    dataKey="discount"
                    name="Discount"
                    unit="%"
                    {...CHART_AXIS_PROPS}
                  />
                  <YAxis
                    type="number"
                    dataKey="basketValue"
                    name="Basket Value"
                    {...CHART_AXIS_PROPS}
                    tickFormatter={(val) => fmtCurrency(val)}
                  />
                  <ZAxis type="number" dataKey="orders" range={[80, 400]} name="Orders" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    content={<ChartTooltip formatter={fmtCurrency} />}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
                  />
                  <Scatter
                    name="Order Value vs Discount"
                    data={SCATTER_BASKET_DATA}
                    fill={CHART_COLORS[2]}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Top Growth SKUs High-Density Table */}
        <div className="col-span-12">
          <ChartCard
            title="Top Growth Products Leaderboard"
            subtitle="Best-performing products ranked by sales velocity and total revenue generated"
          >
            {TOP_SKUS.length === 0 ? (
              <EmptyState title="No products found" description="No SKU data matches the current criteria." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">Product Code</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">Net Revenue</th>
                      <th className="p-3 text-right">Units Sold</th>
                      <th className="p-3 text-right">Growth Velocity</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {TOP_SKUS.map((item) => (
                      <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-medium text-slate-400">#{item.rank}</td>
                        <td className="p-3 font-mono font-medium text-indigo-600">{item.sku}</td>
                        <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="p-3 text-slate-500">{item.category}</td>
                        <td className="p-3 font-semibold text-slate-900 text-right tabular-nums">
                          {fmtCurrency(Math.round(item.rev * mult))}
                        </td>
                        <td className="p-3 text-slate-700 text-right tabular-nums">
                          {fmtNum(Math.round(item.units * mult))}
                        </td>
                        <td className="p-3 text-indigo-600 font-medium text-right tabular-nums">
                          {item.velocity}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {item.status}
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
      </div>
    </div>
  );
}
