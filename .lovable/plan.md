# Aqla — Release 1 Implementation Plan (Behavioural Only)

Scope is strictly Release 1: Saudi-first behavioural cessation support. No medication
content, no dosing, no identifiable admin/research copy, no invented instruments.

## Release gates

| Gate | Value |
|---|---|
| Pharmacotherapy content generated | No |
| Identifiable admin/research email copy | No (hard-disabled) |
| Current `/quit-chat` visual experience | Preserved |
| Existing `quit_plans` backend reused | Yes |
| One `plan_json` source of truth | Yes |
| Supported jurisdictions | `SA` (full Saudi routing), `GENERIC` (no Saudi identifiers) |

A single flag file holds `SAUDI_MEDICATION_CONTENT_APPROVED = false`. Every medication
branch reads it. Flipping it is the only change needed for a future pharmacotherapy release.

## Phase 1 — Truthfulness pass

Remove every claim the system cannot honour today.

- Delete the mock `sendEmailPayload` console-log function and the unconditional
  "تم إرسال الخطة للبريد بنجاح" toast in `/quit-chat`.
- Remove "وإلى إدارة أقلع" (sent to Aqla administration) from all user-facing copy.
- Remove the dependence-score sentence that recommends NRT patches ("أنصحك جداً تدمج
  بدائل النيكوتين الطبية NRT مثل اللصقات"). Replace with a behavioural interpretation plus
  a neutral "discuss options with a pharmacist or clinician" line — no product, no dose.
- Remove stale clinic counts, cost claims, and any success-rate number not traceable to a
  cited source.
- Gate `PrintableQuitPlan` and `quit-plan-builder` medication sections behind the flag.

## Phase 2 — Backend wiring

`/quit-chat` currently runs a local state machine with no persistence. Wire it to the
existing server functions in `src/lib/quit-plan.functions.ts`:

- `startQuitPlan` on first user answer → returns `plan_id` + `plan_token`.
- `saveAnswer` after each answered question (fire-and-forget, resumable).
- `finalizeQuitPlan` at completion → writes `plan_json`, returns the shareable plan URL.

No new tables. No new edge functions. Answers are stored in `intake_answers`, the built
plan in `plan`.

## Phase 3 — Assessment and branching

A data-driven question bank (42 items) replaces hardcoded switch states, so questions can
be reordered without breaking scoring.

- Jurisdiction is captured first (`SA` / `GENERIC`) and drives every downstream route.
- Identity, age band, sex, pregnancy/breastfeeding status.
- Multi-product inventory (cigarettes, vape, shisha, pouches, other) with a poly-use
  complexity flag when two or more are active.
- Optional dependence test: full 6-item FTND (max 10) for cigarettes; the validated
  product-specific instruments already in `src/lib/scoring.ts` otherwise. Declining is a
  supported path, not a dead end.
- Readiness 0–10. Below 5 opens a motivational choice of four options (quit now, set a
  future date, reduce-to-quit, not ready yet) instead of ending the conversation.
- Triggers, past attempts, support person, follow-up preference.

## Phase 4 — Safety escalation ladder

Six levels, evaluated from the answers rather than free text: self-management,
pharmacist, cessation specialist, GP/doctor, urgent care, emergency.

- Three-way cardiac logic: stable history / recent event / active symptoms — only the
  third routes to emergency.
- Mental-health instability and under-18 route to a clinician handoff before plan
  generation.
- Pregnancy and breastfeeding route to a dedicated behavioural branch with clinician-led
  review, never a dead end.
- `SA`: Sehhaty for booking, 937 for health support, 997 for emergency.
- `GENERIC`: local emergency number and local health service, no Saudi identifiers.

## Phase 5 — Plan generation

A deterministic IF→THEN generator (no AI, no randomness) produces the behavioural plan:
quit or reduction date, 24h/72h/week-1/week-2/month-1 timeline, a per-trigger coping
line for each trigger selected, four rescue protocols (urge surf, delay-distract-drink,
breathing, environment change), relapse recovery, support-person script, money saved,
follow-up schedule, and cited references.

## Phase 6 — Single source of truth

One `plan_json` object is written once at finalize. The on-screen plan, the PDF, the
email, the shared plan link, and the dashboard all render from that same object. Nothing
downstream re-derives content.

## Phase 7 — Delivery

- Immediate on-screen plan plus a download button that always works offline of email.
- Professional RTL A4 PDF using the Aqla logo and green identity.
- Email only after an explicit, separate `plan_email` consent checkbox. The result
  message reflects the real provider response — sent, queued, or "email is not available
  right now, your plan is downloadable and saved at this link".

## Phase 8 — Privacy and governance

- A short privacy notice shown before any health question is asked.
- Admin/research disclosure paths removed from code, not just hidden in the UI.
- Every clinical statement carries a source; unresolved Saudi items stay gated.

## Acceptance tests

1. No medication name, dose, or product appears anywhere in a generated plan.
2. Flipping the medication flag is the only edit needed to expose medication branches.
3. No success toast fires unless the provider returned success.
4. Provider not configured → user sees a truthful fallback with a working plan link.
5. No user-facing text claims data was sent to Aqla administration.
6. High dependence score produces behavioural guidance plus a neutral clinician line.
7. `startQuitPlan` creates exactly one row per conversation.
8. Refreshing mid-conversation does not create a duplicate plan row.
9. Every answered question is persisted in `intake_answers`.
10. `finalizeQuitPlan` writes `plan_json` once and returns a resolvable plan URL.
11. Jurisdiction is asked before any location or service question.
12. `GENERIC` output contains no Saudi identifier (Sehhaty, 937, 997, SFDA).
13. `SA` output contains Sehhaty for booking and 937 for support.
14. Declining the dependence test still produces a complete plan.
15. FTND totals 10 at maximum with all six items answered.
16. FTND scoring is unchanged when question order changes.
17. Two or more active products set the poly-use complexity flag.
18. Readiness below 5 shows four options and never ends the conversation.
19. Under-18 routes to clinician handoff before plan generation.
20. Pregnancy routes to the behavioural pregnancy branch, not a dead end.
21. Stable cardiac history does not trigger emergency routing.
22. Active cardiac symptoms trigger emergency routing (997 in `SA`).
23. Reported mental-health instability triggers clinician handoff.
24. Each selected trigger yields at least one specific coping line.
25. The same answers always generate an identical plan.
26. Screen, PDF, email, and dashboard render identical plan content.
27. The PDF renders RTL with correct Arabic shaping and no clipped text.
28. Download works when email consent was declined.
29. Email is only attempted when `plan_email` consent is true.
30. The privacy notice appears before the first health question.

## Technical notes

- New: `src/lib/clinical/release-flags.ts`, `src/lib/clinical/questions.ts`,
  `src/lib/clinical/safety.ts`, `src/lib/clinical/jurisdiction.ts`.
- Modified: `src/routes/quit-chat.tsx` (runner over the question bank, same visuals),
  `src/lib/quit-plan-builder.ts` (behavioural generator + flag gating),
  `src/lib/quit-plan.functions.ts` (admin email path removed, consent-gated user email),
  `src/components/PrintableQuitPlan.tsx` (renders from `plan_json`).
- No schema migration required; `quit_plans` already has `intake_answers`, `plan`,
  `plan_token`, `score_total`, `score_band`, `risk_flag`.
