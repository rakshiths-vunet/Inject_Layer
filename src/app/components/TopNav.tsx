import { Zap, User } from 'lucide-react';
import { Switch } from './ui/switch';

interface TopNavProps {
  globalInjectionEnabled: boolean;
  onToggleGlobalInjection: (enabled: boolean) => void;
}

export function TopNav({ globalInjectionEnabled, onToggleGlobalInjection }: TopNavProps) {
  const navItems = ['Dashboard', 'Scenarios', 'Network Rules', 'JS Faults', 'Resource Controls', 'Metrics'];

  return (
    <nav className="h-16 border-b border-white/10 backdrop-blur-sm sticky top-0 z-50"
         style={{ backgroundColor: 'rgba(15, 17, 20, 0.8)' }}>
      <div className="max-w-[1920px] mx-auto px-8 h-full flex items-center justify-between">
        {/* Left: Logo & Status */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FFC857] to-[#FFB84D] flex items-center justify-center">
              <Zap className="w-6 h-6 text-[#0B0C0F]" fill="#0B0C0F" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">CHAOS CONTROL</h1>
              <p className="text-xs text-white/45">Browser-Side Error Injection Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
               style={{ backgroundColor: globalInjectionEnabled ? 'rgba(82, 216, 144, 0.1)' : 'rgba(255, 255, 255, 0.05)' }}>
            <div className={`w-2 h-2 rounded-full ${globalInjectionEnabled ? 'bg-[#52D890]' : 'bg-white/30'}`} 
                 style={{ boxShadow: globalInjectionEnabled ? '0 0 8px rgba(82, 216, 144, 0.6)' : 'none' }} />
            <span className="text-xs font-medium" style={{ color: globalInjectionEnabled ? '#52D890' : 'rgba(255, 255, 255, 0.65)' }}>
              Injection Engine: {globalInjectionEnabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Center: Navigation */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item}
              className="px-4 py-2 text-sm font-medium text-white/65 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Right: Global Toggle & User */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-white/65">Enable Global Injection</span>
            <Switch
              checked={globalInjectionEnabled}
              onCheckedChange={onToggleGlobalInjection}
            />
          </div>
          
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6B9AFF] to-[#4A7FFF] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
            <User className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    </nav>
  );
}
