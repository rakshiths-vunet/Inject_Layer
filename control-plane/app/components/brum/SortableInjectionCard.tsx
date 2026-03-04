import React, { useState } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Copy, Trash2 } from "lucide-react";
import { ScenarioInjection } from "./CreateScenarioModal";
import { Switch } from "./ui/switch";
import { ScenarioFormControls } from "./ScenarioFormControls";

interface SortableInjectionCardProps {
    injection: ScenarioInjection;
    onRemove: () => void;
    onDuplicate: () => void;
    onUpdate: (updates: Partial<ScenarioInjection>) => void;
    globalSites: string[];
}

export function SortableInjectionCard({
    injection,
    onRemove,
    onDuplicate,
    onUpdate,
    globalSites
}: SortableInjectionCardProps) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: injection.instanceId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 100 : 1,
    };

    // The category needs to be fetched from INJECTION_CATEGORIES to get the color,
    // but since we don't have the parent category directly on the injection object,
    // we could pass it down or find it. For now, we'll try to find it by type id.
    // Alternatively, just pass the color down.
    const categoryColor = "#FFC857"; // Fallback color

    const isEnabled = injection.config.enabled !== false; // Default true

    const handleConfigChange = (key: string, value: any) => {
        onUpdate({
            config: {
                ...injection.config,
                [key]: value
            }
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative rounded-xl border border-text-100/10 bg-panel-700 shadow-lg flex flex-col group transition-all
        ${isDragging ? 'shadow-2xl ring-2 ring-[#FFC857]' : ''}
      `}
        >
            {/* Accent Border */}
            <div
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ backgroundColor: categoryColor }}
            />

            {/* HEADER CARD TOOLBAR */}
            <div className="flex items-center justify-between p-3 border-b border-text-100/5 pl-4">

                {/* Left: Drag Handle & Title */}
                <div className="flex items-center gap-3">
                    <button
                        {...attributes}
                        {...listeners}
                        className="text-text-100/30 hover:text-text-100/60 cursor-grab active:cursor-grabbing p-1 -ml-1"
                    >
                        <GripVertical className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-text-100/50">
                                {/* Category name placeholder */}
                                CATEGORY
                            </span>
                            <span className="text-text-100/30">›</span>
                            <span className="text-sm font-bold text-text-100 tracking-tight">
                                {injection.title}
                            </span>
                        </div>
                        <span className="text-[11px] text-text-100/40">{injection.description}</span>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 mr-2">
                        <span className="text-[10px] uppercase font-bold text-text-100/50">
                            {isEnabled ? '● Enabled' : '○ Disabled'}
                        </span>
                        <Switch
                            checked={isEnabled}
                            onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
                            className="data-[state=checked]:bg-[#52D890]"
                        />
                    </div>

                    <div className="h-4 w-px bg-text-100/10" />

                    <button
                        onClick={onDuplicate}
                        className="flex items-center gap-1.5 text-xs font-semibold text-text-100/50 hover:text-text-100 transition-colors"
                    >
                        <Copy className="w-3.5 h-3.5" /> <span>Dup</span>
                    </button>

                    <button
                        onClick={onRemove}
                        className="flex items-center gap-1.5 text-xs font-semibold text-text-100/50 hover:text-[#FF6B6B] transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" /> <span>Remove</span>
                    </button>
                </div>
            </div>

            {/* BODY CONFIGURATION */}
            {!injection.isCollapsed && (
                <div className="p-5 pl-7 flex flex-col gap-6">
                    <ScenarioFormControls
                        injection={injection}
                        onChange={handleConfigChange}
                        globalSites={globalSites}
                    />
                </div>
            )}
        </div>
    );
}
