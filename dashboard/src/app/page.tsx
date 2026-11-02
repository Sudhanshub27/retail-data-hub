"use client";

import React, { useState } from "react";
import {
  IndianRupee,
  TrendingUp,
  ShoppingCart,
  Receipt,
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
  Legend,
} from "recharts";
import { useStore } from "@/context/StoreContext";
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS } from "@/lib/theme";
import { fmtCurrency, fmtPct } from "@/lib/format";

// Baseline revenue data
const RAW_REVENUE_DATA = [
  { date: "Mon", revenue: 4250000, profit: 1420000, target: 4000000 },
  { date: "Tue", revenue: 5120000, profit: 1780000, target: 4000000 },
  { date: "Wed", revenue: 4890000, profit: 1650000, target: 4200000 },
  { date: "Thu", revenue: 6310000, profit: 2240000, target: 4500000 },
  { date: "Fri", revenue: 7840000, profit: 2890000, target: 5000000 },
  { date: "Sat", revenue: 9230000, profit: 3410000, target: 6000000 },
  { date: "Sun", revenue: 8410000, profit: 3020000, target: 5500000 },
];

const RAW_CHANNEL_DATA = [
  { channel: "E-Commerce Web", revenue: 18450000, growth: "+18.4%", color: CHART_COLORS[0] },
  { channel: "Physical POS Stores", revenue: 14210000, growth: "+6.2%", color: CHART_COLORS[2] },
  { channel: "Mobile App", revenue: 9840000, growth: "+24.8%", color: CHART_COLORS[1] },
  { channel: "Marketplaces (Amazon/Flipkart)", revenue: 5240000, growth: "+11.1%", color: CHART_COLORS[3] },
];

const LIVE_TICKER_ITEMS = [
  { id: "1", text: "New Order #90412 in Mumbai Flagship (₹32,500)", time: "Just now", type: "order" },
  { id: "2", text: "Forecast Alert: SKU-8842 demand surge predicted for festive promo", time: "2m ago", type: "ai" },
  { id: "3", text: "Inventory Alert: Bengaluru Hub stock below reorder threshold", time: "5m ago", type: "alert" },
  { id: "4", text: "Fraud Guard: Flagged rapid velocity checkout attempt (₹1,45,000)", time: "8m ago", type: "fraud" },
];

export default function OverviewPage() {
  const { selectedStore, setIsCmdKOpen, isExportingPdf } = useStore();
  const mult = selectedStore.multiplier;

  const [isCustomizeMode, setIsCustomizeMode] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState({
    revenueChart: true,
    channelGrid: true,
    liveTicker: true,
    kpis: true,
  });

  const showKpis = visibleWidgets.kpis || isExportingPdf;
  const showRevenue = visibleWidgets.revenueChart || isExportingPdf;
  const showChannels = visibleWidgets.channelGrid || isExportingPdf;
  const showTicker = visibleWidgets.liveTicker || isExportingPdf;

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
  const aov = Math.round((totalRevenue / (totalOrders || 1)));

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
      {isCustomizeMode && !isExportingPdf && (
        <div
          data-html2canvas-ignore="true"
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
              {visibleWidgets.liveTicker ? <Eye className="w-3 h-3 text-emerald-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />} Live Feed
            </button>
          </div>
        </div>
      )}

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      {showKpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            title="Total Net Revenue"
            value={fmtCurrency(totalRevenue)}
            change="+14.2% YoY"
            trend="up"
            icon={IndianRupee}
            subtitle="Total earnings across channels after returns"
            sparklineData={[42, 51, 48, 63, 78, 92, 84]}
            onClick={() => setIsCmdKOpen(true)}
          />
          <KpiCard
            title="Gross Profit Margin"
            value={fmtPct((totalProfit / totalRevenue) * 100)}
            change="+2.4% vs Target"
            trend="up"
            icon={TrendingUp}
            subtitle={`Net Profit: ${fmtCurrency(totalProfit)}`}
            sparklineData={[32, 34, 33, 35, 36, 37, 36.5]}
          />
          <KpiCard
            title="Total Active Orders"
            value={totalOrders.toLocaleString("en-IN")}
            change="+8.7% Velocity"
            trend="up"
            icon={ShoppingCart}
            subtitle="Orders currently fulfilled or in transit"
            sparklineData={[410, 480, 450, 520, 610, 720, 650]}
          />
          <KpiCard
            title="Average Order Value"
            value={fmtCurrency(aov)}
            change="-1.2% Promo Effect"
            trend="down"
            icon={Receipt}
            subtitle="Average spending per completed order (AOV)"
            sparklineData={[124, 122, 120, 119, 118, 117, 118.5]}
          />
        </div>
      )}

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Main Dual-Axis Area Revenue & Margin Chart */}
        {showRevenue && (
          <div className="col-span-12">
            <ChartCard
              title="Revenue & Profit Trajectory"
              subtitle="Daily gross revenue compared against net profit over the last 7 days"
            >
              <div className="h-72 w-full">
                {chartData.length === 0 ? (
                  <EmptyState title="No trajectory data" description="No sales data found for the selected period." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS[2]} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={CHART_COLORS[2]} stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
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
                      <Legend
                        verticalAlign="top"
                        align="right"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Gross Revenue"
                        stroke={CHART_COLORS[2]}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        name="Net Profit"
                        stroke={CHART_COLORS[0]}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorProfit)"
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
              subtitle="Breakdown of total revenue generated across web, app, stores, and marketplaces"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                {RAW_CHANNEL_DATA.map((ch, idx) => {
                  const scaledRev = Math.round(ch.revenue * mult);
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                          <span className="text-xs font-semibold text-slate-800">{ch.channel}</span>
                        </div>
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {ch.growth}
                        </span>
                      </div>
                      <div className="text-lg font-semibold text-slate-900 mt-3 tabular-nums">
                        {fmtCurrency(scaledRev)}
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
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
          </div>
        )}

        {/* Live Activity Ticker Feed */}
        {showTicker && (
          <div className="col-span-12 lg:col-span-4">
            <ChartCard
              title="Recent Operational Events"
              subtitle="Latest orders, forecast alerts, and inventory triggers"
            >
              <div className="space-y-3 my-1">
                {LIVE_TICKER_ITEMS.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5 text-xs hover:border-slate-300 transition-colors"
                  >
                    {item.type === "order" && <ShoppingCart className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />}
                    {item.type === "ai" && <Sparkles className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />}
                    {item.type === "alert" && <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />}
                    {item.type === "fraud" && <Radio className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-slate-800 font-medium leading-snug">{item.text}</div>
                      <div className="text-xs text-slate-400 mt-1 font-medium">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
}
