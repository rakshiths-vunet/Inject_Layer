# Failure Injection Control Plane — UI & System Plan

## Purpose

Build a **web-based control plane** that allows engineers, SREs, QA, and product teams to **intentionally inject failures** into selected business and infrastructure microservices in a **controlled, observable, and reversible** way.

The goal is **chaos with guardrails** — simulate real-world failures (infra + business) to validate:

* System resilience
* User experience degradation
* Alerting & observability
* Auto-healing behavior

This system is NOT for load testing alone — it is for **failure orchestration**.

---

## Target Users

* **SRE / Platform Engineers** – validate infra resilience
* **Backend Engineers** – test service behavior under stress
* **QA / Automation** – scenario-driven failure testing
* **Product / Ops** – understand business impact of failures

---

## Supported Failure Types

Failures are grouped by **resource domain**.

### Compute & Runtime

1. **OOM (Out of Memory)**
2. **CPU Throttling / Spike**
3. **Thread Pool Exhaustion**

### Data Layer

4. **DB Connection Pool Exhaustion**

### Network

5. **Network Latency**
6. **Packet Drop / Loss**

### Traffic & Edge

7. **Gateway Spike / Too Many Requests (429)**

Each failure must be:

* Targeted (service-specific)
* Time-bound
* Observable
* Reversible

---

## Target Microservices

### Application Services

* CBS
* OTP
* Password Check
* JWT
* MPIN
* Credit Service
* Debit Service

### Orchestration & Edge

* Gateway
* Channel
* Payment Orchestrator

### Infra / Data

* Postgres
* Redis
* Kafka

---

## High-Level Architecture

```
[ UI Dashboard ]
       |
       v
[ Failure Control API ]
       |
       +--> [ Kubernetes / Runtime Injector ]
       +--> [ Service-Level Injectors ]
       +--> [ Network Chaos Layer ]
       +--> [ Data Layer Proxies ]
       |
       v
[ Observability Stack ] (Logs / Metrics / Traces)
```

---

## UI Website — Core Screens

### 1. Dashboard (Home)

**Purpose:** Global view of system health and active chaos.

**Shows:**

* Active failures (count + severity)
* Services currently under injection
* Time remaining per experiment
* System health summary (green / amber / red)

**Actions:**

* Kill all experiments (BIG RED BUTTON)
* Navigate to service-level control

---

### 2. Service Matrix View

**Purpose:** Visual selection of *what* to break.

**Layout:**

| Service | OOM | CPU | Threads | DB Pool | Latency | Packet Drop | Req Spike |
| ------- | --- | --- | ------- | ------- | ------- | ----------- | --------- |

* Toggle-based enablement
* Greyed-out options for unsupported failures
* Tooltip explaining real-world equivalent

---

### 3. Failure Configuration Panel

Appears when a failure is selected.

**Common Parameters (all failures):**

* Target service(s)
* Duration (seconds / minutes)
* Start mode (Immediate / Scheduled)
* Blast radius (single pod / % of pods / all)
* Auto-revert toggle

**Failure-specific controls:**

#### OOM

* Memory limit override (MB)
* Leak rate (MB/sec)
* Kill vs Throttle behavior

#### CPU

* CPU burn %
* Core pinning
* Burst vs sustained

#### Thread Pool

* Max threads allowed
* Queue capacity
* Reject vs block strategy

#### DB Connection Pool

* Max connections allowed
* Timeout duration
* Fail open vs fail closed

#### Network Latency

* Added latency (ms)
* Jitter
* Direction (ingress / egress)

#### Packet Drop

* Drop percentage
* Protocol (TCP / UDP)
* Direction

#### Gateway Spike

* Requests/sec injected
* Error type (429 / timeout)
* Per-route or global

---

### 4. Scenario Builder (Advanced)

**Purpose:** Combine failures into real-world scenarios.

Examples:

* Gateway spike → JWT thread exhaustion → Redis latency
* DB pool exhaustion + Payment Orchestrator CPU throttle

**Features:**

* Drag-and-drop steps
* Sequential or parallel execution
* Conditional steps ("only if error rate > X")

---

### 5. Observability View

**Purpose:** See impact in real-time.

Embedded panels:

* Error rate
* Latency (p95/p99)
* CPU / Memory
* Kafka lag
* DB connection usage

Clickable link-outs:

* Grafana
* Kibana
* Jaeger

---

### 6. Audit & History

**Purpose:** Safety and traceability.

* Who triggered what
* When and why
* Duration
* Outcome (manual stop / auto stop / failure)

---

## Failure Injection — Service Mapping

### Application Services (CBS, OTP, JWT, etc.)

Supported:

* OOM
* CPU
* Thread pool
* Network latency
* Packet drop

Injected via:

* Sidecar / agent
* JVM flags / runtime hooks
* Env overrides + pod restarts

---

### Gateway / Channel

Supported:

* Request spikes
* 429 injection
* Latency
* Packet drop

Injected via:

* NGINX / Envoy filters
* Rate-limit rule overrides

---

### Postgres

Supported:

* Connection pool exhaustion
* Latency

Injected via:

* PgBouncer config manipulation
* Proxy-level throttling

---

### Redis

Supported:

* Latency
* Connection saturation

Injected via:

* Redis proxy
* Artificial slow commands

---

### Kafka

Supported:

* Broker latency
* Consumer lag simulation

Injected via:

* Network delay
* Consumer pause / throttle

---

## Safety & Guardrails

Mandatory safeguards:

* Max duration limits
* Production environment lock (read-only unless approved)
* Auto-revert on UI disconnect
* RBAC-based access control
* Canary-only execution by default

---

## Real-World Business Impact Mapping

| Failure               | What User Sees                |
| --------------------- | ----------------------------- |
| OOM in OTP            | OTP not delivered / delayed   |
| JWT thread exhaustion | Login hangs                   |
| DB pool exhaustion    | Balance check fails           |
| Gateway spike         | App shows "Too many requests" |
| Redis latency         | Sluggish app behavior         |
| Kafka lag             | Transaction status delayed    |

---

## Tech Stack (Suggested)

### Frontend

* React / Next.js
* Dark-mode UI (matches Gudanta design)
* WebSockets for real-time updates

### Backend

* Control Plane API (Go / Java)
* Policy engine for safety

### Chaos Layer

* Kubernetes-native injectors
* Sidecars or eBPF-based tools
* Network chaos via tc / netem

### Observability

* Prometheus
* Grafana
* Loki / ELK

---

## MVP vs Phase 2

### MVP

* Manual failure injection
* Single failure at a time
* Core services only

### Phase 2

* Scenario chaining
* Blast radius controls
* Auto-remediation testing

---

## Success Criteria

* Engineers can break any service safely within 2 minutes
* Clear correlation between injected failure and user impact
* Zero lingering failures after experiment ends
* Full audit trail

---

## Notes for Automation / Agents

* Treat failures as **state machines** (CREATED → ACTIVE → REVERTED)
* Every injection must expose: `start()`, `status()`, `rollback()`
* UI is a controller, not executor

---

If you want next:

* **API spec for Failure Control API**
* **UI wireframe spec (page-by-page)**
* **Scenario catalog mapped to payments flow**
* **K8s-level injector design (OOM/CPU/netem)**

Tell me what to generate next.
