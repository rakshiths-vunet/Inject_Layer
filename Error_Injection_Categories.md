# Error Injection Categories and Configuration Documentation

This document provides a comprehensive overview of all the error injection categories available on the website, detailing the specific types of errors within each category, and outlining the configurable parameters and target options for each.

---

## Target Types Overview

Many of the error types share a common set of target configuration fields (referred to as the "Target Fields Block"). These standard target options allow you to precisly scope where the chaos injection occurs:

*   **Specific Assets (`assets`)**: Target specific frontend files (e.g., `accountSelection.png`, `favicon.ico`, `transaction.png`).
*   **API Endpoints (`api`)**: Target specific backend APIs (e.g., `gateway/auth/login`, `gateway/payment/initiate`). This usually includes the ability to select specific **HTTP Methods** (GET, POST, PUT, DELETE).
*   **Custom Regex (`regex`)**: Use a Perl Compatible Regular Expression (PCRE) to match custom URIs.
*   **Global (`global`)**: Applies the injection to all incoming requests hitting the server. *Warning*: Use with caution as this affects the entire application.

---

## 1. Latency (`latency`)
Simulate delays at the API, frontend, or asset level.

*   **Fixed Delay**
    *   **Description:** Add a fixed latency to requests.
    *   **Targets:** Standard Target Fields Block (Assets, API, Regex, Global).
    *   **Configurables:** Delay (ms), Max cap (ms), Probability (%).
*   **Uniform Random**
    *   **Description:** Random delay within a specified range (e.g., 200–3000ms).
    *   **Targets:** Standard Target Fields Block.
    *   **Configurables:** Min delay (ms), Max delay (ms), Max cap (ms), Probability (%).
*   **Normal Distribution**
    *   **Description:** Latency following a normal distribution (e.g., μ=1200ms, σ=400ms).
    *   **Targets:** Standard Target Fields Block.
    *   **Configurables:** Mean (μ) (ms), Std Dev (σ) (ms), Max cap (ms), Probability (%).
*   **Exponential (long-tail)**
    *   **Description:** Simulates long-tail latency issues.
    *   **Targets:** Standard Target Fields Block.
    *   **Configurables:** Mean (ms), Max cap (ms), Probability (%).
*   **Step/Bimodal**
    *   **Description:** Normal base latency with a chance of a massive spike.
    *   **Targets:** Standard Target Fields Block.
    *   **Configurables:** Normal delay (ms), Spike delay (ms), Spike probability (%).
*   **Slow Body / Chunked Drip**
    *   **Description:** Drip-feed the response body to simulate slow downloads (e.g., images or JS).
    *   **Targets:** Configured via File type (e.g., .js, .png) or URI regex.
    *   **Configurables:** Delay per chunk (ms), Probability (%).
*   **Stacking Latency**
    *   **Description:** Cumulative delay from multiple matching rules.
    *   **Targets:** Apply across multiple selected rules.
    *   **Configurables:** Select multiple rules, Cumulative effect toggle.

## 2. Network / TCP-Level (`network-tcp`)
Simulate connection failures directly at the TCP layer.

*   **TCP Reset**
    *   **Description:** Simulate a connection reset (TCP RST).
    *   **Targets:** Assets, API Endpoints, Global.
    *   **Configurables:** Probability (%).
*   **Connection Hang**
    *   **Description:** Hold the connection open without responding.
    *   **Targets:** Assets, API Endpoints, Global.
    *   **Configurables:** Duration (s), Probability (%).
*   **Upstream Fail (502/503)**
    *   **Description:** Simulate a failed connection to an upstream service.
    *   **Targets:** Assets, API Endpoints, Global.
    *   **Configurables:** Probability (%).
*   **Chunked Truncation**
    *   **Description:** Cut off standard responses after a certain number of bytes.
    *   **Targets:** Assets, API Endpoints, Global.
    *   **Configurables:** Truncate at X bytes, Probability (%).

## 3. HTTP Status Errors (`http-status`)
Return specific or randomized HTTP status codes for API endpoints.

*   **Static Status Code**
    *   **Description:** Always return a specific status code (e.g., always 503).
    *   **Targets:** API Endpoints, Specific Assets, Global.
    *   **Configurables:** Status code, Response Body (JSON), Retry-After (s), Probability (%).
*   **Random Status (Mixed Chaos)**
    *   **Description:** Return random 5xx/4xx codes.
    *   **Targets:** API Endpoints, Specific Assets, Global.
    *   **Configurables:** Default Status code, Response Body (JSON), Probability (%).
