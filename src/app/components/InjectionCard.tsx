import { LucideIcon, ChevronRight } from 'lucide-react';
import { Switch } from './ui/switch';
import { motion } from 'motion/react';

interface InjectionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onExpand: () => void;
  iconColor: string;
}

export function InjectionCard({
  title,
  description,
  icon: Icon,
  enabled,
  onToggle,
  onExpand,
  iconColor,
}: InjectionCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="rounded-xl p-6 cursor-pointer group relative overflow-hidden"
      style={{
        backgroundColor: '#14161A',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      }}
      onClick={(e) => {
        // Only expand if not clicking the switch
        if (!(e.target as HTMLElement).closest('[role="switch"]')) {
          onExpand();
        }
      }}
    >
      {/* Hover glow effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at top right, ${iconColor}15, transparent 70%)`
        }}
      />
      
      <div className="relative z-10">
        {/* Icon & Toggle */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}20` }}
          >
            <Icon className="w-6 h-6" style={{ color: iconColor }} />
          </div>
          
          <Switch
            checked={enabled}
            onCheckedChange={onToggle}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-white/50 mb-4 leading-relaxed">{description}</p>

        {/* Expand button */}
        <button
          className="flex items-center gap-2 text-sm font-medium text-white/65 hover:text-[#FFC857] transition-colors group/btn"
          onClick={(e) => {
            e.stopPropagation();
            onExpand();
          }}
        >
          Configure Rules
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
