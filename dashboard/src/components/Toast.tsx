"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const TOAST_STYLES = {
    success: {
        bg: "rgba(21,128,61,0.15)",
        border: "rgba(34,197,94,0.25)",
        iconColor: "#4ADE80",
        textColor: "#DCFCE7",
    },
    error: {
        bg: "rgba(153,27,27,0.15)",
        border: "rgba(239,68,68,0.25)",
        iconColor: "#F87171",
        textColor: "#FEE2E2",
    },
    info: {
        bg: "rgba(29,78,216,0.15)",
        border: "rgba(59,130,246,0.25)",
        iconColor: "#60A5FA",
        textColor: "#DBEAFE",
    },
};

const ICONS = { success: CheckCircle2, error: AlertCircle, info: Info };

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
        const duration = Math.max(3000, Math.min(message.length * 60, 8000));
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-[360px] w-full pointer-events-none px-4 sm:px-0">
                {toasts.map((toast) => {
                    const s = TOAST_STYLES[toast.type];
                    const ToastIcon = ICONS[toast.type];
                    return (
                        <div
                            key={toast.id}
                            className="pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-xl animate-slide-in-right"
                            style={{
                                background: s.bg,
                                border: `1px solid ${s.border}`,
                                backdropFilter: "blur(20px)",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <ToastIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: s.iconColor }} />
                                <p className="text-sm font-medium leading-snug" style={{ color: s.textColor }}>
                                    {toast.message}
                                </p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-0.5 rounded-md flex-shrink-0 transition-opacity hover:opacity-70"
                                style={{ color: s.iconColor }}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}
