"use client";

import React from "react";
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Package,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import { useStore } from "@/context/StoreContext";

const CARRIERS = [
  { name: "FedEx Express", sla: "98.4%", latency: "1.4 Days", lostRate: "0.02%", status: "Optimal" },
  { name: "UPS Ground", sla: "96.8%", latency: "2.1 Days", lostRate: "0.04%", status: "Optimal" },
  { name: "DHL Express Global", sla: "95.1%", latency: "2.8 Days", lostRate: "0.08%", status: "Warning" },
  { name: "OnTrac Regional", sla: "92.4%", latency: "3.2 Days", lostRate: "0.12%", status: "Warning" },
];

const FUNNEL_STEPS = [
  { step: "1. Order Placed", timeAvg: "0.0 mins", count: 4820, latency: "Instant DB Sync" },
  { step: "2. Warehouse Picked", timeAvg: "18.4 mins", count: 4790, latency: "+18m processing" },
  { step: "3. Carrier Shipped", timeAvg: "1.2 hours", count: 4680, latency: "+1.2h sorting" },
  { step: "4. Last-Mile Delivered", timeAvg: "1.8 days", count: 4590, latency: "SLA On-Time 97.2%" },
];

const BOTTLENECKS = [
  { region: "Midwest DC -> Chicago Metro", issue: "Severe Weather Highway Closure I-90", delayAvg: "+14.2 Hours", impactOrders: 340, status: "Critical" },
  { region: "West Coast -> Port of LA", issue: "Port Customs Clearance Congestion", delayAvg: "+8.5 Hours", impactOrders: 180, status: "Warning" },
  { region: "East Coast -> NYC Tunnel", issue: "Peak Traffic Toll Plaza Latency", delayAvg: "+3.1 Hours", impactOrders: 95, status: "Minor" },
];

export default function LogisticsPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logistics & Shipping Operations"
        subtitle={`Carrier SLA metrics, order fulfillment funnel latency, and regional bottleneck tracking for ${selectedStore.name}`}
        icon={Truck}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="On-Time Delivery SLA"
          value="97.2%"
          change="+1.4% target"
          trend="up"
          icon={CheckCircle2}
          accentColor="emerald"
          subtitle="Target > 95.0%"
        />
        <KpiCard
          title="Avg Order-to-Delivery"
          value="1.8 Days"
          change="-0.3 days faster"
          trend="up"
          icon={Clock}
          accentColor="cyan"
          subtitle="Click-to-Door Latency"
        />
        <KpiCard
          title="Active In-Transit Shipments"
          value={Math.round(4680 * mult).toLocaleString()}
          change="Carrier Dispatched"
          trend="up"
          icon={Package}
          accentColor="indigo"
          subtitle="4 Major Carriers"
        />
        <KpiCard
          title="Regional Delayed Orders"
          value={Math.round(615 * mult).toString()}
          change="Weather & Port Bottlenecks"
          trend="down"
          icon={AlertTriangle}
          accentColor="amber"
          subtitle="Impacted by disruptions"
        />
      </div>

      {/* Carrier Performance Gauge Cards */}
      <ChartCard
        title="Carrier Performance SLA & Latency Gauges"
        subtitle="Monitored fulfillment metrics across logistics partners"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-2">
          {CARRIERS.map((c, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{c.name}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    c.status === "Optimal"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono text-slate-900">{c.sla}</div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                <div>
                  <span className="block text-[9px] uppercase text-slate-400 font-semibold">Latency</span>
                  <span className="text-slate-800 font-bold">{c.latency}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-slate-400 font-semibold">Lost Rate</span>
                  <span className="text-slate-800 font-bold">{c.lostRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Order Fulfillment Funnel Latency Tracker */}
      <ChartCard
        title="Order Fulfillment Funnel Latency Tracker"
        subtitle="Step-by-step latency tracking from order placement to last-mile delivery"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-2">
          {FUNNEL_STEPS.map((fn, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 relative shadow-xs"
            >
              <div className="text-xs font-bold text-indigo-600">{fn.step}</div>
              <div className="text-xl font-extrabold text-slate-900 font-mono">
                {Math.round(fn.count * mult).toLocaleString()} orders
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Avg Stage Time: <span className="text-emerald-700 font-bold">{fn.timeAvg}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">{fn.latency}</div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Regional Shipping Bottlenecks Table */}
      <ChartCard
        title="Regional Transit Bottlenecks & Interceptions"
        subtitle="Disruptions impacting delivery SLA times"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase">
              <tr>
                <th className="p-3">Disruption Corridor</th>
                <th className="p-3">Root Cause Description</th>
                <th className="p-3">Average Delay</th>
                <th className="p-3">Orders Impacted</th>
                <th className="p-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {BOTTLENECKS.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" /> {b.region}
                  </td>
                  <td className="p-3 text-slate-600 font-medium">{b.issue}</td>
                  <td className="p-3 font-mono font-bold text-amber-700">{b.delayAvg}</td>
                  <td className="p-3 font-mono text-slate-700">{Math.round(b.impactOrders * mult)} orders</td>
                  <td className="p-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        b.status === "Critical"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
