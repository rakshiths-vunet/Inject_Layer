"use client";

export type ToxicType =
    | "latency"
    | "bandwidth"
    | "slow_close"
    | "reset_peer"
    | "limit_data"
    | "slicer";

export type Direction = "downstream" | "upstream";

export interface ToxicFormValues {
    name: string;
    type: ToxicType;
    stream: Direction;
    toxicity: number;
    // latency
    latency?: number;
    jitter?: number;
    // bandwidth
    rate?: number;
    // slow_close
    delay?: number;
    // limit_data
    bytes?: number;
    // slicer
    average_size?: number;
    size_variation?: number;
    slicer_delay?: number;
}

export const TOXIC_TYPE_OPTIONS: { value: ToxicType; label: string; emoji: string; description: string }[] = [
    { value: "latency", label: "Simulate Slow Response", emoji: "🐢", description: "Add latency and jitter to network responses" },
    { value: "bandwidth", label: "Simulate Network Throttling", emoji: "🐌", description: "Throttle data transfer rate (KB/s)" },
    { value: "slow_close", label: "Simulate Connection Timeout", emoji: "⏳", description: "Delay TCP close, simulating hanging sockets" },
    { value: "reset_peer", label: "Simulate Service Crash", emoji: "💥", description: "Reset connection abruptly (RST packets)" },
    { value: "limit_data", label: "Simulate Packet Limit", emoji: "📉", description: "Allow only N bytes then drop connection" },
    { value: "slicer", label: "Simulate Data Corruption", emoji: "🔥", description: "Slice data into delayed micro-chunks" },
];

const inputCls =
    "w-full h-9 px-3 rounded-lg bg-bg-900/30 border border-text-100/10 text-sm font-mono text-text-100 focus:outline-none focus:border-accent-500/50 placeholder:text-text-100/20 transition-colors";

const labelCls = "text-xs text-text-40 font-medium";

function Field({ label, tooltip, children }: { label: string; tooltip?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className={labelCls} title={tooltip}>
                {label}
                {tooltip && <span className="ml-1 text-text-100/20 cursor-help">ⓘ</span>}
            </label>
            {children}
        </div>
    );
}

function NumberInput({
    value,
    onChange,
    placeholder,
    min,
    max,
    step,
}: {
    value: number | undefined;
    onChange: (v: number) => void;
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
}) {
    return (
        <input
            type="number"
            min={min ?? 0}
            max={max}
            step={step ?? 1}
            value={value ?? ""}
            onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
            placeholder={placeholder}
            className={inputCls}
        />
    );
}

interface ToxicTypeFormProps {
    values: ToxicFormValues;
    onChange: (updated: Partial<ToxicFormValues>) => void;
}

export function ToxicTypeForm({ values, onChange }: ToxicTypeFormProps) {
    const up = (patch: Partial<ToxicFormValues>) => onChange(patch);

    return (
        <div className="flex flex-col gap-4">
            {/* Name */}
            <Field label="Toxic Name" tooltip="Unique identifier for this injection">
                <input
                    type="text"
                    value={values.name}
                    onChange={(e) => up({ name: e.target.value })}
                    placeholder="e.g. latency-prod-test"
                    className={inputCls}
                />
            </Field>

            {/* Direction */}
            <Field label="Direction" tooltip="Downstream = requests going to service; Upstream = responses coming back">
                <select
                    value={values.stream}
                    onChange={(e) => up({ stream: e.target.value as Direction })}
                    className={inputCls}
                >
                    <option value="downstream">Downstream (Requests →)</option>
                    <option value="upstream">Upstream (← Responses)</option>
                </select>
            </Field>

            {/* Toxicity */}
            <Field label={`Toxicity: ${(values.toxicity * 100).toFixed(0)}%`} tooltip="Percentage of connections this toxic applies to (1.0 = 100%)">
                <div className="flex items-center gap-3">
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={values.toxicity}
                        onChange={(e) => up({ toxicity: parseFloat(e.target.value) })}
                        className="flex-1 accent-[#FFC857] h-1.5 rounded-full"
                    />
                    <span className="text-xs font-mono text-accent-500 w-10 text-right font-bold">
                        {(values.toxicity * 100).toFixed(0)}%
                    </span>
                </div>
            </Field>

            {/* Type-specific fields */}
            {values.type === "latency" && (
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Latency (ms)" tooltip="Base delay added to each response">
                        <NumberInput value={values.latency} onChange={(v) => up({ latency: v })} placeholder="2000" min={0} />
                    </Field>
                    <Field label="Jitter (ms)" tooltip="Random ±variance added to latency">
                        <NumberInput value={values.jitter} onChange={(v) => up({ jitter: v })} placeholder="500" min={0} />
                    </Field>
                </div>
            )}

            {values.type === "bandwidth" && (
                <Field label="Rate (KB/s)" tooltip="Maximum allowed data transfer rate">
                    <NumberInput value={values.rate} onChange={(v) => up({ rate: v })} placeholder="50" min={1} />
                </Field>
            )}

            {values.type === "slow_close" && (
                <Field label="Delay (ms)" tooltip="How long to wait before closing the connection">
                    <NumberInput value={values.delay} onChange={(v) => up({ delay: v })} placeholder="5000" min={0} />
                </Field>
            )}

            {values.type === "limit_data" && (
                <Field label="Bytes Limit" tooltip="Number of bytes allowed before dropping the connection">
                    <NumberInput value={values.bytes} onChange={(v) => up({ bytes: v })} placeholder="1024" min={1} />
                </Field>
            )}

            {values.type === "slicer" && (
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Average Size (bytes)" tooltip="Average chunk size to slice data into">
                        <NumberInput value={values.average_size} onChange={(v) => up({ average_size: v })} placeholder="1" min={1} />
                    </Field>
                    <Field label="Size Variation" tooltip="Variation ± around average size">
                        <NumberInput value={values.size_variation} onChange={(v) => up({ size_variation: v })} placeholder="0" min={0} />
                    </Field>
                    <Field label="Delay (μs)" tooltip="Delay between each slice in microseconds">
                        <NumberInput value={values.slicer_delay} onChange={(v) => up({ slicer_delay: v })} placeholder="0" min={0} />
                    </Field>
                </div>
            )}
        </div>
    );
}

export function buildToxicPayload(values: ToxicFormValues): Record<string, any> {
    const base = {
        name: values.name || `${values.type}-${Date.now()}`,
        type: values.type,
        stream: values.stream,
        toxicity: values.toxicity,
    };

    switch (values.type) {
        case "latency":
            return { ...base, attributes: { latency: values.latency ?? 2000, jitter: values.jitter ?? 0 } };
        case "bandwidth":
            return { ...base, attributes: { rate: values.rate ?? 50 } };
        case "slow_close":
            return { ...base, attributes: { delay: values.delay ?? 5000 } };
        case "reset_peer":
            return { ...base, attributes: {} };
        case "limit_data":
            return { ...base, attributes: { bytes: values.bytes ?? 1024 } };
        case "slicer":
            return {
                ...base,
                attributes: {
                    average_size: values.average_size ?? 1,
                    size_variation: values.size_variation ?? 0,
                    delay: values.slicer_delay ?? 0,
                },
            };
        default:
            return base;
    }
}
