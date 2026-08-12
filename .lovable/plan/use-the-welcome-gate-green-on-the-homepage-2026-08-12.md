# Use the Welcome Gate green on the homepage

## What I understand

The attached screenshot is the AQla welcome/login gate. Its background is a deep, almost-black Saudi green: a near-black base with a soft radial green glow behind the centre of the card, fading to very dark green at the edges. You want that exact green environment used on the main homepage (the long page with the hero, pathway cards, Dr. Malik, modules, tools, impact, CTA, footer) and on the study invitation overlay/banner area shown in the same flow.

Today the homepage uses a different, lighter green: a top-to-bottom gradient `#0b3a25 → #0e4a30 → #072018`. That is what makes it look flatter and lighter than the gate.

## What I will do

1. Replace the homepage background with the welcome-gate treatment:
   - base colour `#020806`
   - fixed radial green field: soft `#0a3a22`-level glow at ~50% 35%, deepening through very dark green to near-black at the edges
   - identical dark scrim layering so text stays readable, matching the gate exactly.
2. Keep the same background fixed while scrolling so all sections share one continuous environment (no section-to-section colour jumps).
3. Re-tune only what is required for contrast on the darker field:
   - section card surfaces move to the gate's translucent dark-green panel style
   - ivory text `#F4F0E1` and gold `#C9A84C` accents stay as they are on the gate
   - hover/border tones adjusted so cards remain visible against the darker base.
4. Leave untouched: all content, wording, links, the red research banner, the Poster Studio theme, and the diamond/crystal study invitation panel itself (only the green field behind it is aligned to the same values).

## Technical notes

- Homepage wrapper in `src/routes/index.tsx` (currently an inline linear-gradient) switches to the gate's layered background, moved into a reusable class in `src/styles.css` (e.g. `.aqla-green-field`) so the gate and homepage read from one source.
- `src/components/AqlaWelcomeGate.tsx` gets refactored to use the same class instead of its inline values, keeping its current look byte-for-byte in appearance.
- Section components that assume a lighter green (`HeroSection`, pathway cards in `index.tsx`, `ImpactSection`, `KnowYourSmokingSection`, `CTASection`) get surface/border token adjustments only — no layout or copy changes.
- The study environment radial (`.study-environment`) keeps its vivid green as previously approved; no glow bleed changes.

## Out of scope

No new sections, no content edits, no changes to the crystal panel material.
