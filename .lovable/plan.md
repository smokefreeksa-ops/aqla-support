# Fix Aqla Social Link Preview

## Goal
Ensure shared links to the Aqla homepage display the current uploaded logo instead of an older cached preview.

## Changes
1. Update the homepage route metadata with its own title, description, Open Graph tags, and Twitter tags.
2. Move the homepage preview image ownership to the homepage leaf route so generic root metadata cannot override it.
3. Keep the preview image URL absolute and point it to a newly versioned preview asset using the current Aqla logo, avoiding the old cached URL.
4. Keep the existing header, footer, favicon, and in-app logo usage unchanged.
5. Verify the rendered homepage head contains the new preview URL and that the asset is reachable from the configured Aqla domain.

## Acceptance checks
- The homepage exposes exactly one effective `og:image` and one effective `twitter:image` for the new preview asset.
- The preview asset visibly contains the current Aqla logo.
- The homepage title and description remain bilingual/brand-appropriate.
- No unrelated routes or UI behavior are changed.
- Note: WhatsApp, LinkedIn, and X may retain their own previously fetched preview until their cache is refreshed.