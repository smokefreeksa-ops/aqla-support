# Aqla Research-Grade Upgrade Plan

This is a large, multi-area change. Below is the scoped plan. I will preserve all existing data and dashboard functionality — only additive schema changes and refined logic.

## 1. Database migration (additive only)

**New columns on `participants`:**
- `school_university_workplace` text, `affiliation_type` text (school/university/workplace/community)
- `education_level` text, `nationality` text (nullable)
- `pregnancy` boolean, `research_consent_status` text default 'not_given'

**New tables:**
- `product_use_details` — per-product rows: `product`, `ever_use`, `current_use_30d`, `days_used_30d`, `age_first_use`, `age_regular_use`, `usual_place`, `source`, `family_peer_use`, `ad_exposure`, `is_main_product`
- `cigarette_module` — cigarettes_per_day, time_to_first_cig, HSI score
- `vape_module` — days_30d, times_per_day, time_to_first, nic_concentration, device_type, flavors, refillable, used_at_institution, tried_to_stop
- `pouch_module` — days_30d, pouches_per_day, strength, time_to_first, flavors, source, used_at_institution, tried_to_stop, wants_counseling
- `shisha_module` — days_30d, sessions_per_week, avg_duration, shared_mouthpiece, setting, tobacco_type, also_uses_other, quit_interest
- `honc_screening` — 10 yes/no fields, positive_count, any_yes, category
- `motivation_assessment` — importance_0_10, confidence_0_10, main_reason, barriers (array)
- `quit_history` — ever_tried, attempts_count, longest_quit, methods_used (array), relapse_reason
- `safety_flags` — pregnancy, severe_chest_pain, severe_breath, coughing_blood, severe_withdrawal, mental_health, repeated_failed, multi_product, medication_request, alt_product_request, clinician_request
- `follow_up_visits` — visit_point (1w/4w/12w/6m/12m), contacted, lost, attempted, abstinent, reduced, relapsed, current_product, cpd, vaping_freq, pouches_day, craving_0_10, confidence_0_10, co_reading, notes

All tables: RLS enabled, public INSERT (consent flow), admin/physician SELECT, physician UPDATE where needed. Indexed by `participant_id`.

**New consent column:** `consent_research_publication` boolean on `consent_records`.

## 2. Assessment form (`src/routes/assessment.tsx`) — adaptive branching

Steps in order:
1. Consent (4 checkboxes, research-publication separate & optional)
2. Identity & contact
3. Demographics (with affiliation_type select)
4. Product use grid (ever/30d per product)
5. Per-product modules (only shown if current_use_30d=true): cigarette → FTND, vape → Nicotine Control Check, pouch, shisha
6. HONC-style screening (auto-shown if age<25 or any youth product use)
7. Readiness + motivation (importance, confidence, barriers)
8. Quit history
9. Safety flags (with urgent-care warning banner if severe symptoms ticked)
10. Follow-up preference
11. Submit

Each module is conditionally rendered. Optional research-extension block at the end.

## 3. Scoring (`src/lib/scoring.ts`)

- Keep FTND logic untouched.
- Add `scoreHonc(answers)` → positive_count, category (none/low/moderate/high).
- Cohort assignment expanded to consider HONC result, safety flags, clinician_request → routes to doctor review or Cohort F as appropriate. Keep current Nicotine Control behavior (≥6 → doctor_review_needed, Cohort C).
- No automatic medication / NRT / alt-product recommendations — those route to clinician review.

## 4. Submission (`src/lib/submit.functions.ts`)

Extend Zod schema with all new optional sections. Insert rows into new tables only when their section was completed. Wrap in `Promise.all`. Return same shape + new flags.

## 5. Admin

**Dashboard (`src/routes/admin.tsx`):** no breaking changes; existing filters preserved. Add column for HONC category and main_product where space allows.

**Data Dictionary page** (`src/routes/admin.data-dictionary.tsx`): static table generated from a single source-of-truth array in `src/lib/data-dictionary.ts`. Columns: variable, question, options, coding, required, source/framework, triage purpose, research purpose, in_anonymized_export.

**Exports (`exportCsv` server fn):** add types `baseline`, `follow_up_outcomes`, `product_use`, `youth_nicotine`, `city_summary`. Anonymized variants strip name/mobile/email/notes. Filterable by `research_consent_status`. Add warning banner in admin export UI.

## 6. Out of scope (intentionally not done in this pass)

- Save-progress / draft persistence (would require auth or anon session table — call out for follow-up).
- Admin-toggle for nationality/SES visibility (added as nullable columns; UI toggle deferred).
- Validated PROMIS-E / Penn State exact wording (kept as "Nicotine Control Check" label per your instruction).

## Technical notes

- Migration is additive; no destructive ALTERs; existing rows remain valid (all new cols nullable / defaulted).
- All new tables follow existing RLS pattern: `public INSERT`, `is_admin_user` SELECT.
- New server fns added to `submit.functions.ts`; no new packages needed.
- TypeScript types regenerate after migration approval before code edits.

Please approve the migration in the next step and I'll execute the schema change, then ship the code in the same turn.
