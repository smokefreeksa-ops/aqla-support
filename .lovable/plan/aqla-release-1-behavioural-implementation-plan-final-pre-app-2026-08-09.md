# Aqla — Release 1 Behavioural Implementation Plan (final, pre-approval)

Nothing has been implemented. This is the formal plan for approval.

## Scope lock

**Release 1 is behavioural-only.** No medication recommendation, no NRT, no dose, patch strength, gum or lozenge dose, no combination NRT, no varenicline, bupropion, cytisine, no candidate ranking, no schedules, no tapers, no preloading, no pregnancy or under-18 pharmacotherapy, no content from Module Parts C.3, C.4 or C.6, and no pharmacotherapy decision logic of any kind.

`saudi_medication_content_approved = false` is set as a build-time constant and enforced in three independent places (engine, renderer, plan schema) so no single missed condition can leak medication text. Everywhere medication would eventually appear, Release 1 emits a fixed safe placeholder: a referral to a pharmacist, clinician or cessation service.

**Two jurisdictions:** `SA` (full behavioural + Saudi services) and `GENERIC` (full behavioural, no Saudi identifiers). No UK content is built.

**Preserved without redesign:** the `/quit-chat` conversational bubbles, Arabic RTL layout, IBM Plex Sans Arabic typography, Aqla green identity, warm tone, and one-question-at-a-time pacing. Clinical complexity lives behind the interface. `/quit-chat` is not converted to a form.

### Verified starting point

- `src/lib/quit-plan.functions.ts` already exports `startQuitPlan`, `saveAnswer`, `finalizeQuitPlan`, `getQuitPlan`, `scheduleReminder`, all writing to `quit_plans` via `supabaseAdmin`, with an existing `quit_plan_emails` insert and an `admin_notified_at` write.
- `quit_plans` columns today: `id`, `session_id`, `anonymous_session_id`, `user_id`, `nickname`, `city`, `email`, `product`, `quit_goal`, `readiness`, `quit_date`, `triggers`, `support_person`, `intake_answers`, `plan`, `followup_schedule`, `money_setup`, `assessment_tool`, `score_total`, `score_band`, `risk_flag`, `validated`, `plan_token`, `pdf_url`, `email_sent_at`, `admin_notified_at`, `status`, `created_at`, `updated_at`. **No** country/jurisdiction, plan version, email status enum, or consent columns exist yet.
- `src/lib/quit-plan-builder.ts` exports `computeScore`, `buildQuitPlan`, `QuitPlanJSON`, `REFERENCES`, and a `PharmacyOptionDetail` type — the pharmacy surface that must be gated off.
- `src/lib/scoring.ts` `scoreFtnd` already implements the correct six-item 0–10 FTND with correct bands. It is reused as-is.
- `/quit-chat` currently persists nothing; its 4-item score and email behaviour are local only.

---

# PHASE 1 — Truthfulness and safety fixes

**Existing files modified**
- `src/routes/quit-chat.tsx` — delete the mock `sendEmailPayload`, the 3-second timer, and the `تم إرسال الخطة للبريد بنجاح!` toast; delete the state-9 treatment sentence that concludes from score alone; relabel the score so it is no longer presented as a Fagerström result out of 8; replace the readiness `<5 → state 99` dead end with a neutral continue.
- `src/components/PrintableQuitPlan.tsx` — remove the deterministic dopamine, "detox", and fixed 3-minute craving-duration claims (Gap rows 6–11); replace with non-deterministic phrasing.
- `src/lib/quit-plan.functions.ts` — disable the admin notification path and remove the `admin_notified_at` write; remove any user-facing statement that a copy was sent to administration.
- `src/lib/quit-plan-builder.ts` — gate `PharmacyOptionDetail` and all pharmacy fields behind `saudi_medication_content_approved`, which is false, so they are never populated.

**New files created**
- `src/lib/clinical/release-flags.ts` — exports `SAUDI_MEDICATION_CONTENT_APPROVED = false` and a `assertNoMedicationContent()` guard used by the engine and renderer.

**Database changes** — none.

**Server functions used** — `finalizeQuitPlan` (admin path disabled only).

