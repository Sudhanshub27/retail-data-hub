"use client";

import {
  Brain,
  LayoutDashboard,
  ShoppingCart,
  Truck,
  Users,
  Package,
  Activity,
  TrendingUp,
  Database,
  Shield,
  AlertTriangle,
  Radio,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className={`fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-[100] transition-transform duration-300 transform lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/40 text-white">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Retail Hub</h1>
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest mt-0.5">Analytics System</p>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-6 overflow-y-auto py-2">
        <div>
          <div className="px-3 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-indigo-500 rounded-full" />
            Main Console
          </div>
          <div className="space-y-1">
            <NavItem href="/" icon={LayoutDashboard} label="Overview" active={pathname === "/"} />
            <NavItem href="/sales" icon={ShoppingCart} label="Sales Insights" active={pathname === "/sales"} />
            <NavItem href="/logistics" icon={Truck} label="Logistics" active={pathname === "/logistics"} />
            <NavItem href="/customers" icon={Users} label="Customers" active={pathname === "/customers"} />
            <NavItem href="/inventory" icon={Package} label="Inventory" active={pathname === "/inventory"} />
          </div>
        </div>

        <div>
          <div className="px-3 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-teal-500 rounded-full" />
            Real-Time
          </div>
          <div className="space-y-1">
            <NavItem href="/live" icon={Radio} label="Live Transactions" active={pathname === "/live"} />
          </div>
        </div>

        <div>
          <div className="px-3 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-emerald-500 rounded-full" />
            Intelligence
          </div>
          <div className="space-y-1">
            <NavItem href="/chat" icon={Brain} label="Retail Brain AI" active={pathname === "/chat"} />
            <NavItem href="/forecast" icon={TrendingUp} label="Forecasting" active={pathname === "/forecast"} />
            <NavItem href="/market-basket" icon={Activity} label="Product Analysis" active={pathname === "/market-basket"} />
          </div>
        </div>

        <div>
          <div className="px-3 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-rose-500 rounded-full" />
            Security
          </div>
          <div className="space-y-1">
            <NavItem href="/anomalies" icon={AlertTriangle} label="Anomaly Detection" active={pathname === "/anomalies"} />
            <NavItem href="/fraud" icon={Shield} label="Fraud Monitor" active={pathname === "/fraud"} />
          </div>
        </div>

        <div>
          <div className="px-3 mb-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <div className="w-1.5 h-3.5 bg-amber-500 rounded-full" />
            Infrastructure
          </div>
          <div className="space-y-1">
            <NavItem href="/tables" icon={Database} label="Data Explorer" active={pathname === "/tables"} />
            <NavItem href="/data-quality" icon={Activity} label="Data Health" active={pathname === "/data-quality"} />
          </div>
        </div>
      </nav>

      <div className="p-4 mt-auto border-t border-slate-800">
        <div className="text-[11px] font-medium text-slate-400 text-center">
          Retail Data Analytics Engine
        </div>
      </div>
    </aside>
  );
}

function NavItem({ href, icon: Icon, label, active }: { href: string; icon: any; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        active
          ? "bg-slate-800 text-white font-semibold shadow-xs"
          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
      }`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
      )}
      <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${active ? "text-indigo-400" : "text-slate-400 group-hover:text-slate-200"}`} />
      <span className="text-sm font-medium tracking-tight">{label}</span>
    </Link>
  );
}
