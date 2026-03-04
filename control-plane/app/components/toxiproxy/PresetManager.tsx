"use client";

import { useState } from "react";
import { Save, Trash2, ChevronDown, ChevronUp, Zap } from "lucide-react";
import type { ToxicFormValues } from "./ToxicTypeForm";
import { TOXIC_TYPE_OPTIONS } from "./ToxicTypeForm";

const STORAGE_KEY = "toxiproxy_presets";

interface Preset {
    id: string;
    name: string;
    description?: string;
    toxics: ToxicFormValues[];
}

const BUILT_IN_PRESETS: Preset[] = [
    {
        id: "production-meltdown",
        name: "🔥 Production Meltdown",
        description: "Severe latency + bandwidth throttle",
        toxics: [
            {
                name: "latency-meltdown",
                type: "latency",
                stream: "downstream",
                toxicity: 0.5,
                latency: 2000,
                jitter: 500,
            },
            {
                name: "bandwidth-meltdown",
                type: "bandwidth",
                stream: "downstream",
                toxicity: 1.0,
                rate: 50,
            },
        ],
    },
    {
        id: "flaky-network",
        name: "📡 Flaky Network",
        description: "50% connection resets + slow responses",
        toxics: [
            {
                name: "flaky-reset",
                type: "reset_peer",
                stream: "downstream",
                toxicity: 0.5,
            },
            {
                name: "flaky-latency",
                type: "latency",
                stream: "downstream",
                toxicity: 0.7,
                latency: 1000,
                jitter: 800,
            },
        ],
    },
    {
        id: "slow-upstream",
        name: "🐢 Slow Upstream",
        description: "High latency on responses only",
        toxics: [
            {
                name: "slow-response",
                type: "latency",
                stream: "upstream",
                toxicity: 1.0,
                latency: 3000,
                jitter: 0,
            },
        ],
    },
];

function loadPresets(): Preset[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function savePresets(presets: Preset[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

interface PresetManagerProps {
    currentToxic: ToxicFormValues;
    onApplyPreset: (toxics: ToxicFormValues[]) => void;
    onInjectAll: (toxics: ToxicFormValues[]) => Promise<void>;
}

export function PresetManager({ currentToxic, onApplyPreset, onInjectAll }: PresetManagerProps) {
    const [expanded, setExpanded] = useState(false);
    const [userPresets, setUserPresets] = useState<Preset[]>(loadPresets);
    const [saveName, setSaveName] = useState("");
    const [injecting, setInjecting] = useState<string | null>(null);

    function handleSave() {
        if (!saveName.trim()) return;
        const newPreset: Preset = {
            id: `user-${Date.now()}`,
            name: saveName.trim(),
            toxics: [currentToxic],
        };
        const updated = [...userPresets, newPreset];
        setUserPresets(updated);
        savePresets(updated);
        setSaveName("");
    }

    function handleDeletePreset(id: string) {
        const updated = userPresets.filter(p => p.id !== id);
        setUserPresets(updated);
        savePresets(updated);
    }

    async function handleApply(preset: Preset) {
        setInjecting(preset.id);
        try {
            await onInjectAll(preset.toxics);
        } finally {
            setInjecting(null);
        }
    }

    const allPresets = [...BUILT_IN_PRESETS, ...userPresets];

    return (
        <div className="rounded-xl border border-text-100/10 overflow-hidden">
            <button
                onClick={() => setExpanded(e => !e)}
                className="w-full flex items-center justify-between px-4 py-3 bg-text-100/[0.02] hover:bg-text-100/[0.04] transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-accent-500" />
                    <span className="text-xs font-bold text-text-60 uppercase tracking-wider">Advanced Scenario Builder</span>
                    <span className="text-[10px] font-mono text-text-40">— presets & stacked injections</span>
                </div>
                {expanded ? <ChevronUp className="w-3.5 h-3.5 text-text-40" /> : <ChevronDown className="w-3.5 h-3.5 text-text-40" />}
            </button>

            {expanded && (
                <div className="p-4 border-t border-text-100/5 flex flex-col gap-4">
                    {/* Save current config */}
                    <div>
                        <label className="text-xs text-text-40 font-medium mb-2 block">Save Current Config as Preset</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={saveName}
                                onChange={(e) => setSaveName(e.target.value)}
                                placeholder="Preset name…"
                                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                                className="flex-1 h-9 px-3 rounded-lg bg-bg-900/30 border border-text-100/10 text-sm font-mono text-text-100 focus:outline-none focus:border-accent-500/50 placeholder:text-text-100/20"
                            />
                            <button
                                onClick={handleSave}
                                disabled={!saveName.trim()}
                                className="h-9 px-3 rounded-lg bg-accent-500/10 border border-accent-500/20 text-accent-500 hover:bg-accent-500/20 transition-colors disabled:opacity-40 flex items-center gap-1.5 text-sm font-medium"
                            >
                                <Save className="w-3.5 h-3.5" />
                                Save
                            </button>
                        </div>
                    </div>

                    {/* Presets list */}
                    <div className="flex flex-col gap-2">
                        <label className="text-xs text-text-40 font-medium">Available Presets</label>
                        {allPresets.map((preset) => (
                            <div
                                key={preset.id}
                                className="flex items-center gap-3 rounded-xl border border-text-100/8 bg-text-100/[0.02] p-3"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-text-100">{preset.name}</div>
                                    {preset.description && (
                                        <div className="text-xs text-text-40 mt-0.5">{preset.description}</div>
                                    )}
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {preset.toxics.map((t, i) => (
                                            <span key={i} className="text-[10px] font-mono bg-text-100/5 border border-text-100/8 rounded px-1.5 py-0.5 text-text-40">
                                                {t.type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                        onClick={() => onApplyPreset(preset.toxics)}
                                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20 text-accent-500 hover:bg-accent-500/20 transition-colors"
                                        title="Load to form"
                                    >
                                        LOAD
                                    </button>
                                    <button
                                        onClick={() => handleApply(preset)}
                                        disabled={injecting === preset.id}
                                        className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors disabled:opacity-40"
                                        title="Inject all toxics in this preset"
                                    >
                                        {injecting === preset.id ? "…" : "INJECT ALL"}
                                    </button>
                                    {!preset.id.startsWith("user-") ? null : (
                                        <button
                                            onClick={() => handleDeletePreset(preset.id)}
                                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-text-40 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
