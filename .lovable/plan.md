# Aqla — Exhaustive Current-State Inventory (READ-ONLY AUDIT)

No files, configuration, or database objects were changed. Everything below is derived from reading the current codebase plus read-only database queries.

## How to read the status labels

- **ACTIVE_BACKEND** — code exists, is reachable, and there is concrete evidence of real data flowing (live rows in the backing table, or a live provider/secret configured and rows logged).
- **ACTIVE_CLIENT_ONLY** — works entirely in the browser; nothing is persisted server-side by design.
- **IMPLEMENTED_NEEDS_PROVIDER_CONFIG** — code complete but depends on a provider/scheduler that is not currently configured.
- **IMPLEMENTED_UNVERIFIED_E2E** — code exists and looks complete, but the backing table is empty or no evidence of a completed real journey exists.
- **PLACEHOLDER_OR_EMPTY** — page/function is a shell, stub, or hardcoded content with no backend.
- **DISABLED_OR_LEGACY** — redirect-only alias, orphaned component, or feature switched off by a release flag.
- **ADMIN_ONLY** — staff/admin surface (status of its authorization is noted separately).

**Evidence base used for "proven working":** live row counts from `pg_stat_user_tables`, status breakdowns from `email_send_log` / `notification_log` / `quit_plan_emails` / `quit_plans`, configured secrets (`EMAIL_PROVIDER_API_KEY`, `EMAIL_FROM_ADDRESS`, `LOVABLE_API_KEY`, `OPENAI_API_KEY` are all present), trigger and cron inventory (`cron.job` is **empty**).

---

## 1. Public / marketing pages

| Feature | Route / file | What it is | Why it matters | Status | Backend | Evidence | Risk |
|---|---|---|---|---|---|---|---|
| Arabic homepage | `/` — `src/routes/index.tsx` | Hero, study overlay, impact, tools | Primary entry point | ACTIVE_BACKEND | impact stats hook | uses `usePublicImpactStats`; `page_analytics` = 1805 rows | Heavy composite page |
| English homepage | `/en/` — `en.index.tsx` | EN landing | Bilingual reach | ACTIVE_CLIENT_ONLY | none | static | EN tree much thinner than AR |
| About (AR/EN) | `/about`, `/en/about` | Static about | Trust/authority | ACTIVE_CLIENT_ONLY | none | static | — |
| La-Tatten campaign | `/la-tatten`, `/en/la-tatten` | Campaign page | Campaign landing | ACTIVE_CLIENT_ONLY | none | static | — |
| Articles hub + 4 articles | `/articles`, `first-week`, `withdrawal`, `shisha`, `nicotine-pouches`, `/en/articles` | SEO content | Search authority | ACTIVE_CLIENT_ONLY | none | static | EN version lists only |
| FAQ | `/faq` | Q&A | AEO | ACTIVE_CLIENT_ONLY | none | static | — |
| Impact | `/impact` — `impact.tsx` | Public stats + testimonial submit | Social proof | ACTIVE_BACKEND | `impact.functions.ts`, RPC `get_public_impact_stats` | 6 server-fn calls; `engagement_events` = 749 rows | — |
| Legal set | `/privacy`, `/terms`, `/medical-disclaimer`, `/cookies`, `/sharing-policy` | Policy text | Compliance | ACTIVE_CLIENT_ONLY | none | static | `PRIVACY_NOTICE_VERSION = "v1-draft-pending-legal"` in `release-flags.ts` — legal review outstanding |
| Contact | `/contact` | Contact info/form | Support | ACTIVE_CLIENT_ONLY | none | no server fn found | Form may not submit anywhere — verify |
| Sitemap | `/sitemap.xml` — `sitemap[.]xml.ts` | Hardcoded XML | SEO | ACTIVE_BACKEND | none | hardcoded path list | Drifts from real route list manually |

## 2. Study / research features

