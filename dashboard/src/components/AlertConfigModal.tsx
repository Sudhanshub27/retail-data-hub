"use client";

import React, { useState } from "react";
import { Bell, Shield, Package, AlertTriangle, Send, CheckCircle2, X, Plus } from "lucide-react";
import { useStore } from "@/context/StoreContext";

interface AlertRule {
  id: string;
  name: string;
  category: "Inventory" | "Fraud" | "Revenue";
  condition: string;
  target: "Slack" | "Email" | "PagerDuty" | "Webhook";
  enabled: boolean;
}

export default function AlertConfigModal() {
  const { isAlertConfigOpen, setIsAlertConfigOpen } = useStore();
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [rules, setRules] = useState<AlertRule[]>([
    { id: "r1", name: "Low Inventory Stockout Risk", category: "Inventory", condition: "Stock Horizon < 7 Days", target: "Slack", enabled: true },
    { id: "r2", name: "High Velocity Fraud Spike", category: "Fraud", condition: "Risk Score > 85", target: "PagerDuty", enabled: true },
    { id: "r3", name: "Daily Revenue Outlier Anomaly", category: "Revenue", condition: "Deviation > 3.0 Sigma", target: "Email", enabled: true },
  ]);

  if (!isAlertConfigOpen) return null;

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsAlertConfigOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Automated Alerting & Webhooks
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Notifications for stockout drops, fraud spikes, and revenue anomalies
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAlertConfigOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-700 animate-slide-down">
              <CheckCircle2 className="w-4 h-4" /> Alert configuration saved successfully!
            </div>
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Trigger Rules ({rules.filter((r) => r.enabled).length}/{rules.length})
            </h3>
            <button className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs">
              <Plus className="w-3.5 h-3.5" /> Add New Trigger
            </button>
          </div>

          <div className="space-y-2.5">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className={`p-3.5 border rounded-xl flex items-center justify-between transition-all ${
                  rule.enabled
                    ? "bg-slate-50 border-slate-200"
                    : "bg-slate-50/40 border-slate-200/40 opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      rule.category === "Inventory"
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : rule.category === "Fraud"
                        ? "bg-rose-50 text-rose-600 border border-rose-100"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}
                  >
                    {rule.category === "Inventory" && <Package className="w-4 h-4" />}
                    {rule.category === "Fraud" && <Shield className="w-4 h-4" />}
                    {rule.category === "Revenue" && <AlertTriangle className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{rule.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Trigger: <span className="text-slate-800 font-semibold">{rule.condition}</span> • Target:{" "}
                      <span className="text-indigo-600 font-bold">{rule.target}</span>
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleRule(rule.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-indigo-600" /> Webhook Integration Settings
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">Slack Channel Webhook URL</label>
                <input
                  type="text"
                  readOnly
                  value="https://hooks.slack.com/services/T00/B00/XXXX"
                  className="w-full bg-white border border-slate-200 text-slate-600 rounded-lg p-2 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 block mb-1">PagerDuty Escalation Policy</label>
                <input
                  type="text"
                  readOnly
                  value="EP-RETAIL-CRITICAL-SEV1"
                  className="w-full bg-white border border-slate-200 text-slate-600 rounded-lg p-2 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => setIsAlertConfigOpen(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Save Alert Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
