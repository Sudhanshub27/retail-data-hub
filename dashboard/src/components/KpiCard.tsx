import React from "react";
import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  accentColor?: string; // e.g. "emerald", "indigo", "amber", "rose", "cyan"
  subtitle?: string;
  sparklineData?: number[];
  onClick?: () => void;
}

export default function KpiCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  accentColor = "indigo",
  subtitle,
  sparklineData,
  onClick,
}: KpiCardProps) {
  const isUp = trend === "up";
  const isDown = trend === "down";

  const trendBadge = isUp
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : isDown
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-slate-100 text-slate-600 border-slate-200";

  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const isClickable = !!onClick;

  // Domain Accent Glow & Icon styling for Light Theme
  const accentIconStyle =
    accentColor === "emerald"
      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
      : accentColor === "rose"
      ? "bg-rose-50 text-rose-600 border-rose-200"
      : accentColor === "amber"
      ? "bg-amber-50 text-amber-600 border-amber-200"
      : accentColor === "cyan"
      ? "bg-cyan-50 text-cyan-600 border-cyan-200"
      : "bg-indigo-50 text-indigo-600 border-indigo-200";

  return (
    <div
      className={`p-5 relative overflow-hidden bg-white border border-slate-200/80 rounded-2xl shadow-xs transition-all duration-200 ${
        isClickable
          ? "hover:border-slate-300 hover:shadow-md cursor-pointer group"
          : ""
      }`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${accentIconStyle}`}>
          <Icon className="w-4 h-4" />
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-[11px] font-semibold font-mono px-2 py-0.5 rounded-md border ${trendBadge}`}>
            <TrendIcon className="w-3 h-3" />
            <span>{change}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
          {title}
        </h3>
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight tabular-nums">
            {value}
          </p>

          {/* Mini Inline SVG Sparkline */}
          {sparklineData && sparklineData.length > 1 && (
            <div className="w-16 h-7 flex-shrink-0">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 60 20">
                <polyline
                  fill="none"
                  stroke={isDown ? "#e11d48" : "#059669"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparklineData
                    .map((val, idx) => {
                      const min = Math.min(...sparklineData);
                      const max = Math.max(...sparklineData);
                      const range = max - min || 1;
                      const x = (idx / (sparklineData.length - 1)) * 56 + 2;
                      const y = 18 - ((val - min) / range) * 14;
                      return `${x},${y}`;
                    })
                    .join(" ")}
                />
              </svg>
            </div>
          )}
        </div>

        {subtitle && (
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 font-medium pt-2 border-t border-slate-100">
            <span>{subtitle}</span>
            {isClickable && (
              <span className="text-indigo-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-[11px]">
                Inspect <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
