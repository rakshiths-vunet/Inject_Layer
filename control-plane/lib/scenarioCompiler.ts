import { ScenarioInjection } from '../app/components/brum/CreateScenarioModal';

export interface SelectorBlock {
    location_tag?: string;
    source_app?: string | string[];
    uri_regex?: string;
    path_prefix?: string;
    method?: string | string[];
    file_type?: string;
}

export interface ActionBlock {
    phase: string;
    action: string;
    action_params: Record<string, any>;
}

export interface CompiledRule {
    id: string;
    name: string;
    enabled: boolean;
    group: string;
    phase: string;
    probability: number;
    selectors: SelectorBlock;
    action: string;
    action_params: Record<string, any>;
    continue_on_match: boolean;
    dry_run?: boolean;
}

// Generate the CLS injection script from UI config
function buildCLSScript(config: any): string {
    return `<script>
(function(){
  setTimeout(function(){
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:${config.height_px || 60}px;background:${config.color || '#ff4444'};z-index:${config.z_index || 9999};transition:all ${config.animation_ms || 300}ms';
    el.innerHTML = '${config.text || 'System Notice'}';
    document.body.prepend(el);
    ${config.sticky ? '' : `setTimeout(function(){ el.remove(); }, ${config.animation_ms || 300 + 2000});`}
  }, ${config.delay_ms || 0});
})();
</script>`;
}

// Map CSP preset names to policy strings
function getPresetPolicy(preset: string): string {
    const presets: Record<string, string> = {
        'block-everything': "default-src 'none'; script-src 'none'; style-src 'none'; img-src 'none'; connect-src 'none'",
        'block-external-apis': "connect-src 'self'",
        'block-images': "img-src 'none'",
        'block-fonts': "font-src 'none'",
    };
    return presets[preset] || "default-src 'none'";
}

