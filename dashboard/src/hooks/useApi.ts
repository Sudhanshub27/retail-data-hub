"use client";

import { useState, useEffect, useCallback } from "react";
import { API_BASE } from "@/config";

export function useApi<T>(endpoint: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);

    const refetch = useCallback(() => {
        setTick((prev) => prev + 1);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(null);

        fetch(`${API_BASE}${endpoint}`, { signal: controller.signal })
            .then(async (res) => {
                if (!res.ok) {
                    throw new Error(`API error: ${res.status}`);
                }
                return res.json();
            })
            .then((json) => {
                if (json && typeof json === "object" && "error" in json) {
                    setError(String(json.error));
                    setData(null);
                } else {
                    setData(json);
                    setError(null);
                }
                setLoading(false);
            })
            .catch((err) => {
                if (err.name === "AbortError") return;
                setError(err.message || "Failed to fetch from backend");
                setData(null);
                setLoading(false);
            });

        return () => {
            controller.abort();
        };
    }, [endpoint, tick]);

    return { data, loading, error, refetch };
}
