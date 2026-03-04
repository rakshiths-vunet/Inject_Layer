import React, { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "./ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "./ui/accordion";
import { INJECTION_CATEGORIES, InjectionCategory, InjectionType } from "../../brum/injectionCategories";

interface InjectionLibrarySidebarProps {
    onAddInjection: (type: InjectionType) => void;
}

export function InjectionLibrarySidebar({ onAddInjection }: InjectionLibrarySidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) return INJECTION_CATEGORIES;

        const query = searchQuery.toLowerCase();

        return INJECTION_CATEGORIES.map(category => {
            // Filter types within the category
            const matchingTypes = category.types.filter(
                type =>
                    type.title.toLowerCase().includes(query) ||
                    type.description.toLowerCase().includes(query)
            );

            return {
                ...category,
                types: matchingTypes
            };
        }).filter(category => category.types.length > 0);
    }, [searchQuery]);

    // If searching, keep all matching accordions open by default
    const defaultSelectedAccordions = searchQuery
        ? filteredCategories.map(c => c.id)
        : [];

    return (
        <div className="flex flex-col h-full bg-panel-800">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-text-100/5 bg-panel-700">
                <h3 className="text-text-100 font-semibold mb-3">Injection Library</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-100/40" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search injections..."
                        className="w-full bg-bg-900 border-text-100/10 text-text-100 pl-9 h-9 text-sm"
                    />
                </div>
            </div>

            {/* Accordion List */}
            <div className="flex-1 overflow-y-auto stylish-scrollbar p-2">
                {filteredCategories.length === 0 ? (
                    <div className="text-center py-8 text-text-100/40 text-sm">
                        No injections found matching "{searchQuery}"
                    </div>
                ) : (
                    <Accordion
                        type="multiple"
                        defaultValue={defaultSelectedAccordions}
                        value={searchQuery ? defaultSelectedAccordions : undefined}
                        className="space-y-2"
                    >
                        {filteredCategories.map((category) => (
                            <AccordionItem
                                value={category.id}
                                key={category.id}
                                className="border border-text-100/5 rounded-lg bg-panel-700 overflow-hidden"
                            >
                                <AccordionTrigger className="px-4 py-3 hover:bg-text-100/5 hover:no-underline flex items-center gap-3 w-full border-none data-[state=open]:border-b data-[state=open]:border-text-100/5">
                                    <div className="flex items-center gap-3 flex-1 text-left">
                                        <div
                                            className="w-8 h-8 rounded-md flex items-center justify-center bg-text-100/5"
                                            style={{ color: category.iconColor }}
                                        >
                                            <category.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-text-100/90">
                                                {category.title}
                                            </div>
                                        </div>
                                        <div className="bg-text-100/10 px-2 py-0.5 rounded-full text-[10px] font-medium text-text-100/60">
                                            {category.types.length}
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                <AccordionContent className="p-0 bg-panel-800/50">
                                    <div className="flex flex-col">
                                        {category.types.map((type) => (
                                            <div
                                                key={type.id}
                                                className="group relative p-3 pl-12 border-b border-text-100/5 last:border-0 hover:bg-text-100/5 transition-colors cursor-pointer"
                                                onClick={() => onAddInjection(type)}
                                            >
                                                <div className="pr-16">
                                                    <div className="text-sm font-medium text-text-100/90 mb-1">{type.title}</div>
                                                    <div className="text-xs text-text-100/40 leading-relaxed">{type.description}</div>
                                                </div>

                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-accent-500 text-bg-900 hover:bg-accent-400 shadow-lg"
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // prevent double trigger if we also have an onClick on the parent div
                                                            onAddInjection(type);
                                                        }}
                                                    >
                                                        <Plus className="w-3 h-3" /> Add
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                )}
            </div>
        </div>
    );
}
