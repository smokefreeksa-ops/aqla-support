# Aqla — Release 1 Implementation Plan (Behavioural Only) — Corrected Final

Scope is strictly Release 1: Saudi-first behavioural cessation support. No medication
content, no dosing, no identifiable admin/research copy, no unvalidated instruments.

## Release gates

| Gate | Value |
|---|---|
| Pharmacotherapy content generated | No |
| Dependence instrument implemented | FTND only (cigarette users) |
| Identifiable admin/research email copy | No (hard-disabled) |
| Current `/quit-chat` visual experience | Preserved |
| Existing `quit_plans` backend reused | Yes (extended, not replaced) |
| One immutable `plan_json` | Yes |
| Jurisdictions | `SA` (Saudi routing), `GENERIC` (no Saudi identifiers) |
| Third engine created | No |

## 1. Dependence instruments

Release 1 implements exactly one instrument: the **full 6-item FTND (0–10)** via the
existing `scoreFtnd`, offered **only to cigarette users**, and **optional** — declining
still yields a complete plan.

Explicitly NOT used in the quit-plan engine in Release 1, even though functions exist in
`scoring.ts`: Penn State e-cigarette index, LWDS-11, HONC, adapted oral-nicotine/pouch
score, and any other product-specific dependence instrument. Each requires a separate
evidence and validation review before extension into this engine.

For vape, shisha, pouches, heated tobacco or other non-cigarette products the engine
collects **descriptive use information only** (what, how often, when first use occurs,
where). It produces no validated score, no dependence band, and no medication content.
`dependence_status` for those users is recorded as `descriptive_only`.

## 2. Four distinct lapse / relapse pathways

Four separate smoking states, each with its own IF → THEN recovery pathway. These are
not craving techniques and are not interchangeable.

- **A. One puff** → stop immediately; explicitly not framed as failure; identify the
  trigger that produced it; resume the quit plan now.
- **B. One cigarette** → treat as a lapse; remove remaining cigarettes and access;
  identify what happened; restart abstinence immediately; activate additional support.
- **C. One day of smoking** → higher-risk lapse; structured recovery review; restore the
  quit plan immediately; increase behavioural and support intensity.
- **D. Return to regular smoking** → relapse-recovery pathway; no shame or failure
  framing; reassess triggers and the previous plan; choose a new quit or reduction
  strategy; professional cessation support where appropriate.

Craving techniques (urge surfing, delay/distract/drink, paced breathing, environment
change) live in a **separate craving-management section** and never substitute for the
four pathways above.

## 3. Lifetime timeline

The plan is a one-time generated **lifetime** plan. Generated sections:

preparation before quit day · quit day · first 24 hours · first 72 hours · days 4–7 ·
weeks 2–4 · months 2–3 · months 4–6 · months 7–12 · after one year · long-term relapse
prevention and maintenance.

## 4. Under-18 pathway

Being under 18 does **not** suppress plan generation. Under-18 users receive an
adolescent behavioural cessation pathway, clinician handoff/referral where appropriate,
no pharmacotherapy and no medication content, on-screen plan and PDF download available,
and **email delivery disabled pending legal review** (`email_status = disabled_minor`).

Only a genuine emergency safety gate suppresses ordinary plan generation.

## 5. Mental-health pathway

- **Stable / monitored** → behavioural plan plus appropriate supportive content. Not suppressed.
- **Unstable or unclear, no emergency red flag** → clinician review/handoff *plus*
  behavioural support as appropriate.
- **Suicidal ideation or other genuine emergency** → emergency pathway; ordinary plan
  generation pauses.

## 5b. Cardiac and respiratory routing

The full six-level ladder is preserved. "Active symptom" is never treated as an automatic
emergency. Four distinct states:

- **Stable cardiac history** → behavioural plan continues normally; no urgent or
  emergency routing.
- **Recent cardiac event, no current emergency symptoms** → clinician review and
  appropriate medical follow-up; the behavioural plan may continue; not automatically
  urgent and not emergency.
- **Active or worsening symptoms without emergency red flags** → urgent / same-day
  clinical assessment. 997 is **not** shown.
- **True emergency red flags** — chest pain now suggestive of an emergency, severe
  breathlessness, coughing blood, loss of consciousness or other serious acute
  deterioration, suicidal ideation or immediate risk of self-harm → emergency pathway.
  997 is shown **only** when jurisdiction is `SA`; `GENERIC` uses the local-emergency
  wording in §10.

997 can never surface from any level below the emergency gate.

## 5c. Privacy notice placement

