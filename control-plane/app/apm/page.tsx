"use client";

import { useState } from "react";
import { ShieldAlert, Zap, Phone, KeyRound, Clock, Percent, RefreshCw, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Container } from "lucide-react";
import { toast } from "sonner";
import { useToxiproxy } from "../hooks/useToxiproxy";
import { useServiceChaos } from "../hooks/useServiceChaos";
import { ServiceListPanel } from "../components/toxiproxy/ServiceListPanel";
import { ChaosConfigPanel } from "../components/toxiproxy/ChaosConfigPanel";
import { ActivityLogConsole } from "../components/toxiproxy/ActivityLogConsole";
import { PumbaPanel } from "../components/pumba/PumbaPanel";

// ─── Tab type ────────────────────────────────────────────────────────────────
type Tab = "toxiproxy" | "services" | "pumba";

// ─── Legacy OTP/JWT helpers (unchanged) ──────────────────────────────────────

interface ActionButton {
    label: string;
    sublabel?: string;
    color: string;
    payload: Record<string, any>;
}

function StatusBadge({ enabled, extra }: { enabled: boolean; extra?: string }) {
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${enabled
            ? "bg-red-500/10 border-red-500/30 text-red-400"
            : "bg-green-500/10 border-green-500/30 text-green-400"}`}
        >
            <span className={`w-2 h-2 rounded-full ${enabled ? "bg-red-400 animate-pulse" : "bg-green-400"}`} />
            {enabled ? `ACTIVE${extra ? ` · ${extra}` : ""}` : "OFF"}
        </div>
    );
}

function ActionBtn({ btn, onClick, disabled }: { btn: ActionButton; onClick: () => void; disabled: boolean }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`relative group flex flex-col items-start gap-0.5 px-4 py-3 rounded-xl border transition-all duration-200 text-left ${btn.color} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
            <span className="text-sm font-semibold">{btn.label}</span>
            {btn.sublabel && <span className="text-[11px] font-mono opacity-60">{btn.sublabel}</span>}
        </button>
    );
}

function RawResponsePanel({ data }: { data: any }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-5 border border-text-100/5 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen((o) => !o)}
                className="w-full flex items-center justify-between px-4 py-3 bg-text-100/[0.02] hover:bg-text-100/[0.04] text-xs text-text-100/40 font-mono transition-colors"
            >
                <span>last response</span>
                {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {open && (
                <pre className="px-4 py-3 text-[11px] font-mono text-green-400/80 bg-bg-900/30 overflow-x-auto">
                    {JSON.stringify(data, null, 2)}
                </pre>
            )}
        </div>
    );
}

