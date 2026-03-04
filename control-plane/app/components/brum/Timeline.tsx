import { Clock, Play, Square, AlertCircle } from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: 'activated' | 'deactivated' | 'modified';
  scenario: string;
  timestamp: string;
  user: string;
}

const mockEvents: TimelineEvent[] = [
  { id: '1', type: 'activated', scenario: 'API Manipulation - Payment Endpoint', timestamp: '2 min ago', user: 'Sarah Chen' },
  { id: '2', type: 'modified', scenario: 'Network Chaos - 20% Packet Drop', timestamp: '8 min ago', user: 'Mike Rodriguez' },
  { id: '3', type: 'deactivated', scenario: 'JavaScript Fault Injection', timestamp: '15 min ago', user: 'Sarah Chen' },
  { id: '4', type: 'activated', scenario: 'Slow Core Banking Scenario', timestamp: '23 min ago', user: 'Alex Kim' },
  { id: '5', type: 'activated', scenario: 'Resource Blocking - CDN Assets', timestamp: '1 hour ago', user: 'Sarah Chen' },
];

export function Timeline() {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'activated':
        return <Play className="w-4 h-4 text-[#52D890]" />;
      case 'deactivated':
        return <Square className="w-4 h-4 text-text-100/40" />;
      case 'modified':
        return <AlertCircle className="w-4 h-4 text-[#FFB84D]" />;
    }
  };

  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'activated':
        return '#52D890';
      case 'deactivated':
        return 'var(--text-60)';
      case 'modified':
        return '#FFB84D';
    }
  };

  const getEventLabel = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'activated':
        return 'Activated';
      case 'deactivated':
        return 'Deactivated';
      case 'modified':
        return 'Modified';
    }
  };

  return (
    <div className="px-8 py-8">
      <div className="max-w-[1920px] mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Clock className="w-5 h-5 text-text-100/50" />
          <h2 className="text-xl font-bold">Activity Timeline</h2>
        </div>

        <div
          className="rounded-xl p-6"
          style={{
            backgroundColor: 'var(--panel-700)',
            border: '1px solid var(--border)',
          }}
        >
          <div className="space-y-4">
            {mockEvents.map((event, index) => (
              <div key={event.id} className="flex items-start gap-4 group">
                {/* Timeline indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${getEventColor(event.type)}20` }}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  {index < mockEvents.length - 1 && (
                    <div className="w-0.5 h-12 bg-text-100/10 my-1" />
                  )}
                </div>

                {/* Event content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${getEventColor(event.type)}20`,
                            color: getEventColor(event.type),
                          }}
                        >
                          {getEventLabel(event.type)}
                        </span>
                        <span className="text-sm font-medium">{event.scenario}</span>
                      </div>
                      <div className="text-sm text-text-100/50">
                        by <span className="text-text-100/70">{event.user}</span>
                      </div>
                    </div>
                    <div className="text-sm text-text-100/40 whitespace-nowrap">{event.timestamp}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
