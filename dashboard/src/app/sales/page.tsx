"use client";

import React, { useState } from "react";
import {
  ShoppingCart,
  TrendingUp,
  Filter,
  Package,
  DollarSign,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
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
} from "recharts";
import { useStore } from "@/context/StoreContext";

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
  { discount: 5, basketValue: 145, orders: 420 },
  { discount: 10, basketValue: 185, orders: 890 },
  { discount: 15, basketValue: 220, orders: 1240 },
  { discount: 20, basketValue: 190, orders: 980 },
  { discount: 25, basketValue: 160, orders: 640 },
  { discount: 30, basketValue: 130, orders: 310 },
];

const TOP_SKUS = [
  { rank: 1, sku: "SKU-8842", name: "Wireless Noise-Canceling Headphones", category: "Electronics", rev: 142500, units: 570, velocity: "+34.2%", status: "High Velocity" },
  { rank: 2, sku: "SKU-3109", name: "Organic Espresso Dark Roast 1kg", category: "Grocery", rev: 98400, units: 5318, velocity: "+28.1%", status: "High Velocity" },
  { rank: 3, sku: "SKU-9901", name: "Ergonomic Mesh Executive Chair", category: "Office", rev: 84200, units: 263, velocity: "+22.5%", status: "Steady" },
  { rank: 4, sku: "SKU-4412", name: "Smart Fitness Watch Series V", category: "Electronics", rev: 76800, units: 384, velocity: "+19.8%", status: "Steady" },
  { rank: 5, sku: "SKU-2041", name: "Stainless Steel Insulated Tumbler", category: "Home", rev: 54100, units: 1803, velocity: "+16.4%", status: "Steady" },
  { rank: 6, sku: "SKU-7721", name: "Mechanical Gaming Keyboard RGB", category: "Electronics", rev: 48900, units: 376, velocity: "+14.2%", status: "Steady" },
  { rank: 7, sku: "SKU-1192", name: "Cold Brew Maker Pitcher 1.5L", category: "Home", rev: 41200, units: 1030, velocity: "+11.0%", status: "Steady" },
  { rank: 8, sku: "SKU-6630", name: "Ultra-Fast USB-C Charging Hub", category: "Electronics", rev: 38500, units: 1100, velocity: "+9.5%", status: "Steady" },
];

export default function SalesPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [dateRange, setDateRange] = useState("30D");
  const [channelFilter, setChannelFilter] = useState("All Channels");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & Revenue Analytics"
        subtitle={`Sales velocity, basket discount correlation, and SKU growth analysis for ${selectedStore.name}`}
        icon={ShoppingCart}
        action={
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Picker */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-xs">
              {["7D", "30D", "QTD", "YTD"].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    dateRange === range
                      ? "bg-indigo-600 text-white shadow-xs"
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
              className="bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-indigo-600 shadow-xs"
            >
              <option value="All Channels">All Sales Channels</option>
              <option value="Online Store">Online Store</option>
              <option value="POS Physical">POS In-Store</option>
              <option value="Mobile App">Mobile App</option>
            </select>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Sales Volume (Units)"
          value={Math.round(18420 * mult).toLocaleString()}
          change="+18.4%"
          trend="up"
          icon={Package}
          accentColor="emerald"
          subtitle={`Window: ${dateRange} Filter: ${channelFilter}`}
        />
        <KpiCard
          title="Sales Velocity (Units/Hr)"
          value={Math.round(355 * mult).toString()}
          change="+12.1% acceleration"
          trend="up"
          icon={TrendingUp}
          accentColor="cyan"
          subtitle="Peak Hour: 14:00 - 16:00 EST"
        />
        <KpiCard
          title="Discount Penetration"
          value="14.2%"
          change="-2.1% margin recovery"
          trend="up"
          icon={Filter}
          accentColor="indigo"
          subtitle="Avg Discount Applied: 12.5%"
        />
        <KpiCard
          title="Top SKU Revenue Share"
          value="34.8%"
          change="Concentration stable"
          trend="neutral"
          icon={DollarSign}
          accentColor="amber"
          subtitle="Top 10 SKUs of 1,420 total"
        />
      </div>

      {/* Sales Velocity Bar & Line Overlay Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Sales Volume & Velocity Overlay"
          subtitle="Weekly total units sold overlaid with hourly velocity rate"
          className="lg:col-span-2"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={VELOCITY_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  tick={{ fill: "#475569", fontSize: 12 }}
                  tickFormatter={(val) => Math.round(val * mult).toLocaleString()}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#0891b2"
                  tick={{ fill: "#0891b2", fontSize: 12 }}
                />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "0.75rem" }} />
                <Bar yAxisId="left" dataKey="salesVolume" name="Sales Volume (Units)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="velocity" name="Velocity Rate (Units/Hr)" stroke="#0891b2" strokeWidth={3} dot={{ fill: "#0891b2" }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Basket Value vs Discount Scatter Plot */}
        <ChartCard
          title="Basket Value vs Discount %"
          subtitle="Correlation between promo discount and average basket value"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="discount" name="Discount %" unit="%" stroke="#64748b" tick={{ fill: "#475569" }} />
                <YAxis type="number" dataKey="basketValue" name="Basket $" unit="$" stroke="#64748b" tick={{ fill: "#475569" }} />
                <ZAxis type="number" dataKey="orders" range={[100, 500]} name="Orders Volume" />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }} />
                <Scatter name="Basket Correlation" data={SCATTER_BASKET_DATA} fill="#059669" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Top 10 Growth SKUs High-Density Table */}
      <ChartCard
        title="Top Growth SKUs Leaderboard"
        subtitle="Ranked by sales velocity expansion and net revenue contribution"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">SKU Code</th>
                <th className="p-3">Product Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">Net Revenue</th>
                <th className="p-3">Units Sold</th>
                <th className="p-3">Growth Velocity</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {TOP_SKUS.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-400">#{item.rank}</td>
                  <td className="p-3 font-mono font-bold text-indigo-600">{item.sku}</td>
                  <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="p-3 text-slate-500">{item.category}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">${Math.round(item.rev * mult).toLocaleString()}</td>
                  <td className="p-3 font-mono text-slate-700">{Math.round(item.units * mult).toLocaleString()}</td>
                  <td className="p-3 font-mono text-cyan-700 font-bold">{item.velocity}</td>
                  <td className="p-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
