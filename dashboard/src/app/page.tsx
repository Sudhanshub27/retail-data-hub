"use client";

import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Receipt,
  LayoutGrid,
  Sparkles,
  Radio,
  SlidersHorizontal,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/context/StoreContext";

// Baseline revenue data
const RAW_REVENUE_DATA = [
  { date: "Mon", revenue: 42500, profit: 14200, target: 40000 },
  { date: "Tue", revenue: 51200, profit: 17800, target: 40000 },
  { date: "Wed", revenue: 48900, profit: 16500, target: 42000 },
  { date: "Thu", revenue: 63100, profit: 22400, target: 45000 },
  { date: "Fri", revenue: 78400, profit: 28900, target: 50000 },
  { date: "Sat", revenue: 92300, profit: 34100, target: 60000 },
  { date: "Sun", revenue: 84100, profit: 30200, target: 55000 },
];

const RAW_CHANNEL_DATA = [
  { channel: "E-Commerce Web", revenue: 184500, growth: "+18.4%", color: "#4f46e5" },
  { channel: "Physical POS Stores", revenue: 142100, growth: "+6.2%", color: "#059669" },
  { channel: "Mobile App", revenue: 98400, growth: "+24.8%", color: "#0891b2" },
  { channel: "Marketplaces (Amazon/Walmart)", revenue: 52400, growth: "+11.1%", color: "#d97706" },
];

const LIVE_TICKER_ITEMS = [
  { id: "1", text: "New Order #90412 in NYC Broadway ($320.00)", time: "Just now", type: "order" },
  { id: "2", text: "Forecast Alert: SKU-8842 demand surge predicted for weekend promo", time: "2m ago", type: "ai" },
  { id: "3", text: "Inventory Alert: Store #104 Chicago stock below reorder threshold", time: "5m ago", type: "alert" },
  { id: "4", text: "Fraud Guard: Flagged rapid velocity checkout attempt ($1,450.00)", time: "8m ago", type: "fraud" },
];

export default function OverviewPage() {
  const { selectedStore, setIsCmdKOpen } = useStore();
  const mult = selectedStore.multiplier;

  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState({
    revenueChart: true,
    channelGrid: true,
    liveTicker: true,
    kpis: true,
  });

  // Dynamically scaled data according to store scope
  const chartData = RAW_REVENUE_DATA.map((d) => ({
    ...d,
    revenue: Math.round(d.revenue * mult),
    profit: Math.round(d.profit * mult),
    target: Math.round(d.target * mult),
  }));

  const totalRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);
  const totalProfit = chartData.reduce((acc, curr) => acc + curr.profit, 0);
  const totalOrders = Math.round(3840 * mult);
  const aov = Math.round(118.5 * (0.9 + mult * 0.1));

  return (
    <div className="space-y-6">
      {/* Header with Store Filter indicator & Customizer Toggle */}
      <PageHeader
        title="Executive Overview"
        subtitle={`Real-time sales & performance metrics for ${selectedStore.name}`}
        icon={LayoutGrid}
        badge={selectedStore.type}
        badgeColor="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCustomizeMode(!isCustomizeMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                isCustomizeMode
                  ? "bg-amber-50 text-amber-700 border border-amber-300"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isCustomizeMode ? "Exit Customizer" : "Customize Layout"}
            </button>
          </div>
        }
      />

      {/* Customizable Widget Selector Panel (when active) */}
      {isCustomizeMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-slide-down flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-800 font-bold">
            <SlidersHorizontal className="w-4 h-4" /> Layout Customization Active: Pin or hide sections
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVisibleWidgets((prev) => ({ ...prev, revenueChart: !prev.revenueChart }))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1 shadow-xs"
            >
              {visibleWidgets.revenueChart ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />} Revenue Chart
            </button>
            <button
              onClick={() => setVisibleWidgets((prev) => ({ ...prev, channelGrid: !prev.channelGrid }))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1 shadow-xs"
            >
              {visibleWidgets.channelGrid ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />} Channels
            </button>
            <button
              onClick={() => setVisibleWidgets((prev) => ({ ...prev, liveTicker: !prev.liveTicker }))}
              className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1 shadow-xs"
            >
              {visibleWidgets.liveTicker ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />} Live Feed
            </button>
          </div>
        </div>
      )}

      {/* Top Executive KPI Cards */}
      {visibleWidgets.kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Net Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            change="+14.2% YoY"
            trend="up"
            icon={DollarSign}
            accentColor="emerald"
            subtitle="7-Day Omnichannel Aggregated"
            sparklineData={[42, 51, 48, 63, 78, 92, 84]}
            onClick={() => setIsCmdKOpen(true)}
          />
          <KpiCard
            title="Gross Profit Margin"
            value={`${((totalProfit / totalRevenue) * 100).toFixed(1)}%`}
            change="+2.4% vs Target"
            trend="up"
            icon={TrendingUp}
            accentColor="indigo"
            subtitle={`Net Profit: $${totalProfit.toLocaleString()}`}
            sparklineData={[32, 34, 33, 35, 36, 37, 36.5]}
          />
          <KpiCard
            title="Total Active Orders"
            value={totalOrders.toLocaleString()}
            change="+8.7% Velocity"
            trend="up"
            icon={ShoppingCart}
            accentColor="cyan"
            subtitle="Fulfilled & In-Transit"
            sparklineData={[410, 480, 450, 520, 610, 720, 650]}
          />
          <KpiCard
            title="Average Order Value (AOV)"
            value={`$${aov.toFixed(2)}`}
            change="-1.2% Promo Effect"
            trend="down"
            icon={Receipt}
            accentColor="amber"
            subtitle="Items/Order: 3.4 avg"
            sparklineData={[124, 122, 120, 119, 118, 117, 118.5]}
          />
        </div>
      )}

      {/* Main Dual-Axis Area Revenue & Margin Chart */}
      {visibleWidgets.revenueChart && (
        <ChartCard
          title="Revenue & Profit Trajectory"
          subtitle="Daily gross revenue vs net profit margin"
          badge="7-Day Window"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: "#475569", fontSize: 12 }}
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, ""]}
                  contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "0.75rem" }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Gross Revenue"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Net Profit"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}

      {/* Grid: Channel Distribution & Live Activity Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Distribution Breakdown */}
        {visibleWidgets.channelGrid && (
          <ChartCard
            title="Channel Sales Distribution"
            subtitle="Revenue distribution across sales channels"
            className="lg:col-span-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
              {RAW_CHANNEL_DATA.map((ch, idx) => {
                const scaledRev = Math.round(ch.revenue * mult);
                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                        <span className="text-xs font-bold text-slate-800">{ch.channel}</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {ch.growth}
                      </span>
                    </div>
                    <div className="text-xl font-extrabold text-slate-900 font-mono mt-3">
                      ${scaledRev.toLocaleString()}
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${((scaledRev / (totalRevenue || 1)) * 100).toFixed(0)}%`,
                          backgroundColor: ch.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        )}

        {/* Live Activity Ticker Feed */}
        {visibleWidgets.liveTicker && (
          <ChartCard
            title="Live Event Feed"
            subtitle="High-frequency operational events"
            badge="Live Sync"
          >
            <div className="space-y-3 my-1">
              {LIVE_TICKER_ITEMS.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs hover:border-slate-300 transition-colors shadow-xs"
                >
                  {item.type === "order" && <ShoppingCart className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                  {item.type === "ai" && <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />}
                  {item.type === "alert" && <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                  {item.type === "fraud" && <Radio className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-800 font-semibold leading-snug">{item.text}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 font-medium">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  );
}
