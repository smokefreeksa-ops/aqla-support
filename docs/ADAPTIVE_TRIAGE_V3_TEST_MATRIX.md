# Aqla Adaptive Assessment / Triage v3 — verification matrix

Target branch: `agent/nextjs-aws-migration`

Purpose: deterministic branching, triage, OpenAI-boundary, persistence and email-follow-up checks before runtime verification.

## Required personas

1. Cigarette-only, 5/day, first use >60 min, few triggers, high confidence.
2. Cigarette-only, >30/day, first use <5 min, repeated short quit attempts.
3. Vape-only, disposable, low-frequency, no night waking, low PSECDI result.
4. Vape-only, pod, frequent use, first vape <5 min, night waking, strong cravings, high PSECDI result.
5. Vape-only, refillable, unknown nicotine strength; PSECDI still scores from complete required items.
6. Pouch-only, 2/day, no night use/cravings, low adapted screen.
7. Pouch-only, >8/day, early use, night use, cravings, difficulty cutting down, high adapted screen; label remains non-validated.
8. Pouch-only with optional brand/strength absent; plan must still complete.
9. Cigarette + vape mixed use; cigarette selected as dominant; no substitution.
10. Cigarette + vape mixed use; vape dominant; substitution yes.
11. Vape + pouches mixed use; pouches dominant; substitution yes.
12. Cigarettes + shisha + pouches; mixed complexity must be complex without creating a fake cross-product validated dependence score.
13. Shisha-only; existing session questions retained; no PSECDI/pouch score.
14. Heated-tobacco-only; no invented validated score; adaptive triage falls back to behavioural/readiness data.
15. Relapse-prevention-only; quantity/product-specific questions skipped and follow-up focus is maintain.
16. Low readiness/high confidence; follow-up focus should not be forced to cravings without evidence.
17. High importance/low confidence; enhanced support or confidence focus where deterministic rules indicate.
18. Previous attempt <24h + multiple relapse causes; relapse vulnerability high.
19. Professional-review safety flag; support need professional, safety track professional_review.
20. Suicidal-ideation safety flag; immediate safety remains authoritative, OpenAI personalisation skipped, routine email/follow-up held.
21. Plan email opt-in true / follow-up email false; plan email only, future follow-up records carry no recipient.
22. Plan email false / follow-up email true; schedules created without plan-link email.
23. Both email consents false; saved plan only.
24. Both email consents true; plan email + scheduled secure check-ins.
25. Follow-up email click for mixed-use profile; email remains generic, authenticated page shows mixed-use focus.
26. Follow-up email click for low-confidence profile; authenticated page shows confidence focus.
27. Follow-up opt-out/suppression after scheduling; send-time suppression must still prevent SES follow-up delivery.
28. Existing v1/v2 saved plan without adaptive_triage; plan and follow-up pages must gracefully fall back.

## Safety / governance assertions

- OpenAI never calculates HSI, PSECDI, pouch-adapted score, safety track or referral state.
- PSECDI is calculated only from all required Penn State e-cigarette items.
- Pouch screen remains explicitly adapted/non-validated in code, plan and governance UI.
- No cross-product dependence score is represented as a validated clinical instrument.
- Nicotine spending, support-person name and pouch brand are not sent to OpenAI.
- Sensitive triage detail is not placed in follow-up email body/subject; it appears after authenticated link access.
- Research export remains deny-by-default and does not automatically acquire adaptive raw fields or internal triage dimensions.

## CI gate

Before marking CI VERIFIED:

- internal route check passes
- ESLint passes
- Next.js production build passes
- CloudFormation lint passes
- existing v2 email/follow-up infrastructure still compiles unchanged
