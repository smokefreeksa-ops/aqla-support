# Aqla — Master Clinical Architecture Review (Analysis Only)

No code, UI, database, PDF or email changes were made. This is the review only.

Sources read in full: Evidence Matrix (45 evidence rules, 26 gap-audit items, 18 journey states, 7 medication rows, 3 conflicts, 27 sources) and the Pharmacotherapy Module (Parts A–C). Governing source = Evidence Matrix.

---

## A. Current flow map (as actually implemented)

`/quit-chat` (`src/routes/quit-chat.tsx`, 584 lines) is a **self-contained local state machine**. It does not call any server function, does not write to the database, and does not send email.

```text
state 0  welcome
state 1  name / alias                (free text)
state 2  city                        (free text)
state 3  primary product             (سجائر | فيب | شيشة | أكياس | غير ذلك)
state 4  offer dependence test       (yes -> 5, no -> 10, test is skippable)
state 5  amount per day              (0/1/2/3)
state 6  time to first dose          (3/2/1/0)
state 7  hard to abstain where banned(1/0)
state 8  more in the morning         (1/0)
state 9  score = sum, "X من 8", then a treatment statement
state 10 readiness 1-10              (<5 -> state 99 dead-end)
state 11 quit date                   (اليوم | غداً | بعد أسبوع)
state 12 triggers                    (5 fixed options, multi)
state 13 supporter name              (free text)
state 135 email                      (free text + regex)
state 14 "sending", 3s timer, sendEmailPayload() = console.log only,
         toast "تم إرسال الخطة للبريد بنجاح!", then window.print() / -> /dtx
```

Plan output = `PrintableQuitPlan.tsx`, a browser print view built from 10 local fields, with hard-coded trigger text and blue (non-Aqla) styling.

**Critical structural finding:** a second, far more capable pipeline already exists and is *not* wired to `/quit-chat` — `src/lib/quit-plan.functions.ts` (startQuitPlan / saveAnswer / finalizeQuitPlan / getQuitPlan / scheduleReminder), `quit-plan-builder.ts`, `quit-question-bank.server.ts`, `quit-plan-pdf.tsx`, and the `quit_plans` / `quit_plan_emails` / `quit_plan_reminders` tables (with `plan_token`, `pdf_url`, `email_sent_at`, `admin_notified_at`, `score_band`, `validated`, `risk_flag`). Used by `QuitPlanChat.tsx` and `/quit-plan/$planToken`. The recommended path is to make `/quit-chat` the conversational front end of *that* engine rather than build a third one.

---

## B. Keep / Modify / Remove / Add per current step

| Step | Verdict | Why |
|---|---|---|
| Welcome | KEEP | Tone and non-prescriptive framing are correct. |
| Name/alias | KEEP | |
| City | KEEP + MODIFY | Also use it to route to local MOH cessation clinic / 937. |
| Primary product | MODIFY | Must become a multi-select product inventory (dual/poly use) — Matrix row 0 makes this mandatory before any plan. |
| — | ADD AFTER | Age band (adolescent and pregnancy pathways supersede the adult engine). |
| "Do you want the test?" (skippable) | REMOVE as an opt-out | Dependence data is required input. Keep the friendly framing, remove the skip that silently produces a plan with no assessment. |
| 4 dependence items scored /8 | MODIFY (critical) | Labelled Fagerström but only 4 of 6 FTND items; max 8 not 10; bands wrong. See §5. |
| Score explanation + treatment sentence | MODIFY (critical) | Concludes "behavioural is enough" at low score and NRT at ≥5, from score alone — Gap Audit rows 0 and 1, severity Critical. |
| — | ADD AFTER | Quit history → previous treatment → medical/medication safety screen → safety gates → treatment candidates → preference. |
| Readiness 1–10 | MODIFY | `<5` currently dead-ends the user. Must branch to reduce-to-quit / motivational path (Matrix row 21). |
| Quit date | KEEP + MODIFY | Add "reduce first" and note medication-dependent timing. |
| Triggers (5 fixed) | MODIFY | Expand to routine / emotional / social / environmental map + single highest-risk trigger (Gap row 5). |
| Supporter | KEEP + MODIFY | Add supporter instruction block to plan. |
| Email | KEEP + MODIFY | Add explicit consent checkbox; separate research/admin consent. |
| "تم إرسال الخطة" toast | REMOVE (unsafe) | Success is asserted after a 3-second timer with no send. |
| Admin copy | MODIFY | Currently unconditional identifiable health data to admin. Must be consent-gated. |
| PrintableQuitPlan | MODIFY | Contains dopamine/detox/3-minute-craving style claims flagged Major in Gap rows 6–11. |

