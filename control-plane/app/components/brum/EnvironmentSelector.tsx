import { Server, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type Environment = 'staging' | 'synthetic' | 'production-shadow';

interface EnvironmentOption {
  value: Environment;
  label: string;
  description: string;
  color: string;
}

const environments: EnvironmentOption[] = [
  {
    value: 'staging',
    label: 'Staging',
    description: 'Pre-production testing environment',
    color: '#6B9AFF',
  },
  {
    value: 'synthetic',
    label: 'Synthetic Monitoring',
    description: 'Automated probe traffic only',
    color: '#52D890',
  },
  {
    value: 'production-shadow',
    label: 'Production Shadow',
    description: 'Live traffic mirroring (isolated)',
    color: '#FFB84D',
  },
];

export function EnvironmentSelector() {
  const [selectedEnv, setSelectedEnv] = useState<Environment>('synthetic');
  const [isOpen, setIsOpen] = useState(false);

  const selected = environments.find((env) => env.value === selectedEnv)!;

  return (
    <div className="px-8 py-6 border-b border-text-100/10">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-text-100/50" />
            <span className="text-sm text-text-100/50">Target Environment:</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl hover:bg-text-100/5 transition-all duration-200"
              style={{
                backgroundColor: 'var(--panel-700)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selected.color, boxShadow: `0 0 8px ${selected.color}80` }}
                />
                <div className="text-left">
                  <div className="font-medium text-sm">{selected.label}</div>
                  <div className="text-xs text-text-100/40">{selected.description}</div>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-text-100/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <AnimatePresence>
              {isOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsOpen(false)}
                  />

                  {/* Dropdown */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 rounded-xl overflow-hidden z-20"
                    style={{
                      backgroundColor: 'var(--panel-700)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {environments.map((env) => (
                      <button
                        key={env.value}
                        onClick={() => {
                          setSelectedEnv(env.value);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-text-100/5 transition-colors ${env.value === selectedEnv ? 'bg-text-100/5' : ''
                          }`}
                      >
                        <div
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: env.color,
                            boxShadow: `0 0 8px ${env.color}80`,
                          }}
                        />
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm">{env.label}</div>
                          <div className="text-xs text-text-100/40">{env.description}</div>
                        </div>
                        {env.value === selectedEnv && (
                          <div className="w-5 h-5 rounded-full bg-[#52D890] flex items-center justify-center">
                            <div className="w-2 h-2 bg-text-100 rounded-full" />
                          </div>
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
