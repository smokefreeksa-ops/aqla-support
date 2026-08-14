# Read-only performance diagnostic — why navigation feels heavy

No files were changed. Findings below are verified against the current code and a live measurement of the homepage.

## Live measurement (homepage, `/`)

| Metric | Value |
|---|---|
| DOM nodes | 963 |
| Elements with `will-change` | **116** |
| Elements with `backdrop-filter` | **26** |
| Animated SVG filter primitives mounted | 4 (2 live `feTurbulence` + `feDisplacementMap` pairs) |
| Fixed-position full-viewport layers | 3 |
| Canvas animation loops | 1 (homepage idle state) |

## Most likely primary cause

A global CSS rule in `src/styles.css` puts `will-change: transform` on **every** link, button and `[role="button"]` on the page. On this homepage that is 116 permanently promoted compositor layers, each holding its own GPU texture. Combined with 26 `backdrop-filter` layers, a `background-attachment: fixed` page background and a full-viewport animated SVG displacement filter, the browser re-composites and repaints a very large surface on every route change, scroll and hover — which is exactly the "heavy, delayed, not smooth" feel described. This is a rendering/compositing cost, not a network cost.

## Top 5 contributors (ranked)

| Rank | Cause | Evidence | Impact | Confidence |
|---|---|---|---|---|
| 1 | Global `will-change: transform` + hover `transform`/`box-shadow` on all clickable elements | `src/styles.css` ~1035–1075; measured 116 promoted elements | Critical | High |
| 2 | Animated SVG `feTurbulence` + `feDisplacementMap` covering the full viewport (`SaudiFlagWave`), 2 instances mounted | `src/components/SaudiFlagWave.tsx`; 4 filter nodes live | High | High |
| 3 | 26 stacked `backdrop-filter: blur(...) saturate(...)` layers, several large | `src/styles.css` (blur 12–20px, `saturate`, `brightness`), banner, header, cards | High | High |
| 4 | `background-attachment: fixed` on `.aqla-green-field` (the whole page background) | `src/styles.css` line ~992–1005 | High on mobile / Medium desktop | High |
| 5 | Always-mounted global widgets in `__root.tsx` (`AqlaAssistant`, `CommandPalette`, `SOSButton`, WhatsApp, `StudyInvitationOverlay` + its banner) re-rendering on every navigation | `src/routes/__root.tsx` 218–239; `AqlaAssistant` subscribes a `MutationObserver` on `<html>` | Medium | High |

## Highest-risk components in detail

**`src/styles.css` — global interaction rules**
Applies `will-change: transform`, a 5-property `transition`, and a hover `transform: translateY(-1px)` + gold `box-shadow` to every `a[href]`, `button`, `[role="button"]`, `.clickable-card`. Because `will-change` is unconditional (not scoped to `:hover`), all 116 elements are permanently layerised. Impact: **Critical**. Visual change if fixed: **No** (behaviour identical; `will-change` is purely a hint).

**`src/components/SaudiFlagWave.tsx`**
Full-viewport SVG whose green rect is filtered by an SMIL-animated `feTurbulence` → `feDisplacementMap`. Displacement filters are re-evaluated per frame across the whole viewport and are notoriously slow in Safari/iOS. Two instances are currently in the DOM. Impact: **High**. Visual change if fixed: **Potentially** (the wave is the effect; it could be frozen or pre-rendered).

**`src/components/StarfieldCanvas.tsx`**
Continuous `requestAnimationFrame` loop redrawing up to 280 arcs, plus a **non-passive `mousemove`** listener on `window` writing to mutable state each move. Cleanup is correct (rAF cancelled, listeners removed). Impact: **Medium** (adds constant main-thread + GPU work during transitions). Visual change if fixed: **Potentially**.

**`src/components/KnowYourSmokingSection.tsx` (~1,800 lines, on the homepage)**
Contains several independent canvas `requestAnimationFrame` loops and resize listeners, all mounted with the homepage regardless of whether they are scrolled into view. Impact: **Medium–High** on the homepage specifically. Visual change if fixed: **No** (pausing off-screen loops is invisible).

**Duplicate live-stats polling**
`ResearchBanner` (`["public-impact-stats-banner"]`) and `HeroSection`'s `LiveStatsBar` (`["impact-stats-hero"]`) call the same `getPublicImpactStats()` under two different query keys, each with `refetchInterval: 30_000`. That is two server round-trips every 30s instead of one, plus two re-render cascades. Impact: **Medium** (jank spikes, not navigation blocking). Visual change if fixed: **No**.

**`src/components/AqlaAuthGate.tsx`**
Wraps the whole tree. On non-public routes it renders a blank green screen until `supabase.auth.getSession()` resolves — a real, network-bound delay on first load of any private route (e.g. `/dashboard`). Client-side navigation between routes is *not* re-blocked (the session effect runs once), but a `useLocation()` subscription re-renders the entire app subtree on every navigation. Impact: **Medium** (High for direct arrival on a private route). Visual change if fixed: **No**.