function OtpCard() {
    const [host, setHost] = useState("localhost:8081");
    const { state, loading, sending, error, lastResponse, refresh, send } = useServiceChaos("otp", host);
    const [phones, setPhones] = useState("9999");
    const otpState = state as any;

    const buttons: ActionButton[] = [
        { label: "100% Fail", sublabel: "fail_percent: 1.0", color: "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 hover:border-red-500/40", payload: { enabled: true, fail_percent: 1.0, delay_ms: 0, target_phones: phones } },
        { label: "30% Fail", sublabel: "fail_percent: 0.3", color: "bg-orange-500/10 border-orange-500/20 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/40", payload: { enabled: true, fail_percent: 0.3, delay_ms: 0, target_phones: phones } },
        { label: "5s Delay", sublabel: "delay_ms: 5000", color: "bg-blue-500/10 border-blue-500/20 text-blue-300 hover:bg-blue-500/20 hover:border-blue-500/40", payload: { enabled: true, fail_percent: 0, delay_ms: 5000, target_phones: phones } },
        { label: "Fail + Delay", sublabel: "100% + 3s", color: "bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/40", payload: { enabled: true, fail_percent: 1.0, delay_ms: 3000, target_phones: phones } },
        { label: "All Phones", sublabel: "no prefix filter", color: "bg-text-100/5 border-text-100/10 text-text-100/60 hover:bg-text-100/10 hover:border-text-100/20", payload: { enabled: true, fail_percent: 1.0, delay_ms: 0, target_phones: "" } },
    ];

    async function handleSend(payload: Record<string, any>) {
        try { await send(payload); toast.success("OTP chaos updated"); }
        catch { toast.error(error || "Failed to reach OTP service"); }
    }
    async function handleOff() {
        try { await send({ enabled: false, fail_percent: 0, delay_ms: 0, target_phones: "" }); toast.success("OTP chaos disabled"); }
        catch { toast.error(error || "Failed to reach OTP service"); }
    }

    return (
        <div className="rounded-2xl bg-panel-800 border border-panel-600/50 p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-text-100">OTP Service</h2>
                        <p className="text-xs font-mono text-text-40">localhost:8081/chaos</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 text-text-40 animate-spin" /> : error ? <span title={error}><XCircle className="w-4 h-4 text-red-400" /></span> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    <button onClick={refresh} disabled={loading || sending} className="p-1.5 rounded-lg hover:bg-text-100/5 text-text-40 hover:text-text-100 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>
            {otpState && (
                <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge enabled={otpState.enabled} extra={otpState.enabled ? [otpState.fail_percent > 0 && `${(otpState.fail_percent * 100).toFixed(0)}% fail`, otpState.delay_ms > 0 && `${otpState.delay_ms}ms delay`].filter(Boolean).join(" · ") : undefined} />
                    {otpState.enabled && otpState.target_phones && <span className="text-xs font-mono text-text-40 bg-text-100/5 px-2 py-1 rounded-md border border-text-100/5">prefix: {otpState.target_phones}*</span>}
                    {otpState.enabled && !otpState.target_phones && <span className="text-xs font-mono text-text-40 bg-text-100/5 px-2 py-1 rounded-md border border-text-100/5">all phones</span>}
                </div>
            )}
            {error && !otpState && <div className="text-xs text-red-400 font-mono bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">⚠ {error}</div>}
            <div className="flex items-center gap-3">
                <label className="text-xs text-text-40 font-medium whitespace-nowrap">Host : Port</label>
                <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="localhost:8081" className="flex-1 h-8 px-3 rounded-lg bg-bg-900/30 border border-text-100/10 text-sm font-mono text-text-100 focus:outline-none focus:border-accent-500/50 placeholder:text-text-100/20" />
            </div>
            <div className="flex items-center gap-3">
                <label className="text-xs text-text-40 font-medium whitespace-nowrap">Phone prefix</label>
                <input value={phones} onChange={(e) => setPhones(e.target.value)} placeholder="e.g. 9999" className="flex-1 h-8 px-3 rounded-lg bg-bg-900/30 border border-text-100/10 text-sm font-mono text-text-100 focus:outline-none focus:border-accent-500/50 placeholder:text-text-100/20" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {buttons.map((btn) => <ActionBtn key={btn.label} btn={btn} disabled={sending} onClick={() => handleSend(btn.payload)} />)}
                <button onClick={handleOff} disabled={sending} className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-600/40 bg-red-600/10 text-red-400 font-bold text-sm hover:bg-red-600/20 hover:border-red-600/60 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Disable OTP Chaos
                </button>
            </div>
            {lastResponse && <RawResponsePanel data={lastResponse} />}
        </div>
    );
}

