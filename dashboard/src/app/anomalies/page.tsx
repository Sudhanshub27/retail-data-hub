"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  IndianRupee,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/context/StoreContext";
import { fmtCurrency, fmtNum } from "@/lib/format";

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
    title: "Unusual In-Store Refund Spike",
    category: "Payment Terminal",
    severity: "Critical",
    revImpact: 1845000,
    timestamp: "12 mins ago",
    store: "Mumbai Central DC Store",
    rootCause: "Duplicate refund requests triggered via POS terminal #4 firmware issue",
    mlConfidence: "98.2%",
    status: "Active",
  },
  {
    id: "ANOM-4020",
    title: "Unusual Online Checkout Drop-off",
    category: "Online Checkout",
    severity: "Critical",
    revImpact: 1420000,
    timestamp: "28 mins ago",
    store: "National E-Commerce Store",
    rootCause: "Payment gateway timeout for credit card authorization network",
    mlConfidence: "94.7%",
    status: "Active",
  },
  {
    id: "ANOM-4021",
    title: "Warehouse Inventory Count Mismatch",
    category: "Stock Sync",
    severity: "Warning",
    revImpact: 680000,
    timestamp: "1 hour ago",
    store: "Delhi NCR Mega Hub",
    rootCause: "Physical stock take not synced with real-time catalog ledger",
    mlConfidence: "89.1%",
    status: "Investigating",
  },
  {
    id: "ANOM-4022",
    title: "Negative Cart Price Triggered",
    category: "Data Ingestion",
    severity: "Warning",
    revImpact: 310000,
    timestamp: "2 hours ago",
    store: "National E-Commerce Store",
    rootCause: "Invalid promo code combination resulting in negative cart balance",
    mlConfidence: "99.4%",
    status: "Active",
  },
];

export default function AnomaliesPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [sensitivity, setSensitivity] = useState<"Strict" | "Balanced" | "Relaxed">("Balanced");
  const [expandedId, setExpandedId] = useState<string | null>("ANOM-4019");

  const activeCount = Math.round(4 * mult);
  const totalRevImpact = Math.round(4255000 * mult);

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Anomaly & Irregularity Detection"
        subtitle={`Real-time identification of transaction spikes, checkout errors, and data discrepancies for ${selectedStore.name}`}
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs font-medium">
              <span className="text-slate-500 px-2 font-mono">Sensitivity:</span>
              {(["Strict", "Balanced", "Relaxed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSensitivity(s)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    sensitivity === s
                      ? "bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
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

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Irregularities"
          value={activeCount.toString()}
          change="3 High Severity"
          trend="down"
          icon={AlertTriangle}
          subtitle={`Unusual patterns flagged under ${sensitivity} sensitivity`}
        />
        <KpiCard
          title="At-Risk Sales Value"
          value={fmtCurrency(totalRevImpact)}
          change="Requires Attention"
          trend="down"
          icon={IndianRupee}
          subtitle="Estimated financial volume involved across active anomalies"
        />
        <KpiCard
          title="Detection Speed"
          value="4.2 sec"
          change="-1.1s faster"
          trend="up"
          icon={Zap}
          subtitle="Average time to recognize an unusual transaction"
        />
        <KpiCard
          title="Detection Accuracy"
          value="98.6%"
          change="High precision"
          trend="up"
          icon={CheckCircle2}
          subtitle="Confirmed accuracy of automated incident detections"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Severity Summary Tiers */}
        <div className="col-span-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-rose-900">Critical Incidents</div>
                <div className="text-xl font-semibold text-slate-900 mt-1 tabular-nums">2 Active</div>
                <p className="text-xs text-slate-500 font-medium">Immediate intervention required</p>
              </div>
              <span className="px-2.5 py-0.5 bg-rose-100 rounded-lg text-rose-800 text-xs font-medium border border-rose-200">
                High Priority
              </span>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-amber-900">Warning Incidents</div>
                <div className="text-xl font-semibold text-slate-900 mt-1 tabular-nums">2 Active</div>
                <p className="text-xs text-slate-500 font-medium">Investigate within 24 hours</p>
              </div>
              <span className="px-2.5 py-0.5 bg-amber-100 rounded-lg text-amber-800 text-xs font-medium border border-amber-200">
                Medium Priority
              </span>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-800">Informational Logs</div>
                <div className="text-xl font-semibold text-slate-900 mt-1 tabular-nums">0 Active</div>
                <p className="text-xs text-slate-500 font-medium">Normal baseline system events</p>
              </div>
              <span className="px-2.5 py-0.5 bg-slate-100 rounded-lg text-slate-700 text-xs font-medium border border-slate-200">
                Standard
              </span>
            </div>
          </div>
        </div>

        {/* Expandable Root-Cause Diagnostic List */}
        <div className="col-span-12">
          <ChartCard
            title="Active Incident Diagnostics & Resolutions"
            subtitle="Click on any incident below to inspect root-cause analysis and recommended fixes"
          >
            {ANOMALY_ITEMS.length === 0 ? (
              <EmptyState title="No active anomalies" description="All store operational metrics are within expected ranges." />
            ) : (
              <div className="space-y-3 my-1">
                {ANOMALY_ITEMS.map((item) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200 rounded-lg bg-white overflow-hidden transition-colors"
                    >
                      <div
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setExpandedId(isExpanded ? null : item.id);
                          }
                        }}
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
                              <span className="font-mono text-xs text-indigo-600 font-semibold">{item.id}</span>
                              <span className="font-semibold text-slate-900 text-xs">{item.title}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Location: <span className="text-slate-800 font-medium">{item.store}</span> • Time: {item.timestamp}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-xs font-semibold text-rose-700 tabular-nums">
                              {fmtCurrency(Math.round(item.revImpact * mult))}
                            </div>
                            <div className="text-xs text-slate-400">At-Risk Value</div>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${
                              item.severity === "Critical"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
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
                          <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-600" />
                              <span className="font-semibold text-slate-900">Diagnosis:</span>
                            </div>
                            <span className="text-xs font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-100">
                              Confidence: {item.mlConfidence}
                            </span>
                          </div>
                          <p className="text-slate-700 font-sans leading-relaxed">{item.rootCause}</p>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-200">
                            <div className="text-xs text-slate-500">
                              Recommended Action: Reset payment terminal gateway &amp; clear pending queue
                            </div>
                            <button className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg font-medium text-xs transition-colors self-start sm:self-auto">
                              Run Auto-Remediation
                            </button>
                          </div>
                        </div>
                      )}
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
