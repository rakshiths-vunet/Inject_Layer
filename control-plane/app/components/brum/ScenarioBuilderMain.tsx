import React, { useState } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

import { ScenarioInjection } from "./CreateScenarioModal";
import { SortableInjectionCard } from "./SortableInjectionCard";

interface ScenarioBuilderMainProps {
    injections: ScenarioInjection[];
    onRemove: (instanceId: string) => void;
    onDuplicate: (injection: ScenarioInjection) => void;
    onUpdate: (instanceId: string, updates: Partial<ScenarioInjection>) => void;
    moveInjection: (fromIndex: number, toIndex: number) => void;
    globalSites: string[];
}

export function ScenarioBuilderMain({
    injections,
    onRemove,
    onDuplicate,
    onUpdate,
    moveInjection,
    globalSites
}: ScenarioBuilderMainProps) {

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px drag distance to activate, allows clicking on buttons inside the card
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = injections.findIndex((i) => i.instanceId === active.id);
            const newIndex = injections.findIndex((i) => i.instanceId === over?.id);
            moveInjection(oldIndex, newIndex);
        }
    };

    if (injections.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center p-8 border border-dashed border-text-100/20 rounded-2xl bg-panel-700/50 max-w-sm">
                    <div className="text-4xl mb-4">🧪</div>
                    <h3 className="text-lg font-bold text-text-100 mb-2">No injections yet</h3>
                    <p className="text-text-100/50 text-sm">
                        Pick from the Injection Library <span className="text-accent-500">←</span><br />
                        to start building your scenario
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-4 pb-12">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
            >
                <SortableContext
                    items={injections.map(i => i.instanceId)}
                    strategy={verticalListSortingStrategy}
                >
                    {injections.map((injection) => (
                        <SortableInjectionCard
                            key={injection.instanceId}
                            injection={injection}
                            onRemove={() => onRemove(injection.instanceId)}
                            onDuplicate={() => onDuplicate(injection)}
                            onUpdate={(updates) => onUpdate(injection.instanceId, updates)}
                            globalSites={globalSites}
                        />
                    ))}
                </SortableContext>
            </DndContext>
        </div>
    );
}
