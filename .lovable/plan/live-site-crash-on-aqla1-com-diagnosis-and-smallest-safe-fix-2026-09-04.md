# Live-site crash on aqla1.com: diagnosis and smallest safe fix

## What I reproduced

Mobile viewport (393x852, iPhone user agent), 10s after load:

- **Preview / dev (localhost:8080): healthy.** Homepage renders fully, no error boundary, no runtime exceptions (only a cosmetic React warning about `hreflang` vs `hrefLang`).
- **Published live site (https://aqla1.com): broken.** The page paints, then the app-wide error boundary takes over. The console fills with the same repeated exception until the tab becomes unresponsive.

So preview and live do **not** behave the same. This is a published-build problem, not a source-code bug.

## The exact exception

```
Error: Missing Supabase environment variable(s): SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY.
        Connect Supabase in Lovable Cloud.
    at createSupabaseClient (assets/index-BFLUxNHY.js)
    at Object.get            <- the lazy Proxy in the Supabase client module
    at ...React commit/effect frames
```

Source of the throw: `src/integrations/supabase/client.ts`. The exported `supabase` is a lazy `Proxy`; the first property access builds the client, and if `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` were not inlined at build time, it throws.

First toucher after hydration: the `useEffect` in `src/components/AqlaAuthGate.tsx` (`supabase.auth.onAuthStateChange(...)` / `getSession()`), which runs inside the root tree wrapped by `errorComponent` in `src/routes/__root.tsx`. That is exactly the "homepage for a moment, then error page" sequence in the screenshots — SSR HTML paints, hydration effect throws, root error boundary swaps in. It repeats because the boundary retry re-mounts the gate and re-throws.

Ruled out: `StudyInvitationOverlay`, analytics/`VisitTracker`, browser-API access, and hydration mismatch. None of them appear in the console on either environment, and the only error on live is the Supabase one.

## Root cause

The currently published bundle on aqla1.com (`index-BFLUxNHY.js`) was built without the `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` values baked in. Those variables **are** present in the project environment now, which is why preview is fine — the published artifact is a stale build from a moment when they were not injected.

## Smallest safe fix

1. **Republish the site.** A fresh publish rebuilds with the current environment and inlines the two Supabase variables, which alone clears the crash. Zero code change. Verify afterwards that the served bundle hash changes and the mobile load shows no console error.

2. **Optional hardening (only if you want it, one small change):** make `AqlaAuthGate` fail soft — wrap its Supabase effect so a client-construction failure logs and leaves the user in the signed-out state instead of throwing into the root error boundary. Public pages would then keep working even if a future build ships without the variables. This touches only `src/components/AqlaAuthGate.tsx` and does not change design, content, or behaviour when the client is healthy. It does not fix the current live build on its own — step 1 is still required.

## Recommendation

Do step 1 first and re-check the live site. Tell me if you also want step 2; I will not touch any code without your approval.
