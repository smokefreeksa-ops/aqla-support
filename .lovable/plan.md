
## Goal
Upgrade the "صوّب على السجائر" mini-game into a more visceral, share-worthy experience: rename it, replace the flat target with a realistic lit cigarette rendered inside a 3D-looking hexagon, make the gunshot sound significantly stronger, and turn the hit reaction into a large shattered-glass burst that flies out of the game canvas into the surrounding page.

## Scope (frontend / presentation only)
All work stays inside the existing shooter feature. No backend, no schema.

### 1. Rename everywhere
Rename the tool from **"صوّب على السجائر"** → **"تحدي كسر عادة التدخين"** (keep English as "Break the Smoking Habit Challenge").

Files touched:
- `src/components/KnowYourSmokingSection.tsx` — the `tools[4]` entry (`name`, `blurb`, share card title, meta).
- `src/routes/try.shoot.tsx` — page `<title>`, meta description, og:title/description, header copy.
- `src/components/ChallengeBanner.tsx` — the amber pill currently reading "صوّب على السجائر".
- `src/routes/index.tsx` / `HeroSection` shortcut button label (if it references the old name).

Route path `/try/shoot` stays (avoids breaking shared links).

### 2. Realistic lit cigarette target
Currently targets are drawn as simple shapes. Replace with a canvas-rendered lit cigarette:
- White paper body with subtle paper texture (thin horizontal noise lines).
- Tan/orange filter band at the base with brand ring.
- Glowing ember tip: radial gradient (bright yellow core → orange → deep red), pulsing every ~400ms.
- Rising smoke: 2–3 semi-transparent gray puffs drifting upward with slight sway (sine curve), fading out.
- Random slight rotation per spawn so no two look identical.

Implemented as a pure `<canvas>` draw routine inside the existing `Shooter` component — no new image assets, keeps bundle size flat.

### 3. 3D hexagon frame
Wrap the game canvas in a hexagon "arena":
- CSS `clip-path: polygon(...)` for the hex silhouette.
- Layered shadows + inner highlight + subtle `perspective` / `rotateX(6deg)` on the container to fake depth.
- Gold rim (matches Aqla palette) with `box-shadow` glow.
- Small hex chrome corners at the six vertices for the "3D bevel" feel.
- Falls back gracefully on mobile (reduce perspective to avoid layout jitter).

### 4. Stronger gunshot audio
Current shot is a short Web Audio blip. Upgrade to a layered impulse:
- **Layer A** — low-end thump: sine 60Hz, quick exp decay ~80ms, high gain.
- **Layer B** — mid crack: filtered white-noise burst through a bandpass @ 1.2kHz, ~120ms decay.
- **Layer C** — high snap: noise burst through highpass @ 4kHz, 40ms, adds "crack".
- **Tail** — short convolver reverb (algorithmic impulse generated in-code) for room feel.
- Master compressor to keep it loud without clipping.
- Respect a mute toggle already present in the game UI.

Still Web Audio only — no audio files added.

### 5. "4D" shattered-glass explosion
On hit, spawn a large glass-shatter burst that visibly escapes the hexagon and flies across the page:
- Render shards on a **full-viewport fixed `<canvas>`** (pointer-events: none, z-index above the game) that mounts only while the game is active — this is what lets shards travel outside the hex.
- Per hit: spawn 40–70 polygonal shards with:
  - Randomized triangular/quad geometry.
  - Initial velocity radiating outward from impact point + strong upward bias.
  - Gravity, air drag, angular velocity (tumbling).
  - Gradient fill (cool white → pale cyan) with a bright specular edge stroke → reads as glass.
  - Alpha fade over 1.2–1.8s, then removed.
- Add a brief radial white flash (80ms) at impact for the "camera pop".
- Screen-shake: 120ms translate on the hex arena only (not the whole page — avoids mobile scroll jank).
- Cap concurrent shards (~400) to protect low-end devices; auto-reduce count when `prefers-reduced-motion` or on small viewports.

### 6. Mobile / perf guards
- Reduce shard count and skip perspective on `matchMedia('(max-width: 640px)')`.
- Respect `prefers-reduced-motion`: keep rename + cigarette art, drop shatter to a simple opacity flash and skip screen-shake.
- All new canvases sized with `devicePixelRatio` clamp at 2.

## Out of scope
- Score-share card layout (already implemented last turn) — only the tool title string inside it updates.
- Backend, analytics events, new routes.

## Technical notes
- Everything lives in `src/components/KnowYourSmokingSection.tsx` (the `Shooter` subcomponent) plus small copy edits in the files listed under §1.
- No new dependencies; canvas + Web Audio API only.
- No changes to `src/routes/try.tsx` layout or `AqlaAuthGate` public-route list — `/try/shoot` already works unauthenticated.
