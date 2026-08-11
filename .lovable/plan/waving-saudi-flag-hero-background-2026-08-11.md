# Waving Saudi Flag Hero Background

## Goal
Replace the twinkling star field in the homepage hero section with a full-viewport, continually waving Saudi flag rendered as an animated SVG.

## Scope
- **Hero section only** (`src/components/imported/HeroSection.tsx`).
- **Full viewport background** behind the hero panel and text.
- **CSS/SVG filter wave** implementation (lightweight, vector-based).
- Leave the study-invitation galaxy overlay unchanged.

## Implementation

### 1. Create `src/components/SaudiFlagWave.tsx`
- Build an accurate Saudi flag in SVG:
  - Field: Saudi green (`#006C35`, ratio 2:3).
  - Shahada (لا إله إلا الله محمد رسول الله) in white Thuluth-style path/text.
  - White sword beneath the text.
- Wrap the flag in an SVG filter for a gentle waving motion:
  - `feTurbulence` + `feDisplacementMap`.
  - Animate `baseFrequency` with SMIL `<animate>` for a continuous, slow ripple.
  - Keep the wave subtle so the flag remains recognizable and respectful.
- Position the SVG as a fixed/absolute full-viewport layer behind hero content (`z-0`).
- Add `prefers-reduced-motion` media query that disables the wave animation and shows a static flag.

### 2. Update `src/components/imported/HeroSection.tsx`
- Remove `<StarField count={96} />`.
- Insert `<SaudiFlagWave />` as the bottom-most background layer.
- Add a dark gradient scrim/overlay on top of the flag so white hero text remains readable and WCAG-compliant.
- Preserve the existing green bottom fade so the transition into the rest of the page stays seamless.

### 3. Styling & contrast
- Ensure the hero headline, subtitle, and CTAs keep high contrast against the waving flag.
- Use a semi-transparent dark panel (`rgba(5,9,10,0.55)`) and additional vignette/overlay on the flag itself.
- Verify no text overlaps the sword or shahada in an awkward way at common viewport sizes.

### 4. Cleanup
- Remove the unused `StarField` import from `HeroSection.tsx`.
- Keep `StarField.tsx` in the repo in case it is reused elsewhere.

### 5. Verification
- Build passes and no hydration errors.
- Visual check in preview: flag waves continuously, text readable, no layout shift.
- Confirm reduced-motion users see a static flag.

## Notes
- The Saudi flag contains the Islamic shahada; the wave animation will be kept subtle and dignified to avoid distorting the religious text excessively.
- No new npm dependencies are needed — pure SVG/SMIL/CSS.
