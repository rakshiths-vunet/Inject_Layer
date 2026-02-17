
import { useEffect, useState } from 'react';
import { Card } from "../brum/ui/card";
import { User, Activity, Clock, MapPin } from "lucide-react";

// In a real app, this would come from an API.
// We'll simulate based on user request/metrics state change.
interface ActivityEvent {
    id: string;
    user: string;
    action: string;
    timestamp: string;
    details: string;
    ip?: string;
    avatar?: string;
}

export function ActivityTimeline() {
    const [events, setEvents] = useState<ActivityEvent[]>([
        {
            id: '1',
            user: 'Admin User',
            action: 'Deployed Rule',
            timestamp: 'Just now',
            details: 'Fixed Delay (800ms) on /api/auth',
            ip: '10.1.92.15'
        },
        {
            id: '2',
            user: 'System',
            action: 'Injection Triggered',
            timestamp: '2 mins ago',
            details: 'Latency applied to 14 requests',
            ip: '10.1.92.251'
        },
        {
            id: '3',
            user: 'Admin User',
            action: 'Updated Configuration',
            timestamp: '1 hour ago',
            details: 'Disabled Global Latency',
            ip: '10.1.92.15'
        }
    ]);

    // In a real implementation, we would poll an events endpoint or listen to WebSocket.
    // For now, we'll keep the mock data but structure it for easy integration.

    return (
        <Card className="bg-[#0F1114] border-white/10 p-6 h-full">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                Activity Timeline
            </h3>

            <div className="relative border-l border-white/10 ml-3 space-y-8">
                {events.map((event) => (
                    <div key={event.id} className="relative pl-8">
                        {/* Dot */}
                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#0F1114]" />

                        <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-semibold text-white">{event.action}</span>
                                <span className="text-xs text-white/40">{event.timestamp}</span>
                            </div>
                            <p className="text-xs text-white/70 mb-1">{event.details}</p>

                            <div className="flex items-center gap-3 mt-1">
                                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                                    <User className="w-3 h-3 text-white/50" />
                                    <span className="text-[10px] text-white/60">{event.user}</span>
                                </div>
                                {event.ip && (
                                    <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                                        <MapPin className="w-3 h-3 text-white/50" />
                                        <span className="text-[10px] text-white/60">{event.ip}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
