"use client";

import React, { useState, useEffect } from "react";
import {
  Radio,
  Pause,
  Play,
  Activity,
  Zap,
  ShoppingCart,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/context/StoreContext";
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS } from "@/lib/theme";
import { fmtCurrency, fmtNum } from "@/lib/format";

interface StreamTxn {
  id: string;
  sku: string;
  price: number;
  channel: string;
  timestamp: string;
  latencyMs: number;
}

export default function LivePage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [isStreaming, setIsStreaming] = useState(true);
  const [streamData, setStreamData] = useState<StreamTxn[]>([
    { id: "LIVE-9041", sku: "Wireless Noise-Canceling Headphones", price: 14500, channel: "Mumbai Flagship Store", timestamp: "23:04:12", latencyMs: 14 },
    { id: "LIVE-9042", sku: "Organic Espresso Dark Roast (1kg)", price: 1850, channel: "E-Commerce Web", timestamp: "23:04:13", latencyMs: 18 },
    { id: "LIVE-9043", sku: "Ergonomic Mesh Executive Chair", price: 24900, channel: "Mobile App Android", timestamp: "23:04:14", latencyMs: 12 },
    { id: "LIVE-9044", sku: "Smart Fitness Watch Series V", price: 19900, channel: "Delhi NCR POS #2", timestamp: "23:04:15", latencyMs: 22 },
  ]);

  // Telemetry Latency chart data
  const [telemetry] = useState([
    { time: "23:00", latency: 18, qps: 420 },
    { time: "23:01", latency: 15, qps: 440 },
    { time: "23:02", latency: 22, qps: 480 },
    { time: "23:03", latency: 14, qps: 510 },
    { time: "23:04", latency: 16, qps: 530 },
  ]);

  useEffect(() => {
    if (!isStreaming) return;
    const interval = setInterval(() => {
      const newId = `LIVE-${Math.floor(80000 + Math.random() * 20000)}`;
      const skus = [
        "Wireless Noise-Canceling Headphones",
        "Organic Espresso Dark Roast (1kg)",
        "Ergonomic Mesh Executive Chair",
        "Stainless Steel Insulated Tumbler",
      ];
      const prices = [14500, 1850, 24900, 1200];
      const channels = ["E-Commerce Web", "Mumbai Flagship Store", "Mobile App Android", "Delhi NCR POS #2"];
      const randIdx = Math.floor(Math.random() * skus.length);
      const newTxn: StreamTxn = {
        id: newId,
        sku: skus[randIdx],
        price: prices[randIdx],
        channel: channels[Math.floor(Math.random() * channels.length)],
        timestamp: new Date().toISOString().split("T")[1].split(".")[0],
        latencyMs: Math.floor(12 + Math.random() * 15),
      };
      setStreamData((prev) => [newTxn, ...prev.slice(0, 6)]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Real-Time Event Stream"
        subtitle={`Live order stream, transaction processing speed, and database response latency for ${selectedStore.name}`}
        action={
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
              isStreaming
                ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300"
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-4 h-4 text-amber-600" /> Pause Stream
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-emerald-600" /> Resume Stream
              </>
            )}
          </button>
        }
      />

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Processing Throughput"
          value={`${fmtNum(Math.round(530 * mult))} req/s`}
          change="Requests per second"
          trend="up"
          icon={Activity}
          subtitle="Real-time transaction events handled per second"
          sparklineData={[420, 440, 480, 510, 530]}
        />
        <KpiCard
          title="Average Response Speed"
          value="16 ms"
          change="Sub-20ms Target"
          trend="up"
          icon={Zap}
          subtitle="Average roundtrip database query response time"
          sparklineData={[18, 15, 22, 14, 16]}
        />
        <KpiCard
          title="Cart Drop-off Rate"
          value="2.4%"
          change="97.6% Completed"
          trend="up"
          icon={ShoppingCart}
          subtitle="Percentage of shopping carts abandoned before checkout"
        />
        <KpiCard
          title="Live Connection Status"
          value={isStreaming ? "CONNECTED" : "PAUSED"}
          change={isStreaming ? "Stream Active" : "Stream Held"}
          trend={isStreaming ? "up" : "neutral"}
          icon={Radio}
          subtitle="Real-time streaming pipeline via WebSocket"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* High-frequency Streaming Transaction Log */}
        <div className="col-span-12 lg:col-span-6">
          <ChartCard
            title="Incoming Transaction Log"
            subtitle="Live feed of customer checkout events arriving from stores, web, and mobile apps"
          >
            {streamData.length === 0 ? (
              <EmptyState title="No transactions received" description="Stream is awaiting incoming checkout events." />
            ) : (
              <div className="space-y-2.5 my-1">
                {streamData.map((txn) => (
                  <div
                    key={txn.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs animate-slide-down hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0 inline-block" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-indigo-600">{txn.id}</span>
                          <span className="font-semibold text-slate-900">{txn.sku}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {txn.channel} • {txn.timestamp}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-emerald-700 text-sm tabular-nums">
                        {fmtCurrency(txn.price)}
                      </div>
                      <div className="text-xs text-slate-400 font-medium tabular-nums">{txn.latencyMs}ms delay</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>

        {/* Server Response Latency Graph */}
        <div className="col-span-12 lg:col-span-6">
          <ChartCard
            title="Database Query Response Time"
            subtitle="Millisecond latency tracking query roundtrips under current query workload"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="time" {...CHART_AXIS_PROPS} />
                  <YAxis {...CHART_AXIS_PROPS} tickFormatter={(v) => `${v}ms`} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v} ms`} />} />
                  <Line
                    type="monotone"
                    dataKey="latency"
                    name="Response Time"
                    stroke={CHART_COLORS[0]}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS[0] }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
