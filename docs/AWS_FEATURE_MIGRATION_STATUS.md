# Aqla AWS Feature Migration Status

Status: staging implementation tracker

Target branch: `agent/nextjs-aws-migration`

Live reference: AQla1 / `main`

Principle: migrate useful product capability, not Lovable/Supabase-specific architecture or duplicated legacy engines.

## Status keys

- **KEEP-AWS** — AWS implementation is the new source of truth.
- **MIGRATE** — valuable AQla1 capability still needs to be ported.
- **MERGE** — capability exists in both; combine best logic into one AWS implementation.
- **CORRECTED** — old implementation contained a clinical/technical issue that must not be copied unchanged.
- **CODED** — implementation exists on staging branch but still requires deployment/runtime/end-to-end verification.
- **HOLD** — do not prioritise until governance/validation decision.
- **DROP** — intentionally do not recreate as a separate system.

## Foundation

| Capability | Status | AWS target |
|---|---|---|
| Next.js application | KEEP-AWS | Amplify Hosting |
| Authentication | KEEP-AWS | Amazon Cognito |
| Participant journey state | KEEP-AWS | DynamoDB |
| Personal Digital Twin | KEEP-AWS | DynamoDB structured state |
| Transactional email | KEEP-AWS | Amazon SES |
| Secrets | KEEP-AWS | Secrets Manager |
| Follow-up scheduling | KEEP-AWS | EventBridge Scheduler + Lambda |
| Follow-up DLQ | KEEP-AWS | SQS |
| AI orchestration | KEEP-AWS | Direct OpenAI structured responses |
| Lovable AI gateway | DROP | No replacement needed |
| Lovable auth broker | DROP | Cognito replaces it |
| Supabase dependency in AWS app | DROP | AWS-native services |

## Core cessation experience

| Capability | Status | Notes |
|---|---|---|
| Research-first gateway | KEEP-AWS | Preserve approved visual/research separation |
| Simplified 8-step assessment | KEEP-AWS | Keep participant journey short |
| Single deterministic quit engine | KEEP-AWS | Do not recreate multiple legacy engines |
| AI plan personalisation | KEEP-AWS | Deterministic safety/scoring remains authoritative |
| Personal Digital Twin | KEEP-AWS | Longitudinal structured state |
| Saved conversations | KEEP-AWS | Bounded recent context + structured Twin |
| SOS/craving support | MERGE | Keep simple AWS UX; selectively port proven SOS protocols |
| Relapse support | MERGE | Fold into OS/SOS/Twin rather than separate duplicated engine |
| DTx legacy module | DROP as separate product | Migrate useful HALT/slip/adherence concepts into Twin/tools |
| Voice assistant | MERGE | Keep AWS OS voice input; add server voice only if clear value |
| Voice craving scan | HOLD | Experimental; do not migrate as clinical feature without validation |

## Assessment and research instruments

| Capability | Status | Notes |
|---|---|---|
| HSI | KEEP-AWS | Already deterministic |
| FTND six-item | CODED | Verified scorer exists; participant/research protocol activation remains |
| PSECDI | CORRECTED/CODED | AWS scorer uses published 0–20 Penn State scoring; old simplified scorer not copied |
| LWDS-11 | CORRECTED/CODED | 11 items × 0–3; threshold 10 retained; no invented severity bands |
| HONC-style | CODED with label | Explicitly non-validated adapted wording unless exact validated version adopted |
| Oral nicotine/pouch adapted screen | CODED with label | Explicitly non-validated |
| Research Data Dictionary | CODED | AWS dictionary v1 + protected admin page |
| Full AQla1 research extension | MIGRATE | Demographics/exposure/access/social context only when protocol requires |
| Cohort A–H | MERGE | Preserve as derived research/admin variable if needed; do not expose as participant architecture |

## Personal Quit Plan v2

