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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 flex flex-col z-[70] transition-all duration-300 transform lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "w-20" : "w-64"}`}
    >
      {/* Mobile Header / Collapse Control */}
      <div className="p-3 border-b border-slate-100 flex items-center justify-between">
        {!isCollapsed && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono px-2">
            Navigation Console
          </span>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
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
        {/* CORE DASHBOARDS */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              CORE DASHBOARDS
            </div>
          )}
          <div className="space-y-1">
            <NavItem href="/" icon={LayoutDashboard} label="Overview" active={pathname === "/"} collapsed={isCollapsed} />
            <NavItem href="/sales" icon={ShoppingCart} label="Sales & Revenue" active={pathname === "/sales"} collapsed={isCollapsed} />
            <NavItem href="/customers" icon={Users} label="Customer Intelligence" active={pathname === "/customers"} collapsed={isCollapsed} />
          </div>
        </div>

        {/* OPERATIONS & SUPPLY CHAIN */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              OPERATIONS & SUPPLY CHAIN
            </div>
          )}
          <div className="space-y-1">
            <NavItem href="/inventory" icon={Package} label="Inventory & Stock" active={pathname === "/inventory"} collapsed={isCollapsed} />
            <NavItem href="/logistics" icon={Truck} label="Logistics & Shipping" active={pathname === "/logistics"} collapsed={isCollapsed} />
            <NavItem href="/market-basket" icon={Layers} label="Market Basket Analysis" active={pathname === "/market-basket"} collapsed={isCollapsed} />
          </div>
        </div>

        {/* PREDICTIVE & AI */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600"></span>
              PREDICTIVE & AI
            </div>
          )}
          <div className="space-y-1">
            <NavItem href="/forecast" icon={TrendingUp} label="Demand Forecasting" active={pathname === "/forecast"} collapsed={isCollapsed} />
            <NavItem href="/chat" icon={Brain} label="AI Assistant & SQL" active={pathname === "/chat"} collapsed={isCollapsed} />
          </div>
        </div>

        {/* GOVERNANCE & RISK */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
              GOVERNANCE & RISK
            </div>
          )}
          <div className="space-y-1">
            <NavItem
              href="/anomalies"
              icon={AlertTriangle}
              label="Anomaly Detection"
              active={pathname === "/anomalies"}
              collapsed={isCollapsed}
              badge="3 Active"
              badgeColor="bg-amber-50 text-amber-700 border border-amber-200"
            />
            <NavItem
              href="/fraud"
              icon={Shield}
              label="Fraud & Risk Watch"
              active={pathname === "/fraud"}
              collapsed={isCollapsed}
              badge="CRITICAL"
              badgeColor="bg-rose-50 text-rose-700 border border-rose-200"
            />
            <NavItem
              href="/live"
              icon={Radio}
              label="Real-time Event Stream"
              active={pathname === "/live"}
              collapsed={isCollapsed}
              pulseDot
            />
            <NavItem href="/data-quality" icon={Activity} label="Data Quality & Lineage" active={pathname === "/data-quality"} collapsed={isCollapsed} />
            <NavItem href="/tables" icon={Database} label="Raw Data Explorer" active={pathname === "/tables"} collapsed={isCollapsed} />
          </div>
        </div>
      </nav>

      {/* Footer status */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-100 bg-slate-50 text-center">
          <div className="text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            System Online & Synced
          </div>
        </div>
      )}
    </aside>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
  badge,
  badgeColor,
  pulseDot,
}: {
  href: string;
  icon: any;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  badge?: string;
  badgeColor?: string;
  pulseDot?: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-150 group ${
        active
          ? "bg-indigo-50 text-indigo-700 font-bold border-l-2 border-indigo-600 shadow-xs"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
      }`}
    >
      <Icon
        className={`w-4 h-4 flex-shrink-0 transition-colors ${
          active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700"
        }`}
      />
      {!collapsed && (
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className="text-xs tracking-tight truncate">{label}</span>
          {pulseDot && (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-600"></span>
            </span>
          )}
          {badge && (
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold ${badgeColor || "bg-slate-100 text-slate-700"}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
