# Luminous Crystal Panel in a Deep Saudi-Green Environment

Redesign the study invitation overlay so it reads as: deep Saudi-green surroundings → soft emerald aura → brilliant crystal diamond → dark emerald Arabic typography → restrained gold accents.

## 1. Text colours (tokens)

Add four tokens and apply them in the overlay:

- `--study-emerald: #0b3a25` — main Arabic headline, CTA label
- `--study-forest: #2d5a45` — university line, details body text
- `--study-gold: #c9a84c` — "دراسة علمية" eyebrow, prize line, CTA background
- `--study-sage: #5a7a6a` — skip button, details toggle, secondary text

No white text remains on the crystal surface. The headline gets strong dark-emerald contrast.

## 2. Surrounding environment

Replace the washed-out white/grey scrim with a deep Saudi-green radial field, darkest at the edges and richer at the centre:

```text
radial-gradient(circle at 50% 48%,
  #0A6B53 0%, #005B45 28%, #003B2F 58%, #012D23 100%)
```

The waving flag stays but is dimmed and blended into this field so it no longer introduces a pale wash.

## 3. Emerald aura behind the diamond

A soft, diffused emerald glow sits immediately behind the panel so it reads as backlit — brightest at the crystal edges, fading out well before the screen edges. Emerald, not neon.

## 4. Remove the white washout

The existing broad white bloom (`crystal-shell` drop-shadows and `crystal-backlight`) is cut back substantially. White illumination stays concentrated on the crystal rim and inner facets only; the green background remains clearly visible at all times.

## 5. Keep the diamond bright

The panel stays very bright, translucent, frosted and reflective. Contrast comes from dark typography, not from darkening the glass. The glass picks up a subtle pale-green tint (`rgba(245,255,250,…)`) instead of neutral grey.

## 6. Crystal edges

Diamond geometry (clipped octagonal corners, layered inner borders, inner highlights, upper reflection streak) is preserved. Edge glow is retuned to a tight white rim plus a mint and emerald falloff, so the border reads bright against the dark green.

## 7. Gold treatment

CTA uses a restrained premium gold gradient (`#d8b753 → #c9a84c → #dfc26a`) with `#0b3a25` label text. No bright yellow.

## 8. Details accordion

Very light translucent emerald surface — `rgba(11,58,37,0.03)` on a `rgba(11,58,37,0.12)` border — so green type stays readable without breaking the crystal look. Chips and the contact link follow the same treatment.

## 9. Preserved

Modal behaviour, study copy, button actions, RTL, responsive layout, content hierarchy, and diamond geometry are unchanged.

## Technical notes

- `src/styles.css`: add the four study colour tokens; retune `.crystal-shell`, `.crystal-backlight`, `.crystal-panel`, `.crystal-edge-light` and the frost/highlight layers; add the green-environment and aura classes. Only standard `backdrop-filter` is written (no hand-written `-webkit-` twin).
- `src/components/StudyInvitationOverlay.tsx`: swap the scrim gradient, add the aura layer behind `crystal-panel`, and replace every `text-white*` / `border-white*` / `bg-white*` on content elements with the new emerald/forest/sage/gold values.
- Verify with a build and an element screenshot of the panel in the running preview.