---

## C–D. Final conversational assessment + branching

Target: ~14 core questions for a simple case, expanding only when clinically triggered. Full per-question table (question_id, Arabic wording, purpose, answer type, options, required/conditional, branch condition, stored variable, consuming decision) is specified as the Phase 1 deliverable; the branching skeleton is:

```text
Q_AGE
  <18            -> ADOLESCENT PATHWAY, no varenicline/bupropion/cytisine, clinician gate
  female 12-55   -> Q_PREG -> if yes/breastfeeding -> PREGNANCY PATHWAY (behavioural first)
Q_PRODUCTS (multi)
  cigarettes     -> Q_CPD, Q_TTFC (+ remaining FTND items)
  vape           -> PS-ECDI items
  shisha         -> LWDS-11 items
  pouches/smokeless -> adapted screen, labelled non-validated
  >1 product     -> poly-use flag -> clinician review
Q_PREV_ATTEMPT
  no             -> skip Q_LONGEST, Q_PREV_AID, Q_PREV_AE
  yes            -> Q_LONGEST, Q_END_REASON, Q_PREV_AID (NRT/varenicline/bupropion/none),
                    if any aid -> Q_ADHERENCE + Q_PREV_AE
Q_MEDS (any regular prescription?)
  no             -> skip interaction block
  yes            -> Q_MED_LIST -> CYP1A2 (clozapine, olanzapine, theophylline) and
                    insulin / warfarin / others -> pharmacist alert on cessation
Q_CONDITIONS (multi: cardiac, respiratory, renal, seizure, psychiatric, none)
  cardiac        -> Q_RECENT_EVENT (<2 weeks -> clinician before pharmacotherapy)
  seizure/ED     -> bupropion excluded
  renal          -> varenicline dose is clinician-set, never app-set
  psychiatric    -> Q_MH_STABILITY -> clinician-gated
Q_READINESS
  <5             -> reduce-to-quit / motivational branch (plan still generated)
  >=5            -> Q_QUIT_DATE
Q_TREATMENT_PREF (behavioural only / NRT / prescription / undecided)
Q_TRIGGERS (multi) -> Q_TOP_TRIGGER
Q_SUPPORT -> Q_SUPPORT_METHOD
Q_EMAIL + Q_CONSENT(plan email) + Q_CONSENT(research/admin copy, separate)
```

---

## E. Safety gates

- **SELF-MANAGEMENT** — adult, single product, no red flags, no interacting medicines, prefers behavioural + OTC NRT.
- **PHARMACIST** — any OTC NRT dose/technique question, interacting medicine identified, persistent cravings on adequate NRT, mild adverse effects.
- **CESSATION SPECIALIST (MOH clinic / 937)** — high dependence, prior treatment failure, poly-use, reduce-to-quit, wants prescription therapy.
- **DOCTOR / GP** — pregnancy or breastfeeding, under 18, psychiatric history, seizure history, renal impairment, CYP1A2 medicines (clozapine/olanzapine/theophylline), any prescription-only pathway.
- **URGENT CARE** — cardiac event within the last 2 weeks, uncontrolled or worsening symptoms, serious medication adverse effect.
- **EMERGENCY (997)** — chest pain, severe breathlessness, coughing blood, suicidal ideation.

Rule: missing critical safety data ⇒ **no medication content is generated at all** (Journey Coverage row 0), the plan is issued behavioural-only with an explicit "requires pharmacist/clinician confirmation" block.

---

## F. Treatment-selection architecture

```text
assessment inputs (products, dependence, history, meds, conditions, age, pregnancy, preference)
  -> ELIGIBILITY      (adult? pregnancy? minor? data complete?)
  -> SAFETY CHECKS    (contraindications, interactions, recent cardiac event, seizure, renal, psychiatric)
  -> LOCAL CANDIDATES (Saudi-confirmed only: combination NRT, single NRT, varenicline [Rx];
                       bupropion and cytisine held behind a local-availability gate;
                       e-cigarettes and pouches NOT treatment candidates)
  -> PATIENT PREFERENCE (shared decision, not app-imposed)
  -> CLINICAL CONFIRMATION where required
  -> selected_treatment | pending_clinical_confirmation
```

