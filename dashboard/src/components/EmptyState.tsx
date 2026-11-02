import React from "react";
import { Inbox, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  onReset?: () => void;
  resetText?: string;
  className?: string;
}

export default function EmptyState({
  title = "No data available",
  description = "No records match the current view or filter criteria.",
  icon: Icon = Inbox,
  action,
  onReset,
  resetText = "Reset filters",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`slate-card p-10 flex flex-col items-center justify-center text-center animate-fade-in ${className}`}
    >
      <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-slate-500">
        <Icon className="w-5 h-5 text-slate-400" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">
        {description}
      </p>
      {action ? (
        action
      ) : onReset ? (
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          {resetText}
        </button>
      ) : null}
    </div>
  );
}
