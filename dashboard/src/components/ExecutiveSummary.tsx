"use client";

import { Sparkles, Brain } from "lucide-react";
import { useApi } from "@/hooks/useApi";

export default function ExecutiveSummary() {
  const { data, loading, error } = useApi<any>("/api/summary");

  if (loading) {
    return (
      <div className="slate-card p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-slate-200" />
          <div className="h-4 w-32 bg-slate-200 rounded-lg" />
        </div>
        <div className="space-y-3">
          <div className="h-3 w-full bg-slate-200 rounded-lg" />
          <div className="h-3 w-3/4 bg-slate-200 rounded-lg" />
          <div className="h-3 w-1/2 bg-slate-200 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !data || !data.insights) {
    return null;
  }

  const { insights, source } = data;
  const isAI = source === "gemini_pro" || source === "gemini_pro_vision";

  return (
    <div data-pdf-block="true" className="slate-card p-5 sm:p-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Executive Summary</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Retail Data Hub Intelligence</p>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
          isAI
            ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
            : "bg-slate-100 text-slate-700 border border-slate-200"
        }`}>
          <Sparkles className={`w-3.5 h-3.5 ${isAI ? "animate-pulse text-indigo-600" : "text-slate-500"}`} />
          <span>{isAI ? "AI Generated Insights" : "System Insights"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insights.map((insight: string, idx: number) => (
          <div
            key={idx}
            className="flex gap-3 items-start p-4 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
          >
            <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
            <p className="text-sm text-slate-800 leading-relaxed font-medium">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
