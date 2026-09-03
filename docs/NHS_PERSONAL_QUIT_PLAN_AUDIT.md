# NHS Personal Quit Plan → Aqla Personal Quit Plan v2 audit

Date: 2026-08-20
Target: `agent/nextjs-aws-migration`
Source basis: NHS Personal Quit Plan material supplied by the project owner on 2026-08-20, including the question pathway and a nine-page rendered plan PDF.

## Rule

The NHS material is a functional benchmark only. Aqla does not copy NHS wording, branding, visual design, icons, videos, screenshots, service names or copyrighted explanatory text. Useful intervention concepts are independently expressed and localised for a Saudi, Arabic-first, multi-product cessation platform.

## Complete concept matrix

| # | NHS question / functional concept | Existing Aqla state | Classification | Aqla v2 decision |
|---|---|---|---|---|
| 1 | Eligibility distinguishes cigarette/roll-up users from vape-only users | Aqla already supports cigarettes, shisha, vape, heated tobacco, nicotine pouches, smokeless tobacco, mixed use and relapse prevention | AQla already better | Keep multi-product architecture; do not make the plan cigarette-only |
| 2 | Knowledge of available quit products/support | Not explicitly captured | Missing | Add `cessation_support_knowledge`; use it to adjust educational depth, not readiness scoring |
| 3 | Confidence about quitting | Aqla already asks 0–10 confidence | AQla already better | Keep one numeric confidence variable; do not add a duplicate categorical item |
| 4 | Whether participant has tried quitting before | Aqla already captures richer duration categories | AQla already better | Keep existing structure |
| 5 | What support/products were used in previous attempts | Aqla captured relapse causes but not prior support methods | Missing | Add `previous_quit_support_methods[]`, conditional on a previous attempt |
| 6 | Reasons for quitting | Aqla already captures health, family, smell, money, faith, fitness, sleep/focus, procedure, pregnancy/child, freedom and other personal motivations | Partial | Preserve Aqla reasons and add missing useful concepts such as breathing, role modelling, appearance, clinician advice, serious-illness risk, control and no longer enjoying use |
| 7 | Cigarette form: manufactured / roll-up / both | Not captured | Missing | Add optional `cigarette_form` for cigarette users only |
| 8 | Exact cigarette quantity with day/week period | Aqla previously used only quantity bands | Partial | Ask exact number + day/week and derive the existing HSI band server-side; do not ask both |
| 9 | Cost of smoking for personalised savings | Aqla had a separate cost tool but not integrated into the quit plan | Missing / localise | Add optional self-reported total nicotine spending in SAR with day/week/month period; never invent a default Saudi price |
| 10 | Roll-up tobacco quantity/pouch-duration branching | UK-specific implementation detail | Partial / localise | Use general cigarette form + exact quantity; do not reproduce the tobacco-pouch-duration question as a separate Saudi field |
| 11 | Time to first cigarette after waking | Aqla already asks time to first nicotine use across products | AQla already better | Keep broader nicotine wording and HSI use for cigarettes |
| 12 | Trigger inventory | Aqla already has strong Saudi triggers but misses several useful cues | Partial | Add alcohol, hunger, seeing nicotine, being offered nicotine, morning waking, living with a user and work/study break; retain majlis/Arabic coffee/prayer/traffic etc. |
| 13 | Which treatment/product options participant wants to learn about | Not explicitly captured | Missing | Add educational `treatment_info_interests[]`; never use this alone to prescribe medication/dose |
| 14 | Which services/support options participant would use | Not explicitly captured | Missing / localise | Add Saudi/Aqla-appropriate `preferred_support_channels[]` rather than NHS-branded services |
| 15 | Quit date: today / specific / not chosen | Existing engine advised choosing a date but did not collect one | Missing | Add change-goal + quit/change-date choice; support today, within 7 days, specific date or not ready |
| 16 | Preparation plan built around selected quit date | Generic 24h/72h/7-day plan existed | Partial | Add goal/date explicitly to plan and PDF; keep existing deterministic plan. Follow-up cadence remains under separate governance policy for now |
| 17 | Email the personal plan | Old AWS route automatically emailed verified users | Needs correction | Plan is always saved to Cognito-owned account; email link is now a separate explicit opt-in |
| 18 | Optional ongoing email support programme | Old AWS route automatically scheduled follow-up for verified email | Needs correction | Ongoing follow-up email now has its own separate opt-in; safety hold still overrides communications |
| 19 | Optional first name | Aqla already has optional preferred name | Exact equivalent | Keep existing `user_name` |
| 20 | Optional postcode | No clinical/behavioural need in current Aqla plan; UK-specific service/location input | Intentionally not added | Do not add to core cessation assessment. Add location only in a future protocol/service feature when there is a defined purpose |

## Final plan concept audit

The supplied NHS output uses separate sections for quit-date preparation, financial savings, personal motivations, trigger management, treatment/support education, support network, stress/mental-health education and email delivery. Aqla v2 preserves its stronger existing deterministic 24-hour, 72-hour, seven-day, craving, relapse, safety, AI-personalisation and longitudinal follow-up layers, while adding goal/date, estimated savings, previous-attempt learning, requested treatment information and preferred support network.

## Implemented data additions

- exact cigarette quantity + day/week period
- derived cigarette quantity band for HSI without asking a duplicate question
- cigarette form
- optional self-reported total nicotine spending in SAR
- previous quit-support methods
- cessation-support knowledge
- treatment-information interests
- preferred support channels
- additional trigger set + optional free text
- additional motivation set + optional free text
- change goal: quit / reduce / maintain abstinence / explore
- reduction target: 25 / 50 / 75 percent
- quit/change date choice and optional validated date
- optional support-person relationship
- separate plan-email consent
- separate follow-up-email consent

## Safety and governance decisions

- Existing Aqla safety screening is retained unchanged and remains authoritative.
- No new medication dose or product recommendation is generated from preference questions.
- No NHS efficacy multiplier, treatment claim, health-timeline claim, image, video or branded service was copied.
- Financial inputs are withheld from OpenAI personalisation and from default research export.
- Free-text trigger/motivation fields are excluded from default research export.
- Plan and follow-up email consent are operational fields, not research consent.
- A specific target date is accepted only within the server-defined safe date window.
- A reduction pathway scales savings to the selected reduction target; it does not show full-quit savings.

## Count used for implementation checkpoint

- NHS questions/concepts accounted for: **20**
- Already adequately covered / Aqla already better: **5**
- Existing concepts materially improved/corrected: **6**
- Newly added concepts: **8**
- Intentionally not added: **1**
