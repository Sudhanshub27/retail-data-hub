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
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/context/StoreContext";
import { fmtCurrency } from "@/lib/format";

const ASSOCIATION_RULES = [
  {
    ruleId: "RULE-101",
    antecedent: "Wireless Noise-Canceling Headphones",
    consequent: "USB-C Fast Charging Hub",
    support: "8.4%",
    confidence: "74.2%",
    lift: "3.45x",
    bundleDiscount: "15%",
    estRevImpact: 4850000,
  },
  {
    ruleId: "RULE-102",
    antecedent: "Organic Espresso Dark Roast (1kg)",
    consequent: "Cold Brew Maker Pitcher (1.5L)",
    support: "12.1%",
    confidence: "68.5%",
    lift: "2.90x",
    bundleDiscount: "10%",
    estRevImpact: 3420000,
  },
  {
    ruleId: "RULE-103",
    antecedent: "Ergonomic Mesh Executive Chair",
    consequent: "Stainless Steel Tumbler (1L)",
    support: "5.8%",
    confidence: "52.1%",
    lift: "2.10x",
    bundleDiscount: "12%",
    estRevImpact: 2240000,
  },
];

export default function MarketBasketPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [bundleSuccess, setBundleSuccess] = useState<string | null>(null);

  const handleCreateBundle = (ruleId: string, title: string) => {
    setBundleSuccess(`Promotional bundle created for ${title}`);
    setTimeout(() => setBundleSuccess(null), 3000);
  };

  const totalBundleRev = ASSOCIATION_RULES.reduce((acc, r) => acc + r.estRevImpact, 0) * mult;

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Market Basket & Co-Purchase Analysis"
        subtitle={`Frequently co-purchased item pairings, purchase probability multipliers, and bundle promotions for ${selectedStore.name}`}
      />

      {bundleSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {bundleSuccess}
        </div>
      )}

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Product Pairings Identified"
          value="48 Rules"
          change="Strong affinity"
          trend="up"
          icon={Layers}
          subtitle="Item combinations with frequent joint purchases"
        />
        <KpiCard
          title="Co-Purchase Multiplier"
          value="2.85x"
          change="+0.4x vs baseline"
          trend="up"
          icon={TrendingUp}
          subtitle="How much more often items are bought together than by chance (Lift)"
        />
        <KpiCard
          title="Bundle Checkout Rate"
          value="18.4%"
          change="+4.2% order value"
          trend="up"
          icon={Sparkles}
          subtitle="Percentage of shoppers who accept cross-sell suggestions"
        />
        <KpiCard
          title="Potential Bundle Revenue"
          value={fmtCurrency(totalBundleRev)}
          change="Incremental opportunity"
          trend="up"
          icon={Package}
          subtitle="Estimated 30-day additional sales from bundle promos"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Product Affinity Co-Purchase Network Visual Grid */}
        <div className="col-span-12">
          <ChartCard
            title="Top Product Pairing Opportunities"
            subtitle="Strongest product combinations recommended for immediate one-click promotional bundling"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-1">
              {ASSOCIATION_RULES.map((rule) => (
                <div
                  key={rule.ruleId}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-indigo-600">{rule.ruleId}</span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium text-xs font-sans">
                      {rule.lift} Co-Buy Rate
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
                      {rule.antecedent}
                    </div>
                    <div className="text-center text-xs text-slate-400 font-medium">Frequently Purchased With ↓</div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-emerald-700 font-semibold">
                      {rule.consequent}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <div>
                      <span className="block text-slate-400 text-xs">Cart Frequency</span>
                      <span className="text-slate-800 font-semibold">{rule.support}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-xs">Likelihood</span>
                      <span className="text-slate-800 font-semibold">{rule.confidence}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateBundle(rule.ruleId, `${rule.antecedent} + ${rule.consequent}`)}
                    className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-600" /> Create Bundle ({rule.bundleDiscount} Off)
                  </button>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Association Rules Table */}
        <div className="col-span-12">
          <ChartCard
            title="Co-Purchase Affinity Leaderboard"
            subtitle="Full catalog association rules ordered by co-purchase multiplier (Lift) and joint likelihood"
          >
            {ASSOCIATION_RULES.length === 0 ? (
              <EmptyState title="No co-purchase rules" description="No significant cross-sell pairs found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="p-3">Rule ID</th>
                      <th className="p-3">Primary Product</th>
                      <th className="p-3">Associated Product</th>
                      <th className="p-3 text-right">Cart Frequency (Support)</th>
                      <th className="p-3 text-right">Joint Likelihood (Confidence)</th>
                      <th className="p-3 text-right">Multiplier (Lift)</th>
                      <th className="p-3 text-right">Est. Revenue Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {ASSOCIATION_RULES.map((rule) => (
                      <tr key={rule.ruleId} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-medium text-indigo-600">{rule.ruleId}</td>
                        <td className="p-3 font-semibold text-slate-800">{rule.antecedent}</td>
                        <td className="p-3 font-semibold text-emerald-700">{rule.consequent}</td>
                        <td className="p-3 text-slate-600 text-right tabular-nums">{rule.support}</td>
                        <td className="p-3 text-slate-600 text-right tabular-nums">{rule.confidence}</td>
                        <td className="p-3 font-semibold text-emerald-700 text-right tabular-nums">{rule.lift}</td>
                        <td className="p-3 font-semibold text-slate-900 text-right tabular-nums">
                          {fmtCurrency(Math.round(rule.estRevImpact * mult))}
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
