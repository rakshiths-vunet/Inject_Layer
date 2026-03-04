"use client";
import { useEffect, useState, useCallback } from 'react';

export type ServiceType = 'otp' | 'jwt';

export interface OtpChaosState {
    enabled: boolean;
    fail_percent: number;
    delay_ms: number;
    target_phones: string;
}

export interface JwtChaosState {
    enabled: boolean;
    mode: string;
    fail_percent: number;
    target_phones: string;
}

export type ServiceChaosState = OtpChaosState | JwtChaosState;

export function useServiceChaos(service: ServiceType, host: string, intervalMs: number = 4000) {
    const [state, setState] = useState<ServiceChaosState | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastResponse, setLastResponse] = useState<any>(null);

    const apiBase = `/api/services/${service}`;

    const fetchStatus = useCallback(async () => {
        const trimmedHost = host.trim();
        const url = trimmedHost ? `${apiBase}?host=${encodeURIComponent(trimmedHost)}` : apiBase;
        try {
            const res = await fetch(url, { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            setState(data);
            setLastResponse(data);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [service, host, apiBase]);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, intervalMs);
        return () => clearInterval(interval);
    }, [fetchStatus, intervalMs]);

    const send = useCallback(async (payload: Record<string, any>) => {
        const trimmedHost = host.trim();
        const url = trimmedHost ? `${apiBase}?host=${encodeURIComponent(trimmedHost)}` : apiBase;
        setSending(true);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            setLastResponse(data);
            setError(null);
            await fetchStatus();
            return data;
        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setSending(false);
        }
    }, [host, apiBase, fetchStatus]);

    return { state, loading, sending, error, lastResponse, refresh: fetchStatus, send };
}
