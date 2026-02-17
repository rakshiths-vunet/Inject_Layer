
import {
    Network,
    Zap,
    Server,
    Wifi,
    FileX,
    Navigation,
    Lock,
    Search,
    Code,
    ArrowRightLeft,
    Activity,
    ShieldAlert,
    Clock,
    Eye,
    Layers,
    Smartphone,
} from "lucide-react";

export interface InjectionField {
    id: string;
    label: string;
    type: "number" | "text" | "select" | "slider" | "checkbox" | "textarea" | "multiselect";
    placeholder?: string;
    defaultValue?: any;
    options?: { label: string; value: string }[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
}

export interface InjectionType {
    id: string;
    title: string;
    description: string;
    fields: InjectionField[];
}

export interface InjectionCategory {
    id: string;
    title: string;
    description: string;
    icon: any;
    iconColor: string;
    enabled: boolean;
    types: InjectionType[];
}

export const INJECTION_CATEGORIES: InjectionCategory[] = [
    {
        id: "latency",
        title: "Latency",
        description: "Simulate delays at API, frontend, or asset level.",
        icon: Clock,
        iconColor: "#FF6B6B",
        enabled: true,
        types: [
            {
                id: "fixed-delay",
                title: "Fixed Delay",
                description: "800ms fixed on /api/",
                fields: [
                    { id: "delay", label: "Delay", type: "number", defaultValue: 800, unit: "ms" },
                    { id: "max_cap", label: "Max cap (optional)", type: "number", unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "target", label: "Target (URI regex / path prefix)", type: "text", defaultValue: "/api/" },
                ],
            },
            {
                id: "uniform-random",
                title: "Uniform Random",
                description: "200–3000ms on /api/payment",
                fields: [
                    { id: "min_delay", label: "Min delay", type: "number", defaultValue: 200, unit: "ms" },
                    { id: "max_delay", label: "Max delay", type: "number", defaultValue: 3000, unit: "ms" },
                    { id: "max_cap", label: "Max cap (optional)", type: "number", unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    {
                        id: "method",
                        label: "Method filter",
                        type: "select",
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ],
                    },
                    { id: "target", label: "URI / path / location", type: "text", defaultValue: "/api/payment" },
                ],
            },
            {
                id: "normal-distribution",
                title: "Normal Distribution",
                description: "Example: μ=1200ms, σ=400ms",
                fields: [
                    { id: "mean", label: "Mean (μ)", type: "number", defaultValue: 1200, unit: "ms" },
                    { id: "std_dev", label: "Std Dev (σ)", type: "number", defaultValue: 400, unit: "ms" },
                    { id: "max_cap", label: "Max cap", type: "number", unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "target", label: "URI", type: "text" },
                ],
            },
            {
                id: "exponential",
                title: "Exponential (long-tail)",
                description: "Example: mean 500ms, 10% of all requests",
                fields: [
                    { id: "mean", label: "Mean", type: "number", defaultValue: 500, unit: "ms" },
                    { id: "max_cap", label: "Max cap", type: "number", unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 10, unit: "%" },
                ]
            },
            {
                id: "step-bimodal",
                title: "Step/Bimodal",
                description: "Example: normal 200ms + 5% chance 15s spike",
                fields: [
                    { id: "normal_delay", label: "Normal delay", type: "number", defaultValue: 200, unit: "ms" },
                    { id: "spike_delay", label: "Spike delay", type: "number", defaultValue: 15000, unit: "ms" },
                    { id: "spike_probability", label: "Spike probability", type: "slider", min: 0, max: 100, defaultValue: 5, unit: "%" },
                ]
            },
            {
                id: "slow-body",
                title: "Slow Body / Chunked Drip",
                description: "Example: slow image or JS download",
                fields: [
                    { id: "delay_per_chunk", label: "Delay per chunk", type: "number", unit: "ms" },
                    { id: "file_type", label: "File type", type: "text", placeholder: ".js, .png" },
                    { id: "uri_regex", label: "URI regex", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "stacking-latency",
                title: "Stacking Latency",
                description: "Multi-rule / continue_on_match → cumulative delay",
                fields: [
                    { id: "rules", label: "Select multiple rules", type: "multiselect", options: [] }, // Populate dynamically if possible, or use placeholder
                    { id: "cumulative", label: "Cumulative effect", type: "checkbox", defaultValue: true },
                ]
            }
        ],
    },
    {
        id: "network-tcp",
        title: "Network / TCP-Level",
        description: "Simulate connection failures at TCP layer.",
        icon: Wifi,
        iconColor: "#52D890",
        enabled: true,
        types: [
            {
                id: "tcp-reset",
                title: "TCP Reset",
                description: "Simulate TCP RST",
                fields: [
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "target", label: "Target URI / path / location", type: "text" },
                ],
            },
            {
                id: "connection-hang",
                title: "Connection Hang",
                description: "Simulate connection hang",
                fields: [
                    { id: "duration", label: "Duration", type: "number", unit: "s" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "target", label: "Target URI", type: "text" },
                ],
            },
            {
                id: "upstream-fail",
                title: "Upstream Fail (502/503)",
                description: "Simulate upstream failure",
                fields: [
                    { id: "target", label: "Target URI / path", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "chunked-truncation",
                title: "Chunked Truncation",
                description: "Truncate response body",
                fields: [
                    { id: "truncate_at", label: "Truncate at X bytes", type: "number" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "target", label: "Target location_tag / URI", type: "text" },
                ],
            },
        ],
    },
    {
        id: "http-status",
        title: "HTTP Status Errors",
        description: "Return specific HTTP status codes for API endpoints.",
        icon: Server,
        iconColor: "#6B9AFF",
        enabled: true,
        types: [
            {
                id: "static-status",
                title: "Static Status Code",
                description: "Example: always 503 on /api/dashboard",
                fields: [
                    { id: "status_code", label: "Status code", type: "number", defaultValue: 503 },
                    { id: "body", label: "Optional body", type: "textarea" },
                    { id: "retry_after", label: "Retry-After", type: "number", unit: "s" },
                    { id: "uri", label: "URI", type: "text", defaultValue: "/api/dashboard" },
                ],
            },
            {
                id: "random-status",
                title: "Random Status",
                description: "Example: 500, 502, 504, 403 randomly",
                fields: [
                    { id: "codes", label: "List of codes", type: "text", placeholder: "500, 502, 504, 403" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "uri", label: "URI", type: "text" },
                ],
            },
            {
                id: "rate-limit",
                title: "Rate-Limit 429",
                description: "Stateless or Stateful rate limiting",
                fields: [
                    { id: "mode", label: "Mode", type: "select", options: [{ label: "Stateless", value: "stateless" }, { label: "Stateful", value: "stateful" }] },
                    { id: "probability", label: "Probability (Stateless)", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "window", label: "Window (Stateful)", type: "number", unit: "s" },
                    { id: "limit", label: "Limit", type: "number" },
                    { id: "retry_after", label: "Retry-After", type: "number", unit: "s" },
                    { id: "uri", label: "URI", type: "text" },
                ]
            }
        ],
    },
    {
        id: "auth-session",
        title: "Authentication / Session Failures",
        description: "Test auth and session handling in frontend/RUM.",
        icon: Lock,
        iconColor: "#FFC857",
        enabled: true,
        types: [
            {
                id: "401-unauthorized",
                title: "401 Unauthorized",
                description: "Random 401 with rotating reasons",
                fields: [
                    { id: "reasons", label: "Select reasons list", type: "multiselect", options: [{ label: "Token Expired", value: "token_expired" }, { label: "Invalid Signature", value: "invalid_signature" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "uri", label: "URI / location_tag", type: "text" },
                ],
            },
            {
                id: "403-forbidden",
                title: "403 Forbidden",
                description: "Example: /api/settings for non-admin",
                fields: [
                    { id: "message", label: "Message (custom)", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "uri", label: "URI", type: "text", defaultValue: "/api/settings" },
                ],
            },
            {
                id: "intermittent-401",
                title: "Intermittent 401",
                description: "Fails occasionally",
                fields: [
                    { id: "rate", label: "Rate (%)", type: "number", defaultValue: 10 },
                    { id: "reasons", label: "Reasons", type: "text" },
                    { id: "uri", label: "URI filter", type: "text" },
                ],
            },
            {
                id: "broken-session",
                title: "Broken Session / Corrupt Cookie",
                description: "Corrupt cookies or session data",
                fields: [
                    { id: "set_cookie", label: "Apply on Set-Cookie", type: "checkbox" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            }
        ],
    },
    {
        id: "frontend-asset",
        title: "Frontend Asset Failures",
        description: "Break JS, CSS, images to simulate client-side failures.",
        icon: FileX,
        iconColor: "#FFB84D", // Changed to orange-ish
        enabled: true,
        types: [
            {
                id: "asset-404-503",
                title: "HTTP 404 / 503 on assets",
                description: "Fail asset requests",
                fields: [
                    { id: "target", label: "URI regex or file type", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "body", label: "Optional body message", type: "text" },
                ]
            },
            {
                id: "corrupt-js",
                title: "Corrupt / Truncate JS",
                description: "Break JS files",
                fields: [
                    { id: "truncate_at", label: "Truncate at X bytes", type: "number" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "wrong-mime",
                title: "Wrong MIME-Type",
                description: "Serve wrong MIME type",
                fields: [
                    { id: "mime", label: "MIME override", type: "text", defaultValue: "text/plain" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "slow-asset",
                title: "Slow Body / Throttle",
                description: "Slow down asset download",
                fields: [
                    { id: "delay", label: "Delay per chunk", type: "number", unit: "ms" },
                    { id: "file_types", label: "File types", type: "text", defaultValue: ".js, .png, .css" },
                ]
            }
        ]
    },
    {
        id: "cors-csp",
        title: "CORS / CSP / Browser Security",
        description: "Break or modify headers to test browser behavior.",
        icon: ShieldAlert,
        iconColor: "#FF4D4D",
        enabled: true,
        types: [
            {
                id: "remove-cors",
                title: "Remove All CORS Headers",
                description: "Strip CORS headers",
                fields: [
                    { id: "target", label: "URI / location_tag", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "wrong-origin",
                title: "Wrong CORS Origin",
                description: "Spoof origin",
                fields: [
                    { id: "origin", label: "Origin value", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "wildcard-cors",
                title: "Wildcard CORS + credentials",
                description: "Test wildcard CORS with credentials",
                fields: [
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "csp-injection",
                title: "CSP Injection",
                description: "Inject Content Security Policy",
                fields: [
                    { id: "policy", label: "Full policy string", type: "textarea" },
                    {
                        id: "options",
                        label: "Options",
                        type: "select",
                        options: [
                            { label: "Block all scripts", value: "block-scripts" },
                            { label: "Block fonts only", value: "block-fonts" },
                        ],
                    },
                    { id: "target", label: "Target URI (index.html)", type: "text", defaultValue: "index.html" },
                ]
            },
            {
                id: "options-hang",
                title: "OPTIONS Preflight Hang",
                description: "Hang OPTIONS requests",
                fields: [
                    { id: "duration", label: "Duration", type: "number", unit: "s" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            }
        ]
    },
    {
        id: "json-corruption",
        title: "JSON / API Response Corruption",
        description: "Mess with API payloads to test frontend resilience.",
        icon: Code,
        iconColor: "#A06BFF",
        enabled: true,
        types: [
            {
                id: "corrupt-json",
                title: "Corrupt JSON",
                description: "Inject garbage or null values",
                fields: [
                    { id: "strategy", label: "Strategy", type: "select", options: [{ label: "Inject Garbage", value: "garbage" }, { label: "Null Values", value: "nulls" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "uri", label: "URI filter", type: "text" },
                ]
            },
            {
                id: "wrong-types",
                title: "Wrong Types",
                description: "Convert numbers/booleans to strings",
                fields: [
                    { id: "uri", label: "URI", type: "text" },
                ]
            },
            {
                id: "remove-fields",
                title: "Remove Fields",
                description: "Remove specific fields",
                fields: [
                    { id: "fields", label: "List of fields", type: "text", placeholder: "comma separated" },
                    { id: "uri", label: "URI", type: "text" },
                ]
            },
            {
                id: "replace-value",
                title: "Replace Field Value",
                description: "Override specific field values",
                fields: [
                    { id: "field", label: "Field name", type: "text" },
                    { id: "value", label: "Value override", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "invalid-json",
                title: "Invalid JSON",
                description: "Return invalid JSON structure",
                fields: [
                    { id: "payload", label: "Custom payload string", type: "textarea" },
                    { id: "uri", label: "URI", type: "text" },
                ]
            },
            {
                id: "empty-response",
                title: "Empty Response",
                description: "Return empty body",
                fields: [
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "uri", label: "URI", type: "text" },
                ]
            },
            {
                id: "wrong-structure",
                title: "Wrong JSON Structure",
                description: "e.g., array instead of object",
                fields: [
                    { id: "payload", label: "Custom payload", type: "textarea" },
                    { id: "uri", label: "URI", type: "text" },
                ]
            }
        ]
    },
    {
        id: "js-injection",
        title: "JS Injection / Client Chaos",
        description: "Inject errors or CPU/GPU load in browser.",
        icon: Zap,
        iconColor: "#FFC857",
        enabled: true,
        types: [
            {
                id: "throw-error",
                title: "Throw JS Error",
                description: "Inject script that throws error",
                fields: [
                    { id: "script", label: "Script snippet", type: "textarea" },
                    { id: "target", label: "Target insertion point", type: "select", options: [{ label: "</body>", value: "body_end" }, { label: "<head>", value: "head" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "override-fetch",
                title: "Override window.fetch",
                description: "Corrupt fetch responses",
                fields: [
                    { id: "body", label: "Corrupt body", type: "textarea" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "long-task",
                title: "Long Task Injection",
                description: "Freeze the main thread",
                fields: [
                    { id: "duration", label: "Duration", type: "number", unit: "ms" },
                    { id: "delay", label: "Delay", type: "number", unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "console-spam",
                title: "Console Spam",
                description: "Flood the console with errors",
                fields: [
                    { id: "count", label: "Count (# errors)", type: "number" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "raf-loop",
                title: "requestAnimationFrame Loop",
                description: "Create infinite loop",
                fields: [
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "target", label: "Target URI", type: "text" },
                ]
            }
        ]
    },
    {
        id: "routing",
        title: "Routing / Redirects",
        description: "Break navigation flows or redirect loops.",
        icon: Navigation,
        iconColor: "#6B9AFF",
        enabled: true,
        types: [
            {
                id: "redirect-loop",
                title: "Redirect Loop",
                description: "Redirect to self",
                fields: [
                    { id: "uri_regex", label: "URI regex", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "wrong-redirect",
                title: "Wrong Redirect",
                description: "Redirect to wrong location",
                fields: [
                    { id: "target", label: "Target URI", type: "text" },
                    { id: "status", label: "Status code", type: "select", options: [{ label: "301", value: "301" }, { label: "302", value: "302" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            }
        ]
    },
    {
        id: "observability",
        title: "Observability / RUM Headers",
        description: "Add headers for tracing / RUM SDK testing.",
        icon: Search,
        iconColor: "#52D890",
        enabled: true,
        types: [
            {
                id: "custom-headers",
                title: "Add custom headers",
                description: "Inject key-value headers",
                fields: [
                    { id: "headers", label: "Custom headers (key:value)", type: "textarea" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "continue", label: "Continue on match", type: "checkbox" },
                    { id: "target", label: "Target URI / location", type: "text" },
                ]
            }
        ]
    },
    {
        id: "encoding",
        title: "Encoding / Transfer Tricks",
        description: "Break clients expecting certain encodings.",
        icon: ArrowRightLeft,
        iconColor: "#FFC857",
        enabled: true,
        types: [
            {
                id: "wrong-encoding",
                title: "Wrong Encoding",
                description: "Lie about gzip/brotli",
                fields: [
                    { id: "encoding", label: "Select encoding", type: "select", options: [{ label: "gzip", value: "gzip" }, { label: "br", value: "br" }, { label: "deflate", value: "deflate" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "bad-content-length",
                title: "Bad Content-Length",
                description: "Incorrect content-length header",
                fields: [
                    { id: "offset", label: "Offset", type: "number" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            }
        ]
    },
    {
        id: "mixed-content",
        title: "Mixed Content",
        description: "Allow unsafe HTTP content in HTTPS pages.",
        icon: ShieldAlert,
        iconColor: "#FF4D4D",
        enabled: true,
        types: [
            {
                id: "remove-hsts",
                title: "Remove HSTS + CSP",
                description: "Downgrade security",
                fields: [
                    { id: "enabled", label: "Enable", type: "checkbox", defaultValue: true },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            }
        ]
    },
    {
        id: "ttl",
        title: "TTL / One-Shot Rules",
        description: "Rules that expire automatically or fire only once.",
        icon: Clock,
        iconColor: "#6B9AFF",
        enabled: true,
        types: [
            {
                id: "ttl-rule",
                title: "TTL Rule",
                description: "Expires after seconds",
                fields: [
                    { id: "ttl", label: "TTL seconds", type: "number" },
                    { id: "oneshot", label: "One-shot", type: "checkbox" },
                    { id: "target", label: "Target URI / location", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            }
        ]
    },
    {
        id: "dry-run",
        title: "Dry-Run Rules",
        description: "Annotate requests without actual injection.",
        icon: Eye,
        iconColor: "#52D890",
        enabled: true,
        types: [
            {
                id: "dry-run-rule",
                title: "Dry Run",
                description: "Log but don't inject",
                fields: [
                    { id: "enabled", label: "Dry-run toggle", type: "checkbox", defaultValue: true },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                    { id: "target", label: "Target URI / method", type: "text" },
                ]
            }
        ]
    },
    {
        id: "multi-rule",
        title: "Multi-Rule / Stackable Effects",
        description: "Combine multiple injections on same request.",
        icon: Layers,
        iconColor: "#A06BFF",
        enabled: true,
        types: [
            {
                id: "stackable",
                title: "Stackable Rules",
                description: "Apply multiple rules",
                fields: [
                    { id: "rules", label: "Rule selection", type: "multiselect", options: [] },
                    { id: "continue", label: "Continue-on-match", type: "checkbox" },
                ]
            }
        ]
    },
    {
        id: "user-agent",
        title: "User-Agent Targeting",
        description: "Target specific clients, devices, or browsers.",
        icon: Smartphone,
        iconColor: "#FFB84D",
        enabled: true,
        types: [
            {
                id: "ua-target",
                title: "User-Agent Target",
                description: "Inject based on UA",
                fields: [
                    { id: "regex", label: "User-Agent regex", type: "text" },
                    { id: "rule_type", label: "Target rule type", type: "select", options: [{ label: "Latency", value: "latency" }, { label: "Network", value: "network" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            }
        ]
    }
];
