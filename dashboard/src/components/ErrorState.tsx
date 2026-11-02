import { WifiOff, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string | null;
  onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      <div className="w-12 h-12 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-600">
        <WifiOff className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">
        Failed to load data
      </h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm leading-relaxed">
        {message?.includes("Failed to fetch") || !message
          ? "The API server appears to be offline. Make sure the backend is running."
          : message}
      </p>
      <button
        onClick={onRetry ?? (() => window.location.reload())}
        className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry
      </button>
      <code className="mt-4 text-xs px-3 py-1.5 rounded-lg font-mono bg-slate-100 text-slate-600 border border-slate-200">
        ./scripts/api.sh
      </code>
    </div>
  );
}
