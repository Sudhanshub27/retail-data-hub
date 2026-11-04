"use client";

import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Truck,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { PageSkeleton } from "@/components/Skeleton";
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
import { useApi } from "@/hooks/useApi";
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS } from "@/lib/theme";
import { fmtNum } from "@/lib/format";

interface CarrierItem {
  carrier: string;
  shipments: number;
  avg_days: number;
  delivered: number;
  delayed: number;
  in_transit: number;
  returned: number;
  delay_pct: number;
}

interface DestinationItem {
  destination_city: string;
  shipments: number;
  avg_days: number;
  bottleneck_shipments: number;
  bottleneck_pct: number;
}

interface DistributionItem {
  days: number;
  shipments: number;
}

interface LogisticsApiResponse {
  delivery_times?: {
    overall?: {
      total_shipments: number;
      delivered: number;
      delayed: number;
      in_transit: number;
      returned: number;
      avg_delivery_days: number;
      median_delivery_days: number;
    };
    by_carrier?: CarrierItem[];
    by_destination?: DestinationItem[];
    distribution?: DistributionItem[];
  };
  seasonal_demand?: Array<{
    year_month: string;
    units_sold: number;
    revenue: number;
  }>;
}

export default function LogisticsPage() {
  const { selectedStore } = useStore();
  const { data, loading, error, refetch } = useApi<LogisticsApiResponse>("/api/logistics");

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const deliveryData = data?.delivery_times;
  const overall = deliveryData?.overall;

  if (!deliveryData || !overall || overall.total_shipments === 0) {
    return (
      <EmptyState
        title="No logistics data available"
        description="Run scripts/kpi_analysis.sh to compute fulfillment and carrier delivery KPIs."
        onReset={refetch}
        resetText="Retry fetch"
      />
    );
  }

  const carriers = deliveryData.by_carrier || [];
  const destinations = deliveryData.by_destination || [];
  const distribution = (deliveryData.distribution || []).map((d) => ({
    days: `${Math.round(d.days)}d`,
    shipments: d.shipments,
  }));

  const onTimeRate =
    overall.total_shipments > 0
      ? (100 - (overall.delayed / overall.total_shipments) * 100).toFixed(1)
      : "100.0";

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Logistics & Delivery Operations"
        subtitle={`Delivery reliability, carrier performance, and destination transit times for ${selectedStore.name}`}
      />

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="On-Time Delivery Rate"
          value={`${onTimeRate}%`}
          change="Target > 95%"
          trend="up"
          icon={CheckCircle2}
          subtitle={`Delivered without delay (${fmtNum(overall.delivered)} total)`}
          sparklineData={[94, 95, 95.5, 96, 96.8, 97, 97.2]}
        />
        <KpiCard
          title="Average Delivery Time"
          value={`${overall.avg_delivery_days} Days`}
          change={`Median: ${overall.median_delivery_days}d`}
          trend="up"
          icon={Clock}
          subtitle="Mean duration from dispatch to doorstep"
          sparklineData={[5.2, 4.9, 4.7, 4.5, 4.3, 4.2, 4.1]}
        />
        <KpiCard
          title="In-Transit Packages"
          value={fmtNum(overall.in_transit)}
          change="Moving with carriers"
          trend="up"
          icon={Truck}
          subtitle="Orders currently in courier transport"
          sparklineData={[380, 410, 430, 445, 455, 462, 397]}
        />
        <KpiCard
          title="Delayed Shipments"
          value={fmtNum(overall.delayed)}
          change={`${((overall.delayed / overall.total_shipments) * 100).toFixed(1)}% delay rate`}
          trend="down"
          icon={AlertTriangle}
          subtitle="Shipments experiencing transit delays"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Carrier Performance Cards */}
        <div className="col-span-12 lg:col-span-6">
          <ChartCard
            title="Logistics Partner Performance"
            subtitle="Shipment volume, average transit days, and delay percentage by carrier"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-1">
              {carriers.map((c, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-900">{c.carrier}</span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                        c.delay_pct <= 2.0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {c.delay_pct <= 2.0 ? "Optimal" : "Review"}
                    </span>
                  </div>
                  <div className="text-xl font-semibold text-slate-900 tabular-nums">
                    {fmtNum(c.shipments)} <span className="text-xs font-normal text-slate-500">shipments</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <div>
                      <span className="block text-slate-400 font-medium text-xs">Avg Transit</span>
                      <span className="text-slate-800 font-medium">{c.avg_days} Days</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 font-medium text-xs">Delay Rate</span>
                      <span className="text-slate-800 font-medium">{c.delay_pct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Delivery Days Distribution Chart */}
        <div className="col-span-12 lg:col-span-6">
          <ChartCard
            title="Delivery Transit Time Distribution"
            subtitle="Volume of package deliveries grouped by days taken"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="days" {...CHART_AXIS_PROPS} />
                  <YAxis {...CHART_AXIS_PROPS} tickFormatter={(val) => fmtNum(val)} />
                  <Tooltip content={<ChartTooltip formatter={fmtNum} />} />
                  <Bar
                    dataKey="shipments"
                    name="Shipments"
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Destination Bottlenecks Table */}
        <div className="col-span-12">
          <ChartCard
            title="Destination Transit Times & Bottlenecks"
            subtitle="Fulfillment performance and bottleneck rate across destination cities"
          >
            {destinations.length === 0 ? (
              <EmptyState title="No destination data" description="No destination records found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="p-3">Destination City</th>
                      <th className="p-3 text-right">Total Shipments</th>
                      <th className="p-3 text-right">Avg Transit Time</th>
                      <th className="p-3 text-right">Bottleneck Shipments</th>
                      <th className="p-3 text-right">Bottleneck Share</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {destinations.map((d, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" /> {d.destination_city}
                        </td>
                        <td className="p-3 text-slate-700 text-right tabular-nums">{fmtNum(d.shipments)}</td>
                        <td className="p-3 font-semibold text-slate-800 text-right tabular-nums">{d.avg_days} Days</td>
                        <td className="p-3 text-amber-700 font-semibold text-right tabular-nums">
                          {fmtNum(d.bottleneck_shipments)}
                        </td>
                        <td className="p-3 text-slate-700 text-right tabular-nums">{d.bottleneck_pct}%</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                              d.bottleneck_pct > 18
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : d.bottleneck_pct > 14
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}
                          >
                            {d.bottleneck_pct > 18 ? "High Friction" : d.bottleneck_pct > 14 ? "Moderate" : "Smooth"}
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
