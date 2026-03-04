import { Play, TrendingUp, TrendingDown, Square, Edit2, Trash2, Copy } from 'lucide-react';
import { motion } from 'motion/react';
import { ScenarioInjection } from './CreateScenarioModal';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'inactive' | 'scheduled';
  sites: string[];
  injections: ScenarioInjection[];
  created_at?: string;
  schedule_start_time?: string | null;
  schedule_end_time?: string | null;
  cron_expression?: string | null;
}

interface PresetCardProps {
  scenario: Scenario;
  onActivate: () => void;
  onDeactivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  isProcessing?: boolean;
}

export function PresetCard({ scenario, onActivate, onDeactivate, onEdit, onDelete, onDuplicate, isProcessing }: PresetCardProps) {
  const statusColors = {
    draft: '#FFB84D', // yellow/orange
    active: '#FF6B6B', // red (was green)
    scheduled: '#3b82f6', // blue
    inactive: '#52D890', // green (was red)
  };

  const impactLabels = {
    low: 'Low Impact',
    medium: 'Medium Impact',
    high: 'High Impact',
    critical: 'Critical Impact',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="relative rounded-2xl p-6 min-w-[340px] max-w-[340px] flex flex-col group transition-all duration-300"
      style={{
        backgroundColor: 'var(--panel-700)',
        border: '1px solid var(--border)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        overflow: 'visible'
      }}
    >
      {/* Floating Status Badge */}
      <div
        className="absolute -top-3 -right-3 px-3 py-1.5 rounded-full text-[10px] uppercase font-black tracking-widest shadow-xl backdrop-blur-md z-20"
        style={{
          backgroundColor: `${statusColors[scenario.status]}20`,
          color: statusColors[scenario.status],
          border: `1px solid ${statusColors[scenario.status]}80`,
          boxShadow: `0 4px 12px ${statusColors[scenario.status]}40`
        }}
      >
        <span className="relative flex h-2 w-2 absolute -left-1.5 -top-1.5 hidden">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: statusColors[scenario.status] }}></span>
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: statusColors[scenario.status] }}></span>
        </span>
        {scenario.status}
      </div>

      {/* Subtle background glow based on status */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${statusColors[scenario.status]}10 0%, transparent 60%)`
        }}
      />

      <div className="flex z-10 items-start justify-between mb-4 mt-2">
        <div className="flex-1 pr-6 min-w-0">
          <h3 className="text-xl font-bold mb-1 truncate text-text-100 tracking-tight" title={scenario.name}>{scenario.name}</h3>
          <p className="text-sm text-text-100/40 line-clamp-2 leading-relaxed min-h-[40px] break-words" title={scenario.description}>{scenario.description || 'No description provided.'}</p>
        </div>
      </div>

      <div className="space-y-2 mb-6 z-10 text-[11px] bg-bg-900/20 p-3 rounded-xl border border-text-100/5">
        <div className="flex justify-between items-center text-text-100/40">
          <span className="uppercase tracking-wider font-bold">Target Sites</span>
          <span className="text-text-100/80 font-mono truncate max-w-[150px] inline-block align-bottom">{scenario.sites?.length ? scenario.sites.join(', ') : 'Global'}</span>
        </div>
        <div className="flex justify-between items-center text-text-100/40">
          <span className="uppercase tracking-wider font-bold">Injections</span>
          <span className="text-text-100/80 font-mono bg-text-100/10 px-1.5 rounded">{scenario.injections?.length || 0}</span>
        </div>
        {(scenario.schedule_start_time || scenario.cron_expression) && (
          <div className="flex justify-between items-center text-text-100/40">
            <span className="uppercase tracking-wider font-bold">Schedule</span>
            <span className="text-[#3b82f6] font-mono truncate max-w-[150px] inline-block align-bottom text-right" title={scenario.cron_expression || new Date(scenario.schedule_start_time!).toLocaleString()}>
              {scenario.cron_expression ? `Cron: ${scenario.cron_expression}` : new Date(scenario.schedule_start_time!).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2 z-10">
        <div className="flex gap-2">
          {scenario.status !== 'active' ? (
            <button
              onClick={onActivate}
              disabled={isProcessing}
              className="flex-1 px-3 py-2.5 rounded-xl font-bold bg-[#52D890] hover:bg-[#4ac582] text-bg-900 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#52D890]/10 hover:shadow-[#52D890]/20"
            >
              <Play className="fill-current w-3.5 h-3.5" />
              <span>Activate</span>
            </button>
          ) : (
            <button
              onClick={onDeactivate}
              disabled={isProcessing}
              className="flex-1 px-3 py-2.5 rounded-xl font-bold bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 text-[#FF6B6B] border border-[#FF6B6B]/20 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#FF6B6B]/10"
            >
              <Square className="fill-current w-3.5 h-3.5" />
              <span>Deactivate</span>
            </button>
          )}

          <button
            onClick={onEdit}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl bg-text-100/5 hover:bg-text-100/10 border border-text-100/10 text-text-100/70 hover:text-text-100 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-text-100/20"
            title="Edit Scenario"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 pt-1 border-t border-text-100/5 mt-1">
          <button
            onClick={onDuplicate}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 rounded-lg hover:bg-text-100/5 text-text-100/40 hover:text-text-100 transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 text-[10px] uppercase font-bold tracking-wider"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>
          <button
            onClick={onDelete}
            disabled={isProcessing}
            className="flex-1 px-3 py-2 rounded-lg hover:bg-red-500/10 text-text-100/40 hover:text-red-400 transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 text-[10px] uppercase font-bold tracking-wider"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}