No medication dose or schedule is generated by Aqla's own logic; dose text comes from a versioned, label-sourced content table keyed by product, never computed.

---

## G. Pharmacotherapy module — conflict audit

**1. `escalate = ftnd >= 6 || priorNRTfail`, and the module's overall score-driven structure**
→ PROBLEM: Matrix row 1 and Gap row 0 (Critical) — FTND must not alone decide medication.
→ EVIDENCE-ALIGNED: FTND is one input among health, medicines, contraindications, preference, prior treatment.
→ CONSEQUENCE: escalation must be a multi-input rule, not a score threshold.

**2. `return { recommendation: "COMBINATION_NRT" }` for every adult who passes the two gates**
→ PROBLEM: Matrix row 10 — "do not default everyone"; contradicts patient preference and the varenicline pathway.
→ EVIDENCE-ALIGNED: combination NRT is a *major first-line option*, presented alongside single NRT and varenicline for shared selection.
→ CONSEQUENCE: engine returns a ranked candidate set, not one recommendation.

**3. Patch dose `cpd > 10 ? 21mg : 14mg`, computed in app code**
→ PROBLEM: Matrix row 13 / Gap row 16 — dose must come from the current Saudi product label, and cpd alone is an incomplete determinant.
→ EVIDENCE-ALIGNED: label-sourced dose table, verified at plan generation, per registered product.
→ CONSEQUENCE: delete the arithmetic; add a versioned label content table.

**4. Fast-acting `highDep ? 4mg : 2mg`**
→ PROBLEM: same as (3), plus the 4 mg benefit is graded Moderate and is specific to highly dependent smokers.
→ EVIDENCE-ALIGNED: label-sourced strength selection with pharmacist confirmation.
→ CONSEQUENCE: no app-computed strength.

**5. `minDosesPerDay: 9` and fixed tapers (21×6wk, 14×2wk, 7×2wk)**
→ PROBLEM: invented schedule presented as instruction; not label-derived.
→ EVIDENCE-ALIGNED: schedule text from label only.
→ CONSEQUENCE: taper becomes content, not code.

**6. `cardiacSafe: true` returned unconditionally**
→ PROBLEM: no recent-cardiac-event exclusion; NICE/Matrix require a recent-event check.
→ EVIDENCE-ALIGNED: NRT is appropriate in stable cardiovascular disease; recent event (~2 weeks) requires clinician assessment first.
→ CONSEQUENCE: add `Q_RECENT_EVENT` and an urgent gate.

**7. "هذا الجمع فعّال بقدر فعالية الفارينيكلين" (combination NRT ≡ varenicline)**
→ PROBLEM: rests on one non-significant comparison (RR 1.02, 5 studies) while Matrix row 11 grades varenicline superior to single NRT and bupropion. Stating equivalence as fact is an overclaim.
→ EVIDENCE-ALIGNED: "no clear difference was found in the available head-to-head trials" with the varenicline pathway kept open.
→ CONSEQUENCE: rewrite the AR and EN sentence.

**8. `BLOCK_MINOR` / `BLOCK_PREGNANCY` as terminal blocks**
→ PROBLEM: Matrix rows 17–18 define *pathways*, not dead ends (NRT ≥12 with behavioural support; NRT in pregnancy with behavioural support, clinician-led).
→ EVIDENCE-ALIGNED: dedicated adolescent and pregnancy branches that still produce a behavioural plan and a referral.
→ CONSEQUENCE: two additional plan variants.

**9. Interaction list limited to clozapine / olanzapine / theophylline**
→ PROBLEM: Matrix row 19 is broader — stopping, starting *and restarting* smoking alters metabolism.
→ EVIDENCE-ALIGNED: broader screen plus a pharmacist alert, and a "restarting smoking" alert in relapse pathways.
→ CONSEQUENCE: interaction screen appears in both assessment and relapse flows.

