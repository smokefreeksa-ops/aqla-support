# Plan: Remove Lovable branding from the sign-in/authenticated experience

## Goal
Ensure end users never see a Lovable logo or Lovable brand mark during sign-in or while signed in. The app must feel fully owned by Aqla (أقلع) on its own domain.

## Current state observed
- The app uses the Lovable Cloud auth wrapper (`src/integrations/lovable/index.ts`) to sign users in via Google.
- The welcome/sign-in screen (`AqlaWelcomeGate.tsx`) currently calls `lovable.auth.signInWithOAuth("google")`.
- Aqla favicon (`public/favicon.png`) and Aqla logo assets are already in place.
- There is no PWA web-app manifest, so browsers/preview may fall back to a generic/platform icon.
- The Lovable OAuth consent route (`src/routes/[.]lovable.oauth.consent.tsx`) exists but is normally shown only when a Lovable app requests authorization.

## Proposed changes

1. **Switch Google sign-in to native Supabase OAuth**
   - Replace `lovable.auth.signInWithOAuth("google")` in `AqlaWelcomeGate.tsx` with `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })`.
   - Preserve the existing post-login redirect saving logic.
   - Keep the Lovable integration file untouched for any Lovable-internal flows that still need it, but remove it from the user-facing sign-in path.

2. **Add a proper PWA web manifest with Aqla branding**
   - Create `public/site.webmanifest` (or `public/manifest.json`) pointing to `/aqla-logo.png` for icons, name "أقلع | Aqla", theme color `#006C35`, and background color `#0b3a25`.
   - Reference the manifest in `src/routes/__root.tsx` head links so mobile browsers and "Add to Home Screen" use the Aqla icon instead of any fallback.

3. **Audit the OAuth consent route for platform branding**
   - Review `src/routes/[.]lovable.oauth.consent.tsx` and ensure it uses only Aqla language ("Aqla — أقلع") and no Lovable logo or Lovable-specific wording.
   - This route is required by Lovable MCP/OAuth, but its visible copy should be Aqla-branded.

4. **Confirm no Lovable badge/watermark is injected in the DOM**
   - Search for any `iframe`, `.lovable-*`, or known Lovable preview CSS classes and add a defensive CSS rule in `src/styles.css` only if a Lovable DOM watermark is found and can be safely hidden without breaking the app.
   - Note: browser-chrome branding seen in the Lovable builder preview (e.g., the Lovable extension icon) is outside the app and cannot be removed from the builder, but it is not visible to visitors on the published `aqla1.com` domain.

5. **Verification**
   - Test the sign-in button in the preview to confirm the redirect now lands on the native Google OAuth screen (no Lovable logo).
   - Inspect the browser tab icon and mobile "Add to Home Screen" prompt to confirm it uses the Aqla logo.
   - Run the existing test suite and build to ensure no auth flow regressions.

## Out of scope
- Removing the Lovable Cloud auth integration file itself (`src/integrations/lovable/index.ts`) — it is auto-generated and may be needed by the platform; only its user-facing usage will be replaced.
- Changing backend auth providers or Lovable Cloud configuration; the Supabase Google provider is already configured.
