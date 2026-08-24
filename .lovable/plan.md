# Switch Google sign-in to your own AQLA Google client

Short answer: yes — and this is exactly the missing step. You are not "leaving Lovable"; you are only replacing the shared Google OAuth app (whose name and logo Google shows on the consent screen) with an AQLA-owned one. No application code, design, content or data changes.

## What you do in the screen you have open

1. Google Auth Platform → **Get started**
   - App name: `أقلع | Aqla`
   - Support email: an address on your domain
   - Audience: **External**, then **Publish app** (Production) so it is not stuck in Testing.
2. **Branding**
   - Upload the AQLA logo
   - App home page: `https://aqla1.com`
   - Privacy policy: `https://aqla1.com/privacy`
   - Terms: `https://aqla1.com/terms`
   - Authorised domains: `aqla1.com` (plus `lovable.app` if the callback host requires it)
3. **Data access** → add only: `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`
4. **Clients** → Create client → **Web application**
   - Authorised JavaScript origins: `https://aqla1.com`, `https://www.aqla1.com`
   - Authorised redirect URI: the Google callback URL shown in the app backend under Users → Authentication Settings → Sign in Methods → Google (copy it exactly)
5. Copy the **Client ID** and **Client Secret**.

## What I need from you

- The **Client ID** (safe to paste in chat)
- The **Client Secret** (I will open a secure form for it — do not paste it in chat)

Then I save them to the backend Google provider and Google shows "Continue to أقلع" with your logo instead of the Lovable name.

## What I do after that

- Save the credentials to the Google provider in the backend (configuration only).
- Run one real Google sign-in end to end on the live site and confirm: AQLA gate → Google account picker branded "أقلع | Aqla" → back into the dashboard, with no Lovable name or logo on any screen.
- Confirm email/password sign-in still works unchanged.

## Notes

- No code, design, content, functionality or data changes. Existing accounts, sessions and Google identities are preserved because the provider and identity email stay the same.
- Until Google verifies the consent screen it may show an "unverified app" notice; submitting for verification from the Verification centre removes it.
- Do the swap in a low-traffic window; I will test one sign-in immediately after saving.
