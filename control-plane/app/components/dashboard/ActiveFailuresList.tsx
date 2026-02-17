"use client";

import { AlertTriangle, Clock, Server, StopCircle } from "lucide-react";

// Mock data type
type Failure = {
    id: string;
    service: string;
    type: string;
    status: "active" | "scheduled" | "stopping";
    startTime: string;
    duration: string;
    impact: string;
};

const MOCK_FAILURES: Failure[] = [
    {
        id: "1",
        service: "Payment Orchestrator",
        type: "Network Latency (400ms)",
        status: "active",
        startTime: "10:42:00",
        duration: "5m",
        impact: "High"
    },
    {
        id: "2",
        service: "OTP Service",
        type: "CPU Throttle (80%)",
        status: "active",
        startTime: "10:44:30",
        duration: "2m",
        impact: "Medium"
    }
];

export function ActiveFailuresList() {
    return (
        <div className="rounded-xl bg-panel-800 border border-panel-700/50 overflow-hidden">
            <div className="p-4 border-b border-panel-700 flex justify-between items-center bg-panel-800/50">
                <h2 className="text-lg font-bold text-text-100 flex items-center gap-2">
                    <ActivityIcon />
                    Active Injections
                </h2>
                <span className="text-xs font-medium px-2 py-1 rounded bg-red-500/10 text-red-500 border border-red-500/20">
                    {MOCK_FAILURES.length} Active
                </span>
            </div>

            <div className="divide-y divide-panel-700">
                {MOCK_FAILURES.map((failure) => (
                    <div key={failure.id} className="p-4 hover:bg-panel-700/30 transition-colors flex items-center justify-between group">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-text-100">{failure.service}</h3>
                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-panel-700 text-text-60">
                                        {failure.id}
                                    </span>
                                </div>
                                <div className="text-xs text-text-60 mt-0.5">
                                    {failure.type}
                                </div>
                                <div className="flex items-center gap-3 mt-2 text-xs text-text-40">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {failure.duration} remaining
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Server className="w-3 h-3" /> Impact: {failure.impact}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold border border-red-500/20 flex items-center gap-1.5">
                                <StopCircle className="w-3.5 h-3.5" />
                                Stop
                            </button>
                        </div>
                    </div>
                ))}

                {MOCK_FAILURES.length === 0 && (
                    <div className="p-8 text-center text-text-60 text-sm">
                        No active failure injections. System is operating normally.
                    </div>
                )}
            </div>
        </div>
    );
}

function ActivityIcon() {
    return (
        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
    );
}
