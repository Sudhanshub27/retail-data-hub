"use client";

import React, { useState } from "react";
import {
  Users,
  UserCheck,
  AlertTriangle,
  UserPlus,
  Gift,
  CheckCircle2,
  TrendingDown,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useStore } from "@/context/StoreContext";

// 3x3 RFM Segments data
const RFM_SEGMENTS = [
  { name: "🏆 Champions", count: 1420, percent: "18.5%", color: "border-emerald-200 bg-emerald-50 text-emerald-900", desc: "Bought recently, buy often, spend most" },
  { name: "💎 Loyal Customers", count: 2150, percent: "28.0%", color: "border-indigo-200 bg-indigo-50 text-indigo-900", desc: "Buy regularly, responsive to promotions" },
  { name: "⭐ Potential Loyalists", count: 1890, percent: "24.6%", color: "border-cyan-200 bg-cyan-50 text-cyan-900", desc: "Recent buyers with average frequency" },
  { name: "🌱 New Customers", count: 680, percent: "8.8%", color: "border-teal-200 bg-teal-50 text-teal-900", desc: "Bought recently, low frequency" },
  { name: "⚠️ At-Risk Customers", count: 820, percent: "10.7%", color: "border-amber-200 bg-amber-50 text-amber-900", desc: "Spent big money, haven't bought recently" },
  { name: "🚨 High Churn Risk", count: 340, percent: "4.4%", color: "border-rose-200 bg-rose-50 text-rose-900", desc: "High recency gap, falling engagement" },
  { name: "😴 Hibernating", count: 210, percent: "2.7%", color: "border-slate-200 bg-slate-100 text-slate-800", desc: "Low spend, low frequency, high recency" },
  { name: "❌ Lost / Churned", count: 170, percent: "2.3%", color: "border-slate-200 bg-slate-100 text-slate-600", desc: "Lowest recency, frequency & monetary" },
];

const LTV_COHORT_DATA = [
  { month: "Month 1", cohort2025Q1: 100, cohort2025Q2: 100, cohort2025Q3: 100 },
  { month: "Month 2", cohort2025Q1: 78, cohort2025Q2: 82, cohort2025Q3: 85 },
  { month: "Month 3", cohort2025Q1: 64, cohort2025Q2: 69, cohort2025Q3: 74 },
  { month: "Month 4", cohort2025Q1: 58, cohort2025Q2: 63, cohort2025Q3: 68 },
  { month: "Month 5", cohort2025Q1: 52, cohort2025Q2: 59, cohort2025Q3: 64 },
  { month: "Month 6", cohort2025Q1: 49, cohort2025Q2: 56, cohort2025Q3: 61 },
];

const CHURN_LEADERBOARD = [
  { id: "CUST-9014", name: "High-Volume Wholesale LLC", segment: "At Risk", ltv: 48500, riskScore: 92, lastOrderDays: 45 },
  { id: "CUST-3821", name: "Apex Retail Distribution", segment: "At Risk", ltv: 32100, riskScore: 88, lastOrderDays: 38 },
  { id: "CUST-1049", name: "TechGear Direct Shopper", segment: "High Churn Risk", ltv: 18400, riskScore: 84, lastOrderDays: 52 },
  { id: "CUST-7729", name: "OmniCorp Purchasing", segment: "At Risk", ltv: 15900, riskScore: 79, lastOrderDays: 41 },
  { id: "CUST-5510", name: "Metro Cafe Chain HQ", segment: "High Churn Risk", ltv: 12400, riskScore: 76, lastOrderDays: 60 },
];

