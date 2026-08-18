# Aqla — Migration Audit (read-only inventory)

No code or configuration was changed. This is an inventory plus a recommended parallel-migration sequence for moving to GitHub + Next.js + TypeScript + Tailwind + existing Supabase + AWS.

## 1. Lovable-specific packages and APIs in use

| Package / API | Purpose | Migration verdict |
|---|---|---|
| `@lovable.dev/cloud-auth-js` | OAuth broker wrapper (`src/integrations/lovable/index.ts`) that returns tokens and calls `supabase.auth.setSession` | Replace with native `supabase.auth.signInWithOAuth` once providers are configured directly in Supabase Auth |
| `@lovable.dev/email-js` (`sendLovableEmail`) | Actual email delivery in the queue processor | Replace with AWS SES (SDK v3) |
| `@lovable.dev/webhooks-js` (`verifyWebhookRequest`) | Signature verification on the suppression webhook | Replace with SES/SNS signature verification |
| `@lovable.dev/mcp-js` + Vite plugin | MCP server, OAuth-protected-resource metadata, 3 auto-generated routes | Optional feature; port with the framework-agnostic MCP SDK or drop for v1 |
| `@lovable.dev/vite-tanstack-config` | Build config (Vite + Cloudflare + tagger) | Dropped entirely with Next.js |
| Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`, `LOVABLE_API_KEY`) | Assistant/chat completions in `src/lib/assistant.functions.ts` | Replace with a direct OpenAI (or Bedrock) call; `OPENAI_API_KEY` is already used by the voice assistant, so one provider path is enough |
| Lovable asset CDN (`*.asset.json` → `/__l5e/assets-v1/...`) | `aqla-bg.mp4` (7 MB), `saudi-crystal-map.png`, `saudi-study-panel.png` | Must be downloaded and re-hosted (S3 + CloudFront) before cutover |
| Lovable Cloud DB tooling / `supabase/config.toml` | Managed Supabase provisioning | Take direct ownership of the Supabase project (or migrate to self-managed) |

## 2. Files that depend on Lovable APIs

- `src/integrations/lovable/index.ts` — OAuth broker
- `src/start.ts` — Lovable path bypass in error middleware
- `src/routes/lovable/email/queue/process.ts`, `.../transactional/send.ts`, `.../transactional/preview.ts`, `.../suppression.ts`
- `src/lib/email/send.ts` — client posts to `/lovable/email/transactional/send`
- `src/routes/[.]lovable.oauth.consent.tsx`
- `src/routes/mcp.ts`, `src/routes/[.mcp]/list-tools.ts`, `src/routes/[.mcp]/invoke-tool/$tool.ts`, `src/routes/[.well-known]/oauth-protected-resource.ts`, `src/lib/mcp/*`
- `src/lib/assistant.functions.ts` — AI gateway
- `src/components/AqlaAuthGate.tsx`, `src/components/AqlaWelcomeGate.tsx` — reference Lovable auth/paths
- `vite.config.ts`, `wrangler.jsonc`, `src/server.ts` — Cloudflare Workers runtime wrapper

## 3. Supabase integration points

- Generated clients: `src/integrations/supabase/client.ts` (browser), `client.server.ts` (service role), `auth-middleware.ts` (`requireSupabaseAuth`), `auth-attacher.ts` (bearer attach in `src/start.ts`), `types.ts` (generated DB types).
- 22 `createServerFn` modules under `src/lib/*.functions.ts`; 12 of them use `requireSupabaseAuth`.
- Server-only helpers: `_authz.server.ts`, `clinical/clinical-plan.server.ts`, `notifications.server.ts`, `quit-question-bank.server.ts`.
- Database: ~30 RPCs (analytics dashboards, public stats, leaderboards, certificate verification, `has_role`/`is_admin_user`), triggers for `updated_at`, immutability trigger on `quit_plan_versions`, role table `user_roles` with `app_role` enum, RLS across public tables.
- Storage buckets: `guidelines` (private), `share-images` (public) — no direct `storage.from()` calls found in `src/`, so usage is likely server-side/manual; confirm before decommissioning.
- No realtime channels in use.

## 4. Email / follow-up implementation

- Queueing is Postgres-native: `pgmq` queues `auth_emails` and `transactional_emails`, wrapped by `enqueue_email`, `read_email_batch`, `delete_email`, `move_to_dlq`.
- `email_queue_wake` trigger + `email_queue_dispatch` pg_cron job (`process-email-queue`, every 5s) call `net.http_post` to a hardcoded `project--<id>.lovable.app/lovable/email/queue/process` URL with a vault-stored service-role key.
- `process.ts` reads batches and delivers via `sendLovableEmail`; backoff state in `email_send_state`; suppression list fed by a Lovable-signed webhook.
- Templates: React Email components in `src/lib/email-templates/` (`welcome`, `academy-certificate`, `session-reminder`, `study-thanks`) via `registry.ts`.
- Internal admin notifications: `src/lib/notifications.server.ts` with `notification_settings` / `notification_log` and a safe "pending_provider_setup" fallback.
- Clinical plan emails: `clinical-plan.server.ts` (`resendClinicalPlanEmail`) — suppressed for `safety_hold` plans.
- Secrets in play: `EMAIL_FROM_ADDRESS`, `EMAIL_PROVIDER_API_KEY`, plus a vault secret `email_queue_service_role_key` (values not inspected).

## 5. Server functions and background jobs

- 22 `createServerFn` modules (assessment submit, clinical plan, dashboard, academy, training, impact/analytics, poster, challenges, movement, shop, share, volunteer, admin, assistant, voice assistant).
- HTTP routes: 4 Lovable email routes, 4 MCP/OAuth routes, `src/routes/email/unsubscribe.ts`, `src/routes/sitemap[.]xml.ts`.
- Background work: pg_cron `process-email-queue` (self-arming/disarming) — the only recurring job.
- PDF generation (`@react-pdf/renderer` + bundled `DejaVuSans.ttf`) runs on the edge worker today; on AWS it should run in a Node Lambda or route handler with `nodejs` runtime, not Edge.

## 6. Assets and environment variables to preserve

Assets: `public/aqla-logo.png`, `favicon.png`, `og-aqla*.jpg` (v3–v6; live meta references v6, older ones keep shared links working), `robots.txt`; `src/assets/` logos, `founder.png`, `DejaVuSans.ttf` (required for Arabic PDFs), and the three externalized CDN assets in §1.

Environment variables (names only, no values): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`/`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_ID`, `SUPABASE_DB_URL`, the `VITE_*` mirrors (become `NEXT_PUBLIC_*`), `LOVABLE_API_KEY` (retire), `OPENAI_API_KEY`, `EMAIL_FROM_ADDRESS`, `EMAIL_PROVIDER_API_KEY`, `VITE_PUBLIC_SITE_URL`. New on AWS: SES region/identity, IAM role credentials, queue endpoint secret.

## 7. Blockers and risks

1. **Hardcoded dispatch URL in the database.** `email_queue_dispatch` points at the Lovable domain; migration requires a DB migration and a vault secret rotation, coordinated with DNS cutover, or emails silently stop.
2. **Service-role key in Postgres vault.** Cannot be read from Lovable Cloud; a new key must be minted after taking ownership of the Supabase project.
3. **Domain/OAuth reconfiguration.** `aqla1.com`, `www.aqla1.com` and the published Lovable domain; Google/Apple/Microsoft providers currently brokered by Lovable must be registered directly with Supabase Auth, including new redirect URIs.
4. **Social preview cache.** Changing the OG image host can re-break link previews; keep the same filenames and paths under the new origin.
5. **Framework boundary rewrite.** 22 `createServerFn` modules and their `useServerFn`/loader call sites become Next.js server actions or route handlers; the auth middleware/bearer-attacher pattern is replaced by Next's cookie-based Supabase SSR client — a mechanical but broad change.
6. **Routing rewrite.** 93 TanStack file routes → App Router, including bracket-escaped paths (`[.mcp]`, `sitemap[.]xml`) and the `_authenticated`-style gate in `AqlaAuthGate`.
7. **Edge runtime assumptions.** `src/server.ts` h3/Workers error wrapper and `wrangler.jsonc` are Cloudflare-specific and disappear.
8. **Clinical/regulatory sensitivity.** Immutable `quit_plan_versions`, safety-hold email suppression, and analytics k-anonymity thresholds must be re-verified after migration, not assumed.
9. **Data residency/PII.** Participant, consent, and research tables — the AWS region choice and any log retention need a deliberate decision.
10. **MCP + OAuth consent surface.** Externally registered MCP clients would break if endpoints move without notice.

## 8. Reusable as-is

- The entire Supabase database: schema, RLS, RPCs, triggers, pgmq queues, roles. No changes required.
- All UI: shadcn/Radix components, Tailwind styles (`src/styles.css`), framer-motion, `src/components/**`, `src/features/sos/**`.
- Pure domain logic: `src/lib/clinical/**` (plan engine, questions, safety ladder, jurisdiction, tests), `src/lib/aqla-engine/**`, `src/lib/scoring.ts`, `src/data/modules.ts`, `src/lib/learn-content.ts`, `src/lib/training-content.ts`, `src/lib/i18n.ts`.
- Email templates (React Email) — only the transport changes.
- PDF renderers (`quit-plan-pdf.tsx`, `clinical/clinical-plan-pdf.tsx`) with the bundled font.
- Server function *handler bodies* — the Supabase queries inside them port nearly verbatim; only the wrapper changes.

## Recommended parallel migration sequence

1. **Own the accounts first.** Transfer/claim the Supabase project, create the AWS account and GitHub repo. Mint a fresh service-role key. No app changes yet.
2. **Export the code as a baseline.** Push the current TanStack app to GitHub as `legacy/` or a tagged branch so the running production system is version-controlled and reversible.
3. **Re-host assets.** Download the three CDN assets, upload to S3 + CloudFront, keep identical filenames for OG images.
4. **Scaffold the Next.js app in parallel** (separate repo/branch), pointing at the *same* Supabase project in read-mostly mode. Port design system, Tailwind config, and shared domain logic first — these carry no risk to production.
5. **Port public read-only pages** (home, articles, FAQ, impact, sitemap, OG metadata) and validate against production output side-by-side.
6. **Port auth** using `@supabase/ssr` cookie sessions; register OAuth providers directly in Supabase with the staging domain first.
7. **Port server functions** in dependency order: public stats → learn/academy → dashboard → clinical plan (last, with the clinical test suite as the gate).
8. **Stand up email on AWS** as a second consumer: deploy the queue processor as a Lambda/route handler backed by SES, verify the sending domain, and test against a staging pgmq queue *before* touching the production cron URL.
9. **Cut over email** by updating `email_queue_dispatch` to the new endpoint and rotating the vault secret — a single small migration, reversible in one statement.
10. **Cut over the site** by DNS: keep the Lovable deployment live and warm for a rollback window, switch `aqla1.com` to CloudFront/Amplify, then verify OG previews, OAuth redirects, PDF generation, and the clinical journey end to end.
11. **Decommission** the Lovable AI gateway key, MCP routes (or re-point them), and the Cloudflare/wrangler config only after a clean observation window.
