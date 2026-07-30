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
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import { useStore } from "@/context/StoreContext";

const SUSPICIOUS_TXNS = [
  { id: "TXN-90812", riskScore: 94, amount: 1450.0, loc: "New York, NY (IP: 185.220.101.4)", reason: "Rapid Multi-Card Velocity (4 cards / 2 mins)", status: "Blocked" },
  { id: "TXN-90813", riskScore: 88, amount: 890.5, loc: "Miami, FL (IP: 45.154.255.1)", reason: "VPN / Known Proxy Subnet + Shipping Mismatch", status: "In Review" },
  { id: "TXN-90814", riskScore: 82, amount: 2100.0, loc: "Los Angeles, CA (IP: 198.51.100.42)", reason: "High Dollar Value First Time Account", status: "In Review" },
  { id: "TXN-90815", riskScore: 76, amount: 620.0, loc: "Chicago, IL (IP: 172.56.21.9)", reason: "Bot Pattern Device Fingerprint Mismatch", status: "Flagged" },
];

const GEOLOCATION_FRAUD_RISK = [
  { region: "North America East", riskLevel: "Elevated", totalBlocks: 142, volume: "$48,500" },
  { region: "Europe West", riskLevel: "High", totalBlocks: 215, volume: "$82,100" },
  { region: "Asia Pacific", riskLevel: "Moderate", totalBlocks: 68, volume: "$18,400" },
  { region: "Latin America", riskLevel: "Moderate", totalBlocks: 54, volume: "$12,200" },
];

export default function FraudPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [ruleCreatedSuccess, setRuleCreatedSuccess] = useState(false);

  // New Rule Form State
  const [ruleName, setRuleName] = useState("High Value Proxy Block");
  const [minAmount, setMinAmount] = useState(1000);
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
      <PageHeader
        title="Fraud & Risk Prevention Watch"
        subtitle={`Suspicious transaction stream, ML risk scoring (0-100), and custom rule engine for ${selectedStore.name}`}
        icon={Shield}
        action={
          <button
            onClick={() => setIsRuleModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Create Custom Fraud Rule
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Fraud Prevented"
          value={`$${Math.round(148200 * mult).toLocaleString()}`}
          change="99.4% Block Accuracy"
          trend="up"
          icon={ShieldCheck}
          accentColor="emerald"
          subtitle="30-Day Protected Revenue"
        />
        <KpiCard
          title="Suspicious Txn Stream"
          value={Math.round(479 * mult).toString()}
          change="Real-time Stream"
          trend="down"
          icon={ShieldAlert}
          accentColor="rose"
          subtitle="Avg Risk Score: 84/100"
        />
        <KpiCard
          title="Proxy / VPN Interceptions"
          value={Math.round(214 * mult).toString()}
          change="+14% Bot Mitigation"
          trend="up"
          icon={Globe}
          accentColor="cyan"
          subtitle="Tor & Data Center IPs"
        />
        <KpiCard
          title="Chargeback Risk Index"
          value="0.12%"
          change="Far Below 0.9% Threshold"
          trend="up"
          icon={Lock}
          accentColor="indigo"
          subtitle="Visa/Mastercard SLA"
        />
      </div>

      {/* Grid: Suspicious Transaction Stream & Geolocation Risk Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Suspicious Transaction Stream */}
        <ChartCard
          title="Suspicious Transaction Stream"
          subtitle="High-frequency telemetry flagged by risk engines"
          className="lg:col-span-2"
          badge="Live Feed"
        >
          <div className="space-y-3 my-1">
            {SUSPICIOUS_TXNS.map((txn) => (
              <div
                key={txn.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-rose-600">{txn.id}</span>
                    <span className="font-mono font-extrabold text-slate-900">
                      ${Math.round(txn.amount * mult).toLocaleString()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        txn.status === "Blocked"
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {txn.status}
                    </span>
                  </div>
                  <div className="text-slate-800 font-semibold">{txn.reason}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{txn.loc}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-center p-2 bg-white border border-slate-200 rounded-xl min-w-[70px] shadow-xs">
                    <div className="text-[9px] text-slate-500 font-mono uppercase font-semibold">Risk Score</div>
                    <div className="text-lg font-extrabold text-rose-600 font-mono">{txn.riskScore}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Geolocation Fraud Heatmap / Regional Risk Breakdown */}
        <ChartCard
          title="Regional Fraud Risk Breakdown"
          subtitle="Interception metrics by global territory"
        >
          <div className="space-y-3 my-1">
            {GEOLOCATION_FRAUD_RISK.map((geo, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{geo.region}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      geo.riskLevel === "High"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {geo.riskLevel} Risk
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Blocked Volume: {geo.volume}</span>
                  <span className="text-rose-700 font-bold">{geo.totalBlocks} Blocks</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Visual Fraud Rule Builder Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2 text-indigo-600">
                <Shield className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Fraud Rule Builder</h3>
              </div>
              <button onClick={() => setIsRuleModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {ruleCreatedSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fraud rule deployed live to WAF firewall!
              </div>
            )}

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-800 font-bold mb-1">Rule Identifier</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 font-mono focus:border-indigo-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-800 font-bold mb-1">If Order Amount &gt; ($)</label>
                  <input
                    type="number"
                    value={minAmount}
                    onChange={(e) => setMinAmount(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 font-mono focus:border-indigo-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-800 font-bold mb-1">Action Triggered</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl p-2.5 font-mono focus:border-indigo-600 font-semibold"
                  >
                    <option value="Block">Immediate Block</option>
                    <option value="Review">Send to Manual Review</option>
                    <option value="Challenge">Trigger 3D-Secure 2.0</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600 space-y-1">
                <div className="text-slate-800 font-bold uppercase text-[10px]">Rule Condition Expression:</div>
                <div>
                  IF <span className="text-indigo-600 font-bold">Order.amount &gt; ${minAmount}</span> AND{" "}
                  <span className="text-indigo-600 font-bold">User.is_proxy == True</span> THEN{" "}
                  <span className="text-rose-600 font-bold">{actionType}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRuleModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-sm hover:bg-indigo-700"
                >
                  Deploy Fraud Rule Live
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
