"use client";

import Link from "next/link";
import { Activity, Globe, Server, Shield, AlertTriangle, Zap } from "lucide-react";

export default function Home() {
    return (
        <div className="space-y-12">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="text-accent-500 font-bold uppercase tracking-wider text-xs mb-2">
                    Control Plane
                </div>
                <h1 className="text-5xl font-extrabold text-text-100 tracking-tight">
                    Observability Platform
                </h1>
                <p className="text-text-60 mt-4 max-w-3xl mx-auto text-lg">
                    Monitor system health, manage failure injections, and track user experiences
                    across your microservices architecture.
                </p>
            </div>

            {/* Main Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* APM Section */}
                <Link
                    href="/apm"
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-panel-700 to-panel-800 p-8 border border-panel-600/50 hover:border-accent-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/10"
                >
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-accent-500/10 flex items-center justify-center border border-accent-500/20 group-hover:border-accent-500/50 transition-colors mb-6">
                            <Server className="w-6 h-6 text-accent-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-text-100 mb-3">APM</h2>

                        <p className="text-text-60 mb-6">
                            Application Performance Monitoring. Inject network-level chaos and manage
                            service-specific failure scenarios to test system resilience.
                        </p>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                                <span className="text-text-60">Toxiproxy Network Chaos</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                                <span className="text-text-60">OTP & JWT Service Chaos</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                                <span className="text-text-60">Real-time Status Monitoring</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                                <span className="text-text-60">Activity Log Console</span>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 text-accent-500 font-medium group-hover:gap-3 transition-all">
                            <span>Explore APM Control Panel</span>
                            <Zap className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-accent-500/5 rounded-full blur-3xl group-hover:bg-accent-500/10 transition-colors" />
                </Link>

                {/* BRUM Section */}
                <Link
                    href="/brum"
                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-panel-700 to-panel-800 p-8 border border-panel-600/50 hover:border-accent-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-accent-500/10"
                >
                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-lg bg-accent-500/10 flex items-center justify-center border border-accent-500/20 group-hover:border-accent-500/50 transition-colors mb-6">
                            <Globe className="w-6 h-6 text-accent-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-text-100 mb-3">BRUM</h2>

                        <p className="text-text-60 mb-6">
                            Browser Real User Monitoring. Track and analyze user experiences,
                            performance, and errors from real browser sessions.
                        </p>

                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-text-40" />
                                <span className="text-text-40">Browser performance metrics</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-text-40" />
                                <span className="text-text-40">User session tracking</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-text-40" />
                                <span className="text-text-40">Error and crash reporting</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-text-40" />
                                <span className="text-text-40">Real user interactions</span>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 text-accent-500 font-medium group-hover:gap-3 transition-all">
                            <span>Explore BRUM Control Plane</span>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-accent-500/5 rounded-full blur-3xl group-hover:bg-accent-500/10 transition-colors" />
                </Link>
            </div>

            {/* Features Preview */}
            <div className="rounded-2xl bg-panel-700 p-8 border border-panel-600/50">
                <h3 className="font-bold text-text-100 mb-6 text-xl">Platform Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-text-100 font-medium">
                            <Activity className="w-4 h-4" />
                            <span>Real-time Monitoring</span>
                        </div>
                        <p className="text-sm text-text-60">
                            Live metrics and event tracking with minimal latency
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-text-100 font-medium">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Failure Injection</span>
                        </div>
                        <p className="text-sm text-text-60">
                            Controlled chaos engineering to test system resilience
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-text-100 font-medium">
                            <Shield className="w-4 h-4" />
                            <span>Guardrails</span>
                        </div>
                        <p className="text-sm text-text-60">
                            Safety mechanisms to prevent catastrophic failures
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
