"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Package,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/context/StoreContext";
import { fmtNum } from "@/lib/format";

const CARRIERS = [
  { name: "Blue Dart Express", onTimeRate: "98.4%", avgTransit: "1.4 Days", lostRate: "0.02%", status: "Optimal" },
  { name: "Delhivery Surface", onTimeRate: "96.8%", avgTransit: "2.1 Days", lostRate: "0.04%", status: "Optimal" },
  { name: "DTDC Priority", onTimeRate: "95.1%", avgTransit: "2.8 Days", lostRate: "0.08%", status: "Needs Attention" },
  { name: "India Post Speed Post", onTimeRate: "92.4%", avgTransit: "3.2 Days", lostRate: "0.12%", status: "Needs Attention" },
];

const FUNNEL_STEPS = [
  { step: "1. Order Received", timeAvg: "Instant", count: 4820, latency: "System sync complete" },
  { step: "2. Warehouse Picked", timeAvg: "18 mins", count: 4790, latency: "+18m packaging" },
  { step: "3. Carrier Dispatched", timeAvg: "1.2 hours", count: 4680, latency: "+1.2h sorting hub" },
  { step: "4. Doorstep Delivered", timeAvg: "1.8 days", count: 4590, latency: "97.2% on-time" },
];

const BOTTLENECKS = [
  { region: "Western Hub -> Mumbai Metro", issue: "Highway freight blockage due to heavy rain", delayAvg: "+14.2 Hours", impactOrders: 340, status: "Critical" },
  { region: "Northern DC -> Delhi NCR", issue: "Cargo inspection checkpoint slowdown", delayAvg: "+8.5 Hours", impactOrders: 180, status: "Warning" },
  { region: "Southern DC -> Bengaluru Hub", issue: "Peak hours airport toll congestion", delayAvg: "+3.1 Hours", impactOrders: 95, status: "Minor" },
];

export default function LogisticsPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Logistics & Delivery Operations"
        subtitle={`Delivery reliability, dispatch funnel speed, and route disruptions for ${selectedStore.name}`}
      />

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="On-Time Delivery Rate"
          value="97.2%"
          change="+1.4% target"
          trend="up"
          icon={CheckCircle2}
          subtitle="Orders delivered within promised SLA window (Target > 95%)"
          sparklineData={[94, 95, 95.5, 96, 96.8, 97, 97.2]}
        />
        <KpiCard
          title="Average Delivery Time"
          value="1.8 Days"
          change="-0.3 days faster"
          trend="up"
          icon={Clock}
          subtitle="Average time from online checkout to final delivery"
          sparklineData={[2.4, 2.2, 2.1, 2.0, 1.9, 1.85, 1.8]}
        />
        <KpiCard
          title="In-Transit Packages"
          value={fmtNum(Math.round(4680 * mult))}
          change="Dispatched on schedule"
          trend="up"
          icon={Package}
          subtitle="Shipments currently moving with logistics partners"
          sparklineData={[3800, 4100, 4300, 4450, 4550, 4620, 4680]}
        />
        <KpiCard
          title="Delayed Shipments"
          value={fmtNum(Math.round(615 * mult))}
          change="Weather & transit delays"
          trend="down"
          icon={AlertTriangle}
          subtitle="Orders experiencing route interruptions"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Carrier Performance Cards */}
        <div className="col-span-12 lg:col-span-6">
          <ChartCard
            title="Logistics Partner Performance"
            subtitle="Delivery success rates and average transit times across courier partners"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
              {CARRIERS.map((c, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">{c.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        c.status === "Optimal"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="text-xl font-semibold text-slate-900 tabular-nums">
                    {c.onTimeRate}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <div>
                      <span className="block text-slate-400 font-medium text-xs">Avg Transit</span>
                      <span className="text-slate-800 font-medium">{c.avgTransit}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium text-xs">Incident Rate</span>
                      <span className="text-slate-800 font-medium">{c.lostRate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Order Fulfillment Funnel Latency Tracker */}
        <div className="col-span-12 lg:col-span-6">
          <ChartCard
            title="Order Fulfillment Stages"
            subtitle="Average duration spent at each milestone from placement to customer delivery"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
              {FUNNEL_STEPS.map((fn, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5"
                >
                  <div className="text-xs font-semibold text-indigo-600">{fn.step}</div>
                  <div className="text-lg font-semibold text-slate-900 tabular-nums">
                    {fmtNum(Math.round(fn.count * mult))} orders
                  </div>
                  <div className="text-xs text-slate-500">
                    Avg Stage Time: <span className="text-emerald-700 font-semibold">{fn.timeAvg}</span>
                  </div>
                  <div className="text-xs text-slate-400">{fn.latency}</div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Regional Shipping Bottlenecks Table */}
        <div className="col-span-12">
          <ChartCard
            title="Active Route Disruptions & Delays"
            subtitle="Current corridor bottlenecks causing fulfillment slowdowns"
          >
            {BOTTLENECKS.length === 0 ? (
              <EmptyState title="No route disruptions" description="All transit corridors are operating without reported delays." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="p-3">Corridor</th>
                      <th className="p-3">Disruption Cause</th>
                      <th className="p-3 text-right">Average Delay</th>
                      <th className="p-3 text-right">Affected Packages</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {BOTTLENECKS.map((b, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-amber-600 flex-shrink-0" /> {b.region}
                        </td>
                        <td className="p-3 text-slate-600 font-medium">{b.issue}</td>
                        <td className="p-3 font-semibold text-amber-700 text-right tabular-nums">{b.delayAvg}</td>
                        <td className="p-3 text-slate-700 text-right tabular-nums">{fmtNum(Math.round(b.impactOrders * mult))} orders</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                              b.status === "Critical"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
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
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
