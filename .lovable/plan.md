# Diamond Panel Text Color Update

## Goal
Improve readability and premium feel of the study invitation diamond panel by switching from low-contrast white/gold text to a high-contrast Saudi emerald + gold palette.

## Changes
1. **Typography colors in `src/components/StudyInvitationOverlay.tsx`**
   - Title / headings: deep emerald `#0b3a25`
   - Body / university / details text: softer forest green `#2d5a45`
   - Prize line / amount / primary CTA button background: warm gold `#c9a84c`
   - Primary CTA button text: deep emerald `#0b3a25` for contrast
   - Skip / secondary actions: muted sage green `#5a7a6a`
   - Links and accents: gold `#c9a84c`

2. **Details panel surface**
   - Adjust the details accordion background/border so green text remains readable (likely a very light emerald tint `bg-[#0b3a25]/[0.03]` with a soft emerald border).

3. **Verification**
   - Build passes.
   - Visual check that all text is legible against the bright crystal panel.

## Out of scope
- No changes to the diamond shape, sparkle effects, or modal behavior.
- No changes to the waving flag background or scrim.
