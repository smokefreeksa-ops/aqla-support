# Aqla — Saudi Clinical Evidence Resolution Checklist (Release 1, revision 2)

Analysis only. No code, UI, database, content or email changes have been made.

## Release 1 scope lock

- **Primary supported jurisdiction: Saudi Arabia.** Only `jurisdiction = SA` may ever generate medication-specific content — and that layer stays behind `saudi_medication_content_approved = false` for Release 1.
- **Non-Saudi users are fully supported** in behavioural-only mode: trigger planning, craving support, withdrawal support, quit-day planning, lapse/relapse pathways, long-term maintenance, supporter instructions. No Saudi emergency number, no 937, no Sehhaty, no Saudi medication availability, no doses. They receive a single block advising a local doctor, pharmacist or cessation service for medication guidance. No foreign emergency number is invented.
- **`jurisdiction_profiles` is built now** with two populated profiles — `SA` (full) and `GENERIC` (behavioural-only). No UK medication or clinical content in Release 1; UK becomes a data row later, not a redesign.
- **Admin/research identifiable copy: DISABLED.**

---

## S1 — Bupropion: Saudi cessation registration

- **Status:** UNRESOLVED
- **Issue:** The Pharmacotherapy Module presents bupropion as an available option; its Saudi cessation-specific registration is not established.
- **Why it matters:** Offering a medicine not registered for cessation in Saudi Arabia is a regulatory and safety exposure and distorts the candidate set.
- **Evidence required:** Current SFDA registered-products entry showing the approved indication text, plus the Saudi MOH cessation-protocol position. Dated and cited.
- **If unresolved:** Bupropion is excluded from the Saudi candidate set, not named, not described as requestable. A user who names it is routed to a clinician without comment on availability.
- **Release impact:** No impact on Release 1. Blocks the bupropion pathway only.
- **Blocks:** PH — bupropion pathway

## S2 — Cytisine / cytisinicline: Saudi approval

- **Status:** UNRESOLVED
- **Issue:** Saudi approval status not established (Conflict Register row 1 mandates a local availability gate).
- **Why it matters:** Same regulatory exposure as S1, with added risk of driving cross-border self-sourcing.
- **Evidence required:** SFDA registration record or written confirmation of non-registration, plus the MOH position. Dated and cited.
- **If unresolved:** Excluded from the Saudi candidate set and not named in Saudi-facing content. The UK older-adult cytisinicline rule is out of scope for Release 1.
- **Release impact:** No impact on Release 1.
- **Blocks:** PH — cytisine pathway

## S3 — Registered short-acting NRT forms and strengths

- **Status:** UNRESOLVED — highest-impact pharmacotherapy unknown
- **Issue:** Only the patch is confirmed available in Saudi Arabia. Registered short-acting forms (gum, lozenge, inhalator, spray) and their strengths are unconfirmed, yet Part D specifies 2 mg / 4 mg fast-acting and Part B recommends combination NRT.
- **Why it matters:** Combination NRT requires patch **plus** a short-acting form. Without confirmation the module's headline recommendation cannot be generated at all.
- **Evidence required:** SFDA registered-products list filtered to NRT — form, strength, pack, OTC/Rx status — plus pharmacy availability confirmation. Dated, cited, loaded into `medication_label_content`.
- **If unresolved:** No combination-NRT recommendation, no 2 mg / 4 mg strengths displayed. Saudi users receive the behavioural plan plus a pharmacist-consultation block.
- **Release impact:** No impact on Release 1.
- **Blocks:** PH — entire layer

## S4 — Saudi varenicline label: dosing, renal adjustment, duration

- **Status:** UNRESOLVED
- **Issue:** No Saudi label text supplied; Part B and Part D compute dosing in application logic, which this review has already rejected.
- **Why it matters:** Varenicline is graded superior to single NRT and bupropion, so it is a genuine candidate for high-dependence users. Wrong or computed dosing — renal adjustment especially — is a direct patient-safety defect.
- **Evidence required:** Current SFDA-approved Saudi prescribing information: titration, maintenance, renal guidance, duration, prescription status. Version-dated, stored in `medication_label_content`.
- **If unresolved:** Varenicline may exist only as a referral outcome with **no numbers of any kind** displayed.
- **Release impact:** No impact on Release 1.
- **Blocks:** PH — varenicline dosing content

## S5 — Saudi cessation referral pathway

