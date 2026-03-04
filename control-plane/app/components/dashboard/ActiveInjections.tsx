
import { usePrometheusMetrics, ChaosMetric } from "../../hooks/usePrometheusMetrics";
import { useChaosRules } from "../../hooks/useChaosRules";
import { AlertTriangle, Activity, Zap, PlayCircle, Clock, StopCircle, Trash2 } from "lucide-react";
import { Badge } from "../brum/ui/badge";
import { Card } from "../brum/ui/card";
import { Button } from "../brum/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export function ActiveInjections() {
    const { metrics, loading: metricsLoading, error: metricsError } = usePrometheusMetrics();
    const { rules, loading: rulesLoading, error: rulesError, disableRule, enableRule, deleteRule } = useChaosRules();
    const [togglingRules, setTogglingRules] = useState<Set<string>>(new Set());
    const [deletingRules, setDeletingRules] = useState<Set<string>>(new Set());

    const loading = metricsLoading || rulesLoading;
    const error = metricsError || rulesError;

    if (loading) return <div className="text-text-100">Loading metrics...</div>;
    if (error) return <div className="text-red-500">Error: {error}</div>;

    // Get all rules from chaos API
    const activeRulesFromAPI = Array.isArray(rules) ? rules : [];

    // Merge with metrics data if available
    const activeRules = activeRulesFromAPI.map(rule => {
        const metric = metrics.find(m => m.id === rule.id);
        return {
            ...rule,
            matched: metric?.matched || 0,
            triggered: metric?.triggered || 0,
            latency_total_ms: metric?.latency_total_ms || 0,
        };
    });

    // Global stats
    const totalInjected = activeRules.reduce((acc, m) => acc + (m.triggered || 0), 0);
    const totalLatency = activeRules.reduce((acc, m) => acc + (m.latency_total_ms || 0), 0);
    // Simple avg latency calculation (total / count)
    const avgLatency = totalInjected > 0 ? Math.round(totalLatency / totalInjected) : 0;

    // Calculate impact "score" roughly
    const impactScore = Math.min(100, Math.round((totalInjected * 10) + (avgLatency / 100)));

    const handleToggleRule = async (ruleId: string, ruleName: string, currentlyEnabled: boolean) => {
        setTogglingRules(prev => new Set(prev).add(ruleId));
        try {
            if (currentlyEnabled) {
                await disableRule(ruleId);
                toast.success(`Disabled rule: ${ruleName}`);
            } else {
                await enableRule(ruleId);
                toast.success(`Enabled rule: ${ruleName}`);
            }

            // Log activity
            fetch('/api/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: currentlyEnabled ? 'Disabled Rule' : 'Enabled Rule',
                    details: `${ruleName} (${ruleId})`
                })
            });
        } catch (e: any) {
            toast.error(`Failed to toggle rule: ${e.message}`);
        } finally {
            setTogglingRules(prev => {
                const next = new Set(prev);
                next.delete(ruleId);
                return next;
            });
        }
    };

    const handleDeleteRule = async (ruleId: string, ruleName: string) => {
        if (!confirm(`Are you sure you want to delete the rule "${ruleName}"?`)) return;

        setDeletingRules(prev => new Set(prev).add(ruleId));
        try {
            await deleteRule(ruleId);
            toast.success(`Deleted rule: ${ruleName}`);

            // Log activity
            fetch('/api/activity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'Deleted Rule',
                    details: `${ruleName} (${ruleId})`
                })
            });
        } catch (e: any) {
            toast.error(`Failed to delete rule: ${e.message}`);
        } finally {
            setDeletingRules(prev => {
                const next = new Set(prev);
                next.delete(ruleId);
                return next;
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* Global Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Active Rules"
                    value={activeRules.filter(r => r.enabled).length}
                    icon={<Zap className="w-5 h-5 text-yellow-500" />}
                    subtext="Running scenarios"
                />
                <StatCard
                    title="Latency Injected"
                    value={`${(totalLatency / 1000).toFixed(1)}s`}
                    icon={<Clock className="w-5 h-5 text-blue-500" />}
                    subtext="Total added delay"
                />
                <StatCard
                    title="Injections Triggered"
                    value={totalInjected}
                    icon={<PlayCircle className="w-5 h-5 text-green-500" />}
                    subtext="Requests affected"
                />
                <StatCard
                    title="System Impact"
                    value={`${impactScore}%`}
                    icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
                    subtext="Estimated load"
                    trend={impactScore > 50 ? 'high' : 'normal'}
                />
            </div>

            {/* Active Rules List */}
            <Card className="bg-panel-800 border-text-100/10 p-6">
                <h3 className="text-lg font-bold text-text-100 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-500 animate-pulse" />
                    Active Chaos Rules
                </h3>

                <div className="space-y-3">
                    {activeRules.length === 0 ? (
                        <p className="text-text-100/40 italic">No chaos rules defined.</p>
                    ) : (
                        activeRules.map(rule => (
                            <div
                                key={rule.id}
                                className={`p-4 rounded-lg border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${rule.enabled
                                    ? 'bg-panel-600 border-text-100/5 opacity-100'
                                    : 'bg-panel-600/50 border-text-100/5 opacity-60 grayscale-[0.5]'
                                    }`}
                            >
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-semibold text-lg text-text-100 tracking-tight">{rule.name || "Untitled Rule"}</h4>
                                        <Badge variant="outline" className="text-xs uppercase bg-text-100/5 border-text-100/10 text-text-100/70">
                                            {rule.action}
                                        </Badge>
                                        {!rule.enabled && (
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold bg-text-100/10 text-text-100/50 border-text-100/5">
                                                Disabled
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Selectors Display */}
                                    {rule.selectors && Object.keys(rule.selectors).length > 0 && (
                                        <div className="flex flex-wrap gap-2 items-center">
                                            <span className="text-xs text-text-100/40 uppercase tracking-wider font-semibold">Target:</span>
                                            {Object.entries(rule.selectors).map(([key, value]) => (
                                                <div key={key} className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-mono">
                                                    <span className="opacity-70">{key}:</span> {String(value)}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="text-[10px] font-mono text-text-100/30 flex items-center gap-2">
                                        <span>ID: {rule.id}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-auto mt-2 md:mt-0">
                                    {/* Metrics Group */}
                                    <div className="flex gap-2 mr-2">
                                        {rule.matched !== undefined && rule.matched > 0 && (
                                            <div className="flex flex-col items-center px-3 py-1 bg-yellow-500/5 rounded-md border border-yellow-500/10">
                                                <span className="text-lg font-bold text-yellow-500 leading-none">{rule.matched}</span>
                                                <span className="text-[9px] text-yellow-500/70 uppercase">Matched</span>
                                            </div>
                                        )}
                                        {rule.triggered !== undefined && rule.triggered > 0 && (
                                            <div className="flex flex-col items-center px-3 py-1 bg-red-500/5 rounded-md border border-red-500/10">
                                                <span className="text-lg font-bold text-red-500 leading-none">{rule.triggered}</span>
                                                <span className="text-[9px] text-red-500/70 uppercase">Trig.</span>
                                            </div>
                                        )}
                                        {(rule.latency_total_ms || 0) > 0 && (
                                            <div className="flex flex-col items-center px-3 py-1 bg-blue-500/5 rounded-md border border-blue-500/10">
                                                <span className="text-lg font-bold text-blue-400 leading-none">{(rule.latency_total_ms / 1000).toFixed(1)}s</span>
                                                <span className="text-[9px] text-blue-400/70 uppercase">Delay</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant={rule.enabled ? "destructive" : "default"}
                                            className={`h-9 px-4 ${!rule.enabled ? 'bg-green-600 hover:bg-green-700 text-text-100 border-none' : ''}`}
                                            onClick={() => handleToggleRule(rule.id, rule.name, rule.enabled)}
                                            disabled={togglingRules.has(rule.id) || deletingRules.has(rule.id)}
                                        >
                                            {rule.enabled ? <StopCircle className="w-4 h-4 mr-2" /> : <PlayCircle className="w-4 h-4 mr-2" />}
                                            {togglingRules.has(rule.id) ? '...' : (rule.enabled ? 'Disable' : 'Enable')}
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 w-9 p-0 border-text-100/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 text-text-100/40"
                                            onClick={() => handleDeleteRule(rule.id, rule.name)}
                                            disabled={togglingRules.has(rule.id) || deletingRules.has(rule.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}

function StatCard({ title, value, icon, subtext, trend }: any) {
    return (
        <Card className="bg-panel-800 border-text-100/10 p-5">
            <div className="flex justify-between items-start mb-2">
                <span className="text-text-100/60 text-sm font-medium">{title}</span>
                {icon}
            </div>
            <div className="text-3xl font-bold text-text-100 mb-1">{value}</div>
            <div className={`text-xs ${trend === 'high' ? 'text-red-400' : 'text-green-400'}`}>
                {subtext}
            </div>
        </Card>
    );
}
