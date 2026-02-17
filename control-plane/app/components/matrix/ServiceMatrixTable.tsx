"use client";

import { useState } from "react";
import { Switch } from "../ui/Switch";
import { AlertCircle, Database, Network, Cpu, Server } from "lucide-react";

type Service = {
    id: string;
    name: string;
    type: "app" | "infra" | "gateway";
};

const SERVICES: Service[] = [
    { id: "cbs", name: "CBS Core", type: "app" },
    { id: "otp", name: "OTP Service", type: "app" },
    { id: "jwt", name: "JWT Auth", type: "app" },
    { id: "payment", name: "Payment Orchestrator", type: "app" },
    { id: "gateway", name: "API Gateway", type: "gateway" },
    { id: "postgres", name: "Postgres DB", type: "infra" },
    { id: "redis", name: "Redis Cache", type: "infra" },
];

const FAILURE_Types = [
    { id: "oom", label: "OOM", icon: AlertCircle },
    { id: "cpu", label: "CPU", icon: Cpu },
    { id: "threads", label: "Threads", icon: Server },
    { id: "db_pool", label: "DB Pool", icon: Database },
    { id: "latency", label: "Latency", icon: Network },
];

export function ServiceMatrixTable() {
    const [matrixState, setMatrixState] = useState<Record<string, Record<string, boolean>>>({});

    const toggle = (serviceId: string, failureId: string) => {
        setMatrixState(prev => ({
            ...prev,
            [serviceId]: {
                ...prev[serviceId],
                [failureId]: !prev[serviceId]?.[failureId]
            }
        }));
    };

    return (
        <div className="rounded-xl border border-panel-700 bg-panel-800/50 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-panel-800 border-b border-panel-700">
                            <th className="p-4 py-5 font-bold text-text-100 min-w-[200px] sticky left-0 bg-panel-800 z-10">
                                Service
                            </th>
                            {FAILURE_Types.map((ft) => {
                                const Icon = ft.icon;
                                return (
                                    <th key={ft.id} className="p-4 py-5 font-medium text-text-60 text-xs uppercase tracking-wider text-center min-w-[100px]">
                                        <div className="flex flex-col items-center gap-2">
                                            <Icon className="w-4 h-4 text-text-40" />
                                            {ft.label}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-panel-700/50">
                        {SERVICES.map((service) => (
                            <tr key={service.id} className="hover:bg-panel-700/30 transition-colors">
                                <td className="p-4 font-medium text-text-100 sticky left-0 bg-panel-800/95 backdrop-blur-sm z-10 border-r border-panel-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${service.type === "app" ? "bg-accent-500" : service.type === "infra" ? "bg-purple-500" : "bg-blue-500"}`} />
                                        {service.name}
                                    </div>
                                </td>
                                {FAILURE_Types.map((ft) => {
                                    const isActive = matrixState[service.id]?.[ft.id];
                                    // Logic to disable incompatible failures (e.g. DB Pool on Redis?)
                                    // For MVP, enable all or loosely map.
                                    const disabled = (service.type === "infra" && ft.id === "threads"); // Example rule

                                    return (
                                        <td key={ft.id} className="p-4 text-center">
                                            <div className="flex justify-center">
                                                <Switch
                                                    checked={!!isActive}
                                                    onCheckedChange={() => toggle(service.id, ft.id)}
                                                    disabled={disabled}
                                                />
                                            </div>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t border-panel-700 bg-panel-800 flex justify-between items-center text-xs text-text-60">
                <div className="flex gap-4">
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-accent-500"></span> Application</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500"></span> Infra</div>
                    <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Gateway</div>
                </div>
                <div>
                    Showing {SERVICES.length} services
                </div>
            </div>
        </div>
    );
}
