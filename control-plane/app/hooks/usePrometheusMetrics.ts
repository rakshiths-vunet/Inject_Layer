
"use client";
import { useEffect, useState, useCallback } from 'react';

export interface ChaosMetric {
    id: string;
    name: string;
    matched: number;
    triggered: number;
    latency_total_ms: number;
}

export function usePrometheusMetrics(intervalMs: number = 2000) {
    const [metrics, setMetrics] = useState<ChaosMetric[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchMetrics = async () => {
            try {
                const res = await fetch('/api/metrics/chaos');
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                if (mounted) {
                    setMetrics(data);
                    setError(null);
                }
            } catch (e: any) {
                if (mounted) setError(e.message);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, intervalMs);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [intervalMs]);

    const getGlobalStats = useCallback(() => {
        const activeRules = metrics.filter(m => m.matched > 0 || m.triggered > 0);
        const totalLatency = activeRules.reduce((acc, m) => acc + m.latency_total_ms, 0);
        const totalInjected = activeRules.reduce((acc, m) => acc + m.triggered, 0);

        const errorRules = activeRules.filter(m => m.id.includes('error') || m.id.includes('500') || m.id.includes('503'));
        const errorCount = errorRules.reduce((acc, m) => acc + m.triggered, 0);
        const errorRate = totalInjected > 0 ? Math.round((errorCount / totalInjected) * 100) : 0;

        return {
            activeRulesCount: activeRules.length,
            latencyInjected: totalLatency,
            injectionCount: totalInjected,
            errorRate: errorRate
        };
    }, [metrics]);

    const isCategoryActive = useCallback((categoryId: string) => {
        const prefixMap: Record<string, string> = {
            'latency': 'lat-',
            'network': 'net-',
            'http-status': 'http-',
            'asset-failure': 'asset-',
            'auth': 'auth-',
        };

        const prefix = prefixMap[categoryId];
        if (!prefix) return false;

        return metrics.some(m => m.id.startsWith(prefix) && (m.matched > 0 || m.triggered > 0));
    }, [metrics]);

    return { metrics, loading, error, getGlobalStats, isCategoryActive };
}
