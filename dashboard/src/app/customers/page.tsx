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
import ChartTooltip from "@/components/ChartTooltip";
import EmptyState from "@/components/EmptyState";
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
import { CHART_COLORS, CHART_AXIS_PROPS, CHART_GRID_PROPS } from "@/lib/theme";
import { fmtCurrency, fmtNum } from "@/lib/format";

// Customer Behavior Segments (RFM based)
const BEHAVIOR_SEGMENTS = [
  { name: "Champions", count: 1420, percent: "18.5%", color: "border-emerald-200 bg-emerald-50 text-emerald-900", desc: "Bought recently, purchase frequently, spend the most" },
  { name: "Loyal Customers", count: 2150, percent: "28.0%", color: "border-indigo-200 bg-indigo-50 text-indigo-900", desc: "Regular repeat shoppers responsive to offers" },
  { name: "Potential Loyalists", count: 1890, percent: "24.6%", color: "border-indigo-200 bg-indigo-50/50 text-indigo-900", desc: "Recent buyers with steady purchase potential" },
  { name: "New Customers", count: 680, percent: "8.8%", color: "border-slate-200 bg-slate-100 text-slate-800", desc: "First-time buyers acquired within last 30 days" },
  { name: "Needs Attention", count: 820, percent: "10.7%", color: "border-amber-200 bg-amber-50 text-amber-900", desc: "Previously frequent spenders who have paused purchases" },
  { name: "At-Risk Customers", count: 340, percent: "4.4%", color: "border-rose-200 bg-rose-50 text-rose-900", desc: "Long absence gap with falling engagement (High Churn Risk)" },
  { name: "Infrequent Buyers", count: 210, percent: "2.7%", color: "border-slate-200 bg-slate-100 text-slate-800", desc: "Low spend and purchase history with extended dormancy" },
  { name: "Inactive Accounts", count: 170, percent: "2.3%", color: "border-slate-200 bg-slate-100 text-slate-600", desc: "No purchases in 180+ days (Lost customers)" },
];

const COHORT_RETENTION_DATA = [
  { month: "Month 1", cohort2025Q1: 100, cohort2025Q2: 100, cohort2025Q3: 100 },
  { month: "Month 2", cohort2025Q1: 78, cohort2025Q2: 82, cohort2025Q3: 85 },
  { month: "Month 3", cohort2025Q1: 64, cohort2025Q2: 69, cohort2025Q3: 74 },
  { month: "Month 4", cohort2025Q1: 58, cohort2025Q2: 63, cohort2025Q3: 68 },
  { month: "Month 5", cohort2025Q1: 52, cohort2025Q2: 59, cohort2025Q3: 64 },
  { month: "Month 6", cohort2025Q1: 49, cohort2025Q2: 56, cohort2025Q3: 61 },
];