**10. Bupropion and cytisine presented as available options**
→ PROBLEM: Conflict Register rows 1–2 — Saudi cessation-specific approval not confirmed.
→ EVIDENCE-ALIGNED: hold behind an explicit local-availability gate.
→ CONSEQUENCE: not shown to Saudi users until confirmed.

**11. Service data: "أكثر من ٢٦٠ عيادة", "937", "free of charge"**
→ PROBLEM: Executive Summary names **Sehhaty** as the current referral route; the module's clinic count (2023) and channel need verification.
→ EVIDENCE-ALIGNED: Sehhaty-first referral, other figures verified and dated.
→ CONSEQUENCE: single versioned Saudi-resources content block.

**12. FTND display banding (0–2 … 8–10)**
→ NO CONFLICT. Matches `src/lib/scoring.ts` `scoreFtnd`. Keep, and reuse that function rather than the `/quit-chat` inline sum.

---

## H. Plan personalisation map

| Plan section | Driven by |
|---|---|
| Personal profile | name, city, age band, product inventory, cpd |
| Dependence profile | instrument + score + band + note that it is one input |
| Reasons for quitting | personal reasons, supporter |
| Treatment pathway | eligibility + safety + candidates + preference + confirmation status |
| Medication instructions / safety | selected treatment + label content + interaction flags |
| Preparation, quit day | quit date, strategy (now / dated / reduce), treatment readiness |
| First 24h / 72h / days 4–7 | dependence, prior withdrawal experience, product |
| Weeks 2–4 → beyond 1 year | quit strategy, relapse-risk flags, prior longest abstinence |
| Trigger map + craving ladder | trigger multi-select + highest-risk trigger |
| Coffee / meals / driving / work / social / home | matched trigger subset only |
| Sleep, appetite, stress | reported prior withdrawal symptoms |
| Supporter instructions | supporter name + preferred support method |
| Missed dose / side effects / cravings not controlled | selected treatment |
| One-puff / one-cigarette / one-day / full-relapse | four distinct protocols, always included |
| Escalation + Saudi resources | safety gate level + city |

---

## I. One plan object → five surfaces

`finalizeQuitPlan` (already exists) becomes the single decision point: it runs the clinical engine once, writes an immutable `plan_json` plus `plan_id`, `user_id`, `assessment_id`, `plan_version`, `clinical_rule_version`, `generated_at`, `quit_date`, `language`, `pdf_version`, `email_status`, then:

- on-screen renderer, PDF renderer (`quit-plan-pdf.tsx`), download, email attachment and dashboard copy all read the **same stored `plan_json`** — no surface re-runs the engine;
- email status is written only from the provider's confirmed response; the UI shows "تم الإرسال" only when `email_status = 'sent'`, otherwise it shows a retry button while plan display and PDF download stay available;
- the admin/research copy is a separate consented job reading a de-identified projection, never triggered implicitly.

---

## J. Data model (proposed, not created)

Reuse and extend rather than duplicate: `quit_plans` already has plan/token/pdf/email/admin fields. Proposed set — `users` (exists), `cessation_assessments`, `tobacco_use`, `dependence_assessments`, `quit_history`, `medical_safety`, `current_medications`, `treatment_history`, `treatment_options`, `selected_treatment`, `triggers`, `support_partners`, `quit_plans` (extend), `plan_versions`, `clinical_rules`, `evidence_sources` (seeded S01–S27), `rule_versions`, `safety_escalations`, `pdf_records`, `email_delivery_records`. All health tables owner-only RLS with explicit GRANTs; research access via consented de-identified view only.

---

## K. Current project gap report

- **ALREADY IMPLEMENTED:** conversational UI and RTL identity; `quit_plans`/`quit_plan_emails`/`quit_plan_reminders`; server functions for start/save/finalize/retrieve; PDF renderer; email infrastructure; correct FTND banding in `src/lib/scoring.ts`; cohort/escalation logic in `assignCohort`; SOS craving feature; dashboard.
- **PARTIALLY IMPLEMENTED:** dependence assessment (4 of 6 FTND items); triggers (5 fixed); quit date (no reduce-to-quit); PDF (short, not lifetime); admin copy (exists, not consent-gated).
- **MISSING:** medical/medication safety screen; drug-interaction screen; quit history and previous-treatment module; treatment-selection engine; combination NRT and varenicline pathways; adolescent and pregnancy pathways; quit-day and 0–72h protocols; separate one-puff / one-cigarette / one-day / relapse protocols; longitudinal months 2–12+ plan; evidence/rule versioning; plan versioning.
- **INCORRECT:** score labelled Fagerström at max 8; treatment conclusion drawn from score alone; readiness <5 dead-ends; `/quit-chat` persists nothing so the dashboard is not actually activated.
- **POTENTIALLY UNSAFE:** false "email sent" confirmation; unconsented identifiable health data to admin; skippable dependence assessment still yielding a plan; deterministic dopamine/detox/craving-duration claims in the printable plan.

