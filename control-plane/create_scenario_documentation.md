# Create Scenario Window Documentation

The Create Scenario window is the core interface for defining complex chaos engineering test plans within the control-plane application. This document outlines every component, option, configuration, and data-fetching mechanism in intricate detail.

---

## 1. High-Level Architecture & Components

The Create Scenario interface is built using a series of specialized React components:
- **`CreateScenarioModal`**: The main orchestrator container. It handles the outer modal, overall state (scenario name, description, selected sites, injections list), API communication for fetching apps, and saving the final scenario.
- **`InjectionLibrarySidebar`**: The palette on the left side where users search for and select specific chaos injections to add to their scenario.
- **`ScenarioBuilderMain`**: The central canvas area that enables drag-and-drop reordering of selected injections.
- **`SortableInjectionCard`**: A single instance of an injection added to the builder. It provides drag handles, duplication, removal, and enable/disable toggles.
- **`ScenarioFormControls`**: The dynamic configuration body within each `SortableInjectionCard`. It renders inputs based on the `fields` defined for that specific injection type.
- **`ScenarioSummary`**: A sticky summary panel in the sidebar that lists active injections and detects potential conflicts (e.g., overlapping API targets).
- **`ui/` Components**: Shared UI elements such as `Input`, `MultiSelect`, `DynamicList`, `Switch`, `Slider`, etc.

### Form State Management
The state of the entire scenario is managed in `CreateScenarioModal`.
- **`scenarioName`**: string (Name of the scenario).
- **`description`**: string (Description of the scenario).
- **`selectedSites`**: string[] (List of global apps/sites this scenario applies to).
- **`availableSites`**: Object arrays (List of apps retrieved from the backend).
- **`injections`**: Array of `ScenarioInjection` objects (The actual rules added to the scenario).

When saved, this data is passed to `onSave` or `onSaveDraft` as a monolithic JavaScript object.

---

## 2. Header & Global Configuration

The static header of the modal defines the overarching metadata for the entire scenario.

### Scenario Name
- **UI Element**: `Input` (Text field)
- **State**: `scenarioName`
- **Validation**: Cannot save unless the scenario name is provided and at least one injection is configured.

### Description
- **UI Element**: `Input` (Text field)
- **State**: `description`
- **Purpose**: A human-readable summary of the test.

### Source App / Location Tag (Global Site Scope)
- **UI Element**: Checkbox toggle pills.
- **State**: `selectedSites`
- **How values are fetched**:
  - When the modal opens (`useEffect` in `CreateScenarioModal`), an API call is made to `GET /api/chaos/apps`.
  - The API route proxies the request to the chaos backend: `http://10.1.92.251:8080/__chaos/apps`.
  - The returned array of strings (e.g., `["react-v1", "angular-v2"]`) is mapped into human-readable labels and values.
  - A default synthetic site `"Global (All)"` (value `'global'`) is prepended to the top of the list.
- **Behavior**: These act as the master filter. Injections added to the scenario will target these apps by default unless the injection specifically restricts its scope.

---

## 3. Left Sidebar: Injection Library & Summary

### Injection Library (`InjectionLibrarySidebar`)
- **UI Element**: Accordion-style list grouped by chaos category, with a live-search input at the top.
- **Data Source**: Driven entirely by the `INJECTION_CATEGORIES` static array defined in `brum/injectionCategories.ts`.
- **Search**: The search bar filters categories by checking the input against `type.title` and `type.description`.
- **Action**: Hovering over an injection type reveals an "Add" button. Clicking this triggers `handleAddInjection` in the main modal.
  - **Instancing**: When added, an `instanceId` (e.g., `<type-id>-<Date.now()>`) is generated. Default values from the fields are extracted and populated into the injection's `config` state.

### Scenario Summary (`ScenarioSummary`)
- **Location**: Sticky at the bottom of the left sidebar.
- **Features**:
  - Lists all currently added injections with their execution probability.
  - Detects Conflicts: Uses a `useMemo` block to aggregate target endpoints across all active rules. If it detects two rules targeting the exact same generic API endpoint, or overlapping global scopes, it displays a red conflict alert.

---

## 4. Main Canvas: Drag & Drop Builder

The central area uses `@dnd-kit` to allow users to vertically sort their injections.

### `SortableInjectionCard`
Every injection added from the sidebar becomes a card.
- **Header Tools**:
  - **Drag Handle**: Reorder the sequence of execution (top-to-bottom).
  - **Enable/Disable Switch**: Toggles the `enabled` flag in the configuration payload without removing the rule.
  - **Duplicate (Dup)**: Deep copies the rule configuration and inserts it immediately below the current one with a new `instanceId`.
  - **Remove**: Deletes the rule from the canvas.
