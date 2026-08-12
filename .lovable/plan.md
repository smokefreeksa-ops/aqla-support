# Diamond realism pass — material only

Scope: the crystal layers of the study invitation panel. No changes to content, copy, behaviour, dimensions, or overall brightness/opacity.

## Files

- `src/styles.css` — the `.crystal-*` block (lines ~585–1020).
- `src/components/StudyInvitationOverlay.tsx` — only if an extra facet/glint layer div is needed; no content edits.

## Changes

1. **Centre faceting** — replace the smooth white centre with large crisp triangular/polygonal facets built from hard-stop `linear-gradient`/`conic-gradient` planes at very low contrast (roughly 2–5% luminance steps) so text stays fully readable.
2. **Precision-cut perimeter** — rework the outer 15–20% into deeper, overlapping triangular and trapezoidal facets with crisp boundaries, replacing the current uniform illuminated-glass edge.
3. **Optical depth** — add 3–4 overlapping white/silver internal reflection planes at differing angles and intensities to read as light travelling through a thick solid slab. No added blur or opacity.
4. **Facet-shaped highlights** — remove long soft glowing streaks; every bright reflection terminates on a polygon boundary via `clip-path` or hard gradient stops.
5. **Star glints** — 3–5 tiny razor-sharp four-point crossed-gradient glints at facet intersections, mostly around the perimeter.
6. **Dispersion** — 3–5 very small red/orange/yellow/blue flashes at edge facets only, low opacity, no tinting of the body.
7. **Neutrality** — neutrality comes from `backdrop-filter: grayscale(...)` on the panel body only. No `filter: grayscale(...)` on the panel or on any facet/glint/dispersion layer, so the spectral flashes stay visible.

Brightness, white opacity, blur radius and glow spread stay at current values; realism comes from geometry and crisp reflections only.

## Guardrails

- No large continuous white bands or streaks crossing the panel; every high-intensity reflection is bounded by a single facet polygon.
- All facet, glint, dispersion and reflection layers are clipped strictly inside the gemstone silhouette — no spill outside the panel.
- The centre stays transparent/crystalline, never opaque or milky; faceting is subtle at the centre and strengthens progressively toward the outer 15–20%.
- Panel size, content positioning, CTA, typography, overall brightness, opacity and behaviour are unchanged.

## Verification

Build, then capture a desktop screenshot of the panel and a mobile-width check to compare against the diamond reference.