| Feature | Route / file | What it is | Why it matters | Status | Backend | Evidence | Risk |
|---|---|---|---|---|---|---|---|
| Study invitation overlay | `src/components/StudyInvitationOverlay.tsx` | Full-screen study CTA + prize line | Recruitment funnel | ACTIVE_CLIENT_ONLY | localStorage persist | dismiss/persist logic in component | Blocks clicks if not dismissed (past bug) |
| Research banner | `src/components/ResearchBanner.tsx` | Flashing banner, live visit count, REDCap link | Recruitment | ACTIVE_BACKEND | `usePublicImpactStats` | shared query key `public-impact-stats` | External REDCap link is outside our control |
| Clinical/research intake | `/assessment` — `assessment.tsx` + `submit.functions.ts` | Long consented intake writing ~15 tables | Core research dataset | ACTIVE_BACKEND | `participants` (11), `consent_records` (11), `product_use` (11), `risk_flags` (11), `readiness_stage` (11), `cohort_assignment` (11), `cigarette_dependence_scores` (10) | live rows | `submitAssessment` is **public/unauthenticated** with no rate limiting; PII emailed to admin |
| Data dictionary | `/admin/data-dictionary` + `src/lib/data-dictionary.ts` | Variable browser | Research governance | ADMIN_ONLY | 1 supabase call | route file | Gating is soft (see §12) |
| Research disclosure switch | `release-flags.ts` `ADMIN_RESEARCH_DISCLOSURE_ENABLED=false` | Blocks identifiable admin email | Privacy control | DISABLED_OR_LEGACY (intentional) | — | flag read in `quit-plan.functions.ts` | If ever flipped true, raw health answers go by email |
| Study-thanks email template | `src/lib/email-templates/study-thanks.tsx` | Thank-you email | Retention | IMPLEMENTED_UNVERIFIED_E2E | queue | template registered | No evidence of a send |

## 3. Clinical quit-plan system (Release 1)

| Feature | Route / file | What it is | Why it matters | Status | Backend | Evidence | Risk |
|---|---|---|---|---|---|---|---|
| Clinical quit chat | `/quit-chat` — `quit-chat.tsx`, `QuitChatConversation.tsx`, `QuitChatDrawer.tsx` | Guided intake → deterministic plan | Flagship clinical journey | ACTIVE_BACKEND | `quit_plans` | 60 rows: 46 `in_progress`, 10 `finalized`, 4 `safety_hold` | High drop-off: only 10/60 finalize |
| Plan engine | `src/lib/clinical/plan-engine.ts`, `questions.ts`, `types.ts` | Deterministic 11-section behavioural plan | Clinical correctness | ACTIVE_BACKEND | — | `clinical-plan.test.ts`, `release1-acceptance.test.ts` exist (not executed in this audit) | Tests exist; not run here |
| Safety ladder | `src/lib/clinical/safety.ts`, `jurisdiction.ts` | 6-level ladder; red flags terminate intake and show 997 | Patient safety | ACTIVE_BACKEND | `quit_plans.status='safety_hold'` | 4 real safety_hold rows | Emergency path proven to trigger; downstream human follow-up not implemented |
| Medication content gate | `release-flags.ts` | Pharmacotherapy structurally unrenderable | Regulatory | DISABLED_OR_LEGACY (intentional) | — | `SAUDI_MEDICATION_CONTENT_APPROVED=false`, approved-versions list empty | Correct for R1 |
| Immutable plan versioning | `clinical-plan.server.ts`, `quit_plan_versions` | Every finalize writes an immutable version row | Auditability | ACTIVE_BACKEND | `quit_plan_versions` = 8 rows; DB trigger `quit_plan_versions_immutable` | rows + trigger present | — |
| Plan token viewer | `/quit-plan/$planToken` | Shareable capability-token plan page | Delivery | ACTIVE_BACKEND | `getClinicalPlan` | public prefix in auth gate | Token in URL — link forwarding exposes health data |
| Plan PDF | `clinical-plan-pdf.tsx`, `quit-plan-pdf.tsx`, `pdf-runtime.ts` | Arabic RTL PDF with embedded font + QR | Offline delivery | ACTIVE_BACKEND | — | `pdf-runtime.ts` exists specifically to fix a real `Buffer is not defined` failure | Any PDF path that forgets `ensurePdfRuntime()` breaks silently |
| Plan email + resend | `emailClinicalPlan`, `sendPlanEmailViaQueue` | Consent-gated plan email | Delivery | ACTIVE_BACKEND | `quit_plan_emails` | 4 `sent`, 4 `queued` | 4 stuck in `queued` — see §5 scheduler gap |
| Legacy quit-plan flow | `quit-plan.functions.ts`, `QuitPlanChat.tsx`, `quit-pathway.tsx` | Older plan builder, own email + reminders | Superseded | DISABLED_OR_LEGACY (still reachable) | `quit_plan_reminders` = **0 rows** | duplicate of clinical flow | **Two parallel quit-plan engines** — main consolidation debt |
| Printable plan | `PrintableQuitPlan.tsx` | Print view | — | PLACEHOLDER_OR_EMPTY | — | **imported by nothing** | Dead code |

