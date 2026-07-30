import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon: Icon,
  action,
  badge,
  badgeColor,
}: PageHeaderProps) {
  return (
    <div className="mb-6 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 shadow-xs text-indigo-600">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 font-sans">
              {title}
            </h1>
            {badge && (
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${
                  badgeColor || "bg-indigo-50 text-indigo-700 border border-indigo-200"
                }`}
              >
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
