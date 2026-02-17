"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Filter, AlertCircle, Info, AlertTriangle, FileText } from "lucide-react";

type LogLevel = "info" | "error" | "warning" | "trace";

type LogEntry = {
    id: string;
    timestamp: string;
    level: LogLevel;
    component: string;
    message: string;
};

const MOCK_COMPONENTS = ["Gateway", "Auth", "Payment", "RiskEngine", "Database"];
const MOCK_MESSAGES = {
    info: ["Request processed successfully", "Health check passed", "Configuration reloaded", "User logged in"],
    error: ["Connection timeout", "Database query failed", "Payment gateway unavailable", "Null pointer exception"],
    warning: ["High latency detected", "Memory usage > 80%", "Rate limit approaching", "Retrying request..."],
    trace: ["Function execution started", "Payload received", "Cache miss", "Rendering component"],
};

export function LiveLogs() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [filter, setFilter] = useState<LogLevel | "all">("all");
    const [search, setSearch] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Generate a random log
    const generateLog = (): LogEntry => {
        const levels: LogLevel[] = ["info", "info", "info", "warning", "error", "trace"];
        const level = levels[Math.floor(Math.random() * levels.length)];
        const component = MOCK_COMPONENTS[Math.floor(Math.random() * MOCK_COMPONENTS.length)];
        const message = MOCK_MESSAGES[level][Math.floor(Math.random() * MOCK_MESSAGES[level].length)];

        return {
            id: Math.random().toString(36).substring(7),
            timestamp: new Date().toLocaleTimeString(),
            level,
            component,
            message,
        };
    };

    // Simulate live logs
    useEffect(() => {
        // Initial logs
        const initialLogs: LogEntry[] = Array.from({ length: 5 }).map(generateLog);
        setLogs(initialLogs);

        const interval = setInterval(() => {
            setLogs((prev) => {
                const newLog = generateLog();
                const newLogs = [...prev, newLog];
                // Keep only last 50 logs to prevent memory issues
                if (newLogs.length > 50) return newLogs.slice(newLogs.length - 50);
                return newLogs;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const filteredLogs = logs.filter((log) => {
        const matchesFilter = filter === "all" || log.level === filter;
        const matchesSearch =
            log.message.toLowerCase().includes(search.toLowerCase()) ||
            log.component.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getLevelColor = (level: LogLevel) => {
        switch (level) {
            case "error":
                return "text-red-500 bg-red-500/10 border-red-500/20";
            case "warning":
                return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
            case "info":
                return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            case "trace":
                return "text-gray-400 bg-gray-500/10 border-gray-500/20";
        }
    };

    const getLevelIcon = (level: LogLevel) => {
        switch (level) {
            case "error":
                return <AlertCircle className="w-3 h-3" />;
            case "warning":
                return <AlertTriangle className="w-3 h-3" />;
            case "info":
                return <Info className="w-3 h-3" />;
            case "trace":
                return <FileText className="w-3 h-3" />;
        }
    };

    return (
        <div className="rounded-xl bg-panel-700 border border-panel-600/50 flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-panel-600/50 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-text-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Live Logs
                    </h3>
                    <span className="text-xs text-text-60 bg-panel-800 px-2 py-1 rounded-full border border-panel-600">
                        {logs.length} events
                    </span>
                </div>

                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-60" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-panel-800 border border-panel-600 rounded-lg pl-9 pr-3 py-1.5 text-sm text-text-100 placeholder-text-60 focus:outline-none focus:border-accent-500 transition-colors"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as LogLevel | "all")}
                        className="bg-panel-800 border border-panel-600 rounded-lg px-3 py-1.5 text-sm text-text-100 focus:outline-none focus:border-accent-500 transition-colors cursor-pointer"
                    >
                        <option value="all">All Levels</option>
                        <option value="error">Error</option>
                        <option value="warning">Warning</option>
                        <option value="info">Info</option>
                        <option value="trace">Trace</option>
                    </select>
                </div>
            </div>

            {/* Logs List */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar"
            >
                {filteredLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-text-60 text-sm">
                        <Search className="w-8 h-8 mb-2 opacity-50" />
                        No logs match your filters
                    </div>
                ) : (
                    filteredLogs.map((log) => (
                        <div
                            key={log.id}
                            className="group flex items-start gap-3 p-2 rounded-lg hover:bg-panel-600/50 transition-colors text-xs font-mono"
                        >
                            <div className="min-w-[60px] text-text-60 pt-0.5">{log.timestamp}</div>

                            <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider text-[10px] min-w-[70px] justify-center ${getLevelColor(log.level)}`}>
                                {getLevelIcon(log.level)}
                                {log.level}
                            </div>

                            <div className="text-accent-500 font-semibold min-w-[80px]">
                                [{log.component}]
                            </div>

                            <div className="text-text-80 break-all">
                                {log.message}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
