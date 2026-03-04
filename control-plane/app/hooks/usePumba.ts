"use client";

import { useState, useCallback } from "react";

export interface PumbaContainer {
    id: string;
    name: string;
    image: string;
    status: string;
    state: string;
    ports: string;
    limits?: {
        cpus: string;
        memory_mb: string;
        memory_raw: number;
    };
}

interface PumbaState {
    containers: PumbaContainer[];
    loadingContainers: boolean;
    actionLoading: boolean;
    lastResponse: any;
    error: string | null;
}

export function usePumba(host: string) {
    const [state, setState] = useState<PumbaState>({
        containers: [],
        loadingContainers: false,
        actionLoading: false,
        lastResponse: null,
        error: null,
    });

    const fetchContainers = useCallback(async () => {
        setState(s => ({ ...s, loadingContainers: true, error: null }));
        try {
            const res = await fetch(`/api/pumba/containers?host=${host}`);
            const data = await res.json();
            const containers: PumbaContainer[] = Array.isArray(data.containers)
                ? data.containers
                : Array.isArray(data)
                    ? data
                    : [];
            setState(s => ({ ...s, containers, loadingContainers: false }));
        } catch (e: any) {
            setState(s => ({ ...s, error: e.message, loadingContainers: false }));
        }
    }, [host]);

    const runAction = useCallback(async (action: string, body: Record<string, any>) => {
        setState(s => ({ ...s, actionLoading: true, error: null }));
        try {
            const res = await fetch('/api/pumba/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ host, action, ...body }),
            });
            const data = await res.json();
            setState(s => ({ ...s, lastResponse: data, actionLoading: false }));
            if (!res.ok) throw new Error(data?.message || data?.error || 'Action failed');
            return data;
        } catch (e: any) {
            setState(s => ({ ...s, error: e.message, actionLoading: false }));
            throw e;
        }
    }, [host]);

    const checkHealth = useCallback(async () => {
        setState(s => ({ ...s, actionLoading: true, error: null }));
        try {
            const res = await fetch(`/api/pumba/action?host=${host}&action=health`);
            const data = await res.json();
            setState(s => ({ ...s, lastResponse: data, actionLoading: false }));
            return data;
        } catch (e: any) {
            setState(s => ({ ...s, error: e.message, actionLoading: false }));
            throw e;
        }
    }, [host]);

    return {
        ...state,
        fetchContainers,
        runAction,
        checkHealth,
    };
}
