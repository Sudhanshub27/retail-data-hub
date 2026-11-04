"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { THEME_COLORS } from "@/lib/theme";

interface DetailRow {
  label: string;
  value: string;
  subValue?: string;
  color?: string;
  percentage?: number;
}

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: LucideIcon;
  rows: DetailRow[];
  footer?: string;
}

function getRowColorClass(c?: string) {
  if (c === THEME_COLORS.emerald || c === "#059669") return "bg-emerald-600";
  if (c === THEME_COLORS.amber || c === "#d97706") return "bg-amber-600";
  if (c === THEME_COLORS.rose || c === "#e11d48") return "bg-rose-600";
  if (c === THEME_COLORS.slate || c === "#64748b") return "bg-slate-500";
  return "bg-indigo-600";
}

function getWidthClass(pct?: number) {
  if (!pct || pct <= 0) return "w-0";
  if (pct >= 90) return "w-full";
  if (pct >= 75) return "w-3/4";
  if (pct >= 60) return "w-3/5";
  if (pct >= 50) return "w-1/2";
  if (pct >= 33) return "w-1/3";
  if (pct >= 25) return "w-1/4";
  if (pct >= 20) return "w-1/5";
  return "w-1/12";
}

export default function DetailsModal({
  open,
  onClose,
  title,
  icon: Icon,
  rows,
  footer,
}: DetailsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  /* Prevent background scroll when open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="details-modal-title"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden animate-scale-in flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <h2
              id="details-modal-title"
              className="text-base font-semibold text-slate-900"
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 lg:p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {row.color && (
                  <div
                    className={`w-3 h-3 rounded-full flex-shrink-0 ${getRowColorClass(row.color)}`}
                  />
                )}
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {row.label}
                  </p>
                  {row.subValue && (
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed">
                      {row.subValue}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 tabular-nums">{row.value}</p>
                {row.percentage !== undefined && (
                  <p className="text-xs text-slate-500 font-medium mt-0.5 tabular-nums">
                    {row.percentage.toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Progress bar */}
          {rows.length > 0 && rows.some((r) => r.percentage !== undefined) && (
            <div className="mt-4 h-2.5 rounded-full overflow-hidden flex bg-slate-100">
              {rows
                .filter((r) => r.percentage !== undefined)
                .map((r, i) => (
                  <div
                    key={i}
                    className={`h-full transition-all duration-300 ${getWidthClass(r.percentage)} ${getRowColorClass(r.color || THEME_COLORS.indigo)}`}
                  />
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-5 pt-3 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium text-center">{footer}</p>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
