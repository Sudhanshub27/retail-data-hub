import React from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  badge?: string;
}

export default function ChartCard({
  title,
  subtitle,
  children,
  className = "",
  action,
  badge,
}: ChartCardProps) {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs transition-all ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            {badge && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
