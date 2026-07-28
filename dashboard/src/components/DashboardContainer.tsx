"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ScrollReset from "@/components/ScrollReset";
import { Menu } from "lucide-react";

export default function DashboardContainer({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col lg:flex-row">
            {/* Mobile Top Navbar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-5 z-[60] shadow-md">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                        R
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">Retail Hub</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
                    aria-label="Open Navigation Menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </header>

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden="true"
                />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Page Area */}
            <main className="flex-1 lg:ml-64 min-h-screen pt-20 lg:pt-6 pb-12 px-4 sm:px-6 lg:px-8 transition-all duration-300">
                <ScrollReset />
                <div className="max-w-[1600px] mx-auto bg-white rounded-2xl lg:rounded-3xl shadow-sm border border-slate-200/80 p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
