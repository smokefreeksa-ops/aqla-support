# Aqla — Saudi Clinical Evidence Resolution Checklist (Release 1)

Analysis only. No code, UI, database, content or email changes have been made.

## Scope lock for Release 1

- **Primary supported jurisdiction: Saudi Arabia.** Saudi Arabia is the **only** jurisdiction permitted to generate medication-specific clinical content at launch.
- **Non-Saudi users are fully supported**, in a behavioural-only mode: trigger planning, craving support, quit-day planning, lapse and relapse protocols, and long-term cessation support. They are not blocked, and no plan is withheld.
- **For non-Saudi users the engine hard-suppresses:** Saudi emergency numbers (997), 937, Sehhaty, MOH clinic listings, Saudi medication availability, and any dose, strength, schedule or taper. In their place the plan renders a single non-Saudi guidance block: consult a local doctor, pharmacist or cessation service for medication-specific advice. No foreign emergency number is invented.
- **`jurisdiction_profiles` is retained and built now**, with exactly two profiles populated at launch — `SA` (full) and `GENERIC` (behavioural-only) — so UK and other jurisdictions become data additions, not a redesign. **No UK-specific medication or clinical content is built in Release 1.**
- The medication layer stays behind a single feature gate: `jurisdiction = SA` **and** `saudi_medication_content_approved = true`. Until every blocking item below is resolved, that flag stays false and Aqla ships Saudi behavioural content only.

Sources reviewed for status below: Evidence Matrix (Evidence Matrix 45 rules, Medication Safety 7 rows, Conflict Register 3 rows, Source Register 27 sources, Executive Summary) and `Aqla_Pharmacotherapy_Module_AR_EN.md` Parts A–E in full. Nothing outside these documents has been assumed, and no Saudi regulatory fact has been inferred.

Legend — **Blocks:** what cannot ship until resolved. **PH** = pharmacotherapy layer only. **ALL** = whole quit plan. **NONE** = no block.

---

## S1 — Bupropion: Saudi cessation registration and status

- **Issue:** The Pharmacotherapy Module (Parts A.1, B) presents bupropion as an available option. Its Saudi cessation-specific registration is not established in the supplied evidence.
- **Why it matters:** Presenting a medicine that is not registered for cessation in Saudi Arabia, or listing it as an option a user can request, is a regulatory and clinical safety exposure, and it distorts the candidate set shown at the shared-decision step.
- **Exact evidence/source required:** Current SFDA registered-products entry for bupropion, showing the approved indication text and whether smoking cessation is included; plus the current Saudi MOH cessation protocol statement on bupropion. Dated, with a citation added to the Source Register.
- **Current status:** **UNRESOLVED.** Evidence Matrix row 14 records jurisdiction as "Global; local check". Conflict Register row 2 states verification of the current SFDA indication is required before any Saudi recommendation.
- **What Aqla must do if unresolved:** Bupropion is excluded from the Saudi candidate set entirely. It is not named, not offered, and not described as unavailable in a way that implies it could be requested. If a user names it, Aqla routes to a clinician without commenting on availability.
- **Blocks implementation:** Blocks the bupropion pathway only. Does not block release.
- **Blocks:** PH (bupropion pathway only)

---

## S2 — Cytisine / cytisinicline: Saudi approval and status

- **Issue:** Cytisine appears in the module's evidence base as an effective agent. Saudi approval status is not established.
- **Why it matters:** Same regulatory exposure as S1. Cytisine additionally attracts user interest as a low-cost option, so an unqualified mention drives off-label or cross-border self-sourcing.
- **Exact evidence/source required:** SFDA registration record for cytisine/cytisinicline, or a written confirmation of non-registration; plus the Saudi MOH position. Dated and cited.
- **Current status:** **UNRESOLVED.** Evidence Matrix row 15 sets jurisdiction as "Jurisdiction-specific". Conflict Register row 1 states a local availability gate is mandatory.
- **What Aqla must do if unresolved:** Cytisine is excluded from the Saudi candidate set and is not named in Saudi-facing content. The Matrix row 16 UK older-adult cytisinicline rule is not implemented in Release 1.
- **Blocks implementation:** Blocks the cytisine pathway only.
- **Blocks:** PH (cytisine pathway only)

