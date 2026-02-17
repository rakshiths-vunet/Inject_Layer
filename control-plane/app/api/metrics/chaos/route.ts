
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('http://10.1.92.251:8080/__chaos/prometheus', {
            cache: 'no-store',
            // Set specific agent headers if needed
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Backend returned ${response.status}` }, { status: response.status });
        }

        const text = await response.text();
        const metrics = parsePrometheusMetrics(text);
        return NextResponse.json(metrics);
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json({ error: "Failed to fetch metrics from backend" }, { status: 500 });
    }
}

// Logic copied to server side to avoid duplicating lib/prometheus.ts import issues in edge/node
interface ChaosMetric {
    id: string;
    name: string;
    matched: number;
    triggered: number;
    latency_total_ms: number;
}

function parsePrometheusMetrics(text: string): ChaosMetric[] {
    const lines = text.split('\n');
    const metricsMap = new Map<string, any>();

    lines.forEach(line => {
        if (line.startsWith('#') || line.trim() === '') return;

        // chaos_metric_name{id="...",name="..."} value
        const match = line.match(/^([a-z_]+)\{(.+)\}\s+(.+)$/);
        if (!match) return;

        const [, metricName, labelsStr, valueStr] = match;
        const value = parseFloat(valueStr);

        // Simple label parsing
        const labels: Record<string, string> = {};
        // This regex handles key="val"
        const labelRegex = /([a-z_]+)="([^"]*)"/g;
        let labelMatch;
        while ((labelMatch = labelRegex.exec(labelsStr)) !== null) {
            labels[labelMatch[1]] = labelMatch[2];
        }

        const id = labels['id'];
        if (!id) return; // Must have ID

        if (!metricsMap.has(id)) {
            metricsMap.set(id, {
                id,
                name: labels['name'] || id,
                matched: 0,
                triggered: 0,
                latency_total_ms: 0
            });
        }
        const metric = metricsMap.get(id);

        if (metricName === 'chaos_matched_total') metric.matched = value;
        if (metricName === 'chaos_triggered_total') metric.triggered = value;
        if (metricName === 'chaos_latency_ms_total') metric.latency_total_ms = value;
    });

    return Array.from(metricsMap.values());
}
