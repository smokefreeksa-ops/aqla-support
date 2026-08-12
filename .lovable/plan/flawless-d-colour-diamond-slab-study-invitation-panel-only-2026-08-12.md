# Flawless D-colour diamond slab — study invitation panel only

Scope: the centred study invitation modal only. The website behind it is untouched.

## Files

- `src/styles.css` — rewrite the `.crystal-*` block (lines ~548–741). This block is used only by the study overlay.
- `src/components/StudyInvitationOverlay.tsx` — add the extra facet/flare layer divs inside `.crystal-panel` and adjust panel width. No content, copy, or behaviour changes.

## Material: cut diamond, not glass

Transparency and `backdrop-filter` become secondary. The diamond comes from stacked, independently clipped layers inside the panel:

1. **Crystal body** — near-neutral, very bright colourless base (no green/blue/grey tint), with `backdrop-filter: blur(...) saturate(...) brightness(1.25)` only as an enhancement.
2. **Perimeter facet ring** — deep triangular/polygonal facets built from hard-stop `conic-gradient` and `linear-gradient` wedges, brighter and more complex than the centre.
3. **Multi-step bevels** — 3 nested clipped rings with crisp white hairlines, simulating polished bevel steps.
4. **Centre facet field** — large, calm crystalline planes with crisp boundaries (hard colour stops, not blurred gradients) so text stays readable while the centre still reads as gemstone, never as a flat white card.
5. **Specular sweeps** — several high-luminance white reflection bands crossing selected facets so parts of the slab approach pure white.
6. **Corner brilliance** — concentrated radial + star highlights at the four corners, jewellery-studio intensity.
7. **Star flares** — 4–6 tiny 4-point crossed-gradient glints at chosen facet intersections.
8. **Dispersion** — 4–6 very small, low-opacity spectral flashes only at a few perimeter facet intersections. No wide rainbow washes.

`mix-blend-mode: plus-lighter` is applied only to the strongest ~20–30% of layers (corner glints, star flares, the brightest specular sweeps) so the panel flashes without flattening to white.

Explicitly avoided: green/blue tint, grey glass, milky frost, opaque white plastic, ordinary glassmorphism, dark fill.

## Shape and size

Rectangular gemstone silhouette with moderately rounded corners and cut bevels via refined `clip-path`. Desktop width `clamp(420px, 50vw, 680px)`, vertically centred, `max-h-[92%]`. Mobile falls back to near-full width with fewer facet layers and lighter blur for performance.

## Light containment

Every facet, flare, sweep and dispersion layer is `pointer-events: none`, `overflow: hidden`, and inherits the panel `clip-path` — nothing spills past the gemstone edge. A single narrow, controlled reflected-light pool sits directly beneath the panel (short spread, no halo).

## Content and typography

Copy, order and behaviour stay exactly as they are: English switch, Aqla logo, دراسة علمية, جامعة الملك عبدالعزيز, headline, incentive line, شارك في الدراسة, تخطي, and تفاصيل الدراسة collapsed with a chevron.

- Primary Arabic text: near-black Saudi green (`#0b3a25` deepened where needed)
- Secondary copy: near-black charcoal
- Gold used only for separators and small highlights
- CTA: deep Saudi-green gemstone fill with a thin gold edge
- No white body text on the crystal

## Preserved behaviour

RTL, language switching, session-storage dismissal, ResearchBanner, Escape/keyboard, reduced-motion, `/quit-plan/` suppression, and all surrounding sections are unchanged.

## Verification

Build, then capture a desktop screenshot of the panel (and a mobile-width check) and show it for comparison against the reference.
