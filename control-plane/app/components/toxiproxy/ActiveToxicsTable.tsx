"use client";

import { useState } from "react";
import { Trash2, Pencil, ChevronDown, ChevronUp } from "lucide-react";
import type { Toxic } from "../../hooks/useToxiproxy";
import { ConfirmModal } from "./ConfirmModal";

const TYPE_COLOR: Record<string, string> = {
    latency: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    bandwidth: "bg-orange-500/10 border-orange-500/20 text-orange-400",
    slow_close: "bg-purple-500/10 border-purple-500/20 text-purple-400",
    reset_peer: "bg-red-500/10 border-red-500/20 text-red-400",
    limit_data: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    slicer: "bg-pink-500/10 border-pink-500/20 text-pink-400",
};

const TYPE_LABEL: Record<string, string> = {
    latency: "Latency",
    bandwidth: "Bandwidth",
    slow_close: "Slow Close",
    reset_peer: "Reset Peer",
    limit_data: "Limit Data",
    slicer: "Slicer",
};

const STREAM_COLOR: Record<string, string> = {
    downstream: "text-cyan-400",
    upstream: "text-violet-400",
};

function AttributeBadge({ attrs }: { attrs: Record<string, number> }) {
    const pairs = Object.entries(attrs);
    if (!pairs.length) return <span className="text-text-40 text-xs font-mono">—</span>;
    return (
        <div className="flex flex-wrap gap-1">
            {pairs.map(([k, v]) => (
                <span key={k} className="text-[10px] font-mono bg-text-100/5 border border-text-100/8 rounded px-1.5 py-0.5 text-text-60">
                    {k}: {v}
                </span>
            ))}
        </div>
    );
}

interface ActiveToxicsTableProps {
    toxics: Toxic[];
    actionLoading: Record<string, boolean>;
    serviceId: string;
    onDelete: (toxicName: string) => void;
    onEdit: (toxic: Toxic) => void;
}

export function ActiveToxicsTable({ toxics, actionLoading, serviceId, onDelete, onEdit }: ActiveToxicsTableProps) {
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(true);

    if (!toxics.length) {
        return (
            <div className="rounded-xl border border-dashed border-text-100/10 p-5 text-center">
                <div className="text-sm text-text-40 font-medium">No active toxics</div>
                <div className="text-xs text-text-40/60 mt-1">This service is currently running normally.</div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-text-100/10 overflow-hidden">
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between px-4 py-3 bg-text-100/[0.02] hover:bg-text-100/[0.04] transition-colors"
            >
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-text-60 uppercase tracking-wider">Active Toxics</span>
                    <span className="text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded-full">
                        {toxics.length}
                    </span>
                </div>
                {expanded ? <ChevronUp className="w-3.5 h-3.5 text-text-40" /> : <ChevronDown className="w-3.5 h-3.5 text-text-40" />}
            </button>

            {expanded && (
                <div className="overflow-x-auto stylish-scrollbar">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-text-100/5">
                                <th className="px-4 py-2 text-left font-semibold text-text-40 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-2 text-left font-semibold text-text-40 uppercase tracking-wider">Type</th>
                                <th className="px-4 py-2 text-left font-semibold text-text-40 uppercase tracking-wider">Direction</th>
                                <th className="px-4 py-2 text-left font-semibold text-text-40 uppercase tracking-wider">Toxicity</th>
                                <th className="px-4 py-2 text-left font-semibold text-text-40 uppercase tracking-wider">Attributes</th>
                                <th className="px-4 py-2 text-right font-semibold text-text-40 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {toxics.map((toxic) => {
                                const isDeleting = actionLoading[`delete-${serviceId}-${toxic.name}`];
                                return (
                                    <tr key={toxic.name} className="border-b border-text-100/[0.04] hover:bg-text-100/[0.02] transition-colors">
                                        <td className="px-4 py-3 font-mono text-text-100">{toxic.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${TYPE_COLOR[toxic.type] ?? "bg-text-100/5 border-text-100/10 text-text-40"}`}>
                                                {TYPE_LABEL[toxic.type] ?? toxic.type}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 font-mono font-semibold ${STREAM_COLOR[toxic.stream] ?? "text-text-60"}`}>
                                            {toxic.stream}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 rounded-full bg-text-100/10 overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full bg-accent-500"
                                                        style={{ width: `${toxic.toxicity * 100}%` }}
                                                    />
                                                </div>
                                                <span className="font-mono text-accent-500 font-bold">
                                                    {(toxic.toxicity * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <AttributeBadge attrs={toxic.attributes} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => onEdit(toxic)}
                                                    className="p-1.5 rounded-lg hover:bg-text-100/5 text-text-40 hover:text-text-100 transition-colors"
                                                    title="Edit toxic"
                                                >
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(toxic.name)}
                                                    disabled={isDeleting}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-40 hover:text-red-400 transition-colors disabled:opacity-40"
                                                    title="Delete toxic"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmModal
                open={!!confirmDelete}
                title="Delete Toxic"
                message={`Remove "${confirmDelete}" from this service? The injection will stop immediately.`}
                confirmLabel="Delete"
                onConfirm={() => { if (confirmDelete) { onDelete(confirmDelete); setConfirmDelete(null); } }}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
}
