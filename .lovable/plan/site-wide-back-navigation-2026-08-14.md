# Site-wide Back Navigation

Add one consistent, professional "return" control so users never feel stuck after clicking into a page.

## Behaviour

- Appears on every route **except** the homepage (`/` and `/en`) and full-screen overlays.
- Goes back in in-app history when it exists; otherwise falls back to the section root (e.g. an article returns to `/articles`, a dashboard sub-page returns to `/dashboard`), and to the homepage as a last resort. Never exits the site.
- Bilingual label following the active language: "العودة" / "Back", with the arrow mirrored correctly in RTL.

## Placement

- Rendered once in the shared layout, pinned just under the header at the start of the content area, so it is in the same spot on every page.
- On small screens it stays compact (arrow + short label) and does not overlap sticky banners.

## Existing pages

- Reuses the existing `BackButton` design already used on About/Impact/FAQ — same look, no redesign.
- Pages that already render their own back control keep it; the shared one is suppressed there to avoid duplicates.

## Technical notes

- Extend `src/components/BackButton.tsx` with an auto-resolved fallback (route-path based parent lookup) rather than a hardcoded `fallback` on every page.
- Add a `GlobalBackBar` in `src/routes/__root.tsx` that reads the current path, skips the homepage/overlay routes and pages already using `SimpleContentPage`/`BackButton`.
- Keep the existing 404 and error-boundary back buttons untouched.
- No backend or data changes.