*   **Rate-Limit 429 (Stateless)**
    *   **Description:** Randomly return a 429 Too Many Requests status.
    *   **Targets:** API Endpoints, Specific Assets, Global.
    *   **Configurables:** Limit (Visual), Retry-After (s), Probability (%).
*   **Stateful Rate Limit**
    *   **Description:** Enforce strict rate-limiting per IP over a time window.
    *   **Targets:** API Endpoints, Specific Assets, Global.
    *   **Configurables:** Limit (requests), Window (s), Retry-After (s), Probability (%).

## 4. Authentication / Session Failures (`auth-session`)
Test authentication handling and session resilience.

*   **401 Unauthorized**
    *   **Description:** Random 401s with configurable rotating reasons.
    *   **Targets:** URI / location_tag.
    *   **Configurables:** Reasons list (Token Expired, Invalid Signature), Probability (%).
*   **403 Forbidden**
    *   **Description:** Simulate access denied scenarios.
    *   **Targets:** URI.
    *   **Configurables:** Custom Message, Probability (%).
*   **Intermittent 401**
    *   **Description:** Occasional authentication drops.
    *   **Targets:** URI filter.
    *   **Configurables:** Rate (%), Reasons.
*   **Corrupt Request Cookies (Client → Server)**
    *   **Description:** Intercept/corrupt session cookies on incoming requests.
    *   **Targets:** API Endpoints, Custom Regex, Global.
    *   **Configurables:** Probability (%).
*   **Flexible Broken Session (Server → Client)**
    *   **Description:** Corrupt, malform, or strip session cookies on the response.
    *   **Targets:** API Endpoints, Custom Regex, Global.
    *   **Configurables:** Corruption Strategy (Broken Session, Malformed Injection, Cookie Stripping), Target Cookie Name, Corrupt Value, Cookie Path, Full Set-Cookie String, Probability (%).

## 5. Strict MIME Enforcement Failures (`frontend-asset`)
Break external assets to simulate client-side failures in strict browsers.

*   **Serve JS as text/plain**
    *   **Targets:** Implicitly targets JS files.
    *   **Configurables:** MIME override, Probability (%).
*   **Serve CSS as text/plain**
    *   **Targets:** Implicitly targets CSS files.
    *   **Configurables:** MIME override, Probability (%).

## 6. CORS / CSP / Browser Security (`cors-csp`)
Manipulate security headers to test browser behavior.

*   **Remove All CORS Headers**
    *   **Description:** Strip all CORS-related headers to trigger XHR blocks.
    *   **Targets:** API Endpoints, Specific Assets, Custom Regex, Global.
    *   **Configurables:** Probability (%).
*   **Wrong CORS Origin**
    *   **Description:** Spoof the Access-Control-Allow-Origin header.
    *   **Configurables:** Origin value, Probability (%).
*   **Wildcard CORS + credentials**
    *   **Description:** Test the invalid combination of wildcard origin and allowed credentials.
    *   **Configurables:** Probability (%).
*   **CSP Injection**
    *   **Description:** Inject broken or highly restrictive Content Security Policies.
    *   **Targets:** Custom Regex, By Extension, API Endpoints, Specific Assets, Global.
    *   **Configurables:** CSP Policy Preset (Block Everything, APIs, Images, Fonts, Custom), Custom Policy String, Probability (%).
*   **OPTIONS Preflight Hang**
    *   **Description:** Delay OPTIONS preflight requests.
    *   **Configurables:** Duration (s), Probability (%).

## 7. JSON / API Response Corruption (`json-corruption`)
Mess with API payloads to ensure frontend resilience.

*   **Corrupt JSON**
    *   **Targets:** API Endpoints, Specific Assets, Custom Regex, Global.
    *   **Configurables:** Strategy (Inject Garbage, Null Values), Probability (%).
*   **Wrong Types**
    *   **Targets:** API Endpoints, Specific Assets, Custom Regex, Global.
    *   **Configurables:** Probability (%).
*   **Remove Fields**
    *   **Targets:** API Endpoints, Specific Assets, Custom Regex, Global.
    *   **Configurables:** Fields to Remove (list), Probability (%).
*   **Replace Field Value**
    *   **Targets:** API Endpoints, Specific Assets, Custom Regex, Global.
    *   **Configurables:** Field Path, New Value, Probability (%).
*   **Invalid JSON**
    *   **Description:** Return a syntactically invalid JSON string.
    *   **Targets:** API Endpoints, Specific Assets, Custom Regex, Global.
    *   **Configurables:** Custom Payload String, Probability (%).