**Exact behaviour added** — the app stops asserting things that are not true: no fake email success, no treatment conclusion from a score, no unconsented admin disclosure, no unsupported physiological claims.

**Must NOT change** — chat bubbles, RTL layout, colours, copy tone, question order, or any working navigation.

**Tests** — no string matching `تم إرسال` appears without a confirmed provider response; no admin write occurs on finalize; grep of rendered plan output contains none of the removed claims; `/quit-chat` still completes end-to-end.

**Rollback/safety** — every change is a deletion or a neutralisation, individually revertable. No data migration, so rollback is a code revert. This phase reduces risk on its own and can ship independently of everything after it.

---

# PHASE 2 — Wire `/quit-chat` to the existing backend

**Existing files modified**
- `src/routes/quit-chat.tsx` — call `startQuitPlan` on first user answer, `saveAnswer` per answered question, `finalizeQuitPlan` at the end, and route to the existing `/quit-plan/$planToken` for the persisted view. Local component state remains the UI driver; the server calls are additive so the conversation never blocks on the network.
- `src/lib/quit-plan.functions.ts` — accept the richer answer payload shape; no new engine.

**New files created**
- `src/lib/quit-chat/session.ts` — thin client wrapper holding `planId`/`plan_token`, debouncing `saveAnswer`, and queueing writes so a dropped request retries rather than losing an answer.

**Database changes** — none in this phase; existing `intake_answers` JSON absorbs the new fields.

**Server functions used** — `startQuitPlan`, `saveAnswer`, `finalizeQuitPlan`, `getQuitPlan`.

**Exact behaviour added** — plans persist, `plan_token` exists, the plan is retrievable, and the dashboard becomes genuinely reachable. **No third engine is created**; `/quit-chat` becomes the conversational front end of the pipeline that already exists.

**Must NOT change** — the visual experience, the one-question-at-a-time pacing, or `QuitPlanChat.tsx` and `/quit-plan/$planToken`, which already consume this backend.

**Tests** — completing `/quit-chat` produces exactly one `quit_plans` row; every answered question is present in `intake_answers`; `getQuitPlan` by token returns the same content; a simulated network failure mid-conversation does not lose prior answers or break the UI.

**Rollback/safety** — server calls are wrapped so any failure degrades to the current local-only behaviour rather than blocking the user. Rollback is removing the call sites.

---

# PHASE 3 — Assessment and progressive branching

**Existing files modified**
- `src/routes/quit-chat.tsx` — the state machine is replaced by a data-driven question runner, rendering the same bubbles and the same one-at-a-time rhythm.
- `src/lib/scoring.ts` — no logic change; `scoreFtnd` is imported and used.

**New files created**
- `src/lib/clinical/questions.ts` — the 42 Release 1 questions as data (id, Arabic wording, type, options, required/conditional, branch predicate, stored variable).
- `src/lib/clinical/branching.ts` — pure branching resolver: given answers so far, returns the next question or `done`.
- `src/lib/clinical/jurisdiction.ts` — `SA` and `GENERIC` profiles: service routes, emergency policy, and a hard `medicationAllowed: false` for both in Release 1.
- `src/lib/clinical/types.ts` — the assessment answer model.

**Database changes** — migration adding to `quit_plans`: `country_code text`, `jurisdiction text`, `plan_variant text`, `dependence_status text`, `quit_strategy text`, `plan_version int`, `clinical_rule_version text`. Backfill existing rows to `jurisdiction = 'GENERIC'`, `plan_version = 1`. No new table in this phase.

**Server functions used** — `saveAnswer` (extended payload), `finalizeQuitPlan`.

