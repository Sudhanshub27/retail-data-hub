"use client";

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  Plus,
  CheckCircle2,
  Package,
  TrendingUp,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import { useStore } from "@/context/StoreContext";

const ASSOCIATION_RULES = [
  {
    ruleId: "RULE-101",
    antecedent: "SKU-8842 (Noise-Canceling Headphones)",
    consequent: "SKU-6630 (USB-C Fast Charging Hub)",
    support: "8.4%",
    confidence: "74.2%",
    lift: "3.45x",
    bundleDiscount: "15%",
    estRevImpact: "$48,500",
  },
  {
    ruleId: "RULE-102",
    antecedent: "SKU-3109 (Organic Espresso Dark Roast)",
    consequent: "SKU-1192 (Cold Brew Maker Pitcher)",
    support: "12.1%",
    confidence: "68.5%",
    lift: "2.90x",
    bundleDiscount: "10%",
    estRevImpact: "$34,200",
  },
  {
    ruleId: "RULE-103",
    antecedent: "SKU-9901 (Ergonomic Executive Chair)",
    consequent: "SKU-2041 (Insulated Tumbler 30oz)",
    support: "5.8%",
    confidence: "52.1%",
    lift: "2.10x",
    bundleDiscount: "12%",
    estRevImpact: "$22,400",
  },
];

export default function MarketBasketPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [bundleSuccess, setBundleSuccess] = useState<string | null>(null);

  const handleCreateBundle = (ruleId: string, title: string) => {
    setBundleSuccess(`Smart E-Commerce Bundle created for ${title}!`);
    setTimeout(() => setBundleSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Market Basket & Product Affinity"
        subtitle={`Co-purchase association rules, Support, Confidence, and Lift ratios for ${selectedStore.name}`}
        icon={Layers}
      />

      {bundleSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {bundleSuccess}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Association Rules"
          value="48 Rules"
          change="Lift > 2.0x"
          trend="up"
          icon={Layers}
          accentColor="indigo"
          subtitle="Min Support > 3.0%"
        />
        <KpiCard
          title="Avg Cross-Sell Lift"
          value="2.85x"
          change="+0.4x vs baseline"
          trend="up"
          icon={TrendingUp}
          accentColor="emerald"
          subtitle="Co-purchase probability"
        />
        <KpiCard
          title="Bundle Conversion Rate"
          value="18.4%"
          change="+4.2% AOV boost"
          trend="up"
          icon={Sparkles}
          accentColor="cyan"
          subtitle="Checkout cross-sells"
        />
        <KpiCard
          title="Potential Bundle Revenue"
          value={`$${Math.round(105100 * mult).toLocaleString()}`}
          change="Unlocked Opportunity"
          trend="up"
          icon={Package}
          accentColor="amber"
          subtitle="30-Day Projections"
        />
      </div>

      {/* Product Affinity Co-Purchase Network Visual Grid */}
      <ChartCard
        title="Product Affinity Co-Purchase Matrix"
        subtitle="High-density affinity pairs with strongest lift ratio and cross-buy volume"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-2">
          {ASSOCIATION_RULES.map((rule) => (
            <div
              key={rule.ruleId}
              className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 hover:border-slate-300 transition-colors shadow-xs"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-indigo-600">{rule.ruleId}</span>
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                  Lift {rule.lift}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold shadow-xs">
                  {rule.antecedent}
                </div>
                <div className="text-center text-[10px] text-slate-400 font-mono font-medium">Frequently Bought With ↓</div>
                <div className="p-2 bg-white border border-slate-200 rounded-lg text-emerald-700 font-bold shadow-xs">
                  {rule.consequent}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-200">
                <div>
                  <span className="block text-[9px] uppercase text-slate-400 font-semibold">Support</span>
                  <span className="text-slate-800 font-bold">{rule.support}</span>
                </div>
                <div>
                  <span className="block text-[9px] uppercase text-slate-400 font-semibold">Confidence</span>
                  <span className="text-slate-800 font-bold">{rule.confidence}</span>
                </div>
              </div>
              <button
                onClick={() => handleCreateBundle(rule.ruleId, `${rule.antecedent} + ${rule.consequent}`)}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> 1-Click Create Bundle ({rule.bundleDiscount} Off)
              </button>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Association Rules Table */}
      <ChartCard
        title="Association Rules Metrics Table"
        subtitle="Complete association rules sorted by Lift ratio and confidence"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase">
              <tr>
                <th className="p-3">Rule ID</th>
                <th className="p-3">Primary Item</th>
                <th className="p-3">Associated Item</th>
                <th className="p-3">Support %</th>
                <th className="p-3">Confidence %</th>
                <th className="p-3">Lift Ratio</th>
                <th className="p-3">Est. Rev Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {ASSOCIATION_RULES.map((rule) => (
                <tr key={rule.ruleId} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono font-bold text-indigo-600">{rule.ruleId}</td>
                  <td className="p-3 font-semibold text-slate-800">{rule.antecedent}</td>
                  <td className="p-3 font-semibold text-emerald-700">{rule.consequent}</td>
                  <td className="p-3 font-mono text-slate-600">{rule.support}</td>
                  <td className="p-3 font-mono text-slate-600">{rule.confidence}</td>
                  <td className="p-3 font-mono font-bold text-emerald-700">{rule.lift}</td>
                  <td className="p-3 font-mono font-bold text-cyan-700">{rule.estRevImpact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
