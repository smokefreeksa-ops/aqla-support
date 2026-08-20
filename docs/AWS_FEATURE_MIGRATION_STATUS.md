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
| FTND six-item | MIGRATE | New verified scoring module added; UI/protocol activation remains |
| PSECDI | CORRECTED | AWS scoring module uses published 0–20 Penn State scoring; do not copy simplified AQla1 scorer |
| LWDS-11 | CORRECTED | 11 items × 0–3; threshold 10 retained; no invented severity bands |
| HONC-style | MIGRATE with label | Current AQla wording is adapted; explicitly non-validated unless exact validated version adopted |
| Oral nicotine/pouch adapted screen | MIGRATE with label | Explicitly non-validated |
| Research Data Dictionary | IN PROGRESS | AWS dictionary v1 + admin page added |
| Full AQla1 research extension | MIGRATE | Demographics/exposure/access/social context only when protocol requires |
| Cohort A–H | MERGE | Preserve as derived research/admin variable if needed; do not expose as participant architecture |

## Plan and document generation

| Capability | Status | Notes |
|---|---|---|
| Saved quit plan | KEEP-AWS | DynamoDB + Cognito ownership |
| Latest-plan pointer | KEEP-AWS | `PLAN#LATEST` |
| AI bounded coaching | KEEP-AWS | Stronger than legacy approach |
| Client PDF | KEEP-AWS temporarily | Works as staging fallback |
| Proper text PDF | MIGRATE | Port server-side Arabic PDF renderer to AWS Lambda/Node runtime |
| Formal plan version lineage | MIGRATE | Restore explicit plan/rule/schema version governance |

## Follow-up and communications

| Capability | Status | Notes |
|---|---|---|
| Day 3 / 7 / 30 | KEEP-AWS | Existing MVP scaffold |
| Flexible long-term cadence | MIGRATE | Day 14/28/60/90/6m/12m per policy/protocol |
| SES plan-ready email | KEEP-AWS | Privacy-preserving |
| SES scheduled follow-up | KEEP-AWS | EventBridge/Lambda |
| Safety-hold communication gate | MIGRATE | Explicit gate before production |
| Unsubscribe | MIGRATE | Needed before bulk communications |
| Suppression list | MIGRATE | Needed before bulk communications |
| Bounce/complaint receipts | MIGRATE | SES event destinations/SNS/EventBridge |
| Bulk 100k email queue | MIGRATE | SQS + controlled Lambda workers + SES |
| WhatsApp API | MIGRATE | Official provider only; opt-in/template/policy governed |

## Clinical/admin operations

| Capability | Status | Notes |
|---|---|---|
| AWS KPI Command Centre | KEEP-AWS | Real counters only; unavailable ≠ zero |
| Cognito admin role | KEEP-AWS | Server-side |
| Cognito clinician role | KEEP-AWS | Server-side |
| Full participant CRM | MIGRATE | Search, follow-up, appointment, notes, escalation |
| Receptionist workflow | MIGRATE | Role-limited view |
| Clinician longitudinal view | MIGRATE | Structured Twin/clinical summary; avoid raw-chat overload |
| Clinical audit trail | MIGRATE | Application-level immutable audit events |
| Research exports | MIGRATE | Full/anonymised/protocol exports |
| De-identification rules | MIGRATE | Explicit PII/sensitive stripping |

## Academy and training

| Capability | Status | Notes |
|---|---|---|
| Basic AWS Academy content | KEEP-AWS | Six educational modules |
| Conversational learning | KEEP-AWS/EXPAND | Same Aqla OS shell |
| Quiz engine | MIGRATE | Port validated question/answer logic |
| Seven-module training | MIGRATE | Preserve best-score/attempt logic |
| Pass threshold | MIGRATE | Server authoritative |
| Safety-critical exam gate | MIGRATE | High score cannot compensate for critical safety failure |
| Certificate issuance | MIGRATE | Unique code/hash |
| Certificate verification | MIGRATE | Public verification route |
| Learner dashboard | MIGRATE | Progress, attempts, sessions, certificates |
| Multi-tenant org/programme scope | MIGRATE | Preserve future capability |

## Engagement and community

| Capability | Status | Notes |
|---|---|---|
| Help Someone | MIGRATE HIGH | Strong distinctive feature |
| Safe support-message generator | MIGRATE HIGH | Preserve anti-shaming/false-claim rules |
| Cost calculator | MIGRATE HIGH | Easy/high-value tool |
| Trigger map | MIGRATE HIGH | Feed Twin where consent allows |
| Readiness meter | MIGRATE HIGH | Do not conflict with validated measures |
| Quit timeline | MIGRATE | Educational |
| Breath challenge | MIGRATE | Non-diagnostic |
| Share cards | MIGRATE | Rebuild on S3 with strict privacy sanitiser |
| Invite friends/QR | MIGRATE | Privacy-safe referral design |
| Challenges | MIGRATE | Twin-aware, non-shaming |
| City challenge | MIGRATE | Aggregate only; protect small cells |
| Movement | MIGRATE | Public impact layer |
| Passport/stamps | MIGRATE | Mature non-manipulative gamification |
| Points/medals standalone page | DROP/ABSORB | Fold into challenge/passport system |
| Updates page | DROP/ABSORB | Use proper content/updates system later |

## Volunteer, professional and fulfilment

| Capability | Status | Notes |
|---|---|---|
| Volunteer application/workflow | MIGRATE | Full status/history/training/admin flow |
| Poster Studio | MIGRATE | Keep safety-filtered content generation |
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

Use DynamoDB for high-scale participant journey state, conversations, current Twin, plans and follow-up.

Evaluate Aurora PostgreSQL for relational research/clinical/admin datasets that need complex joins, cohort filtering and research exports. Do not force all historic Supabase relational workloads into DynamoDB if PostgreSQL remains the better data model.

## Migration order

1. Research/validated scoring + AWS data dictionary — **started**.
2. Clinical/admin participant CRM.
3. Proper server-side PDF + explicit version lineage.
4. Communication governance: safety hold, unsubscribe, suppression, bounce/complaint events.
5. Academy/training/certificate system.
6. Help Someone + interactive tools + privacy-safe sharing.
7. Challenges/city/movement/passport.
8. Volunteer workflow + Poster Studio.
9. Research exports/de-identification and any Aurora relational layer.
10. 100k bulk communications + WhatsApp after policy/consent controls are complete.

## Production cutover rule

A capability is not considered migrated merely because it compiles. Track separately:

- CODED
- DEPLOYED
- RUNTIME VERIFIED
- END-TO-END VERIFIED

Do not redirect production DNS until core participant, safety, authentication, plan, follow-up, communication, admin and rollback paths are end-to-end verified.
