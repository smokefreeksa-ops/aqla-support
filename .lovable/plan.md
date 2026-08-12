# Remove the gold frame around the crystal map panel

Remove the thin gold CSS border from the `.crystal-panel--map` panel so only the artwork/frame of the map itself is visible.

## What will change

- In `src/styles.css`:
  - Remove `border: 1px solid rgba(201, 168, 76, 0.35);` from `.crystal-panel--map`.
  - Keep the soft shadow and light glass background so the panel still lifts from the page.

## Verification

- Confirm the panel no longer shows a gold outline on the confirmation/details steps.
- Screenshot check on mobile and desktop widths.
