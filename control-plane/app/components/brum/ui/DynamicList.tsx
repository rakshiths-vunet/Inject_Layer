
import * as React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import { cn } from "./utils";

interface DynamicListProps {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder?: string;
    options?: { label: string; value: string }[];
    className?: string;
}

export function DynamicList({
    items = [],
    onChange,
    placeholder = "Add item...",
    options,
    className,
}: DynamicListProps) {
    const handleAdd = () => {
        onChange([...items, ""]);
    };

    const handleRemove = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    const handleChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onChange(newItems);
    };

    return (
        <div className={cn("space-y-2", className)}>
            {items.map((item, index) => {
                const isPredefined = options?.some(opt => opt.value === item);
                const isCustomMode = item === "__custom__" || (item !== "" && !isPredefined);

                return (
                    <div key={index} className="flex gap-2">
                        {options && !isCustomMode ? (
                            <select
                                value={isCustomMode ? "__custom__" : item}
                                onChange={(e) => {
                                    if (e.target.value === "__custom__") {
                                        handleChange(index, "__custom__");
                                    } else {
                                        handleChange(index, e.target.value);
                                    }
                                }}
                                className="flex h-10 w-full rounded-md border border-text-100/10 bg-panel-700 px-3 py-2 text-sm text-text-100 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="" disabled>{placeholder}</option>
                                {options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                                <option value="__custom__" className="text-accent-400 font-semibold border-t border-text-100/10 mt-2">Custom...</option>
                            </select>
                        ) : (
                            <div className="flex-1 flex gap-2">
                                <Input
                                    value={item === "__custom__" ? "" : item}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    placeholder={placeholder}
                                    className="bg-panel-700 border-text-100/10 text-text-100"
                                    autoFocus={item === "__custom__"}
                                />
                                {options && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleChange(index, "")}
                                        className="text-xs text-text-100/40 hover:text-text-100 shrink-0"
                                    >
                                        Back to list
                                    </Button>
                                )}
                            </div>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(index)}
                            className="text-text-100/50 hover:text-red-400 hover:bg-red-400/10 shrink-0"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            })}
            <Button
                variant="outline"
                size="sm"
                onClick={handleAdd}
                className="text-accent-400 border-accent-400/20 hover:bg-accent-400/10 bg-transparent w-full border-dashed"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
            </Button>
        </div>
    );
}