## 4. Aqla Quit Engine (third, separate engine)

| Feature | Route / file | Status | Backend | Evidence | Risk |
|---|---|---|---|---|---|
| Quit engine wizard | `/aqla-quit-engine` + `src/components/aqla-engine/*`, `src/lib/aqla-engine/*` | ACTIVE_BACKEND | `aqla_quit_engine_results` = 5 rows | live rows | **Third** quit-plan implementation alongside clinical + legacy |
| Engine result page | `/aqla-quit-engine/result/$resultId` | ACTIVE_BACKEND | same | 2 server fns | Behind auth gate although result is a share target |
| Engine follow-ups | `aqla_quit_engine_followups` = 15 rows | ACTIVE_BACKEND | — | live rows | No scheduler drives them (cron empty) |
| Engine email log | `aqla_quit_engine_email_logs` = 9 rows | ACTIVE_BACKEND | direct Resend in `aqla-engine/storage.ts` | live rows | A **fourth** email code path |
| Engine admin view | `/admin/aqla-quit-engine` | ADMIN_ONLY | 2 server fns | route file | Soft gating |

## 5. Email subsystem

Two providers and four call patterns coexist.

| Feature | File | What it is | Status | Evidence | Risk |
|---|---|---|---|---|---|
| Transactional send API | `src/routes/lovable/email/transactional/send.ts` | Enqueues branded email into pgmq | ACTIVE_BACKEND | `email_send_log`: 3 sent, 3 pending, 1 bounced | Only two UI callers (signup welcome, clinical plan) |
| Queue processor | `src/routes/lovable/email/queue/process.ts` | Drains `transactional_emails`/`auth_emails` via `@lovable.dev/email-js`; auth = bearer service-role key | **IMPLEMENTED_NEEDS_PROVIDER_CONFIG** | **`cron.job` is empty** — nothing schedules this endpoint | Queued mail only moves when `email_queue_wake` trigger fires or someone calls the URL; 3 `pending` + 4 `queued` plan emails are consistent with a missing scheduler. **Highest-severity operational finding.** |
| Suppression webhook | `lovable/email/suppression.ts` | Mailgun bounce/complaint handler, HMAC-verified | ACTIVE_BACKEND | `suppressed_emails` = 1 row, 1 bounced log row | — |
| Unsubscribe endpoint | `src/routes/email/unsubscribe.ts` (+ UI `/unsubscribe`) | RFC 8058 one-click, service-role, single-use tokens | ACTIVE_BACKEND | `email_unsubscribe_tokens` = 3 rows | UI route `/unsubscribe` is **not** in the public allowlist — logged-out recipients may hit the login gate |
| Email preview | `lovable/email/transactional/preview.ts` | Template preview, key-gated | ADMIN_ONLY | file | — |
| Templates | `email-templates/{welcome,session-reminder,study-thanks,academy-certificate}.tsx` + `registry.ts` | React Email templates | Mixed: welcome ACTIVE_BACKEND; others IMPLEMENTED_UNVERIFIED_E2E | only welcome has a wired caller (`auth.tsx`) | 3 of 4 templates have no production caller |
| Admin notifications (Resend direct) | `notifications.server.ts` | Internal alerts, fail-safe, `notification_settings` per type | ACTIVE_BACKEND | `notification_log` = 9 rows, all `sent` | Bypasses the queue, logs to a different table |
| Inline Resend duplicates | `quit-plan.functions.ts`, `shop.functions.ts`, `training.functions.ts`, `aqla-engine/storage.ts` | Copy-pasted Resend calls | IMPLEMENTED_UNVERIFIED_E2E | `process.env.EMAIL_PROVIDER_API_KEY` in 4+ files | Default from-address `onboarding@resend.dev` cannot deliver to arbitrary recipients in production |
| Plan-email admin log | `/admin/quit-plan-emails` + `quit-plan-emails.functions.ts` | Search/inspect plan emails | ADMIN_ONLY | 2 server fns | Local `ensureAdmin` only checks "has any role" |

