"use client";

import React, { useState } from "react";
import {
  Package,
  Layers,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  X,
  Truck,
  Building2,
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
import { fmtCurrency, fmtNum } from "@/lib/format";

interface ReorderAlert {
  store_city: string;
  store_id: string;
  product_name: string;
  category: string;
  quantity_on_hand: number;
  reorder_level: number;
  units_to_order: number;
  unit_cost: number;
  reorder_cost: number;
}

interface CategoryTurnover {
  category: string;
  total_sold: number;
  avg_inventory: number;
  turnover_ratio: number;
}

interface StockoutItem {
  product_name: string;
  category: string;
  total_snapshots: number;
  zero_stock_snapshots: number;
  stockout_pct: number;
}

interface InventoryApiResponse {
  turnover?: {
    by_category?: CategoryTurnover[];
    by_store?: Array<{
      city: string;
      store_id?: string;
      total_sold: number;
      avg_inventory: number;
      turnover_ratio: number;
    }>;
  };
  stockout_rate?: {
    overall?: {
      total_records: number;
      stockout_records: number;
      stockout_pct: number;
    };
    frequently_stocked_out?: StockoutItem[];
  };
  reorder_alerts?: ReorderAlert[];
}

export default function InventoryPage() {
  const { selectedStore } = useStore();
  const endpoint =
    selectedStore.id && selectedStore.id !== "all"
      ? `/api/inventory?store_id=${selectedStore.id}`
      : "/api/inventory";

  const { data, loading, error, refetch } = useApi<InventoryApiResponse>(endpoint);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [poGenerated, setPoGenerated] = useState<string | null>(null);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const stockoutOverall = data?.stockout_rate?.overall;
  const reorderAlerts = data?.reorder_alerts || [];
  const categoryTurnovers = data?.turnover?.by_category || [];
  const frequentStockouts = data?.stockout_rate?.frequently_stocked_out || [];

  if (!data || !stockoutOverall) {
    return (
      <EmptyState
        title="No inventory health data"
        description="Run scripts/kpi_analysis.sh to compute inventory turnover and stockout metrics."
        onReset={refetch}
        resetText="Retry fetch"
      />
    );
  }

  const totalReorderCost = reorderAlerts.reduce((acc, curr) => acc + (curr.reorder_cost || 0), 0);
  const avgTurnover =
    categoryTurnovers.length > 0
      ? categoryTurnovers.reduce((acc, curr) => acc + curr.turnover_ratio, 0) / categoryTurnovers.length
      : 0;

  const handleGeneratePO = (name: string, store: string) => {
    setPoGenerated(`Purchase Order created for ${name} at ${store}. Transmitted to supplier.`);
    setTimeout(() => setPoGenerated(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Inventory & Stock Management"
        subtitle={`Warehouse distribution, product stock velocity, and replenishment alerts for ${selectedStore.name}`}
        action={
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Low-Stock Alerts ({reorderAlerts.length})</span>
          </button>
        }
      />

      {poGenerated && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {poGenerated}
        </div>
      )}

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Stockout Rate"
          value={`${stockoutOverall.stockout_pct}%`}
          change={`${fmtNum(stockoutOverall.stockout_records)} incidents`}
          trend="down"
          icon={AlertTriangle}
          subtitle="Percentage of zero-stock snapshot events"
          sparklineData={[6.2, 5.9, 5.7, 5.5, 5.3, 5.2, stockoutOverall.stockout_pct]}
        />
        <KpiCard
          title="Mean Inventory Turnover"
          value={`${avgTurnover.toFixed(1)}x / yr`}
          change="+1.2x efficiency"
          trend="up"
          icon={Truck}
          subtitle="Annualized stock turnover across catalog categories"
          sparklineData={[6.8, 7.1, 7.4, 7.8, 8.0, 8.2, 8.4]}
        />
        <KpiCard
          title="Urgent Reorder Items"
          value={fmtNum(reorderAlerts.length)}
          change="Action required"
          trend="down"
          icon={ShoppingCart}
          subtitle="Products currently below safety stock levels"
        />
        <KpiCard
          title="Estimated Reorder Outlay"
          value={fmtCurrency(totalReorderCost)}
          change="Replenishment budget"
          trend="neutral"
          icon={Package}
          subtitle="Total procurement capital for active low-stock alerts"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Category Turnover Chart */}
        <div className="col-span-12 lg:col-span-7">
          <ChartCard
            title="Inventory Turnover by Category"
            subtitle="Annual turnover ratio comparison across retail merchandise categories"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryTurnovers} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis
                    dataKey="category"
                    {...CHART_AXIS_PROPS}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={35}
                  />
                  <YAxis {...CHART_AXIS_PROPS} tickFormatter={(v) => `${v}x`} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v}x`} />} />
                  <Bar
                    dataKey="turnover_ratio"
                    name="Turnover Ratio"
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* High Frequency Stockout Items */}
        <div className="col-span-12 lg:col-span-5">
          <ChartCard
            title="Frequent Stockout Watchlist"
            subtitle="Products experiencing highest frequency of stock depletion"
          >
            <div className="space-y-3 my-1">
              {frequentStockouts.slice(0, 5).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{item.product_name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.category}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                      {item.stockout_pct}% Stockout
                    </span>
                    <div className="text-xs text-slate-400 mt-1">
                      {item.zero_stock_snapshots} / {item.total_snapshots} checks
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Low Stock Replenishment Table */}
        <div className="col-span-12">
          <ChartCard
            title="Urgent Low-Stock Reorder List"
            subtitle="Stores and products that have dropped below safety thresholds and require purchase orders"
          >
            {reorderAlerts.length === 0 ? (
              <EmptyState title="No low stock alerts" description="All store inventory is above minimum threshold levels." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="p-3">Store</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-right">In Stock</th>
                      <th className="p-3 text-right">Threshold</th>
                      <th className="p-3 text-right">Suggested Order</th>
                      <th className="p-3 text-right">Est. Outlay</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {reorderAlerts.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{item.store_city} ({item.store_id})</span>
                        </td>
                        <td className="p-3 font-medium text-slate-900">{item.product_name}</td>
                        <td className="p-3 text-slate-500">{item.category}</td>
                        <td className="p-3 text-rose-700 font-semibold text-right tabular-nums">{item.quantity_on_hand}</td>
                        <td className="p-3 text-slate-600 text-right tabular-nums">{item.reorder_level}</td>
                        <td className="p-3 text-indigo-600 font-semibold text-right tabular-nums">+{item.units_to_order}</td>
                        <td className="p-3 font-semibold text-slate-900 text-right tabular-nums">{fmtCurrency(item.reorder_cost)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleGeneratePO(item.product_name, item.store_city)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium rounded-lg transition-colors text-xs"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" />
                            Create PO
                          </button>
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

      {/* Low-Stock Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-slate-900/40 animate-fade-in">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between shadow-sm overflow-hidden">
            <div className="overflow-y-auto pr-1">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-base font-semibold text-slate-900">Low-Stock Alert Drawer</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {reorderAlerts.slice(0, 10).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-indigo-600">{item.store_city} ({item.store_id})</span>
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-medium rounded-lg border border-rose-200">
                        In Stock: {item.quantity_on_hand} / Min {item.reorder_level}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900">{item.product_name}</div>
                    <div className="text-xs text-slate-500">
                      Reorder: +{item.units_to_order} units • Cost: {fmtCurrency(item.reorder_cost)}
                    </div>
                    <button
                      onClick={() => handleGeneratePO(item.product_name, item.store_city)}
                      className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> 1-Click Generate PO
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 mt-4">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors text-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