- **Border Coloring**: Inherits its visual accent color from the parent category definition.

---

## 5. Dynamic Form Controls (`ScenarioFormControls`)

This is the most complex data-rendering component. It takes an injection's `fields` definition and maps it into interactive HTML inputs.

### Layout & Rendering
The form is split into three semantic sections:
1. **Target**: Fields logically responsible for targeting (e.g., target type, regex, assets).
2. **Parameters**: Configuration fields specific to the chaos logic (e.g., delay, status code).
3. **Site Scope**: The per-injection scoping logic.

### Conditional Fields (`isFieldVisible`)
Fields in `injectionCategories.ts` can define a `condition`.
Example:
```json
{
  "id": "custom_regex",
  "condition": { "field": "target_type", "value": "regex" }
}
```
The `custom_regex` input will strictly only render if the current value of the `target_type` field equals `"regex"`.

### Data Fetching for "Assets"
When an injection's `target_type` changes to `assets`, the system heavily relies on dynamic data fetching:
- **`useEffect` Asset Fetching**: Whenever the global app scope (`globalSites`) or the injection's restricted scope (`restricted_sites`) changes, `ScenarioFormControls` triggers a fetch.
- **Logic**:
  1. Determines the apps to query based on selection. If nothing is selected globally/locally, it falls back to querying ALL apps fetched initially via `/api/chaos/apps`.
  2. Iterates over the selected apps and makes parallel requests to: `GET /api/chaos/assets?app=<app_name>`
  3. The proxy forwards this to `http://10.1.92.251:8080/__chaos/assets`.
  4. Returns deduplicated assets (files like `.js`, `.png`, `.css`).
  5. The UI automatically maps these to specific tags and colors in the `MultiSelect` component (e.g., JS = Yellow, Images = Violet).

### Input Field Types & Behaviors
- **`info`**: Renders a read-only visual banner (red `AlertTriangle` or generic `Info` block). Commonly used for "Global Warnings" when users select a highly destructive "Global" target type.
- **`select`**: Standard dropdown using Shadcn UI. If there are 4 or fewer options, it dynamically optimizes into a segmented toggle button group instead of a dropdown.
- **`multiselect`**: Uses a custom `MultiSelect` popover with badges.
  - *Special Case*: If the field ID is `methods` (HTTP Methods), it renders as a wrap of interactive Pill buttons (GET, POST, PUT, DELETE) instead of a dropdown.
- **`dynamic_list`**: An advanced component allowing users to either select from predefined list items or add custom ones (combobox+input style). Used heavily for API Endpoints.
- **`slider`**: Visual percentage bar. Commonly used for setting the `probability` of a rule executing (0-100%).
- **`number` / `text`**: Standard HTML `<input>` tags. Numbers automatically parse to integers.
- **`textarea`**: Used for JSON payloads or custom scripts.
  - *Special Case*: If the field ID is `script` or `body`, the textarea gets a special Hacker-style UI theme (Monaco-lite aesthetic with green text and a warning banner).
- **`checkbox`**: Standard true/false boolean toggle.

### Custom Visualizations
Based on the `id` of an injection, the UI injects hardcoded data visualizations above the parameters block to help users understand the impact:
- **`uniform-random`**: Draws a progressive yellow bar showing the min/max delay span across a 0-5000ms axis.
- **`normal-distribution`**: Uses an SVG element to draw a literal bell curve based on the Mean and Standard Deviation inputs.
- **`step-bimodal`**: Renders an array of vertical bars simulating a traffic histogram, coloring random bars red to indicate localized latency spikes based on the `probability` setting.

---

## 6. Site Scope (Per-Injection Scoping)

At the bottom of every rule, it allows the user to override the **Global** scenario sites definition.
- **"Apply to all sites in scenario"**: By default, the injection's `restricted_sites` is undefined. It implicitly targets whatever is ticked at the top of the modal.
- **"Restrict to specific sites"**: Toggling this sets `restricted_sites` to `[]`. A Multi-select dropdown appears.
  - The dropdown populates with the apps explicitly selected in the *Global* scope. If none are selected globally, it assumes all apps.
  - The proxy rule is that injections only apply to the **intersection** of the scenario global sites and these restricted sites. This allows users to build one large scenario across 4 apps, but have specific database latency rules ONLY apply to 1 of those apps.

---

## 7. Categorized Injectable Types Overview

