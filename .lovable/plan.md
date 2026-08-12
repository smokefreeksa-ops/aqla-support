# Dark Saudi green behind the study invitation panel

## What changes

The first-visit study invitation screen currently sits on a bright/light green field (`.study-environment`: `#0a8f6b → #007a5a → #00523f → #012d23`). It will use the same deep, near-black Saudi green as the welcome gate and homepage instead.

New treatment for `.study-environment`:
- base `#020806`
- soft radial glow around `rgba(10,58,34,0.95)` at ~50% 40%, deepening through very dark green to near-black at the edges — identical values to `.aqla-green-field`

## Kept as-is

- The crystal/diamond panel material, facets, glints and rim light stay exactly as they are, with no glow bleeding into the background.
- All study copy, buttons, prize line, details accordion, RTL layout and behaviour unchanged.
- The faint waving-flag texture layer stays at its current low opacity.

## Technical notes

- `src/styles.css`: point `.study-environment` at the shared `.aqla-green-field` values (reuse the same gradient so gate, homepage and study screen read from one source).
- No changes to `src/components/StudyInvitationOverlay.tsx`.
- Verify with a desktop screenshot of the overlay.
