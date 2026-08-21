# White-label audit — configuration-only, zero application change

Scope: stop ordinary end users from seeing Lovable's name, logo, favicon, URL or OAuth identity. No code, design, content, feature, or data changes. Repository inspected read-only.

## What is already clean (verified, no action)

- Platform badge on the published site: already hidden in publish settings (`hide_badge: true`).
- Favicon, apple-touch icon and web manifest: point to AQLA assets (`/favicon.png`, `/site.webmanifest` with "أقلع | Aqla"). Nothing platform-branded.
- Header, dashboard nav, footer, structured data: AQLA logo and `aqla1.com` only.
- Email sending domain: `aqla1.com`, verified. Auth/transactional mail is sent from your own domain.
- Custom production domain: `www.aqla1.com` / `aqla1.com` active, so users need never see the `*.lovable.app` URL.

## The one real remaining exposure: Google's "Continue to Lovable" screen

Why users see it: that screen is rendered by Google, from the registration of the OAuth client used for sign-in. Today sign-in uses the platform's shared managed Google OAuth app, so Google shows that app's name and logo. Nothing in the AQLA app can rename or restyle it.

Fix is configuration-only, performed by you, outside the codebase:

1. Google Cloud Console (an AQLA-owned Google account) → OAuth consent screen
   - App name: `أقلع | Aqla`
   - Upload the AQLA logo; support email on your domain
   - Authorised domains: `aqla1.com` (add `lovable.app` only if the callback host requires it)
   - Scopes limited to `openid`, `userinfo.email`, `userinfo.profile`
   - Publish to Production (so it is not stuck in Testing)
2. Credentials → Create OAuth client ID → Web application
   - Authorised redirect URI: the Google callback URL shown in the backend Auth Settings under the Google provider
   - Authorised JavaScript origins: `https://aqla1.com`, `https://www.aqla1.com`
3. Backend Auth Settings → Sign in Methods → Google: paste the Client ID and Client Secret.

Result: Google shows "Continue to أقلع" with your logo. No application behaviour changes; existing accounts, sessions and Google identities are preserved because the underlying provider and identity email stay the same.

Risk note: while the consent screen is unverified, Google may show an "unverified app" warning. Submitting it for verification removes that. Do this in a low-traffic window and test one sign-in immediately after saving the credentials.

## MANUAL REVIEW REQUIRED — items that would need code changes (no action taken)

These are all pre-existing and I have not touched them. Listing them per the reporting rule:

1. `src/components/AqlaWelcomeGate.tsx` (lines ~118-125) — after probing the backend, if the native Google provider is not configured it falls back to the platform OAuth helper (`@/integrations/lovable`). That fallback path is what produces the platform-branded interstitial. Once step 3 above is done, the probe succeeds and the fallback stops being used, so no code change is required. Removing the fallback entirely would be a code change and needs your explicit approval. Currently user-visible: only while Google credentials are missing.
2. `src/routes/[.]lovable.oauth.consent.tsx` — the third-party app-authorisation consent page (only reached when an external client connects to the app's MCP/OAuth surface). It already substitutes "أقلع — Aqla" for any client name containing the vendor name. Not part of normal user sign-in. Currently user-visible: no, for ordinary users.
3. `src/integrations/lovable/index.ts` and `src/integrations/supabase/*` — auto-generated platform files containing the vendor name in imports/comments only. Never rendered. Must not be edited.
4. Internal route prefix `/lovable/email/*` and `src/lib/email/send.ts` — server-side email plumbing paths. Not shown to users; email itself is sent from `aqla1.com`. Renaming would be a functional code change — not recommended.
5. `src/components/AqlaAuthGate.tsx` — vendor hostnames appear only in preview-detection logic and comments. Not user-visible on production.
6. Preview/editor chrome inside the Lovable builder is platform-level and cannot be changed; it does not appear on `aqla1.com`.

## Technical summary

No files will be modified by this plan. The only actions are the three Google Cloud / backend auth configuration steps above, plus a single post-change sign-in test on `https://aqla1.com`.