**Exact behaviour added**
- **Country/jurisdiction captured before city.** If inferred from locale, it is shown back for explicit confirmation and never silently assumed. `SA` → Saudi profile; anything else → `GENERIC`.
- **FTND corrected**: all six items, 0–10, via the existing `scoreFtnd`, asked only when cigarettes are used **and** the user agrees. It is **descriptive and personalising only** and is never used to select treatment — which in Release 1 does not exist at all.
- **Dependence stays optional.** Skipping sets `dependence_status = not_assessed`: the behavioural plan is still generated in full, with no dependence interpretation and no medication-specific content.
- **Previous quit-attempt history** with branching into longest abstinence, reason the attempt ended, withdrawal experience, and prior aids — recorded for behavioural tailoring only.
- **Expanded triggers** across routine, emotional, social and environmental categories, followed by an explicit highest-risk trigger.
- **Readiness** is captured without dead-ending, followed by a **user-selected strategy**: quit now, future date, reduce-to-quit, or not ready yet but wants support. All four keep support available; none is auto-assigned.
- **Supporter capture preserved**, plus a new supporter-preference question.
- `Q_CONSENT_RESEARCH` is **not** included.

**Must NOT change** — bubble rendering, avatars, RTL anchoring, typography, colours, or the conversational tone. Question count grows; perceived complexity must not.

**Tests** — every branch predicate covered; a cigarette-only user is never asked non-cigarette items and vice versa; skipping dependence never asks FTND; country confirmation cannot be bypassed; low readiness always reaches the strategy question; RTL snapshot of the chat is unchanged.

**Rollback/safety** — the question bank is data, so scope can be reduced by editing data rather than code. The migration is additive and nullable, so rolling back code leaves the database valid.

---

# PHASE 4 — Safety escalation

**Existing files modified** — `src/routes/quit-chat.tsx` (renders escalation messages inline in the conversation, in the existing bubble style).

**New files created**
- `src/lib/clinical/safety-gates.ts` — the six-level ladder and its 21 trigger conditions, as pure functions over the answer model.
- `src/lib/clinical/escalation-content.ts` — Arabic escalation copy, parameterised by jurisdiction profile.

**Database changes** — migration adding `safety_gate_level text` and `safety_flags jsonb` to `quit_plans`.

**Server functions used** — `saveAnswer`, `finalizeQuitPlan`.

**Exact behaviour added**
- **Cardiac ladder, corrected and three-way plus emergency:** stable long-standing history → no gate, NRT-free reassurance content only; event within roughly two weeks → clinician review before any future pharmacotherapy, behavioural plan proceeds normally; active or worsening symptoms → urgent same-day care; acute red-flag symptoms → emergency.
- **Mental-health escalation:** stable and monitored → mood-monitoring content, no hard gate; unstable or unclear → clinician gate; suicidal ideation → emergency gate, assessment paused, crisis routing, plan suppressed.
- **Saudi referral:** Sehhaty is the smoking-cessation clinic **booking** route; 937 is the MOH help/counselling/contact route, shown where appropriate. They are complementary, not interchangeable. No clinic count and no cost claim.
- **Saudi emergency:** 997 renders **only** when `jurisdiction = SA` **and** an emergency gate has actually fired. It never appears in footers, PDF boilerplate, or routine content.
- **Non-Saudi users:** the full behavioural plan, no Sehhaty, no 937, no 997, no Saudi medication information; instead a block advising a local clinician, pharmacist or cessation service. No foreign emergency number is invented.
- **Poly-product use** sets a complexity flag that widens content coverage; it does not by itself require clinician review.

**Must NOT change** — the conversational delivery of escalation. Escalations appear as calm in-flow messages, not modal alarms, except the emergency gate, which stops the conversation.

**Tests** — each of the 21 trigger conditions produces exactly its intended level; 997 cannot render in any non-emergency path or any non-SA path; Sehhaty/937/997 cannot render for `GENERIC`; the emergency gate suppresses plan generation; the recent-cardiac-event path produces a clinician-review gate and **not** an urgent gate.

**Rollback/safety** — gates are pure functions with exhaustive unit tests. The safest failure mode is over-escalation, so any ambiguity resolves upward. Rollback disables gate rendering but leaves the recorded flags intact.

---

# PHASE 5 — Behavioural lifetime-plan generator

**Existing files modified** — `src/lib/quit-plan-builder.ts` (extended, not replaced; pharmacy surface stays gated off).

