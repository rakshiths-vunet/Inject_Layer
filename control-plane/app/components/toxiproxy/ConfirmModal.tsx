"use client";

import { useState } from "react";
import {
    AlertTriangle,
    X,
} from "lucide-react";

interface ConfirmModalProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    danger = true,
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-bg-900/70 backdrop-blur-sm"
                onClick={onCancel}
            />
            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm mx-4 rounded-2xl bg-panel-800 border border-panel-600/60 shadow-elev-2 p-6 flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${danger
                                    ? "bg-red-500/10 border border-red-500/20"
                                    : "bg-yellow-500/10 border border-yellow-500/20"
                                }`}
                        >
                            <AlertTriangle
                                className={`w-5 h-5 ${danger ? "text-red-400" : "text-yellow-400"}`}
                            />
                        </div>
                        <h3 className="font-bold text-text-100 text-base">{title}</h3>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-1 rounded-lg text-text-40 hover:text-text-100 hover:bg-text-100/5 transition-colors flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <p className="text-sm text-text-60 leading-relaxed">{message}</p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-text-100/10 bg-text-100/[0.03] text-text-60 text-sm font-medium hover:bg-text-100/[0.06] hover:text-text-100 transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all duration-200 ${danger
                                ? "border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/60"
                                : "border-yellow-500/40 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 hover:border-yellow-500/60"
                            }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
