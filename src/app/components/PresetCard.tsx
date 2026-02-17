import { Play, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';

interface PresetCardProps {
  title: string;
  description: string;
  impact: {
    latency?: string;
    errorRate?: string;
    cls?: string;
  };
  estimatedImpact: 'low' | 'medium' | 'high' | 'critical';
  onActivate: () => void;
}

export function PresetCard({ title, description, impact, estimatedImpact, onActivate }: PresetCardProps) {
  const impactColors = {
    low: '#52D890',
    medium: '#FFB84D',
    high: '#FF6B6B',
    critical: '#FF4444',
  };

  const impactLabels = {
    low: 'Low Impact',
    medium: 'Medium Impact',
    high: 'High Impact',
    critical: 'Critical Impact',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-xl p-6 min-w-[300px]"
      style={{
        backgroundColor: '#14161A',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-white/50">{description}</p>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="space-y-2 mb-4">
        {impact.latency && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">Latency</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#FFB84D]" />
              <span className="font-medium text-[#FFB84D]">{impact.latency}</span>
            </div>
          </div>
        )}
        {impact.errorRate && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">Error Rate</span>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-[#FF6B6B]" />
              <span className="font-medium text-[#FF6B6B]">{impact.errorRate}</span>
            </div>
          </div>
        )}
        {impact.cls && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">CLS Impact</span>
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-[#6B9AFF]" />
              <span className="font-medium text-[#6B9AFF]">{impact.cls}</span>
            </div>
          </div>
        )}
      </div>

      {/* Impact Badge */}
      <div className="flex items-center justify-between mb-4">
        <div
          className="px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: `${impactColors[estimatedImpact]}20`,
            color: impactColors[estimatedImpact],
          }}
        >
          {impactLabels[estimatedImpact]}
        </div>
      </div>

      {/* Activate Button */}
      <button
        onClick={onActivate}
        className="w-full px-4 py-2.5 rounded-lg font-medium bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FFC857] transition-all duration-200 flex items-center justify-center gap-2 group"
      >
        <Play className="w-4 h-4 group-hover:text-[#FFC857] transition-colors" />
        <span className="group-hover:text-[#FFC857] transition-colors">Activate Scenario</span>
      </button>
    </motion.div>
  );
}
