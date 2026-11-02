import React from "react";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export default function PageHeader({
  title,
  subtitle,
  action,
}: PageHeaderProps) {
  return (
    <div data-pdf-block="true" className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-sans">
          {title}
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
          {subtitle}
        </p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
