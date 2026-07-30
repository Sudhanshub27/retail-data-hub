"use client";

import React, { useState } from "react";
import {
  Database,
  Search,
  Download,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ChartCard from "@/components/ChartCard";
import { useStore } from "@/context/StoreContext";

const RAW_TABLE_ROWS = [
  { id: "TXN-90241", sku: "SKU-8842", name: "Wireless Headphones", price: 249.99, store: "NYC Broadway", timestamp: "2026-07-30T22:15:00Z", status: "Completed" },
  { id: "TXN-90242", sku: "SKU-3109", name: "Organic Espresso 1kg", price: 18.50, store: "E-Commerce", timestamp: "2026-07-30T22:16:12Z", status: "Completed" },
  { id: "TXN-90243", sku: "SKU-9901", name: "Executive Mesh Chair", price: 320.00, store: "Chicago #104", timestamp: "2026-07-30T22:18:45Z", status: "Completed" },
  { id: "TXN-90244", sku: "SKU-4412", price: 199.00, name: "Smart Fitness Watch", store: "LA Sunset", timestamp: "2026-07-30T22:20:01Z", status: "Completed" },
  { id: "TXN-90245", sku: "SKU-2041", price: 28.00, name: "Stainless Tumbler", store: "E-Commerce", timestamp: "2026-07-30T22:21:30Z", status: "Refunded" },
  { id: "TXN-90246", sku: "SKU-7721", price: 129.99, name: "Gaming Keyboard RGB", store: "NYC Broadway", timestamp: "2026-07-30T22:23:10Z", status: "Completed" },
];

export default function TablesPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const filteredRows = RAW_TABLE_ROWS.filter((row) =>
    Object.values(row).some((val) =>
      val.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["ID,SKU,Name,Price,Store,Timestamp,Status"]
        .concat(
          filteredRows.map(
            (r) => `${r.id},${r.sku},${r.name},${r.price},${r.store},${r.timestamp},${r.status}`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `retail_data_explorer_${selectedStore.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess("CSV file exported to local downloads!");
    setTimeout(() => setExportSuccess(null), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raw Data Explorer & Datagrid"
        subtitle={`Query, filter, multi-column sort, and export underlying DuckDB tables for ${selectedStore.name}`}
        icon={Database}
        action={
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      {exportSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {exportSuccess}
        </div>
      )}

      {/* Datagrid Controls Bar */}
      <ChartCard
        title="DuckDB Raw Datagrid (fact_sales_omnichannel)"
        subtitle="Full multi-column table explorer"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs w-full sm:w-80 shadow-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, ID, Store, or Status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none w-full font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 font-mono font-medium">
            <span>Showing {filteredRows.length} of {RAW_TABLE_ROWS.length} records</span>
          </div>
        </div>

        {/* Datagrid Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase">
              <tr>
                <th
                  onClick={() => setSortAsc(!sortAsc)}
                  className="p-3 cursor-pointer hover:text-slate-800"
                >
                  Transaction ID <ArrowUpDown className="w-3 h-3 inline ml-1" />
                </th>
                <th className="p-3">SKU Code</th>
                <th className="p-3">Product Name</th>
                <th className="p-3">Price ($)</th>
                <th className="p-3">Store Location</th>
                <th className="p-3">Timestamp (UTC)</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {filteredRows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 font-mono transition-colors">
                  <td className="p-3 font-bold text-indigo-600">{r.id}</td>
                  <td className="p-3 font-bold text-amber-700">{r.sku}</td>
                  <td className="p-3 text-slate-900 font-sans font-semibold">{r.name}</td>
                  <td className="p-3 font-bold text-emerald-700">${(r.price * (0.9 + mult * 0.1)).toFixed(2)}</td>
                  <td className="p-3 text-slate-700 font-sans">{r.store}</td>
                  <td className="p-3 text-slate-500 text-[11px] font-medium">{r.timestamp}</td>
                  <td className="p-3 font-sans">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        r.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {r.status}
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
