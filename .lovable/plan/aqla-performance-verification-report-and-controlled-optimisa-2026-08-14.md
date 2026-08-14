# Aqla performance — verification report and controlled optimisation plan

No code has been changed. Everything below is verified against the current files and one live measurement of `/`.

## 1. The `will-change` rule (exact current code)

`src/styles.css`, lines 1035–1075 (three related blocks):

```css
a[href],
button:not(:disabled),
[role="button"]:not([aria-disabled="true"]),
.clickable-card,
[data-clickable] {
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 110ms cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 110ms cubic-bezier(0.22, 1, 0.36, 1),
    border-color 110ms ease,
    background-color 110ms ease,
    opacity 110ms ease;
  will-change: transform;          /* <- the only line proposed for change */
}

a[href]:active, button:not(:disabled):active,
[role="button"]:not([aria-disabled="true"]):active,
.clickable-card:active, [data-clickable]:active {
  transform: translateY(0) scale(0.985);
  transition-duration: 60ms;
}

@media (hover: hover) {
  a[href]:hover, button:not(:disabled):hover,
  [role="button"]:not([aria-disabled="true"]):hover,
  .clickable-card:hover, [data-clickable]:hover {
    transform: translateY(-1px);
    box-shadow: 0 0 0 1px var(--gold), 0 4px 14px -8px var(--gold);
  }
}
```

Proposed modification (Step 1): delete the single declaration `will-change: transform;` from the base block and add it only inside the existing hover/active selectors — i.e. the browser promotes an element to its own layer only while it is being hovered or pressed, not permanently for all 116 elements.

- Changes: one deleted line in the base rule; `will-change: transform;` appended inside the `@media (hover: hover)` hover block (and optionally the `:active` block).
- Unchanged: every selector list, the whole `transition` shorthand, the 110ms/60ms timings and easing, `translateY(-1px)`, `scale(0.985)`, the gold `box-shadow`, focus-visible outlines, the reduced-motion block.
- Hover movement: identical. Gold hover shadow: identical. Transition timing: identical.
- Possibility of a visible difference: very low but not literally zero. `will-change` can slightly change text rasterisation on a promoted layer; removing it usually makes static text sharper, never blurrier. On the very first hover of an element the browser now creates the layer at hover time — a sub-frame cost, invisible at 110ms transitions in practice. I cannot claim mathematically zero, so I flag it as "possible, imperceptible" rather than "none".

## 2. Baseline (measured now on `/`, desktop preview)

Measured directly in the live page:

| Metric | Baseline |
| --- | --- |
| DOM nodes | 961 |
| Elements with `will-change` != auto | 116 |
| Elements with `backdrop-filter` | 26 |
| Live SVG filter primitives (`feTurbulence`/`feDisplacementMap`) | 4 (2 flag instances) |
| Flag SVG instances mounted | 2 |
| `<canvas>` elements | 1 (homepage top; the game canvases mount lower in the tree/on demand) |
| Running CSS/Web animations (`document.getAnimations()`) | 39 |

Cannot be measured reliably from this environment (would need a DevTools performance trace on your real device, or a Lighthouse run):