**New files created**
- `src/lib/clinical/plan-engine.ts` — the deterministic IF → THEN generator.
- `src/lib/clinical/plan-sections/` — one module per section group (timeline, triggers, rescue, maintenance, resources).
- `src/lib/clinical/plan-schema.ts` — the `plan_json` schema, including a validator that **rejects any plan containing medication content** while the release flag is false.

**Database changes** — none beyond Phase 3/4 columns.

**Server functions used** — `finalizeQuitPlan` runs the engine exactly once.

**Exact behaviour added** — one generated behavioural plan containing: personal profile; quit strategy; reasons and motivation; personal triggers; highest-risk trigger; preparation; quit day; first 24 hours; first 72 hours; days 4–7; weeks 2–4; months 2–3; months 4–6; months 7–12; after one year; craving management; withdrawal support; sleep; appetite and weight; stress; coffee; meals; driving; work; social situations; family and home environment; supporter instructions; one-puff rescue; one-cigarette rescue; one-day rescue; full-relapse recovery; relapse prevention; long-term maintenance; professional escalation; and Saudi resources when `jurisdiction = SA`.

IF → THEN logic throughout: sections are selected and worded from the answers — trigger sections render only for the triggers chosen, the highest-risk trigger leads the coping plan, withdrawal content follows reported prior experience, timeline pacing follows the chosen strategy and prior longest abstinence, supporter instructions follow the stated preference, and the resources block follows jurisdiction. The four rescue protocols are always included, for every user, regardless of strategy or readiness.

**Must NOT change** — no medication text may enter any section. The schema validator is the enforcement point, not developer discipline.

**Tests** — every section present for a minimal answer set and for a maximal one; trigger sections match selected triggers exactly; all four rescue protocols always present; the schema validator rejects a deliberately medication-contaminated fixture; the same answers produce byte-identical plans (determinism); Saudi resources absent for `GENERIC`.

**Rollback/safety** — the engine is pure and fully testable offline. If it throws, `finalizeQuitPlan` fails closed and the user keeps the conversation rather than receiving a partial plan.

---

# PHASE 6 — Single `plan_json` source of truth

**Existing files modified** — `src/lib/quit-plan.functions.ts` (`finalizeQuitPlan` becomes the sole place the engine runs); `src/lib/quit-plan-pdf.tsx`; `src/routes/quit-plan.$planToken.tsx`.

**New files created**
- `src/lib/clinical/plan-json.ts` — read helpers shared by every surface.

**Database changes** — migration writing the immutable plan into `quit_plans.plan` together with `plan_version`, `clinical_rule_version`, `jurisdiction`, `plan_variant`, and `generated_at`. A `plan_versions` table is added so regeneration creates a new version rather than mutating an existing plan.

**Server functions used** — `finalizeQuitPlan` (write), `getQuitPlan` (read).

**Exact behaviour added** — assessment → engine (once) → immutable `plan_json` → on-screen plan, PDF, download, emailed PDF, dashboard copy. **No surface re-runs the engine and no surface derives content independently.** Existing plans are never mutated; a change produces a new version row.

**Must NOT change** — the plan a user has already seen. Immutability is the guarantee that the emailed PDF and the dashboard copy match what was displayed.

**Tests** — the engine executes exactly once per finalize (call-count assertion); on-screen, PDF, emailed PDF and dashboard render from an identical `plan_json` hash; re-finalizing creates a new version and leaves the old one byte-identical.

**Rollback/safety** — additive schema. Old plans continue to render through the existing path. Rollback stops new-version writes without invalidating stored plans.

---

# PHASE 7 — On-screen plan, PDF, download, verified email, dashboard

**Existing files modified**
- `src/routes/quit-chat.tsx` — display the final plan immediately on screen at the end of the conversation.
- `src/lib/quit-plan-pdf.tsx` — professional Arabic RTL PDF using the Aqla identity, driven only by `plan_json`.
- `src/routes/quit-plan.$planToken.tsx` and `src/routes/dashboard.index.tsx` — surface the saved plan.
- `src/lib/email/send.ts` and `src/lib/quit-plan-emails.functions.ts` — real send with confirmed status.

**New files created**
- `src/components/quit-plan/PlanView.tsx` — the on-screen renderer.
- `src/lib/email-templates/quit-plan.tsx` — Arabic RTL plan email template.

