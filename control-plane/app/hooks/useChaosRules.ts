"use client";
import { useEffect, useState, useCallback } from 'react';

export interface ChaosRule {
    id: string;
    name: string;
    action: string;
    enabled: boolean;
    group?: string;
    probability?: number;
    phase?: string;
    action_params?: Record<string, any>;
    selectors?: Record<string, any>;
}

export interface ChaosRulesResponse {
    rules: ChaosRule[];
    ok: boolean;
    count: number;
}

export function useChaosRules(intervalMs: number = 3000) {
    const [rules, setRules] = useState<ChaosRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRules = useCallback(async () => {
        try {
            const res = await fetch('/api/chaos/rules');
            if (!res.ok) throw new Error("Failed to fetch rules");
            const data = await res.json();
            // Backend might return { rules: [...] } or just [...]
            const rulesArray = Array.isArray(data) ? data : (data.rules || []);
            setRules(Array.isArray(rulesArray) ? rulesArray : []);
            setError(null);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRules();
        const interval = setInterval(fetchRules, intervalMs);

        return () => {
            clearInterval(interval);
        };
    }, [fetchRules, intervalMs]);

    const disableRule = useCallback(async (ruleId: string) => {
        try {
            const res = await fetch(`/api/chaos/rules/${ruleId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'disable' }),
            });

            if (!res.ok) throw new Error("Failed to disable rule");
            const data = await res.json();

            // Refresh rules after disabling
            await fetchRules();

            return data;
        } catch (e: any) {
            console.error('Error disabling rule:', e);
            throw e;
        }
    }, [fetchRules]);

    const enableRule = useCallback(async (ruleId: string) => {
        try {
            const res = await fetch(`/api/chaos/rules/${ruleId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'enable' }),
            });

            if (!res.ok) throw new Error("Failed to enable rule");
            const data = await res.json();

            // Refresh rules after enabling
            await fetchRules();

            return data;
        } catch (e: any) {
            console.error('Error enabling rule:', e);
            throw e;
        }
    }, [fetchRules]);

    const deleteRule = useCallback(async (ruleId: string) => {
        try {
            const res = await fetch(`/api/chaos/rules/${ruleId}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error("Failed to delete rule");
            const data = await res.json();

            // Refresh rules after deleting
            await fetchRules();

            return data;
        } catch (e: any) {
            console.error('Error deleting rule:', e);
            throw e;
        }
    }, [fetchRules]);

    const deleteAllRules = useCallback(async () => {
        try {
            // If backend doesn't support DELETE /api/chaos/rules, we iterate
            // But let's assume we want to be safe and delete one by one or trust the loop
            const results = await Promise.all(rules.map(rule =>
                fetch(`/api/chaos/rules/${rule.id}`, { method: 'DELETE' })
            ));

            await fetchRules();
            return results;
        } catch (e) {
            console.error('Error killing all rules:', e);
            throw e;
        }
    }, [rules, fetchRules]);

    const disableRulesByCategory = useCallback(async (categoryId: string) => {
        const rulesToDelete = rules.filter(r => {
            const group = r.group;
            const action = r.action;

            switch (categoryId) {
                case 'latency': return action === 'latency';
                case 'network-tcp': return group === 'network' || ['tcp_reset', 'hang'].includes(action);
                case 'http-status': return group === 'http-errors' || ['http_status', 'rate_limit_429', 'stateful_rate_limit'].includes(action);
                case 'frontend-asset': return group === 'assets' || action === 'wrong_mime';
                case 'cors-csp': return group === 'cors-csp' || ['remove_cors', 'wrong_csp'].includes(action);
                case 'routing': return group === 'routing' || action === 'redirect_loop';
                default: return false;
            }
        });

        if (rulesToDelete.length === 0) return;

        try {
            await Promise.all(rulesToDelete.map(rule =>
                fetch(`/api/chaos/rules/${rule.id}`, { method: 'DELETE' })
            ));
            await fetchRules();
        } catch (e) {
            console.error(`Error disabling rules for category ${categoryId}:`, e);
            throw e;
        }
    }, [rules, fetchRules]);

    const getActiveRulesByAction = useCallback((action: string) => {
        return rules.filter(r => r.enabled && r.action === action);
    }, [rules]);

    const isCategoryActive = useCallback((categoryId: string) => {
        return rules.some(r => {
            if (!r.enabled) return false;

            const group = r.group;
            const action = r.action;

            switch (categoryId) {
                case 'latency': return action === 'latency';
                case 'network-tcp': return group === 'network' || ['tcp_reset', 'hang'].includes(action);
                case 'http-status': return group === 'http-errors' || ['http_status', 'rate_limit_429', 'stateful_rate_limit'].includes(action);
                case 'frontend-asset': return group === 'assets' || action === 'wrong_mime';
                case 'cors-csp': return group === 'cors-csp' || ['remove_cors', 'wrong_csp'].includes(action);
                case 'routing': return group === 'routing' || action === 'redirect_loop';
                default: return false;
            }
        });
    }, [rules]);

    return {
        rules,
        loading,
        error,
        disableRule,
        enableRule,
        deleteRule,
        deleteAllRules,
        disableRulesByCategory,
        getActiveRulesByAction,
        isCategoryActive,
        refreshRules: fetchRules
    };
}
