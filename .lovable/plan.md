# Contain crystal glow and keep the Saudi-green background untouched

## Goal
Make the deep Saudi-green background behind the study invitation panel remain completely untouched, vivid and green. The crystal panel can keep its internal brilliance, rim light and refraction, but none of its glow or white haze should extend outward into the green field.

## Current issues to fix

- `.study-aura` spreads `-110px -120px` with `blur(48px)`, creating a large green/white halo that bleeds into the surrounding background.
- `.crystal-backlight` spreads `-18px -20px` with `blur(22px)`, adding another outward glow.
- `.crystal-shell` uses `drop-shadow` filters that project white and emerald light outside the panel.
- `.crystal-panel` has an exterior `box-shadow` (`0 0 14px rgba(0, 190, 118, 0.22)`) that leaks into the background.
- The panel body uses `rgba(245, 255, 250, 0.24)` etc. — translucent, but combined with the outward glows it currently reads as a hazy white card.

## What will change

### 1. Make the background super green and untouched
- Strengthen `.study-environment` saturation and contrast so it reads as a rich, deep Saudi green.
- Keep the flag texture only as a very faint under-layer (already at 14% opacity + soft-light).
- Remove the green-edge vignette if it dulls the green; otherwise keep it very subtle.

### 2. Remove outward glow entirely
- Delete or neutralise `.study-aura` so it no longer extends past the panel.
- Delete or neutralise `.crystal-backlight` so there is no exterior backlight.
- Remove the `drop-shadow` filters from `.crystal-shell`.
- Remove the exterior `box-shadow` entries from `.crystal-panel`, keeping only inset shadows (inside the glass).

### 3. Keep the crystal bright and diamond-like, but contained
- Keep the clipped octagonal geometry, inset facet lines (`::before`, `::after`), edge-light, inner-highlight, frost and noise layers.
- Make the panel body more translucent so the green environment visibly shows through the glass.
- Keep white/light values only for:
  - the thin rim highlight
  - internal facet lines
  - internal reflection streaks
  - subtle inner frost
- Ensure all bright layers are `pointer-events: none` and sit inside the panel boundary.

### 4. Preserve everything else
- All study copy, links, buttons, modal behaviour, RTL, responsive layout, and `ResearchBanner` behaviour stay unchanged.
- Content colours remain deep emerald (`#0b3a25`) for headings, forest (`#2d5a45`) for body, gold (`#c9a84c`) for accents, sage (`#5a7a6a`) for secondary actions.

## Verification
- Build the project.
- Capture a desktop screenshot of the study invitation overlay.
- Confirm the background is a strong, saturated Saudi green with no white/green halo around the panel.
- Confirm the panel still reads as a bright crystal/diamond slab with internal rim light and refraction.

## Files to edit
- `src/styles.css` — `.study-environment`, `.study-aura`, `.crystal-backlight`, `.crystal-shell`, `.crystal-panel`, related highlight/frost/noise layers.
- `src/components/StudyInvitationOverlay.tsx` — only if a layer needs to be removed or reordered; no content or behaviour changes.