---

## S3 — Registered short-acting NRT forms and strengths in Saudi Arabia

- **Issue:** Part D of the module specifies fast-acting NRT at 2 mg and 4 mg and assumes combination NRT is deliverable. The Evidence Matrix confirms Saudi availability for the **patch only**. Which short-acting forms (gum, lozenge, inhalator, spray, mouth spray) are registered and at what strengths is not established.
- **Why it matters:** This is the single highest-impact unknown for Release 1. Combination NRT — the module's headline recommendation — requires a patch **plus** a short-acting form. If registered short-acting forms are unconfirmed, Aqla cannot recommend combination NRT at all, and the entire Part B recommendation collapses to single-agent patch or to behavioural-only.
- **Exact evidence/source required:** SFDA registered-products list filtered to nicotine replacement therapy, giving form, strength, pack, and prescription-versus-OTC status for each registered product; plus confirmation of pharmacy availability. Dated, cited, and loaded into the `medication_label_content` table.
- **Current status:** **UNRESOLVED.** Evidence Matrix row 13 confirms patch availability in Saudi Arabia; short-acting forms are not confirmed in the supplied evidence. The module's own "⚠ Before publication" note states Saudi NRT availability, brands and pricing must be confirmed.
- **What Aqla must do if unresolved:** No combination-NRT recommendation is generated. No 2 mg or 4 mg strength is displayed. Saudi users receive the behavioural plan plus a pharmacist-consultation block for NRT selection. Patch-only content may ship only once S4-equivalent label text for the patch is confirmed.
- **Blocks implementation:** Blocks the entire pharmacotherapy layer, including the combination-NRT pathway that Part B is built around.
- **Blocks:** PH (entire layer)

---

## S4 — Current Saudi label: varenicline dosing, renal adjustment, duration

- **Issue:** No dose, titration, renal adjustment or treatment duration may be generated by Aqla logic; all such text must be read from the current Saudi label. That label text has not been supplied.
- **Why it matters:** Varenicline is graded superior to single NRT and bupropion in the Evidence Matrix, so it is a real candidate for high-dependence Saudi users. Displaying dosing that does not match the current Saudi label — or computing it, as Part B and Part D currently do — is a direct patient-safety defect. Renal adjustment in particular must be clinician-set, never app-set.
- **Exact evidence/source required:** Current SFDA-approved Saudi prescribing information for varenicline: starting titration, maintenance dose, renal-impairment guidance, standard and extended treatment duration, and the prescription-status statement. Version-dated and stored in `medication_label_content`.
- **Current status:** **UNRESOLVED.** Evidence Matrix row 12 addresses Saudi varenicline availability but the supplied evidence does not contain the label text. Part D of the module contains an app-authored dose table, which this review has already rejected as an authority (conflict items 3–6 of the architecture review).
- **What Aqla must do if unresolved:** The varenicline pathway may exist as a *referral* outcome — "this may be an option, a clinician will decide" — with **no dose, no titration, no duration and no renal guidance displayed**. Aqla never generates the numbers.
- **Blocks implementation:** Blocks all varenicline dosing content. Does not block a referral-only varenicline mention, provided S10 permits naming candidates.
- **Blocks:** PH (varenicline dosing content)

---

## S5 — Current Saudi cessation referral pathway: Sehhaty, 937, or both

