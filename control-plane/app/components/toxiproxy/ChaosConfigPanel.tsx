"use client";

import { useState } from "react";
import {
    Loader2, AlertTriangle, Power, Trash2, RefreshCw, Info, Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { ServiceStatus } from "../../hooks/useToxiproxy";
import type { ToxicFormValues } from "./ToxicTypeForm";
import { ToxicTypeForm, TOXIC_TYPE_OPTIONS, buildToxicPayload } from "./ToxicTypeForm";
import { ActiveToxicsTable } from "./ActiveToxicsTable";
import { PresetManager } from "./PresetManager";
import { ConfirmModal } from "./ConfirmModal";

const DEFAULT_FORM: ToxicFormValues = {
    name: "",
    type: "latency",
    stream: "downstream",
    toxicity: 1.0,
    latency: 2000,
    jitter: 0,
    rate: 50,
    delay: 5000,
    bytes: 1024,
    average_size: 1,
    size_variation: 0,
    slicer_delay: 0,
};

interface ChaosConfigPanelProps {
    serviceId: string;
    status: ServiceStatus | undefined;
    actionLoading: Record<string, boolean>;
    onInject: (payload: Record<string, any>) => Promise<any>;
    onDeleteToxic: (toxicName: string) => Promise<void>;
    onDeleteAllToxics: () => Promise<void>;
    onToggleService: (enabled: boolean) => Promise<void>;
    onRefresh: () => void;
}

export function ChaosConfigPanel({
    serviceId,
    status,
    actionLoading,
    onInject,
    onDeleteToxic,
    onDeleteAllToxics,
    onToggleService,
    onRefresh,
}: ChaosConfigPanelProps) {
    const [form, setForm] = useState<ToxicFormValues>({ ...DEFAULT_FORM });
    const [isInjecting, setIsInjecting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [showOutageConfirm, setShowOutageConfirm] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [autoRestoreMin, setAutoRestoreMin] = useState<number>(0);
    const [autoRestoreTimer, setAutoRestoreTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    const isDisabled = status?.enabled === false;
    const toxics = status?.toxics ?? [];
    const isToggling = actionLoading[`toggle-${serviceId}`];
    const isClearing = actionLoading[`deleteAll-${serviceId}`];

    function updateForm(patch: Partial<ToxicFormValues>) {
        setForm(prev => ({ ...prev, ...patch }));
    }

    async function handleInject() {
        const payload = buildToxicPayload({
            ...form,
            name: form.name || `${form.type}-${Date.now()}`,
        });
        setIsInjecting(true);
        try {
            await onInject(payload);
            toast.success(`Toxic "${payload.name}" injected`);
            // Reset name only, keep other settings for easy re-injection
            setForm(prev => ({ ...prev, name: "" }));
            setEditMode(false);

            // Auto-restore timer
            if (autoRestoreMin > 0) {
                if (autoRestoreTimer) clearTimeout(autoRestoreTimer);
                const timer = setTimeout(async () => {
                    try {
                        await onDeleteToxic(payload.name);
                        toast.info(`Auto-restored: removed "${payload.name}" after ${autoRestoreMin}m`);
                    } catch { /* ignore */ }
                }, autoRestoreMin * 60 * 1000);
                setAutoRestoreTimer(timer);
                toast.info(`Auto-restore scheduled in ${autoRestoreMin}m`);
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to inject toxic");
        } finally {
            setIsInjecting(false);
        }
    }

    function handleEditToxic(toxic: any) {
        setEditMode(true);
        setForm({
            name: toxic.name,
            type: toxic.type,
            stream: toxic.stream,
            toxicity: toxic.toxicity,
            latency: toxic.attributes?.latency,
            jitter: toxic.attributes?.jitter,
            rate: toxic.attributes?.rate,
            delay: toxic.attributes?.delay,
            bytes: toxic.attributes?.bytes,
            average_size: toxic.attributes?.average_size,
            size_variation: toxic.attributes?.size_variation,
            slicer_delay: toxic.attributes?.delay,
        });
    }

    async function handleInjectAll(toxics: ToxicFormValues[]) {
        for (const t of toxics) {
            const payload = buildToxicPayload({ ...t, name: t.name || `${t.type}-${Date.now()}` });
            await onInject(payload);
        }
    }

    const selectedTypeOption = TOXIC_TYPE_OPTIONS.find(o => o.value === form.type);

    return (
        <div className="flex flex-col gap-5 min-h-0 overflow-y-auto stylish-scrollbar pr-1">
            {/* Service header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-text-100">
                        {status?.label ?? serviceId}
                    </h2>
                    <p className="text-xs text-text-40 mt-0.5 font-mono">{serviceId}</p>
                </div>
                <div className="flex items-center gap-2">
                    {status && !status.reachable && (
                        <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            Unreachable
                        </span>
                    )}
                    <button
                        onClick={onRefresh}
                        className="p-2 rounded-lg hover:bg-text-100/5 text-text-40 hover:text-text-100 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Full service outage toggle */}
            <div className={`rounded-xl border p-4 flex items-center justify-between gap-4 transition-all duration-200
                ${isDisabled
                    ? "bg-red-500/8 border-red-500/30"
                    : "bg-text-100/[0.02] border-text-100/10 hover:border-text-100/20"
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDisabled ? "bg-red-500/10 border border-red-500/20" : "bg-text-100/5 border border-text-100/10"}`}>
                        <Power className={`w-4 h-4 ${isDisabled ? "text-red-400" : "text-text-40"}`} />
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-text-100">
                            {isDisabled ? "Service Disabled — Full Outage Active" : "Disable Service & Clear All Toxics"}
                        </div>
                        <div className="text-xs text-text-40 mt-0.5">
                            {isDisabled ? "Click Re-enable to restore traffic. All toxics were cleared on disable." : "Stops all traffic AND removes every active toxic so the service restarts clean."}
                        </div>
                    </div>
                </div>
                {isDisabled ? (
                    <button
                        onClick={() => onToggleService(true)}
                        disabled={isToggling}
                        className="flex-shrink-0 px-4 py-2 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 text-sm font-bold hover:bg-green-500/20 transition-all disabled:opacity-40 flex items-center gap-2"
                    >
                        {isToggling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        RE-ENABLE
                    </button>
                ) : (
                    <button
                        onClick={() => setShowOutageConfirm(true)}
                        disabled={isToggling}
                        className="flex-shrink-0 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold hover:bg-red-500/20 transition-all disabled:opacity-40 flex items-center gap-2"
                    >
                        {isToggling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        DISABLE
                    </button>
                )}
            </div>

            {/* Inject New Toxic */}
            <div className="rounded-xl border border-text-100/10 overflow-hidden">
                <div className="px-4 py-3 bg-text-100/[0.02] border-b border-text-100/5 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-accent-500" />
                    <span className="text-xs font-bold text-text-60 uppercase tracking-wider">
                        {editMode ? "Edit Toxic" : "Inject New Toxic"}
                    </span>
                    {editMode && (
                        <button
                            onClick={() => { setEditMode(false); setForm({ ...DEFAULT_FORM }); }}
                            className="ml-auto text-[10px] font-mono text-text-40 hover:text-text-100 transition-colors"
                        >
                            ← back to new
                        </button>
                    )}
                </div>
                <div className="p-4 flex flex-col gap-4">
                    {/* Toxic type selector */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-text-40 font-medium">Select Error Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {TOXIC_TYPE_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => updateForm({ type: opt.value })}
                                    title={opt.description}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-sm transition-all duration-150
                                        ${form.type === opt.value
                                            ? "bg-accent-500/10 border-accent-500/30 text-accent-500"
                                            : "bg-text-100/[0.02] border-text-100/8 text-text-60 hover:border-text-100/20 hover:text-text-100"
                                        }`}
                                >
                                    <span className="text-base">{opt.emoji}</span>
                                    <span className="font-semibold text-xs leading-tight">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                        {selectedTypeOption && (
                            <div className="flex items-start gap-2 mt-1 text-xs text-text-40 bg-text-100/[0.02] rounded-lg px-3 py-2 border border-text-100/5">
                                <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                {selectedTypeOption.description}
                            </div>
                        )}
                    </div>

                    {/* Dynamic form fields */}
                    <ToxicTypeForm values={form} onChange={updateForm} />

                    {/* Auto-restore */}
                    <div className="flex items-center gap-3">
                        <label className="text-xs text-text-40 font-medium whitespace-nowrap">Auto-restore after</label>
                        <div className="flex items-center gap-2 flex-1">
                            <input
                                type="number"
                                min={0}
                                max={120}
                                value={autoRestoreMin || ""}
                                onChange={(e) => setAutoRestoreMin(parseInt(e.target.value) || 0)}
                                placeholder="0 = disabled"
                                className="flex-1 h-8 px-3 rounded-lg bg-bg-900/30 border border-text-100/10 text-sm font-mono text-text-100 focus:outline-none focus:border-accent-500/50 placeholder:text-text-100/20"
                            />
                            <span className="text-xs text-text-40 whitespace-nowrap">minutes</span>
                        </div>
                    </div>

                    {/* Inject button */}
                    <button
                        onClick={handleInject}
                        disabled={isInjecting || isDisabled}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-accent-500/30 bg-accent-500/10 text-accent-500 font-bold text-sm hover:bg-accent-500/20 hover:border-accent-500/50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {isInjecting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Zap className="w-4 h-4" />
                        )}
                        {editMode ? "Update Toxic" : "Inject Toxic"}
                    </button>

                    {isDisabled && (
                        <div className="flex items-center gap-2 text-xs text-red-400/80 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                            Service is disabled. Re-enable before injecting toxics.
                        </div>
                    )}
                </div>
            </div>

            {/* Active toxics + clear all */}
            {toxics.length > 0 && (
                <div className="flex items-center justify-end">
                    <button
                        onClick={() => setShowClearConfirm(true)}
                        disabled={isClearing}
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 hover:border-red-500/40 transition-colors disabled:opacity-40"
                    >
                        {isClearing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Clear All Toxics
                    </button>
                </div>
            )}

            <ActiveToxicsTable
                toxics={toxics}
                actionLoading={actionLoading}
                serviceId={serviceId}
                onDelete={onDeleteToxic}
                onEdit={handleEditToxic}
            />

            {/* Preset manager */}
            <PresetManager
                currentToxic={form}
                onApplyPreset={(toxics) => {
                    if (toxics[0]) setForm({ ...DEFAULT_FORM, ...toxics[0] });
                }}
                onInjectAll={handleInjectAll}
            />

            {/* Modals */}
            <ConfirmModal
                open={showOutageConfirm}
                title="Disable Service"
                message={`This will DELETE ALL active toxics and DROP all traffic through "${status?.label ?? serviceId}" immediately. When re-enabled, the service will have no toxics and resume normal operation. Proceed?`}
                confirmLabel="Disable Service"
                onConfirm={async () => {
                    setShowOutageConfirm(false);
                    try {
                        await onToggleService(false);
                        toast.success("Service disabled — full outage active");
                    } catch (err: any) {
                        toast.error(err.message);
                    }
                }}
                onCancel={() => setShowOutageConfirm(false)}
            />

            <ConfirmModal
                open={showClearConfirm}
                title="Clear All Toxics"
                message={`Remove all ${toxics.length} active toxic(s) from "${status?.label ?? serviceId}" and restore it to normal operation?`}
                confirmLabel="Clear All"
                onConfirm={async () => {
                    setShowClearConfirm(false);
                    try {
                        await onDeleteAllToxics();
                        toast.success("All toxics cleared — service restored");
                    } catch (err: any) {
                        toast.error(err.message);
                    }
                }}
                onCancel={() => setShowClearConfirm(false)}
            />
        </div>
    );
}
