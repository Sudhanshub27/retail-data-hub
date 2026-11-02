"use client";

import React, { useState } from "react";
import {
  Search,
  Download,
  ArrowUpDown,
  CheckCircle2,
  Database,
  Filter,
  CheckSquare,
  FileSpreadsheet,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/context/StoreContext";
import { fmtCurrency, fmtNum } from "@/lib/format";

const RAW_TABLE_ROWS = [
  { id: "TXN-90241", sku: "SKU-8842", name: "Wireless Noise-Canceling Headphones", price: 14500, store: "Mumbai Flagship Store", timestamp: "2026-07-30T22:15:00Z", status: "Completed" },
  { id: "TXN-90242", sku: "SKU-3109", name: "Organic Espresso Dark Roast (1kg)", price: 1850, store: "E-Commerce Web", timestamp: "2026-07-30T22:16:12Z", status: "Completed" },
  { id: "TXN-90243", sku: "SKU-9901", name: "Ergonomic Mesh Executive Chair", price: 24900, store: "Bengaluru Hub Store", timestamp: "2026-07-30T22:18:45Z", status: "Completed" },
  { id: "TXN-90244", sku: "SKU-4412", name: "Smart Fitness Watch Series V", price: 19900, store: "Delhi NCR POS #2", timestamp: "2026-07-30T22:20:01Z", status: "Completed" },
  { id: "TXN-90245", sku: "SKU-2041", name: "Stainless Steel Insulated Tumbler", price: 1200, store: "E-Commerce Web", timestamp: "2026-07-30T22:21:30Z", status: "Refunded" },
  { id: "TXN-90246", sku: "SKU-7721", name: "Mechanical Gaming Keyboard RGB", price: 8900, store: "Mumbai Flagship Store", timestamp: "2026-07-30T22:23:10Z", status: "Completed" },
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

  const totalValue = filteredRows.reduce((acc, curr) => acc + curr.price * mult, 0);

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

    setExportSuccess("CSV file downloaded to your device.");
    setTimeout(() => setExportSuccess(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Raw Data Explorer & Datagrid"
        subtitle={`Search, filter, multi-column inspect, and export database transaction records for ${selectedStore.name}`}
        action={
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export CSV</span>
          </button>
        }
      />

      {exportSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {exportSuccess}
        </div>
      )}

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Indexed Records"
          value={fmtNum(Math.round(248500 * mult))}
          change="Real-time Indexed"
          trend="up"
          icon={Database}
          subtitle="Rows queryable across current store tables"
          sparklineData={[230, 235, 238, 242, 245, 247, 248]}
        />
        <KpiCard
          title="Matching Records"
          value={`${filteredRows.length} Rows`}
          change="Search results"
          trend="neutral"
          icon={Filter}
          subtitle="Records matching active keyword query"
        />
        <KpiCard
          title="Visible Records Value"
          value={fmtCurrency(totalValue)}
          change="Filtered Volume"
          trend="neutral"
          icon={CheckSquare}
          subtitle="Combined sales total of currently filtered rows"
        />
        <KpiCard
          title="Data Export Availability"
          value="Instant CSV"
          change="UTF-8 Clean"
          trend="up"
          icon={FileSpreadsheet}
          subtitle="Full batch export without pagination limits"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <ChartCard
            title="Omnichannel Transaction Records Table"
            subtitle="Underlying sales transactions with instant keyword search and CSV export"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by SKU, ID, location, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none w-full font-medium"
                />
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Showing {filteredRows.length} of {RAW_TABLE_ROWS.length} records
              </div>
            </div>

            {/* Datagrid Table */}
            {filteredRows.length === 0 ? (
              <EmptyState
                title="No matching records"
                description={`No transactions matched "${searchQuery}". Try a different keyword.`}
                onReset={() => setSearchQuery("")}
                resetText="Clear search query"
              />
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th
                        onClick={() => setSortAsc(!sortAsc)}
                        className="p-3 cursor-pointer hover:text-slate-800"
                      >
                        Transaction ID <ArrowUpDown className="w-3 h-3 inline ml-1 text-slate-400" />
                      </th>
                      <th className="p-3">Product Code</th>
                      <th className="p-3">Product Description</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3">Store Location</th>
                      <th className="p-3">Recorded Time (UTC)</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredRows.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-medium text-indigo-600">{r.id}</td>
                        <td className="p-3 font-mono font-medium text-slate-700">{r.sku}</td>
                        <td className="p-3 text-slate-900 font-semibold">{r.name}</td>
                        <td className="p-3 font-semibold text-slate-900 text-right tabular-nums">
                          {fmtCurrency(Math.round(r.price * mult))}
                        </td>
                        <td className="p-3 text-slate-600">{r.store}</td>
                        <td className="p-3 text-slate-500 font-medium">{r.timestamp}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-medium border ${
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
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