## 6. Authentication & authorization

| Feature | File | Status | Evidence | Risk |
|---|---|---|---|---|
| Client route gate | `AqlaAuthGate.tsx` | ACTIVE_CLIENT_ONLY | `PUBLIC_EXACT` + `PUBLIC_PREFIXES` | Client-side only; real enforcement must be per-server-function. **`/auth` and `/unsubscribe` are not in the allowlist** — verify the login page itself is reachable when signed out |
| Preview auth bypass | `AqlaAuthGate.tsx` `?test_auth=1` | ACTIVE_CLIENT_ONLY | `isPreviewHost()` excludes `aqla-support.lovable.app` | Custom domains `aqla1.com` / `www.aqla1.com` are **not** explicitly excluded; they fail the `.lovable.app` checks so the bypass should be inactive, but the exclusion is by omission rather than by allowlist |
| Welcome gate | `AqlaWelcomeGate.tsx` | ACTIVE_BACKEND | phone/OTP + email UI, `supabase.auth` | — |
| Staff login/signup | `/auth` — `auth.tsx` | ACTIVE_BACKEND | `supabase.auth.signInWithPassword` / `signUp`, welcome email | Open signup: any signup creates an account with no role; roles assigned manually |
| Legacy login alias | `/login` → `/auth` | DISABLED_OR_LEGACY | redirect only | — |
| Bearer attacher | `src/start.ts` + `auth-attacher.ts` | ACTIVE_BACKEND | `functionMiddleware: [attachSupabaseAuth]` | — |
| Canonical role helpers | `_authz.server.ts` | ACTIVE_BACKEND | `ensureAdmin`, `ensureStaff`, `has_role` | Used by only some modules |
| Roles table | `user_roles` (enum: receptionist/physician/admin) | ACTIVE_BACKEND | **1 row only** | A single privileged account exists |
| OAuth consent screen | `/.lovable/oauth/consent` | ACTIVE_BACKEND | own `beforeLoad` session check | Redirect URL from server not origin-validated |

**Authorization defects found (highest priority):**
1. `learn.functions.ts` — `getAdminLearnAnalytics`, `adminListLeaderboard`, and `moderateLeaderboardEntry` have **no auth or role check at all**. Anyone can list pending leaderboard entries and approve/hide/strip them.
2. `admin.functions.ts`, `volunteer.functions.ts`, `quit-plan-emails.functions.ts` each define a **local `ensureAdmin`/`requireAdmin`/`ensureStaff` that only checks "has any row in `user_roles`"** — a receptionist passes checks labelled admin.
3. `admin.functions.ts: listParticipants` interpolates user `search` text into a PostgREST `.or(...ilike.%${s}%)` filter — unescaped; needs injection review.
4. `clinical-plan.functions.ts: saveClinicalAnswers` updates by `planId` **without** the plan-token check its sibling `quit-plan.functions.ts: saveAnswer` performs.
5. `admin` routes rely on a client-side `getSession()` redirect only; there is no `beforeLoad` role gate.