- **Issue:** The Executive Summary names **Sehhaty** as the current referral route. The Pharmacotherapy Module (Parts A.4, C.9) uses **937** and MOH clinics. Which is current, and whether both should be shown, is not resolved.
- **Why it matters:** This is the operational endpoint of every escalation gate in the architecture. A wrong or dead referral route makes the safety layer non-functional in practice — the plan escalates correctly but sends the user nowhere.
- **Exact evidence/source required:** Current Saudi MOH statement of the cessation referral pathway, confirming whether Sehhaty is the primary route, the current role and hours of 937, and whether clinic booking is via Sehhaty, walk-in, or both. Dated, with the URL added to the Source Register.
- **Current status:** **UNRESOLVED and internally contradictory across the two supplied documents.** Evidence Matrix row 36 covers Sehhaty clinics; module Part C.9 uses 937.
- **What Aqla must do if unresolved:** Escalation blocks name the **service** in general terms — "خدمة الإقلاع عن التدخين التابعة لوزارة الصحة" — with **no channel, number or app name** displayed until confirmed. Emergency routing (997) is separate and governed by S6.
- **Blocks implementation:** Blocks display of any named Saudi referral channel. Does **not** block the escalation logic itself, which can ship with generic service wording.
- **Blocks:** ALL (any plan that fires a safety gate renders a referral block; the plan can still ship with generic wording, so this blocks the *content*, not the release)

---

## S6 — Current Saudi service information: emergency number, clinic count, cost

- **Issue:** Module Part A.4/C.9 asserts "more than 260 clinics" (2023 data), "free of charge", and uses 997 as the emergency number. None of these are confirmed current in the supplied evidence.
- **Why it matters:** Stale service claims damage credibility with the exact clinician audience Aqla is being reviewed by, and a wrong emergency number in a plan that also contains cardiac and suicidal-ideation gates is a serious safety defect.
- **Exact evidence/source required:** Current Saudi MOH Tobacco Control Program page confirming the clinic count and cost as of the release date; and independent confirmation of the correct Saudi medical emergency number for the emergency gate. Dated and cited.
- **Current status:** **UNRESOLVED.** The clinic figure derives from 2023 sources in the Source Register; the module states availability data must be confirmed before publication.
- **What Aqla must do if unresolved:** Remove the clinic count and cost claim entirely — they are marketing detail, not clinical necessity. The emergency number must be confirmed before any plan containing an emergency gate is issued to a Saudi user; if unconfirmed, the emergency block reads "اتصل بالطوارئ فورًا" with no number, which is a degraded but safe state.
- **Blocks implementation:** The emergency number blocks release of Saudi plans containing emergency gates. Clinic count and cost do not block anything.
- **Blocks:** ALL (emergency number), NONE (clinic count, cost)

---

## S7 — Pregnancy NRT pathway in Saudi Arabia

- **Issue:** Whether Aqla offers NRT within the pregnancy pathway, or refers entirely to a clinician while keeping the behavioural plan, has not been decided, and the Saudi-specific position is not in the supplied evidence.
- **Why it matters:** Pregnancy is the highest-consequence branch in the system. Evidence Matrix row 18 marks it "UK/local verify", so the UK-derived position cannot be transferred to Saudi Arabia. The architecture already establishes pregnancy is not a dead end — the open question is only whether medication content appears inside that pathway.
- **Exact evidence/source required:** Saudi MOH or Saudi obstetric-society guidance on NRT in pregnancy and breastfeeding, and a written Aqla clinical-governance decision recording the chosen position and its author.
- **Current status:** **UNRESOLVED** on both the evidence and the governance decision.
- **What Aqla must do if unresolved:** The pregnancy pathway ships **behavioural-only** with a mandatory clinician-referral block. Varenicline, bupropion and cytisine remain excluded regardless of resolution. Module block C.7 is rewritten from "blocked" framing to pathway framing, as already specified in the architecture.
- **Blocks implementation:** Blocks medication content inside the pregnancy pathway only. Does not block the pregnancy pathway itself.
- **Blocks:** PH (pregnancy branch only)

---

## S8 — Minimum self-service age versus mandatory clinician handoff