All available rules are defined in `INJECTION_CATEGORIES`. Below is a top-to-bottom breakdown of the chaos rules and what they configure:

1. **Latency** (`latency`)
   - **Fixed Delay**: Delay, max cap, probability, target filters.
   - **Uniform Random**: Min/max delay windows.
   - **Normal Distribution**: Mean, std deviation latency.
   - **Exponential / Step-Bimodal**: Long-tail or spike-probability latency.
   - **Slow Body**: Delaying chunked transfer of files directly.

2. **Network / TCP-Level** (`network-tcp`)
   - **TCP Reset**: Kill active connections via standard TCP RST.
   - **Connection Hang**: Keep TCP sockets open without returning data.
   - **Upstream Fail**: Hard 502/503 cutoffs.
   - **Chunked Truncation**: Dropping body streams mid-transfer at X bytes.

3. **HTTP Status Errors** (`http-status`)
   - **Static Status Code**: Force a 500, 404, etc. + JSON body injection.
   - **Random Status**: Flaps between different 5xx/4xx errors randomly.
   - **Rate Limiting**: Emulates standard API 429 errors (both stateless probability-based and Stateful window-based limits).

4. **Authentication / Session Failures** (`auth-session`)
   - **401/403 Injections**: Simulating token expiration or lack of perm.
   - **Corrupt Request Cookies**: Intercepting and breaking auth tokens *before* they reach the target API.
   - **Broken Session**: Malforming `Set-Cookie` headers going to the client.

5. **Strict MIME Enforcement Failures** (`frontend-asset`)
   - **Serve JS/CSS as text/plain**: Explores browser-enforced MIME blocking.

6. **CORS / CSP / Browser Security** (`cors-csp`)
   - **Remove All CORS Headers**: Hard blocks XHR/fetch across origins.
   - **CSP Injection**: Injects restrictive Content-Security-Policies (e.g., blocking all external fonts, images, or custom string injections).
   - **OPTIONS Preflight Hang**: Drops/hangs OPTIONS checks.

7. **JSON / API Response Corruption** (`json-corruption`)
   - **Corrupt JSON**: Inject garbage into valid JSON responses.
   - **Wrong Types**: Change numbers to strings, booleans to ints.
   - **Remove/Replace Value**: Delete specific object keys or replace them globally.
   - **Wrong JSON Structure**: Force-cast JSON objects to Arrays to break `map()` loops on frontends.

8. **Routing / Redirects** (`routing`)
   - **Redirect Loops**: Intercept requests and force continuous 302 jumps.
   - **Wrong Redirect**: Blackhole traffic to different URIs.

9. **Encoding / Transfer Tricks** (`encoding`)
   - **Wrong Encoding**: Lie to the client about gzip vs brotli.
   - **Bad Content-Length**: Offset header byte-counts to break client downloads.

10. **Mixed Content / TLS** (`mixed-content`)
    - **Remove HSTS**: Strips TLS downgrade protections.

11. **Context Layout Shift** (`layout-shift`)
    - **Inject CLS**: Inserts absolute-positioned DOM nodes directly into pages causing severe jank. Features config for banner height, animation ms, color, z-index, and stickiness.

12. **JS Injection / Client Chaos** (`client-chaos`)
    - **JS Runtime Error**: Injects `<script>` blocks that deliberately `throw new Error()` to test RUM tools.
    - **Main-Thread Freeze**: Emulates `for` loops locking the client's CPU for X milliseconds.
    - **Fetch Override**: Wraps `window.fetch` to globally intercept and corrupt responses before application code handles it.
    - **Console Spam**: Overloads the Chrome/Firefox dev-tools logger.

---

## 8. Save & Activation Model

When the user clicks **"Save & Activate Scenario"** or **"Save as Draft"**:
- The component does not submit an API call directly.
- It triggers the `onSave` or `onSaveDraft` prop supplied by the parent `ScenarioBuilderMain.tsx`.
- The final payload constructed looks like:
```json
{
  "name": "Black Friday DB Failover",
  "description": "What are you testing?",
  "sites": ["react-v1", "global"],
  "injections": [
    {
       "id": "fixed-delay",
       "title": "Fixed Delay",
       "description": "Add fixed latency to requests",
       "instanceId": "fixed-delay-1708892301",
       "config": {
          "enabled": true,
          "target_type": "api",
          "api_endpoints": ["/api/checkout"],
          "delay": 500,
          "probability": 80
       }
    }
  ]
}
```
- This structured JSON serves as the exact playbook sent to the backend to generate live configuration blocks for Envoy or NGINX chaos rules.
