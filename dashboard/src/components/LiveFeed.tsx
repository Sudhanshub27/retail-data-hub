"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Activity, Zap, AlertTriangle, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WS_URL } from "@/config";
import { fmtCurrency } from "@/lib/format";

interface Transaction {
  event_type: "normal" | "anomaly" | "fraud";
  transaction_id: string;
  timestamp: string;
  customer_id: string;
  store_id: string;
  city: string;
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

interface EventStyle {
  badge: string;
  iconBg: string;
  icon: LucideIcon;
  label: string;
}

const EVENT_STYLES: Record<string, EventStyle> = {
  normal: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    icon: Activity,
    label: "Normal",
  },
  anomaly: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    iconBg: "bg-amber-50 text-amber-600 border border-amber-200",
    icon: AlertTriangle,
    label: "Anomaly",
  },
  fraud: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    iconBg: "bg-rose-50 text-rose-600 border border-rose-200",
    icon: Shield,
    label: "Fraud",
  },
};

export default function LiveFeed() {
  const [connected, setConnected] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<LiveStats>({
    total_revenue: 0,
    total_transactions: 0,
    anomaly_count: 0,
    fraud_count: 0,
  });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "transaction") {
          setTransactions((prev) => [msg.data, ...prev].slice(0, 50));
          if (msg.stats) setStats(msg.stats);
        } else if (msg.type === "stats") {
          if (msg.data) setStats(msg.data);
        }
      } catch (e) {
        console.error("LiveFeed parse error:", e);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimeout.current = setTimeout(connect, 5000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
    };
  }, [connect]);

  return (
    <div className="slate-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">Live Transaction Feed</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-emerald-600 animate-pulse" : "bg-rose-600"}`} />
          <span className={`text-xs font-semibold uppercase tracking-wider ${connected ? "text-emerald-700" : "text-rose-700"}`}>
            {connected ? "Live" : "Offline"}
          </span>
        </div>
      </div>

      {/* Mini KPI bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-slate-200">
        {[
          { label: "Revenue", value: fmtCurrency(stats.total_revenue), color: "text-emerald-700" },
          { label: "Transactions", value: stats.total_transactions.toLocaleString("en-IN"), color: "text-indigo-600" },
          { label: "Anomalies", value: String(stats.anomaly_count), color: "text-amber-700" },
          { label: "Fraud Flags", value: String(stats.fraud_count), color: "text-rose-700" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-3 text-center">
            <p className="text-xs text-slate-500 uppercase font-medium tracking-wider">{kpi.label}</p>
            <p className={`text-sm font-semibold ${kpi.color} mt-0.5`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Transaction list */}
      <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-100">
        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {connected ? "Waiting for transactions…" : "Connect the live simulator to start streaming."}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Run: <code className="bg-slate-100 px-1.5 py-0.5 rounded-lg text-xs font-mono">./scripts/live_simulator.sh</code>
            </p>
          </div>
        ) : (
          transactions.map((txn, i) => {
            const style = EVENT_STYLES[txn.event_type] || EVENT_STYLES.normal;
            const Icon = style.icon;
            return (
              <div
                key={txn.transaction_id + i}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors animate-slide-up"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${style.iconBg}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 truncate">
                      {txn.product_name}
                    </span>
                    {txn.event_type !== "normal" && (
                      <span
                        className={`px-1.5 py-0.5 rounded-lg text-xs font-medium uppercase border ${style.badge}`}
                      >
                        {style.label}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {txn.city} · {txn.channel} · Qty {txn.quantity}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-900">
                    {fmtCurrency(txn.total_amount)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(txn.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