**Database changes** — migration adding `email_status text` (`pending` / `sent` / `failed` / `not_requested`), `email_error text`, `email_attempts int` to `quit_plans`.

**Server functions used** — `finalizeQuitPlan`, `getQuitPlan`, plus the existing app-email send route.

**Exact behaviour added**
- The final plan appears on screen immediately, in the conversation's visual language.
- A `تحميل خطتي PDF` action downloads the PDF immediately, with no email and no account required.
- Email is sent **only** after explicit plan-email consent, and success is claimed **only** when the provider confirms it. `email_status` is written from the provider response, never optimistically.
- **Email failure never blocks** on-screen viewing, PDF download, or dashboard access. A failed send shows a retry control beside a fully working plan.
- The exact generated plan is saved to the user's dashboard and reopens identically.

**Must NOT change** — the plan content between surfaces. The PDF is a rendering of `plan_json`, never a second generation.

**Tests** — plan visible on screen without any network email call; PDF downloads and opens with correct RTL and no missing glyphs; with the email provider forced to fail, the UI shows failure and the plan, PDF and dashboard all still work; with success, status is `sent` only after confirmation; dashboard reopen produces an identical hash to the original.

**Rollback/safety** — email is the only network-dependent path and is fully non-blocking. PDF generation runs from stored data, so it works even if the engine is later changed.

---

# PHASE 8 — Privacy and governance enforcement

**Existing files modified**
- `src/lib/quit-plan.functions.ts` — the admin notification path is removed, not merely disabled by a flag.
- `src/routes/quit-chat.tsx` — insert the privacy notice.

**New files created**
- `src/lib/clinical/consent.ts` — consent capture and storage helper.
- `src/components/quit-chat/PrivacyNotice.tsx` — the pre-collection notice bubble.

**Database changes** — migration creating a `plan_consents` table (`plan_id`, `consent_type`, `consent_value`, `consent_timestamp`, `consent_version`), owner-only RLS with explicit GRANTs to `authenticated` and `service_role`, no `anon` grant.

**Server functions used** — `saveAnswer`, `finalizeQuitPlan`.

**Exact behaviour added**
- A short, plain-language **privacy notice appears before any sensitive medical question** — immediately preceding the medical-history and medication-list block. Final legal wording is not invented; it is a placeholder pending PDPL review.
- **Plan email requires explicit, separate consent**, stored as `consent_type = plan_email` with value, timestamp and version. It is never bundled with anything else.
- **Admin copy: disabled.** **Research copy: disabled.** **Identifiable health data to Aqla administration: disabled.** No claim that a plan was sent to administration appears anywhere.
- No research or admin identifiable data-sharing flow is built or activated. A de-identified projection may exist as a structural placeholder only, unpopulated.
- **Under-18 email delivery stays disabled** pending legal review; under-18 users receive on-screen plan and PDF download.

**Must NOT change** — the conversational flow. The privacy notice is one calm bubble, not an interstitial or a modal.

**Tests** — no outbound request carries identifiable data to any admin address; the privacy notice is rendered before the first sensitive question in every branch; email cannot send without a stored `plan_email` consent row; an under-18 answer disables the email path; `plan_consents` RLS denies cross-user reads.

**Rollback/safety** — this phase only removes disclosure and adds consent, so it cannot increase exposure. The admin path is deleted rather than flagged, so it cannot be re-enabled by a configuration mistake.

---

# Acceptance tests

