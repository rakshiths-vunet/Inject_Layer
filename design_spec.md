# Gudanta — Fintech SaaS Landing Page

**Source:** Dribbble shot: [https://dribbble.com/shots/26021099-Gudanta-Fintech-SaaS-Landing-page](https://dribbble.com/shots/26021099-Gudanta-Fintech-SaaS-Landing-page)

**Design image (for reference):** `/mnt/data/df85fa66-366b-4018-8054-bd5cdd0a77a9.png`

---

## Overview

This document is a handoff-ready design specification for the **Gudanta** landing page (dark mode). It describes visual tokens, layout rules, component anatomy, responsive rules, interaction patterns, accessibility notes, and export asset instructions so the file can be consumed by your Antigravity agent or implementation team.

Use this spec as the single source of truth for implementation, QA, and automated tests.

---

## Global Tokens

These tokens capture the look-and-feel of the design.

### Color Palette

> Primary dark theme — measured/approximated from the design.

* `--bg-900: #0B0C0F` (page background)
* `--panel-800: #0F1114` (card / panel background)
* `--panel-700: #14161A` (slightly lighter panel)
* `--muted-600: #1B1E22` (muted surfaces)
* `--text-100: #FFFFFF` (primary text)
* `--text-60: rgba(255,255,255,0.65)` (body)
* `--text-40: rgba(255,255,255,0.40)` (muted)
* `--accent-500: #FFC857` (yellow accent for CTAs)
* `--accent-400: #FFD980` (lighter accent)
* `--success-500: #52D890` (success / green)
* `--neutral-500: #9AA0A6` (borders and subtle text)
* `--glass-000: rgba(255,255,255,0.03)` (glass overlays/shadows)

> **Usage**: Primary content sits on `--bg-900`. Cards use `--panel-800` / `--panel-700`. CTAs use `--accent-500` on dark background.

### Typography

**Font family:** Inter (system fallback: `Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto`).

**Weights used:** 400 (Regular), 600 (SemiBold), 800 (ExtraBold)

**Scale (desktop)**

* `h1` (hero heading): 48–56px, `font-weight: 800`, `line-height: 1.05`
* `h2` (section headings): 28–32px, `font-weight: 600`
* `h3` (cards / small headings): 18–20px, `font-weight: 600`
* `body` (lead): 16px, `font-weight: 400`, `line-height: 1.5`
* `meta` / `muted`: 13–14px, `font-weight: 400`, opacity 0.4–0.65

**Mobile scale** — scale down by ~20% for smaller breakpoints.

### Spacing System

A 4px base grid with common steps (8, 12, 16, 24, 32, 40, 48, 64).

* `space-1 = 4px`
* `space-2 = 8px`
* `space-3 = 12px`
* `space-4 = 16px`
* `space-6 = 24px`
* `space-8 = 32px`
* `space-12 = 48px`

### Elevation / Shadows

Dark-mode subtle elevations only — mimic "soft glass".

* `elev-1: 0 6px 18px rgba(0,0,0,0.6)` (cards)
* `elev-2: 0 18px 36px rgba(0,0,0,0.7)` (hero image mask)

---

## Layout & Grid

**Container & page width**

* Page center container max-width: `1280px` for desktop.
* Outer paddings: `24px` (mobile), `48px` (desktop) left / right.

**Grid**

* Desktop: 12-column grid, `gutter: 24px`.
* Tablet: 8-column grid.
* Mobile: single column stacked.

**Breakpoints**

* `xs` — 0–479px (mobile)
* `sm` — 480–767px (large phones)
* `md` — 768–1023px (tablet)
* `lg` — 1024–1439px (desktop)
* `xl` — 1440px+ (wide desktop)

---

## Component Specs

Below are the main page components with structure, sizes, and recommended CSS variables / classes.

### 1. Navigation (Top Bar)

**Structure**: left: logo; center: nav links (Home, About Us, Features, FAQ); right: actions (Log in, Book a Demo).

* Height: `64px` desktop, `56px` mobile
* Logo: 40px height
* Nav links: 14–16px, `color: --text-60`
* CTA (Book a Demo): filled pill `background: --panel-700` with subtle border and `text: --text-100` or use `--accent-500` on hover.

**States:** hovered link reduces opacity or shows underline micro-animation.

---

### 2. Hero

**Structure**: small top badge (Optimized Control) -> H1 heading -> subheading -> central screenshot mock inside an inset panel -> primary CTA button (Get Started) -> logos row

**Hero container**

* Vertical padding: `96px` top, `64px` bottom on desktop; scaled down for mobile.
* H1 font-size: `48px`–`56px` (heavy weight). Example CSS: `font-size: clamp(32px, 4.2vw, 56px)`
* Subheading: 16–18px, `color: --text-60`

**Mock screenshot panel**

* Panel width: ~720px on desktop (or 60% of container), height ~360px.
* Panel background: `--panel-800`, rounded corners `16px`, drop shadow `elev-1`.
* CTA over panel: `Get Started` (small pill) centered horizontally.

**Logos strip**

* Small grayscale logos, max height `28px`, spaced evenly with `gap: 24px` and low opacity `0.5`.

---

### 3. Metrics Engine Cards

Four compact metric panels presented in a 2x2 layout (desktop) or single column (mobile).

**Card**

* Card background: `--panel-700`, padding: `16px`–`20px`, border-radius: `12px`
* Title: 12–14px uppercase; Value: 28–36px bold; description: 13–14px muted.
* Card width: use grid columns: 3 columns worth each on a 12-col grid or responsive flex.

---

### 4. Features / Illustration Block

Left: features list with numbered items and small check/box icons; Right: circular node diagram (illustration) inside a large circular soft gradient.

**Feature list**

* Each feature item: icon square (40px) + heading (16px) + description (14px)
* Spacing between items: `space-6` (24px)

**Diagram**

* Illustration container: circular masked area `~360px` diameter on desktop.
* Use subtle blurred radial gradients behind nodes. Nodes are small 56px rounded squares with inner icon + subtle inner glow.

---

### 5. Workflow / From Data to Decisions (Steps)

Five horizontally-arranged step-cards with imagery & descriptions. On mobile they stack vertically and become horizontally scrollable.

**Step card**

* Size: `260px` width (desktop card) or flexible with grid.
* Panel background `--panel-800`, border-radius `12px`, padding `16px`.
* Step number chip: small badge top-left `font-weight: 600`, background `rgba(255,255,255,0.04)`.

**Mobile behavior**

* Collapse to a vertical stack; allow horizontal carousel for quick swiping.

---

### 6. Testimonials / Voices

A dark strip with circular avatar, name, role and quote. Use 3 items, centered with dots to indicate pagination on mobile.

* Avatar size: `48px` circle
* Quote font-size: 15–16px; color `--text-60`

---

### 7. CTA / Activation Section

A full-width dark panel with short heading and two CTAs: `Start Trial` (primary yellow) and `Book a Demo` (ghost).

* Panel padding: `48px` vertical
* Primary button: background `--accent-500`, padding `12px 24px`, border-radius `10px`, box-shadow subtle glow `0 6px 20px rgba(255,200,80,0.08)`.
* Secondary: outline with border `1px solid rgba(255,255,255,0.06)`.

---

### 8. Footer

Minimal: logo, small nav, social icons, copyright.

* Footer background: `--panel-800`, padding: `32px 24px`.
* Footer text: `12px`–`13px`, muted color `--text-40`.

---

## Accessibility & Content Guidelines

* **Contrast**: Ensure headings have a contrast ratio >= 4.5:1 against the background. Use `--text-100` for headings. For smaller body text, aim for >= 3:1 if using `--text-60`.
* **Keyboard navigation**: All CTAs and links must be focusable and show a visible focus ring (outline: `2px solid --accent-400` or `box-shadow` equivalent).
* **Alt text**: All imagery (hero screenshot, logos, avatars) must include descriptive `alt` attributes.
* **Reduced motion**: Respect prefers-reduced-motion by disabling non-essential animations.

---

## Interaction & Animation

* **Hero CTA**: subtle lift on hover (translateY(-4px) + shadow increase). Transition `200ms` ease-out.
* **Card hover**: 1.02 scale, slight brightness `filter: brightness(1.05)` on hover.
* **Nav link underline**: small animated underline expanding from center on hover `width` transition 180ms.
* **Modal / screenshot spotlight**: fade-in + slide from bottom `300ms`.

If user prefers, provide Lottie or micro-interactions as separate assets.

---

## Export / Assets

**Raster assets** (PNG/JPG):

* Hero screenshot: `assets/hero-screenshot.png` — export @2x and @3x
* Logos row: `assets/logos/logo-{brand}.svg` (prefer SVG)
* Avatars: `assets/avatars/{name}.png` — export at 2x (96px)

**Icons**: Provide as SVGs. Naming convention: `icon-{name}.svg` (e.g., `icon-analytics.svg`, `icon-integration.svg`).

**Illustrations**: Provide layered SVG/PNG; node diagram as a separate SVG `illustration-network.svg`.

**Filenames & structure**

```
/assets/
  /icons/
  /logos/
  /images/
  hero-screenshot.png
  illustration-network.svg
```

**Export sizes**:

* Hero screenshot: 1440px wide for desktop hero panel. Provide 1x/2x/3x.
* Logos: svg preferred; raster at 2x if needed.

---

## Implementation Snippets (Example)

**CSS variables**

```css
:root{
  --bg-900:#0b0c0f;
  --panel-800:#0f1114;
  --panel-700:#14161a;
  --text-100:#ffffff;
  --text-60:rgba(255,255,255,0.65);
  --accent-500:#ffc857;
}

body{ background:var(--bg-900); color:var(--text-60); font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto; }
```

**Hero structure (HTML skeleton)**

```html
<header class="site-hero container">
  <div class="badge">Optimized Control</div>
  <h1>Unleash the Full Power of Your Inventory<br/>with Intelligent Data Control.</h1>
  <p class="lead">Enter the era of Data-Driven Mastery — where smart tools and real-time insights simplify and strengthen your inventory control.</p>
  <div class="hero-panel"> <!-- screenshot panel --> </div>
  <div class="hero-cta"><button class="btn-primary">Get Started</button></div>
</header>
```

---

## QA Checklist for Handoff

* [ ] All text strings (headings, CTAs, feature copy) available in i18n file.
* [ ] SVGs cleaned (no embedded raster) and optimized.
* [ ] Exported PNGs at required densities.
* [ ] Contrast and keyboard focus validated.
* [ ] Responsive breakpoints tested at common widths: 360, 480, 768, 1024, 1280.

---

## Notes for Antigravity Agent

* Reference design image: `/mnt/data/df85fa66-366b-4018-8054-bd5cdd0a77a9.png`.
* Use the color tokens and component descriptions to generate HTML/CSS, assets directories, and a root `design-tokens.json` that maps the above variables.
* Preferred output formats: `design-spec.md` (this file), `design-tokens.json`, and a zip of `/assets` with placeholder SVGs and optimized PNGs.

---

## Appendix — Measurements (approx.)

* Page side padding: `48px` desktop, `24px` mobile
* Hero H1 baseline: `56px` (desktop)
* Hero screenshot panel corner radius: `16px`
* Card corner radius: `12px`
* CTA pill radius: `10px`

---

If you want, I can also generate a `design-tokens.json` and a starter CSS file or a Tailwind config that matches these tokens. Tell me which output you want next (tokens JSON / CSS / Tailwind config / React components).