## 7. Admin console

| Feature | Route | Status | Evidence | Risk |
|---|---|---|---|---|
| Admin console (participants, volunteers, challenges, poster analytics, notifications, CSV) | `/admin` | ADMIN_ONLY / ACTIVE_BACKEND | 21 server-fn refs; `audit_log` = 177 rows, `export_logs` = 61 rows | Soft gating; broad PII access for any role |
| CSV export | `admin.functions.ts: exportCsv` | ACTIVE_BACKEND | 61 export log rows + `csv_export_alert` notification type | `type:"full"` includes PII |
| Clinical notes | `addClinicalNote` (physician-gated) | IMPLEMENTED_UNVERIFIED_E2E | `clinical_notes` = **0 rows** | Correctly gated, never used |
| Follow-up visits | `addFollowUpVisit` | ACTIVE_BACKEND | `follow_up_visits` = 2 rows | — |
| Outcome tracking | `updateOutcome` | ACTIVE_BACKEND | `outcome_tracking` = 7 rows | — |
| Test email / notification log | `sendTestEmail`, `listRecentNotifications` | ADMIN_ONLY | `notification_log` = 9 | Named admin, gated as "any role" |

## 8. Academy / learning / training (three overlapping systems)

| Feature | Route / file | Status | Evidence | Risk |
|---|---|---|---|---|
| `/academy`, `/learn` | redirect-only | DISABLED_OR_LEGACY | redirect to `/learn-train` | Dead aliases |
| Learn hub | `/learn-train` | ACTIVE_CLIENT_ONLY | delegates to `AqlaCenterChat` | — |
| Learn leaderboard & quizzes | `learn.functions.ts` | ACTIVE_BACKEND | `quiz_attempts` = 1, `leaderboard_entries` = **0** | Unauthenticated moderation defect (§6) |
| Academy content API | `academy.functions.ts` | **PLACEHOLDER_OR_EMPTY** | File banner literally says "STUBS"; `submitAcademyAttempt` returns `scored:false` | All `academy_*` tables have **0 rows** |
| Academy dashboard data | `dashboard.functions.ts` | IMPLEMENTED_UNVERIFIED_E2E | `learner_profiles`, `academy_progress`, `academy_certificates`, `live_sessions` all **0 rows** | Well-written, never exercised |
| Academy certificate issue/verify | `academy-certificate.functions.ts`, `/academy-certificate/$code` | IMPLEMENTED_UNVERIFIED_E2E | `academy_certificates` = 0 | Public unauthenticated cert minting, no rate limit; route not in public allowlist unlike `/certificate/$code` |
| Volunteer training | `/training` + `training.functions.ts` | ACTIVE_BACKEND | `training_modules` 7, `training_progress` 7, `training_users` 2, `training_certificates` 1 | Session-token capability model; correctly uses real `ensureAdmin` |
| Module content pages | `/modules/$slug` + `src/data/modules.ts` | ACTIVE_BACKEND | 2 server fns; `educational_modules` table = 0 (content is in code, not DB) | Content duplicated between code and unused DB table |
| Certificate lookup | `/certificates`, `/certificate/$code` | ACTIVE_BACKEND | RPC `verify_training_certificate` | `/certificate/$code` public but `/certificates` index is gated — inconsistent |
| Professional library | `/professional-library` | PLACEHOLDER_OR_EMPTY | no data calls, lock icon; `guideline_documents` = 0 rows | Advertised but empty |

## 9. Challenges / community / gamification

