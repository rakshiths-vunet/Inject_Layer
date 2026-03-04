"use client";

import { useState } from "react";
import {
    CreditCard, Minus, User, Lock, Key, Shield, Phone, Globe,
    CheckCircle2, AlertCircle, Zap, Power, Trash2, Eye, RefreshCw, WifiOff,
} from "lucide-react";
import type { ToxiproxyService, ServiceStatus } from "../../hooks/useToxiproxy";
import { ConfirmModal } from "./ConfirmModal";

const ICON_MAP: Record<string, React.ComponentType<any>> = {
    CreditCard, Minus, User, Lock, Key, Shield, Phone, Globe, Zap,
};

function ServiceIcon({ name }: { name: string }) {
    const Icon = ICON_MAP[name] ?? Globe;
    return <Icon className="w-5 h-5" />;
}

function ServiceStatusBadge({ status }: { status: ServiceStatus | undefined }) {
    if (!status) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-text-100/5 border border-text-100/10 text-text-40">
                <span className="w-1.5 h-1.5 rounded-full bg-text-100/20" />
                LOADING
            </span>
        );
    }
    if (!status.reachable) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-text-100/5 border border-text-100/10 text-text-40">
                <WifiOff className="w-2.5 h-2.5" />
                UNREACHABLE
            </span>
        );
    }
    if (!status.enabled) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-red-500/10 border border-red-500/20 text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                DISABLED
            </span>
        );
    }
    if (status.toxics.length > 0) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                {status.toxics.length} TOXIC{status.toxics.length > 1 ? "S" : ""}
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-green-500/10 border border-green-500/20 text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            HEALTHY
        </span>
    );
}

const ICON_COLOR_MAP: Record<string, string> = {
    CreditCard: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    Minus: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    User: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    Lock: "bg-red-500/10 border-red-500/20 text-red-400",
    Key: "bg-green-500/10 border-green-500/20 text-green-400",
    Shield: "bg-accent-500/10 border-accent-500/20 text-accent-500",
    Phone: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    Globe: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
};

interface ServiceListPanelProps {
    services: ToxiproxyService[];
    statusMap: Record<string, ServiceStatus>;
    selectedService: string | null;
    actionLoading: Record<string, boolean>;
    onSelect: (id: string) => void;
    onInject: (id: string) => void;
    onDisable: (id: string) => void;
    onEnable: (id: string) => void;
    onClearAll: (id: string) => void;
    onRefresh: () => void;
}