---

## L. Implementation phases (recommended order)

1. **Truthfulness fixes** — remove the false email toast, remove the score-alone treatment sentence, correct the instrument label and max, un-dead-end readiness <5. No new features.
2. **Wire `/quit-chat` to the existing backend** — startQuitPlan / saveAnswer / finalizeQuitPlan, so plans persist, tokens exist and the dashboard genuinely activates. UI unchanged.
3. **Complete the assessment** — full FTND (or product-matched instrument), product inventory, age/pregnancy, quit history, previous treatment, with branching.
4. **Safety layer** — medical + medication screen, interaction screen, the six escalation gates, adolescent and pregnancy pathways.
5. **Treatment-selection engine** — candidates + preference + confirmation status, with a versioned label-sourced content table. No app-computed doses.
6. **Lifetime plan generator** — all sections in §H, IF→THEN structure, four rescue protocols, single `plan_json`.
7. **Delivery** — on-screen, PDF, download, verified email with retry, dashboard copy, all from `plan_json`.
8. **Governance** — consent model, de-identified research projection, `evidence_sources` and `rule_versions` seeded, evidence IDs preserved in output.

---

## Final counts

- Current assessment questions found: **11** (name, city, product, test-consent, cpd, TTFC, hard-to-abstain, morning-heavy, readiness, quit date, triggers, supporter, email = 13 prompts; 4 are scored dependence items)
- Safe to keep unchanged: **4** (name, product-consent framing, supporter, triggers-as-a-concept)
- Requiring modification: **8**
- New required questions: **~18** (age, pregnancy, product inventory, 2 missing FTND items, prior attempt, longest abstinence, end reason, prior aids, adherence, adverse effects, meds y/n, med list, conditions, recent cardiac event, treatment preference, quit strategy, top trigger, support method, consents)
- Conditional questions: **12**
- Clinical safety gates: **6** levels, **11** distinct trigger conditions
- Pharmacotherapy conflicts: **11** (plus 1 verified non-conflict)
- Missing major cessation domains: **11**
- Existing components requiring removal: **3** (mock `sendEmailPayload`, skip-the-assessment branch, unconditional admin copy)
- Existing components requiring modification: **5** (`quit-chat.tsx`, `PrintableQuitPlan.tsx`, `quit-plan-builder.ts`, `quit-plan-pdf.tsx`, `quit-plan.functions.ts`)
- New components required: **~9** (safety screen, interaction screen, quit-history module, treatment-selection engine, label content table, lifetime plan generator, rescue-protocol engine, consent module, evidence/rule registry)

---

## Unresolved clinical questions

1. Saudi cessation-specific registration status of **bupropion** — not confirmed in this evidence pass.
2. Saudi availability/approval of **cytisine / cytisinicline** — not confirmed.
3. Exact Saudi-registered **short-acting NRT forms and strengths** — the Matrix confirms the patch only.
4. Current **Saudi label** text for varenicline dosing, renal adjustment and duration — must be sourced before any dose is displayed.
5. Whether the referral channel should be **Sehhaty**, 937, or both, and the current verified clinic count.
6. Jurisdictional Aqla position on **nicotine e-cigarettes** (Cochrane vs NICE vs WHO) — requires an explicit Saudi policy decision.
7. Whether Aqla will offer a **pregnancy pharmacotherapy** branch at all, or refer out entirely.
8. Minimum age for app self-service versus mandatory clinician handoff.
9. Legal/ethical basis and consent wording for any **research/admin copy** of identifiable health data.
10. Whether a **non-clinician-reviewed** treatment candidate list may be shown at all, or whether every medication mention requires clinician confirmation first.
