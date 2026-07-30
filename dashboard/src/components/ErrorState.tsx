import { WifiOff, RefreshCw } from "lucide-react";

interface ErrorStateProps {
    message?: string | null;
    onRetry?: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-28 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.16)" }}>
                <WifiOff className="w-5 h-5" style={{ color: "#EF4444" }} />
            </div>
            <h3 className="text-[15px] font-semibold mb-2" style={{ color: "#FAFAFA" }}>
                Failed to load data
            </h3>
            <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: "#71717A" }}>
                {message?.includes("Failed to fetch") || !message
                    ? "The API server appears to be offline. Make sure the backend is running."
                    : message}
            </p>
            <button
                onClick={onRetry ?? (() => window.location.reload())}
                className="btn-primary"
            >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
            </button>
            <code className="mt-4 text-[11px] px-3 py-1.5 rounded-lg font-mono"
                style={{ background: "rgba(255,255,255,0.04)", color: "#52525B", border: "1px solid rgba(255,255,255,0.06)" }}>
                ./scripts/api.sh
            </code>
        </div>
    );
}