export function ServiceListPanel({
    services,
    statusMap,
    selectedService,
    actionLoading,
    onSelect,
    onInject,
    onDisable,
    onEnable,
    onClearAll,
    onRefresh,
}: ServiceListPanelProps) {
    const [confirmModal, setConfirmModal] = useState<{ type: "disable" | "clearAll"; serviceId: string } | null>(null);

    function handleDisableClick(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        setConfirmModal({ type: "disable", serviceId: id });
    }
    function handleClearAllClick(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        setConfirmModal({ type: "clearAll", serviceId: id });
    }

    function handleConfirm() {
        if (!confirmModal) return;
        if (confirmModal.type === "disable") onDisable(confirmModal.serviceId);
        if (confirmModal.type === "clearAll") onClearAll(confirmModal.serviceId);
        setConfirmModal(null);
    }

    const confirmMeta = confirmModal
        ? confirmModal.type === "disable"
            ? {
                title: "Disable Service",
                message: `This will cut traffic through "${statusMap[confirmModal.serviceId]?.label || confirmModal.serviceId}" immediately, simulating a full outage. Are you sure?`,
                confirmLabel: "Disable Service",
            }
            : {
                title: "Clear All Toxics",
                message: `Remove all chaos injections from "${statusMap[confirmModal.serviceId]?.label || confirmModal.serviceId}" and restore it to normal?`,
                confirmLabel: "Clear All",
            }
        : null;

    return (
        <div className="flex flex-col gap-3 min-h-0">
            {/* Panel header */}
            <div className="flex items-center justify-between mb-1">
                <h2 className="text-xs font-bold uppercase tracking-widest text-text-40">Services</h2>
                <button
                    onClick={onRefresh}
                    className="p-1.5 rounded-lg hover:bg-text-100/5 text-text-40 hover:text-text-100 transition-colors"
                    title="Refresh all statuses"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Service cards */}
            <div className="flex flex-col gap-2 overflow-y-auto stylish-scrollbar pr-1">
                {services.map((svc) => {
                    const status = statusMap[svc.id];
                    const isSelected = selectedService === svc.id;
                    const isDisabled = status?.enabled === false;
                    const hasToxics = (status?.toxics?.length ?? 0) > 0;
                    const iconStyle = ICON_COLOR_MAP[svc.icon] ?? "bg-text-100/5 border-text-100/10 text-text-40";
                    const isToggling = actionLoading[`toggle-${svc.id}`];
                    const isClearing = actionLoading[`deleteAll-${svc.id}`];

                    return (
                        <div
                            key={svc.id}
                            onClick={() => onSelect(svc.id)}
                            className={`rounded-xl border p-3.5 cursor-pointer transition-all duration-150 group
                                ${isSelected
                                    ? "bg-accent-500/5 border-accent-500/30 shadow-[0_0_0_1px_rgba(255,200,87,0.1)]"
                                    : "bg-panel-700/50 border-panel-600/40 hover:bg-panel-700 hover:border-panel-600/70"
                                }`}
                        >
                            {/* Top row */}
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconStyle}`}>
                                    <ServiceIcon name={svc.icon} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-text-100 truncate">{svc.label}</div>
                                    <div className="mt-0.5">
                                        <ServiceStatusBadge status={status} />
                                    </div>
                                </div>
                            </div>

                            {/* Quick actions — visible on hover or when selected */}
                            <div className={`mt-3 flex items-center gap-1.5 transition-all duration-150 ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                                <button
                                    onClick={(e) => { e.stopPropagation(); onInject(svc.id); }}
                                    className="flex-1 text-[10px] font-bold tracking-wide px-2 py-1 rounded-lg bg-accent-500/10 border border-accent-500/20 text-accent-500 hover:bg-accent-500/20 transition-colors"
                                >
                                    INJECT
                                </button>

                                {isDisabled ? (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEnable(svc.id); }}
                                        disabled={isToggling}
                                        className="flex-1 text-[10px] font-bold tracking-wide px-2 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-40"
                                    >
                                        ENABLE
                                    </button>
                                ) : (
                                    <button
                                        onClick={(e) => handleDisableClick(svc.id, e)}
                                        disabled={isToggling}
                                        className="flex-1 text-[10px] font-bold tracking-wide px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                                    >
                                        DISABLE
                                    </button>
                                )}

                                {hasToxics && (
                                    <button
                                        onClick={(e) => handleClearAllClick(svc.id, e)}
                                        disabled={isClearing}
                                        className="text-[10px] font-bold tracking-wide px-2 py-1 rounded-lg bg-text-100/5 border border-text-100/10 text-text-40 hover:text-text-100 hover:bg-text-100/10 transition-colors disabled:opacity-40"
                                        title="Clear all toxics"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-auto pt-3 border-t border-text-100/5 flex items-center gap-3 text-[10px] font-mono text-text-40">
                <span>{services.length} services</span>
                <span className="text-green-400">
                    {Object.values(statusMap).filter(s => s.reachable && s.enabled && s.toxics.length === 0).length} healthy
                </span>
                <span className="text-yellow-400">
                    {Object.values(statusMap).filter(s => s.toxics.length > 0).length} with toxics
                </span>
                <span className="text-red-400">
                    {Object.values(statusMap).filter(s => !s.enabled).length} disabled
                </span>
            </div>

            {/* Confirm modal */}
            {confirmModal && confirmMeta && (
                <ConfirmModal
                    open
                    title={confirmMeta.title}
                    message={confirmMeta.message}
                    confirmLabel={confirmMeta.confirmLabel}
                    onConfirm={handleConfirm}
                    onCancel={() => setConfirmModal(null)}
                />
            )}
        </div>
    );
}
