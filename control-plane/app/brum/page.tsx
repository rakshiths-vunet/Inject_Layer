
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

import { INJECTION_CATEGORIES, InjectionCategory } from "./injectionCategories";

export default function BRUMPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<InjectionCategory[]>(INJECTION_CATEGORIES);

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

    const presets = [
        {
            title: "Slow Core Banking",
            description: "Simulate degraded banking API performance",
            impact: { latency: "+8.2s", errorRate: "12%" },
            estimatedImpact: "high" as const,
        },
        // ... (rest of presets)
        {
            title: "Silent Payment Failure",
            description:
                "Payment endpoint returns 200 but fails silently",
            impact: { errorRate: "5%", cls: "0.3" },
            estimatedImpact: "critical" as const,
        },
        {
            title: "Intermittent Network",
            description: "20% random packet drop simulation",
            impact: { latency: "+2.1s" },
            estimatedImpact: "medium" as const,
        },
        {
            title: "CDN Outage",
            description: "Block all static asset delivery",
            impact: { errorRate: "100%", latency: "+∞" },
            estimatedImpact: "critical" as const,
        },
        {
            title: "Layout Shift Chaos",
            description: "Inject dynamic content shifts and reflows",
            impact: { cls: "0.8" },
            estimatedImpact: "high" as const,
        },
        {
            title: "Input Delay Attack",
            description:
                "Simulate poor INP with delayed interactions",
            impact: { latency: "+600ms" },
            estimatedImpact: "medium" as const,
        },
    ];

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
        toast.info("Opening scenario builder...");
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
        } catch (e) {
            toast.error("Failed to disable all rules");
        }
    };

    const handleActivatePreset = (title: string) => {
        toast.success(`Activated preset: ${title}`);
        fetch('/api/activity', {
            method: 'POST',
            body: JSON.stringify({
                action: 'Activated Preset',
                details: title
            })
        });
    };

    return (
        <div
            className="min-h-screen dark bg-[#0B0C0F]"
            style={{ fontFamily: "var(--font-family)" }}
        >
            <Toaster position="top-right" />

            {/* <EnvironmentSelector /> */}

            <HeroSection
                onCreateScenario={handleCreateScenario}
                onKillAll={handleKillAll}
                stats={stats}
            />

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
                        <h2 className="text-2xl font-bold mb-2 text-white">
                            Injection Categories
                        </h2>
                        <p className="text-white/50">
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

            {/* Scenario Presets */}
            <div className="px-8 py-8 border-t border-white/10">
                <div className="max-w-[1920px] mx-auto">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-2 text-white">
                            Scenario Presets
                        </h2>
                        <p className="text-white/50">
                            Pre-configured chaos scenarios for common testing
                            patterns
                        </p>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 stylish-scrollbar">
                        {presets.map((preset) => (
                            <PresetCard
                                key={preset.title}
                                {...preset}
                                onActivate={() =>
                                    handleActivatePreset(preset.title)
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-8 py-8 border-t border-white/10">
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

            {/* Footer */}
            <div className="px-8 py-12 border-t border-white/10">
                <div className="max-w-[1920px] mx-auto text-center">
                    <p className="text-sm text-white/40">
                        CHAOS CONTROL — Browser-Side Error Injection Engine
                        v2.1.4
                    </p>
                    <p className="text-xs text-white/30 mt-2">
                        Built for SRE, QA, and Observability teams •
                        Enterprise-grade chaos engineering
                    </p>
                </div>
            </div>
        </div>
    );
}
