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
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/context/StoreContext";
import { fmtCurrency, fmtNum } from "@/lib/format";

const WAREHOUSES = [
  { id: "wh-1", name: "Mumbai Central DC", region: "Maharashtra", capacity: "88% Full", skus: 14200, status: "Optimal", pct: 88 },
  { id: "wh-2", name: "Delhi NCR Mega Hub", region: "North Region", capacity: "92% High", skus: 18900, status: "Near Capacity", pct: 92 },
  { id: "wh-3", name: "Bengaluru Logistics Hub", region: "Karnataka", capacity: "74% Full", skus: 12400, status: "Optimal", pct: 74 },
  { id: "wh-4", name: "Hyderabad Fulfillment DC", region: "Telangana", capacity: "65% Normal", skus: 9800, status: "Optimal", pct: 65 },
  { id: "wh-5", name: "Kolkata Distribution Hub", region: "West Bengal", capacity: "81% Full", skus: 11200, status: "Optimal", pct: 81 },
];

const LOW_STOCK_DRAWER_SKUS = [
  { sku: "SKU-9901", name: "Ergonomic Mesh Executive Chair", currentStock: 12, minThreshold: 50, leadDays: 5, supplier: "Apex Furniture" },
  { sku: "SKU-4012", name: "Ultra-Thin OLED Monitor 27-inch", currentStock: 8, minThreshold: 30, leadDays: 7, supplier: "VisionTech India" },
  { sku: "SKU-1829", name: "Smart Keyless Door Lock V2", currentStock: 15, minThreshold: 40, leadDays: 4, supplier: "SecureHome Labs" },
];

export default function InventoryPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [poGenerated, setPoGenerated] = useState<string | null>(null);

  const handleGeneratePO = (sku: string) => {
    setPoGenerated(`Purchase Order generated for ${sku}. Transmitted to supplier.`);
    setTimeout(() => setPoGenerated(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Inventory & Stock Management"
        subtitle={`Warehouse distribution, product sales velocity, and low-stock reorder replenishment for ${selectedStore.name}`}
        action={
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Low-Stock Alert Drawer ({Math.round(3 * mult)})</span>
          </button>
        }
      />

      {poGenerated && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {poGenerated}
        </div>
      )}

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Products in Stock"
          value={fmtNum(Math.round(14200 * mult))}
          change="98.2% Availability"
          trend="up"
          icon={Package}
          subtitle="Catalog items currently available across 5 warehouses"
          sparklineData={[13200, 13500, 13700, 13900, 14000, 14100, 14200]}
        />
        <KpiCard
          title="Inventory Turnover Rate"
          value="8.4x / year"
          change="+1.2x efficiency"
          trend="up"
          icon={Truck}
          subtitle="Times entire stock is sold and replaced per year"
          sparklineData={[6.8, 7.1, 7.4, 7.8, 8.0, 8.2, 8.4]}
        />
        <KpiCard
          title="Stagnant Unsold Stock"
          value={fmtCurrency(Math.round(4250000 * mult))}
          change="-14.2% cleared"
          trend="up"
          icon={AlertTriangle}
          subtitle="Value of items with zero customer orders in 90+ days"
        />
        <KpiCard
          title="Critical Low-Stock Items"
          value={fmtNum(Math.round(18 * mult))}
          change="Requires reorder"
          trend="down"
          icon={ShoppingCart}
          subtitle="Products below minimum safety threshold"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Warehouse Regional Distribution Map Grid */}
        <div className="col-span-12 lg:col-span-8">
          <ChartCard
            title="Distribution Center Network"
            subtitle="Current warehouse capacity utilization and assigned product counts"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-1">
              {WAREHOUSES.map((wh) => (
                <div
                  key={wh.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-slate-900 truncate">{wh.name}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium border flex-shrink-0 ${
                        wh.status === "Near Capacity"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {wh.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">{wh.region}</div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                    <span className="text-slate-500">Products Stored</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      {fmtNum(Math.round(wh.skus * mult))}
                    </span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Occupied Space</span>
                      <span className="font-medium text-slate-700">{wh.capacity}</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          wh.status === "Near Capacity" ? "bg-amber-500" : "bg-emerald-600"
                        }`}
                        style={{ width: `${wh.pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Product Sales Velocity Classification */}
        <div className="col-span-12 lg:col-span-4">
          <ChartCard
            title="Product Sales Velocity"
            subtitle="Inventory classified by sales turnaround speed"
          >
            <div className="space-y-3 my-1">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-900">Fast Moving Items</span>
                  <span className="text-xs font-medium bg-white text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200">
                    &lt; 14 Days
                  </span>
                </div>
                <div className="text-xl font-semibold text-slate-900 tabular-nums">
                  {fmtNum(Math.round(2840 * mult))} products
                </div>
                <p className="text-xs text-slate-600">High turnover items with automated reordering</p>
              </div>

              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-900">Steady Moving Items</span>
                  <span className="text-xs font-medium bg-white text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-200">
                    14–45 Days
                  </span>
                </div>
                <div className="text-xl font-semibold text-slate-900 tabular-nums">
                  {fmtNum(Math.round(8920 * mult))} products
                </div>
                <p className="text-xs text-slate-600">Stable demand items with predictable replenishments</p>
              </div>

              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-rose-900">Slow Moving / Stagnant</span>
                  <span className="text-xs font-medium bg-white text-rose-700 px-2 py-0.5 rounded-lg border border-rose-200">
                    &gt; 90 Days
                  </span>
                </div>
                <div className="text-xl font-semibold text-slate-900 tabular-nums">
                  {fmtNum(Math.round(410 * mult))} products
                </div>
                <p className="text-xs text-slate-600">Stagnant stock candidates for clearance promotions</p>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Low Stock Replenishment Table */}
        <div className="col-span-12">
          <ChartCard
            title="Urgent Low-Stock Reorder List"
            subtitle="Products that have dropped below safety thresholds and require purchase orders"
          >
            {LOW_STOCK_DRAWER_SKUS.length === 0 ? (
              <EmptyState title="No low stock items" description="All warehouse inventory is above minimum threshold levels." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="p-3">Product Code</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Assigned Supplier</th>
                      <th className="p-3 text-right">Current Stock</th>
                      <th className="p-3 text-right">Min Threshold</th>
                      <th className="p-3 text-right">Lead Time</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {LOW_STOCK_DRAWER_SKUS.map((item) => (
                      <tr key={item.sku} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-medium text-indigo-600">{item.sku}</td>
                        <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                        <td className="p-3 text-slate-600">{item.supplier}</td>
                        <td className="p-3 text-rose-700 font-semibold text-right tabular-nums">{item.currentStock} units</td>
                        <td className="p-3 text-slate-600 text-right tabular-nums">{item.minThreshold} units</td>
                        <td className="p-3 text-slate-600 text-right tabular-nums">{item.leadDays} days</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleGeneratePO(item.sku)}
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

      {/* Emergency Reorder Side Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end bg-slate-900/40 animate-fade-in">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between shadow-sm">
            <div>
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
                {LOW_STOCK_DRAWER_SKUS.map((item) => (
                  <div
                    key={item.sku}
                    className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-semibold text-indigo-600">{item.sku}</span>
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-medium rounded-lg border border-rose-200">
                        Stock: {item.currentStock} / Min {item.minThreshold}
                      </span>
                    </div>
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">
                      Supplier: {item.supplier} • Lead Time: {item.leadDays} days
                    </div>
                    <button
                      onClick={() => handleGeneratePO(item.sku)}
                      className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors mt-2"
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
