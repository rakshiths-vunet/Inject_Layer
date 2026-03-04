import React, { useMemo } from "react";
import { ScenarioInjection } from "./CreateScenarioModal";
import { AlertTriangle, List, CheckCircle2 } from "lucide-react";

interface ScenarioSummaryProps {
    injections: ScenarioInjection[];
    sites: string[];
}

export function ScenarioSummary({ injections, sites }: ScenarioSummaryProps) {

    // Calculate conflicts and summary
    const { summaryItems, conflicts } = useMemo(() => {
        const items = injections.map(inj => {
            // Find probability
            let prob = "100%";
            if (inj.config.probability !== undefined) prob = `${inj.config.probability}%`;
            if (inj.config.spike_probability !== undefined) prob = `${inj.config.spike_probability}%`;

            return {
                id: inj.instanceId,
                title: inj.title,
                prob,
                enabled: inj.config.enabled !== false,
                icon: '⚡' // simplification
            };
        });

        const conflictList: string[] = [];

        // Very basic conflict detection: Two rules active on same endpoint
        const endpointMap = new Map<string, string[]>();

        injections.forEach(inj => {
            if (inj.config.enabled === false) return;

            const targetType = inj.config.target_type;
            if (targetType === 'api') {
                let endpoints = inj.config.api_endpoints || [];
                // Resilience: handle case where it might be a string (incorrectly saved previously)
                if (typeof endpoints === 'string') {
                    endpoints = [endpoints];
                }

                if (Array.isArray(endpoints)) {
                    endpoints.forEach((ep: string) => {
                        if (ep && typeof ep === 'string') {
                            if (!endpointMap.has(ep)) endpointMap.set(ep, []);
                            endpointMap.get(ep)!.push(inj.title);
                        }
                    });
                }
            } else if (targetType === 'global') {
                if (!endpointMap.has('Global')) endpointMap.set('Global', []);
                endpointMap.get('Global')!.push(inj.title);
            }
        });

        endpointMap.forEach((titles, ep) => {
            if (titles.length > 1) {
                if (ep === 'Global') {
                    conflictList.push(`Multiple global rules detected (${titles.join(', ')}).`);
                } else {
                    conflictList.push(`Two or more rules target the same endpoint: ${ep}`);
                }
            }
        });

        return { summaryItems: items, conflicts: conflictList };
    }, [injections]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-text-100/90 font-bold text-sm">
                <List className="w-4 h-4 text-accent-500" />
                Scenario Summary
            </div>

            <div className="bg-panel-700 rounded-xl border border-text-100/5 overflow-hidden text-sm">
                <div className="p-3 border-b border-text-100/5 bg-text-100/[0.02]">
                    <span className="text-text-100/70 font-medium">
                        {summaryItems.length} injection{summaryItems.length !== 1 ? 's' : ''} active
                    </span>
                </div>

                <div className="p-3 space-y-2 max-h-[150px] overflow-y-auto stylish-scrollbar">
                    {summaryItems.length === 0 ? (
                        <div className="text-text-100/40 text-xs italic">No injections added.</div>
                    ) : (
                        summaryItems.map(item => (
                            <div key={item.id} className={`flex items-center justify-between ${!item.enabled ? 'opacity-40 grayscale' : ''}`}>
                                <div className="flex items-center gap-2 truncate pr-2">
                                    <span className="text-xs">{item.icon}</span>
                                    <span className="text-text-100/90 truncate">{item.title}</span>
                                </div>
                                <div className="text-accent-500 font-mono text-[10px] shrink-0">{item.prob}</div>
                            </div>
                        ))
                    )}
                </div>

                {sites.length > 0 && (
                    <div className="p-3 border-t border-text-100/5 bg-text-100/[0.01]">
                        <div className="text-[10px] uppercase font-bold text-text-100/40 tracking-wider mb-1.5">Sites Scope</div>
                        <div className="flex flex-wrap gap-1">
                            {sites.map(site => (
                                <span key={site} className="text-[10px] bg-text-100/10 text-text-100/70 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                                    {site}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {conflicts.length > 0 ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-red-200">
                        <span className="font-bold text-red-400 block mb-1">Conflict detected:</span>
                        <ul className="list-disc pl-3 space-y-1">
                            {conflicts.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                </div>
            ) : (
                summaryItems.length > 0 && (
                    <div className="bg-[#52D890]/10 border border-[#52D890]/20 rounded-xl p-3 flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#52D890] shrink-0" />
                        <div className="text-xs text-[#52D890]/80 font-medium">
                            No obvious conflicts detected.
                        </div>
                    </div>
                )
            )}
        </div>
    );
}
