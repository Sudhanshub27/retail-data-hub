"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  Database,
  ArrowRight,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import { useStore } from "@/context/StoreContext";

const SLA_MONITORS = [
  { db: "POS In-Store DB (PostgreSQL)", freshness: "2m 14s ago", slaStatus: "Meeting SLA", slaTarget: "< 5m", nullRate: "0.01%" },
  { db: "Inventory Realtime Sync (Redis)", freshness: "15s ago", slaStatus: "Meeting SLA", slaTarget: "< 30s", nullRate: "0.00%" },
  { db: "Shopify Store API (GraphQL)", freshness: "1m 02s ago", slaStatus: "Meeting SLA", slaTarget: "< 3m", nullRate: "0.04%" },
  { db: "ERP Supply Chain (SAP)", freshness: "14m 20s ago", slaStatus: "SLA Warning", slaTarget: "< 10m", nullRate: "1.20%" },
];

const DAG_NODES = [
  { id: "src-1", label: "POS Terminals", type: "Source DB", status: "Healthy" },
  { id: "src-2", label: "Shopify API", type: "Source API", status: "Healthy" },
  { id: "etl-1", label: "Kafka Stream", type: "Ingestion Pipe", status: "Healthy" },
  { id: "wh-1", label: "DuckDB Warehouse", type: "Data Warehouse", status: "Healthy" },
  { id: "ml-1", label: "Forecast Models", type: "ML Pipeline", status: "Healthy" },
];

export default function DataQualityPage() {
  const { selectedStore } = useStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Quality & Lineage DAG Graph"
        subtitle={`Freshness SLA monitoring, null rate validation, and table lineage graph for ${selectedStore.name}`}
        icon={Activity}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Freshness SLA Compliance"
          value="99.8%"
          change="Meeting 15m Target"
          trend="up"
          icon={CheckCircle2}
          accentColor="emerald"
          subtitle="4 Pipeline Monitors"
        />
        <KpiCard
          title="Overall Schema Drift"
          value="0 Drifts"
          change="Zero Breaking Changes"
          trend="up"
          icon={Database}
          accentColor="indigo"
          subtitle="Strict Schema Enforced"
        />
        <KpiCard
          title="Avg Row Null Rate"
          value="0.04%"
          change="Far Below 1% Threshold"
          trend="up"
          icon={Activity}
          accentColor="cyan"
          subtitle="Auto-Clean Pipeline"
        />
        <KpiCard
          title="DuckDB DB Size"
          value="4.2 GB"
          change="Columnar Compression"
          trend="neutral"
          icon={Database}
          accentColor="amber"
          subtitle="Parquet Storage Engine"
        />
      </div>

      {/* Freshness SLA Monitors */}
      <ChartCard
        title="Pipeline Freshness SLA Monitors"
        subtitle="Real-time data latency tracking from source databases to analytics layers"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-2">
          {SLA_MONITORS.map((m, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{m.db}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    m.slaStatus === "Meeting SLA"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {m.slaStatus}
                </span>
              </div>
              <div className="text-xl font-extrabold font-mono text-slate-900">{m.freshness}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                <div>
                  <span className="block text-[9px] uppercase text-slate-400 font-semibold">Target SLA</span>
                  <span className="text-slate-800 font-bold">{m.slaTarget}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-slate-400 font-semibold">Null Rate</span>
                  <span className="text-slate-800 font-bold">{m.nullRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Interactive Table Lineage DAG Graph */}
      <ChartCard
        title="Table Lineage DAG Flow"
        subtitle="End-to-end data lineage from transactional sources to analytical models"
      >
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-around gap-4 my-2 shadow-xs">
          {DAG_NODES.map((node, idx) => (
            <React.Fragment key={node.id}>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-1 text-center min-w-[140px] shadow-xs">
                <div className="text-[10px] font-mono uppercase text-indigo-600 font-bold">{node.type}</div>
                <div className="text-xs font-bold text-slate-900">{node.label}</div>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-mono font-bold rounded-full">
                  {node.status}
                </span>
              </div>
              {idx < DAG_NODES.length - 1 && (
                <ArrowRight className="w-5 h-5 text-indigo-600 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}