| Capability | Status | Notes |
|---|---|---|
| NHS functional benchmark audit | CODED/CI VERIFIED | 20 supplied NHS question/input concepts explicitly classified; no NHS wording, visuals, videos or branded services copied |
| Enhanced 8-step assessment | CODED/CI VERIFIED | Keeps eight-step UX using conditional branching rather than turning the pathway into a long survey |
| Exact cigarette quantity | CODED/CI VERIFIED | Number + day/week period; legacy HSI quantity band is derived server-side rather than asked twice |
| Cigarette form | CODED/CI VERIFIED | Manufactured / roll-your-own / both / other for cigarette users |
| Integrated savings estimate | CODED/CI VERIFIED | Optional participant-reported total nicotine spend in SAR; no invented default Saudi price; reduction pathway scales savings |
| Previous quit-support methods | CODED/CI VERIFIED | Conditional on previous attempts; supports non-shaming previous-attempt learning |
| Cessation-support knowledge | CODED/CI VERIFIED | Adjusts educational depth; does not replace confidence/readiness |
| Treatment-information interests | CODED/CI VERIFIED | Educational preferences only; not medication prescribing or dosing |
| Preferred support channels | CODED/CI VERIFIED | Aqla/clinician/pharmacist/phone-video/family-peer/self-guided options localised rather than copying NHS services |
| Additional triggers | CODED/CI VERIFIED | Adds alcohol, hunger, visual cues, being offered nicotine, morning waking, living with a user and work/study break while preserving Saudi-specific triggers |
| Additional motivations | CODED/CI VERIFIED | Adds breathing, role modelling, appearance, clinician advice, illness-risk, control and no-longer-enjoying while preserving Aqla-specific motivations |
| Quit/change goal | CODED/CI VERIFIED | Quit / reduce / maintain abstinence / explore |
| Quit/change date | CODED/CI VERIFIED | Today / within seven days / validated specific date / not ready; no date pressure for relapse-prevention or exploratory pathways |
| Separate plan-email consent | CORRECTED/CODED/CI VERIFIED | Plan persists regardless; plan-link email is explicit opt-in |
| Separate follow-up-email consent | CORRECTED/CODED/CI VERIFIED | Follow-up scheduling/recipient persistence occurs only when opted in; safety hold remains authoritative |
| Supplemental Personal Twin context | CODED/CI VERIFIED | Versioned DynamoDB `TWIN#PERSONAL_PLAN_V2` context preserves goal/support/preferences without destabilising base Twin schema |
| Personal Plan v2 Data Dictionary | CODED/CI VERIFIED | Financial/free-text/third-party/communication fields explicitly classified and protected from default research export |
| Enriched plan display | CODED/CI VERIFIED | Goal/date, savings, motivations, trigger coaching, previous-attempt learning, treatment-learning interests and support-network sections appended to existing stronger Aqla plan |
| Personal Plan v2 PDF | CODED/CI VERIFIED | Server React-PDF output uses central Aqla logo, DejaVu Arabic font and v2 enrichment sections |
| Runtime/E2E staging validation | NEXT | Deploy/confirm branch in Amplify and test representative personas end-to-end before production cutover |

## Plan and document generation

| Capability | Status | Notes |
|---|---|---|
| Saved quit plan | KEEP-AWS | DynamoDB + Cognito ownership |
| Latest-plan pointer | KEEP-AWS | `PLAN#LATEST` |
| AI bounded coaching | KEEP-AWS | Stronger than legacy approach |
| Client PDF | KEEP-AWS fallback | Browser PDF retained as fallback during staging |
| Proper text PDF | CODED | Server-side React PDF endpoint with Arabic DejaVu font and account ownership |
| Formal plan version lineage | CODED | Plan/assessment/clinical/scoring/follow-up/AI prompt provenance stored with new plans |

## Follow-up and communications