- **Status:** **RESOLVED FOR RELEASE 1**
- **Resolution supplied by the clinical owner:** Sehhaty and 937 are **not** mutually exclusive.
  - **Primary booking route:** Sehhaty app → smoking-cessation clinic appointment.
  - **Additional MOH support route:** 937 as the Ministry of Health help / counselling / contact channel, shown where appropriate.
  - No fixed clinic count is shown unless separately current-verified.
- **Architecture effect:** `jurisdiction_profiles.SA` gains two distinct referral fields — `booking_route = Sehhaty` and `support_route = 937` — rendered by role, not interchangeably. Every escalation gate above SELF-MANAGEMENT resolves to the Sehhaty booking route; PHARMACIST and counselling-flavoured escalations may additionally surface 937. The earlier contradiction between the Executive Summary (Sehhaty) and Module Part C.9 (937) is closed: both are correct, for different purposes.
- **Release impact:** Unblocks all Saudi referral content. Escalation blocks can now name the real channels instead of using generic wording.
- **Blocks:** NONE

## S6 — Saudi emergency number, clinic count, cost

- **Status:** **Emergency number = RESOLVED FOR RELEASE 1.** Clinic count = **OMITTED**. Cost claim = **OMITTED**.
- **Resolution supplied by the clinical owner:** Saudi Red Crescent Authority identifies **997** as ambulance / emergency medical services.
- **Usage rule, encoded as a hard constraint:** 997 renders **only** when `jurisdiction = SA` **and** an emergency gate has actually fired (chest pain now, severe breathlessness, coughing blood, suicidal ideation). It never appears in routine cessation content, never in the plan footer, never in the PDF boilerplate, and never for a non-Saudi user.
- **Omissions:** the module's "260+ clinics" (2023) and "free of charge" claims are removed from Release 1 content entirely. They are not clinically necessary and are not verified. They may return only if separately current-verified.
- **Release impact:** Unblocks Saudi plans containing emergency gates. Removes two stale marketing claims.
- **Blocks:** NONE

## S7 — Pregnancy NRT pathway in Saudi Arabia

- **Status:** UNRESOLVED (evidence and governance decision both outstanding)
- **Issue:** Whether NRT appears inside the Saudi pregnancy pathway, or the pathway refers entirely to a clinician, is undecided. Evidence Matrix row 18 is marked "UK/local verify", so no UK position transfers.
- **Why it matters:** Highest-consequence branch in the system.
- **Evidence required:** Saudi MOH or Saudi obstetric-society guidance on NRT in pregnancy and breastfeeding, plus a written Aqla clinical-governance decision with a named author.
- **If unresolved:** Pregnancy pathway ships **behavioural-only** with a mandatory Sehhaty clinician-referral block. It is not a dead end — the full behavioural plan is produced. Varenicline, bupropion and cytisine remain excluded regardless of resolution.
- **Release impact:** No impact on Release 1; the pregnancy pathway ships behaviourally.
- **Blocks:** PH — pregnancy branch

## S8 — Minimum self-service age

- **Status:** UNRESOLVED
- **Issue:** No Saudi-jurisdiction age rule exists in the supplied evidence. Evidence Matrix row 17 is a UK rule and is out of scope.
- **Why it matters:** Determines whether under-18s get a supported adolescent plan or a referral screen, and governs minors' consent for sensitive health data under PDPL.
- **Evidence required:** Saudi regulatory/MOH position on minors accessing digital cessation support and on NRT in under-18s; plus Aqla's written PDPL position on minors' consent.
- **If unresolved:** Under-18 Saudi users receive the behavioural adolescent variant with no medication content and a clinician-handoff block. Under S12's conservative rule no research consent is collected from anyone, so the minors' research-consent question does not arise in Release 1. Plan-email consent from a minor remains an open legal question and, pending review, the conservative default is on-screen plan and PDF download only for under-18s, with no email.
- **Release impact:** Minor — constrains the under-18 email path only.
- **Blocks:** PH — under-18 branch; behavioural under-18 **email delivery** pending the PDPL note

## S9 — NRT preloading

- **Status:** UNRESOLVED (no Aqla gating decision exists)
- **Issue:** Part D offers preloading — patch two weeks before quit date while still smoking — with no gate, eligibility criteria or jurisdiction check.
- **Why it matters:** A prescriber-level manoeuvre instructing nicotine medication use while still smoking; the most likely single source of a serious self-service dosing incident in the module.
- **Evidence required:** Written cessation-specialist decision on whether preloading is offered in Saudi Arabia, under which clinician gate and eligibility criteria, plus confirmation the Saudi patch label does not contraindicate it.
- **If unresolved:** Not surfaced to users in any form, not mentioned in plan content.
- **Release impact:** None.
- **Blocks:** PH — preloading feature

