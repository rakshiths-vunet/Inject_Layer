"use client";
import { useState, useCallback } from 'react';

export type LogStatus = 'success' | 'error' | 'warning' | 'info';

export interface LogEntry {
    id: string;
    timestamp: string;
    service: string;
    action: string;
    status: LogStatus;
}

const MAX_LOG_ENTRIES = 200;

// Global singleton log state — shared across components
let globalLog: LogEntry[] = [];
const listeners: Set<(entries: LogEntry[]) => void> = new Set();

function notifyListeners() {
    listeners.forEach(fn => fn([...globalLog]));
}

export function appendLog(entry: Omit<LogEntry, 'id' | 'timestamp'>) {
    const newEntry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        ...entry,
    };
    globalLog = [newEntry, ...globalLog].slice(0, MAX_LOG_ENTRIES);
    notifyListeners();
}

export function useActivityLog() {
    const [entries, setEntries] = useState<LogEntry[]>([...globalLog]);

    // Subscribe to global updates
    const register = useCallback((fn: (e: LogEntry[]) => void) => {
        listeners.add(fn);
        return () => listeners.delete(fn);
    }, []);

    // Auto-subscribe on mount
    useState(() => {
        listeners.add(setEntries);
        return () => listeners.delete(setEntries);
    });

    const log = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
        appendLog(entry);
    }, []);

    const clear = useCallback(() => {
        globalLog = [];
        notifyListeners();
    }, []);

    return { entries, log, clear, register };
}