export default function CustomersPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleReengage = (custId: string, actionName: string) => {
    setActionSuccess(`Triggered "${actionName}" for customer ${custId}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Intelligence & RFM Segmentation"
        subtitle={`Cohort retention analysis, 3x3 RFM matrix grid, and churn mitigation leaderboard for ${selectedStore.name}`}
        icon={Users}
      />

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {actionSuccess}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Active Customers"
          value={Math.round(7680 * mult).toLocaleString()}
          change="+12.4% YoY"
          trend="up"
          icon={Users}
          accentColor="indigo"
          subtitle="90-Day Active Window"
        />
        <KpiCard
          title="Avg Customer LTV"
          value={`$${Math.round(1450 * (0.9 + mult * 0.1)).toLocaleString()}`}
          change="+6.8% expansion"
          trend="up"
          icon={UserCheck}
          accentColor="emerald"
          subtitle="12-Month Trailing LTV"
        />
        <KpiCard
          title="Avg Churn Rate"
          value="4.2%"
          change="-0.8% reduction"
          trend="up"
          icon={TrendingDown}
          accentColor="cyan"
          subtitle="Target < 5.0%"
        />
        <KpiCard
          title="High Risk Customers"
          value={Math.round(340 * mult).toString()}
          change="Requires Immediate Action"
          trend="down"
          icon={AlertTriangle}
          accentColor="rose"
          subtitle="Churn Risk Score > 75%"
        />
      </div>

      {/* 3x3 RFM Matrix Grid */}
      <ChartCard
        title="RFM Customer Segmentation Matrix"
        subtitle="Segmented by Recency, Frequency, and Monetary scoring algorithms"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-2">
          {RFM_SEGMENTS.map((seg, idx) => (
            <div
              key={idx}
              className={`p-4 border rounded-2xl transition-all duration-200 hover:shadow-md cursor-pointer ${seg.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{seg.name}</span>
                <span className="text-[10px] font-mono font-extrabold bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                  {seg.percent}
                </span>
              </div>
              <div className="text-2xl font-extrabold font-mono mt-2">
                {Math.round(seg.count * mult).toLocaleString()}
              </div>
              <p className="text-[11px] opacity-80 mt-1 line-clamp-2">{seg.desc}</p>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* Grid: Cohort Retention Curve & Churn Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LTV Cohort Retention Curve */}
        <ChartCard
          title="Customer Cohort Retention Curve"
          subtitle="Percentage of active purchasing customers retained month-over-month"
        >
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={LTV_COHORT_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(val: number) => [`${val}%`, ""]} contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0" }} />
                <Legend />
                <Line type="monotone" dataKey="cohort2025Q3" name="2025 Q3 Cohort" stroke="#059669" strokeWidth={3} dot={{ fill: "#059669" }} />
                <Line type="monotone" dataKey="cohort2025Q2" name="2025 Q2 Cohort" stroke="#4f46e5" strokeWidth={2} dot={{ fill: "#4f46e5" }} />
                <Line type="monotone" dataKey="cohort2025Q1" name="2025 Q1 Cohort" stroke="#0891b2" strokeWidth={2} dot={{ fill: "#0891b2" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Churn Risk Leaderboard with Action Buttons */}
        <ChartCard
          title="High Churn Risk Leaderboard (>75% Risk)"
          subtitle="Intervention suggestions for high-value accounts"
          badge="Action Required"
        >
          <div className="space-y-3 overflow-y-auto max-h-80 pr-1">
            {CHURN_LEADERBOARD.map((cust) => (
              <div
                key={cust.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{cust.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">({cust.id})</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    LTV: <span className="text-emerald-700 font-bold">${Math.round(cust.ltv * mult).toLocaleString()}</span> • Last Order:{" "}
                    <span className="text-amber-700 font-bold">{cust.lastOrderDays} days ago</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Risk {cust.riskScore}%
                  </span>

                  {/* Inline Re-engagement Action Buttons */}
                  <button
                    onClick={() => handleReengage(cust.id, "Send 15% VIP Discount")}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-indigo-600 text-slate-600 hover:text-white rounded-lg transition-colors shadow-xs"
                    title="Send 15% VIP Discount Voucher"
                  >
                    <Gift className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleReengage(cust.id, "Assign VIP Account Mgr")}
                    className="p-1.5 bg-white border border-slate-200 hover:bg-cyan-600 text-slate-600 hover:text-white rounded-lg transition-colors shadow-xs"
                    title="Assign Account Executive"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
