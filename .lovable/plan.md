# Remove the Lovable name and logo from Google sign-in

## What is actually happening

The "Continue to Lovable" screen with the Lovable logo is Google's own consent screen. It shows the name and logo of the **OAuth app registered with Google** — which today is the shared managed OAuth app provided by the hosting platform, not your project. Nothing in the AQLA codebase can rename or restyle that screen; Google renders it from the OAuth client's registration.

So the only real fix is to sign in with **your own Google OAuth client**, registered under your brand. Then the screen reads "Continue to aqla1.com" (or "أقلع") with your logo — no Lovable anywhere.

## Step 1 — Register AQLA's own Google OAuth client (you do this once)

In the Google Cloud Console for an AQLA-owned Google account:

1. OAuth consent screen: App name `أقلع | Aqla`, upload the AQLA logo, support email on your domain, authorized domains `aqla1.com` and `lovable.app`, home page and privacy links on aqla1.com.
2. Scopes: only `openid`, `userinfo.email`, `userinfo.profile`.
3. Credentials → Create OAuth client ID → Web application. Add the callback URL shown in the backend Auth Settings under the Google provider as an authorized redirect URI, and add `https://aqla1.com`, `https://www.aqla1.com` as authorized JavaScript origins.
4. Publish the consent screen (Production) so it is not stuck in "testing" mode.
5. Paste the Client ID and Client Secret into the Google provider in the backend Auth Settings (Users → Authentication Settings → Sign in Methods → Google).

Note: while the consent screen is unverified Google may show a warning; submitting it for verification with the AQLA logo removes that and gives the branded screen.

## Step 2 — Code change on my side

Switch the Google button in `src/components/AqlaWelcomeGate.tsx` from the platform helper `lovable.auth.signInWithOAuth("google", …)` to the backend's native `supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: window.location.origin } })`. This routes the user straight through your own client credentials, so no intermediate platform-branded consent page appears at all.

I will also:
- Keep the existing loading state, error toasts, and Arabic copy identical.
- Verify no other place still calls the platform OAuth helper.
- Delete the now-unused platform consent route `src/routes/[.]lovable.oauth.consent.tsx` (this is the second screen from your earlier screenshots), so the branded intermediate page can no longer render.

## Step 3 — Verify

- Run the sign-in flow in a browser and confirm the only screens are the AQLA gate → Google account picker ("Continue to أقلع") → back to AQLA dashboard.
- Confirm email/password and other sign-in paths still work.

## Technical notes

- Files touched: `src/components/AqlaWelcomeGate.tsx`, removal of `src/routes/[.]lovable.oauth.consent.tsx`. No database or schema changes.
- The generated `src/integrations/lovable/` folder stays untouched; it just stops being used for Google.
- Until Step 1 credentials are in place, Google sign-in will keep using the shared managed app, so the code change should land together with your credentials.