| Capability | Status | Notes |
|---|---|---|
| Longitudinal cadence | KEEP-AWS | Day 1/3/7/14/21/30/60/90/6m/12m policy scaffold |
| SES plan-ready email | KEEP-AWS | Privacy-preserving |
| SES scheduled follow-up | KEEP-AWS | EventBridge/Lambda |
| Safety-hold communication gate | CODED | Immediate safety state suppresses routine plan email and routine scheduled follow-ups |
| Unsubscribe | CODED | Opaque-token, privacy-safe unsubscribe workflow |
| Suppression list | CODED | Hashed recipient suppression; reason/scope separated |
| Bounce/complaint receipts | CODED | SES event destination → SNS → Lambda → DynamoDB + DLQ |
| Send-time suppression enforcement | CODED | Follow-up worker rechecks preferences immediately before SES send |
| Delivery/reputation counters | CODED | Delivery, bounce, complaint, reject and delay events available to operational analytics |
| Bulk 100k email queue | MIGRATE | SQS + controlled Lambda workers + SES after governance/runtime verification |
| WhatsApp API | MIGRATE | Official provider only; opt-in/template/policy governed |

## Clinical/admin operations

| Capability | Status | Notes |
|---|---|---|
| AWS KPI Command Centre | KEEP-AWS | Real counters only; unavailable ≠ zero |
| Cognito admin role | KEEP-AWS | Server-side |
| Cognito clinician role | KEEP-AWS | Server-side |
| Cognito receptionist role | CODED | Dedicated least-privilege staff role support added |
| Full participant CRM | CODED MVP | Dedicated DynamoDB partitions; paginated list, email/account lookup, workflow/contact/appointment/escalation |
| Receptionist workflow | CODED MVP | Contact operations available; clinical plan/Twin/safety details hidden server-side |
| Clinician longitudinal view | CODED MVP | Structured latest-plan + Personal Twin summary; no raw-chat overload |
| Clinical audit trail | CODED MVP | Immutable DynamoDB audit events for staff CRM changes |
| Research exports | CODED/GATED | Pseudonymised latest-plan CSV; admin-only and deny-by-default until deployment governance flag is enabled |
| De-identification rules | CODED v1 | Direct identifiers, staff notes, safety flags, suppression data and internal support score excluded from default export |

### CRM scale rule

Operational participant listing must query dedicated `CRM#...` DynamoDB partitions. It must never use a full DynamoDB `Scan` as a normal user-facing listing strategy. Status and escalation views are separately indexed by partition key, and email/account lookup uses a dedicated lookup partition.

Existing staging records created before the CRM index was introduced may require a one-time controlled backfill; that is a migration operation, not the runtime listing architecture.

## Academy and training

| Capability | Status | Notes |
|---|---|---|
| Basic AWS Academy content | KEEP-AWS | Six educational modules |
| Conversational learning | KEEP-AWS/EXPAND | Same Aqla OS shell |
| Seven-module source content | CODED FOUNDATION | Existing 7 modules / 49 questions / 10 cases prepared as shared build content |
| Server-authoritative quiz grading | CODED FOUNDATION | AWS scorer grades submitted answers; old client-supplied score model not copied |
| Pass threshold | CODED FOUNDATION | Module and overall thresholds retained server-side |
| Safety-critical exam gate | CODED FOUNDATION | Critical cases cannot be compensated for by high non-safety scores |
| Certificate issuance/verification | CODED FOUNDATION | Backend model started; full learner UI/end-to-end flow still pending |
| Learner dashboard | MIGRATE | Progress, attempts, sessions, certificates |
| Multi-tenant org/programme scope | MIGRATE | Preserve future capability |

## Engagement and community

| Capability | Status | Notes |
|---|---|---|
| Help Someone | CODED | 8 relationship types, Arabic/English, privacy-first local generation |
| Safe support-message generator | CODED | 6 tones + anti-shaming/medical-claim/false-affiliation filter |
| Cost calculator | CODED | Client-side estimate with no savings guarantee |
| Trigger map | CODED | Client-side; not silently written into Twin |
| Readiness meter | CODED | Educational and clearly non-diagnostic |
| Quit timeline | CODED | Educational timeline with variability disclaimer |
| Breath challenge/reset | CODED | Non-diagnostic two-minute reset with safety note |
| Privacy-safe share cards | CODED | Generic progress cards only; no plan URL/health fields; native/WhatsApp/X/PNG |
| Invite friends/QR | MIGRATE | Referral/QR system still to be rebuilt if retained |
| Poster Studio | CODED | 7 poster types, 7 themes, 10 messages, 5 export sizes; personal content remains local by default |
| Challenges | CODED MVP | 6 non-shaming challenges with authenticated progress and participation points |
| Challenge integrity | CODED | 28-day completion time-gated; knowledge challenge must be awarded from Academy evidence |
| City challenge/community view | CODED MVP | Aggregate-only city engagement; minimum public cell size raised to 10 |
| Community points | CODED MVP | Reward learning/support/awareness participation, never quit outcome or speed |
| Community route | CODED | `/aqla/community` and `/aqla/city-challenge` route into the privacy-safe Challenge Hub |
| Movement | MERGE/PENDING | Public impact concepts should use the new aggregate community layer instead of a separate duplicate system |
| Passport/stamps | MIGRATE | Mature non-manipulative gamification can be layered on the challenge state later |
| Points/medals standalone page | DROP/ABSORB | Folded into challenge/community architecture |
| Updates page | DROP/ABSORB | Use proper content/updates system later |

