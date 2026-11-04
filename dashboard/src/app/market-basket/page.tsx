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

interface CategoryRule {
  if_category: string[];
  then_category: string[];
  support: number;
  confidence: number;
  lift: number;
}

interface Itemset {
  items: string[];
  support: number;
}

interface MarketBasketApiResponse {
  standard_basket?: {
    stats?: {
      total_transactions?: number;
      frequent_itemsets_found?: number;
      association_rules_found?: number;
      [key: string]: number | undefined;
    };
    itemsets?: Itemset[];
  };
  category_basket?: {
    stats?: {
      frequent_itemsets?: number;
      rules_found?: number;
      [key: string]: number | undefined;
    };
    rules?: CategoryRule[];
  };
}

export default function MarketBasketPage() {
  const { selectedStore } = useStore();
  const { data, loading, error, refetch } = useApi<MarketBasketApiResponse>("/api/market-basket");
  const [bundleSuccess, setBundleSuccess] = useState<string | null>(null);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const categoryRules = data?.category_basket?.rules || [];
  const standardStats = data?.standard_basket?.stats;
  const categoryStats = data?.category_basket?.stats;
  const frequentItemsets = data?.standard_basket?.itemsets || [];

  if (!data || (!categoryRules.length && !frequentItemsets.length)) {
    return (
      <EmptyState
        title="No co-purchase affinity data"
        description="Run scripts/kpi_analysis.sh to compute Apriori association rules."
        onReset={refetch}
        resetText="Retry fetch"
      />
    );
  }

  const handleCreateBundle = (title: string) => {
    setBundleSuccess(`Promotional bundle created for ${title}`);
    setTimeout(() => setBundleSuccess(null), 3000);
  };

  const topLift = categoryRules.length > 0
    ? Math.max(...categoryRules.map((r) => r.lift))
    : 1.0;

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Market Basket & Co-Purchase Analysis"
        subtitle={`Frequently co-purchased item pairings, purchase probability lift factors, and bundle promotions for ${selectedStore.name}`}
      />

      {bundleSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {bundleSuccess}
        </div>
      )}

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Product Pairings Identified"
          value={`${categoryStats?.rules_found ?? categoryRules.length} Rules`}
          change="Strong affinity"
          trend="up"
          icon={Layers}
          subtitle="Category combinations with frequent joint purchases"
        />
        <KpiCard
          title="Co-Purchase Lift Factor"
          value={`${topLift.toFixed(2)}x`}
          change="Joint affinity"
          trend="up"
          icon={TrendingUp}
          subtitle="Ratio of joint purchase frequency over baseline expectations"
        />
        <KpiCard
          title="Frequent Itemsets"
          value={fmtNum(standardStats?.frequent_itemsets_found ?? frequentItemsets.length)}
          change="Apriori mined"
          trend="up"
          icon={Sparkles}
          subtitle="Identified recurring item combinations"
        />
        <KpiCard
          title="Analyzed Transactions"
          value={fmtNum(standardStats?.total_transactions ?? 0)}
          change="Catalog wide"
          trend="neutral"
          icon={Package}
          subtitle="Total transactions evaluated for cross-sell patterns"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Top Pairing Opportunities */}
        <div className="col-span-12">
          <ChartCard
            title="Top Category Pairing Opportunities"
            subtitle="Strongest product combinations recommended for promotional cross-selling"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-1">
              {categoryRules.slice(0, 6).map((rule, idx) => {
                const ifText = rule.if_category.join(", ");
                const thenText = rule.then_category.join(", ");
                return (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-indigo-600">PAIR-{idx + 1}</span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-medium text-xs font-sans">
                        {rule.lift.toFixed(2)}x Lift
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-medium">
                        {ifText}
                      </div>
                      <div className="text-center text-xs text-slate-400 font-medium">Frequently Purchased With ↓</div>
                      <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-emerald-700 font-semibold">
                        {thenText}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 pt-2 border-t border-slate-200">
                      <div>
                        <span className="block text-slate-400 text-xs">Cart Frequency</span>
                        <span className="text-slate-800 font-semibold">{(rule.support * 100).toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 text-xs">Likelihood</span>
                        <span className="text-slate-800 font-semibold">{(rule.confidence * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCreateBundle(`${ifText} + ${thenText}`)}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-600" /> Create Bundle Campaign
                    </button>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Co-Purchase Lift Chart */}
        <div className="col-span-12">
          <ChartCard
            title="Category Affinity Lift Comparison"
            subtitle="Strength of co-purchase association rules measured by Lift factor"
          >
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryRules.slice(0, 8).map((r) => ({
                    pair: `${r.if_category[0]} → ${r.then_category[0]}`,
                    lift: Number(r.lift.toFixed(2)),
                  }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 30 }}
                >
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis
                    dataKey="pair"
                    {...CHART_AXIS_PROPS}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={35}
                  />
                  <YAxis {...CHART_AXIS_PROPS} tickFormatter={(v) => `${v}x`} />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v}x`} />} />
                  <Bar
                    dataKey="lift"
                    name="Lift Factor"
                    fill={CHART_COLORS[0]}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Association Rules Table */}
        <div className="col-span-12">
          <ChartCard
            title="Co-Purchase Affinity Leaderboard"
            subtitle="Full association rules ordered by co-purchase lift factor and joint likelihood"
          >
            {categoryRules.length === 0 ? (
              <EmptyState title="No co-purchase rules" description="No significant cross-sell pairs found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-medium">
                    <tr>
                      <th className="p-3">Rank</th>
                      <th className="p-3">If Customer Buys</th>
                      <th className="p-3">Then Recommended Category</th>
                      <th className="p-3 text-right">Cart Frequency (Support)</th>
                      <th className="p-3 text-right">Joint Likelihood (Confidence)</th>
                      <th className="p-3 text-right">Lift Factor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {categoryRules.map((rule, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-medium text-slate-400">#{idx + 1}</td>
                        <td className="p-3 font-semibold text-slate-800">{rule.if_category.join(", ")}</td>
                        <td className="p-3 font-semibold text-emerald-700">{rule.then_category.join(", ")}</td>
                        <td className="p-3 text-slate-600 text-right tabular-nums">{(rule.support * 100).toFixed(1)}%</td>
                        <td className="p-3 text-slate-600 text-right tabular-nums">{(rule.confidence * 100).toFixed(1)}%</td>
                        <td className="p-3 font-semibold text-emerald-700 text-right tabular-nums">{rule.lift.toFixed(2)}x</td>
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
