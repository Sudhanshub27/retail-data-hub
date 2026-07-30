"use client";

import React, { useState, useEffect } from "react";
import { Search, Package, Users, AlertTriangle, Shield, ArrowRight, X, Sparkles, Command } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";

interface SearchResult {
  id: string;
  category: "Pages" | "SKUs" | "Fraud" | "Anomalies" | "Customers";
  title: string;
  subtitle: string;
  href: string;
  badge?: string;
  badgeColor?: string;
}

const SEARCH_ITEMS: SearchResult[] = [
  { id: "p-overview", category: "Pages", title: "Executive Overview", subtitle: "KPI metrics, revenue area chart & store breakdown", href: "/" },
  { id: "p-sales", category: "Pages", title: "Sales & Revenue Analytics", subtitle: "Velocity, basket value scatter & growth SKUs", href: "/sales" },
  { id: "p-customers", category: "Pages", title: "Customer Intelligence", subtitle: "3x3 RFM matrix grid & churn risk score", href: "/customers" },
  { id: "p-forecast", category: "Pages", title: "Demand Forecasting & ML", subtitle: "AI prediction curves & confidence interval bands", href: "/forecast" },
  { id: "p-inventory", category: "Pages", title: "Inventory & Stock Supply Chain", subtitle: "Warehouse distribution map & low stock drawer", href: "/inventory" },
  { id: "p-anomalies", category: "Pages", title: "Anomaly & Outlier Detection", subtitle: "Radar summary, severity cards & diagnostics", href: "/anomalies", badge: "3 Active", badgeColor: "bg-amber-50 text-amber-700 border border-amber-200" },
  { id: "p-fraud", category: "Pages", title: "Fraud & Risk Watch", subtitle: "Real-time suspicious transaction stream & rules", href: "/fraud", badge: "Critical", badgeColor: "bg-rose-50 text-rose-700 border border-rose-200" },
  { id: "p-logistics", category: "Pages", title: "Logistics & Fulfillment", subtitle: "Carrier performance gauges & fulfillment funnel", href: "/logistics" },
  { id: "p-market-basket", category: "Pages", title: "Market Basket Analysis", subtitle: "Product affinity network & association rules", href: "/market-basket" },
  { id: "p-live", category: "Pages", title: "Real-time Operations Stream", subtitle: "High-frequency streaming log & QPS latency", href: "/live", badge: "Live Sync", badgeColor: "bg-cyan-50 text-cyan-700 border border-cyan-200" },
  { id: "p-chat", category: "Pages", title: "Retail AI Assistant & SQL", subtitle: "Conversational SQL bot & chart generator", href: "/chat" },
  { id: "p-data-quality", category: "Pages", title: "Data Quality & Lineage", subtitle: "Freshness SLA monitors & DAG visualizer", href: "/data-quality" },
  { id: "p-tables", category: "Pages", title: "Raw Data Explorer", subtitle: "High-density multi-column datagrid", href: "/tables" },

  // SKUs
  { id: "sku-1", category: "SKUs", title: "SKU-8842: Wireless Noise-Canceling Headphones", subtitle: "Electronics • $249.99 • Fast Mover (Stock: 1,420)", href: "/inventory" },
  { id: "sku-2", category: "SKUs", title: "SKU-3109: Organic Espresso Dark Roast 1kg", subtitle: "Grocery • $18.50 • High Velocity (Stock: 340)", href: "/inventory" },
  { id: "sku-3", category: "SKUs", title: "SKU-9901: Ergonomic Mesh Executive Chair", subtitle: "Office • $320.00 • Low Stock Horizon (Stock: 12)", href: "/inventory", badge: "Low Stock", badgeColor: "bg-amber-50 text-amber-700 border border-amber-200" },

  // Fraud / Anomalies
  { id: "f-104", category: "Fraud", title: "TXN-90812: Multi-Card Rapid Velocity", subtitle: "Risk Score: 94/100 • $1,450.00 • Flagged NYC Broadway", href: "/fraud", badge: "Risk 94", badgeColor: "bg-rose-50 text-rose-700 border border-rose-200" },
  { id: "a-201", category: "Anomalies", title: "POS-Sync Spike #4021", subtitle: "Revenue Anomaly • +340% surge in refunds in 15 mins", href: "/anomalies", badge: "Critical", badgeColor: "bg-rose-50 text-rose-700 border border-rose-200" },

  // Customers
  { id: "c-77", category: "Customers", title: "CUST-4921: Enterprise Corporate Buyer", subtitle: "LTV $42,500 • Champions Segment • Churn Risk 4%", href: "/customers" },
  { id: "c-88", category: "Customers", title: "CUST-1049: High Velocity Shopper", subtitle: "LTV $12,800 • At Risk Segment • Churn Risk 82%", href: "/customers", badge: "82% Churn", badgeColor: "bg-rose-50 text-rose-700 border border-rose-200" },
];

export default function CmdKModal() {
  const { isCmdKOpen, setIsCmdKOpen } = useStore();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCmdKOpen(!isCmdKOpen);
      }
      if (e.key === "Escape" && isCmdKOpen) {
        setIsCmdKOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCmdKOpen, setIsCmdKOpen]);

  if (!isCmdKOpen) return null;

  const filteredItems = SEARCH_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleSelect = (item: SearchResult) => {
    setIsCmdKOpen(false);
    router.push(item.href);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={() => setIsCmdKOpen(false)}
      />
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh]">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 bg-white">
          <Search className="w-5 h-5 text-indigo-600 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search SKUs, Customers, Fraud flags, Anomalies, or Pages... (Cmd+K)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            autoFocus
            className="w-full bg-transparent text-slate-900 placeholder-slate-400 text-sm focus:outline-none font-medium"
          />
          <button
            onClick={() => setIsCmdKOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto text-xs font-medium">
          {["All", "Pages", "SKUs", "Fraud", "Anomalies", "Customers"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              No matching records found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? "bg-indigo-50/80 border border-indigo-200 text-slate-900 shadow-xs"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        item.category === "Pages"
                          ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                          : item.category === "SKUs"
                          ? "bg-amber-50 text-amber-600 border border-amber-100"
                          : item.category === "Fraud"
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : item.category === "Anomalies"
                          ? "bg-cyan-50 text-cyan-600 border border-cyan-100"
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}
                    >
                      {item.category === "SKUs" && <Package className="w-4 h-4" />}
                      {item.category === "Fraud" && <Shield className="w-4 h-4" />}
                      {item.category === "Anomalies" && <AlertTriangle className="w-4 h-4" />}
                      {item.category === "Customers" && <Users className="w-4 h-4" />}
                      {item.category === "Pages" && <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate text-slate-900">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.badgeColor || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5 font-sans">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0 ml-2">
                    <span className="text-[11px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200 font-semibold">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-700 shadow-xs">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-700 shadow-xs">↵</kbd> Select
            </span>
          </div>
          <span className="flex items-center gap-1 text-indigo-600 font-mono text-[11px] font-bold">
            <Command className="w-3 h-3" /> Omniprompt Engine
          </span>
        </div>
      </div>
    </div>
  );
}
