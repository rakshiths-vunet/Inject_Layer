import { useState } from "react";
import {
  Network,
  Zap,
  Server,
  Wifi,
  FileX,
  Navigation,
} from "lucide-react";
import { TopNav } from "./components/TopNav";
import { HeroSection } from "./components/HeroSection";
import { InjectionCard } from "./components/InjectionCard";
import { RuleBuilderPanel } from "./components/RuleBuilderPanel";
import { PresetCard } from "./components/PresetCard";
import { MetricsPanel } from "./components/MetricsPanel";
import { KillSwitch } from "./components/KillSwitch";
import { Timeline } from "./components/Timeline";
import { EnvironmentSelector } from "./components/EnvironmentSelector";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";

import { INJECTION_CATEGORIES, InjectionCategory } from "../data/injectionCategories";

export default function App() {
  const [globalInjectionEnabled, setGlobalInjectionEnabled] =
    useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    string | null
  >(null);
  const [categories, setCategories] = useState<InjectionCategory[]>(INJECTION_CATEGORIES);

  const presets = [
    {
      title: "Slow Core Banking",
      description: "Simulate degraded banking API performance",
      impact: { latency: "+8.2s", errorRate: "12%" },
      estimatedImpact: "high" as const,
    },
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

  const handleToggleCategory = (
    id: string,
    enabled: boolean,
  ) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, enabled } : cat,
      ),
    );
    toast.success(
      enabled
        ? "Injection category enabled"
        : "Injection category disabled",
    );
  };

  const handleCreateScenario = () => {
    toast.info("Opening scenario builder...");
  };

  const handleKillAll = () => {
    setCategories((prev) =>
      prev.map((cat) => ({ ...cat, enabled: false })),
    );
    setGlobalInjectionEnabled(false);
    toast.success(
      "All chaos injection rules have been disabled",
    );
  };

  const handleActivatePreset = (title: string) => {
    toast.success(`Activated preset: ${title}`);
  };

  return (
    <div
      className="min-h-screen dark"
      style={{ fontFamily: "var(--font-family)" }}
    >
      <Toaster position="top-right" />

      <TopNav
        globalInjectionEnabled={globalInjectionEnabled}
        onToggleGlobalInjection={setGlobalInjectionEnabled}
      />

      <EnvironmentSelector />

      <HeroSection
        onCreateScenario={handleCreateScenario}
        onKillAll={handleKillAll}
      />

      {/* Injection Categories Grid */}
      <div className="px-8 py-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">
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
            <h2 className="text-2xl font-bold mb-2">
              Scenario Presets
            </h2>
            <p className="text-white/50">
              Pre-configured chaos scenarios for common testing
              patterns
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
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

      <MetricsPanel />

      <Timeline />

      <KillSwitch onKillAll={handleKillAll} />

      {/* Rule Builder Panel */}
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