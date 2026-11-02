"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  Database,
  ArrowRight,
  HardDrive,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/context/StoreContext";

const SLA_MONITORS = [
  { db: "POS Store Terminals (PostgreSQL)", freshness: "2m 14s ago", slaStatus: "On Target", slaTarget: "< 5m", nullRate: "0.01%" },
  { db: "Real-Time Inventory Stream (Redis)", freshness: "15s ago", slaStatus: "On Target", slaTarget: "< 30s", nullRate: "0.00%" },
  { db: "E-Commerce Web API (GraphQL)", freshness: "1m 02s ago", slaStatus: "On Target", slaTarget: "< 3m", nullRate: "0.04%" },
  { db: "Supply Chain & Logistics (SAP ERP)", freshness: "14m 20s ago", slaStatus: "Delayed", slaTarget: "< 10m", nullRate: "1.20%" },
];

const DAG_NODES = [
  { id: "src-1", label: "In-Store POS Terminals", type: "Store Systems", status: "Healthy" },
  { id: "src-2", label: "E-Commerce Storefront", type: "Web & Mobile APIs", status: "Healthy" },
  { id: "etl-1", label: "Message Event Streaming", type: "Data Pipeline", status: "Healthy" },
  { id: "wh-1", label: "Analytics Data Warehouse", type: "Storage & Query Engine", status: "Healthy" },
  { id: "ml-1", label: "Forecasting AI Models", type: "Predictive Analytics", status: "Healthy" },
];

export default function DataQualityPage() {
  const { selectedStore } = useStore();

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Data Quality & Pipeline Lineage"
        subtitle={`System sync freshness, missing value monitoring, and end-to-end data pipeline flow for ${selectedStore.name}`}
      />

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Data Sync Reliability"
          value="99.8%"
          change="Meeting 15m Target"
          trend="up"
          icon={CheckCircle2}
          subtitle="Percentage of pipelines refreshing within promised time limits"
          sparklineData={[98, 98.5, 99, 99.2, 99.5, 99.6, 99.8]}
        />
        <KpiCard
          title="Schema Structure Drift"
          value="0 Drifts"
          change="Zero Breaking Changes"
          trend="up"
          icon={Database}
          subtitle="Unplanned column or data format modifications detected"
        />
        <KpiCard
          title="Missing Value Rate"
          value="0.04%"
          change="Well below 1.0% limit"
          trend="up"
          icon={Activity}
          subtitle="Percentage of empty or null entries across incoming records"
        />
        <KpiCard
          title="Warehouse Storage Size"
          value="4.2 GB"
          change="Columnar Compression"
          trend="neutral"
          icon={HardDrive}
          subtitle="Total compressed analytics storage footprint"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Freshness SLA Monitors */}
        <div className="col-span-12">
          <ChartCard
            title="System Sync Freshness by Source"
            subtitle="Real-time latency check measuring how recently records were synced from source platforms"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-1">
              {SLA_MONITORS.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900 truncate">{m.db}</span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium border flex-shrink-0 ${
                        m.slaStatus === "On Target"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {m.slaStatus}
                    </span>
                  </div>
                  <div className="text-xl font-semibold text-slate-900 tabular-nums">{m.freshness}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <div>
                      <span className="block text-slate-400 text-xs">Target Interval</span>
                      <span className="text-slate-800 font-medium">{m.slaTarget}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-xs">Missing Rows</span>
                      <span className="text-slate-800 font-medium">{m.nullRate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Interactive Table Lineage DAG Graph */}
        <div className="col-span-12">
          <ChartCard
            title="Data Pipeline Flow & Lineage"
            subtitle="Step-by-step path showing how store transactions travel from checkout registers into analytics dashboards"
          >
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center justify-around gap-4 my-1">
              {DAG_NODES.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1.5 text-center min-w-[140px]">
                    <div className="text-xs uppercase text-indigo-600 font-medium">{node.type}</div>
                    <div className="text-xs font-semibold text-slate-900">{node.label}</div>
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-lg">
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
      </div>
    </div>
  );
}