export function buildSelectors(config: Record<string, any>, globalSites: string[], forcedLocationTag?: string): SelectorBlock {
    const selectors: SelectorBlock = {};

    // --- URI Regex Builder ---
    let effectiveUriRegex = "";
    if (config.target_type === 'api' && config.api_endpoints?.length) {
        effectiveUriRegex = config.api_endpoints.map((ep: string) => ep.replace(/\//g, '\\/')).join('|');
    } else if (config.target_type === 'regex' && config.custom_regex) {
        effectiveUriRegex = config.custom_regex;
    } else if (config.uri) {
        // Handle auth rules that use 'uri' field directly
        effectiveUriRegex = config.uri.replace(/\//g, '\\/');
    } else if (config.target_type === 'assets' && config.assets_selected?.length) {
        effectiveUriRegex = config.assets_selected
            .map((asset: string) => asset.replace(/\./g, '\\.') + '$')
            .join('|');
    }

    if (effectiveUriRegex) {
        selectors.uri_regex = effectiveUriRegex;
    }

    // --- File Type (e.g. for INP injection which targets .html pages) ---
    // field id is 'file_type_value' in the UI definition; fall back to 'file_type' for direct usage
    const fileType = config.file_type_value || config.file_type;
    if (fileType) {
        selectors.file_type = fileType;
    }

    // --- Decision: Is this an API-level injection? ---
    // We treat it as API if:
    // 1. Target type is explicitly 'api'
    // 2. The URI regex contains 'gateway' (the standard API prefix)
    // 3. Or it's one of the auth rules using config.uri that mentions gateway
    const isApiTarget = config.target_type === 'api' ||
        effectiveUriRegex.includes('gateway') ||
        (config.uri && config.uri.includes('gateway'));

    // --- Location Tag & Source App ---
    if (isApiTarget) {
        // API targets MUST go to gateway_api locator
        selectors.location_tag = 'gateway_api';

        // If a site was selected in the scenario, it becomes the source_app for the gateway
        if (forcedLocationTag && forcedLocationTag !== 'global') {
            selectors.source_app = forcedLocationTag; // e.g., 'angular-v1'
        }
    } else if (forcedLocationTag && forcedLocationTag !== 'global') {
        // Non-API targets (frontend assets, pages, etc.)
        // Map e.g. 'angular-v1' -> 'frontend_angular_v1'
        let tag = forcedLocationTag;
        if (!tag.startsWith('frontend_') && !tag.startsWith('gateway_')) {
            tag = `frontend_${tag.replace(/-/g, '_')}`;
        }
        selectors.location_tag = tag;
    }

    // --- HTTP Methods ---
    if (config.methods?.length === 1) {
        selectors.method = config.methods[0];
    } else if (config.methods?.length > 1) {
        selectors.method = config.methods;
    }

    return selectors;
}

export function buildActionBlock(injectionTypeId: string, config: Record<string, any>): ActionBlock {
    switch (injectionTypeId) {

        // ── LATENCY
        case 'fixed-delay':
            return {
                phase: 'access',
                action: 'latency',
                action_params: {
                    model: 'fixed',
                    delay_ms: config.delay,
                    ...(config.max_cap ? { max_cap_ms: config.max_cap } : {})
                }
            };
        case 'uniform-random':
            return {
                phase: 'access',
                action: 'latency',
                action_params: {
                    model: 'uniform',
                    min_ms: config.min_delay,
                    max_ms: config.max_delay,
                    ...(config.max_cap ? { max_cap_ms: config.max_cap } : {})
                }
            };
        case 'normal-distribution':
            return {
                phase: 'access',
                action: 'latency',
                action_params: {
                    model: 'normal',
                    mu: config.mean,
                    sigma: config.std_dev,
                    ...(config.max_cap ? { max_cap_ms: config.max_cap } : {})
                }
            };
        case 'exponential':
            return {
                phase: 'access',
                action: 'latency',
                action_params: {
                    model: 'exponential',
                    mean_ms: config.mean,
                    ...(config.max_cap ? { max_cap_ms: config.max_cap } : {})
                }
            };
        case 'step-bimodal':
            return {
                phase: 'access',
                action: 'latency',
                action_params: {
                    model: 'step',
                    normal_ms: config.normal_delay,
                    spike_ms: config.spike_delay,
                    spike_probability: config.spike_probability
                }
            };
        // ── TTFB (Time to First Byte)
        case 'ttfb-fixed':
            return {
                phase: 'access',
                action: 'ttfb',
                action_params: {
                    model: 'fixed',
                    delay_ms: config.delay_ms ?? 3000,
                }
            };
        case 'ttfb-random':
            return {
                phase: 'access',
                action: 'ttfb',
                action_params: {
                    model: 'uniform',
                    min_ms: config.min_ms ?? 500,
                    max_ms: config.max_ms ?? 5000,
                }
            };
        case 'ttfb-spike':
            return {
                phase: 'access',
                action: 'ttfb',
                action_params: {
                    model: 'step',
                    normal_ms: config.normal_ms ?? 200,
                    spike_ms: config.spike_ms ?? 10000,
                    spike_probability: config.spike_probability ?? 10,
                }
            };

        case 'slow-body':
            return {
                phase: 'body_filter',
                action: 'slow_body',
                action_params: {
                    delay_per_chunk_ms: config.delay_per_chunk
                }
            };

        // ── NETWORK / TCP
        case 'tcp-reset':
            return { phase: 'access', action: 'tcp_reset', action_params: {} };
        case 'connection-hang':
            return {
                phase: 'access',
                action: 'hang',
                action_params: { duration_s: config.duration }
            };
        case 'upstream-fail':
            return { phase: 'access', action: 'upstream_fail', action_params: {} };
        case 'chunked-truncation':
            return {
                phase: 'access',
                action: 'chunked_truncation',
                action_params: { at_bytes: config.at_bytes }
            };

        // ── HTTP STATUS
        case 'static-status':
        case 'static-status-code':
            return {
                phase: 'access',
                action: 'http_status',
                action_params: {
                    status: config.status_code || 500,
                    ...(config.body ? { body: config.body } : {}),
                    ...(config.content_type ? { content_type: config.content_type } : {}),
                    ...(config.retry_after ? { retry_after: config.retry_after } : {})
                }
            };
        case 'random-status':
            return {
                phase: 'access',
                action: 'http_status',
                action_params: {
                    status: config.status_code || 500,
                    body: JSON.stringify({ error: 'Random chaos error' })
                }
            };
        case 'rate-limit-429':
            return {
                phase: 'access',
                action: 'rate_limit_429',
                action_params: {
                    retry_after: config.retry_after,
                    limit: config.limit
                }
            };
        case 'stateful-rate-limit':
            return {
                phase: 'access',
                action: 'stateful_rate_limit',
                action_params: {
                    limit: config.limit,
                    window_s: config.window_s,
                    retry_after: config.retry_after
                }
            };

        // ── AUTH / SESSION
        case '401-unauthorized':
            return {
                phase: 'access',
                action: 'auth_401',
                action_params: { reasons: config.reasons || ['Token expired'] }
            };
        case '403-forbidden':
            return {
                phase: 'access',
                action: 'auth_403',
                action_params: { message: config.message || 'Forbidden' }
            };
        case 'intermittent-401':
            return {
                phase: 'access',
                action: 'intermittent_401',
                action_params: {
                    rate: config.rate || 30,
                    reasons: config.reasons || ["Token expired", "Revoked", "Invalid claims"]
                }
            };
        case 'corrupt-request-cookies':
            return { phase: 'access', action: 'broken_session', action_params: {} };
        case 'broken-session':
            return {
                phase: 'header_filter',
                action: 'broken_session',
                action_params: {
                    cookie_name: config.cookie_name || 'session',
                    cookie_val: config.cookie_val || 'CHAOS_INVALID_TOKEN',
                    ...(config.cookie_path ? { cookie_path: config.cookie_path } : { cookie_path: '/' })
                }
            };

        // ── MIME
        case 'asset-wrong-mime-js':
        case 'asset-wrong-mime-css':
            return {
                phase: 'header_filter',
                action: 'wrong_mime',
                action_params: { mime: config.mime || 'text/plain' }
            };

        // ── CORS / CSP
        case 'remove-all-cors':
            return { phase: 'header_filter', action: 'remove_cors', action_params: {} };
        case 'wrong-cors-origin':
            return {
                phase: 'header_filter',
                action: 'wrong_cors',
                action_params: { origin: config.origin }
            };
        case 'wildcard-cors-credentials':
            return { phase: 'header_filter', action: 'wildcard_cors', action_params: {} };
        case 'csp-injection':
            return {
                phase: 'header_filter',
                action: 'wrong_csp',
                action_params: { policy: config.custom_policy || getPresetPolicy(config.policy_preset) }
            };
        case 'options-preflight-hang':
            return {
                phase: 'header_filter',
                action: 'cors_preflight_hang',
                action_params: { duration_s: config.duration }
            };

        // ── JSON CORRUPTION
        case 'corrupt-json':
            return {
                phase: 'body_filter',
                action: 'corrupt_json',
                action_params: { strategy: config.strategy || 'inject_garbage' }
            };
        case 'wrong-types':
            return { phase: 'body_filter', action: 'wrong_types', action_params: {} };
        case 'remove-fields':
            return {
                phase: 'body_filter',
                action: 'remove_json_fields',
                action_params: { fields: config.fields || [] }
            };
        case 'replace-field-value':
            return {
                phase: 'body_filter',
                action: 'replace_json_value',
                action_params: { field: config.field, value: config.value }
            };
        case 'invalid-json':
            return {
                phase: 'body_filter',
                action: 'invalid_json',
                action_params: { payload: config.payload }
            };
        case 'empty-response':
            return {
                phase: 'body_filter',
                action: 'empty_response',
                action_params: { body: '' }
            };
        case 'wrong-json-structure':
            return {
                phase: 'body_filter',
                action: 'wrong_json_structure',
                action_params: { payload: config.payload || '[]' }
            };

        // ── ROUTING
        case 'redirect-loop':
            return { phase: 'access', action: 'redirect_loop', action_params: {} };
        case 'wrong-redirect':
            return {
                phase: 'access',
                action: 'wrong_redirect',
                action_params: { target: config.target, code: config.status || 302 }
            };

        // ── LAYOUT SHIFT (CLS)
        case 'inject-cls':
        case 'layout-shift':
            return {
                phase: 'body_filter',
                action: 'inject_cls',
                action_params: {
                    mode: config.mode || 'banner',
                    delay_ms: config.delay_ms || 800,
                    height_px: config.height_px || 100,
                    animation_ms: config.animation_ms || 400,
                    ...(config.color ? { color: config.color } : {}),
                    ...(config.text ? { text: config.text } : {}),
                    ...(config.z_index ? { z_index: config.z_index } : {}),
                    ...(config.sticky ? { sticky: config.sticky } : {}),
                    ...(config.max_shifts ? { max_shifts: config.max_shifts } : {})
                }
            };

        // ── JS / CLIENT CHAOS
        case 'js-runtime-error':
            return {
                phase: 'body_filter',
                action: 'inject_js_error',
                action_params: {
                    script: config.script || `<script>throw new Error('[CHAOS] Injected error');</script>`,
                    target: '</body>'
                }
            };
        case 'main-thread-freeze':
            return {
                phase: 'body_filter',
                action: 'inject_long_task',
                action_params: {
                    duration_ms: config.duration_ms,
                    delay_ms: config.delay_ms || 0
                }
            };
        case 'fetch-override':
            return {
                phase: 'body_filter',
                action: 'inject_fetch_override',
                action_params: {
                    corrupt_body: config.corrupt_body || '{"error":"chaos","data":null}'
                }
            };
        case 'console-flood':
            return {
                phase: 'body_filter',
                action: 'inject_console_spam',
                action_params: { count: config.count || 500 }
            };

        // ── INP (Interaction to Next Paint)
        // selectors.file_type = ".html" is set via buildSelectors from config.file_type
        case 'inp-fixed':
            return {
                phase: 'body_filter',
                action: 'inject_inp',
                action_params: {
                    mode: config.mode || 'interaction',
                    delay_ms: config.delay_ms ?? 400,
                }
            };
        case 'inp-random':
            return {
                phase: 'body_filter',
                action: 'inject_inp',
                action_params: {
                    mode: config.mode || 'interaction',
                    min_delay_ms: config.min_delay_ms ?? 100,
                    max_delay_ms: config.max_delay_ms ?? 800,
                }
            };
        case 'inp-burst':
            return {
                phase: 'body_filter',
                action: 'inject_inp',
                action_params: {
                    mode: config.mode || 'interaction',
                    burst_ms: config.burst_ms ?? 600,
                    burst_every_n: config.burst_every_n ?? 3,
                }
            };

        default:
            console.warn(`Unknown injection type: ${injectionTypeId}, falling back to minimal default`);
            return { phase: 'access', action: 'unknown', action_params: {} };
    }
}

export function compileScenario(
    scenarioId: string,
    injections: ScenarioInjection[],
    globalSites: string[]
): CompiledRule[] {

    // Step 1: Only compile ENABLED injections
    const activeInjections = injections.filter(inj => inj.config.enabled !== false);

    // Step 2: Compile each injection to a rule or multiple rules if multiple sites
    const compiledRules: CompiledRule[] = activeInjections.flatMap((inj, index) => {
        const actionBlock = buildActionBlock(inj.id, inj.config);

        const sites = inj.config.restricted_sites?.length
            ? inj.config.restricted_sites
            : globalSites;

        const realSites = sites.filter((s: string) => s !== 'global');

        const generateRule = (locTag?: string, siteSuffix?: string): CompiledRule => {
            const selectors = buildSelectors(inj.config, globalSites, locTag);

            return {
                id: `${inj.instanceId}${siteSuffix ? '-' + siteSuffix : ''}`,
                name: (inj.config.custom_name && inj.config.custom_name.trim() !== '') ? inj.config.custom_name.trim() : inj.title,
                enabled: true,
                group: `scenario-${scenarioId}`,
                phase: actionBlock.phase,
                probability: inj.config.probability ?? 100,
                selectors,
                action: actionBlock.action,
                action_params: actionBlock.action_params,
                continue_on_match: false,
                ...(inj.config.dry_run ? { dry_run: true } : {}),
            };
        };

        if (sites.includes('global') || realSites.length === 0) {
            return [generateRule(undefined)];
        } else {
            return realSites.map((site: string) => generateRule(site, site));
        }
    });

    // Step 3: Auto-assign continue_on_match for stacked rules
    const selectorKey = (rule: CompiledRule): string => {
        return rule.selectors.uri_regex
            || rule.selectors.path_prefix
            || rule.selectors.location_tag
            || '__global__';
    };

    const groups = new Map<string, number[]>();
    compiledRules.forEach((rule, i) => {
        const key = selectorKey(rule);
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(i);
    });

    groups.forEach((indices) => {
        if (indices.length > 1) {
            indices.slice(0, -1).forEach(i => {
                compiledRules[i].continue_on_match = true;
            });
        }
    });

    return compiledRules;
}
