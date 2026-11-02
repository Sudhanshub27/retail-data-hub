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
  IndianRupee,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import EmptyState from "@/components/EmptyState";
import { useStore } from "@/context/StoreContext";
import { fmtCurrency, fmtNum } from "@/lib/format";

const SUSPICIOUS_TXNS = [
  { id: "TXN-90812", riskScore: 94, amount: 145000, loc: "Mumbai, MH (IP: 185.220.101.4)", reason: "Rapid Multi-Card Velocity (4 attempts / 2 mins)", status: "Blocked" },
  { id: "TXN-90813", riskScore: 88, amount: 89050, loc: "Bengaluru, KA (IP: 45.154.255.1)", reason: "VPN / Data Center IP + Address Mismatch", status: "In Review" },
  { id: "TXN-90814", riskScore: 82, amount: 210000, loc: "Delhi NCR (IP: 198.51.100.42)", reason: "High-Value Transaction from New Account", status: "In Review" },
  { id: "TXN-90815", riskScore: 76, amount: 62000, loc: "Hyderabad, TS (IP: 172.56.21.9)", reason: "Device Fingerprint Automation Mismatch", status: "Flagged" },
];

const GEOLOCATION_FRAUD_RISK = [
  { region: "Western Region (Mumbai/Pune)", riskLevel: "Elevated", totalBlocks: 142, volume: 4850000 },
  { region: "Northern Region (Delhi NCR)", riskLevel: "High", totalBlocks: 215, volume: 8210000 },
  { region: "Southern Region (Bengaluru/Chennai)", riskLevel: "Moderate", totalBlocks: 68, volume: 1840000 },
  { region: "Eastern Region (Kolkata)", riskLevel: "Moderate", totalBlocks: 54, volume: 1220000 },
];

export default function FraudPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleCreatedSuccess, setRuleCreatedSuccess] = useState(false);

  // New Rule Form State
  const [ruleName, setRuleName] = useState("High Value Proxy Block");
  const [minAmount, setMinAmount] = useState(50000);
  const [actionType, setActionType] = useState("Block");

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
        subtitle={`Real-time suspicious transaction stream, automated risk scoring (0–100), and custom security filters for ${selectedStore.name}`}
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

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Fraud Prevented"
          value={fmtCurrency(Math.round(14820000 * mult))}
          change="99.4% Precision"
          trend="up"
          icon={ShieldCheck}
          subtitle="Estimated revenue protected from unauthorized transactions"
          sparklineData={[112, 118, 125, 134, 140, 145, 148]}
        />
        <KpiCard
          title="Flagged Transactions"
          value={fmtNum(Math.round(479 * mult))}
          change="Real-time monitor"
          trend="down"
          icon={ShieldAlert}
          subtitle="Transactions flagged with Risk Score &gt; 70"
          sparklineData={[520, 505, 492, 485, 480, 475, 479]}
        />
        <KpiCard
          title="Proxy & Bot Interceptions"
          value={fmtNum(Math.round(214 * mult))}
          change="+14% Bot Mitigation"
          trend="up"
          icon={Globe}
          subtitle="Blocked orders originating from masked data center IPs"
        />
        <KpiCard
          title="Payment Dispute Rate"
          value="0.12%"
          change="Well below 0.9% threshold"
          trend="up"
          icon={Lock}
          subtitle="Share of customer purchases contested as chargebacks"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Real-time Suspicious Transaction Stream */}
        <div className="col-span-12 lg:col-span-8">
          <ChartCard
            title="Suspicious Transaction Monitor"
            subtitle="Recent purchases flagged by automated risk rules for security review"
          >
            {SUSPICIOUS_TXNS.length === 0 ? (
              <EmptyState title="No suspicious activity" description="All recent transactions passed fraud validation checks." />
            ) : (
              <div className="space-y-3 my-1">
                {SUSPICIOUS_TXNS.map((txn) => (
                  <div
                    key={txn.id}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-rose-600">{txn.id}</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                          {fmtCurrency(Math.round(txn.amount * mult))}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                            txn.status === "Blocked"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {txn.status}
                        </span>
                      </div>
                      <div className="text-slate-800 font-medium">{txn.reason}</div>
                      <div className="text-xs text-slate-500">{txn.loc}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-center p-2 bg-white border border-slate-200 rounded-lg min-w-[70px]">
                        <div className="text-xs text-slate-400 font-medium">Risk Score</div>
                        <div className="text-lg font-semibold text-rose-600 tabular-nums">{txn.riskScore}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>

        {/* Geolocation Fraud Heatmap / Regional Risk Breakdown */}
        <div className="col-span-12 lg:col-span-4">
          <ChartCard
            title="Regional Risk Breakdown"
            subtitle="Flagged volumes and automated security blocks grouped by territory"
          >
            <div className="space-y-3 my-1">
              {GEOLOCATION_FRAUD_RISK.map((geo, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{geo.region}</span>
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${
                        geo.riskLevel === "High"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {geo.riskLevel} Risk
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200">
                    <span>Blocked: {fmtCurrency(Math.round(geo.volume * mult))}</span>
                    <span className="text-rose-700 font-medium">{geo.totalBlocks} Blocks</span>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Visual Fraud Rule Builder Modal */}
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
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Security rule deployed live to payment gateway!
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