function JwtCard() {
    const [host, setHost] = useState("localhost:8091");
    const { state, loading, sending, error, lastResponse, refresh, send } = useServiceChaos("jwt", host);
    const [phones, setPhones] = useState("9999");
    const jwtState = state as any;

    const buttons: ActionButton[] = [
        { label: "Expired Token", sublabel: "EXPIRED_TOKEN · 100%", color: "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 hover:border-red-500/40", payload: { enabled: true, mode: "EXPIRED_TOKEN", fail_percent: 1.0, target_phones: phones } },
        { label: "Wrong Issuer", sublabel: "WRONG_ISSUER · 100%", color: "bg-orange-500/10 border-orange-500/20 text-orange-300 hover:bg-orange-500/20 hover:border-orange-500/40", payload: { enabled: true, mode: "WRONG_ISSUER", fail_percent: 1.0, target_phones: phones } },
        { label: "Bad Signature", sublabel: "SIGNATURE_FAILURE · 100%", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/40", payload: { enabled: true, mode: "SIGNATURE_FAILURE", fail_percent: 1.0, target_phones: phones } },
        { label: "30% Expired", sublabel: "EXPIRED_TOKEN · 30%", color: "bg-purple-500/10 border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/40", payload: { enabled: true, mode: "EXPIRED_TOKEN", fail_percent: 0.3, target_phones: phones } },
        { label: "All Phones", sublabel: "no prefix filter", color: "bg-text-100/5 border-text-100/10 text-text-100/60 hover:bg-text-100/10 hover:border-text-100/20", payload: { enabled: true, mode: "EXPIRED_TOKEN", fail_percent: 1.0, target_phones: "" } },
    ];

    const modeColor = (mode: string) => mode === "EXPIRED_TOKEN" ? "text-red-400" : mode === "WRONG_ISSUER" ? "text-orange-400" : mode === "SIGNATURE_FAILURE" ? "text-yellow-400" : "text-text-40";

    async function handleSend(payload: Record<string, any>) {
        try { await send(payload); toast.success("JWT chaos updated"); }
        catch { toast.error(error || "Failed to reach JWT service"); }
    }
    async function handleOff() {
        try { await send({ enabled: false, mode: "", fail_percent: 0, target_phones: "" }); toast.success("JWT chaos disabled"); }
        catch { toast.error(error || "Failed to reach JWT service"); }
    }

    return (
        <div className="rounded-2xl bg-panel-800 border border-panel-600/50 p-6 flex flex-col gap-5">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-500/10 border border-accent-500/20 flex items-center justify-center">
                        <KeyRound className="w-5 h-5 text-accent-500" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-text-100">JWT Service</h2>
                        <p className="text-xs font-mono text-text-40">localhost:8091/chaos</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {loading ? <Loader2 className="w-4 h-4 text-text-40 animate-spin" /> : error ? <span title={error}><XCircle className="w-4 h-4 text-red-400" /></span> : <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    <button onClick={refresh} disabled={loading || sending} className="p-1.5 rounded-lg hover:bg-text-100/5 text-text-40 hover:text-text-100 transition-colors">
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>
            {jwtState && (
                <div className="flex flex-wrap items-center gap-3">
                    <StatusBadge enabled={jwtState.enabled} extra={jwtState.enabled && jwtState.mode ? `${(jwtState.fail_percent * 100).toFixed(0)}% · ${jwtState.mode}` : undefined} />
                    {jwtState.enabled && jwtState.mode && <span className={`text-xs font-mono font-bold bg-text-100/5 px-2 py-1 rounded-md border border-text-100/5 ${modeColor(jwtState.mode)}`}>{jwtState.mode}</span>}
                    {jwtState.enabled && jwtState.target_phones && <span className="text-xs font-mono text-text-40 bg-text-100/5 px-2 py-1 rounded-md border border-text-100/5">prefix: {jwtState.target_phones}*</span>}
                    {jwtState.enabled && !jwtState.target_phones && <span className="text-xs font-mono text-text-40 bg-text-100/5 px-2 py-1 rounded-md border border-text-100/5">all phones</span>}
                </div>
            )}
            {error && !jwtState && <div className="text-xs text-red-400 font-mono bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">⚠ {error}</div>}
            <div className="flex items-center gap-3">
                <label className="text-xs text-text-40 font-medium whitespace-nowrap">Host : Port</label>
                <input value={host} onChange={(e) => setHost(e.target.value)} placeholder="localhost:8091" className="flex-1 h-8 px-3 rounded-lg bg-bg-900/30 border border-text-100/10 text-sm font-mono text-text-100 focus:outline-none focus:border-accent-500/50 placeholder:text-text-100/20" />
            </div>
            <div className="flex items-center gap-3">
                <label className="text-xs text-text-40 font-medium whitespace-nowrap">Phone prefix</label>
                <input value={phones} onChange={(e) => setPhones(e.target.value)} placeholder="e.g. 9999" className="flex-1 h-8 px-3 rounded-lg bg-bg-900/30 border border-text-100/10 text-sm font-mono text-text-100 focus:outline-none focus:border-accent-500/50 placeholder:text-text-100/20" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {buttons.map((btn) => <ActionBtn key={btn.label} btn={btn} disabled={sending} onClick={() => handleSend(btn.payload)} />)}
                <button onClick={handleOff} disabled={sending} className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-600/40 bg-red-600/10 text-red-400 font-bold text-sm hover:bg-red-600/20 hover:border-red-600/60 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Disable JWT Chaos
                </button>
            </div>
            {lastResponse && <RawResponsePanel data={lastResponse} />}
        </div>
    );
}

// ─── Toxiproxy Panel ──────────────────────────────────────────────────────────

function ToxiproxyPanel() {
    const [host, setHost] = useState<string>('10.1.92.124');

    const {
        services,
        statusMap,
        selectedService,
        setSelectedService,
        actionLoading,
        injectToxic,
        deleteToxic,
        deleteAllToxics,
        toggleService,
        refreshService,
        fetchAllStatuses,
    } = useToxiproxy(8000, host);

    function handleSelectAndInject(id: string) {
        setSelectedService(id);
    }

    const selected = selectedService;
    const selectedStatus = selected ? statusMap[selected] : undefined;

    if (services.length === 0) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-text-40" />
                    <span className="text-sm text-text-40">Loading services…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Host selector */}
            <div className="flex items-center gap-3 rounded-xl bg-panel-800 border border-panel-600/50 px-4 py-3">
                <span className="text-xs font-bold text-text-40 uppercase tracking-widest whitespace-nowrap">Toxiproxy Host</span>
                <div className="flex items-center gap-1.5">
                    {(['10.1.92.124', '10.1.92.127'] as const).map((h) => (
                        <button
                            key={h}
                            onClick={() => setHost(h)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all duration-150
                                ${host === h
                                    ? 'bg-accent-500/10 border-accent-500/30 text-accent-500'
                                    : 'bg-text-100/[0.02] border-text-100/10 text-text-40 hover:border-text-100/20 hover:text-text-100'
                                }`}
                        >
                            {h}
                        </button>
                    ))}
                </div>
                <span className="ml-auto text-[10px] font-mono text-text-40/60">ports 8474–8481</span>
            </div>
            {/* Two-column layout: service list + config panel */}
            <div className="grid grid-cols-[280px_1fr] gap-5 min-h-[600px]">
                {/* Left: service list */}
                <div className="rounded-2xl bg-panel-800 border border-panel-600/50 p-4 flex flex-col min-h-0">
                    <ServiceListPanel
                        services={services}
                        statusMap={statusMap}
                        selectedService={selected}
                        actionLoading={actionLoading}
                        onSelect={setSelectedService}
                        onInject={handleSelectAndInject}
                        onDisable={(id) => toggleService(id, false).catch((e) => toast.error(e.message))}
                        onEnable={(id) => toggleService(id, true).catch((e) => toast.error(e.message))}
                        onClearAll={(id) => deleteAllToxics(id).catch((e) => toast.error(e.message))}
                        onRefresh={fetchAllStatuses}
                    />
                </div>

                {/* Right: config panel */}
                <div className="rounded-2xl bg-panel-800 border border-panel-600/50 p-5">
                    {selected ? (
                        <ChaosConfigPanel
                            serviceId={selected}
                            status={selectedStatus}
                            actionLoading={actionLoading}
                            onInject={(payload) => injectToxic(selected, payload)}
                            onDeleteToxic={(name) => deleteToxic(selected, name)}
                            onDeleteAllToxics={() => deleteAllToxics(selected)}
                            onToggleService={(enabled) => toggleService(selected, enabled)}
                            onRefresh={() => refreshService(selected)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-40 text-sm">
                            Select a service to configure chaos injection.
                        </div>
                    )}
                </div>
            </div>

            {/* Activity log — bottom */}
            <ActivityLogConsole />
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function APMPage() {
    const [activeTab, setActiveTab] = useState<Tab>("toxiproxy");

    const tabs: { id: Tab; label: string; icon: React.ElementType; description: string }[] = [
        { id: "toxiproxy", label: "Toxiproxy Panel", icon: Zap, description: "Full lifecycle chaos via Toxiproxy — inject, update, delete, disable" },
        { id: "services", label: "Service Chaos", icon: ShieldAlert, description: "Native chaos endpoints for OTP & JWT services" },
        { id: "pumba", label: "Pumba Container Chaos", icon: Container, description: "CPU stress, memory stress, and container lifecycle via Pumba" },
    ];

    return (
        <div className="space-y-8">
            {/* Page header */}
            <div>
                <div className="text-accent-500 font-bold uppercase tracking-wider text-xs mb-2">
                    System Performance
                </div>
                <h1 className="text-4xl font-extrabold text-text-100 tracking-tight">
                    APM Control Panel
                </h1>
                <p className="text-text-60 mt-3 max-w-2xl">
                    Inject, manage, and monitor chaos across all backend services. Toxiproxy provides
                    full network-level fault injection — latency, bandwidth throttling, connection resets,
                    and complete service outages.
                </p>

                {/* Info strip */}
                <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-xs text-text-40">
                        <Zap className="w-3.5 h-3.5 text-accent-500" />
                        <span>8 services · Toxiproxy at <span className="font-mono">10.1.92.124</span> / <span className="font-mono">10.1.92.127</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-40">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Status auto-refreshes every 8s</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-40">
                        <Percent className="w-3.5 h-3.5" />
                        <span>Toxicity 0–100% per toxic</span>
                    </div>
                </div>
            </div>

            {/* Tab bar */}
            <div className="flex items-center gap-1 border-b border-text-100/8 pb-0">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px rounded-t-lg
                                ${isActive
                                    ? "border-accent-500 text-accent-500 bg-accent-500/5"
                                    : "border-transparent text-text-40 hover:text-text-100 hover:bg-text-100/[0.03]"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab content */}
            {activeTab === "toxiproxy" && <ToxiproxyPanel />}

            {activeTab === "pumba" && <PumbaPanel />}

            {activeTab === "services" && (
                <div className="space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <OtpCard />
                        <JwtCard />
                    </div>

                    {/* Curl reference */}
                    <div className="rounded-2xl bg-panel-700 border border-panel-600/50 p-6">
                        <h3 className="font-bold text-text-100 mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-accent-500" />
                            Quick Curl Reference
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-text-40 font-semibold uppercase tracking-wider mb-2">OTP (:8081)</p>
                                <pre className="text-[11px] font-mono text-text-60 bg-bg-900/30 rounded-lg p-3 overflow-x-auto leading-relaxed">{`# Status
curl http://localhost:8081/chaos

# 100% fail on 9999* phones
curl -X POST http://localhost:8081/chaos \\
  -H "Content-Type: application/json" \\
  -d '{"enabled":true,"fail_percent":1.0,
       "delay_ms":0,"target_phones":"9999"}'

# Disable
curl -X POST http://localhost:8081/chaos \\
  -d '{"enabled":false,"fail_percent":0,
       "delay_ms":0,"target_phones":""}'`}</pre>
                            </div>
                            <div>
                                <p className="text-xs text-text-40 font-semibold uppercase tracking-wider mb-2">JWT (:8091)</p>
                                <pre className="text-[11px] font-mono text-text-60 bg-bg-900/30 rounded-lg p-3 overflow-x-auto leading-relaxed">{`# Status
curl http://localhost:8091/chaos

# Expired token on 9999* phones
curl -X POST http://localhost:8091/chaos \\
  -H "Content-Type: application/json" \\
  -d '{"enabled":true,
       "mode":"EXPIRED_TOKEN",
       "fail_percent":1.0,
       "target_phones":"9999"}'

# Disable
curl -X POST http://localhost:8091/chaos \\
  -d '{"enabled":false,"mode":"",
       "fail_percent":0,"target_phones":""}'`}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
