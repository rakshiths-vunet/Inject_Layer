"use client";

import { Save, Play, Clock, AlertTriangle } from "lucide-react";

export function ConfigurationForm({ serviceId }: { serviceId: string }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Main Settings Panel */}
                <div className="rounded-xl border border-panel-700 bg-panel-800 p-6">
                    <h2 className="text-xl font-bold text-text-100 mb-6 flex items-center gap-2">
                        <span className="w-2 h-6 bg-accent-500 rounded-full" />
                        Injection Parameters
                    </h2>

                    <div className="space-y-6">
                        {/* Failure Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-text-60 tracking-wider">Failure Type</label>
                                <select className="w-full bg-panel-700 border border-panel-600 text-text-100 rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none">
                                    <option>Network Latency</option>
                                    <option>CPU Throttle</option>
                                    <option>Packet Drop</option>
                                    <option>OOM (Out of Memory)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-text-60 tracking-wider">Target Component</label>
                                <input
                                    disabled
                                    value={serviceId.toUpperCase()}
                                    className="w-full bg-panel-700/50 border border-panel-600 text-text-60 rounded-lg p-3 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Intensity & Duration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-text-60 tracking-wider">Latency (ms)</label>
                                <input
                                    type="number"
                                    defaultValue={400}
                                    className="w-full bg-panel-700 border border-panel-600 text-text-100 rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-text-60 tracking-wider">Duration (seconds)</label>
                                <input
                                    type="number"
                                    defaultValue={300}
                                    className="w-full bg-panel-700 border border-panel-600 text-text-100 rounded-lg p-3 focus:ring-2 focus:ring-accent-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Blast Radius */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase text-text-60 tracking-wider">Blast Radius</label>
                            <div className="grid grid-cols-3 gap-4">
                                {['Single Pod', '25% of Pods', 'All Pods (Danger)'].map((option, i) => (
                                    <label key={i} className={`
                      relative flex items-center justify-center p-4 rounded-lg border cursor-pointer transition-all
                      ${i === 1 ? 'bg-accent-500/10 border-accent-500 text-text-100' : 'bg-panel-700 border-panel-600 text-text-60 hover:bg-panel-600'}
                    `}>
                                        <input type="radio" name="radius" className="sr-only" defaultChecked={i === 1} />
                                        <span className="font-medium text-sm">{option}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Schedule & Safety */}
                <div className="rounded-xl border border-panel-700 bg-panel-800 p-6">
                    <h2 className="text-lg font-bold text-text-100 mb-4">Safety & Scheduling</h2>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-panel-700/30 border border-panel-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-accent-500/10 text-accent-500">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-text-100">Auto-Revert</div>
                                <div className="text-xs text-text-60">Automatically rollback if error rate {'>'} 5%</div>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" defaultChecked className="toggle-checkbox w-6 h-6 rounded border-panel-600 bg-panel-700 text-accent-500 focus:ring-offset-0 focus:ring-0" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary / Confirmation */}
            <div className="space-y-6">
                <div className="rounded-xl border border-panel-700 bg-panel-800 p-6 sticky top-24">
                    <h3 className="font-bold text-text-100 mb-4">Injection Summary</h3>
                    <div className="space-y-4 text-sm mb-8">
                        <div className="flex justify-between pb-2 border-b border-panel-700">
                            <span className="text-text-60">Target</span>
                            <span className="text-text-100 font-medium">{serviceId}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-panel-700">
                            <span className="text-text-60">Type</span>
                            <span className="text-text-100 font-medium">Network Latency</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-panel-700">
                            <span className="text-text-60">Duration</span>
                            <span className="text-text-100 font-medium">5m 00s</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b border-panel-700">
                            <span className="text-text-60">Estimated Impact</span>
                            <span className="text-yellow-500 font-bold">Medium</span>
                        </div>
                    </div>

                    <button className="w-full py-4 rounded-xl bg-accent-500 hover:bg-accent-400 text-bg-900 font-bold text-lg shadow-[0_4px_20px_rgba(255,200,87,0.2)] hover:shadow-[0_4px_25px_rgba(255,200,87,0.4)] transition-all flex items-center justify-center gap-2 mb-3">
                        <Play className="w-5 h-5 fill-current" />
                        Start Injection
                    </button>

                    <button className="w-full py-3 rounded-xl bg-panel-700 hover:bg-panel-600 text-text-100 font-medium transition-colors flex items-center justify-center gap-2">
                        <Save className="w-4 h-4" />
                        Save as Template
                    </button>

                    <div className="mt-6 p-3 rounded bg-red-500/10 border border-red-500/20 flex gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400 leading-relaxed">
                            Warning: This will impact production traffic. Ensure you have approval before proceeding.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