| Feature | Route / file | Status | Evidence | Risk |
|---|---|---|---|---|
| Challenge hub | `/challenges` | ACTIVE_BACKEND | RPC `get_challenge_public_stats`; `challenge_events` = **0 rows** | Stats render but no events recorded |
| Challenge pathway | `/challenge-pathway` | ACTIVE_CLIENT_ONLY | `AqlaCenterChat` | Overlaps `/challenges` |
| `/community-challenges` | redirect-only | DISABLED_OR_LEGACY | → `/challenge-pathway` | — |
| City challenge | `/city-challenge` | ACTIVE_BACKEND | `city_challenge_events` = 2 rows | Unauth writes |
| Movement / charter | `/movement` (redirect to `/impact`), `movement.functions.ts` | Mixed | `movement_events` = 55 rows; `charter_signatures` = **0**; `aqla_passport_events` = **0** | Charter/passport features unused |
| Points & medals | `/points-medals` | PLACEHOLDER_OR_EMPTY | zero data calls | Gamification promised, not wired |
| Invite friends / support invite | `/invite-friends` (static), `/support-invite` (2 server fns) | Mixed | invite page static | Duplicate invite concepts |
| Poster studio | `/poster-studio` + `poster.functions.ts` | ACTIVE_BACKEND | `poster_events` 27, `poster_creations` 3 | Unsafe-message regex filter present |
| Share cards | `share.functions.ts`, `/share/$type/$id`, `/share/invite/$code` | ACTIVE_BACKEND | `share_cards` = 21 rows | PII protection is a **denylist** (allowlist safer); unauthenticated 8 MB storage uploads |
| Shop / NRT requests | `/shop` + `shop.functions.ts` | IMPLEMENTED_UNVERIFIED_E2E | `nrt_product_catalog` = 7 but `nrt_requests` = **0** | Correctly uses real `ensureStaff` |

## 10. SOS / craving / DTx / voice

| Feature | Route / file | Status | Evidence | Risk |
|---|---|---|---|---|
| SOS craving rescue | `/sos` + `src/features/sos/**` | IMPLEMENTED_UNVERIFIED_E2E | `sos_sessions` = 1 row | Substantial feature, effectively unused |
| Voice craving scan | `/voice-craving-scan` | ACTIVE_CLIENT_ONLY | Web Audio only, nothing uploaded | Novel feature with no measurement |
| Voice chat assistant | `/aqla-voice-chat` + `voice-assistant.functions.ts` | ACTIVE_BACKEND | `OPENAI_API_KEY` present; direct `api.openai.com`, `gpt-4o-mini` | **Public, unauthenticated LLM endpoint, no rate limit**; safety is prompt-only (no deterministic red-flag check like `safety.ts`) |
| Text assistant | `AqlaAssistant.tsx` + `assistant.functions.ts` | ACTIVE_BACKEND | `LOVABLE_API_KEY` present; deterministic `safetyOverride()` before model call | Public, unauthenticated, no rate limit |
| DTx pact/HALT/slips/NRT log | `/dtx` + `dtx.functions.ts` | IMPLEMENTED_UNVERIFIED_E2E | `dtx_pacts` = 1, `dtx_nrt_log` = 1, `dtx_halt_events` = **0**, `dtx_slips` = **0** | Cleanly auth-scoped; barely used |
| Craving coach / relapse support / when-to-seek-help / safety-guidance | static pages | ACTIVE_CLIENT_ONLY | `SimpleContentPage` | `craving_events` table = 0 rows despite an MCP tool reading it |
| Quit center / start / tools | redirects to `/quit-pathway`, `/request-support` | DISABLED_OR_LEGACY | redirect-only | — |
| Request support | `/request-support` | ACTIVE_BACKEND | 2 server fns | — |

## 11. Analytics & tracking

