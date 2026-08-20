# Aqla Personal Quit Plan v2 test matrix

Target: `agent/nextjs-aws-migration`
Status: source/CI test matrix; runtime staging verification still required.

| Persona | Expected branch / assertion |
|---|---|
| 1. Heavy daily cigarette user | Exact cigarettes/day required; first-use question shown; HSI band derived server-side; quit/reduce/explore available |
| 2. Low-frequency cigarette user | Exact quantity may be entered per week; derived daily amount remains fractional and HSI band is derived without duplicate question |
| 3. Shisha user | Shisha sessions/week and duration required; cigarette-only fields hidden |
| 4. Vape-only user | Vape pattern required; no cigarette-form/quantity requirement; full Aqla plan remains available |
| 5. Nicotine-pouch user | Pouch frequency required; no cigarette-only questions |
| 6. Mixed cigarette + vape user | Both relevant intensity branches shown; mixed-use logic remains authoritative |
| 7. Previous quitter who returned | Previous support-method and relapse-cause questions shown; non-shaming wording retained |
| 8. Currently abstinent relapse-prevention user | Quantity/date pressure removed; goal becomes maintain abstinence; relapse-prevention base engine preserved |
| 9. Low readiness | 0–10 readiness preserved; explore/no-date option available; participant is not forced to choose a quit date |
| 10. High importance but low confidence | Existing readiness classifier remains authoritative; no duplicate categorical confidence question |
| 11. Previous NRT experience | `previous_quit_support_methods` can record NRT; plan acknowledges prior approach without auto-prescribing it again |
| 12. Previous attempt with willpower only | Prior method recorded; support/treatment information preferences can expand future options without shaming |
| 13. Quit date today | `quit_date_choice=today`; plan shows today as start date |
| 14. Future specific date | Specific date is required and server validated; invalid/past-too-far dates rejected |
| 15. No date selected | `not_ready` accepted where appropriate; plan remains useful without coercion |
| 16. Spending entered | Savings calculated in SAR for week/month/3m/6m/year from self-reported spending only |
| 17. Spending declined | No savings card; no default Saudi price invented; plan still completes |
| 18. Support person selected | Optional name plus relationship can personalise support message; no third-party phone/email required |
| 19. No support person | Plan remains complete; AI support-person field may remain generic/optional |
| 20. Immediate safety flag | Deterministic safety message overrides routine communication; no routine plan email/follow-up scheduling even if boxes were selected |

## Communication-specific assertions

- Plan persistence does not depend on email consent.
- `plan_email_opt_in=false` means no plan-ready email is sent.
- `followup_email_opt_in=false` means no EventBridge follow-up schedules are created and follow-up records carry no recipient email.
- Plan-link consent and ongoing follow-up consent are independent.
- Existing unsubscribe/suppression checks remain an additional send-time safeguard.

## Research/privacy assertions

- Spending fields are not default-research-eligible.
- Free-text trigger/motivation fields are not default-research-eligible.
- Support-person relationship is not default-research-eligible.
- Communication consent fields are not research consent.
- Financial amount is not sent to OpenAI personalisation.
