
import {
    Network,
    Zap,
    Server,
    Wifi,
    FileX,
    Navigation,
    Lock,
    Code,
    Activity,
    ShieldAlert,
    Clock,
    Layers,
    MousePointerClick,
} from "lucide-react";

export interface InjectionField {
    id: string;
    label: string;
    type: "number" | "text" | "select" | "slider" | "checkbox" | "textarea" | "multiselect" | "dynamic_list" | "info";
    placeholder?: string;
    defaultValue?: any;
    options?: { label: string; value: string }[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    condition?: { field: string; value: any };
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

export const API_TEMPLATES: Record<string, string[]> = {
    Auth: [
        'gateway/auth/login',
        'gateway/auth/logout',
        'gateway/auth/refresh',
        'gateway/auth/register',
    ],
    Payments: [
        'gateway/payments/initiate',
        'gateway/payments/status',
        'gateway/payments/refund',
    ],
    User: [
        'gateway/user/profile',
        'gateway/user/update',
        'gateway/user/delete',
    ],
    Transactions: [
        'gateway/transactions/list',
        'gateway/transactions/detail',
    ],
};

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];

export const TARGET_FIELDS_BLOCK: InjectionField[] = [
    {
        id: "target_type",
        label: "Target Type",
        type: "select",
        defaultValue: "assets",
        options: [
            { label: "Specific Assets", value: "assets" },
            { label: "API Endpoints", value: "api" },
            { label: "Custom Regex", value: "regex" },
            { label: "Global (All Requests)", value: "global" },
        ]
    },
    {
        id: "custom_regex",
        label: "Custom URI Regex",
        type: "text",
        condition: { field: "target_type", value: "regex" },
        placeholder: "^/api/.*"
    },
    {
        id: "assets_selected",
        label: "Select Assets",
        type: "multiselect",
        condition: { field: "target_type", value: "assets" },
        options: [
            { label: "accountSelection.png", value: "accountSelection.png" },
            { label: "dashboard3.png", value: "dashboard3.png" },
            { label: "favicon.ico", value: "favicon.ico" },
            { label: "phoneArray.png", value: "phoneArray.png" },
            { label: "transaction.png", value: "transaction.png" },
        ]
    },
    {
        id: "api_endpoints",
        label: "API Endpoints",
        type: "dynamic_list",
        condition: { field: "target_type", value: "api" },
        placeholder: "/api/example",
        options: Object.values(API_TEMPLATES).flat().map(val => ({ label: val, value: val }))
    },
    {
        id: "methods",
        label: "HTTP Methods",
        type: "multiselect",
        condition: { field: "target_type", value: "api" },
        defaultValue: ["GET", "POST", "PUT", "DELETE"],
        options: HTTP_METHODS.map(val => ({ label: val, value: val }))
    }
];

export const INJECTION_CATEGORIES: InjectionCategory[] = [
    {
        id: "latency",
        title: "Latency",
        description: "Simulate delays at API, frontend, or asset level.",
        icon: Clock,
        iconColor: "#FF6B6B",
        enabled: false,
        types: [
            {
                id: "fixed-delay",
                title: "Fixed Delay",
                description: "Add fixed latency to requests",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    {
                        id: "global_warning",
                        label: "Warning",
                        type: "info",
                        condition: { field: "target_type", value: "global" },
                        defaultValue: "Warning: This will apply latency to every single request hitting the server."
                    },
                    { id: "delay", label: "Delay", type: "number", defaultValue: 800, unit: "ms" },
                    { id: "max_cap", label: "Max cap (optional)", type: "number", unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "uniform-random",
                title: "Uniform Random",
                description: "200–3000ms on /api/payment",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "min_delay", label: "Min delay", type: "number", defaultValue: 200, unit: "ms" },
                    { id: "max_delay", label: "Max delay", type: "number", defaultValue: 3000, unit: "ms" },
                    { id: "max_cap", label: "Max cap (optional)", type: "number", unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "normal-distribution",
                title: "Normal Distribution",
                description: "Example: μ=1200ms, σ=400ms",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "mean", label: "Mean (μ)", type: "number", defaultValue: 1200, unit: "ms" },
                    { id: "std_dev", label: "Std Dev (σ)", type: "number", defaultValue: 400, unit: "ms" },
                    { id: "max_cap", label: "Max cap", type: "number", unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "exponential",
                title: "Exponential (long-tail)",
                description: "Example: mean 500ms, 10% of all requests",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
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
                    ...TARGET_FIELDS_BLOCK,
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
                    ...TARGET_FIELDS_BLOCK,
                    { id: "delay_per_chunk", label: "Delay per chunk", type: "number", unit: "ms" },
                    { id: "file_type", label: "File type", type: "text", placeholder: ".js, .png" },
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
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
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
        enabled: false,
        types: [
            {
                id: "tcp-reset",
                title: "TCP Reset",
                description: "Simulate TCP RST",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    {
                        id: "global_warning",
                        label: "Warning",
                        type: "info",
                        condition: { field: "target_type", value: "global" },
                        defaultValue: "Warning: This will apply TCP reset to every single request hitting the server."
                    },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "connection-hang",
                title: "Connection Hang",
                description: "Simulate connection hang",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "duration", label: "Duration", type: "number", unit: "s", defaultValue: 30 },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "upstream-fail",
                title: "Upstream Fail (502/503)",
                description: "Simulate upstream failure",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "chunked-truncation",
                title: "Chunked Truncation",
                description: "Truncate response body",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "at_bytes", label: "Truncate at X bytes", type: "number", defaultValue: 50 },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
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
        enabled: false,
        types: [
            {
                id: "static-status",
                title: "Static Status Code",
                description: "Example: always 503 on /api/dashboard",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    {
                        id: "global_warning",
                        label: "Warning",
                        type: "info",
                        condition: { field: "target_type", value: "global" },
                        defaultValue: "Warning: This will apply status errors to every single request hitting the server."
                    },
                    { id: "status_code", label: "Status code", type: "number", defaultValue: 503 },
                    { id: "body", label: "Response Body (JSON)", type: "textarea", placeholder: '{"error":"Service Unavailable"}' },
                    { id: "retry_after", label: "Retry-After (optional)", type: "number", unit: "s" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "random-status",
                title: "Random Status (Mixed Chaos)",
                description: "Example: 500, 502, 504, 403 randomly",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "status_code", label: "Default Status code", type: "number", defaultValue: 500 },
                    { id: "body", label: "Response Body (JSON)", type: "textarea", placeholder: '{"error":"Random chaos error"}' },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 8, unit: "%" },
                ],
            },
            {
                id: "rate-limit-429",
                title: "Rate-Limit 429 (Stateless)",
                description: "Randomly return 429 based on probability",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "limit", label: "Limit (Visual placeholder)", type: "number", defaultValue: 10 },
                    { id: "retry_after", label: "Retry-After", type: "number", unit: "s", defaultValue: 60 },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "stateful-rate-limit",
                title: "Stateful Rate Limit",
                description: "Limit requests per IP over a time window",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "limit", label: "Limit (requests)", type: "number", defaultValue: 5 },
                    { id: "window_s", label: "Window", type: "number", unit: "s", defaultValue: 30 },
                    { id: "retry_after", label: "Retry-After", type: "number", unit: "s", defaultValue: 30 },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
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
        enabled: false,
        types: [
            {
                id: "401-unauthorized",
                title: "401 Unauthorized",
                description: "Random 401 with rotating reasons",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "reasons", label: "Select reasons list", type: "multiselect", options: [{ label: "Token Expired", value: "token_expired" }, { label: "Invalid Signature", value: "invalid_signature" }, { label: "Session Not Found", value: "session_not_found" }, { label: "Insufficient Permissions", value: "insufficient_permissions" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "403-forbidden",
                title: "403 Forbidden",
                description: "Example: /api/settings for non-admin",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "message", label: "Message (custom)", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "intermittent-401",
                title: "Intermittent 401",
                description: "Fails occasionally",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "rate", label: "Rate (%)", type: "number", defaultValue: 10 },
                    { id: "reasons", label: "Reasons list", type: "multiselect", options: [{ label: "Token Expired", value: "token_expired" }, { label: "Invalid Signature", value: "invalid_signature" }, { label: "Session Not Found", value: "session_not_found" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "broken-session",
                title: "Broken Session / Corrupt Cookie",
                description: "Corrupt cookies or session data",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "set_cookie", label: "Apply on Set-Cookie", type: "checkbox" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            }
        ],
    },
    {
        id: "frontend-asset",
        title: "Strict MIME Enforcement Failures",
        description: "Break JS, CSS, images to simulate client-side failures.",
        icon: FileX,
        iconColor: "#FFB84D",
        enabled: false,
        types: [
            {
                id: "asset-wrong-mime-js",
                title: "Serve JS as text/plain",
                description: "Serve JS files as text/plain (MIME-type block in strict browsers)",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "mime", label: "MIME override", type: "text", defaultValue: "text/plain" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "asset-wrong-mime-css",
                title: "Serve CSS as text/plain",
                description: "Serve CSS files as text/plain (MIME-type block in strict browsers)",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "mime", label: "MIME override", type: "text", defaultValue: "text/plain" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
        ]
    },
    {
        id: "cors-csp",
        title: "CORS / CSP / Browser Security",
        description: "Break or modify headers to test browser behavior.",
        icon: ShieldAlert,
        iconColor: "#FF4D4D",
        enabled: false,
        types: [
            {
                id: "cors-remove-all-api",
                title: "Remove All CORS Headers",
                description: "Strip ALL CORS headers from /api/ (browser blocks XHR)",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    {
                        id: "global_warning",
                        label: "Warning",
                        type: "info",
                        condition: { field: "target_type", value: "global" },
                        defaultValue: "Warning: This will strip CORS headers from every single request hitting the server."
                    },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "wrong-origin",
                title: "Wrong CORS Origin",
                description: "Spoof origin",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "origin", label: "Origin value", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "wildcard-cors",
                title: "Wildcard CORS + credentials",
                description: "Test wildcard CORS with credentials",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "csp-injection",
                title: "CSP Injection",
                description: "Inject restrictive Content Security Policy (CSP) headers",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    {
                        id: "policy_preset",
                        label: "CSP Policy Preset",
                        type: "select",
                        defaultValue: "everything",
                        options: [
                            { label: "Block Everything (White Screen)", value: "everything" },
                            { label: "Block External APIs (Offline Mode)", value: "apis" },
                            { label: "Block All Images", value: "images" },
                            { label: "Block Custom Fonts", value: "fonts" },
                            { label: "Custom Policy", value: "custom" },
                        ]
                    },
                    {
                        id: "custom_policy",
                        label: "Custom Policy String",
                        type: "textarea",
                        condition: { field: "policy_preset", value: "custom" },
                        placeholder: "default-src 'self'; ..."
                    },
                    {
                        id: "global_warning",
                        label: "Warning",
                        type: "info",
                        condition: { field: "target_type", value: "global" },
                        defaultValue: "Warning: This will inject CSP headers into every single response."
                    },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "options-hang",
                title: "OPTIONS Preflight Hang",
                description: "Hang OPTIONS requests",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
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
        enabled: false,
        types: [
            {
                id: "corrupt-json",
                title: "Corrupt JSON",
                description: "Inject garbage or null values",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "strategy", label: "Strategy", type: "select", options: [{ label: "Inject Garbage", value: "garbage" }, { label: "Null Values", value: "nulls" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "wrong-types",
                title: "Wrong Types",
                description: "Convert numbers/booleans to strings",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "remove-fields",
                title: "Remove Fields",
                description: "Remove specific fields from JSON responses",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "fields", label: "List of fields to remove", type: "dynamic_list", placeholder: "e.g. access_token" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "replace-value",
                title: "Replace Field Value",
                description: "Override specific field values",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
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
                    ...TARGET_FIELDS_BLOCK,
                    { id: "payload", label: "Custom payload string", type: "textarea" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "empty-response",
                title: "Empty Response",
                description: "Return empty body",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "wrong-structure",
                title: "Wrong JSON Structure",
                description: "e.g., array instead of object",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "payload", label: "Custom payload", type: "textarea" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            }
        ]
    },
    {
        id: "client-chaos",
        title: "JS Injection / Client Chaos",
        description: "Inject errors or CPU/GPU load in browser.",
        icon: Zap,
        iconColor: "#FFC857",
        enabled: false,
        types: [
            {
                id: "js-runtime-error",
                title: "Throw JS Error",
                description: "Inject script that throws error",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "script", label: "Script snippet", type: "textarea", placeholder: "<script>throw new Error('Chaos!');</script>" },
                    { id: "target", label: "Target insertion point", type: "select", options: [{ label: "</body>", value: "body_end" }, { label: "<head>", value: "head" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "fetch-override",
                title: "Override window.fetch",
                description: "Corrupt fetch responses",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "body", label: "Corrupt body", type: "textarea" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "main-thread-freeze",
                title: "Long Task Injection",
                description: "Freeze the main thread",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "duration_ms", label: "Duration", type: "number", unit: "ms" },
                    { id: "delay_ms", label: "Delay", type: "number", unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "console-flood",
                title: "Console Spam",
                description: "Flood the console with errors",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "count", label: "Count (# errors)", type: "number" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "raf-loop",
                title: "requestAnimationFrame Loop",
                description: "Create infinite loop",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
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
        enabled: false,
        types: [
            {
                id: "redirect-loop",
                title: "Redirect Loop",
                description: "Redirect to self (302 → self with _cl param)",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    {
                        id: "global_warning",
                        label: "Warning",
                        type: "info",
                        condition: { field: "target_type", value: "global" },
                        defaultValue: "Warning: This will create a redirect loop for every single request."
                    },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "wrong-redirect",
                title: "Wrong Redirect",
                description: "Redirect to wrong location",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "target_uri", label: "Redirect Target URI", type: "text" },
                    { id: "status", label: "Status code", type: "select", options: [{ label: "301", value: "301" }, { label: "302", value: "302" }] },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            }
        ]
    },
    {
        id: "ttfb",
        title: "TTFB / Time to First Byte",
        description: "Simulate server-side processing delays.",
        icon: Activity,
        iconColor: "#FF6B6B",
        enabled: false,
        types: [
            {
                id: "ttfb-fixed",
                title: "Fixed TTFB Delay",
                description: "Add fixed delay before first byte",
                fields: [
                    {
                        id: "location_tag",
                        label: "Target Layer",
                        type: "select",
                        defaultValue: "api",
                        options: [
                            { label: "API (gateway)", value: "api" },
                            { label: "Frontend", value: "frontend" },
                            { label: "All (Global)", value: "global" },
                        ]
                    },
                    { id: "delay_ms", label: "Delay", type: "number", defaultValue: 3000, unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "ttfb-random",
                title: "Random TTFB",
                description: "Uniform random delay",
                fields: [
                    {
                        id: "location_tag",
                        label: "Target Layer",
                        type: "select",
                        defaultValue: "api",
                        options: [
                            { label: "API (gateway)", value: "api" },
                            { label: "Frontend", value: "frontend" },
                            { label: "All (Global)", value: "global" },
                        ]
                    },
                    { id: "min_ms", label: "Min delay", type: "number", defaultValue: 500, unit: "ms" },
                    { id: "max_ms", label: "Max delay", type: "number", defaultValue: 5000, unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "ttfb-spike",
                title: "TTFB Spike",
                description: "Occasional spikes",
                fields: [
                    {
                        id: "location_tag",
                        label: "Target Layer",
                        type: "select",
                        defaultValue: "api",
                        options: [
                            { label: "API (gateway)", value: "api" },
                            { label: "Frontend", value: "frontend" },
                            { label: "All (Global)", value: "global" },
                        ]
                    },
                    { id: "normal_ms", label: "Normal delay", type: "number", defaultValue: 200, unit: "ms" },
                    { id: "spike_ms", label: "Spike delay", type: "number", defaultValue: 10000, unit: "ms" },
                    { id: "spike_probability", label: "Spike probability", type: "slider", min: 0, max: 100, defaultValue: 10, unit: "%" },
                ]
            }
        ]
    },
    {
        id: "layout-shift",
        title: "Layout Shift / Web Vitals",
        description: "Simulate CLS issues and rendering shifts.",
        icon: Layers,
        iconColor: "#A06BFF",
        enabled: false,
        types: [
            {
                id: "inject-cls",
                title: "Inject Cumulative Layout Shift",
                description: "Force layout shifts during page load",
                fields: [
                    ...TARGET_FIELDS_BLOCK,
                    { id: "mode", label: "Shift Mode", type: "select", options: [{ label: "Banner", value: "banner" }, { label: "Sidebar", value: "sidebar" }, { label: "Random", value: "random" }] },
                    { id: "height_px", label: "Target Height", type: "number", defaultValue: 1200, unit: "px" },
                    { id: "delay_ms", label: "Initial Delay", type: "number", defaultValue: 1000, unit: "ms" },
                    { id: "animation_ms", label: "Shift Duration", type: "number", defaultValue: 10, unit: "ms" },
                    { id: "max_shifts", label: "Max Shifts", type: "number", defaultValue: 1 },
                    { id: "text", label: "Shift Text (optional)", type: "text" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            }
        ]
    },
    {
        id: "inp-degradation",
        title: "INP Degradation",
        description: "Simulate slow Interaction to Next Paint — degrade UI responsiveness on clicks, keys, and taps.",
        icon: MousePointerClick,
        iconColor: "#FF8C42",
        enabled: false,
        types: [
            {
                id: "inp-fixed",
                title: "Fixed Interaction Delay",
                description: "Add a fixed delay to all user interactions (click, keydown, pointerup)",
                fields: [
                    {
                        id: "file_type",
                        label: "Target",
                        type: "info",
                        defaultValue: "Targets all HTML pages (file_type: .html) — JS is injected into the response body."
                    },
                    { id: "file_type_value", label: "File Type", type: "text", defaultValue: ".html" },
                    {
                        id: "mode",
                        label: "Interaction Mode",
                        type: "select",
                        defaultValue: "interaction",
                        options: [
                            { label: "All Interactions", value: "interaction" },
                            { label: "Click Only", value: "click" },
                            { label: "Keyboard Only", value: "keyboard" },
                            { label: "Pointer Only", value: "pointer" },
                        ]
                    },
                    { id: "delay_ms", label: "Delay per Interaction", type: "number", defaultValue: 400, unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "inp-random",
                title: "Random Interaction Delay",
                description: "Add uniform random delay to interactions — simulates jittery UI",
                fields: [
                    {
                        id: "file_type",
                        label: "Target",
                        type: "info",
                        defaultValue: "Targets all HTML pages (file_type: .html) — JS is injected into the response body."
                    },
                    { id: "file_type_value", label: "File Type", type: "text", defaultValue: ".html" },
                    {
                        id: "mode",
                        label: "Interaction Mode",
                        type: "select",
                        defaultValue: "interaction",
                        options: [
                            { label: "All Interactions", value: "interaction" },
                            { label: "Click Only", value: "click" },
                            { label: "Keyboard Only", value: "keyboard" },
                            { label: "Pointer Only", value: "pointer" },
                        ]
                    },
                    { id: "min_delay_ms", label: "Min Delay", type: "number", defaultValue: 100, unit: "ms" },
                    { id: "max_delay_ms", label: "Max Delay", type: "number", defaultValue: 800, unit: "ms" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "inp-burst",
                title: "Input Jank Burst",
                description: "Periodically fire a main-thread blocking burst triggered by interaction events",
                fields: [
                    {
                        id: "file_type",
                        label: "Target",
                        type: "info",
                        defaultValue: "Targets all HTML pages (file_type: .html) — JS is injected into the response body."
                    },
                    { id: "file_type_value", label: "File Type", type: "text", defaultValue: ".html" },
                    {
                        id: "mode",
                        label: "Interaction Mode",
                        type: "select",
                        defaultValue: "interaction",
                        options: [
                            { label: "All Interactions", value: "interaction" },
                            { label: "Click Only", value: "click" },
                            { label: "Keyboard Only", value: "keyboard" },
                            { label: "Pointer Only", value: "pointer" },
                        ]
                    },
                    { id: "burst_ms", label: "Burst Duration", type: "number", defaultValue: 600, unit: "ms" },
                    { id: "burst_every_n", label: "Burst every N interactions", type: "number", defaultValue: 3 },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            }
        ]
    }
];
