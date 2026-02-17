
// app/lib/prometheus.ts

export interface ChaosMetric {
    id: string;
    name?: string;
    matched: number;
    triggered: number;
    latency_total_ms: number;
}

export async function fetchChaosMetrics(): Promise<ChaosMetric[]> {
    try {
        const response = await fetch('http://10.1.92.251:8080/__chaos/prometheus', {
            cache: 'no-store'
        });
        if (!response.ok) {
            console.error("Failed to fetch metrics", response.status);
            return [];
        }
        const text = await response.text();
        return parsePrometheusMetrics(text);
    } catch (error) {
        console.error("Error fetching metrics:", error);
        return [];
    }
}

function parsePrometheusMetrics(text: string): ChaosMetric[] {
    const lines = text.split('\n');
    const metricsMap = new Map<string, Partial<ChaosMetric>>();

    lines.forEach(line => {
        if (line.startsWith('#') || line.trim() === '') return;

        // improved regex to handle labels with spaces and quotes more robustly
        const match = line.match(/^([a-z_]+)\{([^}]+)\}\s+(.+)$/);
        if (!match) return;

        const [, metricName, labelsStr, valueStr] = match;
        const value = parseFloat(valueStr);

        // Parse labels
        const labels: Record<string, string> = {};
        // Regex to match key="value" pairs, handling spaces in values
        const labelRegex = /([a-z_]+)="([^"]*)"/g;
        let labelMatch;
        while ((labelMatch = labelRegex.exec(labelsStr)) !== null) {
            labels[labelMatch[1]] = labelMatch[2];
        }

        const id = labels['id'];
        if (!id) return;

        if (!metricsMap.has(id)) {
            metricsMap.set(id, { id, name: labels['name'] || id });
        }
        const metric = metricsMap.get(id)!;

        if (metricName === 'chaos_matched_total') metric.matched = value;
        if (metricName === 'chaos_triggered_total') metric.triggered = value;
        if (metricName === 'chaos_latency_ms_total') metric.latency_total_ms = value;
    });

    return Array.from(metricsMap.values()) as ChaosMetric[];
}
