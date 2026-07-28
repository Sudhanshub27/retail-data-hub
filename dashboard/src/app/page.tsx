"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { PageSkeleton } from "@/components/Skeleton";
import {
    IndianRupee,
    ShoppingBag,
    Users,
    CreditCard,
} from "lucide-react";
import { LayoutDashboard } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ExecutiveSummary from "@/components/ExecutiveSummary";
import KpiCard from "@/components/KpiCard";
import ChartCard from "@/components/ChartCard";
import DetailsModal from "@/components/DetailsModal";
import LiveFeed from "@/components/LiveFeed";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const val = payload[0].value;
        const formatted =
            val >= 10000000
                ? `₹${(val / 10000000).toFixed(2)} Cr`
                : `₹${(val / 100000).toFixed(2)} Lakhs`;

        return (
            <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                <p className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">{label}</p>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="font-bold text-base text-white">{formatted}</span>
                </div>
            </div>
        );
    }
    return null;
};

function fmt(n: number): string {
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${n.toLocaleString("en-IN")}`;
}

function fmtNum(n: number): string {
    return n.toLocaleString("en-IN");
}

type ModalType = "revenue" | "orders" | "customers" | "aov" | null;

export default function OverviewPage() {
    const { data, loading } = useApi<any>("/api/overview");
    const { data: commercialData } = useApi<any>("/api/commercial");
    const { data: customerData } = useApi<any>("/api/customers");
    const [activeModal, setActiveModal] = useState<ModalType>(null);

    if (loading || !data) return <PageSkeleton />;

    const rev = data.revenue || {};
    const channelMix = (data.channel_mix || []).map((c: any) => ({
        name: c.channel === "POS" ? "POS (In-Store)" : "Web (Online)",
        value: c.revenue,
        pct: c.revenue_pct,
        transactions: c.transactions,
        units_sold: c.units_sold,
        color: c.channel === "POS" ? "#6366f1" : "#14b8a6",
    }));
    const monthlyTrend = (data.monthly_trend || []).map((m: any) => ({
        month: m.year_month,
        revenue: m.revenue,
    }));
    const customers = data.customers || {};

    /* ── Build modal row data ── */
    const revenueRows = (data.channel_mix || []).map((c: any) => ({
        label: c.channel === "POS" ? "POS (In-Store)" : "Web (Online)",
        value: fmt(c.revenue),
        subValue: `${fmtNum(c.transactions)} transactions`,
        color: c.channel === "POS" ? "#6366f1" : "#14b8a6",
        percentage: c.revenue_pct,
    }));

    const ordersRows = (data.channel_mix || []).map((c: any) => ({
        label: c.channel === "POS" ? "POS (In-Store)" : "Web (Online)",
        value: fmtNum(c.transactions),
        subValue: `${fmtNum(c.units_sold)} units · ${fmt(c.revenue)} revenue`,
        color: c.channel === "POS" ? "#6366f1" : "#14b8a6",
        percentage: c.revenue_pct,
    }));

    const totalCust = customers.total_unique_customers || 0;
    const oneTime = customers.one_time_buyers || 0;
    const repeatBuyers = customers.repeat_buyers || 0;
    const repeatPct = customers.repeat_rate_pct || 0;
    const oneTimePct = totalCust > 0 ? ((oneTime / totalCust) * 100) : 0;
    const customerRows = [
        {
            label: "Repeat Buyers",
            value: fmtNum(repeatBuyers),
            subValue: `${repeatPct.toFixed(1)}% repeat rate`,
            color: "#6366f1",
            percentage: repeatPct,
        },
        {
            label: "One-Time Buyers",
            value: fmtNum(oneTime),
            subValue: `${oneTimePct.toFixed(1)}% of total`,
            color: "#14b8a6",
            percentage: oneTimePct,
        },
    ];

    const aovRows = (data.channel_mix || []).map((c: any) => ({
        label: c.channel === "POS" ? "POS (In-Store)" : "Web (Online)",
        value: fmt(c.transactions > 0 ? c.revenue / c.transactions : 0),
        subValue: `Based on ${fmtNum(c.transactions)} transactions`,
        color: c.channel === "POS" ? "#6366f1" : "#14b8a6",
    }));

    const citySales = (commercialData?.city_sales || []).slice(0, 5);
    const revenueCityRows = citySales.map((c: any, i: number) => ({
        label: c.city,
        value: fmt(c.revenue),
        subValue: `${fmtNum(c.transactions)} txns · #${i + 1}`,
        color: ["#6366f1", "#3b82f6", "#14b8a6", "#ec4899", "#f59e0b"][i],
    }));

    return (
        <div className="space-y-6">
            <PageHeader
                icon={LayoutDashboard}
                title="Overview"
                subtitle="Your retail business at a glance — key metrics and trends"
            />

            <ExecutiveSummary />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
                <KpiCard
                    icon={IndianRupee}
                    title="Total Revenue"
                    value={fmt(rev.total_revenue || 0)}
                    change={`${(rev.total_transactions || 0).toLocaleString()} txns`}
                    trend="up"
                    accentColor="from-indigo-600 to-indigo-700"
                    subtitle="All time"
                    onClick={() => setActiveModal("revenue")}
                />
                <KpiCard
                    icon={ShoppingBag}
                    title="Total Orders"
                    value={(rev.total_transactions || 0).toLocaleString()}
                    change={`${(rev.total_units_sold || 0).toLocaleString()} units`}
                    trend="up"
                    accentColor="from-blue-600 to-indigo-600"
                    subtitle="All time"
                    onClick={() => setActiveModal("orders")}
                />
                <KpiCard
                    icon={Users}
                    title="Unique Customers"
                    value={(customers.total_unique_customers || 0).toLocaleString()}
                    change={`${customers.repeat_rate_pct || 0}% repeat`}
                    trend="up"
                    accentColor="from-teal-600 to-emerald-600"
                    subtitle="Active buyers"
                    onClick={() => setActiveModal("customers")}
                />
                <KpiCard
                    icon={CreditCard}
                    title="Avg Order Value"
                    value={fmt(rev.avg_transaction_value || 0)}
                    change="Per transaction"
                    trend="neutral"
                    accentColor="from-purple-600 to-pink-600"
                    subtitle="Across all channels"
                    onClick={() => setActiveModal("aov")}
                />
            </div>

            {/* ── Live Feed ── */}
            <div className="animate-slide-up" style={{ animationDelay: "0.05s" }}>
                <LiveFeed />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: "0.15s" }}>
                <ChartCard
                    title="Revenue Trend"
                    subtitle="Monthly revenue across all channels"
                    className="xl:col-span-2"
                >
                    <div className="h-64 lg:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyTrend}>
                                <defs>
                                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#64748b", fontSize: 11 }}
                                    tickFormatter={(v) => `₹${(v / 10000000).toFixed(0)}Cr`}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#6366f1"
                                    strokeWidth={2.5}
                                    fill="url(#revenueGrad)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <ChartCard title="Channel Mix" subtitle="POS vs Web revenue split">
                    <div className="h-64 lg:h-72 flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height="70%">
                            <PieChart>
                                <Pie
                                    data={channelMix}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                    activeShape={{ fillOpacity: 1 }}
                                >
                                    {channelMix.map((entry: any, index: number) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }: any) => {
                                        if (active && payload && payload.length) {
                                            const d = payload[0].payload;
                                            return (
                                                <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5" style={{ zIndex: 9999 }}>
                                                    <p className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{d.name}</p>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-slate-400 font-medium">Revenue</span>
                                                            <span className="font-bold text-white">{fmt(d.value)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-slate-400 font-medium">Share</span>
                                                            <span className="font-bold text-white">{d.pct}%</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="text-slate-400 font-medium">Transactions</span>
                                                            <span className="font-bold text-white">{fmtNum(d.transactions)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex gap-6 mt-2">
                            {channelMix.map((item: any) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full"
                                        style={{ background: item.color }}
                                    />
                                    <span className="text-xs text-slate-600 font-medium">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </ChartCard>
            </div>

            {/* ── Drill-Down Modals ── */}
            <DetailsModal
                open={activeModal === "revenue"}
                onClose={() => setActiveModal(null)}
                title="Revenue Breakdown"
                icon={IndianRupee}
                accentColor="from-indigo-600 to-indigo-700"
                rows={[...revenueRows, ...revenueCityRows]}
                footer="Revenue split by channel and top 5 cities"
            />

            <DetailsModal
                open={activeModal === "orders"}
                onClose={() => setActiveModal(null)}
                title="Orders Breakdown"
                icon={ShoppingBag}
                accentColor="from-blue-600 to-indigo-600"
                rows={ordersRows}
                footer="Orders split by POS (in-store) vs Web (online)"
            />

            <DetailsModal
                open={activeModal === "customers"}
                onClose={() => setActiveModal(null)}
                title="Customer Breakdown"
                icon={Users}
                accentColor="from-teal-600 to-emerald-600"
                rows={customerRows}
                footer="New vs returning customers across all channels"
            />

            <DetailsModal
                open={activeModal === "aov"}
                onClose={() => setActiveModal(null)}
                title="Avg Order Value by Channel"
                icon={CreditCard}
                accentColor="from-purple-600 to-pink-600"
                rows={aovRows}
                footer="Average transaction value per channel"
            />
        </div>
    );
}