| Feature | File | Status | Evidence | Risk |
|---|---|---|---|---|
| Anonymous session/analytics lib | `src/lib/analytics.ts` | ACTIVE_BACKEND | no PII by design | — |
| Visit tracker | `VisitTracker.tsx` → `recordPageEntry`/`recordPageDuration` | ACTIVE_BACKEND | `page_analytics` = 1805 rows | Tracks only `/`, `/about`, `/assessment`, `/volunteer`; `recordPageDuration` lets any client update **any** row id |
| Engagement events | `track-event.ts`, `events.ts` | ACTIVE_BACKEND | `engagement_events` = 749 | Funnel taxonomy larger than call-site coverage |
| Legacy page views | `page_views` table | DISABLED_OR_LEGACY | 6 rows vs 1805 in `page_analytics` | Two overlapping analytics tables |
| Admin analytics dashboards | `get_admin_analytics_dashboard`, `..._challenge_`, `..._learn_`, `..._poster_`, `..._training_` | ADMIN_ONLY | RPCs exist | The learn one is **ungated** (§6) |

## 12. MCP / external API

| Feature | Route / file | Status | Evidence | Risk |
|---|---|---|---|---|
| MCP server | `/mcp`, `/.mcp/list-tools`, `/.mcp/invoke-tool/$tool`, `/.well-known/oauth-protected-resource` | ACTIVE_BACKEND | auto-generated handlers; OAuth issuer built from `VITE_SUPABASE_PROJECT_ID` | Auto-generated — do not hand-edit |
| MCP tool: list my quit plans | `src/lib/mcp/tools/list-my-quit-plans.ts` | IMPLEMENTED_UNVERIFIED_E2E | reads `quit_plans` with publishable key + user token | No evidence of external client use |
| MCP tool: list my craving events | `src/lib/mcp/tools/list-my-craving-events.ts` | PLACEHOLDER_OR_EMPTY (data-wise) | `craving_events` = **0 rows** | Tool always returns empty |

## 13. Dashboard cluster

`/dashboard` and its 8 children (`index`, `catalogue`, `certificates`, `history`, `learning`, `paths`, `profile`, `sessions`) contain **no direct server-fn or supabase calls in the route files**; data, if any, comes from `useLearnerDashboard` / `dashboard.functions.ts`, whose four backing tables (`learner_profiles`, `academy_progress`, `academy_certificates`, `academy_exam_attempts`, `live_sessions`) are all **empty**. Treated as **IMPLEMENTED_UNVERIFIED_E2E**, with `catalogue`, `history`, `paths`, `sessions` closer to **PLACEHOLDER_OR_EMPTY**.

## 14. Orphaned / dead code (imported by nothing)

`CinematicHero.tsx`, `AgentConstellation.tsx`, `PrintableQuitPlan.tsx`, `GlobalVideoBackground.tsx`. Also fully redirect-only routes: `/academy`, `/learn`, `/community-challenges`, `/quit-center`, `/start`, `/tools`, `/movement`, `/login`.

## 15. Scheduled / background work

- **`cron.job` is empty.** No scheduled jobs exist in the database.
- `email_queue_wake` trigger + `email_queue_dispatch()` exist, so enqueued mail depends on trigger-driven dispatch or an external caller of `/lovable/email/queue/process`.
- `quit_plan_reminders` (0 rows), `aqla_quit_engine_followups` (15 rows), `follow_up_records` (0 rows) have **no scheduler** driving them.
- 20 `updated_at`/immutability triggers exist in `public` (including `quit_plan_versions_immutable`).

## 16. Counts by status

| Status | Count (features/routes/functions inventoried) |
|---|---|
| ACTIVE_BACKEND | 41 |
| ACTIVE_CLIENT_ONLY | 22 |
| IMPLEMENTED_UNVERIFIED_E2E | 19 |
| PLACEHOLDER_OR_EMPTY | 8 |
| DISABLED_OR_LEGACY | 14 |
| ADMIN_ONLY | 9 |
| IMPLEMENTED_NEEDS_PROVIDER_CONFIG | 1 (email queue scheduler) |