The privacy notice is shown **after** the minimal identity/location setup and **before**
the first health-related question — tobacco/nicotine use, dependence, pregnancy, medical
history or any other health item. It is not deferred to the medical-history section.

In plain Arabic it explains, at minimum: that Aqla collects health-related answers to
build the personalised quit plan; why those answers are needed; how they will be used;
that identifiable admin/research sharing is disabled in Release 1; and that email
delivery is separate and requires its own explicit consent.

The exact wording is a placeholder and **requires formal PDPL/legal review before public
production**. No final legal wording is invented here.



## 6. Pharmacotherapy feature gate

`SAUDI_MEDICATION_CONTENT_APPROVED = false` is a hard release gate. **Flipping the flag
alone must never be sufficient to release pharmacotherapy.** Medication content may only
render when BOTH conditions hold:

1. `SAUDI_MEDICATION_CONTENT_APPROVED === true`, AND
2. a valid, approved `clinical_rule_version` / `medication_content_version` is present
   in the approved-versions registry.

Future activation additionally requires: unresolved Saudi regulatory evidence resolved;
Saudi medication availability confirmed; current product labels stored and versioned;
Arabic pharmacotherapy content clinically reviewed and back-translated; clinical
governance sign-off; pharmacotherapy-specific acceptance tests passing. In Release 1
medication output is structurally impossible.

## 7. Data and audit architecture

The existing `quit_plans` table was inspected. It has `intake_answers`, `plan`,
`plan_token`, `score_total`, `score_band`, `risk_flag`, `validated`, `assessment_tool`,
`readiness`, `email_sent_at`, `status`. It does **not** currently store the required
audit fields, so a **migration is required** — the earlier "no migration needed" claim
was wrong.

Added to `quit_plans` (no new duplicate table, no new engine):

`country_code`, `jurisdiction`, `plan_variant`, `dependence_status`, `quit_strategy`,
`safety_gate_level`, `safety_flags` (jsonb), `plan_version`, `clinical_rule_version`,
`generated_at`, `email_status`, `plan_email_consent`, `plan_email_consent_at`,
`plan_email_consent_version`.

All of these are persisted server-side; none may exist only in browser state. Consent is
persistently stored with its timestamp and the consent-text version shown to the user.
Migration includes GRANTs and keeps existing RLS behaviour unchanged.

## 8. One immutable `plan_json`

Assessment → behavioural decision/personalisation engine runs **once** → immutable
`plan_json` → rendered identically by on-screen plan, PDF, download, emailed PDF, and
dashboard. No surface regenerates clinical or behavioural content independently.

Regeneration creates a **new version** (`plan_version` incremented, new row/version
record). An existing plan the user already received is never silently modified.

## 9. Money-saved content

No personalised money figure is produced unless the spend information was actually
collected. The flow asks one optional cost question when the user wants savings
included; if skipped, the plan uses general non-numerical motivation. Product prices are
never invented or assumed.

## 10. Generic / non-Saudi safety

`GENERIC` gets the full behavioural plan, with no Sehhaty, no 937, no 997, no SFDA
content, and no Saudi medication content. No foreign emergency number is invented. Urgent
wording is: «اتصل برقم الطوارئ المحلي في بلدك أو اطلب المساعدة الطبية العاجلة.» until
that jurisdiction has an approved profile.

`SA` uses Sehhaty for booking, 937 for MOH health support, and 997 only for a true
emergency.

## Implementation phases

1. **Truthfulness** — remove the mock email function and unconditional success toast in
   `/quit-chat`, remove "وإلى إدارة أقلع" copy, remove the score-triggered NRT/patch
   sentence, remove stale clinic/cost/success-rate claims.
2. **Schema + audit** — migration adding the fields in §7.
3. **Backend wiring** — `/quit-chat` calls the existing `startQuitPlan`, `saveAnswer`,
   `finalizeQuitPlan`; one row per conversation, resumable, no duplicates.
4. **Assessment runner** — data-driven bilingual question bank; jurisdiction captured
   first; optional FTND for cigarette users only; descriptive-only for other products;
   readiness below 5 opens four motivational options and never dead-ends.
5. **Safety ladder** — six levels; three-way cardiac logic; §4 and §5 pathways; §10 routing.
6. **Plan engine** — deterministic IF → THEN generator producing the §3 timeline, the
   §2 four pathways, the separate craving section, per-trigger coping lines, support
   script, follow-up schedule, §9 money handling, and cited references.
7. **Delivery** — on-screen plan, always-available PDF download, email only with stored
   explicit consent and truthful provider-result messaging.
