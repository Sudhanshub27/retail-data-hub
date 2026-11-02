"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Search,
  Upload,
  FileText,
  Bell,
  ChevronDown,
  Menu,
  Command,
  Store,
} from "lucide-react";
import { useStore, STORE_OPTIONS } from "@/context/StoreContext";

interface TopHeaderProps {
  onOpenMobileSidebar?: () => void;
}

export default function TopHeader({ onOpenMobileSidebar }: TopHeaderProps) {
  const {
    selectedStore,
    setSelectedStore,
    setIsCmdKOpen,
    setIsUploadOpen,
    setIsAlertConfigOpen,
    exportPdf,
    isExportingPdf,
  } = useStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header data-html2canvas-ignore="true" className="sticky top-0 z-[80] h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between transition-all">
      {/* Left: Mobile Menu Trigger + Brand + Store Selector */}
      <div className="flex items-center gap-3 lg:gap-6">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200 bg-white">
            <Image
              src="/logo.png"
              alt="Retail Data Hub Logo"
              width={36}
              height={36}
              className="object-contain"
              priority
            />
          </div>
          <div className="hidden sm:block">
            <span className="text-base font-semibold tracking-tight text-slate-900 font-sans">
              RETAIL<span className="text-indigo-600">HUB</span>
            </span>
          </div>
        </div>

        {/* Store Scope Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 hover:border-slate-300 transition-all"
          >
            <Store className="w-4 h-4 text-indigo-600" />
            <span className="max-w-[140px] sm:max-w-[220px] truncate">{selectedStore.name}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {isDropdownOpen && (
            <div
              className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-lg shadow-sm py-2 z-50 animate-slide-down"
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <div className="px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate-400 font-mono">
                Select Store Scope
              </div>
              {STORE_OPTIONS.map((store) => (
                <button
                  key={store.id}
                  onClick={() => {
                    setSelectedStore(store);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                    selectedStore.id === store.id
                      ? "bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div>{store.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{store.location}</div>
                  </div>
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-lg">
                    {store.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Omniprompt Search trigger */}
      <div className="hidden md:flex flex-1 max-w-md mx-6">
        <button
          onClick={() => setIsCmdKOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/60 border border-slate-200 rounded-lg text-xs text-slate-500 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
            <span>Search SKUs, Customers, Fraud flags, Anomalies...</span>
          </div>
          <span className="flex items-center gap-1 font-mono text-xs bg-white border border-slate-200 px-1.5 py-0.5 rounded-lg text-slate-600 font-medium">
            <Command className="w-3 h-3" /> K
          </span>
        </button>
      </div>

      {/* Right: Sync Status & Quick Action Hub */}
      <div className="flex items-center gap-2.5">
        {/* System Live Sync Status Pill (No pulsing animation or decorative badge) */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
          <span>Live Sync Active</span>
        </div>

        {/* Quick Action: Data Upload */}
        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Data Upload</span>
        </button>

        {/* Quick Action: Export PDF Report */}
        <button
          onClick={() => exportPdf()}
          disabled={isExportingPdf}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-medium transition-colors"
        >
          <FileText className="w-4 h-4 text-slate-600" />
          <span className="hidden sm:inline">
            {isExportingPdf ? "Generating..." : "Export PDF"}
          </span>
        </button>

        {/* Notifications Bell (No badge) */}
        <button
          onClick={() => setIsAlertConfigOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          title="Automated Alerts & Webhooks"
          aria-label="Alerts"
        >
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
