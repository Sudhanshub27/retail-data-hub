"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/config";

const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory stale-while-revalidate cache

export function useApi<T>(endpoint: string) {
    const cached = apiCache.get(endpoint);
    const isValid = cached && (Date.now() - cached.timestamp < CACHE_TTL_MS);

    const [data, setData] = useState<T | null>(isValid ? cached.data : null);
    const [loading, setLoading] = useState(!isValid);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        if (!isValid) setLoading(true);

        fetch(`${API_BASE}${endpoint}`)
            .then((res) => {
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                return res.json();
            })
            .then((json) => {
                if (!cancelled) {
                    apiCache.set(endpoint, { data: json, timestamp: Date.now() });
                    setData(json);
                    setLoading(false);
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [endpoint, isValid]);

    return { data, loading, error };
}
