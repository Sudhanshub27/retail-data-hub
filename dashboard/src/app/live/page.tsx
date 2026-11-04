"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Radio,
  Activity,
  AlertTriangle,
  ShieldAlert,
  IndianRupee,
  ShoppingCart,
  Wifi,
  WifiOff,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/context/StoreContext";
import { WS_URL } from "@/config";
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS } from "@/lib/theme";
import { fmtCurrency, fmtNum } from "@/lib/format";

interface LiveTransaction {
  event_type: "normal" | "anomaly" | "fraud";
  transaction_id: string;
  timestamp: string;
  customer_id: string;
  store_id: string;
  city: string;
  state: string;
  channel: string;
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
}

interface LiveStats {
  total_revenue: number;
  total_transactions: number;
  anomaly_count: number;
  fraud_count: number;
}

export default function LivePage() {
  const { selectedStore } = useStore();
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [stats, setStats] = useState<LiveStats>({
    total_revenue: 0,
    total_transactions: 0,
    anomaly_count: 0,
    fraud_count: 0,
  });
  const [transactions, setTransactions] = useState<LiveTransaction[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnectionStatus("connecting");
    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnectionStatus("connected");
        // Start ping heartbeat
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send("ping");
          }
        }, 15000);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "stats" && payload.data) {
            setStats(payload.data);
          } else if (payload.type === "transaction" && payload.data) {
            const txn: LiveTransaction = payload.data;
            setTransactions((prev) => [txn, ...prev.slice(0, 49)]);
            if (payload.stats) {
              setStats(payload.stats);
            }
          }
        } catch {
          // ignore non-json messages like pong
        }
      };

      ws.onclose = () => {
        setConnectionStatus("disconnected");
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        // Schedule auto-reconnect
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = () => {
        setConnectionStatus("disconnected");
        ws.close();
      };
    } catch {
      setConnectionStatus("disconnected");
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const isConnected = connectionStatus === "connected";

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Real-Time Event Stream"
        subtitle={`Live WebSocket order stream, transaction volume, and event telemetry for ${selectedStore.name}`}
        action={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : connectionStatus === "connecting"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {isConnected ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>CONNECTED</span>
                </>
              ) : connectionStatus === "connecting" ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>CONNECTING...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                  <span>DISCONNECTED (Retrying)</span>
                </>
              )}
            </span>
          </div>
        }
      />

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Session Live Revenue"
          value={fmtCurrency(stats.total_revenue)}
          change="Rolling session total"
          trend="up"
          icon={IndianRupee}
          subtitle="Cumulative sales turnover streamed this session"
        />
        <KpiCard
          title="Processed Orders"
          value={fmtNum(stats.total_transactions)}
          change="Real-time count"
          trend="up"
          icon={ShoppingCart}
          subtitle="Customer sales orders ingested via WebSocket"
        />
        <KpiCard
          title="Detected Anomalies"
          value={fmtNum(stats.anomaly_count)}
          change="Volume spikes"
          trend={stats.anomaly_count > 0 ? "down" : "neutral"}
          icon={AlertTriangle}
          subtitle="Live transactions tagged with quantity outliers"
        />
        <KpiCard
          title="Flagged Fraud Signals"
          value={fmtNum(stats.fraud_count)}
          change="Suspicious events"
          trend={stats.fraud_count > 0 ? "down" : "neutral"}
          icon={ShieldAlert}
          subtitle="Live transactions matching heuristic fraud rules"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {transactions.length > 0 && (
          <div className="col-span-12">
            <ChartCard
              title="Recent Live Order Values"
              subtitle="Order amounts from newest streamed transactions"
            >
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={transactions.slice(0, 15).reverse().map((t) => ({
                      id: t.transaction_id.slice(-6),
                      amount: Math.round(t.total_amount),
                    }))}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid {...CHART_GRID_PROPS} />
                    <XAxis dataKey="id" {...CHART_AXIS_PROPS} />
                    <YAxis {...CHART_AXIS_PROPS} tickFormatter={(v) => fmtCurrency(v)} />
                    <Tooltip content={<ChartTooltip formatter={fmtCurrency} />} />
                    <Bar dataKey="amount" name="Order Amount" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        )}

        {/* Real Streaming Transaction Log */}
        <div className="col-span-12">
          <ChartCard
            title="Incoming Live Transactions"
            subtitle="Real-time checkout records broadcast by the FastAPI WebSocket gateway"
            action={
              <div className="text-xs text-slate-500 font-medium">
                {transactions.length} events received
              </div>
            }
          >
            {transactions.length === 0 ? (
              <EmptyState
                title="No live transactions received"
                description="Run ./scripts/live_simulator.sh to start streaming real-time orders into the platform."
              />
            ) : (
              <div className="space-y-2.5 my-1 max-h-[520px] overflow-y-auto pr-1">
                {transactions.map((txn, idx) => {
                  const isAnomaly = txn.event_type === "anomaly";
                  const isFraud = txn.event_type === "fraud";
                  const badgeClass = isFraud
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : isAnomaly
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";

                  const timeStr = txn.timestamp ? txn.timestamp.slice(11, 19) : "Just now";

                  return (
                    <div
                      key={`${txn.transaction_id}-${idx}`}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs animate-slide-down hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isFraud ? "bg-rose-600" : isAnomaly ? "bg-amber-600" : "bg-emerald-600"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-indigo-600">{txn.transaction_id}</span>
                            <span className="font-semibold text-slate-900 truncate">{txn.product_name}</span>
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border uppercase ${badgeClass}`}>
                              {txn.event_type}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {txn.city} ({txn.store_id}) • {txn.channel} • Qty: {txn.quantity} • Time: {timeStr}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0 pl-3">
                        <div className="font-semibold text-slate-900 text-sm tabular-nums">
                          {fmtCurrency(txn.total_amount)}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          @{fmtCurrency(txn.unit_price)}/unit
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
