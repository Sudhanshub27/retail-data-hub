"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Truck,
  Layers,
  TrendingUp,
  Brain,
  AlertTriangle,
  Shield,
  Radio,
  Activity,
  Database,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItemConfig {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface NavGroupConfig {
  title: string;
  items: NavItemConfig[];
}

const NAV_GROUPS: NavGroupConfig[] = [
  {
    title: "Overview",
    items: [
      { href: "/", label: "Overview", icon: LayoutDashboard },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/sales", label: "Sales & Revenue", icon: ShoppingCart },
      { href: "/customers", label: "Customer Intelligence", icon: Users },
      { href: "/forecast", label: "Demand Forecasting", icon: TrendingUp },
      { href: "/market-basket", label: "Market Basket Analysis", icon: Layers },
      { href: "/chat", label: "AI Assistant", icon: Brain },
    ],
  },
  {
    title: "Operations & Risk",
    items: [
      { href: "/inventory", label: "Inventory & Stock", icon: Package },
      { href: "/logistics", label: "Logistics & Shipping", icon: Truck },
      { href: "/anomalies", label: "Anomaly Detection", icon: AlertTriangle },
      { href: "/fraud", label: "Fraud Watch", icon: Shield },
      { href: "/live", label: "Real-time Stream", icon: Radio },
      { href: "/data-quality", label: "Data Quality & Lineage", icon: Activity },
      { href: "/tables", label: "Raw Data Explorer", icon: Database },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      data-html2canvas-ignore="true"
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 flex flex-col z-[70] transition-all duration-300 transform lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Mobile Header / Collapse Control */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400 font-mono px-2">
            Navigation
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto py-3 custom-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            {!isCollapsed && (
              <div className="px-2 mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                {group.title}
              </div>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    className={`relative flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="text-xs tracking-tight truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer status */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
          <div className="text-xs text-slate-500 font-medium">
            Retail Data Hub v1.0
          </div>
        </div>
      )}
    </aside>
  );
}
