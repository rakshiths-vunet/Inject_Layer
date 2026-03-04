import React, { useState, useEffect } from "react";
import { InjectionField, API_TEMPLATES, HTTP_METHODS } from "../../brum/injectionCategories";
import { ScenarioInjection } from "./CreateScenarioModal";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { MultiSelect, type Option } from "./ui/MultiSelect";
import { DynamicList } from "./ui/DynamicList";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Info, Terminal, Search, ChevronRight, Layout, Activity, Smartphone, Layers, Eye, Zap, Globe, Cpu, AlertTriangle, Key, Shield, HardDrive, Share2, Type, Box } from "lucide-react";
import { cn } from "./ui/utils";

interface ScenarioFormControlsProps {
    injection: ScenarioInjection;
    onChange: (key: string, value: any) => void;
    globalSites: string[];
}

export function ScenarioFormControls({ injection, onChange, globalSites }: ScenarioFormControlsProps) {
    // We need to render controls grouped by TARGET, PARAMETERS, SITE SCOPE
    // The injection.fields holds all defined fields.
    const [assetsList, setAssetsList] = useState<Option[]>([]);

    const fields = injection.fields;

    // Separate fields by semantic group (Target vs Params)
    const targetFields = fields.filter(f =>
        ["target_type", "custom_regex", "assets_selected", "api_endpoints", "methods", "target", "uri", "uri_regex", "extension", "location_tag"].includes(f.id)
    );

    const paramFields = fields.filter(f => !targetFields.includes(f));

    // Helper to check conditions
    const isFieldVisible = (field: InjectionField) => {
        if (!field.condition) return true;
        return injection.config[field.condition.field] === field.condition.value;
    };

    // Effect for fetching assets based on effective site scope
    useEffect(() => {
        let isCancelled = false;
        const fetchAssets = async () => {
            // Determine the raw site scope explicitly from globalSites or restricted_sites
            const rawScope: string[] =
                injection.config.restricted_sites !== undefined
                    ? injection.config.restricted_sites
                    : globalSites;

            // STRICTLY use what the user has explicitly selected. 
            // We do not fallback to all apps anymore, as per user requirement.
            const appsToFetch = rawScope.filter(s => s !== 'global');

            if (appsToFetch.length === 0) {
                setAssetsList([]);
                return;
            }

            try {
                // Fetch assets in parallel for maximum performance
                const responses = await Promise.all(
                    appsToFetch.map(app =>
                        fetch(`/api/chaos/assets?app=${encodeURIComponent(app)}`).then(res => res.json().then(data => ({ app, data })))
                    )
                );

                if (isCancelled) return;

                const allAssets: Option[] = [];
                const seenValues = new Set<string>();

                const appColors: Record<string, string> = {
                    'angular-v1': '#DD0031',
                    'angular-v2': '#C3002F',
                    'vue-v1': '#41B883',
                    'vue-v2': '#35495E',
                    'react-v1': '#61DAFB',
                    'react-v2': '#282C34',
                    'next-v1': '#000000',
                    'next-v2': '#555555',
                    'nuxt-v1': '#00C58E',
                    'nuxt-v2': '#2F495E',
                };

                const getTypeColor = (asset: string) => {
                    if (asset.endsWith('.js')) return '#B5A642';
                    if (asset.endsWith('.css')) return '#264DE4';
                    if (asset.match(/\.(png|jpg|jpeg|svg|gif|ico)$/i)) return '#9C27B0';
                    return '#888888';
                };

                const getTypeTag = (asset: string) => {
                    if (asset.endsWith('.js')) return 'JS';
                    if (asset.endsWith('.css')) return 'CSS';
                    if (asset.match(/\.(png|jpg|jpeg|svg|gif|ico)$/i)) return 'Img';
                    return 'File';
                };

                for (const res of responses) {
                    const { app, data } = res;
                    if (data.ok && data.assets) {
                        data.assets.forEach((asset: string) => {
                            if (!seenValues.has(asset)) {
                                seenValues.add(asset);
                                allAssets.push({
                                    label: asset,
                                    value: asset,
                                    tag: app,
                                    tagColor: appColors[app] || '#666666',
                                    typeTag: getTypeTag(asset),
                                    typeColor: getTypeColor(asset)
                                });
                            }
                        });
                    }
                }
                setAssetsList(allAssets);
            } catch (err) {
                console.error("Failed to fetch assets", err);
            }
        };

        fetchAssets();
        return () => { isCancelled = true; };
    }, [injection.config.restricted_sites, globalSites]);

    return (
        <div className="space-y-8">

            {/* INJECTION METADATA */}
            <div className="space-y-4">
                <div className="text-xs font-bold text-text-100/50 tracking-widest uppercase border-b border-text-100/10 pb-2">Rule Metadata</div>
                <div className="bg-panel-600 p-4 rounded-xl border border-text-100/5 space-y-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-text-100/90">Rule Name (Optional)</label>
                        <Input
                            type="text"
                            value={injection.config.custom_name ?? ''}
                            onChange={(e) => onChange('custom_name', e.target.value)}
                            placeholder={injection.title || "Enter a custom name"}
                            className="bg-panel-800 border-text-100/10 text-text-100"
                        />
                    </div>
                </div>
            </div>

            {/* TARGET SECTION */}
            {targetFields.length > 0 && (
                <div className="space-y-4">
                    <div className="text-xs font-bold text-text-100/50 tracking-widest uppercase border-b border-text-100/10 pb-2">Target</div>
                    <div className="bg-panel-600 p-4 rounded-xl border border-text-100/5 space-y-4">
                        {targetFields.filter(isFieldVisible).map(field => (
                            <FieldControl
                                key={field.id}
                                field={field}
                                value={injection.config[field.id]}
                                onChange={(val) => onChange(field.id, val)}
                                assetsList={assetsList}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* PARAMETERS SECTION */}
            {paramFields.length > 0 && (
                <div className="space-y-4">
                    <div className="text-xs font-bold text-text-100/50 tracking-widest uppercase border-b border-text-100/10 pb-2">Parameters</div>
                    <div className="bg-panel-600 p-4 rounded-xl border border-text-100/5 space-y-6">

                        {/* Custom Visualizations based on Injection ID */}
                        <CustomVisualizations injection={injection} />

                        <div className="grid gap-6">
                            {paramFields.filter(isFieldVisible).map(field => (
                                <FieldControl
                                    key={field.id}
                                    field={field}
                                    value={injection.config[field.id]}
                                    onChange={(val) => onChange(field.id, val)}
                                    assetsList={assetsList}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SITE SCOPE SECTION */}
            <div className="space-y-4">
                <div className="text-xs font-bold text-text-100/50 tracking-widest uppercase border-b border-text-100/10 pb-2">Site Scope</div>
                <div className="bg-panel-600 p-4 rounded-xl border border-text-100/5 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="radio"
                                id={`scope-all-${injection.instanceId}`}
                                name={`scope-${injection.instanceId}`}
                                checked={!injection.config.restricted_sites}
                                onChange={() => onChange('restricted_sites', undefined)}
                                className="w-4 h-4 text-accent-500 bg-text-100/5 border-text-100/20 focus:ring-accent-500/30"
                            />
                            <label htmlFor={`scope-all-${injection.instanceId}`} className="text-sm font-medium text-text-100/80 transition-colors cursor-pointer select-none hover:text-text-100">
                                Apply to all sites in scenario
                            </label>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="radio"
                                id={`scope-restrict-${injection.instanceId}`}
                                name={`scope-${injection.instanceId}`}
                                checked={!!injection.config.restricted_sites}
                                onChange={() => onChange('restricted_sites', [])}
                                className="w-4 h-4 text-accent-500 bg-panel-700 border-text-100/20 focus:ring-accent-500/30"
                            />
                            <label htmlFor={`scope-restrict-${injection.instanceId}`} className="text-sm font-medium text-text-100/80 transition-colors cursor-pointer select-none hover:text-text-100">
                                Restrict to specific sites
                            </label>
                        </div>
                    </div>

                    {/* Site Multiselect (only shown if restricted) */}
                    {injection.config.restricted_sites !== undefined && (() => {
                        // Strictly use globalSites as per user request completely removing allApps fallback
                        const realGlobal = globalSites.filter(s => s !== 'global');
                        const siteOptions = realGlobal.map(s => ({
                            label: s.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                            value: s
                        }));
                        return (
                            <div className="pt-2">
                                <MultiSelect
                                    options={siteOptions}
                                    selected={injection.config.restricted_sites || []}
                                    onChange={(val) => onChange('restricted_sites', val)}
                                    placeholder={siteOptions.length === 0 ? 'No apps selected in Source App limit' : 'Select sites...'}
                                />
                                <p className="text-xs text-accent-500/60 mt-2">
                                    Note: Injections only apply to the intersection of scenario sites and restricted sites.
                                </p>
                            </div>
                        );
                    })()}
                </div>
            </div>

        </div>
    );
}

// Custom Visualizations based on requirements
function CustomVisualizations({ injection }: { injection: ScenarioInjection }) {
    if (injection.id === 'uniform-random') {
        const min = Number(injection.config.min_delay) || 0;
        const max = Number(injection.config.max_delay) || 0;
        const widthPercentage = Math.min(100, Math.max(0, ((max - min) / 5000) * 100)); // Assuming 5000ms is max visual range
        const leftPercentage = Math.min(100, Math.max(0, (min / 5000) * 100));

        return (
            <div className="mb-4 p-4 bg-panel-800 rounded-lg border border-text-100/5">
                <label className="text-xs text-text-100/50 mb-2 block font-medium">Expected Delay Range (Visualized)</label>
                <div className="h-4 bg-text-100/5 rounded-full relative w-full overflow-hidden">
                    <div
                        className="absolute top-0 bottom-0 bg-[#FFB84D] opacity-80 rounded-full transition-all"
                        style={{ left: `${leftPercentage}%`, width: `${widthPercentage}%` }}
                    />
                </div>
                <div className="flex justify-between text-[10px] text-text-100/40 mt-1 font-mono">
                    <span>0ms</span>
                    <span>5000ms+</span>
                </div>
            </div>
        );
    }

    if (injection.id === 'normal-distribution') {
        return (
            <div className="mb-4 flex items-center gap-4 bg-panel-800 p-4 rounded-lg border border-text-100/5">
                <div className="flex-1">
                    <label className="text-xs text-text-100/50 mb-1 block font-medium">Distribution Curve</label>
                    <div className="text-sm text-text-100/80">Most requests will take ~{injection.config.mean || 0}ms.</div>
                </div>
                <div className="w-24 h-12 opacity-80 text-[#FFB84D]">
                    <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                        {/* Simple bell curve approximation path */}
                        <path d="M 0 50 C 20 50, 30 5, 50 5 C 70 5, 80 50, 100 50" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                </div>
            </div>
        );
    }

    if (injection.id === 'step-bimodal') {
        const normal = injection.config.normal_delay || 0;
        const spike = injection.config.spike_delay || 0;
        const prob = injection.config.spike_probability || 0;

        return (
            <div className="mb-4 p-4 bg-panel-800 rounded-lg border border-text-100/5">
                <label className="text-xs text-text-100/50 mb-2 block font-medium">Traffic Impact Timeline</label>
                <div className="flex items-end h-8 gap-1 opacity-80">
                    {Array.from({ length: 40 }).map((_, i) => {
                        const isSpike = Math.random() * 100 < prob; // Random visual representation
                        const height = isSpike ? '100%' : '30%';
                        const color = isSpike ? '#FF6B6B' : '#52D890';
                        return (
                            <div
                                key={i}
                                className="flex-1 rounded-t-sm transition-all"
                                style={{ height, backgroundColor: color }}
                            />
                        );
                    })}
                </div>
            </div>
        );
    }

    return null;
}

// Extracted Field Control
function FieldControl({ field, value, onChange, assetsList }: { field: InjectionField, value: any, onChange: (val: any) => void, assetsList?: Option[] }) {
    const [apiEndpointMode, setApiEndpointMode] = React.useState<'template' | 'custom'>('template');

    if (field.type === 'info') {
        return (
            <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{field.defaultValue}</p>
            </div>
        );
    }

    // Special Component for API Endpoints with Templates
    if (field.id === 'uri_regex' || (field.id === 'custom_regex' && field.condition?.value === 'regex')) {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-text-100/90">API Endpoint / URI</label>
                    <div className="flex bg-panel-800 p-1 rounded-lg border border-text-100/5">
                        <button
                            className={cn(
                                "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                                apiEndpointMode === 'template' ? "bg-text-100/10 text-text-100 shadow-sm" : "text-text-100/40 hover:text-text-100/60"
                            )}
                            onClick={() => setApiEndpointMode('template')}
                        >
                            Templates
                        </button>
                        <button
                            className={cn(
                                "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                                apiEndpointMode === 'custom' ? "bg-text-100/10 text-text-100 shadow-sm" : "text-text-100/40 hover:text-text-100/60"
                            )}
                            onClick={() => setApiEndpointMode('custom')}
                        >
                            Custom
                        </button>
                    </div>
                </div>

                {apiEndpointMode === 'template' && (
                    <Select onValueChange={(val) => {
                        // For API targets, we might want to automatically escape it for PCRE
                        const escapedVal = val.replace(/\//g, '\\/');
                        onChange(escapedVal);
                    }}>
                        <SelectTrigger className="bg-panel-800 border-text-100/10 text-text-100">
                            <SelectValue placeholder="Select API pattern..." />
                        </SelectTrigger>
                        <SelectContent className="bg-panel-600 border-text-100/10 max-h-[300px]">
                            {Object.entries(API_TEMPLATES).map(([category, items]) => (
                                <SelectGroup key={category}>
                                    <SelectLabel className="text-text-100/40 text-[10px] uppercase font-bold tracking-widest px-2 py-2">
                                        {category}
                                    </SelectLabel>
                                    {items.map(item => (
                                        <SelectItem key={item} value={item} className="text-text-100 normal-case font-normal">{item}</SelectItem>
                                    ))}
                                </SelectGroup>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-100/30 uppercase tracking-widest">URI Regex (PCRE)</label>
                    <Input
                        type="text"
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="e.g. gateway\/auth\/login"
                        className="bg-panel-800 border-text-100/10 text-text-100 font-mono text-sm"
                    />
                    <p className="text-[10px] text-text-100/30 italic">Matched using PCRE. Remember to escape slashes as \/.</p>
                </div>
            </div>
        );
    }


    if (field.type === 'slider') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-text-100/90">
                        {field.label}
                    </label>
                    <div className="flex items-center gap-1 group">
                        {/* Editable number input overlay could go here, for now just display */}
                        <span className="text-sm font-bold text-accent-500 font-mono group-hover:bg-text-100/10 px-2 py-0.5 rounded transition-colors cursor-text">
                            {value !== undefined ? value : field.defaultValue}{field.unit}
                        </span>
                    </div>
                </div>
                <Slider
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={[value !== undefined ? value : field.defaultValue]}
                    onValueChange={(vals) => onChange(vals[0])}
                />
                {(field.min !== undefined && field.max !== undefined && field.unit === '%') && (
                    <div className="flex justify-between text-[10px] text-text-100/40 font-medium">
                        <span>0% ← Never</span>
                        <span>Always → 100%</span>
                    </div>
                )}
            </div>
        );
    }

    if (field.type === 'number') {
        // Optional numeric fields might have a toggle "Enable/Disable" - if they don't have a defaultValue but are optional.
        return (
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-text-100/90">{field.label}</label>
                    {field.unit && <span className="text-[10px] text-text-100/40 uppercase font-bold">{field.unit}</span>}
                </div>
                <Input
                    type="number"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                    placeholder={field.placeholder ?? String(field.defaultValue || '')}
                    className="bg-panel-800 border-text-100/10 text-text-100 font-mono"
                />
            </div>
        );
    }

    if (field.type === 'text') {
        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-100/90">{field.label}</label>
                <Input
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder ?? String(field.defaultValue || '')}
                    className="bg-panel-800 border-text-100/10 text-text-100"
                />
            </div>
        );
    }

    if (field.type === 'select') {
        // If it's a small enum (<=4), we could render a segmented control. 
        // The prompt says "Segmented button group (<=4 options)".
        if (field.options && field.options.length <= 4) {
            return (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-100/90">{field.label}</label>
                    <div className="flex p-1 bg-panel-800 rounded-lg border border-text-100/5 w-full">
                        {field.options.map((opt) => {
                            const isActive = (value ?? field.defaultValue) === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => onChange(opt.value)}
                                    className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all truncate px-2
                    ${isActive ? 'bg-panel-600 text-text-100 shadow-sm border border-text-100/10' : 'text-text-100/40 hover:text-text-100/70'}
                  `}
                                >
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-100/90">{field.label}</label>
                <Select value={value ?? field.defaultValue} onValueChange={onChange}>
                    <SelectTrigger className="bg-panel-800 border-text-100/10 text-text-100">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-panel-600 border-text-100/10 text-text-100">
                        {field.options?.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
    }

    if (field.type === 'multiselect') {
        // Special check for HTTP Methods (checkbox pill group)
        if (field.id === 'methods') {
            const selectedMethods = value || field.defaultValue || [];
            return (
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-text-100/90">{field.label}</label>
                    <div className="flex flex-wrap gap-2">
                        {field.options?.map(opt => {
                            const isSelected = selectedMethods.includes(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => {
                                        const next = isSelected
                                            ? selectedMethods.filter((m: string) => m !== opt.value)
                                            : [...selectedMethods, opt.value];
                                        onChange(next);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border
                    ${isSelected
                                            ? "bg-[#6B9AFF] border-[#6B9AFF] text-bg-900"
                                            : "bg-transparent border-text-100/10 text-text-100/60 hover:text-text-100 hover:border-text-100/30"
                                        }`}
                                >
                                    {isSelected ? '✓ ' : ''}{opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Default multiselect
        const multiselectOptions = field.id === 'assets_selected' ? (assetsList || []) : (field.options || []);
        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-100/90">{field.label}</label>
                <MultiSelect
                    options={multiselectOptions}
                    selected={value || []}
                    onChange={onChange}
                />
            </div>
        );
    }

    if (field.type === 'dynamic_list') {
        return (
            <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-text-100/90">{field.label}</label>
                <DynamicList
                    items={value || []}
                    onChange={onChange}
                    options={field.options}
                    placeholder={field.placeholder}
                />
            </div>
        );
    }

    if (field.type === 'checkbox') {
        return (
            <div className="flex items-center gap-3 p-3 bg-panel-800 border border-text-100/5 rounded-lg">
                <Checkbox
                    checked={value ?? field.defaultValue ?? false}
                    onCheckedChange={onChange}
                />
                <label className="text-sm font-medium text-text-100/90 flex-1 cursor-pointer select-none" onClick={() => onChange(!(value ?? field.defaultValue ?? false))}>
                    {field.label}
                </label>
            </div>
        );
    }

    if (field.type === 'textarea') {
        // For JS Injection / Custom JSON, we might want a monaco-lite textarea
        // The prompt requested a monaco-lite code textarea with syntax highlighting etc.
        const isCode = field.id === 'script' || field.id === 'body';

        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-text-100/90">{field.label}</label>
                    {isCode && (
                        <div className="flex items-center gap-1.5 text-xs text-accent-500 bg-accent-500/10 px-2 py-1 rounded-md font-medium">
                            <Terminal className="w-3.5 h-3.5" />
                            {field.id === 'script' ? '⚠️ Custom JS runs in target page' : '{} View Raw'}
                        </div>
                    )}
                </div>
                <textarea
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className={`bg-bg-900 border border-text-100/10 text-text-100 rounded-lg p-3 min-h-[120px] focus:ring-1 focus:ring-accent-500/30 outline-none stylish-scrollbar
            ${isCode ? 'font-mono text-sm leading-relaxed text-success-500' : ''}`}
                />
            </div>
        );
    }

    return null;
}
