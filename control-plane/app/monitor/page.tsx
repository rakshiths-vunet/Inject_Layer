"use client";

import { Activity, ExternalLink, FileText, Minimize2 } from "lucide-react";

export default function MonitorPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-text-100">Observability</h1>
                <p className="text-text-60">Real-time impact analysis and external monitoring links.</p>
            </div>

            {/* Main Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Latency Chart Mockup */}
                <div className="rounded-xl border border-panel-700 bg-panel-800 p-6 flex flex-col h-[300px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-text-100 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-accent-500" />
                            Global Latency (p99)
                        </h3>
                        <div className="text-xs font-mono text-accent-400">420ms</div>
                    </div>

                    <div className="flex-1 flex items-end gap-1 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-accent-500/10 to-transparent pointer-events-none" />
                        {/* Mock Bars */}
                        {Array.from({ length: 40 }).map((_, i) => {
                            const height = 20 + Math.random() * 60; // 20-80%
                            const isSpike = i > 30 && i < 35;
                            const finalHeight = isSpike ? 90 + Math.random() * 10 : height; // Spike at end
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-t-sm transition-all duration-500 ${isSpike ? "bg-red-500" : "bg-panel-600 hover:bg-accent-500"}`}
                                    style={{ height: `${finalHeight}%` }}
                                />
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-text-40 font-mono">
                        <span>-5m</span>
                        <span>Now</span>
                    </div>
                </div>

                {/* Error Rate Chart Mockup */}
                <div className="rounded-xl border border-panel-700 bg-panel-800 p-6 flex flex-col h-[300px]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-text-100 flex items-center gap-2">
                            <AlertIcon />
                            Error Rate
                        </h3>
                        <div className="text-xs font-mono text-red-400">2.4%</div>
                    </div>

                    <div className="flex-1 flex items-end gap-1 overflow-hidden">
                        {/* Mock Line Graph (CSS Clip path or SVG) - using simple bars for simplicity but thinner/red */}
                        {Array.from({ length: 40 }).map((_, i) => {
                            const height = i > 32 ? Math.random() * 40 : 2;
                            return (
                                <div
                                    key={i}
                                    className="flex-1 rounded-t-sm bg-red-500/80"
                                    style={{ height: `${height}%` }}
                                />
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-text-40 font-mono">
                        <span>-5m</span>
                        <span>Now</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Logs Panel */}
                <div className="lg:col-span-2 rounded-xl border border-panel-700 bg-panel-800 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-panel-700 bg-panel-700/50 flex justify-between items-center">
                        <h3 className="font-bold text-text-100 text-sm flex items-center gap-2">
                            <FileText className="w-4 h-4 text-text-60" /> Live Logs
                        </h3>
                        <button className="text-xs text-accent-500 hover:text-accent-400 font-medium">Clear</button>
                    </div>
                    <div className="p-4 space-y-2 font-mono text-xs h-[200px] overflow-y-auto bg-[#0A0A0A]">
                        <div className="text-text-60"><span className="text-panel-500">[10:45:01]</span> <span className="text-blue-400">INFO</span> Gradient service initialization complete.</div>
                        <div className="text-text-60"><span className="text-panel-500">[10:45:05]</span> <span className="text-yellow-400">WARN</span> Latency detected in payment-orchestrator.</div>
                        <div className="text-text-60"><span className="text-panel-500">[10:45:12]</span> <span className="text-red-500">ERR</span> Connection timeout: postgres-pool-1 (5000ms).</div>
                        <div className="text-text-60"><span className="text-panel-500">[10:45:13]</span> <span className="text-blue-400">INFO</span> Retrying connection...</div>
                        <div className="text-text-60"><span className="text-panel-500">[10:45:15]</span> <span className="text-green-500">SUCCESS</span> Connection established.</div>
                    </div>
                </div>

                {/* External Links */}
                <div className="space-y-4">
                    <div className="rounded-xl border border-panel-700 bg-panel-800 p-4">
                        <h3 className="font-bold text-text-100 text-sm mb-4">Deep Dive Tools</h3>
                        <div className="space-y-2">
                            <MonitorLink name="Grafana" url="https://grafana.com" color="text-orange-500" />
                            <MonitorLink name="Kibana" url="https://elastic.co" color="text-pink-500" />
                            <MonitorLink name="Jaeger" url="https://jaegertracing.io" color="text-cyan-500" />
                        </div>
                    </div>

                    <div className="rounded-xl border border-panel-700 bg-panel-800 p-4">
                        <h3 className="font-bold text-text-100 text-sm mb-2">Metrics Export</h3>
                        <p className="text-xs text-text-60 mb-4">Download report of recent chaos experiments.</p>
                        <button className="w-full py-2 rounded-lg border border-panel-600 hover:bg-panel-700 text-text-60 hover:text-text-100 text-xs font-medium transition-colors">
                            Download .CSV
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AlertIcon() {
    return <div className="w-4 h-4 rounded-full border-2 border-red-500 flex items-center justify-center text-[10px] font-bold text-red-500">!</div>
}

function MonitorLink({ name, url, color }: { name: string, url: string, color: string }) {
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 rounded-lg bg-panel-700 hover:bg-panel-600 transition-colors group">
            <span className="text-sm font-medium text-text-100">{name}</span>
            <ExternalLink className={`w-4 h-4 ${color} opacity-75 group-hover:opacity-100`} />
        </a>
    );
}
