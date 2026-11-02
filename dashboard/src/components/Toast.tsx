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
    container: "bg-emerald-50 border-emerald-200 text-emerald-900",
    iconColor: "text-emerald-600",
  },
  error: {
    container: "bg-rose-50 border-rose-200 text-rose-900",
    iconColor: "text-rose-600",
  },
  info: {
    container: "bg-indigo-50 border-indigo-200 text-indigo-900",
    iconColor: "text-indigo-600",
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
      <div
        data-html2canvas-ignore="true"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-[360px] w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const s = TOAST_STYLES[toast.type];
          const ToastIcon = ICONS[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start justify-between gap-3 p-4 rounded-lg border shadow-sm animate-slide-up ${s.container}`}
            >
              <div className="flex items-start gap-3">
                <ToastIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${s.iconColor}`} />
                <p className="text-sm font-medium leading-snug">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-0.5 rounded-lg flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
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
  if (!context) {
    return {
      showToast: (message: string, type?: ToastType) => {
        console.log(`[Toast ${type || "info"}]: ${message}`);
      },
    };
  }
  return context;
}
