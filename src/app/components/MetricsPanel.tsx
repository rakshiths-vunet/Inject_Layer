import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const generateMockData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    value: Math.random() * 100 + 50,
  }));
};

interface MetricCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down';
  trendValue: string;
  color: string;
}

function MetricCard({ title, value, trend, trendValue, color }: MetricCardProps) {
  const data = generateMockData();

  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{
        backgroundColor: '#14161A',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-sm text-white/50 mb-1">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
              trend === 'up' ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]' : 'bg-[#52D890]/20 text-[#52D890]'
            }`}
          >
            {trend === 'up' ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trendValue}
          </div>
        </div>

        <div className="h-12 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <YAxis hide domain={['dataMin', 'dataMax']} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Glow effect */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2 opacity-20"
        style={{
          background: `linear-gradient(to top, ${color}, transparent)`,
        }}
      />
    </div>
  );
}

export function MetricsPanel() {
  const metrics = [
    { title: 'P95 Latency', value: '2.4s', trend: 'up' as const, trendValue: '+180%', color: '#FFB84D' },
    { title: 'CLS Spike', value: '0.42', trend: 'up' as const, trendValue: '+320%', color: '#FF6B6B' },
    { title: 'INP Delay', value: '890ms', trend: 'up' as const, trendValue: '+210%', color: '#6B9AFF' },
    { title: 'API Error Rate', value: '18%', trend: 'up' as const, trendValue: '+1800%', color: '#FFC857' },
    { title: 'Long Tasks', value: '47', trend: 'up' as const, trendValue: '+156%', color: '#52D890' },
  ];

  return (
    <div className="px-8 py-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold mb-1">Live Impact Visualization</h2>
            <p className="text-sm text-white/50">Real-time BRUM metrics affected by active injections</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-[#52D890] animate-pulse" />
            <span className="text-white/50">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>
      </div>
    </div>
  );
}