## Volunteer, professional and fulfilment

| Capability | Status | Notes |
|---|---|---|
| Volunteer application | CODED | AWS DynamoDB application + unique volunteer code + required boundary screening |
| Volunteer workflow | CODED MVP | submitted → screening → training → approved → active/paused/declined |
| Volunteer admin | CODED MVP | Admin pipeline and status control; applications kept separate from participant clinical records |
| Volunteer community aggregation | CODED | Only aggregate counts/city engagement enter public community metrics |
| Poster Studio | CODED | Privacy-first local poster generation; no Supabase share-card dependency |
| Professional Library | MIGRATE selectively | Only evidence-based maintained content |
| NRT/shop request workflow | HOLD | Regulatory, clinical and fulfilment governance first |

## Public content / SEO

| Capability | Status | Notes |
|---|---|---|
| About/FAQ/contact/privacy/terms | KEEP-AWS | Existing |
| Medical disclaimer | KEEP-AWS | Existing |
| Accessibility | KEEP-AWS | Existing |
| Articles | MIGRATE | First week, withdrawal, shisha, pouches etc. |
| Cookies/sharing policy | MIGRATE | Governance/legal review |
| Sitemap/structured metadata | MIGRATE | Before public DNS cutover |
| OG/social assets | MIGRATE | Preserve stable share URLs/filenames where useful |

## Data architecture decision

Use DynamoDB for high-scale participant journey state, conversations, current Twin, plans, follow-up, compact operational CRM indexes, volunteer workflow, challenge progress and privacy-safe aggregate community counters.

Evaluate Aurora PostgreSQL for relational research datasets and future complex clinical/reporting workloads that need joins, cohort filtering and export-heavy SQL. Do not force every historic Supabase relational workload into DynamoDB if PostgreSQL remains the better data model.

## Current migration order / checkpoint

1. Research/validated scoring + AWS data dictionary — **CODED; runtime verification pending**.
2. Clinical/admin participant CRM — **CODED MVP; runtime verification pending**.
3. Proper server-side PDF + explicit version lineage — **CODED; runtime verification pending**.
4. Communication governance — **CODED; AWS resource deployment/event verification pending**.
5. Help Someone + tools + privacy-safe sharing — **CODED; CI/runtime verification pending**.
6. Research export/de-identification — **CODED and deny-by-default; governance enablement + runtime verification pending**.
7. Volunteer workflow + Poster Studio — **CODED MVP; CI/runtime verification pending**.
8. Challenges/community/city layer — **CODED MVP; CI/runtime verification pending**.
9. Personal Quit Plan v2 NHS-benchmark enhancement — **CODED + CI VERIFIED; deployment/runtime/E2E verification pending**.
10. Academy learner UI/certificate end-to-end flow — **NEXT after verification checkpoint**.
11. 100k bulk communications + WhatsApp — only after policy/consent controls and current migration are end-to-end verified.

## Production cutover rule

A capability is not considered migrated merely because it compiles. Track separately:

- CODED
- DEPLOYED
- RUNTIME VERIFIED
- END-TO-END VERIFIED

Do not redirect production DNS until core participant, safety, authentication, plan, follow-up, communication, admin and rollback paths are end-to-end verified.
