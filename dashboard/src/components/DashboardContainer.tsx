"use client";

import React, { useState } from "react";
import TopHeader from "@/components/TopHeader";
import Sidebar from "@/components/Sidebar";
import CmdKModal from "@/components/CmdKModal";
import UploadModal from "@/components/UploadModal";
import AlertConfigModal from "@/components/AlertConfigModal";
import ScrollReset from "@/components/ScrollReset";
import { StoreProvider } from "@/context/StoreContext";

export default function DashboardContainer({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <StoreProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        {/* Top Executive Command Bar */}
        <TopHeader onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <div className="flex flex-1">
          {/* Mobile Sidebar Backdrop */}
          {isMobileSidebarOpen && (
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[90] lg:hidden animate-fade-in"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
          )}

          {/* Collapsible Sidebar */}
          <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

          {/* Main Dashboard Canvas Area */}
          <main
            id="dashboard-pdf-area"
            className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 transition-all duration-300 min-w-0"
          >
            <ScrollReset />
            <div className="max-w-[1680px] mx-auto space-y-6">
              {children}
            </div>
          </main>
        </div>

        {/* Global Modals */}
        <CmdKModal />
        <UploadModal />
        <AlertConfigModal />
      </div>
    </StoreProvider>
  );
}
