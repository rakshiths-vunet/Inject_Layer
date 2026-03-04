"use client";

import { useRef, useEffect } from "react";
import { Terminal, Trash2 } from "lucide-react";
import { useActivityLog } from "../../hooks/useActivityLog";

const STATUS_STYLES: Record<string, string> = {
    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
    info: "text-text-60",
};

const STATUS_PREFIX: Record<string, string> = {
    success: "✓",
    error: "✗",
    warning: "⚠",
    info: "·",
};

export function ActivityLogConsole() {
    const { entries, clear } = useActivityLog();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [entries]);

    return (
        <div className="rounded-2xl bg-panel-800 border border-panel-600/50 flex flex-col overflow-hidden">
            {/* Console header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-text-100/5 bg-bg-900/20 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-text-40" />
                    <span className="text-xs font-mono font-bold text-text-40 uppercase tracking-widest">Activity Log</span>
                    {entries.length > 0 && (
                        <span className="text-[10px] font-mono bg-text-100/5 border border-text-100/10 px-1.5 py-0.5 rounded text-text-40">
                            {entries.length} events
                        </span>
                    )}
                </div>
                {entries.length > 0 && (
                    <button
                        onClick={clear}
                        className="flex items-center gap-1).5 text-[10px] font-mono text-text-40 hover:text-text-100 hover:bg-text-100/5 px-2 py-1 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-3 h-3" />
                        clear
                    </button>
                )}
            </div>

            {/* Log content */}
            <div className="h-48 overflow-y-auto stylish-scrollbar p-3 font-mono text-[11px] leading-relaxed flex flex-col-reverse">
                <div>
                    {entries.length === 0 ? (
                        <div className="text-text-40/50 text-center py-6">No activity yet. Inject a toxic to get started.</div>
                    ) : (
                        entries.slice().reverse().map((entry) => (
                            <div key={entry.id} className="flex items-start gap-2 py-0.5 border-b border-text-100/[0.03] last:border-0">
                                <span className="text-text-40/50 flex-shrink-0 tabular-nums">
                                    {new Date(entry.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                                </span>
                                <span className={`flex-shrink-0 font-bold ${STATUS_STYLES[entry.status] ?? "text-text-60"}`}>
                                    {STATUS_PREFIX[entry.status]}
                                </span>
                                <span className="text-accent-500/80 flex-shrink-0 truncate max-w-[120px]">[{entry.service}]</span>
                                <span className={STATUS_STYLES[entry.status] ?? "text-text-60"}>{entry.action}</span>
                            </div>
                        ))
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    );
}
