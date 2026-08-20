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
- **CI VERIFIED** — route/lint/production-build/CloudFormation checks have passed for the code checkpoint.
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
| Eight-stage participant assessment | KEEP-AWS | Participant journey stays bounded and understandable |
| Adaptive product branching v3 | CODED | Cigarette, vape, nicotine-pouch and mixed-use branches; relapse-prevention pathway retained |
| Deterministic multidimensional triage v3 | CODED | Exposure, behavioural pattern, mixed-product complexity, readiness, confidence, relapse vulnerability, support need, safety track and follow-up focus |
| Single deterministic quit engine | KEEP-AWS | Do not recreate multiple legacy engines |
| AI plan personalisation | KEEP-AWS/EXPANDED | OpenAI receives minimised structured product profile + deterministic triage; cannot override scoring/safety/referral |
| Personal Digital Twin | KEEP-AWS/EXPANDED | Adaptive assessment + triage stored separately as `TWIN#ADAPTIVE_TRIAGE` |
| Secure adaptive follow-up | CODED | SES email stays generic/privacy-safe; authenticated check-in reads saved triage focus |
| Saved conversations | KEEP-AWS | Bounded recent context + structured Twin |
| SOS/craving support | MERGE | Keep simple AWS UX; selectively port proven SOS protocols |
| Relapse support | MERGE | Fold into OS/SOS/Twin rather than separate duplicated engine |
| DTx legacy module | DROP as separate product | Migrate useful HALT/slip/adherence concepts into Twin/tools |
| Voice assistant | MERGE | Keep AWS OS voice input; add server voice only if clear value |
| Voice craving scan | HOLD | Experimental; do not migrate as clinical feature without validation |

## Product-specific assessment / dependence

| Capability | Status | Notes |
|---|---|---|
| Cigarette exact quantity + HSI | CODED | Exact day/week quantity collected; HSI band derived server-side; HSI remains deterministic |
| FTND six-item | CODED FOUNDATION | Verified scorer exists; full FTND is not inferred from simplified assessment |
| Vape product branch | CODED v3 | Device type, use frequency, exact minutes after waking, night use, cravings and autonomy/withdrawal items |
| PSECDI | CODED v3 | Full Penn State score is calculated only when all required PSECDI items are collected; deterministic 0–20 scoring |
| Nicotine-pouch product branch | CODED v3 | Daily pouch count, optional strength/brand, multiple-at-once, strength switching, night use, cravings and difficulty cutting down |
| Oral nicotine/pouch adapted screen | CODED v3 / NON-VALIDATED | Six-item Aqla internal adapted screen; must never be represented as validated |
| Mixed-product prioritisation | CODED v3 | Asks which selected product would be hardest to go without and whether users substitute another nicotine product |
| Shisha basic branch | KEEP-AWS | Session frequency and duration; LWDS-11 remains protocol/research-grade rather than silently inferred |
| LWDS-11 | CODED FOUNDATION | 11 items × 0–3; threshold 10 retained; no invented severity bands |
| HONC-style | CODED with label | Explicitly non-validated adapted wording unless exact validated version adopted |
| Research Data Dictionary | CODED/EXPANDED | Core + Personal Plan v2 + Adaptive Assessment v3 dictionaries in protected admin page |

## Personal Quit Plan v2/v3

| Capability | Status | Notes |
|---|---|---|
| NHS concept audit | CODED | 20 concepts accounted for; useful concepts independently implemented without NHS wording/branding/assets |
| Quit/change goal | CODED | Quit, reduce, maintain abstinence, explore |
| Target quit/change date | CODED | Today/within 7/specific/not ready; date validation retained |
| Spending/savings | CODED | Self-reported SAR only; no invented Saudi default price; reduction-aware savings |
| Previous quit-support methods | CODED | Used to avoid blind repetition |
| Treatment information interests | CODED | Education preference only; no medication dosing |
| Preferred support channels | CODED | Aqla/clinician/pharmacist/family/peer/self-guided etc. |
| Separate plan email consent | CODED | Plan-link email is not bundled with follow-up consent |
| Separate follow-up email consent | CODED | Ongoing supportive email requires its own opt-in |
| Adaptive triage displayed in plan | CODED v3 | Priority product, support need and product-specific measure information shown with validation labels |

## Plan and document generation

| Capability | Status | Notes |
|---|---|---|
| Saved quit plan | KEEP-AWS | DynamoDB + Cognito ownership |
| Latest-plan pointer | KEEP-AWS | `PLAN#LATEST` |
| AI bounded coaching | KEEP-AWS | Deterministic safety/scoring remains authoritative |
| Client PDF | KEEP-AWS fallback | Browser PDF retained as fallback during staging |
| Proper text PDF | CODED | Server-side React PDF endpoint with Arabic DejaVu font and account ownership |
| Formal plan version lineage | CODED | Plan/assessment/clinical/scoring/follow-up/AI prompt provenance stored with new plans |
| Adaptive-triage PDF section | NEXT | Visible authenticated plan has triage; add to server PDF after v3 runtime verification |

## Follow-up and communications

| Capability | Status | Notes |
|---|---|---|
| Longitudinal cadence | KEEP-AWS | Day 1/3/7/14/21/30/60/90/6m/12m policy scaffold |
| SES plan-ready email | RUNTIME VERIFIED | Real staging email delivered from `noreply@smokefreeksa.com` to a verified Cognito/Gmail account on 20 Aug 2026 |
| SES scheduled follow-up | KEEP-AWS | EventBridge/Lambda; runtime delivery of a scheduled future check-in remains to verify |
| Adaptive follow-up focus | CODED v3 | Authenticated follow-up page reads Twin focus: maintain, mixed use, cravings, triggers, confidence, reduction or general |
| Email privacy boundary | KEEP-AWS | Email does not contain sensitive plan/triage detail; secure link reveals adaptive focus after login |
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
| Adaptive fields in default research export | HOLD/EXCLUDED | New vape/pouch raw fields and internal adaptive triage are not automatically added to default export; protocol/governance decision required |
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

## Current verification checkpoint

1. Personal Quit Plan v2 + SES plan-ready email — **CODED, CI VERIFIED at prior checkpoint, real staging email delivered**.
2. Adaptive Assessment/Triage v3 — **CODED; fresh CI and runtime verification required**.
3. Scheduled Day-1 follow-up email — **next runtime test after v3 deployment**.
4. Core CRM/Twin/admin visibility — runtime verification after v3 plan submission.
5. Academy learner UI/certificate flow — resume after adaptive core verification.
6. 100k bulk communications + WhatsApp — only after current consent, suppression, follow-up and runtime pathways are fully verified.

## Production cutover rule

A capability is not considered migrated merely because it compiles. Track separately:

- CODED
- CI VERIFIED
- DEPLOYED
- RUNTIME VERIFIED
- END-TO-END VERIFIED

Do not redirect production DNS until core participant, safety, authentication, plan, follow-up, communication, admin and rollback paths are end-to-end verified.