## S10 — May medication candidates be named before clinician confirmation?

- **Status:** UNRESOLVED
- **Issue:** Whether Aqla may name ranked candidates pre-confirmation, or must say only "effective medicines exist, a clinician will discuss them".
- **Why it matters:** Determines the shape of the treatment UI, plan treatment section, PDF and email — the difference between a shared-decision product and a referral product. Not cheaply retrofitted.
- **Evidence required:** Written, clinician-signed governance decision specifying what may be displayed pre-confirmation: nothing / class-level / named agents without doses / named agents with label doses.
- **If unresolved:** Most conservative option applies — no named agents. The plan states effective medicines exist and roughly double success rates, and routes to Sehhaty.
- **Release impact:** None for Release 1, which displays no medication candidates at all.
- **Blocks:** PH — entire display layer

## S11 — Arabic clinical back-translation (Parts C.3, C.4, C.6)

- **Status:** UNRESOLVED — declared an open release gate by the source document itself
- **Issue:** The module states its Arabic has not been clinically back-translated and that C.3 (combination NRT), C.4 (technique) and C.6 (CYP1A2 safety block) need Saudi pharmacist and cessation-specialist review.
- **Why it matters:** C.4 is NRT technique and C.6 is the drug-interaction safety block — the two blocks where a translation defect is both most dangerous and least likely to be caught by a non-clinical reviewer.
- **Evidence required:** Signed, dated review by a named Saudi pharmacist and a named cessation specialist, corrections applied and versioned.
- **If unresolved:** No content from C.3, C.4 or C.6 ships on any surface.
- **Release impact:** None — none of these blocks are in Release 1.
- **Blocks:** PH — entire content layer

## S12 — PDPL / privacy

- **Status:** **TECHNICAL RELEASE RISK = MITIGATED.** **FORMAL LEGAL/PDPL WORDING = STILL REQUIRES REVIEW BEFORE PRODUCTION RELEASE.**
- **Issue:** Saudi health information is sensitive personal data. The current implementation sends identifiable health data to an admin recipient with no consent gate — a live defect today.
- **Release 1 privacy architecture, as directed:**
  1. **User plan email** — sent only after a **separate, explicit** consent, never bundled with research consent. Concept wording: "أوافق على إرسال خطتي الشخصية إلى البريد الإلكتروني الذي أدخلته." Stored as `consent_type = plan_email`, `consent_value`, `consent_timestamp`, `consent_version`.
  2. **Aqla admin copy — DISABLED.** No identifiable health information and no personalised quit plan is automatically sent to Aqla administration in Release 1. Every existing claim that a copy has been sent to administration is removed from the UI and from plan content.
  3. **Research use — NOT BUILT, NOT ACTIVATED.** No identifiable research/admin data-sharing flow exists in Release 1. It stays disabled until a formal Saudi PDPL review is completed, the lawful basis is documented, the exact Arabic information/consent language is approved, de-identification requirements are defined, and withdrawal and retention rules are defined. Any future research use is a separate purpose with its own consent, never bundled into plan-email consent.
  4. **De-identified research architecture** — a structural placeholder may exist in the data model, but it is not activated and not populated as a research workflow in this phase.
  5. **Privacy transparency** — a short, plain-language privacy explanation is shown **before** any medical or sensitive assessment information is collected, immediately preceding the medical-history and medication questions. Final legal wording is not invented here and is deferred to the PDPL review.
- **Consequent change to the assessment table:** `Q_CONSENT_RESEARCH` is **removed from Release 1**. Required consents reduce to `Q_CONSENT_PLAN_EMAIL` only, and a new non-question element — the pre-collection privacy notice — is inserted before the medical block. Total Release 1 assessment questions therefore move from 43 to **42**, with required falling from 19 to **18** and conditional unchanged at 24.
- **Release impact:** The live defect is closed by removing the unconsented admin copy in the first implementation phase. Legal wording review remains outstanding but no longer gates a behavioural release, because no sensitive data leaves the user's own account and their own emailed plan.
- **Blocks:** NONE for behavioural Release 1, given the disclosure flows are disabled. Blocks any future research/admin flow entirely.

---

## Status summary