8. **Privacy and governance** — pre-health privacy notice; admin/research disclosure
   paths removed from code, not merely hidden.

## Preserved design

Existing `/quit-chat` appearance, conversational bubbles, Arabic RTL, Aqla green
identity, warm conversational wording, one question at a time, existing `quit_plans`
backend, no third engine, behavioural-only Release 1, SA + GENERIC model, Sehhaty/937/997
rules, identifiable admin/research copy disabled, consent-gated email, PDF/download/
dashboard delivery, no pharmacotherapy.

## Acceptance tests

1. FTND is offered only to cigarette users.
2. FTND totals 0–10 across all six items and is order-independent.
3. Declining FTND still produces a complete plan.
4. Vape, shisha, pouch and other non-cigarette users never receive a dependence score.
5. Non-cigarette users never receive a dependence band.
6. No Penn State, LWDS-11, HONC or adapted-oral instrument is invoked by the engine.
7. The one-puff pathway is generated with stop / not-failure / identify-trigger / resume.
8. The one-cigarette pathway is generated with lapse framing, access removal, restart, support.
9. The one-day pathway is generated with structured recovery review and increased intensity.
10. The regular-smoking relapse pathway is generated with no shame framing and strategy reassessment.
11. All four pathways are demonstrably different text and different logic.
12. Craving techniques appear only in the craving section, never replacing the four pathways.
13. Preparation, quit day, 24h, 72h and days 4–7 sections are generated.
14. Weeks 2–4 generated.
15. Months 2–3 generated.
16. Months 4–6 generated.
17. Months 7–12 generated.
18. After-one-year section generated.
19. Long-term maintenance / relapse-prevention section generated.
20. Under-18 users still receive a full behavioural plan and PDF download.
21. Under-18 email delivery is disabled and recorded as such.
22. Stable mental-health condition does not suppress behavioural support.
23. Unstable mental-health without red flags yields clinician handoff plus behavioural support.
24. Suicidal ideation triggers the emergency pathway and pauses ordinary plan generation.
25. Setting the medication flag true alone does not render any medication content.
26. Medication content requires flag true AND an approved clinical rule version.
27. No medication name, dose, or product appears anywhere in Release 1 output.
28. Jurisdiction is captured before any location or service question.
29. `GENERIC` output contains no Sehhaty, 937, 997 or SFDA reference and no invented foreign number.
30. `SA` output uses Sehhaty for booking, 937 for support, 997 only for emergency.
31a. Stable cardiac history triggers no escalation; the behavioural plan continues.
31b. Recent cardiac event without emergency symptoms routes to clinician review, not urgent or emergency.
31c. Active or worsening symptoms without red flags route to urgent / same-day care and never show 997.
31d. True emergency red flags route to the emergency pathway; 997 appears only when jurisdiction is `SA`.
31e. 997 never appears from any safety level below the emergency gate.

32. Email consent value, timestamp and consent version are persisted server-side.
33. Email is only attempted when stored consent is true.
34. Provider not configured produces a truthful message plus a working plan link.
35. No user-facing text claims data was sent to Aqla administration.
36. Screen, PDF, email and dashboard render byte-identical plan content from one `plan_json`.
37. Regenerating a plan creates a new version; the prior version is unchanged.
38. `country_code`, `jurisdiction`, `plan_variant`, `dependence_status`, `quit_strategy`,
    `safety_gate_level`, `safety_flags`, `plan_version`, `clinical_rule_version`,
    `generated_at` and `email_status` are all persisted.
39. No personalised money figure appears unless spend data was collected.
40. The privacy notice appears after identity/location setup and before the first
    health-related question, and its wording is flagged for PDPL/legal review.


---

FTND IS THE ONLY DEPENDENCE INSTRUMENT IMPLEMENTED IN RELEASE 1: YES

ONE-PUFF, ONE-CIGARETTE, ONE-DAY AND REGULAR-RELAPSE PATHWAYS ARE FOUR DISTINCT PROTOCOLS: YES

PLAN EXTENDS BEYOND 12 MONTHS: YES

UNDER-18 BEHAVIOURAL PLAN REMAINS AVAILABLE: YES

MEDICATION FLAG ALONE CAN ACTIVATE PHARMACOTHERAPY: NO

CONSENT AND CLINICAL VERSIONING ARE PERSISTED: YES

ONE IMMUTABLE PLAN_JSON SOURCE OF TRUTH: YES

READY TO APPROVE FOR IMPLEMENTATION: YES