const AT_RISK_ACCOUNTS = [
  { id: "CUST-9014", name: "High-Volume Wholesale LLC", segment: "Needs Attention", ltv: 4850000, riskScore: 92, lastOrderDays: 45 },
  { id: "CUST-3821", name: "Apex Retail Distribution", segment: "Needs Attention", ltv: 3210000, riskScore: 88, lastOrderDays: 38 },
  { id: "CUST-1049", name: "TechGear Direct Shopper", segment: "At-Risk", ltv: 1840000, riskScore: 84, lastOrderDays: 52 },
  { id: "CUST-7729", name: "OmniCorp Purchasing", segment: "Needs Attention", ltv: 1590000, riskScore: 79, lastOrderDays: 41 },
  { id: "CUST-5510", name: "Metro Cafe Chain HQ", segment: "At-Risk", ltv: 1240000, riskScore: 76, lastOrderDays: 60 },
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
      {/* 1. PageHeader */}
      <PageHeader
        title="Customer Intelligence & Retention"
        subtitle={`Customer retention cohorts, purchase habit segments, and drop-off intervention leaderboard for ${selectedStore.name}`}
      />

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-medium text-emerald-800 animate-slide-down">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {actionSuccess}
        </div>
      )}

      {/* 2. Row of KPI cards (max 4, grid-cols-1 sm:grid-cols-2 lg:grid-cols-4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Active Customers"
          value={fmtNum(Math.round(7680 * mult))}
          change="+12.4% YoY"
          trend="up"
          icon={Users}
          subtitle="Customers who placed an order in the last 90 days"
          sparklineData={[6200, 6500, 6800, 7100, 7300, 7500, 7680]}
        />
        <KpiCard
          title="Average Customer Value"
          value={fmtCurrency(Math.round(145000 * (0.9 + mult * 0.1)))}
          change="+6.8% expansion"
          trend="up"
          icon={UserCheck}
          subtitle="Average lifetime spending value per customer account"
          sparklineData={[120, 125, 130, 138, 140, 142, 145]}
        />
        <KpiCard
          title="Customer Inactivity Rate"
          value="4.2%"
          change="-0.8% reduction"
          trend="up"
          icon={TrendingDown}
          subtitle="Share of customer accounts lost monthly (Target < 5%)"
        />
        <KpiCard
          title="High-Risk Accounts"
          value={fmtNum(Math.round(340 * mult))}
          change="Action required"
          trend="down"
          icon={AlertTriangle}
          subtitle="Accounts showing a drop-off probability above 75%"
        />
      </div>

      {/* 3. Consistent 12-column grid with gap-6 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Customer Segments Matrix */}
        <div className="col-span-12">
          <ChartCard
            title="Customer Buying Behavior Groups"
            subtitle="Customer segmentation based on recent purchase date, order frequency, and total spend (RFM Matrix)"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-2">
              {BEHAVIOR_SEGMENTS.map((seg, idx) => (
                <div
                  key={idx}
                  className={`p-4 border rounded-lg transition-colors ${seg.color}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold">{seg.name}</span>
                    <span className="text-xs font-medium bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                      {seg.percent}
                    </span>
                  </div>
                  <div className="text-2xl font-semibold mt-2 tabular-nums">
                    {fmtNum(Math.round(seg.count * mult))}
                  </div>
                  <p className="text-xs opacity-80 mt-1 line-clamp-2 leading-relaxed">{seg.desc}</p>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Cohort Retention Curve */}
        <div className="col-span-12 lg:col-span-6">
          <ChartCard
            title="Monthly Customer Retention Rate"
            subtitle="Percentage of customer accounts that remain active over subsequent months"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={COHORT_RETENTION_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid {...CHART_GRID_PROPS} />
                  <XAxis dataKey="month" {...CHART_AXIS_PROPS} />
                  <YAxis
                    {...CHART_AXIS_PROPS}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<ChartTooltip formatter={(v) => `${v}%`} />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ fontSize: "12px", color: "#64748b" }}
                  />
                  <Line type="monotone" dataKey="cohort2025Q3" name="2025 Q3 Cohort" stroke={CHART_COLORS[2]} strokeWidth={2} dot={{ fill: CHART_COLORS[2] }} />
                  <Line type="monotone" dataKey="cohort2025Q2" name="2025 Q2 Cohort" stroke={CHART_COLORS[0]} strokeWidth={2} dot={{ fill: CHART_COLORS[0] }} />
                  <Line type="monotone" dataKey="cohort2025Q1" name="2025 Q1 Cohort" stroke={CHART_COLORS[1]} strokeWidth={2} dot={{ fill: CHART_COLORS[1] }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Churn Risk Leaderboard with Action Buttons */}
        <div className="col-span-12 lg:col-span-6">
          <ChartCard
            title="High Drop-off Risk Accounts"
            subtitle="Valuable accounts showing extended inactivity and recommended re-engagement options"
          >
            {AT_RISK_ACCOUNTS.length === 0 ? (
              <EmptyState title="No at-risk accounts" description="All high-value accounts have placed recent orders." />
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-72 pr-1">
                {AT_RISK_ACCOUNTS.map((cust) => (
                  <div
                    key={cust.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{cust.name}</span>
                        <span className="text-xs text-slate-500 font-mono">({cust.id})</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Lifetime Spend: <span className="text-emerald-700 font-medium">{fmtCurrency(Math.round(cust.ltv * mult))}</span> • Last Order:{" "}
                        <span className="text-amber-700 font-medium">{cust.lastOrderDays} days ago</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                        {cust.riskScore}% Risk
                      </span>

                      {/* Inline Re-engagement Action Buttons */}
                      <button
                        onClick={() => handleReengage(cust.id, "Send 15% VIP Offer")}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                        title="Send 15% VIP Discount Voucher"
                        aria-label="Send Discount"
                      >
                        <Gift className="w-3.5 h-3.5 text-indigo-600" />
                      </button>
                      <button
                        onClick={() => handleReengage(cust.id, "Assign Account Manager")}
                        className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
                        title="Assign Account Executive"
                        aria-label="Assign Manager"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