- number of actual composited layers (only DevTools "Layers" reports this)
- scripting / rendering / painting / compositing millisecond split
- long tasks during navigation, FPS and dropped frames
- real route-transition duration under load
- true mobile Safari behaviour (Safari's compositor differs from Chromium; the sandbox only has Chromium)

I will not estimate those as numbers. For each step below, the re-measurable metrics are the table above plus a manual "does navigation feel lighter" check on your iPhone.

## 3–4. The four steps, each audited

### Step 1 — scope `will-change` to hover/active
- Files: `src/styles.css` (lines 1035–1075 only).
- Current: 116 elements permanently promoted to GPU layers.
- Change: move `will-change: transform` into the hover/active rules.
- Perf reason: removes ~116 permanent GPU textures the compositor must track and re-upload on every scroll/navigation.
- Visual difference: Possible but imperceptible (see §1). Functional: None.
- Mobile benefit: High (iOS Safari has tight GPU memory budgets). Desktop benefit: Medium–High.
- Risk: Low. Reversible: Yes (re-add one line).

### Step 2 — replace `background-attachment: fixed`
- File: `src/styles.css`, `.aqla-green-field` (lines 992–1005).
- Current: `background-color: #020806` + one radial gradient + `background-attachment: fixed`.
- Change: keep the identical gradient, but paint it on a `position: fixed; inset: 0; z-index: -1` pseudo-element (`.aqla-green-field::before`) instead of using `background-attachment: fixed`.
- Perf reason: `fixed` attachment forces a full-viewport repaint on every scroll frame; a fixed layer is painted once and composited.
- Visual difference: None expected — a fixed pseudo-element covering the viewport is the standard pixel-equivalent substitute. One caveat to verify after the change: elements that rely on stacking above the background must remain above it, so I would check the welcome gate, the homepage hero and the study overlay screens before/after. Flagging this as the one step with a real (if small) chance of a stacking-order surprise.
- Functional: None. Mobile benefit: High (this is the classic iOS Safari scroll-jank cause). Desktop: Medium.
- Risk: Low–Medium. Reversible: Yes.

### Step 3 — unify duplicate impact-stat queries
- Files: `src/components/ResearchBanner.tsx` (key `public-impact-stats-banner`, polling), `src/components/imported/HeroSection.tsx` (key `impact-stats-hero`, 30s polling), `src/components/ImpactSection.tsx` (`public-impact-stats`), `src/components/ChallengeBanner.tsx` (`["public-impact-stats","banner"]`). Four different keys for one server function.
- Change: one shared `queryOptions` (single key + single interval) imported by all four; components keep their own markup.
- Perf reason: removes 3 duplicate network round-trips and 3 duplicate re-render cascades per poll cycle.
- Visual difference: None (same numbers rendered). Functional: None, with one nuance — the counters will now update in lockstep instead of at slightly different moments, which is a correctness improvement, not a redesign.
- Mobile benefit: Medium (less radio wake-up/battery). Desktop: Low–Medium.
- Risk: Low. Reversible: Yes.

### Step 4 — pause canvas loops when off-screen or tab hidden
- Files: `src/components/StarfieldCanvas.tsx`, `src/components/KnowYourSmokingSection.tsx`.
- Change: wrap each `requestAnimationFrame` loop in an `IntersectionObserver` + `document.visibilitychange` gate; resume exactly where it stopped when visible again.
- Perf reason: stops main-thread + GPU work for effects nobody can see.
- Visual difference: None while visible. Functional: None — but the shooting-game loop also drives its 30-second countdown, so the gate there must pause only the drawing, not the timer, or must not apply while a round is running. I will treat the game loop as "pause only when the tab is hidden and no round is running" to be safe.
- Mobile benefit: High. Desktop: Medium.
- Risk: Low for the starfield, Medium for the game canvases (timer coupling). Reversible: Yes.

## 5. Why two Saudi-flag instances exist

`SaudiFlagWave` is imported in three places:

1. `src/components/imported/HeroSection.tsx:280` — the homepage hero background.
2. `src/components/StudyInvitationOverlay.tsx:330` — inside the full-screen overlay, wrapped in `opacity-[0.14] mix-blend-soft-light` as a faint texture.
3. `src/components/AqlaWelcomeGate.tsx:202` — the login/welcome gate (separate screen, not counted on `/`).

The two on `/` are the hero one and the overlay one. Both were mounted at measurement time (2 flag SVGs, 4 filter primitives). The overlay returns `null` when `visible` is false (`StudyInvitationOverlay.tsx:310`), so it is only present during the invitation; while it is present it covers the hero, so the hero's flag is fully obscured yet its `feTurbulence`/`feDisplacementMap` animation keeps running — SMIL animation does not stop when covered. Both are therefore not simultaneously *needed*; only one is ever seen. Conditionally suspending the hidden one would preserve appearance exactly, but per your instruction nothing is changed and this stays outside Steps 1–4.

## 6. Continuous loops on the homepage

| Component | Animates | Visible | Runs off-screen | Runs during navigation | Runs when tab hidden | Significance |
| --- | --- | --- | --- | --- | --- | --- |
| `StarfieldCanvas` (index.tsx:125) | drifting/twinkling stars, mouse parallax | yes, top of page | yes — no viewport gate | stops on unmount of `/` | rAF throttles to ~0 when hidden, but the mousemove listener stays | Medium |
| `KnowYourSmokingSection` shard/flash canvas (~line 1564) | glass shards + radial flashes, full-viewport canvas | only when scrolled to the section | yes — clears + repaints a full-viewport canvas every frame even with zero shards | stops on unmount | throttled by browser | High (full-viewport clear per frame) |
| `KnowYourSmokingSection` game canvas (~line 1835) | rotating cigarettes, cracks, countdown | only in view / when playing | yes | stops on unmount | throttled | High |
| `SaudiFlagWave` x2 (SMIL) | `baseFrequency` displacement | one of the two is always hidden | yes | yes while mounted | browser-dependent, often keeps running in Safari | High |
| `PublicationCarousel` `setInterval` 4.5s + `useSpotlight` `setInterval` 5s (HeroSection) | fade/scale cycling | hero only | yes | yes | timers keep firing (throttled) | Low |

Answer to your direct question: yes — the site currently renders visual effects the user cannot see (the covered flag instance and the off-screen full-viewport shard canvas are the clearest cases).

## 7. The 820 ms study-overlay exit

`StudyInvitationOverlay.tsx:292`:

```js
setLaunching(true);
window.setTimeout(close, prefersReducedMotion() ? 200 : 820);
```

and `src/styles.css:1103–1107`: `.aqla-launching .aqla-launch-panel { animation: aqla-launch-panel 820ms ... }`.

Verified interpretation: the homepage is already rendered and hydrated underneath — the overlay is a fixed-position layer over it, not a route transition. Nothing is fetched or navigated during those 820 ms. The delay is purely the visual reveal (the overlay stays in the DOM until the launch animation ends). So this is a *perceived* delay, not blocked navigation — the milder of the two problems you described. Unchanged for now.

## 8. Mobile Safari — ranked risk

1. `background-attachment: fixed` — historically the single worst offender on iOS; forces repaints and can break/judder during momentum scroll.
2. Permanent `will-change` on 116 elements — iOS has a hard GPU-memory ceiling; exceeding it causes layer thrash and blank flashes.
3. `feTurbulence` + `feDisplacementMap` (x2, full viewport) — Safari runs these largely on the CPU; the most expensive filters in SVG.
4. 26 `backdrop-filter` elements — expensive, but Safari is comparatively good at them.
5. Canvas loops — significant mainly because they compete with the above.
6. Many simultaneous animations (39) — additive rather than a primary cause.

Steps 2 and 1 therefore target the top two mobile offenders; item 3 is deliberately left untouched per your instruction.

## 9. Controlled sequence

```text
Baseline captured (see §2)
  ↓
Change 1 only — scope will-change to hover/active
  ↓ re-measure: will-change count (expect 116 -> ~0 at rest), visual A/B of hover on 3 button types
  ↓ keep or revert
Change 2 only — fixed-background -> fixed pseudo-element layer
  ↓ re-measure: scroll smoothness on iPhone, screenshot A/B of home + gate + overlay
  ↓ keep or revert
Change 3 only — unify impact-stat queries
  ↓ re-measure: network requests per minute (expect 4 -> 1), counters still identical
  ↓ keep or revert
Change 4 only — gate canvas loops on visibility
  ↓ re-measure: CPU while scrolled past the section, game timer still correct
  ↓ keep or revert
STOP. Re-assess before touching blur, flag filters, or the 820 ms reveal.
```

Each step is a single isolated edit, individually revertible, with a measurement gate before the next one.

Nothing will be edited until you reply IMPLEMENT.
