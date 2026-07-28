import { TrendingUp, TrendingDown, Minus, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
    title: string;
    value: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
    icon: LucideIcon;
    accentColor?: string;
    subtitle?: string;
    onClick?: () => void;
}

export default function KpiCard({
    title,
    value,
    change,
    trend = "neutral",
    icon: Icon,
    accentColor = "from-indigo-500 to-purple-600",
    subtitle,
    onClick,
}: KpiCardProps) {
    const trendBadge =
        trend === "up"
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : trend === "down"
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : "bg-slate-100 text-slate-700 border-slate-200";

    const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
    const isClickable = !!onClick;

    return (
        <div
            className={`p-5 relative overflow-hidden group ${
                isClickable ? "saas-card-interactive" : "saas-card"
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
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center shadow-xs text-white`}>
                    <Icon className="w-5 h-5" />
                </div>
                {change && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${trendBadge}`}>
                        <TrendIcon className="w-3.5 h-3.5" />
                        <span>{change}</span>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</h3>
                <p className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
                {subtitle && (
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <span>{subtitle}</span>
                        {isClickable && (
                            <span className="text-indigo-600 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                Details <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
