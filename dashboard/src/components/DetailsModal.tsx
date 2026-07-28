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
    accentColor?: string;
    rows: DetailRow[];
    footer?: string;
}

export default function DetailsModal({
    open,
    onClose,
    title,
    icon: Icon,
    accentColor = "from-indigo-600 to-indigo-700",
    rows,
    footer,
}: DetailsModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [animateIn, setAnimateIn] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    /* Animate open */
    useEffect(() => {
        if (open) {
            setVisible(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setAnimateIn(true));
            });
        } else {
            setAnimateIn(false);
            const timer = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [open]);

    /* Close on Escape */
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!visible || !mounted) return null;

    return createPortal(
        <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose();
            }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
            style={{
                background: animateIn ? "rgba(15, 23, 42, 0.45)" : "rgba(0,0,0,0)",
                backdropFilter: animateIn ? "blur(8px)" : "blur(0px)",
                transition: "background 0.3s ease, backdrop-filter 0.3s ease",
            }}
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
                style={{
                    maxHeight: "85vh",
                    opacity: animateIn ? 1 : 0,
                    transform: animateIn ? "scale(1)" : "scale(0.96)",
                    transition: "opacity 0.25s cubic-bezier(0.16,1,0.3,1), transform 0.25s cubic-bezier(0.16,1,0.3,1)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 lg:p-6 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {Icon && (
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${accentColor} flex items-center justify-center text-white shadow-xs`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        )}
                        <h2 id="modal-title" className="text-lg lg:text-xl font-bold text-slate-900 tracking-tight">
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500"
                        aria-label="Close dialog"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 lg:p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
                    {rows.map((row, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                {row.color && (
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ background: row.color }}
                                    />
                                )}
                                <div>
                                    <p className="text-sm font-bold text-slate-800">
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
                                <p className="text-sm font-bold text-slate-900 tabular-nums">{row.value}</p>
                                {row.percentage !== undefined && (
                                    <p className="text-xs text-slate-500 font-bold mt-0.5 tabular-nums">
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
                                        className="h-full"
                                        style={{
                                            width: animateIn ? `${r.percentage}%` : "0%",
                                            background: r.color || "#6366f1",
                                            transition: `width 0.6s cubic-bezier(0.16,1,0.3,1) ${0.15 + i * 0.1}s`,
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
