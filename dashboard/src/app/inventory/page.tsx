"use client";

import React, { useState } from "react";
import {
  Package,
  Building2,
  AlertTriangle,
  ShoppingCart,
  CheckCircle2,
  X,
  Truck,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import { useStore } from "@/context/StoreContext";

const WAREHOUSES = [
  { id: "wh-1", name: "East Coast Hub - NYC Newark", region: "North America East", capacity: "88% Full", skus: 14200, status: "Optimal" },
  { id: "wh-2", name: "Midwest Mega DC - Chicago", region: "North America Central", capacity: "92% High", skus: 18900, status: "Near Capacity" },
  { id: "wh-3", name: "West Coast Port DC - LA Long Beach", region: "North America West", capacity: "74% Full", skus: 12400, status: "Optimal" },
  { id: "wh-4", name: "Southeast Fulfillment - Atlanta", region: "North America South", capacity: "65% Normal", skus: 9800, status: "Optimal" },
  { id: "wh-5", name: "Southwest Logistics - Dallas Fort Worth", region: "North America South", capacity: "81% Full", skus: 11200, status: "Optimal" },
];

const LOW_STOCK_DRAWER_SKUS = [
  { sku: "SKU-9901", name: "Ergonomic Mesh Executive Chair", currentStock: 12, minThreshold: 50, leadDays: 5, supplier: "SteelCase Direct" },
  { sku: "SKU-4012", name: "Ultra-Thin OLED Monitor 27-inch", currentStock: 8, minThreshold: 30, leadDays: 7, supplier: "LG Electronics" },
  { sku: "SKU-1829", name: "Smart Keyless Door Lock V2", currentStock: 15, minThreshold: 40, leadDays: 4, supplier: "August Home" },
];

export default function InventoryPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [poGenerated, setPoGenerated] = useState<string | null>(null);

  const handleGeneratePO = (sku: string) => {
    setPoGenerated(`Purchase Order #PO-90412 generated for ${sku}. Sent to EDI Supplier API!`);
    setTimeout(() => setPoGenerated(null), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Stock Supply Chain"
        subtitle={`Warehouse distribution, SKU velocity classification, and automated reordering for ${selectedStore.name}`}
        icon={Package}
        action={
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <AlertTriangle className="w-4 h-4" /> Low-Stock Drawer ({Math.round(3 * mult)})
          </button>
        }
      />

      {poGenerated && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {poGenerated}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total In-Stock SKUs"
          value={Math.round(14200 * mult).toLocaleString()}
          change="98.2% Availability"
          trend="up"
          icon={Package}
          accentColor="indigo"
          subtitle="Distributed across 5 DCs"
        />
        <KpiCard
          title="Stock Turnover Ratio"
          value="8.4x"
          change="+1.2x efficiency"
          trend="up"
          icon={Truck}
          accentColor="emerald"
          subtitle="Target > 7.5x"
        />
        <KpiCard
          title="Dead Stock Valuation"
          value={`$${Math.round(42500 * mult).toLocaleString()}`}
          change="-14.2% cleared"
          trend="up"
          icon={AlertTriangle}
          accentColor="amber"
          subtitle="Zero sales > 90 days"
        />
        <KpiCard
          title="Low-Stock Emergency"
          value={Math.round(18 * mult).toString()}
          change="PO Creation Required"
          trend="down"
          icon={ShoppingCart}
          accentColor="rose"
          subtitle="Below safety threshold"
        />
      </div>

      {/* Warehouse Regional Distribution Map Grid */}
      <ChartCard
        title="Regional Fulfillment Center Network"
        subtitle="Live storage capacity, SKU allocation, and status across primary distribution centers"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-2">
          {WAREHOUSES.map((wh) => (
            <div
              key={wh.id}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">{wh.name}</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    wh.status === "Near Capacity"
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {wh.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">{wh.region}</div>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Total SKUs Stored</span>
                <span className="font-mono font-bold text-slate-900">
                  {Math.round(wh.skus * mult).toLocaleString()}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>Capacity Utilization</span>
                  <span className="font-bold">{wh.capacity}</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      wh.status === "Near Capacity" ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: wh.capacity.split("%")[0] + "%" }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* SKU Velocity Matrix */}
      <ChartCard
        title="SKU Inventory Velocity Matrix"
        subtitle="Classification of products based on turnover rate and revenue velocity"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900">⚡ Fast Movers</span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-emerald-200">
                High Velocity
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {Math.round(2840 * mult).toLocaleString()} SKUs
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Turnover &lt; 14 days • Automate replenishment</p>
          </div>

          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-900">📦 Steady Movers</span>
              <span className="text-[10px] font-mono text-indigo-700 font-bold bg-white px-2 py-0.5 rounded border border-indigo-200">
                Normal Velocity
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {Math.round(8920 * mult).toLocaleString()} SKUs
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Turnover 14–45 days • Stable stock levels</p>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900">⚠️ Dead Stock</span>
              <span className="text-[10px] font-mono text-rose-700 font-bold bg-white px-2 py-0.5 rounded border border-rose-200">
                Clearance Target
              </span>
            </div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {Math.round(410 * mult).toLocaleString()} SKUs
            </div>
            <p className="text-[11px] text-slate-600 font-medium">Zero sales &gt; 90 days • Bundle or discount</p>
          </div>
        </div>
      </ChartCard>

      {/* Emergency Reorder Side Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="text-base font-bold text-slate-900">Low-Stock Emergency Drawer</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {LOW_STOCK_DRAWER_SKUS.map((item) => (
                  <div
                    key={item.sku}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-600">{item.sku}</span>
                      <span className="px-2.5 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-mono font-bold rounded-full border border-rose-200">
                        Stock: {item.currentStock} / Min {item.minThreshold}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      Supplier: {item.supplier} • Lead Time: {item.leadDays} days
                    </div>
                    <button
                      onClick={() => handleGeneratePO(item.sku)}
                      className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-2 shadow-xs"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> 1-Click Generate PO
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition-colors"
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
