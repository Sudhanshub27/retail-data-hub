import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    action?: React.ReactNode;
}

export default function PageHeader({
    title,
    subtitle,
    icon: Icon,
    action,
}: PageHeaderProps) {
    return (
        <div className="mb-6 lg:mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 lg:gap-4">
                <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 flex-shrink-0 shadow-xs">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                        {title}
                    </h1>
                    <p className="text-sm text-slate-600 font-medium mt-0.5 leading-relaxed">
                        {subtitle}
                    </p>
                </div>
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
        </div>
    );
}