- **Issue:** The age at which a Saudi user may use Aqla self-service, and the age below which clinician handoff is mandatory, is not established. Evidence Matrix row 17 is a **UK** rule and is explicitly out of scope for Release 1.
- **Why it matters:** This is a consent and safeguarding question as much as a clinical one, and it determines whether `Q_AGE_BAND < 18` produces a supported adolescent plan or a referral-only screen. It also interacts with the research consent in the assessment.
- **Exact evidence/source required:** Saudi regulatory or MOH position on minors accessing digital cessation support and on NRT in under-18s; plus Aqla's own legal position on minors' consent for health data under PDPL. Written and dated.
- **Current status:** **UNRESOLVED.** No Saudi-jurisdiction age rule exists in the supplied evidence.
- **What Aqla must do if unresolved:** Under-18 Saudi users receive the behavioural adolescent variant with **no medication content of any kind** and a clinician-handoff block. Research consent is not collected from under-18s.
- **Blocks implementation:** Blocks medication content for under-18s. Does not block the adolescent behavioural plan.
- **Blocks:** PH (under-18 branch), and ALL for under-18 data collection until the PDPL consent position is written

---

## S9 — Whether NRT preloading will be offered

- **Issue:** Part D offers preloading — starting the patch two weeks before the quit date while still smoking — as an unqualified option, with no gate, no eligibility criteria and no jurisdiction check.
- **Why it matters:** Preloading is a prescriber-level manoeuvre that instructs a user to use nicotine medication while continuing to smoke. Presented self-service, it is the most likely single source of a serious dosing incident in the current module.
- **Exact evidence/source required:** A written Aqla clinical-governance decision, made by a cessation specialist, on whether preloading is offered at all in Saudi Arabia, and if so under which clinician gate and with which eligibility criteria; plus confirmation the Saudi patch label does not contraindicate it.
- **Current status:** **UNRESOLVED.** The manoeuvre is evidenced in the module (RR 1.25, moderate certainty) but no Aqla gating decision exists.
- **What Aqla must do if unresolved:** Preloading is **not surfaced to users in any form** and is not mentioned in plan content. It may exist only as a clinician-facing note if a specialist later authorises it.
- **Blocks implementation:** Blocks the preloading feature only. Nothing else.
- **Blocks:** PH (preloading feature only)

---

## S10 — Whether medication candidates may be displayed before clinician confirmation

- **Issue:** The architecture produces a ranked candidate set at the shared-decision step. Whether Aqla may **name** those candidates to a Saudi user before a clinician has confirmed them, or must present only "there are effective medicines, a clinician will discuss them with you", is an unmade governance decision.
- **Why it matters:** This single decision determines the shape of the entire treatment-selection UI, the plan's treatment section, the PDF, and the email. It is the difference between a shared-decision product and a referral product, and it cannot be retrofitted cheaply.
- **Exact evidence/source required:** A written Aqla clinical-governance decision, signed by the responsible clinician, stating what medication information may be displayed pre-confirmation: nothing, class-level only, named agents without doses, or named agents with label-sourced doses.
- **Current status:** **UNRESOLVED.** Evidence Matrix row 4 supports combining behavioural support with medication but does not address who may present the options in a digital product.
- **What Aqla must do if unresolved:** The most conservative option applies — no named agents pre-confirmation. The plan states that effective medicines exist, that they roughly double success rates, and routes to the Saudi service. No agent names, no doses.
- **Blocks implementation:** Blocks the shared-decision treatment UI and the plan's treatment section design. Does not block the behavioural plan.
- **Blocks:** PH (entire display layer)

---

## S11 — Arabic clinical back-translation sign-off

