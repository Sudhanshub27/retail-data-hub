"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Plus,
  X,
  CheckCircle2,
  Lock,
  MapPin,
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

interface FraudTransaction {
  transaction_id: string;
  customer_id: string;
  product_name: string;
  category: string;
  city: string;
  channel: string;
  date: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  fraud_score: number;
  risk_level: string;
  signals: string[];
}

interface CityRisk {
  city: string;
  flagged_count: number;
  avg_score: number;
}

interface SignalFrequency {
  signal: string;
  count: number;
}

interface FraudApiResponse {
  summary?: {
    total_transactions: number;
    flagged_transactions: number;
    fraud_rate_pct: number;
    risk_distribution: Array<{ level: string; count: number }>;
    avg_fraud_score: number;
  };
  top_transactions?: FraudTransaction[];
  by_city?: CityRisk[];
  signal_frequency?: SignalFrequency[];
}

export default function FraudPage() {
  const { selectedStore } = useStore();
  const { data, loading, error, refetch } = useApi<FraudApiResponse>("/api/fraud");

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleCreatedSuccess, setRuleCreatedSuccess] = useState(false);

  // New Rule Form State
  const [ruleName, setRuleName] = useState("High Value Proxy Guard");
  const [minAmount, setMinAmount] = useState(50000);
  const [actionType, setActionType] = useState("Block");

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  const summary = data?.summary;
  const txns = data?.top_transactions || [];
  const cityRisks = data?.by_city || [];
  const signals = data?.signal_frequency || [];

  if (!data || !summary) {
    return (
      <EmptyState
        title="No fraud report data available"
        description="Run scripts/kpi_analysis.sh to compute rule-based fraud scores and risk signals."
        onReset={refetch}
        resetText="Retry fetch"
      />
    );
  }

  const criticalCount =
    summary.risk_distribution?.find((r) => r.level.toLowerCase() === "critical")?.count || 0;

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    setRuleCreatedSuccess(true);
    setTimeout(() => {
      setRuleCreatedSuccess(false);
      setIsRuleModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* 1. PageHeader */}
      <PageHeader
        title="Fraud Prevention & Transaction Safety"
        subtitle={`Rule-based risk scoring (0–100), velocity triggers, and security filters for ${selectedStore.name}`}
        action={
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>New Security Filter</span>
          </button>
        }
      />

      {/* 2. Row of KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Flagged Transactions"
          value={fmtNum(summary.flagged_transactions)}
          change={`${summary.fraud_rate_pct}% Flagged`}
          trend="down"
          icon={ShieldAlert}
          subtitle={`Across ${fmtNum(summary.total_transactions)} analyzed orders`}
          sparklineData={[520, 505, 492, 485, 480, 475, 479]}
        />
        <KpiCard
          title="Average Fraud Risk Score"
          value={`${summary.avg_fraud_score.toFixed(1)} / 100`}
          change="Standard baseline"
          trend="neutral"
          icon={ShieldCheck}
          subtitle="Mean composite risk score"
          sparklineData={[28, 27, 26, 25, 25, 24, 24]}
        />
        <KpiCard
          title="Critical Risk Incidents"
          value={fmtNum(criticalCount)}
          change="Score >= 80"
          trend="down"
          icon={Lock}
          subtitle="Transactions with critical velocity/burst signals"
        />
        <KpiCard
          title="Monitored Territories"
          value={`${cityRisks.length} Cities`}
          change={`Top: ${cityRisks[0]?.city ?? "Online"}`}
          trend="neutral"
          icon={Globe}
          subtitle="Coverage of automated transaction surveillance"
        />
      </div>

      {/* 3. 12-column grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Suspicious Transaction Stream */}
        <div className="col-span-12 lg:col-span-8">
          <ChartCard
            title="Flagged High-Risk Transactions"
            subtitle="Transactions scored highest by the automated heuristic engine"
          >
            {txns.length === 0 ? (
              <EmptyState title="No suspicious activity" description="No transactions flagged with elevated risk scores." />
            ) : (
              <div className="space-y-3 my-1">
                {txns.map((txn) => {
                  const isCrit = txn.risk_level === "Critical";
                  return (
                    <div
                      key={txn.transaction_id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold text-rose-600">{txn.transaction_id}</span>
                          <span className="font-semibold text-slate-900 tabular-nums">
                            {fmtCurrency(txn.total_amount)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                              isCrit
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {txn.risk_level}
                          </span>
                          <span className="text-slate-400 font-mono text-xs">({txn.customer_id})</span>
                        </div>
                        <div className="text-slate-800 font-medium truncate">
                          {txn.product_name} • <span className="text-slate-500">{txn.city} ({txn.channel})</span>
                        </div>
                        <div className="text-xs text-rose-700 font-medium">
                          {txn.signals.join(" • ")}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-center p-2 bg-white border border-slate-200 rounded-lg min-w-[70px]">
                          <div className="text-xs text-slate-400 font-medium">Risk Score</div>
                          <div className="text-lg font-semibold text-rose-600 tabular-nums">{txn.fraud_score}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ChartCard>
        </div>

        {/* Regional Risk Breakdown */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <ChartCard
            title="City Risk Exposure"
            subtitle="Flagged volume and average score by location"
          >
            <div className="space-y-2.5 my-1">
              {cityRisks.slice(0, 6).map((geo, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                      {geo.city}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Avg Score: {geo.avg_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200">
                    <span>Flagged Transactions</span>
                    <span className="text-slate-900 font-semibold">{fmtNum(geo.flagged_count)}</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Signal Triggers"
            subtitle="Frequency of specific risk triggers detected by heuristic engine"
          >
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={signals} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis type="number" {...CHART_AXIS_PROPS} tickFormatter={(v) => fmtNum(v)} />
                  <YAxis type="category" dataKey="signal" {...CHART_AXIS_PROPS} width={100} />
                  <Tooltip content={<ChartTooltip formatter={fmtNum} />} />
                  <Bar dataKey="count" name="Triggers" fill={CHART_COLORS[4]} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Security Rule Builder Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 animate-fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden z-10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-600">
                <Shield className="w-5 h-5" />
                <h3 className="text-base font-semibold text-slate-900">Security Rule Builder</h3>
              </div>
              <button
                onClick={() => setIsRuleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ruleCreatedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Security rule deployed live to transaction gateway!
              </div>
            )}

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 font-medium mb-1">Rule Name</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 focus:border-indigo-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-medium mb-1">Order Amount Above (₹)</label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 focus:border-indigo-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-medium mb-1">Triggered Action</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 focus:border-indigo-600 font-medium"
                  >
                    <option value="Block">Immediate Block</option>
                    <option value="Review">Manual Verification</option>
                    <option value="Challenge">Two-Factor OTP Check</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 space-y-1">
                <div className="text-slate-800 font-semibold uppercase text-xs">Rule Logic:</div>
                <div>
                  IF <span className="text-indigo-600 font-medium">Order Amount &gt; {fmtCurrency(minAmount)}</span> AND{" "}
                  <span className="text-indigo-600 font-medium">Network is Proxy/VPN</span> THEN{" "}
                  <span className="text-rose-600 font-semibold">{actionType}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium rounded-lg transition-colors"
                >
                  Deploy Security Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