| ID | Item | Status | Release 1 impact | Blocks |
|---|---|---|---|---|
| S1 | Bupropion Saudi registration | Unresolved | None | PH — bupropion |
| S2 | Cytisine Saudi approval | Unresolved | None | PH — cytisine |
| S3 | Short-acting NRT forms/strengths | Unresolved | None | **PH — entire layer** |
| S4 | Varenicline Saudi label | Unresolved | None | PH — varenicline dosing |
| S5 | Referral pathway | **RESOLVED** — Sehhaty booking + 937 support | Unblocks referral content | NONE |
| S6 | Emergency number | **RESOLVED** — 997, emergency gate + SA only | Unblocks emergency gates | NONE |
| S6b | Clinic count | **OMITTED** from Release 1 | Stale claim removed | NONE |
| S6c | Cost claim | **OMITTED** unless verified | Stale claim removed | NONE |
| S7 | Pregnancy NRT pathway | Unresolved | Pathway ships behavioural-only | PH — pregnancy branch |
| S8 | Minimum self-service age | Unresolved | Under-18 email deferred | PH — under-18; email for minors |
| S9 | Preloading | Unresolved | Not surfaced | PH — preloading |
| S10 | Candidates pre-confirmation | Unresolved | None | **PH — display layer** |
| S11 | Arabic back-translation | Unresolved | None | **PH — content layer** |
| S12 | PDPL / privacy | Technical risk **mitigated**; legal wording outstanding | Admin/research disclosure disabled | NONE for behavioural; ALL for research/admin |

**Counts:** 12 items. **2 resolved** for Release 1 (S5, S6). **1 mitigated** with legal review outstanding (S12). **9 unresolved**, of which **9 block pharmacotherapy only** and **0 block behavioural Release 1** — with one narrow carve-out: under-18 plan email is deferred pending the S8 PDPL note.

---

## Answers

**1. Are S5 and S6 now resolved for Release 1?**
Yes. S5 is resolved with Sehhaty as the clinic booking route and 937 as the MOH help/counselling channel, treated as complementary rather than mutually exclusive, and with no fixed clinic count displayed. S6's emergency number is resolved as 997, constrained to `jurisdiction = SA` **and** an actually-fired emergency gate, never as routine cessation content. The clinic count and cost claims are omitted from Release 1.

**2. Is the current identifiable admin copy disabled in the proposed architecture?**
Yes. The automatic identifiable admin copy is disabled, and the existing UI claim that a copy has been sent to administration is removed alongside it. No identifiable health information or personalised quit plan is automatically transmitted to Aqla administration in Release 1. The research/admin flow is not built or activated at all, and `Q_CONSENT_RESEARCH` is dropped from the Release 1 assessment.

**3. Can Release 1 safely proceed without pharmacotherapy?**
Yes. Everything in the Release 1 scope — the full conversational assessment, behavioural plan, trigger plan, craving management, withdrawal support, quit-day plan, lapse and relapse pathways, long-term maintenance, supporter instructions, Sehhaty/937 referral, 997 emergency routing on a fired gate, on-screen plan, PDF, download, consented user email, dashboard — is independent of every unresolved item. The safety gates function without medication content because their output is a referral, and the referral route is now resolved. The dependence assessment remains genuinely optional, and when skipped the engine simply omits dependence-specific output.

**4. Which unresolved issues still block behavioural Release 1?**
None block it. One narrow constraint remains: under S8, plan email to an under-18 user is deferred until the PDPL note on minors' consent exists, so under-18s receive on-screen plan and PDF download only. S12's formal legal wording must be completed before production release, but it does not block the architecture, because the disclosure flows it governs are disabled.

**5. Which unresolved issues block only pharmacotherapy?**
S1 (bupropion pathway), S2 (cytisine pathway), S3 (entire NRT layer, including combination NRT), S4 (varenicline dosing content), S7 (medication inside the pregnancy branch), S8 (medication for under-18s), S9 (preloading feature), S10 (the whole candidate-display layer), S11 (the whole Arabic pharmacotherapy content layer). Nine items, all confined to the pharmacotherapy layer behind `saudi_medication_content_approved = false`.

---

**READY FOR BEHAVIOURAL RELEASE-1 ARCHITECTURE APPROVAL: YES**

**READY FOR PHARMACOTHERAPY ARCHITECTURE APPROVAL: NO** — S1–S4 and S7–S11 remain unresolved, and S11 is a release gate declared by the source document itself.

Nothing has been implemented. Awaiting your direction.
