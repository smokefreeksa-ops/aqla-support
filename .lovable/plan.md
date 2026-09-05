# Why sign-in emails are not arriving — audit and smallest safe fix

Read-only audit of the live production backend and the public sign-in screen. No code was changed.

## What the sign-in screen actually does

`src/components/AqlaWelcomeGate.tsx` offers three paths:

- **Google** — native Google sign-in, with a fallback to the hosting platform's helper if no Google client is configured. No email involved.
- **Email** — sends a magic link (`signInWithOtp` with `emailRedirectTo` back to the site).
- **Phone** — sends an SMS code (`signInWithOtp` with a phone number).

## What the live data shows

- 24 accounts total: 22 created through Google, 3 through email. **Zero phone identities, ever.**
- Newest account: 21 Aug 2026. **No new account in the last 7 days**, even though people report trying.
- The branded mail system on `notify.aqla1.com` is verified and healthy, but **no authentication email has ever gone through it** — the only records in the send log are quit-plan emails (last one 14 Aug) and one bounce.
- Authentication emails are therefore still being sent by the **built-in platform sender**, not from `aqla1.com`, and not through the project's own verified mail domain.

## The concrete causes, separated by method

1. **Email (magic link) — the real problem.** Because branded auth emails were never set up, sign-in links go out through the shared built-in sender. That sender has a very low hourly cap (a handful of messages per hour for the whole project) and sends from a generic address, so messages are throttled away or filtered as spam by Gmail — which is what nearly every user here is on. Consistent with this: the verified `aqla1.com` mail domain has sent 0 emails in 7 days while users were trying.
2. **Phone (SMS) — not working at all and cannot work today.** No SMS provider is connected to the project and no phone account has ever been created. Every phone attempt fails; the screen shows a generic "try again" style message rather than telling the user SMS is unavailable.
3. **Google — unaffected by email.** It is the only path that has actually produced accounts. Its known issue is cosmetic branding on Google's own consent screen, which is separate from this report.

## Smallest safe fix (production)

Step 1 — Move authentication emails onto `notify.aqla1.com`
- Set up branded authentication email templates so sign-in links, confirmations and password resets are sent from your own verified domain through the project's own mail queue (which is already healthy).
- Style the templates to match Aqla (Arabic first, RTL, Aqla logo and green/gold palette).
- Effect: deliverability to Gmail improves substantially, mail comes from Aqla, and every send becomes visible in the email log so we can prove delivery.

Step 2 — Raise the hourly authentication-email limit
- The current cap is the platform default and is far too low for real traffic. Raise it once sending is on the verified domain.

Step 3 — Verify end to end
- Trigger one real magic-link sign-in on the live site, confirm the send is recorded as sent, and confirm the link signs the user in.

Step 4 — Honest handling of the phone option (small, contained)
- Either hide the phone tab until an SMS provider is connected, or make its failure message state plainly that SMS is not yet available and point to Google/email.
- This is the only change that touches the sign-in screen; it changes no layout, colours or copy elsewhere.

## Explicitly out of scope

- No move to Cognito/AWS or any other authentication system.
- No change to Google sign-in behaviour.
- No change to app design, content, routing or data.

## Technical notes

- Branded auth mail is scaffolded onto the existing verified domain and existing email queue; no new provider, no new secret, no DNS change.
- The old direct third-party path in `src/lib/notifications.server.ts` is for internal admin notices only and is untouched by this plan.
- Files potentially touched: newly generated auth email templates and their route, plus optionally `src/components/AqlaWelcomeGate.tsx` for step 4.
