# Saudi Arabia map-shaped study panel

Yes, this is possible. The panel's shape is driven by one CSS variable (`--gem-cut`) that every crystal layer already follows, so switching from the mitred octagon to a Saudi Arabia silhouette is a shape swap, not a rebuild. All content, copy, buttons, language toggle, details accordion, skip confirmation and launch transition stay exactly as they are.

## What changes

- The panel outline becomes a stylised Saudi Arabia border: broad north-west edge, the Gulf indentation on the north-east, the tapered south-west toward Yemen, and the rounded southern coast.
- The frame, rim light, inner hairline, striations and floor reflection all follow the new outline automatically, so it reads as a map-shaped glass slab, not a rectangle with a map behind it.
- Corner starbursts move to natural map extremities (north-west, north-east, south) instead of the four old chamfers.

## Readability handling

A map outline is irregular, so text cannot use the full width. Inside the shape:

- Content sits in a centred safe column (roughly 62-70% of panel width) that stays fully inside the silhouette at every line.
- Logo and eyebrow sit in the wider northern area; the CTA buttons sit in the mid-body where the shape is widest; the details accordion keeps its own scroll region inside the safe column.
- The panel gets slightly more height and inner padding so nothing crowds the diagonal edges.

## Mobile

Below ~640px the silhouette is simplified (fewer vertices, softer coast) and the safe column widens; if the shape ever squeezes the Arabic copy too hard at very small widths, the panel falls back to the current rounded slab so the study text is never clipped.

## Technical notes

- `src/styles.css`: replace the `--gem-cut` polygon with a Saudi outline polygon (percentage coordinates so it scales), add a `--gem-cut-mobile` variant, adjust `.crystal-panel` padding and content-safe width, reposition `.crystal-flares` anchor points.
- `src/components/StudyInvitationOverlay.tsx`: wrap the existing content in a safe-area container div only; no copy, links, state or behaviour edits.
- Verify with a desktop and a mobile-width screenshot of the overlay, confirming no Arabic text touches the outline.
