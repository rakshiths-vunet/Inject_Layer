
"use client";

import { useState, useEffect } from "react";
import {
    Network,
    Zap,
    Server,
    Wifi,
    FileX,
    Lock,
    Beaker,
} from "lucide-react";
import { HeroSection } from "../components/brum/HeroSection";
import { InjectionCard } from "../components/brum/InjectionCard";
import { RuleBuilderPanel } from "../components/brum/RuleBuilderPanel";
import { PresetCard } from "../components/brum/PresetCard";
import { KillSwitch } from "../components/brum/KillSwitch";
import { ActivityTimeline } from "../components/dashboard/ActivityTimeline";
import { EnvironmentSelector } from "../components/brum/EnvironmentSelector";
import { toast } from "sonner";
import { Toaster } from "../components/brum/ui/sonner";
import { ActiveInjections } from "../components/dashboard/ActiveInjections";
import { usePrometheusMetrics } from "../hooks/usePrometheusMetrics";
import { useChaosRules } from "../hooks/useChaosRules";
import { CreateScenarioModal } from "../components/brum/CreateScenarioModal";
import { Scenario } from "../components/brum/PresetCard";

import { INJECTION_CATEGORIES, InjectionCategory } from "./injectionCategories";

export default function BRUMPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<InjectionCategory[]>(INJECTION_CATEGORIES);
    const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);

    // Scenario States
    const [scenarios, setScenarios] = useState<Scenario[]>([]);
    const [processingScenarioId, setProcessingScenarioId] = useState<string | null>(null);
    const [scenarioToEdit, setScenarioToEdit] = useState<Scenario | null>(null);
    const [scenarioFilter, setScenarioFilter] = useState<'all' | 'active' | 'scheduled' | 'draft' | 'inactive'>('all');

    // Hooks for metrics and rules
    const { getGlobalStats } = usePrometheusMetrics(2000);
    const {
        rules,
        isCategoryActive,
        deleteAllRules,
        disableRulesByCategory,
        refreshRules
    } = useChaosRules(3000);
    const stats = getGlobalStats();

    // Sync categories with active rules from API
    useEffect(() => {
        setCategories(prev => prev.map(cat => {
            const isActive = isCategoryActive(cat.id);
            if (isActive !== cat.enabled) {
                return { ...cat, enabled: isActive };
            }
            return cat;
        }));
    }, [rules, isCategoryActive]);

    const fetchScenarios = async () => {
        try {
            const res = await fetch('/api/scenarios');
            const data = await res.json();
            setScenarios(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to load scenarios");
        }
    };

    useEffect(() => {
        fetchScenarios();
    }, []);

    const handleActivateScenario = async (id: string) => {
        setProcessingScenarioId(id);
        try {
            const res = await fetch(`/api/scenarios/${id}/activate`, { method: 'POST' });
            if (!res.ok) throw new Error('Activation failed');
            toast.success("Scenario Activated!");
            await fetchScenarios();
            refreshRules();
        } catch (e: any) {
            toast.error(e.message || "Failed to activate scenario");
        } finally {
            setProcessingScenarioId(null);
        }
    };

    const handleDeactivateScenario = async (id: string) => {
        setProcessingScenarioId(id);
        try {
            const res = await fetch(`/api/scenarios/${id}/deactivate`, { method: 'POST' });
            if (!res.ok) throw new Error('Deactivation failed');
            toast.success("Scenario Deactivated!");
            await fetchScenarios();
            refreshRules();
        } catch (e: any) {
            toast.error(e.message || "Failed to deactivate scenario");
        } finally {
            setProcessingScenarioId(null);
        }
    };

    const handleDeleteScenario = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete scenario: ${name}?`)) return;
        setProcessingScenarioId(id);
        try {
            const res = await fetch(`/api/scenarios/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Deletion failed');
            toast.success("Scenario Deleted!");
            await fetchScenarios();
            refreshRules();
        } catch (e: any) {
            toast.error(e.message || "Failed to delete scenario");
        } finally {
            setProcessingScenarioId(null);
        }
    };

    const handleEditScenario = (scenario: Scenario) => {
        setScenarioToEdit(scenario);
        setIsScenarioModalOpen(true);
    };

    const handleDuplicateScenario = async (scenario: Scenario) => {
        setProcessingScenarioId(scenario.id);
        try {
            const res = await fetch('/api/scenarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${scenario.name} (Copy)`,
                    description: scenario.description,
                    sites: scenario.sites,
                    injections: scenario.injections,
                    action: 'draft'
                })
            });
            if (!res.ok) throw new Error('Duplication failed');
            toast.success("Scenario Duplicated!");
            await fetchScenarios();
        } catch (e: any) {
            toast.error(e.message || "Failed to duplicate scenario");
        } finally {
            setProcessingScenarioId(null);
        }
    };

    const handleToggleCategory = async (
        id: string,
        enabled: boolean,
    ) => {
        // Log activity
        fetch('/api/activity', {
            method: 'POST',
            body: JSON.stringify({
                action: enabled ? 'Enabled Category' : 'Disabled Category',
                details: `Toggled ${id}`
            })
        });

        if (!enabled) {
            try {
                await disableRulesByCategory(id);
                toast.success(`All rules for ${id} category disabled`);
            } catch (e) {
                toast.error(`Failed to disable rules for ${id}`);
            }
        } else {
            // If they just toggled it ON, they usually need to build a rule next.
            // But we update the local state for UI responsiveness.
            setCategories((prev) =>
                prev.map((cat) =>
                    cat.id === id ? { ...cat, enabled } : cat,
                ),
            );
            toast.info(`Category ${id} enabled. Build a rule to see impact.`);
        }
    };

    const handleCreateScenario = () => {
        setScenarioToEdit(null);
        setIsScenarioModalOpen(true);
    };

    const handleKillAll = async () => {
        try {
            await deleteAllRules();
            setCategories((prev) =>
                prev.map((cat) => ({ ...cat, enabled: false })),
            );
            toast.success(
                "All chaos injection rules have been disabled",
            );
            // Log activity
            fetch('/api/activity', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'Kill Switch',
                    details: 'Disabled all active injections'
                })
            });
            await fetchScenarios();
        } catch (e) {
            toast.error("Failed to disable all rules");
        }
    };

    const filteredScenarios = scenarios.filter(s => scenarioFilter === 'all' || s.status === scenarioFilter);

    return (
        <div
            className="min-h-screen bg-bg-900"
            style={{ fontFamily: "var(--font-family)" }}
        >
            <Toaster position="top-right" />

            {/* <EnvironmentSelector /> */}

            <HeroSection
                onCreateScenario={handleCreateScenario}
                onKillAll={handleKillAll}
                stats={stats}
            />

            {/* Scenario Presets */}
            <div className="px-8 py-8 border-b border-text-100/10 bg-text-100/[0.02]">
                <div className="max-w-[1920px] mx-auto">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-2 text-text-100">
                                Scenario Presets
                            </h2>
                            <p className="text-text-100/50">
                                Pre-configured and custom chaos scenarios
                            </p>
                        </div>
                        <div className="flex bg-bg-900 rounded-lg p-1 border border-text-100/10 gap-1">
                            {(['all', 'active', 'scheduled', 'draft', 'inactive'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setScenarioFilter(tab)}
                                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${scenarioFilter === tab ? 'bg-text-100/10 text-text-100 shadow-sm' : 'text-text-100/40 hover:text-text-100 hover:bg-text-100/5'
                                        } capitalize`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 pt-6 px-4 -mx-4 stylish-scrollbar">
                        {filteredScenarios.map((scenario) => (
                            <PresetCard
                                key={scenario.id}
                                scenario={scenario}
                                isProcessing={processingScenarioId === scenario.id}
                                onActivate={() => handleActivateScenario(scenario.id)}
                                onDeactivate={() => handleDeactivateScenario(scenario.id)}
                                onEdit={() => handleEditScenario(scenario)}
                                onDelete={() => handleDeleteScenario(scenario.id, scenario.name)}
                                onDuplicate={() => handleDuplicateScenario(scenario)}
                            />
                        ))}
                        {filteredScenarios.length === 0 && (
                            <div className="text-text-100/40 flex items-center justify-center p-12 border border-dashed border-text-100/10 rounded-2xl w-full bg-text-100/[0.01]">
                                {scenarios.length === 0 ? 'No scenarios created yet. Click "Create Scenario" to get started!' : 'No scenarios match the selected filter.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Active Injections Dashboard */}
            <div className="px-8 py-0 -mt-6 mb-8 relative z-10">
                <div className="max-w-[1920px] mx-auto">
                    <ActiveInjections />
                </div>
            </div>

            {/* Injection Categories Grid */}
            <div className="px-8 py-8">
                <div className="max-w-[1920px] mx-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2 text-text-100">
                            Injection Categories
                        </h2>
                        <p className="text-text-100/50">
                            Configure and control specific chaos injection
                            types
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <InjectionCard
                                key={category.id}
                                title={category.title}
                                description={category.description}
                                icon={category.icon}
                                iconColor={category.iconColor}
                                enabled={category.enabled}
                                onToggle={(enabled) =>
                                    handleToggleCategory(category.id, enabled)
                                }
                                onExpand={() =>
                                    setSelectedCategory(category.id)
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-8 py-8 border-t border-text-100/10">
                <div className="max-w-[1920px] mx-auto">
                    <ActivityTimeline />
                </div>
            </div>


            <KillSwitch onKillAll={handleKillAll} />

            {/* RuleBuilderPanel */}
            <RuleBuilderPanel
                categoryId={selectedCategory}
                isOpen={selectedCategory !== null}
                onClose={() => setSelectedCategory(null)}
            />

            <CreateScenarioModal
                isOpen={isScenarioModalOpen}
                scenarioToEdit={scenarioToEdit}
                onClose={() => {
                    setIsScenarioModalOpen(false);
                    setScenarioToEdit(null);
                }}
                onSaveSuccess={() => {
                    toast.success(scenarioToEdit ? "Scenario Updated!" : "Scenario Saved!");
                    fetchScenarios();
                    refreshRules();
                }}
            />

            {/* Footer */}
            <div className="px-8 py-12 border-t border-text-100/10">
                <div className="max-w-[1920px] mx-auto text-center">
                    <p className="text-sm text-text-100/40">
                        CHAOS CONTROL — Browser-Side Error Injection Engine
                        v2.1.4
                    </p>
                    <p className="text-xs text-text-100/30 mt-2">
                        Built for SRE, QA, and Observability teams •
                        Enterprise-grade chaos engineering
                    </p>
                </div>
            </div>
        </div>
    );
}
