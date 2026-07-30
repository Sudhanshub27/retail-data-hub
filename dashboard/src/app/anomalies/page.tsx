"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import { useStore } from "@/context/StoreContext";

interface AnomalyItem {
  id: string;
  title: string;
  category: string;
  severity: "Critical" | "Warning" | "Info";
  revImpact: number;
  timestamp: string;
  store: string;
  rootCause: string;
  mlConfidence: string;
  status: "Active" | "Investigating" | "Resolved";
}

const ANOMALY_ITEMS: AnomalyItem[] = [
  {
    id: "ANOM-4019",
    title: "POS-Refund Spike in Store #104 Chicago",
    category: "Payment POS",
    severity: "Critical",
    revImpact: 18450,
    timestamp: "12 mins ago",
    store: "Store #104 - Chicago",
    rootCause: "Duplicate refund requests triggered via POS terminal #4 firmware issue",
    mlConfidence: "98.2%",
    status: "Active",
  },
  {
    id: "ANOM-4020",
    title: "Unusual Checkout Drop-off Rate (E-Commerce)",
    category: "Checkout Funnel",
    severity: "Critical",
    revImpact: 14200,
    timestamp: "28 mins ago",
    store: "E-Commerce Global Store",
    rootCause: "Payment gateway timeout for European credit cards (Stripe 504 error)",
    mlConfidence: "94.7%",
    status: "Active",
  },
  {
    id: "ANOM-4021",
    title: "SKU-8842 Inventory Count Mismatch",
    category: "Inventory Sync",
    severity: "Warning",
    revImpact: 6800,
    timestamp: "1 hour ago",
    store: "Flagship Store - NYC",
    rootCause: "Unsynced physical stock take vs catalog ledger",
    mlConfidence: "89.1%",
    status: "Investigating",
  },
  {
    id: "ANOM-4022",
    title: "Negative Unit Price Transaction Detected",
    category: "Data Ingestion",
    severity: "Warning",
    revImpact: 3100,
    timestamp: "2 hours ago",
    store: "E-Commerce Global Store",
    rootCause: "Invalid promo code combination resulting in -$4.50 cart total",
    mlConfidence: "99.4%",
    status: "Active",
  },
];

export default function AnomaliesPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [sensitivity, setSensitivity] = useState<"Strict" | "Balanced" | "Relaxed">("Balanced");
  const [expandedId, setExpandedId] = useState<string | null>("ANOM-4019");

  const activeCount = Math.round(3 * mult);
  const totalRevImpact = Math.round(42550 * mult);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Anomaly & Outlier Detection"
        subtitle={`Outlier monitoring, revenue impact assessment, and diagnostics for ${selectedStore.name}`}
        icon={AlertTriangle}
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-semibold shadow-xs">
              <span className="text-slate-500 px-2 font-mono">Sensitivity:</span>
              {(["Strict", "Balanced", "Relaxed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSensitivity(s)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    sensitivity === s
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Anomaly Radar Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Anomalies Count"
          value={activeCount.toString()}
          change="3 High Severity"
          trend="down"
          icon={AlertTriangle}
          accentColor="rose"
          subtitle={`Sensitivity Mode: ${sensitivity}`}
        />
        <KpiCard
          title="Total Revenue Impact"
          value={`$${totalRevImpact.toLocaleString()}`}
          change="At Risk Revenue"
          trend="down"
          icon={DollarSign}
          accentColor="amber"
          subtitle="4 Active Outlier Events"
        />
        <KpiCard
          title="Avg ML Detection Latency"
          value="4.2 sec"
          change="-1.1s faster"
          trend="up"
          icon={Zap}
          accentColor="cyan"
          subtitle="Isolation Forest Algo"
        />
        <KpiCard
          title="False Positive Rate"
          value="1.4%"
          change="High Precision"
          trend="up"
          icon={CheckCircle2}
          accentColor="emerald"
          subtitle="Model Confidence > 88%"
        />
      </div>

      {/* Severity Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-bold text-rose-900">🚨 Critical Severity</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">2 Active</div>
            <p className="text-[11px] text-slate-500 font-medium">Immediate intervention required</p>
          </div>
          <span className="px-3 py-1 bg-rose-100 rounded-full text-rose-800 text-xs font-mono font-bold">
            SEV-1
          </span>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-bold text-amber-900">⚠️ Warning Severity</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">2 Active</div>
            <p className="text-[11px] text-slate-500 font-medium">Investigate within 24 hours</p>
          </div>
          <span className="px-3 py-1 bg-amber-100 rounded-full text-amber-800 text-xs font-mono font-bold">
            SEV-2
          </span>
        </div>

        <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs font-bold text-cyan-900">ℹ️ Informational Severity</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono mt-1">0 Active</div>
            <p className="text-[11px] text-slate-500 font-medium">System logged telemetry</p>
          </div>
          <span className="px-3 py-1 bg-cyan-100 rounded-full text-cyan-800 text-xs font-mono font-bold">
            SEV-3
          </span>
        </div>
      </div>

      {/* Expandable Root-Cause Diagnostic List */}
      <ChartCard
        title="Active Outlier Diagnostic Radar"
        subtitle="Click any anomaly event to expand root-cause analysis and resolution steps"
      >
        <div className="space-y-3 my-1">
          {ANOMALY_ITEMS.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className="border border-slate-200 rounded-xl bg-white overflow-hidden transition-colors shadow-xs"
              >
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        item.severity === "Critical"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-amber-50 text-amber-600 border border-amber-100"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-indigo-600 font-bold">{item.id}</span>
                        <span className="font-bold text-slate-900 text-xs">{item.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Location: <span className="text-slate-800 font-semibold">{item.store}</span> • Time: {item.timestamp}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-mono font-extrabold text-rose-700">
                        -${Math.round(item.revImpact * mult).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Revenue Impact</div>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        item.severity === "Critical"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {item.severity}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expandable Root-Cause Diagnostic Drawer */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs animate-slide-down">
                    <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        <span className="font-bold text-slate-900">Root Cause Diagnostic:</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        Model Confidence: {item.mlConfidence}
                      </span>
                    </div>
                    <p className="text-slate-700 font-sans leading-relaxed">{item.rootCause}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <div className="text-[11px] text-slate-500">
                        Recommended Action: Reset POS Terminal Gateway #4 & Flush Refund Cache
                      </div>
                      <button className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors">
                        Execute Auto-Remediation
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
