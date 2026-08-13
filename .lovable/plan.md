# Gold frame removal — confirm no action needed

## Current state

The CSS gold border has already been removed from `.crystal-panel--map` in `src/styles.css`. The class still applies to the confirmation/details step of the study overlay, but it now renders only with a soft glass background and shadow, with no gold outline.

## Decision

User chose to keep the current state as-is. No code changes are required.

## Verification

- `src/styles.css` no longer contains `border: 1px solid rgba(201, 168, 76, 0.35)` on `.crystal-panel--map`.
- Any gold frame visible on the invitation step is part of the baked `saudi-study-panel.png` artwork, not CSS.
