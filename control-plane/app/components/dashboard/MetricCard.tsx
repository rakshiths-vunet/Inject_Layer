"use client";

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: string;
    trendDirection?: "up" | "down" | "neutral";
    icon?: LucideIcon;
    variant?: "default" | "alert" | "success";
}

export function MetricCard({
    title,
    value,
    description,
    trend,
    trendDirection,
    icon: Icon,
    variant = "default"
}: MetricCardProps) {

    const variantStyles = {
        default: "bg-panel-700 border-transparent",
        alert: "bg-red-500/10 border-red-500/20",
        success: "bg-success-500/10 border-success-500/20"
    };

    const trendColor = {
        up: "text-success-500",
        down: "text-red-500",
        neutral: "text-text-60"
    };

    return (
        <div className={`
      relative overflow-hidden rounded-[12px] p-5 border
      ${variantStyles[variant]}
      transition-all duration-200 hover:scale-[1.02] hover:brightness-105
      shadow-[0_6px_18px_rgba(0,0,0,0.2)]
    `}>
            <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-60">{title}</h3>
                {Icon && <Icon className="w-4 h-4 text-text-40" />}
            </div>

            <div className="flex items-end gap-3">
                <div className="text-3xl font-extra-bold text-text-100 tracking-tight leading-none">
                    {value}
                </div>

                {trend && (
                    <div className={`text-xs font-medium mb-1 ${trendDirection ? trendColor[trendDirection] : "text-text-40"}`}>
                        {trend}
                    </div>
                )}
            </div>

            {description && (
                <div className="mt-2 text-xs text-text-40">
                    {description}
                </div>
            )}
        </div>
    );
}
