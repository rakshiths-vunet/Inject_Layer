import { Power, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface KillSwitchProps {
  onKillAll: () => void;
}

export function KillSwitch({ onKillAll }: KillSwitchProps) {
  return (
    <div className="px-8 py-8">
      <div className="max-w-[1920px] mx-auto">
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            backgroundColor: 'var(--panel-700)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
            boxShadow: '0 4px 24px rgba(255, 107, 107, 0.1)',
          }}
        >
          {/* Background gradient */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 107, 107, 0.3), transparent 70%)',
            }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#FF6B6B]/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-[#FF6B6B]" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Emergency Reset</h3>
                <p className="text-sm text-text-100/50">
                  Immediately disable all active chaos injection rules across all categories
                </p>
              </div>
            </div>

            <button
              onClick={onKillAll}
              className="px-8 py-4 rounded-xl font-semibold bg-[#FF6B6B] text-text-100 hover:bg-[#FF5555] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3"
            >
              <Power className="w-5 h-5" />
              Disable All Chaos Rules Immediately
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
