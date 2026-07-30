"use client";

import React, { useState } from "react";
import {
  Brain,
  AlertTriangle,
  Sparkles,
  Package,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ChartCard from "@/components/ChartCard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Legend,
} from "recharts";
import { useStore } from "@/context/StoreContext";

const FORECAST_BASE = [
  { day: "Day 1", actual: 420, predicted: 420, ci80Upper: 440, ci80Lower: 400, ci95Upper: 460, ci95Lower: 380 },
  { day: "Day 3", actual: 480, predicted: 475, ci80Upper: 500, ci80Lower: 450, ci95Upper: 520, ci95Lower: 430 },
  { day: "Day 7", actual: 510, predicted: 515, ci80Upper: 550, ci80Lower: 480, ci95Upper: 580, ci95Lower: 450 },
  { day: "Day 10", actual: null, predicted: 560, ci80Upper: 610, ci80Lower: 510, ci95Upper: 650, ci95Lower: 470 },
  { day: "Day 14", actual: null, predicted: 620, ci80Upper: 680, ci80Lower: 560, ci95Upper: 730, ci95Lower: 510 },
  { day: "Day 21", actual: null, predicted: 690, ci80Upper: 770, ci80Lower: 610, ci95Upper: 820, ci95Lower: 560 },
  { day: "Day 30", actual: null, predicted: 750, ci80Upper: 850, ci80Lower: 650, ci95Upper: 920, ci95Lower: 580 },
];

export default function ForecastPage() {
  const { selectedStore } = useStore();
  const mult = selectedStore.multiplier;

  // What-If Scenario Sliders
  const [priceChange, setPriceChange] = useState(0); // -20% to +20%
  const [promoDiscount, setPromoDiscount] = useState(10); // 0% to 30%
  const [marketingSpend, setMarketingSpend] = useState(25000); // $5k to $100k

  // Calculate dynamic demand modifier based on what-if scenario
  const elasticityFactor = 1 + (-priceChange * 0.015) + ((promoDiscount - 10) * 0.008) + (((marketingSpend - 25000) / 10000) * 0.05);

  const dynamicForecastData = FORECAST_BASE.map((item) => {
    const modPredicted = Math.round(item.predicted * elasticityFactor * mult);
    return {
      ...item,
      actual: item.actual !== null ? Math.round(item.actual * mult) : null,
      predicted: modPredicted,
      ci80Upper: Math.round(item.ci80Upper * elasticityFactor * mult),
      ci80Lower: Math.round(item.ci80Lower * elasticityFactor * mult),
      ci95Upper: Math.round(item.ci95Upper * elasticityFactor * mult),
      ci95Lower: Math.round(item.ci95Lower * elasticityFactor * mult),
    };
  });

  const projected30DayUnits = dynamicForecastData[dynamicForecastData.length - 1].predicted * 30;
  const projected30DayRev = Math.round(projected30DayUnits * 118.5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Demand Forecasting & Predictive Analytics"
        subtitle={`Predictive forecasting curves with confidence interval bands and scenario modeling for ${selectedStore.name}`}
        icon={Brain}
      />

      {/* Stockout Horizon Warning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-900">7-Day Stockout Horizon Risk</div>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                {Math.round(4 * mult)} SKUs Critical
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Reorder required within 48 hours</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-mono font-bold">
            HIGH RISK
          </span>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900">14-Day Stockout Horizon Risk</div>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                {Math.round(14 * mult)} SKUs Warning
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Lead time window closing</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-mono font-bold">
            MEDIUM RISK
          </span>
        </div>

        <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-100 rounded-xl text-cyan-700">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-cyan-900">30-Day Projected Demand</div>
              <div className="text-lg font-extrabold text-slate-900 font-mono mt-0.5">
                ${(projected30DayRev / 1000).toFixed(0)}k Projected Rev
              </div>
              <p className="text-[11px] text-slate-500 font-medium">High Model Accuracy</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 rounded-full text-[10px] font-mono font-bold">
            OPTIMAL
          </span>
        </div>
      </div>

      {/* Main Forecast Curve with 80% & 95% Confidence Intervals */}
      <ChartCard
        title="Demand Forecast Curve & Confidence Intervals"
        subtitle="Historical actual sales overlaid with predicted demand trajectory and uncertainty bands"
      >
        <div className="h-88 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dynamicForecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="ci95" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="ci80" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fill: "#475569", fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "0.75rem" }} />
              <Legend />

              {/* 95% CI Shaded Area */}
              <Area type="monotone" dataKey="ci95Upper" name="95% Upper Bound" stroke="none" fill="url(#ci95)" />
              <Area type="monotone" dataKey="ci95Lower" name="95% Lower Bound" stroke="none" fill="url(#ci95)" />

              {/* 80% CI Shaded Area */}
              <Area type="monotone" dataKey="ci80Upper" name="80% Upper Bound" stroke="none" fill="url(#ci80)" />

              {/* Forecast & Actual Lines */}
              <Line type="monotone" dataKey="predicted" name="Predicted Demand" stroke="#4f46e5" strokeWidth={3} dot={{ fill: "#4f46e5" }} />
              <Line type="monotone" dataKey="actual" name="Historical Sales" stroke="#059669" strokeWidth={3} dot={{ fill: "#059669" }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Interactive What-If Scenario Slider Controls */}
      <ChartCard
        title="What-If Scenario Simulator"
        subtitle="Simulate market price adjustments, discount rates, and marketing spend to recalculate demand"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-2">
          {/* Price Change Slider */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800">Retail Price Adjustment</span>
              <span className={`font-mono ${priceChange >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                {priceChange >= 0 ? `+${priceChange}%` : `${priceChange}%`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              value={priceChange}
              onChange={(e) => setPriceChange(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>-20% Discount</span>
              <span>Baseline 0%</span>
              <span>+20% Premium</span>
            </div>
          </div>

          {/* Promo Discount Slider */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800">Promo Campaign Discount</span>
              <span className="font-mono text-cyan-700">{promoDiscount}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={promoDiscount}
              onChange={(e) => setPromoDiscount(Number(e.target.value))}
              className="w-full accent-cyan-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0% Promo</span>
              <span>15% Standard</span>
              <span>30% Flash Sale</span>
            </div>
          </div>

          {/* Marketing Spend Slider */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-800">Ad Spend Allocation</span>
              <span className="font-mono text-emerald-700">${(marketingSpend / 1000).toFixed(0)}k</span>
            </div>
            <input
              type="range"
              min="5000"
              max="100000"
              step="5000"
              value={marketingSpend}
              onChange={(e) => setMarketingSpend(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>$5k Budget</span>
              <span>$50k Standard</span>
              <span>$100k Blitz</span>
            </div>
          </div>
        </div>

        {/* Dynamic Simulation Result Pill */}
        <div className="p-4 mt-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <div>
              <div className="text-xs font-bold text-indigo-900">Simulated Demand Elasticity Impact</div>
              <div className="text-sm text-slate-700 font-medium">
                Adjusted Demand Factor: <span className="font-mono text-emerald-700 font-bold">{(elasticityFactor * 100).toFixed(1)}%</span> vs baseline
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-500">Projected 30-Day Revenue</div>
            <div className="text-xl font-extrabold text-emerald-700 font-mono">${projected30DayRev.toLocaleString()}</div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
