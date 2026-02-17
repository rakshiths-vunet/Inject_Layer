
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
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
                    },
                    {
                        id: "methods",
                        label: "HTTP Methods",
                        type: "multiselect",
                        condition: { field: "target_type", value: "api" },
                        defaultValue: ["GET", "POST", "PUT", "DELETE"],
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ]
                    },
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
        enabled: false,
        types: [
            {
                id: "tcp-reset",
                title: "TCP Reset",
                description: "Simulate TCP RST",
                fields: [
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "assets",
                        options: [
                            { label: "Specific Assets", value: "assets" },
                            { label: "API Endpoints", value: "api" },
                            { label: "Global (All Requests)", value: "global" },
                        ]
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
                        placeholder: "gateway/auth/login",
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
                    },
                    {
                        id: "methods",
                        label: "HTTP Methods",
                        type: "multiselect",
                        condition: { field: "target_type", value: "api" },
                        defaultValue: ["GET", "POST", "PUT", "DELETE"],
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ]
                    },
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
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "assets",
                        options: [
                            { label: "Specific Assets", value: "assets" },
                            { label: "API Endpoints", value: "api" },
                            { label: "Global (All Requests)", value: "global" },
                        ]
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
                        placeholder: "gateway/auth/login",
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
                    },
                    {
                        id: "methods",
                        label: "HTTP Methods",
                        type: "multiselect",
                        condition: { field: "target_type", value: "api" },
                        defaultValue: ["GET", "POST", "PUT", "DELETE"],
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ]
                    },
                    { id: "duration", label: "Duration", type: "number", unit: "s", defaultValue: 30 },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "upstream-fail",
                title: "Upstream Fail (502/503)",
                description: "Simulate upstream failure",
                fields: [
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "assets",
                        options: [
                            { label: "Specific Assets", value: "assets" },
                            { label: "API Endpoints", value: "api" },
                            { label: "Global (All Requests)", value: "global" },
                        ]
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
                        placeholder: "gateway/auth/login",
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
                    },
                    {
                        id: "methods",
                        label: "HTTP Methods",
                        type: "multiselect",
                        condition: { field: "target_type", value: "api" },
                        defaultValue: ["GET", "POST", "PUT", "DELETE"],
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ]
                    },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ],
            },
            {
                id: "chunked-truncation",
                title: "Chunked Truncation",
                description: "Truncate response body",
                fields: [
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "assets",
                        options: [
                            { label: "Specific Assets", value: "assets" },
                            { label: "API Endpoints", value: "api" },
                            { label: "Global (All Requests)", value: "global" },
                        ]
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
                        placeholder: "gateway/auth/login",
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
                    },
                    {
                        id: "methods",
                        label: "HTTP Methods",
                        type: "multiselect",
                        condition: { field: "target_type", value: "api" },
                        defaultValue: ["GET", "POST", "PUT", "DELETE"],
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ]
                    },
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
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "api",
                        options: [
                            { label: "API Endpoints", value: "api" },
                            { label: "Specific Assets", value: "assets" },
                            { label: "Global (All Requests)", value: "global" },
                        ]
                    },
                    {
                        id: "api_endpoints",
                        label: "API Endpoints",
                        type: "dynamic_list",
                        condition: { field: "target_type", value: "api" },
                        placeholder: "/api/dashboard",
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                            { label: "/api/dashboard", value: "/api/dashboard" },
                        ]
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
                        id: "methods",
                        label: "HTTP Methods",
                        type: "multiselect",
                        condition: { field: "target_type", value: "api" },
                        defaultValue: ["GET", "POST", "PUT", "DELETE"],
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ]
                    },
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
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "api",
                        options: [
                            { label: "API Endpoints", value: "api" },
                            { label: "Specific Assets", value: "assets" },
                            { label: "Global (All Requests)", value: "global" },
                        ]
                    },
                    {
                        id: "api_endpoints",
                        label: "API Endpoints",
                        type: "dynamic_list",
                        condition: { field: "target_type", value: "api" },
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
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
                        id: "methods",
                        label: "HTTP Methods",
                        type: "multiselect",
                        condition: { field: "target_type", value: "api" },
                        defaultValue: ["GET", "POST", "PUT", "DELETE"],
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ]
                    },
                    { id: "status_code", label: "Default Status code", type: "number", defaultValue: 500 },
                    { id: "body", label: "Response Body (JSON)", type: "textarea", placeholder: '{"error":"Random chaos error"}' },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 8, unit: "%" },
                ],
            },
            {
                id: "rate-limit-stateless",
                title: "Rate-Limit 429 (Stateless)",
                description: "Randomly return 429 based on probability",
                fields: [
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "api",
                        options: [
                            { label: "API Endpoints", value: "api" },
                            { label: "Specific Assets", value: "assets" },
                            { label: "Global (All Requests)", value: "global" },
                        ]
                    },
                    {
                        id: "api_endpoints",
                        label: "API Endpoints",
                        type: "dynamic_list",
                        condition: { field: "target_type", value: "api" },
                        placeholder: "/api/payment",
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
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
                    { id: "limit", label: "Limit (Visual placeholder)", type: "number", defaultValue: 10 },
                    { id: "retry_after", label: "Retry-After", type: "number", unit: "s", defaultValue: 60 },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "rate-limit-stateful",
                title: "Stateful Rate Limit",
                description: "Limit requests per IP over a time window",
                fields: [
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "api",
                        options: [
                            { label: "API Endpoints", value: "api" },
                            { label: "Specific Assets", value: "assets" },
                            { label: "Global (All Requests)", value: "global" },
                        ]
                    },
                    {
                        id: "api_endpoints",
                        label: "API Endpoints",
                        type: "dynamic_list",
                        condition: { field: "target_type", value: "api" },
                        placeholder: "/api/orders",
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
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
                    { id: "mime", label: "MIME override", type: "text", defaultValue: "text/plain" },
                    { id: "probability", label: "Probability", type: "slider", min: 0, max: 100, defaultValue: 100, unit: "%" },
                ]
            },
            {
                id: "asset-wrong-mime-css",
                title: "Serve CSS as text/plain",
                description: "Serve CSS files as text/plain (MIME-type block in strict browsers)",
                fields: [
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
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "api",
                        options: [
                            { label: "API Endpoints", value: "api" },
                            { label: "Specific Assets", value: "assets" },
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
                        placeholder: "gateway/auth/login",
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
                    },
                    {
                        id: "methods",
                        label: "HTTP Methods",
                        type: "multiselect",
                        condition: { field: "target_type", value: "api" },
                        defaultValue: ["GET", "POST", "PUT", "DELETE"],
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ]
                    },
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
                description: "Inject restrictive Content Security Policy (CSP) headers",
                fields: [
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "regex",
                        options: [
                            { label: "Custom Regex", value: "regex" },
                            { label: "By Extension (.html)", value: "extension" },
                            { label: "API Endpoints", value: "api" },
                            { label: "Specific Assets", value: "assets" },
                            { label: "Global (All Requests)", value: "global" },
                        ]
                    },
                    {
                        id: "custom_regex",
                        label: "Custom URI Regex",
                        type: "text",
                        condition: { field: "target_type", value: "regex" },
                        defaultValue: "index.html$",
                        placeholder: "index\\.html$"
                    },
                    {
                        id: "extension",
                        label: "File Extension",
                        type: "text",
                        condition: { field: "target_type", value: "extension" },
                        defaultValue: ".html"
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
                        placeholder: "gateway/auth/login",
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
                    },
                    {
                        id: "methods",
                        label: "HTTP Methods",
                        type: "multiselect",
                        condition: { field: "target_type", value: "api" },
                        defaultValue: ["GET", "POST", "PUT", "DELETE"],
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ]
                    },
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
        enabled: false,
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
        enabled: false,
        types: [
            {
                id: "redirect-loop",
                title: "Redirect Loop",
                description: "Redirect to self (302 → self with _cl param)",
                fields: [
                    {
                        id: "target_type",
                        label: "Target Type",
                        type: "select",
                        defaultValue: "regex",
                        options: [
                            { label: "Custom Regex", value: "regex" },
                            { label: "API Endpoints", value: "api" },
                            { label: "Specific Assets", value: "assets" },
                            { label: "Global (All Requests)", value: "global" },
                        ]
                    },
                    {
                        id: "custom_regex",
                        label: "Custom URI Regex",
                        type: "text",
                        condition: { field: "target_type", value: "regex" },
                        defaultValue: "^/checkout",
                        placeholder: "^/checkout"
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
                        placeholder: "gateway/auth/login",
                        options: [
                            { label: "gateway/auth/login", value: "gateway/auth/login" },
                            { label: "gateway/auth/verify-otp", value: "gateway/auth/verify-otp" },
                            { label: "gateway/auth/resend-otp", value: "gateway/auth/resend-otp" },
                            { label: "gateway/account", value: "gateway/account" },
                            { label: "gateway/payment/initiate", value: "gateway/payment/initiate" },
                            { label: "gateway/auth/verify-payment", value: "gateway/auth/verify-payment" },
                            { label: "/transactions", value: "/transactions" },
                        ]
                    },
                    {
                        id: "methods",
                        label: "HTTP Methods",
                        type: "multiselect",
                        condition: { field: "target_type", value: "api" },
                        defaultValue: ["GET", "POST", "PUT", "DELETE"],
                        options: [
                            { label: "GET", value: "GET" },
                            { label: "POST", value: "POST" },
                            { label: "PUT", value: "PUT" },
                            { label: "DELETE", value: "DELETE" },
                        ]
                    },
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
        enabled: false,
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
        enabled: false,
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
        enabled: false,
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
        enabled: false,
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
        enabled: false,
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
        enabled: false,
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
        enabled: false,
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
