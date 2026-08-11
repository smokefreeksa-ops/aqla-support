# Diamond crystal panel for the study invitation

Yes, this is possible. The whole effect is pure CSS, so it can be applied to the study invitation modal shell without touching any of the content inside (logo, eyebrow, title, prize line, buttons, details section all stay exactly as they are).

## What changes

- The study modal currently uses a plain rounded card with a soft green glass background and a gold hairline. It becomes a faceted crystal slab: cut diamond corners, double refractive inner edges, internal facet highlights, frosted imperfections, micro texture, an outer turquoise bloom, and four very bright sparkle points at the corners.
- Content markup and behaviour (language switch, participate, skip, details accordion, dismissal logic) are untouched.

## How it will be built

- Add a `crystal-*` style block to `src/styles.css` based on the provided CSS, keeping the bright-highlight / dark-transparent contrast as recommended (no uniform glow).
- Wrap the dialog in `src/components/StudyInvitationOverlay.tsx` with the layer structure:
  `crystal-shell` > `crystal-backlight` + four `corner-flare` elements + `crystal-panel` > `crystal-edge-light`, `crystal-inner-highlight`, `glass-frost`, `glass-noise`, then the existing content.
- The dialog's current inline background, border, border-radius and box-shadow are removed so the crystal layers are the only surface; the mount transform/fade-in and focus ring stay.

## Adjustments needed for this app

- Fixed sizing (`min(1135px, 67vw)` wide, `755px` min-height) is too large for the 520px modal and would break on phones. Sizing stays responsive: current max-width and `max-h-[92%]`, with the crystal geometry scaling to it. Corner flares get slightly smaller on mobile.
- `clip-path` replaces `border-radius`, so the scrolling details region keeps its own rounding and stays inside the cut shape.
- Only the standard `backdrop-filter` is written (the build adds vendor prefixes; hand-writing `-webkit-` breaks it in Chrome on the published site).
- `prefers-reduced-motion` is respected: static crystal, no animated flare pulsing.

## Scope

Panel surface only, in the study invitation overlay. No changes to the top red research banner, hero, or any other page.
