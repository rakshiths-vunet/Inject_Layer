"use client";
import { useState, useCallback, useEffect, useRef } from 'react';
import { useActivityLog } from './useActivityLog';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ToxiproxyService {
    id: string;
    label: string;
    icon: string;
    description: string;
}

export interface Toxic {
    name: string;
    type: string;
    stream: string;
    toxicity: number;
    attributes: Record<string, number>;
}

export interface ServiceStatus {
    service: string;
    label: string;
    proxy: any;
    toxics: Toxic[];
    enabled: boolean;
    reachable: boolean;
    error?: string;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToxiproxy(pollInterval = 8000, host = '10.1.92.124') {
    const [services, setServices] = useState<ToxiproxyService[]>([]);
    const [statusMap, setStatusMap] = useState<Record<string, ServiceStatus>>({});
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
    const { log } = useActivityLog();

    // helper: append host param to any API URL
    const withHost = (url: string) => `${url}${url.includes('?') ? '&' : '?'}host=${encodeURIComponent(host)}`;

    // Load service registry
    useEffect(() => {
        fetch('/api/chaos/toxiproxy')
            .then(r => r.json())
            .then(d => {
                setServices(d.services || []);
                if (d.services?.length) setSelectedService(d.services[0].id);
            })
            .catch(console.error);
    }, []);

    // Poll all service statuses
    const fetchAllStatuses = useCallback(async () => {
        if (!services.length) return;
        setLoading(false);
        const results = await Promise.allSettled(
            services.map(s =>
                fetch(withHost(`/api/chaos/toxiproxy/${s.id}`), { cache: 'no-store' }).then(r => r.json())
            )
        );
        const newMap: Record<string, ServiceStatus> = {};
        results.forEach((r, i) => {
            if (r.status === 'fulfilled') {
                newMap[services[i].id] = r.value;
            }
        });
        setStatusMap(prev => ({ ...prev, ...newMap }));
    }, [services]);

    // Initial + interval polling — re-run when host changes
    useEffect(() => {
        if (!services.length) return;
        fetchAllStatuses();
        const id = setInterval(fetchAllStatuses, pollInterval);
        return () => clearInterval(id);
    }, [fetchAllStatuses, pollInterval, services, host]);

    // ─── Actions ─────────────────────────────────────────────────────────────

    const setAction = (key: string, val: boolean) =>
        setActionLoading(prev => ({ ...prev, [key]: val }));

    const refreshService = useCallback(async (serviceId: string) => {
        const res = await fetch(withHost(`/api/chaos/toxiproxy/${serviceId}`), { cache: 'no-store' });
        const data = await res.json();
        setStatusMap(prev => ({ ...prev, [serviceId]: data }));
    }, [withHost]);

    const injectToxic = useCallback(async (serviceId: string, payload: Record<string, any>) => {
        const key = `inject-${serviceId}`;
        setAction(key, true);
        try {
            const res = await fetch(withHost(`/api/chaos/toxiproxy/${serviceId}/toxics`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            log({ service: serviceId, action: `Injected toxic: ${payload.name} (${payload.type})`, status: 'success' });
            await refreshService(serviceId);
            return data;
        } catch (err: any) {
            log({ service: serviceId, action: `Inject failed: ${err.message}`, status: 'error' });
            throw err;
        } finally {
            setAction(key, false);
        }
    }, [log, refreshService]);

    const updateToxic = useCallback(async (serviceId: string, toxicName: string, payload: Record<string, any>) => {
        const key = `update-${serviceId}-${toxicName}`;
        setAction(key, true);
        try {
            const res = await fetch(withHost(`/api/chaos/toxiproxy/${serviceId}/toxics/${toxicName}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            log({ service: serviceId, action: `Updated toxic: ${toxicName}`, status: 'success' });
            await refreshService(serviceId);
            return data;
        } catch (err: any) {
            log({ service: serviceId, action: `Update failed: ${err.message}`, status: 'error' });
            throw err;
        } finally {
            setAction(key, false);
        }
    }, [log, refreshService]);

    const deleteToxic = useCallback(async (serviceId: string, toxicName: string) => {
        const key = `delete-${serviceId}-${toxicName}`;
        setAction(key, true);
        try {
            const res = await fetch(withHost(`/api/chaos/toxiproxy/${serviceId}/toxics/${toxicName}`), { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            log({ service: serviceId, action: `Deleted toxic: ${toxicName}`, status: 'success' });
            await refreshService(serviceId);
        } catch (err: any) {
            log({ service: serviceId, action: `Delete failed: ${err.message}`, status: 'error' });
            throw err;
        } finally {
            setAction(key, false);
        }
    }, [log, refreshService]);

    const deleteAllToxics = useCallback(async (serviceId: string) => {
        const key = `deleteAll-${serviceId}`;
        setAction(key, true);
        try {
            const res = await fetch(withHost(`/api/chaos/toxiproxy/${serviceId}/toxics`), { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            log({ service: serviceId, action: `Cleared all toxics (${data.deleted} removed)`, status: 'success' });
            await refreshService(serviceId);
        } catch (err: any) {
            log({ service: serviceId, action: `Clear all failed: ${err.message}`, status: 'error' });
            throw err;
        } finally {
            setAction(key, false);
        }
    }, [log, refreshService]);

    const toggleService = useCallback(async (serviceId: string, enabled: boolean) => {
        const key = `toggle-${serviceId}`;
        setAction(key, true);
        try {
            // When DISABLING: delete all toxics first so the service comes back
            // clean when re-enabled — otherwise all toxics would instantly reapply.
            if (!enabled) {
                const toxicsRes = await fetch(
                    withHost(`/api/chaos/toxiproxy/${serviceId}/toxics`),
                    { method: 'DELETE' }
                );
                // Log but don't throw — still proceed with the disable even if
                // there were no toxics to delete (204 / empty response is fine).
                if (toxicsRes.ok) {
                    log({ service: serviceId, action: 'Cleared all toxics before disable', status: 'success' });
                }
            }

            const res = await fetch(withHost(`/api/chaos/toxiproxy/${serviceId}`), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
            log({
                service: serviceId,
                action: enabled ? 'Service re-enabled' : '⚠ Service DISABLED — all toxics cleared',
                status: enabled ? 'success' : 'warning',
            });
            await refreshService(serviceId);
        } catch (err: any) {
            log({ service: serviceId, action: `Toggle failed: ${err.message}`, status: 'error' });
            throw err;
        } finally {
            setAction(key, false);
        }
    }, [log, refreshService, withHost]);


    return {
        services,
        statusMap,
        selectedService,
        setSelectedService,
        loading,
        actionLoading,
        injectToxic,
        updateToxic,
        deleteToxic,
        deleteAllToxics,
        toggleService,
        refreshService,
        fetchAllStatuses,
    };
}