**`src/components/StudyInvitationOverlay.tsx` (609 lines)**
Mounted globally; when dismissed it returns `null` early, so it is cheap once closed. While open it stacks the green environment, the flag filter, a full-screen backdrop button, `ResearchBanner`, and a `backdrop-filter` glass panel — the heaviest single screen in the app, and it is the **first** thing a new visitor sees. It also manipulates `history` (pushState + `history.back()`), which makes Back/Skip feel indirect.

**Routing itself is healthy.** `src/router.tsx` uses `defaultPreload: "intent"`, sensible `staleTime`s and `defaultPendingMs: 220`; TanStack automatic code splitting is on. Internal navigation uses `<Link>`; the few `<a href>` uses are external (REDCap, publications) or intentional.

## Actual delay vs perceived delay

**Both, but rendering-side "actual" delay dominates.**
- *Actual:* main-thread/compositor work — layer explosion from `will-change`, backdrop blurs, SVG displacement filter, canvas loops. These make paint after a route change genuinely slow, and make scroll/hover feel laggy.
- *Perceived:* the study overlay's 500 ms fade-in + 600 ms panel transform, the 820 ms `aqla-launch-panel` exit animation before the site appears, and `defaultPendingMs`/`defaultPendingMinMs` (220/320 ms) spinner floor. On a fast connection the site is ready well before these finish.
- *Not a factor:* network payloads. No blocking loaders were found on the main routes.

## What is NOT the problem

- **Routing / code splitting** — automatic splitting is enabled, preloading on intent is configured, no full-page reloads via stray `<a>` for internal routes.
- **Background video** — `GlobalVideoBackground.tsx` exists but is not imported anywhere; it costs nothing.
- **`CinematicHero.tsx`** — also unused/unmounted.
- **Fonts** — a single Google Fonts stylesheet with `display=swap` and correct `preconnect`s in `__root.tsx`.
- **Heavy libraries** — `@react-pdf/renderer`, `recharts`, `html2canvas` are dynamically imported or confined to their own routes; they are not in the homepage path.
- **Third-party scripts** — none beyond the font stylesheet; JSON-LD blocks are inert.
- **Timer/listener cleanup** — the intervals, rAF loops, observers and Supabase subscriptions inspected all have correct teardown. No leaks found.

## Possible fixes (not applied)

| Fix | Benefit | Risk | Visual change | Behaviour change | Effort | Reversible |
|---|---|---|---|---|---|---|
| Scope `will-change` to `:hover`/`:active` instead of always-on | Largest single win; removes ~116 GPU layers | Very low | No | No | Trivial | Yes |
| Reduce/limit `backdrop-filter` count and blur radius, or drop it below a breakpoint | Big mobile paint win | Low | Slight (less frosted) | No | Small | Yes |
| Replace `background-attachment: fixed` with a fixed pseudo-element layer | Removes repaint-on-scroll | Low | No | No | Trivial | Yes |
| Freeze/pre-render the flag displacement filter, or render one instance only | Removes per-frame full-viewport filtering | Low | Potentially (wave stops) | No | Small | Yes |
| Pause canvas rAF loops when off-screen (IntersectionObserver) / on tab hide | Frees main thread during transitions | Low | No | No | Medium | Yes |
| Share one query key for impact stats | Halves polling and re-renders | Very low | No | No | Trivial | Yes |
| Shorten overlay entry/exit timings (820 ms → ~350 ms) | Large perceived-speed win | Low | Yes (faster animation) | No | Trivial | Yes |
| Lazy-mount global widgets (assistant/palette) after idle | Lighter first paint & per-nav renders | Medium | No | Slight (delayed availability) | Medium | Yes |

## Safest improvements (no visual change at all)

1. Scope `will-change` to hover/active.
2. Swap `background-attachment: fixed` for a fixed backdrop layer.
3. Unify the two impact-stats query keys.
4. Pause off-screen canvas loops.

## Should not be touched

Router configuration, code splitting, fonts, the unused video/hero components, PDF and chart dynamic imports, and existing cleanup logic — all verified sound.

## Evidence worth gathering before changing anything

- **Chrome Performance trace** during a route change (look for long "Composite Layers"/"Paint" bars — this confirms cause #1 directly).
- **Layers panel / "Show composited layer borders"** — visually confirms the 116 promoted elements.
- **Lighthouse mobile** on `/` for TBT and main-thread breakdown.
- **React Profiler** during a navigation to quantify the `AqlaAuthGate` → whole-tree re-render.
- Bundle analysis is *optional* — nothing in the code suggests bundle size is the bottleneck.

## Recommended first step (if approved)

Change one line: scope the global `will-change: transform` to `:hover`/`:active`, then re-measure. It is a one-line, fully reversible edit with zero visual impact and the largest expected gain. Fixes 2–4 in the "safest" list would follow in the same pass.