| # | Case | Expected result |
|---|---|---|
| 1 | Saudi adult cigarette smoker, high FTND | Six-item FTND scored 0–10 via `scoreFtnd`; band shown as descriptive only; **no** treatment or medication statement; full behavioural plan; Saudi resources present |
| 2 | Saudi adult skips FTND | No FTND asked; `dependence_status = not_assessed`; full behavioural plan; no dependence interpretation; no medication content |
| 3 | Saudi user readiness = 2 | No dead end; strategy question offered with all four options; full behavioural plan whichever is chosen |
| 4 | Saudi user chooses reduce-to-quit | Reduce-to-quit plan variant with target date; all four rescue protocols still present |
| 5 | Saudi user with previous failed attempt | History branch asked; relapse reasons and withdrawal history shape the plan; no "failure" framing |
| 6 | Saudi user, stable cardiac disease | **No** safety gate fires; reassurance content; no urgent or emergency language; no medication content |
| 7 | Saudi user, recent cardiac event | Clinician-review-before-pharmacotherapy gate; behavioural plan proceeds in full; **not** urgent care |
| 8 | Saudi user, active chest pain | Emergency gate; conversation paused; **997** shown; plan suppressed |
| 9 | Saudi user, severe breathlessness | Emergency gate; 997 shown; plan suppressed |
| 10 | Saudi user, suicidal thoughts | Emergency gate; crisis routing; plan suppressed; no plan email |
| 11 | Saudi pregnant user | Pregnancy pathway, **not** a dead end; full behavioural plan; clinician referral via Sehhaty; **zero** medication content |
| 12 | Saudi under-18 user | Adolescent behavioural variant; clinician handoff; no medication content; **email disabled**, on-screen plan and PDF only |
| 13 | Saudi dual-product user | Complexity flag set; broader content; **no** automatic clinician gate from poly-use alone |
| 14 | Non-Saudi user in London | `jurisdiction = GENERIC`; full behavioural plan; **no** Sehhaty, 937 or 997; local clinician/pharmacist advice block |
| 15 | No supporter entered | Plan generates; supporter section replaced by a self-support alternative; no empty section |
| 16 | Multiple triggers entered | All matching trigger sections render; the highest-risk trigger leads the coping plan |
| 17 | One puff | One-puff rescue protocol present and distinct |
| 18 | One cigarette | One-cigarette rescue protocol present and distinct |
| 19 | One day of smoking | One-day rescue protocol present and distinct |
| 20 | Return to regular smoking | Full-relapse recovery protocol present and distinct |
| 21 | Email consented, provider succeeds | `email_status = sent` only after provider confirmation; success message accurate |
| 22 | Email consented, provider fails | `email_status = failed`; retry offered; **on-screen plan, PDF download and dashboard all still work** |
| 23 | Email consent refused | No send attempted; no consent row; plan, PDF and dashboard fully available |
| 24 | PDF generation | Arabic RTL renders correctly, no missing glyphs, Aqla identity, content identical to screen |
| 25 | Dashboard reopen | Byte-identical `plan_json`; identical rendered output |
| 26 | Medication scan | Automated scan of every generated plan, PDF and email across all fixtures finds **zero** medication names, doses, strengths, schedules or tapers |
| 27 | Admin/research copy | No outbound identifiable payload to any admin or research destination in any test; `admin_notified_at` never written |
| 28 | Non-Saudi identifier scan | 997, 937 and Sehhaty appear **nowhere** in any `GENERIC` output |
| 29 | Saudi 997 constraint | 997 appears **only** in outputs where an emergency gate fired; absent from every other Saudi fixture including footers and PDF boilerplate |
| 30 | Source-of-truth check | On-screen, PDF, emailed PDF and dashboard hashes are identical for the same plan |

Tests 26–29 run as automated content scans over the full fixture matrix, not as manual review, so a regression cannot pass silently.

---

# Sequencing and risk

Phases 1 and 8 reduce live risk and are safe to ship first and independently. Phase 2 unlocks everything else by making plans persist. Phases 3–5 are additive and testable offline. Phase 6 is the architectural keystone and should not be deferred past Phase 7, or the surfaces will drift. Each phase is independently revertable; only Phase 6 introduces a data-shape dependency, and its migration is additive and backward-compatible.

---

RELEASE 1 SCOPE CONTAINS PHARMACOTHERAPY: **NO**

IDENTIFIABLE ADMIN/RESEARCH COPY ENABLED: **NO**

CURRENT /QUIT-CHAT VISUAL EXPERIENCE PRESERVED: **YES**

EXISTING BACKEND REUSED: **YES**

ONE PLAN_JSON SOURCE OF TRUTH: **YES**

READY TO APPROVE FOR IMPLEMENTATION: **YES**