*   **Empty Response**
    *   **Targets:** API Endpoints, Specific Assets, Custom Regex, Global.
    *   **Configurables:** Probability (%).
*   **Wrong JSON Structure**
    *   **Description:** E.g., returning an array when an object is expected.
    *   **Targets:** API Endpoints, Specific Assets, Custom Regex, Global.
    *   **Configurables:** Structure (JSON String), Probability (%).

## 8. Routing / Redirects (`routing`)
Break navigation by injecting faulty redirect directives.

*   **Redirect Loop**
    *   **Description:** Redirect a URI back to itself indefinitely.
    *   **Targets:** Custom Regex, API Endpoints, Specific Assets, Global.
    *   **Configurables:** Probability (%).
*   **Wrong Redirect**
    *   **Description:** Redirect users to an invalid or unexpected location.
    *   **Targets:** Specified via the rule layout, effectively global or match-based depending on implementation.
    *   **Configurables:** Target URI, Status code (301, 302), Probability (%).

## 9. Encoding / Transfer Tricks (`encoding`)
Break clients expecting specific transfer/encoding formats.

*   **Wrong Encoding**
    *   **Description:** Lie about the Content-Encoding (e.g., claiming gzip when it's not).
    *   **Configurables:** Select encoding (gzip, br, deflate), Probability (%).
*   **Bad Content-Length**
    *   **Description:** Deliberately mismatch the actual body size against the Content-Length header.
    *   **Configurables:** Offset (number of bytes to drift), Probability (%).

## 10. Mixed Content (`mixed-content`)
Test insecure configurations.

*   **Remove HSTS + CSP**
    *   **Description:** Strip security headers to allow HTTP content on HTTPS frames.
    *   **Configurables:** Enable toggle, Probability (%).

## 11. Context Layout Shift (`layout-shift`)
Simulate intrusive visual instability on the frontend.

*   **Layout Shift (CLS)**
    *   **Description:** Inject massive UI changes to test layout stability metrics.
    *   **Targets:** Global (All Pages), API Endpoints, Custom Regex.
    *   **Configurables:** Shift Variant (Top Banner, Image Resize, Font Swap, Random Block Resize, Mixed), Shift Magnitude (px), Trigger Delay (ms), Animation Duration (ms), Max Consecutive Shifts, Banner Text, Banner Background Color, Sticky Banner Toggle, Z-Index, Probability (%).

## 12. JS Injection / Client Chaos (`client-chaos`)
Inject faults, CPU blockages, and overrides directly within the browser runtime.

*   **JS Runtime Error**
    *   **Description:** Force unhandled JS exceptions directly on the client.
    *   **Targets:** Global, API Endpoints, Custom Regex.
    *   **Configurables:** Custom Script Tag, Probability (%).
*   **Main-Thread Freeze / Long Task**
    *   **Description:** Block the main browser thread to cause "jank."
    *   **Targets:** Global, API Endpoints, Custom Regex.
    *   **Configurables:** Freeze Duration (ms), Initial Delay (ms), Probability (%).
*   **API Interception / Fetch Override**
    *   **Description:** Globally hijack `window.fetch` to forcibly corrupt API responses from the client side.
    *   **Targets:** Global, API Endpoints, Custom Regex.
    *   **Configurables:** Corrupted Response (JSON text), Custom Fetch Script, Probability (%).
*   **Console Flood / Spam**
    *   **Description:** Overwhelm the DevTools console.
    *   **Targets:** Global, API Endpoints, Custom Regex.
    *   **Configurables:** Message Count, Probability (%).

## 13. TTFB / Time to First Byte (`ttfb`)
Simulate slow backend processing or database bottlenecks before any content is sent.

*   **Fixed TTFB Delay**
    *   **Description:** Add a fixed delay before headers are even sent.
    *   **Targets:** Standard Target Fields Block.
    *   **Configurables:** Header Delay (ms), Probability (%).
*   **Random TTFB Delay**
    *   **Description:** Variable TTFB based on range bounds.
    *   **Targets:** Standard Target Fields Block.
    *   **Configurables:** Min Delay (ms), Max Delay (ms), Probability (%).
*   **TTFB Spike (Occasional)**
    *   **Description:** Fast standard TTFB with extreme intermittent spikes.
    *   **Targets:** Standard Target Fields Block.
    *   **Configurables:** Normal delay (ms), Spike delay (ms), Spike probability (%), Overall probability (%).
