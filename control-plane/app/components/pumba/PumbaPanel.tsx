"use client";

import { useEffect, useState } from "react";
import { Activity, Cpu, MemoryStick, Power, RefreshCw, RotateCcw, Play, Square, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, ServerCrash } from "lucide-react";
import { toast } from "sonner";
import { usePumba, PumbaContainer } from "../../hooks/usePumba";


const PUMBA_HOSTS = ['10.1.92.124', '10.1.92.127', '10.1.92.129'] as const;
type PumbaHost = typeof PUMBA_HOSTS[number];

// ─── Container Selector ────────────────────────────────────────────────────────

function ContainerSelect({
    containers,
    value,
    onChange,
    loading,
}: {
    containers: PumbaContainer[];
    value: string;
    onChange: (v: string) => void;
    loading: boolean;
}) {
    const running = containers.filter(c => c.state === 'running');
    const selectedContainer = containers.find(c => c.name === value);

    return (
        <div className="space-y-2">
            <div className="relative">
                <select
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    disabled={loading}
                    className="w-full h-10 pl-3 pr-8 rounded-lg bg-panel-700 border border-text-100/10 text-sm font-mono text-text-100 focus:outline-none focus:border-accent-500/50 appearance-none disabled:opacity-40"
                >
                    <option value="">-- select container --</option>
                    {Array.from(new Set(running.map(c => c.slackName))).sort().map(slack => (
                        <optgroup key={slack} label={slack.toUpperCase()}>
                            {running
                                .filter(c => c.slackName === slack)
                                .map(c => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                        </optgroup>
                    ))}
                </select>
                <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-text-100/40 pointer-events-none" />
            </div>
            {selectedContainer?.limits && (
                <div className="flex items-center gap-3 px-1 text-[10px] font-mono text-text-100/40">
                    <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        {selectedContainer.limits.cpus} CPUs
                    </span>
                    <span className="flex items-center gap-1">
                        <MemoryStick className="w-3 h-3" />
                        {selectedContainer.limits.memory_mb === 'unlimited' ? 'Unl.' : `${selectedContainer.limits.memory_mb} MB`}
                    </span>
                </div>
            )}
        </div>
    );
}

// ─── Number Input ──────────────────────────────────────────────────────────────

function NumberInput({ label, value, onChange, min = 1, unit }: {
    label: string; value: number; onChange: (n: number) => void; min?: number; unit?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-100/60">{label}</label>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min={min}
                    value={value}
                    onChange={e => onChange(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg bg-panel-700 border border-text-100/10 text-sm font-mono text-text-100 focus:outline-none focus:border-accent-500/50"
                />
                {unit && <span className="text-xs text-text-100/40 whitespace-nowrap">{unit}</span>}
            </div>
        </div>
    );
}

// ─── Response Panel ────────────────────────────────────────────────────────────

function ResponsePanel({ data }: { data: any }) {
    const [open, setOpen] = useState(false);
    if (!data) return null;
    return (
        <div className="mt-4 border border-text-100/10 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-2.5 bg-text-100/[0.02] hover:bg-text-100/[0.04] text-xs text-text-100/40 font-mono transition-colors">
                <span>last response</span>
                {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {open && (
                <pre className="px-4 py-3 text-[11px] font-mono text-green-400/80 bg-black/30 overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
}

// ─── CPU Stress Card ──────────────────────────────────────────────────────────

function CpuStressCard({ containers, loading, actionLoading, onAction }: {
    containers: PumbaContainer[];
    loading: boolean;
    actionLoading: boolean;
    onAction: (action: string, body: any) => Promise<any>;
}) {
    const [container, setContainer] = useState('');
    const [workers, setWorkers] = useState(2);
    const [duration, setDuration] = useState(60);
    const [lastResponse, setLastResponse] = useState<any>(null);

    const handleSubmit = async () => {
        if (!container) return toast.error('Select a container');
        try {
            const res = await onAction('stress/cpu', { container, workers, duration });
            setLastResponse(res);
            toast.success('CPU stress injected');
        } catch (e: any) {
            toast.error(e.message || 'Failed to inject CPU stress');
        }
    };

    return (
        <div className="rounded-2xl bg-panel-800 border border-panel-600/50 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-text-100">CPU Stress</h3>
                    <p className="text-xs text-text-100/40">Inject high CPU load into a container</p>
                </div>
            </div>

            <ContainerSelect containers={containers} value={container} onChange={setContainer} loading={loading} />

            <div className="grid grid-cols-2 gap-3">
                <NumberInput label="Workers" value={workers} onChange={setWorkers} min={1} unit="threads" />
                <NumberInput label="Duration" value={duration} onChange={setDuration} min={1} unit="seconds" />
            </div>

            <button
                onClick={handleSubmit}
                disabled={actionLoading || !container}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-orange-500/30 bg-orange-500/10 text-orange-300 font-bold text-sm hover:bg-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
                Inject CPU Stress
            </button>

            <ResponsePanel data={lastResponse} />
        </div>
    );
}

// ─── Memory Stress Card ───────────────────────────────────────────────────────

function MemoryStressCard({ containers, loading, actionLoading, onAction }: {
    containers: PumbaContainer[];
    loading: boolean;
    actionLoading: boolean;
    onAction: (action: string, body: any) => Promise<any>;
}) {
    const [container, setContainer] = useState('');
    const [memoryMb, setMemoryMb] = useState(500);
    const [duration, setDuration] = useState(30);
    const [lastResponse, setLastResponse] = useState<any>(null);

    const handleSubmit = async () => {
        if (!container) return toast.error('Select a container');
        try {
            const res = await onAction('stress/memory', { container, memory_mb: memoryMb, duration });
            setLastResponse(res);
            toast.success('Memory stress injected');
        } catch (e: any) {
            toast.error(e.message || 'Failed to inject memory stress');
        }
    };

    return (
        <div className="rounded-2xl bg-panel-800 border border-panel-600/50 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <MemoryStick className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-text-100">Memory Stress</h3>
                    <p className="text-xs text-text-100/40">Allocate RAM inside a container</p>
                </div>
            </div>

            <ContainerSelect containers={containers} value={container} onChange={setContainer} loading={loading} />

            <div className="grid grid-cols-2 gap-3">
                <NumberInput label="Memory" value={memoryMb} onChange={setMemoryMb} min={1} unit="MB" />
                <NumberInput label="Duration" value={duration} onChange={setDuration} min={1} unit="seconds" />
            </div>

            <button
                onClick={handleSubmit}
                disabled={actionLoading || !container}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-300 font-bold text-sm hover:bg-purple-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MemoryStick className="w-4 h-4" />}
                Inject Memory Stress
            </button>

            <ResponsePanel data={lastResponse} />
        </div>
    );
}

// ─── Lifecycle Card ───────────────────────────────────────────────────────────

function LifecycleCard({ containers, loading, actionLoading, onAction }: {
    containers: PumbaContainer[];
    loading: boolean;
    actionLoading: boolean;
    onAction: (action: string, body: any) => Promise<any>;
}) {
    const [container, setContainer] = useState('');
    const [lastResponse, setLastResponse] = useState<any>(null);

    const doAction = async (action: 'restart' | 'stop' | 'start') => {
        if (!container) return toast.error('Select a container');
        try {
            const res = await onAction(action, { container });
            setLastResponse(res);
            toast.success(`Container ${action} sent`);
        } catch (e: any) {
            toast.error(e.message || `Failed to ${action} container`);
        }
    };

    return (
        <div className="rounded-2xl bg-panel-800 border border-panel-600/50 p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Power className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-text-100">Container Lifecycle</h3>
                    <p className="text-xs text-text-100/40">Restart, stop, or start any container</p>
                </div>
            </div>

            <ContainerSelect containers={containers} value={container} onChange={setContainer} loading={loading} />

            <div className="grid grid-cols-3 gap-2">
                <button
                    onClick={() => doAction('restart')}
                    disabled={actionLoading || !container}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 font-bold text-xs hover:bg-yellow-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                    Restart
                </button>
                <button
                    onClick={() => doAction('stop')}
                    disabled={actionLoading || !container}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 font-bold text-xs hover:bg-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
                    Stop
                </button>
                <button
                    onClick={() => doAction('start')}
                    disabled={actionLoading || !container}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-300 font-bold text-xs hover:bg-green-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    Start
                </button>
            </div>

            <ResponsePanel data={lastResponse} />
        </div>
    );
}

// ─── Container Table ─────────────────────────────────────────────────────────

function ContainerTable({ containers }: { containers: PumbaContainer[] }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="rounded-xl border border-text-100/10 overflow-hidden">
            <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-3.5 bg-text-100/[0.02] hover:bg-text-100/[0.04] transition-colors">
                <span className="text-xs font-bold text-text-100/50 uppercase tracking-wider">
                    All Containers ({containers.length})
                </span>
                {open ? <ChevronUp className="w-4 h-4 text-text-100/30" /> : <ChevronDown className="w-4 h-4 text-text-100/30" />}
            </button>
            {open && (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono">
                        <thead>
                            <tr className="border-b border-text-100/10 text-text-100/30 uppercase tracking-wider text-[10px]">
                                <th className="text-left px-4 py-2">Name</th>
                                <th className="text-left px-4 py-2">Image</th>
                                <th className="text-left px-4 py-2">Limits (CPU/Mem)</th>
                                <th className="text-left px-4 py-2">State</th>
                                <th className="text-left px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {containers.map(c => (
                                <tr key={c.id} className="border-b border-text-100/10 hover:bg-text-100/[0.02]">
                                    <td className="px-4 py-2 text-text-100">
                                        <div className="flex flex-col">
                                            <span>{c.name}</span>
                                            <span className="text-[9px] text-accent-500/50 uppercase font-bold">{c.slackName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-text-100/40 truncate max-w-[200px]">{c.image}</td>
                                    <td className="px-4 py-2 text-text-100/40 truncate max-w-[120px]">
                                        {c.limits ? `${c.limits.cpus} / ${c.limits.memory_mb === 'unlimited' ? 'Unl.' : c.limits.memory_mb + 'MB'}` : '-'}
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.state === 'running' ? 'bg-green-500/10 text-green-400' :
                                            c.state === 'exited' ? 'bg-red-500/10 text-red-400' :
                                                'bg-yellow-500/10 text-yellow-400'
                                            }`}>
                                            {c.state}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-text-100/40">{c.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Main PumbaPanel ──────────────────────────────────────────────────────────

export function PumbaPanel() {
    const [host, setHost] = useState<PumbaHost>('10.1.92.124');
    const [selectedSlack, setSelectedSlack] = useState<string | null>(null);
    const { containers, loadingContainers, actionLoading, lastResponse, error, fetchContainers, runAction, checkHealth } = usePumba(host);

    const slacks = Array.from(new Set(containers.map(c => c.slackName))).sort();
    const filteredContainers = selectedSlack
        ? containers.filter(c => c.slackName === selectedSlack)
        : containers;

    useEffect(() => {
        fetchContainers();
    }, [fetchContainers]);

    const handleHealth = async () => {
        try {
            const res = await checkHealth();
            toast.success(`Health: ${res?.status || 'ok'}`);
        } catch (e: any) {
            toast.error(e.message || 'Health check failed');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Top bar: host selector + health check */}
            <div className="flex items-center gap-4 rounded-xl bg-panel-800 border border-panel-600/50 px-5 py-3.5">
                <span className="text-xs font-bold text-text-100/40 uppercase tracking-widest whitespace-nowrap">Pumba Host</span>
                <div className="flex items-center gap-1.5">
                    {PUMBA_HOSTS.map(h => (
                        <button
                            key={h}
                            onClick={() => setHost(h)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${host === h
                                ? 'bg-accent-500/10 border-accent-500/30 text-accent-500'
                                : 'bg-text-100/[0.02] border-text-100/10 text-text-100/40 hover:border-text-100/20 hover:text-text-100/70'
                                }`}
                        >
                            {h}
                        </button>
                    ))}
                </div>
                <span className="text-[10px] font-mono text-text-100/30">port :8099</span>

                <div className="ml-auto flex items-center gap-2">
                    <button
                        onClick={fetchContainers}
                        disabled={loadingContainers}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-text-100/10 bg-text-100/[0.02] text-text-100/50 hover:text-text-100/80 hover:bg-text-100/5 text-xs transition-all disabled:opacity-40"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loadingContainers ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                    <button
                        onClick={handleHealth}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-bold transition-all disabled:opacity-40"
                    >
                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                        Health Check
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/5 border border-red-500/10 text-sm text-red-400 font-mono">
                    <XCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Loading state */}
            {loadingContainers && containers.length === 0 && (
                <div className="flex items-center justify-center py-16 gap-3 text-text-100/40">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Fetching containers from {host}…</span>
                </div>
            )}

            {/* 3 cards */}
            {containers.length > 0 && (
                <>
                    {/* Global Slack Filter */}
                    <div className="flex flex-wrap gap-2 items-center px-1">
                        <span className="text-[10px] font-bold text-text-100/30 uppercase tracking-widest mr-1">Filter by Stack:</span>
                        <button
                            onClick={() => setSelectedSlack(null)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${!selectedSlack
                                ? 'bg-text-100/10 border-text-100/20 text-text-100'
                                : 'bg-transparent border-text-100/5 text-text-100/30 hover:border-text-100/10'
                                }`}
                        >
                            ALL STACKS
                        </button>
                        {slacks.map(slack => (
                            <button
                                key={slack}
                                onClick={() => setSelectedSlack(slack)}
                                className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${selectedSlack === slack
                                    ? 'bg-accent-500/10 border-accent-500/30 text-accent-500'
                                    : 'bg-transparent border-text-100/5 text-text-100/30 hover:border-text-100/10'
                                    }`}
                            >
                                {slack.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        <CpuStressCard
                            containers={filteredContainers}
                            loading={loadingContainers}
                            actionLoading={actionLoading}
                            onAction={runAction}
                        />
                        <MemoryStressCard
                            containers={filteredContainers}
                            loading={loadingContainers}
                            actionLoading={actionLoading}
                            onAction={runAction}
                        />
                        <LifecycleCard
                            containers={filteredContainers}
                            loading={loadingContainers}
                            actionLoading={actionLoading}
                            onAction={runAction}
                        />
                    </div>

                    {/* Container Table */}
                    <ContainerTable containers={filteredContainers} />
                </>
            )}
        </div>
    );
}
