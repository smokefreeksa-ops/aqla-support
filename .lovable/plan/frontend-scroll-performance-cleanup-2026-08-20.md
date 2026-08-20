# Frontend scroll-performance cleanup

Frontend rendering only. No backend, database, auth, clinical logic, routes, forms, or content changes. Branding, colours, layout, logo and copy stay as they are.

## What the inspection found

Confirmed by code search in `src/`:

- **Continuous decorative canvas on the homepage** — `StarfieldCanvas` runs a `requestAnimationFrame` loop over a full-page canvas with ~280 stars plus a `mousemove` listener, mounted on `/`.
- **Decorative animation cluster in `ImpactSection`** — spinning hexagons (28s, 18s, 12s), an orbiting dot ring, an infinite background glow, and an infinite number pulse, all running whenever the section exists.
- **Fixed full-viewport paint layer** — `.aqla-green-field::before` is `position: fixed` with multi-stop radial gradients, repainting behind everything.
- **Still-live backdrop blur** — a global kill-switch exists, but `.crystal-panel--map`, `.aqla-glass-*` rules (`backdrop-filter: saturate/brightness` at styles.css 733 and 937) and `GlobalVideoBackground` (`backdrop-blur-[2px]` over a fixed full-screen video) still filter large areas. Around 25 route/component surfaces use `backdrop-blur` classes.
- **Permanent `will-change`** on the launch panel plus hover/active rules.
- **Infinite CSS animations**: float-slow, float-soft, pulse-soft, breathe, shimmer, hex-pulse, star-twinkle, study-banner-pulse, welcome-gate hex float, ChallengeBanner shimmer + pulsing dot, CinematicHero text drift.
- **Scroll listener**: one in `GlobalBackBar` (already passive + rAF-throttled) — will be kept but reviewed.
- No `feTurbulence` / `feDisplacementMap` remain (the flag wave was already flattened).

## Changes

1. **Kill the homepage starfield canvas.** Remove `StarfieldCanvas` from `src/routes/index.tsx` and replace its visual with a static CSS star texture (fixed-cost gradient) so the night-sky feel stays with zero per-frame work. Same for `imported/StarField` where it is still rendered.
2. **Make `ImpactSection` decorations static.** Delete the spin/orbit/glow/number-pulse infinite animations; keep the hexagons and dots as static shapes at their current positions and opacity. Keep the count-up rAF (it is a short, finite, one-shot animation) but gate it behind `IntersectionObserver` and `prefers-reduced-motion`.
3. **Remove remaining backdrop blur.** Strip `backdrop-filter` from `.crystal-panel--map` and the two `saturate/brightness` rules; drop `backdrop-blur-[2px]` on `GlobalVideoBackground`; replace `backdrop-blur` utility classes on page headers and large panels with slightly more opaque solid backgrounds (e.g. `bg-card/70` → `bg-card/92`) so they still read as frosted. Keep the global `backdrop-filter: none` safety net.
4. **Un-fix the background layer.** Convert `.aqla-green-field::before` from `position: fixed` to a normal scrolling background on the element, ending full-viewport repaint on every scroll frame.
5. **Trim infinite CSS animations** in `src/styles.css` and components: float-slow/soft, breathe, pulse-soft, shimmer, hex-pulse, star-twinkle, study-banner-pulse, welcome-gate hex float, ChallengeBanner shimmer/dot, CinematicHero drift become static. Short interaction feedback (press scale, hover lift, enter/exit transitions, launch transition, SOS button pulse while the SOS flow is open) is kept.
6. **Remove permanent `will-change`.** Keep it only on the active/pressed rule where it lives for ~60ms; drop it from the launch panel and hover rule.
7. **Reduce shadow cost.** Replace the largest soft shadows on big panels (`0 30px 80px -30px`, `shadow-2xl` on full-width cards) with a smaller normal shadow.
8. **Below-the-fold rendering.** Apply `content-visibility: auto` with `contain-intrinsic-size` to the homepage sections after the hero that contain no forms, modals or measured widgets — pathways, features, modules, impact, CTA. Explicitly not applied to the interactive tools section, chat, dashboard, or any overlay.
9. **Mobile / coarse-pointer profile.** Extend the existing media block so phones and tablets get no backdrop blur, no decorative continuous animation, and simplified shadows.
10. **Reduced motion.** Ensure every remaining animation is covered by `prefers-reduced-motion: reduce`.

Untouched by design: the game canvas loops in `KnowYourSmokingSection` and the voice-analysis rAF in the SOS/voice features — those are functional, not decorative, and already stop when idle/offscreen.

## Verification

Run typecheck and the frontend test suite, then re-run the full search (`backdrop-filter`, `requestAnimationFrame`, `feTurbulence`, `feDisplacementMap`, `addEventListener("scroll"`, `will-change`, `animation:`, `position: fixed`, `blur(`) and measure scroll FPS in the preview with Playwright before/after. Report A–J as requested, including the exact remaining occurrences and why each is justified.
