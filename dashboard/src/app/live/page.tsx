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
    { id: "LIVE-9041", sku: "SKU-8842", price: 249.99, channel: "POS NYC Broadway", timestamp: "23:04:12", latencyMs: 14 },
    { id: "LIVE-9042", sku: "SKU-3109", price: 18.5, channel: "E-Commerce Web", timestamp: "23:04:13", latencyMs: 18 },
    { id: "LIVE-9043", sku: "SKU-9901", price: 320.0, channel: "Mobile App iOS", timestamp: "23:04:14", latencyMs: 12 },
    { id: "LIVE-9044", sku: "SKU-4412", price: 199.0, channel: "POS Chicago #104", timestamp: "23:04:15", latencyMs: 22 },
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
      const skus = ["SKU-8842", "SKU-3109", "SKU-9901", "SKU-2041"];
      const channels = ["E-Commerce Web", "POS NYC Broadway", "Mobile App iOS", "POS Chicago #104"];
      const newTxn: StreamTxn = {
        id: newId,
        sku: skus[Math.floor(Math.random() * skus.length)],
        price: Number((20 + Math.random() * 300).toFixed(2)),
        channel: channels[Math.floor(Math.random() * channels.length)],
        timestamp: new Date().toISOString().split("T")[1].split(".")[0],
        latencyMs: Math.floor(12 + Math.random() * 15),
      };
      setStreamData((prev) => [newTxn, ...prev.slice(0, 7)]);
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Real-Time Operations & Event Streaming"
        subtitle={`WebSocket stream log, checkout funnel drop-off ticker, and QPS latency for ${selectedStore.name}`}
        icon={Radio}
        action={
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
              isStreaming
                ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-4 h-4 text-amber-600" /> Pause Stream
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-white" /> Resume Stream
              </>
            )}
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Current QPS Throughput"
          value={Math.round(530 * mult).toString()}
          change="Queries / Sec"
          trend="up"
          icon={Activity}
          accentColor="cyan"
          subtitle="ClickHouse Stream Engine"
        />
        <KpiCard
          title="Avg Server Latency"
          value="16 ms"
          change="Sub-20ms SLA"
          trend="up"
          icon={Zap}
          accentColor="emerald"
          subtitle="DuckDB Query Latency"
        />
        <KpiCard
          title="Checkout Funnel Drop-off"
          value="2.4%"
          change="Low Abandonment"
          trend="up"
          icon={ShoppingCart}
          accentColor="indigo"
          subtitle="97.6% Checkout Completion"
        />
        <KpiCard
          title="Stream Connection"
          value={isStreaming ? "CONNECTED" : "PAUSED"}
          change={isStreaming ? "WebSocket Active" : "Stream Held"}
          trend="neutral"
          icon={Radio}
          accentColor={isStreaming ? "cyan" : "amber"}
          subtitle="Port 8000 /ws/live"
        />
      </div>

      {/* Grid: Streaming Transaction Log & Latency Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* High-frequency Streaming Transaction Log */}
        <ChartCard
          title="Streaming Transaction Log"
          subtitle="Real-time event stream arriving from omnichannel endpoints"
          badge={isStreaming ? "Active Stream" : "Paused"}
        >
          <div className="space-y-2.5 my-1">
            {streamData.map((txn) => (
              <div
                key={txn.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs animate-slide-down shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600"></span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600">{txn.id}</span>
                      <span className="font-semibold text-slate-900">{txn.sku}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {txn.channel} • {txn.timestamp}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-700 text-sm">${txn.price}</div>
                  <div className="text-[10px] text-slate-400 font-mono font-medium">{txn.latencyMs}ms latency</div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Server Response Latency Graph */}
        <ChartCard
          title="Server Latency Telemetry"
          subtitle="Sub-second query response time and QPS throughput tracking"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={telemetry} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} tickFormatter={(v) => `${v}ms`} />
                <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }} />
                <Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="#0891b2" strokeWidth={3} dot={{ fill: "#0891b2" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
