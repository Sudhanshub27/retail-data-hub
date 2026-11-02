"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { LucideIcon } from "lucide-react";

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
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 animate-fade-in"
    >
      <div
        className="relative w-full max-w-lg bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col overflow-hidden max-h-[85vh] animate-scale-in"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <h2 id="modal-title" className="text-base font-semibold text-slate-900 tracking-tight">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500"
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
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: row.color }}
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
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${r.percentage}%`,
                      backgroundColor: r.color || "#4f46e5",
                    }}
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
