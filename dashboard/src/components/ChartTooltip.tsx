import React from "react";
import { THEME_COLORS } from "@/lib/theme";

interface ChartTooltipPayload {
  name?: string;
  value?: number | string;
  color?: string;
  fill?: string;
  dataKey?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayload[];
  label?: string;
  formatter?: (val: any) => string;
}

function getDotClass(color?: string) {
  if (color === THEME_COLORS.emerald || color === "#059669") return "bg-emerald-600";
  if (color === THEME_COLORS.amber || color === "#d97706") return "bg-amber-600";
  if (color === THEME_COLORS.rose || color === "#e11d48") return "bg-rose-600";
  if (color === THEME_COLORS.slate || color === "#64748b") return "bg-slate-500";
  return "bg-indigo-600";
}

export default function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: ChartTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-2.5 text-xs text-slate-800 pointer-events-none">
      {label && <div className="font-semibold text-slate-900 mb-1">{label}</div>}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          const color = entry.color || entry.fill || THEME_COLORS.indigo;
          const formattedValue =
            formatter && entry.value !== undefined
              ? formatter(entry.value)
              : typeof entry.value === "number"
              ? entry.value.toLocaleString("en-IN")
              : entry.value;

          return (
            <div key={`tooltip-item-${index}`} className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full inline-block flex-shrink-0 ${getDotClass(color)}`}
              />
              <span className="text-slate-500 font-medium">
                {entry.name || entry.dataKey}:
              </span>
              <span className="font-semibold text-slate-900 ml-auto">
                {formattedValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
