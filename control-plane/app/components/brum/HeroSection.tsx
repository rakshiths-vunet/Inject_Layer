import { Plus, XCircle, Activity, Clock, AlertTriangle, Wifi } from 'lucide-react';
import { usePrometheusMetrics } from '../../hooks/usePrometheusMetrics';

interface HeroSectionProps {
  onCreateScenario: () => void;
  onKillAll: () => void;
  stats?: {
    activeRulesCount: number;
    latencyInjected: number;
    injectionCount: number;
    errorRate: number;
  };
}

export function HeroSection({ onCreateScenario, onKillAll, stats }: HeroSectionProps) {
  const { getGlobalStats } = usePrometheusMetrics();
  const realTimeStats = getGlobalStats();

  // Use realTimeStats if available, otherwise fall back to props (or 0)
  // We prioritize the hook data as it's self-contained
  const activeStats = {
    activeRulesCount: realTimeStats.activeRulesCount,
    latencyInjected: realTimeStats.latencyInjected,
    errorRate: realTimeStats.errorRate
  };

  const metrics = [
    { label: 'Rules Injected', value: activeStats.activeRulesCount, icon: Activity, color: '#6B9AFF' },
    { label: 'Latency Injected', value: `${(activeStats.latencyInjected / 1000).toFixed(1)}s`, icon: Clock, color: '#FFB84D' },
    { label: 'Error Rate', value: `${activeStats.errorRate}%`, icon: AlertTriangle, color: '#FF6B6B' },
    { label: 'Packet Drop', value: 'N/A', icon: Wifi, color: '#FFC857' }, // Packet drop metrics not yet available in hook
  ];

  return (
    <div className="px-8 pt-12 pb-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="rounded-2xl p-12 relative overflow-hidden"
          style={{
            backgroundColor: '#14161A',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          }}>
          {/* Background gradient effect */}
          <div className="absolute inset-0 opacity-20"
            style={{
              background: 'radial-gradient(circle at top right, rgba(255, 200, 87, 0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(82, 216, 144, 0.1), transparent 50%)'
            }} />

          <div className="relative z-10 flex items-start justify-between gap-12">
            {/* Left: Hero Content */}
            <div className="flex-1 max-w-3xl">
              <h1 className="text-5xl font-bold mb-4 tracking-tight leading-tight">
                Simulate Real-World User Friction <br />
                <span className="text-white/65">Without Touching Production Code.</span>
              </h1>

              <p className="text-lg text-white/65 mb-8 leading-relaxed">
                Inject latency, force API failures, drop packets, and sabotage performance — safely and instantly.
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={onCreateScenario}
                  className="px-6 py-3 rounded-xl font-semibold bg-[#FFC857] text-[#0B0C0F] hover:bg-[#FFD470] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Scenario
                </button>

                <button
                  onClick={onKillAll}
                  className="px-6 py-3 rounded-xl font-semibold border border-white/20 text-white/90 hover:bg-white/5 hover:border-white/30 transition-all duration-200 flex items-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Kill All Injections
                </button>
              </div>
            </div>

            {/* Right: Live Metrics */}
            <div className="grid grid-cols-2 gap-4 min-w-[400px]">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl p-5 backdrop-blur-sm"
                  style={{
                    backgroundColor: 'rgba(26, 29, 35, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)'
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${metric.color}20` }}>
                      <metric.icon className="w-5 h-5" style={{ color: metric.color }} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{metric.value}</div>
                  <div className="text-sm text-white/50">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
