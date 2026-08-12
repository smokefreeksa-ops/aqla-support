# Flawless colourless diamond panel — study invitation modal only

Yes, this is doable in CSS. Scope is the centred study invitation panel only — nothing else on the site changes.

## Exactly where

- `src/components/StudyInvitationOverlay.tsx` — the panel markup (facet layers, content hierarchy, accordion). Nothing else in the app uses these classes.
- `src/styles.css` — the `.crystal-*` block (lines ~559–741) and the `.study-environment` scrim.

This overlay renders on top of the existing site at app load (except `/quit-plan/`), so the surrounding page stays exactly as it is; only the modal surface and its dim backdrop change.

## Panel material — colourless D-flawless diamond

Replace the current green-tinted translucent glass with a neutral, colourless crystal:

- Body: near-neutral white/silver gradient at low opacity, no green or blue tint, `backdrop-filter: blur(...) saturate(...) brightness(...)` tuned so the panel reads bright but not milky.
- Facets: a set of `pointer-events: none` layers using hard-stop `linear-gradient` and `conic-gradient` wedges to build a faceted crown across the entire surface — deeper, tighter facets around the perimeter, calmer wedges in the centre so text stays readable.
- Bevelled perimeter: layered inset rings (existing `::before` / `::after` plus one more) with crisp white hairlines to simulate polished bevel steps.
- Dispersion: 3–5 very small, low-opacity rainbow flashes placed only on facet intersections near the perimeter — restrained, not a rainbow wash.
- Specular stars: 3–4 tiny 4-point star highlights (thin crossed gradients) at selected facet junctions.
- Rim: bright continuous white rim light with brilliance concentrated at the bevel edges.
- Under-panel light: a soft, tight projected light directly beneath the panel only (short spread, no wide halo).

Removed/avoided: green tint, milky frost, heavy blur haze, ordinary glassmorphism.

## Shape

Keep a rectangular gemstone silhouette: moderately rounded corners with cut bevels (refined `clip-path`), heavier faceting at the perimeter, solid single-slab feel.

## Size and composition

- Width ~48% of desktop viewport (clamped, e.g. `min(52vw, 640px)`), vertically centred, `max-h-[92%]`.
- Mobile: falls back to near-full width with reduced facet count and lighter blur for performance.
- Backdrop: the existing full-screen layer becomes a dimmed, blurred scrim so the panel clearly reads as a modal over the site. (Say the word if you want the current strong Saudi-green field kept instead of a neutral dim.)

## Content (same copy, cleaner hierarchy)

Top: English language control, Aqla logo, `دراسة علمية`, `جامعة الملك عبدالعزيز`.
Headline: `شارك برأيك حول دور منتجات النيكوتين الخالية من التبغ في الحد من أضرار التدخين`.
Incentive: `شارك في الاستبيان وادخل السحب للفوز بـ ٥٠٠ ريال سعودي`.
CTA: `شارك في الدراسة` — deep Saudi-green gemstone fill with a thin gold edge.
Secondary: `تخطي`.
Accordion: `تفاصيل الدراسة` collapsed by default, single row + chevron (already the behaviour; only styling is refreshed).

Text colours: near-black Saudi green for primary, charcoal for secondary, restrained gold for separators. No white text on the crystal.

## Behaviour preserved

RTL, language switch, dismissal/session storage, ResearchBanner, keyboard/Escape, reduced-motion, and the `/quit-plan/` suppression all stay unchanged.

## Verification

Build, then capture a desktop element screenshot of the panel and a mobile-width screenshot to confirm brightness, facet realism, readability and modal proportions.