- **Issue:** The Pharmacotherapy Module states in its own closing note that its Arabic has **not** been clinically back-translated, and that Parts C.3, C.4 and C.6 require review by a Saudi pharmacist and a cessation specialist before release.
- **Why it matters:** C.4 is NRT technique — the module itself flags it as critical and usually omitted — and C.6 is the CYP1A2 drug-interaction safety block. A translation defect in either is a direct patient-safety defect, in the two blocks least likely to be caught by a non-clinical reviewer.
- **Exact evidence/source required:** Signed review of the Arabic in C.3, C.4 and C.6 by a named Saudi pharmacist and a named cessation specialist, dated, with any corrections applied and versioned.
- **Current status:** **UNRESOLVED.** Stated as an open release gate by the source document itself.
- **What Aqla must do if unresolved:** No content from C.3, C.4 or C.6 ships in any surface — screen, PDF, email or dashboard.
- **Blocks implementation:** Blocks the pharmacotherapy content layer.
- **Blocks:** PH (entire content layer)

---

## S12 — PDPL basis and consent wording for identifiable health data

- **Issue:** The current implementation sends identifiable health data to an admin recipient with no consent gate. The lawful basis and consent wording under Saudi PDPL have not been established.
- **Why it matters:** This is the one item on the list that is unsafe **today**, in the code as it currently stands, independent of any medication decision. It affects every Saudi user who completes the existing flow.
- **Exact evidence/source required:** A written PDPL assessment covering the plan email, the admin/research copy, and the de-identified research projection, with the exact Arabic consent wording for each, reviewed and dated.
- **Current status:** **UNRESOLVED**, and the defect is live.
- **What Aqla must do if unresolved:** The unconsented admin copy is removed as part of the truthfulness phase, before anything else. The research projection is not built until the wording exists. Plan email proceeds only on explicit, separately captured consent.
- **Blocks implementation:** Blocks the research/admin data flow entirely, and blocks the research consent question from being asked.
- **Blocks:** ALL (research/admin data flow)

---

## Summary

| ID | Item | Status | Blocks |
|---|---|---|---|
| S1 | Bupropion Saudi registration | Unresolved | PH — bupropion only |
| S2 | Cytisine Saudi approval | Unresolved | PH — cytisine only |
| S3 | Registered short-acting NRT forms and strengths | Unresolved | **PH — entire layer** |
| S4 | Saudi varenicline label, dosing, renal, duration | Unresolved | PH — varenicline dosing |
| S5 | Referral pathway: Sehhaty / 937 / both | Unresolved, sources conflict | ALL — referral content |
| S6 | Emergency number, clinic count, cost | Unresolved | ALL — emergency number; NONE — count/cost |
| S7 | Pregnancy NRT pathway | Unresolved | PH — pregnancy branch |
| S8 | Minimum self-service age | Unresolved | PH — under-18; ALL — under-18 data collection |
| S9 | Preloading | Unresolved | PH — preloading only |
| S10 | Candidates displayable pre-confirmation | Unresolved | **PH — entire display layer** |
| S11 | Arabic clinical back-translation (C.3, C.4, C.6) | Unresolved | **PH — entire content layer** |
| S12 | PDPL basis and consent wording | Unresolved, live defect | ALL — research/admin flow |

**Counts:** 12 unresolved Saudi items. 3 block the entire pharmacotherapy layer (S3, S10, S11). 4 block a specific medication pathway or feature (S1, S2, S4, S9). 2 block a specific branch (S7, S8). 3 affect the whole plan in some form (S5, S6, S12), of which only S6's emergency number and S12's data flow are hard release blockers.

**Nothing on this list blocks Release 1 as scoped**, because Release 1 as scoped is Saudi behavioural-only plus a `GENERIC` behavioural-only profile, with the medication layer behind `saudi_medication_content_approved = false`. The two items that must be closed before any Saudi plan ships at all are **S6 (emergency number)** and **S12 (PDPL and consent)**. Everything else gates the pharmacotherapy layer, which is not in Release 1.

No Saudi regulatory information has been inferred, estimated or invented anywhere in this checklist. Every "unresolved" is genuinely unresolved in the supplied evidence.

Stopping here as instructed — no further planning or implementation until you direct otherwise.
