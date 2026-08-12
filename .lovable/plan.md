# Rebuild the study panel as a thick, framed, tinted glass slab

Scope: the visual material of the study invitation panel only. Content, copy, buttons, language switch, details accordion, skip confirmation, launch transition and all behaviour stay exactly as they are.

## What changes visually

The panel moves from "colourless frosted crystal with segmented rim" to the reference construction:

1. **Thick mitred frame** — a distinct border element of constant width with 45-degree chamfered corner blocks, visibly deeper and brighter than the interior. The frame is its own layer, not an inset shadow on the body.
2. **Inner border line** — a thin bright hairline inset from the frame, drawing the inner rectangle seen in the reference.
3. **Tinted translucent body** — the interior takes a teal/emerald tint so the green environment reads *through* the glass. The `grayscale(1)` on the backdrop is removed; brightness is reduced so the body no longer reads white.
4. **Continuous rim light** — the segmented repeating-gradient rim is replaced by an even, slightly wider tube of light running the full perimeter including the chamfers.
5. **Corner starbursts** — four large 4-point crossed glints at the mitred corners, brighter and larger than the current small flares.
6. **Cloud striations** — a soft, low-contrast mineral/cloud texture layer inside the body plus a faint vertical light column behind the panel centre, kept well below text contrast thresholds.
7. **Floor reflection** — a short, blurred mirrored pool directly under the panel, replacing the current narrow white pool.

## What is removed

- `backdrop-filter: grayscale(1)` and the near-white radial body fill.
- The segmented `repeating-linear-gradient` rim in `.crystal-edge-light`.
- Redundant facet layers that fight the new frame (outer conic facet wedges are reduced to the frame area only).

## Files

- `src/styles.css` — rework the `.crystal-*` block (roughly lines 648-1156): new frame, inner line, tinted body, continuous rim, corner bursts, striations, reflection; delete superseded layers.
- `src/components/StudyInvitationOverlay.tsx` — add or rename only the decorative layer divs the new construction needs (frame, inner line, striations, reflection). No content edits.

## Guardrails

- Text contrast: all Arabic copy stays on a calm interior region; striations and glints never cross the headline or CTA at readable contrast.
- Light containment stays as previously agreed: glow does not spill into the deep Saudi-green background beyond the panel's immediate frame and the floor pool.
- Only standard `backdrop-filter` is written (no hand-written `-webkit-` twin).
- `prefers-reduced-motion` respected: static frame, no pulsing.
- Mobile: fewer layers, lighter blur, smaller corner bursts, frame width scaled down.

## Verification

Build, then capture a desktop element screenshot of the panel and a mobile-width check to compare against the reference.