Route totals: 91 route files → ~8 pure redirect aliases, ~10 API/protocol routes, ~73 user-facing pages/layouts.

## 17. Duplicate / overlapping systems (consolidation debt)

1. **Three quit-plan engines**: clinical (`src/lib/clinical/*`, current), legacy (`quit-plan.functions.ts` + `QuitPlanChat`), and Aqla Quit Engine (`src/lib/aqla-engine/*`). All three write different tables and send different emails.
2. **Four email code paths**: pgmq queue + Lovable gateway; `notifications.server.ts` Resend; inline Resend copies in 4 function files; engine-specific Resend in `aqla-engine/storage.ts`.
3. **Three learning systems**: Academy (stubbed, empty), Learn (`learn.functions.ts`), volunteer Training (real, populated).
4. **Four challenge surfaces**: `/challenges`, `/challenge-pathway`, `/city-challenge`, dead `/community-challenges`.
5. **Six in-the-moment support surfaces**: `/quit-chat`, `/craving-coach`, `/relapse-support`, `/sos`, `/voice-craving-scan`, `/aqla-voice-chat` — only `/quit-chat` is public.
6. **Two analytics tables**: `page_views` (legacy, 6 rows) vs `page_analytics` (1805).
7. **Two authorization implementations**: canonical `_authz.server.ts` vs three weaker local copies.
8. **Two AI providers**: Lovable AI Gateway (text assistant) and OpenAI direct (voice assistant); `LOVABLE_API_KEY` is dual-purposed for AI and email.

## 18. Top risks, ranked

1. **Unauthenticated admin functions in `learn.functions.ts`** (`moderateLeaderboardEntry`, `adminListLeaderboard`, `getAdminLearnAnalytics`).
2. **"Admin" checks that only verify "has any role"** in `admin.functions.ts`, `volunteer.functions.ts`, `quit-plan-emails.functions.ts` — a receptionist gets physician-adjacent PII and CSV surfaces.
3. **No email scheduler** (`cron.job` empty) with 3 `pending` + 4 `queued` clinical plan emails — patients may not receive plans.
4. **Public unauthenticated LLM endpoints** with no rate limiting (`chatWithAssistant`, `voiceChat`) — cost/abuse exposure.
5. **Voice assistant safety is prompt-only**, unlike the deterministic clinical `safety.ts` ladder.
6. **`saveClinicalAnswers` missing the plan-token ownership check** its sibling has.
7. **Possible PostgREST filter injection** in `listParticipants` search.
8. **Public unauthenticated writes** across intake, certificates, quizzes, and share/storage uploads with no rate limiting.
9. **Auth-gate inconsistencies**: `/auth` and `/unsubscribe` not in the public allowlist; `/certificate/$code` public while `/certificates` and `/academy-certificate/$code` are gated.
10. **`PRIVACY_NOTICE_VERSION` marked draft-pending-legal** while live intake collects health data.
11. **Empty-but-advertised features**: professional library, points & medals, academy, NRT shop, dashboard cluster.
12. **Default Resend from-address `onboarding@resend.dev`** in fallback paths cannot deliver to arbitrary recipients.

## 19. Explicit "exists in code" vs "proven working"

**Proven by live data:** clinical quit plans and safety holds, plan versioning, plan emails (partially), page/engagement analytics, admin audit log and CSV exports, participant intake, poster studio, share cards, movement events, volunteer training, volunteer applications, notification emails, city challenge, quit engine.

**Exists in code only (no evidence of a completed real journey):** academy (all tables empty), learner dashboard, leaderboard entries, NRT requests, clinical notes, charter signatures, passport events, craving events, DTx HALT/slips, follow-up records, quit plan reminders, guideline documents, MCP tool usage, session-reminder/study-thanks/academy-certificate email templates.

**Not verified in this audit:** the two clinical test files were not executed; no browser end-to-end run was performed; no email was sent; no production hostname behaviour was exercised.
