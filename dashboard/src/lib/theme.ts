export const CHART_COLORS = [
  "#4f46e5", // indigo-600 (brand / primary)
  "#64748b", // slate-500 (neutral / secondary)
  "#059669", // emerald-600 (positive / target)
  "#d97706", // amber-600 (warning / caution)
  "#e11d48", // rose-600 (critical / alert)
] as const;

export const THEME_COLORS = {
  indigo: "#4f46e5",
  slate: "#64748b",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
} as const;

export const CHART_AXIS_PROPS = {
  stroke: "#94a3b8",
  tick: { fill: "#64748b", fontSize: 12 },
  tickLine: false,
} as const;

export const CHART_GRID_PROPS = {
  stroke: "#e2e8f0",
  strokeDasharray: "3 3",
  vertical: false,
} as const;
