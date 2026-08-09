# Aqla — Master Clinical Architecture Review (Revision 2, analysis only)

No code, UI, database, PDF or email changes have been made. Review only.

**Confirmation for item 10:** `Aqla_Pharmacotherapy_Module_AR_EN.md` has now been read in full, **all 349 lines, Parts A, B, C (C.1–C.10), D and E**, plus the closing "Implementation notes for the developer" and the "⚠ Before publication" note. The earlier "Parts A–C" phrasing was an incomplete statement of scope and is corrected here. Part D (dose lookup table, ceiling rule, preloading option) and Part E (12 references) are audited explicitly in §G below.

Governing source of truth: the Evidence Matrix. It carries an explicit **Jurisdiction** column across all 45 rules (Global / Global-UK / UK / Saudi Arabia / Jurisdiction-specific / Research), which is the basis for the jurisdiction architecture below.

---

## A. Current flow map (as actually implemented)

`/quit-chat` (`src/routes/quit-chat.tsx`) is a self-contained local state machine. It calls no server function, writes nothing to the database, sends no email.

```text
0    welcome
1    name / alias                    free text
2    city                            free text          <-- no country captured anywhere
3    primary product                 single select
4    offer dependence test           yes -> 5 | no -> 10
5    amount per day                  0/1/2/3            FTND item
6    time to first dose              3/2/1/0            FTND item
7    hard to abstain where banned    1/0                FTND item
8    more in the morning             1/0                FTND item
9    score = sum, shown as "X من 8", then a treatment sentence
10   readiness 1-10                  <5 -> state 99 dead end
11   quit date                       today | tomorrow | in a week
12   triggers                        5 fixed options, multi
13   supporter name                  free text
13.5 email                           free text + regex
14   3-second timer, sendEmailPayload() = console.log only,
     toast "تم إرسال الخطة للبريد بنجاح!", then window.print() / -> /dtx
```

Plan output = `PrintableQuitPlan.tsx`: browser print view, 10 local fields, hard-coded trigger text, non-Aqla blue styling.

**Preserved technical finding (item 16).** A complete backend already exists and is not connected to `/quit-chat`: `src/lib/quit-plan.functions.ts` (`startQuitPlan` / `saveAnswer` / `finalizeQuitPlan` / `getQuitPlan` / `scheduleReminder`), `quit-plan-builder.ts`, `quit-question-bank.server.ts`, `quit-plan-pdf.tsx`, and the `quit_plans` / `quit_plan_emails` / `quit_plan_reminders` tables (`plan_token`, `pdf_url`, `email_sent_at`, `admin_notified_at`, `score_band`, `risk_flag`, `validated`), consumed by `QuitPlanChat.tsx` and `/quit-plan/$planToken`. **`/quit-chat` must become the conversational front end of that existing pipeline. No third parallel engine is to be created.**

---

## B. Keep / Modify / Remove / Add — reconciled with §Counts (item 15)

Exactly three verdicts are used: **KEEP UNCHANGED**, **MODIFY**, **REMOVE**. Nothing is both.

| # | Current prompt | Verdict | Reason |
|---|---|---|---|
| 1 | Name / alias | KEEP UNCHANGED | Wording, type and storage are correct. |
| 2 | City | MODIFY | Must be preceded by country/jurisdiction and must no longer drive services on its own. |
| 3 | Primary product | MODIFY | Becomes multi-select product inventory (Matrix row 0) with an optional primary. |
| 4 | "Do you want the dependence test?" | MODIFY | Skip is retained (item 5), but skipping must suppress dependence-specific and medication-specific output instead of silently producing it. |
| 5 | Cigarettes per day | MODIFY | Retained as FTND item 4; must sit inside the complete instrument. |
| 6 | Time to first cigarette | MODIFY | Retained as FTND item 1; same. |
| 7 | Hard to refrain where banned | MODIFY | Retained as FTND item 2; same. |
| 8 | More in the morning | MODIFY | Retained as FTND item 5; same. |
| 9 | Readiness 1–10 | MODIFY | Must not dead-end below 5; must open the four-option discussion (item 4). |
| 10 | Quit date | MODIFY | Becomes conditional on the chosen strategy. |
| 11 | Triggers (5 fixed) | MODIFY | Expanded map + single highest-risk trigger (Gap row 5). |
| 12 | Supporter name | KEEP UNCHANGED | Wording and storage correct; a *new* separate question adds support method. |
| 13 | Email | MODIFY | Adds explicit, separated consents. |

Non-question components: **REMOVE 3** — the mock `sendEmailPayload` + false success toast, the score-alone treatment sentence at state 9, the unconditional identifiable admin copy.

---

## B2. Jurisdiction architecture (items 1, 2, 9)

`jurisdiction` is a **required, early, first-class variable**, captured before city and before any content selection.

```text
Q_COUNTRY  (required, asked or inferred)
  inferred from locale/IP -> MUST be shown back for explicit confirmation (Q_COUNTRY_CONFIRM)
  never silently assumed
    -> jurisdiction = SA | UK | OTHER_SUPPORTED | UNSUPPORTED
Q_CITY_REGION (required) — used ONLY for local clinic lookup *within* the confirmed jurisdiction,
                            and for plan personalisation. Never for policy.
```

Everything below is resolved from a `jurisdiction_profiles` content table, never hard-coded in logic:

| Jurisdiction-bound item | SA | UK | UNSUPPORTED |
|---|---|---|---|
| Emergency number | 997 | 999 / 112 | "your local emergency number" (no number invented) |
| Cessation service route | Sehhaty (primary, per Executive Summary), MOH clinics, 937 — each verified before display | NHS Stop Smoking Services / local authority service | generic "local cessation service / your doctor" |
| NRT availability | per Saudi register | per UK register | withheld |
| Varenicline | per Saudi status (Matrix row 12) | per UK status | withheld |
| Bupropion | held behind local-availability gate (Conflict row 2) | per UK status | withheld |
| Cytisine / cytisinicline | local-availability gate (Conflict row 1, Matrix row 15) | per UK status; UK-specific older-adult rule (Matrix row 16) | withheld |
| Nicotine e-cigarettes | apply Saudi/WHO position | apply UK/NICE position | withheld, conflict stated neutrally |
| Under-18 rule | local | UK rule (Matrix row 17) | conservative default: clinician |
| Reduce-to-quit | offered per local guidance | UK-supported (Matrix row 21) | offered as a general option, not as a guideline claim |
| Further medication course after relapse | local verify (Matrix row 31) | UK rule | withheld |
| Dose/label text | Saudi label | UK label | withheld |

Rules:
- **No Saudi identifier (937, 997, Sehhaty, MOH clinic counts) may appear for a non-Saudi user**, and no UK identifier for a Saudi user.
- If `jurisdiction = UNSUPPORTED`, the plan is generated **behavioural-only**, with no medication content and no invented service numbers, plus "consult a local clinician or pharmacist".
- **E-cigarettes are not globally excluded** (item 9). Matrix row 38 and Conflict row 0 state the guideline conflict is jurisdiction-specific with the explicit instruction "do not make one global Aqla rule". Aqla therefore stores the conflict, presents the position of the confirmed jurisdiction, and discloses that guidance differs elsewhere. Nicotine pouches, by contrast, are handled under Matrix row 39 (cessation role) — also jurisdiction-resolved, not blanket-excluded by code.

---

## C. FULL conversational assessment table (item 11)

43 items. Legend for the last three columns: **T** affects treatment, **S** affects safety, **P** affects plan personalisation.

| ID | Arabic patient-facing wording | English internal meaning | Purpose | Answer type | Options | Req/Cond | Branch condition | Stored variable | Later decision using it | T | S | P |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Q_NAME | ما الاسم الذي تحب أن أناديك به؟ | Preferred name or alias | Rapport, plan header | free text | — | Required | always | `display_name` | plan header, email greeting | – | – | ✔ |
| Q_COUNTRY | في أي دولة تعيش حاليًا؟ | Country of residence | Sets jurisdiction | single select + search | Saudi Arabia, United Kingdom, other (list), prefer not to say | Required | always, asked **before** city | `country_code` | jurisdiction profile, all service/medication/emergency content | ✔ | ✔ | ✔ |
| Q_COUNTRY_CONFIRM | يبدو أنك في {{country}} — هل هذا صحيح؟ | Confirm inferred country | Prevents silent inference | single select | نعم / لا → re-ask Q_COUNTRY | Conditional | country was inferred from locale/IP | `country_confirmed` | gates use of jurisdiction profile | ✔ | ✔ | ✔ |
| Q_CITY_REGION | أي مدينة أو منطقة؟ | City/region within country | Local clinic lookup, personalisation | free text / select | — | Required | after country confirmed | `city_region` | local service lookup **within** jurisdiction only | – | – | ✔ |
| Q_AGE_BAND | كم عمرك؟ | Age band | Adolescent/older-adult pathways | single select | <18، 18–24، 25–44، 45–64، 65+ | Required | always | `age_band` | under-18 pathway (Matrix row 17), older-adult rule (row 16) | ✔ | ✔ | ✔ |
| Q_SEX | ما الجنس المسجّل لديك؟ (لأسباب طبية فقط) | Sex recorded at birth | Gate for pregnancy question only | single select | أنثى / ذكر / أفضل عدم الإجابة | Required | always | `sex_recorded` | routes to Q_PREGNANCY | – | ✔ | – |
| Q_PREGNANCY | هل أنتِ حامل حاليًا أو تخططين للحمل؟ | Pregnancy status | Pregnancy cessation pathway | single select | نعم / لا / لست متأكدة | Conditional | `sex_recorded = female` and age 12–55 | `pregnancy_status` | pregnancy pathway (Matrix row 18) | ✔ | ✔ | ✔ |
| Q_BREASTFEEDING | هل ترضعين طبيعيًا حاليًا؟ | Breastfeeding status | Same pathway | single select | نعم / لا | Conditional | pregnancy answered نعم or لا with recent birth | `breastfeeding` | pregnancy/postpartum pathway | ✔ | ✔ | ✔ |
| Q_PRODUCTS | ما المنتجات التي تستخدمها حاليًا؟ (يمكن اختيار أكثر من واحد) | Full nicotine/tobacco inventory | Matrix row 0 mandate | multi select | سجائر، فيب، شيشة، أكياس النيكوتين، تبغ غير مدخّن، سيجار/معسل آخر، أقلعت بالفعل، لا أستخدم | Required | always | `products[]` | complexity flag, instrument routing, plan content | ✔ | ✔ | ✔ |
| Q_PRIMARY_PRODUCT | أيها الأكثر أهمية بالنسبة لك الآن؟ | Primary product | Focus of the plan | single select | from `products[]` | Conditional | `products.length > 1` | `primary_product` | plan focus, dependence instrument | ✔ | – | ✔ |
| Q_DEP_CONSENT | هل تحب أن نقيس مدى اعتماد جسمك على النيكوتين؟ (اختياري) | Offer dependence assessment | Consent; skip allowed (item 5) | single select | نعم / لاحقًا | Required | always | `dependence_consent` | if لاحقًا → `dependence_status = not_assessed`, dependence- and medication-specific output suppressed | ✔ | ✔ | ✔ |
| Q_FTND_1 | متى تدخّن أول سيجارة بعد الاستيقاظ؟ | FTND item 1, TTFC | Dependence | single select | ≤5 د (3)، 6–30 (2)، 31–60 (1)، >60 (0) | Conditional | consent نعم **and** cigarettes in `products[]` | `ftnd.q1` | FTND total/band | ✔ | – | ✔ |
| Q_FTND_2 | هل يصعب عليك الامتناع في الأماكن الممنوعة؟ | FTND item 2 | Dependence | yes/no | نعم (1) / لا (0) | Conditional | same | `ftnd.q2` | FTND total | ✔ | – | ✔ |
| Q_FTND_3 | أي سيجارة يصعب عليك التخلي عنها؟ | FTND item 3 | Dependence | single select | أول سيجارة الصباح (1) / أي أخرى (0) | Conditional | same | `ftnd.q3` | FTND total | ✔ | – | ✔ |
| Q_FTND_4 | كم سيجارة تدخّن في اليوم؟ | FTND item 4, CPD | Dependence + plan content | single select | ≤10 (0)، 11–20 (1)، 21–30 (2)، ≥31 (3) | Conditional | same | `ftnd.q4` | FTND total, money/health sections | ✔ | – | ✔ |
| Q_FTND_5 | هل تدخّن أكثر في أول ساعات اليوم؟ | FTND item 5 | Dependence | yes/no | نعم (1) / لا (0) | Conditional | same | `ftnd.q5` | FTND total | ✔ | – | ✔ |
| Q_FTND_6 | هل تدخّن حتى عندما تكون مريضًا في الفراش؟ | FTND item 6 | Dependence | yes/no | نعم (1) / لا (0) | Conditional | same | `ftnd.q6` | FTND total, completes 0–10 scale | ✔ | – | ✔ |
| Q_NONCIG_LOAD | كم تستخدم {{product}} تقريبًا في اليوم/الأسبوع؟ | Descriptive non-cigarette use load | Personalisation only — **not** a validated score | single select per product | product-specific bands | Conditional | consent نعم and a non-cigarette product selected | `use_load[product]` | plan content and complexity flag **only**; never a dependence band (see §C2) | – | – | ✔ |
| Q_PREV_ATTEMPT | هل حاولت الإقلاع من قبل؟ | Previous quit attempt | Matrix row 2 | yes/no | نعم / لا | Required | always | `prev_attempt` | if لا, skip Q_LONGEST…Q_PREV_AID_AE | ✔ | – | ✔ |
| Q_LONGEST | ما أطول فترة توقفت فيها؟ | Longest abstinence | Prognosis, plan pacing | single select | <24س، 1–7 أيام، 1–4 أسابيع، 1–6 أشهر، >6 أشهر | Conditional | `prev_attempt = yes` | `longest_abstinence` | plan pacing, relapse-prevention depth | – | – | ✔ |
| Q_END_REASON | ما الذي أنهى المحاولة؟ | Reason attempt ended | Targeted relapse prevention | multi select | أعراض انسحاب، ضغط نفسي، مناسبة اجتماعية، وزن، توقف الدواء، سبب آخر | Conditional | `prev_attempt = yes` | `relapse_reasons[]` | tailored rescue protocols | – | – | ✔ |
| Q_PREV_AID | هل استخدمت علاجًا مساعدًا؟ | Previous treatment used | Matrix row 2 | multi select | لا شيء، بدائل النيكوتين، فارينيكلين، بوبروبيون، أخرى، لا أذكر | Conditional | `prev_attempt = yes` | `prev_treatments[]` | treatment-candidate ranking, escalation input | ✔ | ✔ | ✔ |
| Q_PREV_ADHERENCE | هل استخدمته بالجرعة والمدة الكاملة؟ | Adherence to previous treatment | Distinguishes true failure from under-use | single select | نعم / لا / لا أذكر | Conditional | `prev_treatments` ≠ none | `prev_adherence` | whether prior "failure" counts as failure | ✔ | – | ✔ |
| Q_PREV_AE | هل واجهت أي أعراض جانبية منه؟ | Previous adverse effects | Exclusion of a specific agent | free text + common list | غثيان، أرق، طفح جلدي، تغيّر مزاج، أخرى، لا | Conditional | `prev_treatments` ≠ none | `prev_adverse_effects[]` | removes that agent from candidates | ✔ | ✔ | – |
| Q_CONDITIONS | هل لديك أي من الحالات التالية؟ | Medical history | Matrix row 3 | multi select | قلبية، تنفسية، كلوية، صرع/اضطراب اختلاجي، اضطراب أكل، صحة نفسية، سكري، لا شيء | Required | always | `conditions[]` | safety gates, candidate exclusions | ✔ | ✔ | ✔ |
| Q_CARDIAC_STATUS | كيف تصف حالتك القلبية حاليًا؟ | Cardiac status stratification (item 3) | Three-way, not binary | single select | مستقرة منذ فترة طويلة / حدث قلبي حديث خلال أسبوعين / أعراض نشطة أو تزداد سوءًا | Conditional | `conditions` includes cardiac | `cardiac_status` | see §E cardiac ladder | ✔ | ✔ | ✔ |
| Q_CARDIAC_SYMPTOMS_NOW | هل تشعر الآن بألم في الصدر أو ضيق تنفس شديد؟ | Active red-flag symptoms | Emergency detection | yes/no | نعم / لا | Conditional | `cardiac_status = active/worsening`, or volunteered symptom text | `acute_symptoms` | emergency gate only | – | ✔ | – |
| Q_MH_STATUS | كيف تصف حالتك النفسية حاليًا؟ | Mental-health stability | Matrix row 33 | single select | مستقرة ومتابعة / غير مستقرة / لست متأكدًا | Conditional | `conditions` includes mental health | `mh_status` | clinician gate, mood-monitoring content | ✔ | ✔ | ✔ |
| Q_SUICIDAL | هل راودتك أفكار بإيذاء نفسك؟ | Suicidal ideation screen | Emergency gate | yes/no | نعم / لا | Conditional | `mh_status = unstable`, or volunteered | `suicidal_ideation` | emergency gate, plan suppression | – | ✔ | – |
| Q_MEDS_ANY | هل تأخذ أي أدوية بوصفة طبية بانتظام؟ | Any regular prescription medicines | Interaction screen (Matrix row 19) | yes/no | نعم / لا | Required | always | `takes_meds` | if لا, skip Q_MEDS_LIST | ✔ | ✔ | – |
| Q_MEDS_LIST | ما هي؟ (اكتبها أو اخترها) | Medicine list | CYP1A2 and other interactions | multi select + free text | كلوزابين، أولانزابين، ثيوفيلين، إنسولين، وارفارين، أخرى | Conditional | `takes_meds = yes` | `medications[]` | pharmacist alert on stopping, starting **and restarting** smoking | ✔ | ✔ | ✔ |
| Q_READINESS | من ١ إلى ١٠، ما مدى استعدادك للإقلاع الآن؟ | Readiness score | Conversation routing, not gating | slider 1–10 | 1–10 | Required | always | `readiness` | opens Q_STRATEGY discussion; **never** auto-assigns a strategy | – | – | ✔ |
| Q_STRATEGY | ما الذي يناسبك أكثر الآن؟ | Quit strategy, user-chosen (item 4) | Shared decision | single select | الإقلاع الآن / تحديد موعد قريب / التقليل تدريجيًا تمهيدًا للإقلاع / لست مستعدًا بعد لكن أريد الدعم | Required | always, framed by `readiness` | `quit_strategy` | plan variant; all four keep support available | ✔ | – | ✔ |
| Q_QUIT_DATE | متى تريد أن يكون يوم الإقلاع؟ | Target quit date | Timeline anchor (Matrix row 20) | date / select | اليوم، غدًا، خلال أسبوع، تاريخ محدد | Conditional | `quit_strategy` ∈ {quit now, future date, reduce-to-quit} | `quit_date` | day-0 protocol, reminders, medication timing | ✔ | – | ✔ |
| Q_TREATMENT_PREF | ما الذي تفضّله من حيث العلاج؟ | Treatment preference | Shared decision, Matrix row 4 | single select | دعم سلوكي فقط / بدائل نيكوتين / علاج بوصفة طبية / غير متأكد وأريد الشرح | Required | always, unless dependence skipped **and** user declines medication discussion | `treatment_pref` | candidate ranking | ✔ | – | ✔ |
| Q_TRIGGERS | ما المواقف التي تدفعك للتدخين؟ | Trigger map | Matrix row 23 | multi select | routine (قهوة، بعد الأكل، القيادة، الاستيقاظ)، emotional (توتر، غضب، ملل، حزن)، social (أصدقاء، مجلس، مناسبات)، environmental (المنزل، العمل، الاستراحة) | Required | always | `triggers[]` | trigger sections, craving ladder | – | – | ✔ |
| Q_TOP_TRIGGER | أيها الأصعب عليك؟ | Highest-risk trigger | Gap row 5 | single select | from `triggers[]` | Required | after Q_TRIGGERS | `top_trigger` | headline coping plan | – | – | ✔ |
| Q_WITHDRAWAL_HX | ماذا حدث لك سابقًا عند التوقف؟ | Prior withdrawal experience | Matrix rows 25–26 | multi select | تهيّج، أرق، شهية، تركيز، مزاج، لا شيء | Conditional | `prev_attempt = yes` | `withdrawal_history[]` | 0–72h and week 1–4 content | – | – | ✔ |
| Q_SUPPORT_PERSON | من الشخص الذي يمكن أن يدعمك؟ | Supporter name | Social support | free text | — | Required | always | `supporter_name` | supporter block in plan | – | – | ✔ |
| Q_SUPPORT_METHOD | كيف تحب أن يدعمك؟ | Preferred support style | Tailoring (Matrix row 6) | multi select | تذكير يومي، مرافقة، عدم التدخين أمامي، تشجيع فقط | Conditional | `supporter_name` provided | `support_method[]` | supporter instructions | – | – | ✔ |
| Q_EMAIL | إلى أي بريد نرسل خطتك؟ | Email address | Delivery | email | — | Required | always | `email` | plan email, dashboard link | – | – | ✔ |
| Q_CONSENT_PLAN_EMAIL | هل توافق على إرسال الخطة إلى بريدك؟ | Consent to plan email | Lawful basis | checkbox | نعم / لا | Required | always | `consent_plan_email` | email job runs only if true | – | – | – |
| Q_CONSENT_RESEARCH | هل توافق على مشاركة بياناتك بشكل غير معرّف لأغراض البحث؟ | Separate research/admin consent | Governance | checkbox | نعم / لا | Required | always, presented separately | `consent_research` | de-identified research projection only | – | – | – |

### C2. Instruments — no invented scales (item 6)

The supplied evidence supports **one** dependence instrument. Matrix row 1 ("Dependence", jurisdiction Global/UK) and the entire Pharmacotherapy Module Part B/D use **FTND (cigarettes, 0–10)** and **TTFC**. Nothing in the Evidence Matrix, the Source Register (27 sources) or Part E (12 references) supports PS-ECDI, LWDS-11, HONC or an adapted pouch scale.

Therefore:
- **Implemented now:** FTND only, full 6 items, 0–10, using the already-correct `scoreFtnd` bands in `src/lib/scoring.ts` (0–2 very low, 3–4 low, 5 moderate, 6–7 high, 8–10 very high).
- **Not implemented:** PS-ECDI, LWDS-11, HONC, adapted pouch screens. These are recorded as **PROPOSED ADDITIONS REQUIRING SEPARATE EVIDENCE REVIEW AND CLINICAL VALIDATION BEFORE IMPLEMENTATION** and are out of scope until that review is supplied. (Note: `src/lib/scoring.ts` already *contains* `scorePennStateEcig`, `scoreLwds11`, `scoreHonc` and `scoreOralNicotineAdapted` used by `/quit-pathway`; this review does not extend them to the quit-plan engine, and flags them for the same validation review.)
- For non-cigarette products, `Q_NONCIG_LOAD` captures **descriptive use load only**. It produces no band, no score, no dependence label and no medication logic.
- If cigarettes are not used, or dependence was skipped, `dependence_status = not_assessed` and the plan is generated **without any dependence band and without medication-specific recommendations** (item 5), while full behavioural/self-management support is still produced.

---

## D. COMPLETE branching flow (item 13)

```text
[ENTRY]
Q_NAME
  |
Q_COUNTRY ──(inferred?)──> Q_COUNTRY_CONFIRM ──(no)──> re-ask Q_COUNTRY
  |
  ├─ SA               -> jurisdiction_profile = SA
  ├─ UK               -> jurisdiction_profile = UK
  ├─ other supported  -> jurisdiction_profile = that country
  └─ unsupported / prefer-not-to-say
                      -> jurisdiction_profile = GENERIC
                         medication content OFF, no emergency number invented,
                         behavioural plan still produced
  |
Q_CITY_REGION           (clinic lookup inside the confirmed jurisdiction only)
  |
Q_AGE_BAND
  ├─ <18   -> flag ADOLESCENT: prescription agents excluded; behavioural core +
  |           jurisdiction under-18 rule; clinician handoff; CONTINUE assessment
  └─ 65+   -> flag OLDER_ADULT: UK cytisinicline caution (Matrix row 16) applies
              only if jurisdiction = UK
  |
Q_SEX
  └─ female & age 12–55 -> Q_PREGNANCY
        ├─ yes / unsure -> Q_BREASTFEEDING -> flag PREGNANCY PATHWAY (see below)
        └─ no           -> (if recent birth) Q_BREASTFEEDING
  |
Q_PRODUCTS  (multi)
  ├─ none / already quit -> RELAPSE-PREVENTION or PREVENTION plan variant;
  |                          skip dependence, skip medication; jump to Q_TRIGGERS
  ├─ exactly 1 product   -> continue
  └─ >1 product          -> Q_PRIMARY_PRODUCT
                            set flag COMPLEXITY = poly_nicotine_use   (item 7)
                            *** complexity flag only — it does NOT by itself
                                require clinician review; review is required only
                                if another safety rule below fires ***
  |
Q_DEP_CONSENT
  ├─ "later" -> dependence_status = not_assessed
  |             dependence output OFF, medication-specific output OFF
  |             -> jump to Q_PREV_ATTEMPT
  └─ "yes"
       ├─ cigarettes in products -> Q_FTND_1..Q_FTND_6 -> scoreFtnd -> band
       └─ non-cigarette products -> Q_NONCIG_LOAD (descriptive only, no band)
       └─ if no cigarettes at all -> dependence_status = not_assessed_cigarettes
  |
Q_PREV_ATTEMPT
  ├─ no  -> skip to Q_CONDITIONS
  └─ yes -> Q_LONGEST -> Q_END_REASON -> Q_WITHDRAWAL_HX -> Q_PREV_AID
              └─ any aid used -> Q_PREV_ADHERENCE -> Q_PREV_AE
                    └─ adverse effect recorded -> exclude that agent from candidates
  |
Q_CONDITIONS  (multi)
  ├─ cardiac -> Q_CARDIAC_STATUS
  |      ├─ stable long-standing      -> NRT appropriate; no urgent gate;
  |      |                               cardiovascular reassurance block (Module C.8)
  |      ├─ event within ~2 weeks     -> gate = CLINICIAN REVIEW BEFORE PHARMACOTHERAPY
  |      |                               (not urgent care); behavioural plan proceeds
  |      └─ active / worsening        -> Q_CARDIAC_SYMPTOMS_NOW
  |             ├─ yes -> EMERGENCY gate, assessment paused, local emergency number
  |             └─ no  -> URGENT CARE gate (same-day clinician), plan deferred
  ├─ seizure / eating disorder -> exclude bupropion
  ├─ renal impairment          -> varenicline dosing is clinician-set, never app-set
  ├─ respiratory               -> plan content only
  └─ mental health -> Q_MH_STATUS
         ├─ stable & monitored -> mood-monitoring content, no hard gate
         ├─ unstable / unsure  -> Q_SUICIDAL
         |       ├─ yes -> EMERGENCY gate, plan suppressed, crisis routing
         |       └─ no  -> DOCTOR gate before pharmacotherapy
  |
Q_MEDS_ANY
  └─ yes -> Q_MEDS_LIST
        ├─ clozapine / olanzapine / theophylline -> INTERACTION flag, PHARMACIST gate,
        |    alert applies on stopping, starting AND restarting smoking (Matrix row 19)
        ├─ insulin / warfarin / other            -> PHARMACIST review flag
        └─ none matched                          -> generic pharmacist-check note
  |
Q_READINESS  (routing only, never gating)
  └─ ALWAYS -> Q_STRATEGY  (framed differently if readiness < 5:
                 "لا بأس — هذه خياراتك، وكلها مدعومة")
        ├─ quit now        -> Q_QUIT_DATE (today/tomorrow)
        ├─ future date     -> Q_QUIT_DATE
        ├─ reduce-to-quit  -> Q_QUIT_DATE (target) + reduction schedule variant
        |                     (Matrix row 21, jurisdiction-checked)
        └─ not ready yet   -> MOTIVATIONAL variant: full behavioural plan,
                              trigger map, resources, open door, follow-up offer.
                              NOT a dead end, NOT auto reduce-to-quit.
  |
Q_TREATMENT_PREF
  └─ (skipped only if dependence skipped AND user declines medication discussion)
  |
Q_TRIGGERS -> Q_TOP_TRIGGER
  |
Q_SUPPORT_PERSON -> (if given) Q_SUPPORT_METHOD
  |
Q_EMAIL -> Q_CONSENT_PLAN_EMAIL -> Q_CONSENT_RESEARCH
  |
[DECISION ENGINE] -> eligibility -> safety gates -> jurisdiction candidate filter
                  -> preference -> confirmation status -> immutable plan_json
```

**Pathway variants produced:** ADULT_STANDARD, ADOLESCENT, PREGNANCY/POSTPARTUM, NOT_READY_MOTIVATIONAL, REDUCE_TO_QUIT, RELAPSE_PREVENTION, PREVENTION (non-user), GENERIC_JURISDICTION (behavioural only). Eight variants, one engine.

**Pregnancy pathway (item 8), explicitly not a dead end:** behavioural support is the core and is always produced; clinically appropriate NRT **may be considered** under the jurisdiction's pregnancy pathway with clinician involvement (Matrix row 18); varenicline, bupropion and cytisine remain excluded; the plan is generated in full and carries a clinician-confirmation block rather than a block screen. Module block C.7 is retained but rewritten from "blocked" framing to pathway framing.

---

## E. Safety gates — corrected (item 3)

Six levels, and the cardiac ladder is now three-way, not binary.

| Level | Trigger conditions |
|---|---|
| **SELF-MANAGEMENT** | adult, no red flags, no interacting medicines, behavioural or OTC-NRT preference |
| **PHARMACIST** | (1) OTC NRT dose/technique question; (2) CYP1A2 or other interacting medicine identified; (3) persistent cravings on adequate NRT; (4) mild adverse effects |
| **CESSATION SPECIALIST** (jurisdiction-resolved service) | (5) high/very-high FTND band **combined with** another clinical factor; (6) documented prior treatment failure at full dose and duration; (7) user requests prescription therapy; (8) reduce-to-quit programme support |
| **DOCTOR / GP** | (9) pregnancy or breastfeeding; (10) under 18; (11) unstable or unclear mental-health status; (12) seizure or eating disorder; (13) renal impairment; (14) CYP1A2 medicines needing dose review; (15) **cardiac event within ~2 weeks — clinician review before pharmacotherapy only** |
| **URGENT / SAME-DAY CARE** | (16) active or worsening cardiac/respiratory symptoms without emergency red flags; (17) serious medication adverse effect |
| **EMERGENCY** (jurisdiction number) | (18) chest pain now; (19) severe breathlessness; (20) coughing blood; (21) suicidal ideation |

Six levels, **21 distinct trigger conditions**.

Explicitly corrected: a cardiac **history** is not a gate at all — stable long-standing disease receives NRT plus the Module C.8 reassurance block. A **recent event** is a doctor-review-before-pharmacotherapy gate. Only **active/worsening symptoms** reach urgent or emergency.

Explicitly corrected: **poly-nicotine use alone is a complexity flag**, not a clinician gate. It raises plan complexity, widens content coverage and is recorded for research, and only escalates when it co-occurs with a rule from the table above.

Data-sufficiency rule (Journey Coverage row 0): if the data needed for a medication decision are missing — including a skipped dependence test — the engine produces **no medication content at all** and issues the behavioural plan with an explicit "requires pharmacist/clinician confirmation" block.

---

## F. Treatment-selection architecture

```text
assessment inputs
  -> ELIGIBILITY        (age band, pregnancy status, data sufficiency)
  -> SAFETY EXCLUSIONS  (contraindications, interactions, cardiac ladder,
                         seizure/ED, renal, mental-health status, prior adverse effects)
  -> JURISDICTION FILTER (jurisdiction_profiles: which agents are available and
                          permitted here; e-cigarette position resolved here, not globally)
  -> CANDIDATE SET      (ranked, plural — never a single forced recommendation)
  -> PATIENT PREFERENCE (shared decision)
  -> CLINICAL CONFIRMATION where the gate requires it
  -> selected_treatment | pending_clinical_confirmation | none (behavioural only)
```

No dose, strength, schedule or taper is ever computed by Aqla logic. All such text is read from a versioned, label-sourced content table keyed by jurisdiction and registered product.

---

## G. Pharmacotherapy module — conflict audit (Parts A–E)

**1. Part B `escalate = ftnd >= 6 || priorNRTfail`** — score-driven escalation. Matrix row 1 / Gap row 0, **Critical**: FTND is one input among health, medicines, contraindications, preference and prior treatment. → multi-input escalation rule.

**2. Part B returns `COMBINATION_NRT` for every adult passing two gates** — Matrix row 10 says do not default everyone; contradicts preference and the varenicline pathway (row 11). → ranked candidate set.

**3. Part D dose table, and Part B `cpd > 10 ? 21mg : 14mg`** — Matrix row 13 / Gap row 16: dose must come from the current registered label, and CPD±TTFC alone is an incomplete determinant. → delete the arithmetic and the in-document table as an authority; replace with a jurisdiction-versioned label table.

**4. Part D fast-acting `4 mg` vs `2 mg` by CPD/TTFC** — same defect; the 4 mg benefit is graded moderate and specific to highly dependent smokers. → label-sourced, pharmacist-confirmed.

**5. Part D fixed tapers (21×6wk → 14×2wk → 7×2wk; 14×6wk → 7×2wk) and Part B `minDosesPerDay: 9`** — presented as instruction, not label-derived. → schedule becomes versioned content, not code.

**6. Part D "Ceiling: never recommend above 21–22 mg patch"** — the *ceiling* is defensible, but stating it as an Aqla instruction rather than a label-and-guideline-sourced limit repeats the same authority problem. → retain as a hard engine constraint with an explicit source ID.

**7. Part D "Optional: preloading — start the patch 2 weeks before quit date while still smoking (RR 1.25)"** — a clinically significant, prescriber-level manoeuvre offered as an option with no gate, no jurisdiction check and no eligibility conditions. → **clinician-gated only; never surfaced as a self-service option.**

**8. Part B `cardiacSafe: true` returned unconditionally** — no stratification. → replaced by the three-way cardiac ladder in §E.

**9. Part C.3 "هذا الجمع فعّال بقدر فعالية الفارينيكلين"** — asserts equivalence from a single non-significant comparison (RR 1.02, 5 studies) while Matrix row 11 grades varenicline superior to single NRT and bupropion. → rewrite AR and EN to "no clear difference was found in the available head-to-head trials", varenicline pathway kept open.

**10. Part B `BLOCK_MINOR` / `BLOCK_PREGNANCY` and Part C.7 block framing** — Matrix rows 17–18 define pathways, not dead ends. → adolescent and pregnancy plan variants that always produce a behavioural plan plus referral (item 8).

**11. Part B interaction list limited to clozapine / olanzapine / theophylline** — Matrix row 19 is broader and covers stopping, starting **and restarting**. → broader screen, pharmacist alert, and the same alert reused in relapse flows.

**12. Part A.4 / C.9 service data — "أكثر من ٢٦٠ عيادة", "937", "free of charge", and 997** — hard-coded Saudi identifiers with no jurisdiction guard, while the Executive Summary names **Sehhaty** as the current route. → moved wholesale into `jurisdiction_profiles`; never rendered for non-Saudi users; figures verified and dated (items 1, 2).

**13. Bupropion and cytisine presented as available (Parts A.1, B)** — Conflict rows 1–2 require local gates. → jurisdiction-gated, not globally removed.

**14. Part E reference set** — 12 references, all WHO/Cochrane/CDC/NCSCT/Saudi MOH. It contains **no UK NICE guideline and no e-cigarette guidance**, yet the Evidence Matrix carries UK-jurisdiction rules (rows 16, 17, 21, 30, 32) and the e-cigarette conflict (rows 37–38). → the module alone is insufficient to serve a UK user; the jurisdiction profile must be backed by the Matrix Source Register (27 sources), and UK-specific sources must be added before UK go-live.

**15. Part C.10 "honest limitation" + the "⚠ Before publication" note** — the document itself states the Arabic has not been clinically back-translated and that Saudi NRT availability, brands and pricing are unconfirmed. → this is a **release gate**, not a footnote: Parts C.3, C.4 and C.6 require Saudi pharmacist and cessation-specialist sign-off before any of this content ships.

**Verified non-conflict:** the module's FTND display banding (0–2 / 3–4 / 5 / 6–7 / 8–10) matches `scoreFtnd` in `src/lib/scoring.ts`. Keep it and reuse that function instead of the inline sum in `/quit-chat`.

---

## H. Plan personalisation map

| Plan section | Driven by |
|---|---|
| Header / profile | `display_name`, `country_code`, `city_region`, `age_band`, `products[]`, `primary_product` |
| Dependence profile | FTND total + band, **or** an explicit "not assessed" statement |
| Non-cigarette use description | `use_load[]` (descriptive, unscored) |
| Treatment pathway | eligibility → safety → jurisdiction filter → candidates → preference → confirmation status |
| Medication instructions & safety | `selected_treatment` + jurisdiction label content + `interaction_flags` |
| Emergency & service block | `jurisdiction_profile` + `city_region` |
| Preparation and quit day | `quit_strategy`, `quit_date`, treatment readiness |
| First 24h / 72h / days 4–7 | dependence band (if any), `withdrawal_history[]`, `products[]` |
| Weeks 2–4 → 12 months+ | `quit_strategy`, `longest_abstinence`, `relapse_reasons[]` |
| Trigger map + craving ladder | `triggers[]`, `top_trigger` |
| Coffee / meals / driving / work / social / home sections | matched subset of `triggers[]` only |
| Sleep, appetite, mood, stress | `withdrawal_history[]`, `mh_status` |
| Supporter instructions | `supporter_name`, `support_method[]` |
| Missed dose / side effects / cravings not controlled | `selected_treatment` |
| One puff / one cigarette / one day / full relapse | four distinct protocols, always included (Matrix rows 28–29) |
| Escalation block | highest fired safety gate |
| Complexity note | `COMPLEXITY = poly_nicotine_use` (informational, non-escalating) |

---

## I. Single source of truth (item 17, preserved)

```text
assessment answers -> DECISION ENGINE (runs exactly once, inside finalizeQuitPlan)
                   -> immutable plan_json (+ plan_id, assessment_id, jurisdiction,
                      plan_version, clinical_rule_version, evidence_version,
                      generated_at, language, pdf_version, email_status)
                   -> on-screen view | PDF | download | email attachment | dashboard
```

- No surface re-runs the engine; all five read the same stored `plan_json`.
- `email_status` is written only from the provider's confirmed response. The UI shows "تم الإرسال" only when `email_status = 'sent'`; otherwise it shows a retry control while plan display and PDF download remain fully available.
- The research/admin copy is a separate, consent-gated job over a de-identified projection, never implicit.
- Implemented by extending the **existing** `finalizeQuitPlan` in `src/lib/quit-plan.functions.ts` and the existing `quit_plans` row — not a new pipeline (item 16).

---

## J. Data model (proposed, nothing created)

Extend rather than duplicate. `quit_plans` already carries plan/token/pdf/email/admin fields.

`jurisdiction_profiles`, `cessation_assessments`, `tobacco_use`, `dependence_assessments`, `quit_history`, `medical_safety`, `current_medications`, `treatment_history`, `treatment_options`, `selected_treatment`, `triggers`, `support_partners`, `quit_plans` (extend with `jurisdiction`, `plan_variant`, `clinical_rule_version`), `plan_versions`, `clinical_rules`, `evidence_sources` (seeded S01–S27), `rule_versions`, `safety_escalations`, `medication_label_content` (jurisdiction × product × version), `pdf_records`, `email_delivery_records`, `consents`.

All health tables owner-only RLS with explicit GRANTs; research access only through a consented, de-identified view.

---

## K. Current project gap report

- **ALREADY IMPLEMENTED:** conversational RTL UI; `quit_plans` / `quit_plan_emails` / `quit_plan_reminders`; start/save/finalize/retrieve server functions; PDF renderer; email infrastructure; correct FTND banding in `scoreFtnd`; escalation logic in `assignCohort`; SOS craving feature; learner dashboard.
- **PARTIALLY IMPLEMENTED:** dependence assessment (4 of 6 FTND items); triggers (5 fixed, no top trigger); quit date (no strategy choice); PDF (short, not a lifetime plan); admin copy (exists, not consent-gated); product-specific instruments exist in `scoring.ts` for `/quit-pathway` but are unvalidated and out of scope here.
- **MISSING:** country/jurisdiction capture and the entire jurisdiction profile layer; medical and medication safety screens; interaction screen; quit-history and previous-treatment module; treatment-selection engine; jurisdiction-filtered candidate sets; adolescent and pregnancy variants; not-ready and reduce-to-quit variants; quit-day and 0–72h protocols; four separate lapse/relapse protocols; months 2–12+ longitudinal plan; label content table; evidence, rule and plan versioning; consent model.
- **INCORRECT:** score labelled Fagerström at max 8; treatment conclusion drawn from score alone; readiness <5 dead-ends; `/quit-chat` persists nothing, so the dashboard never activates; city treated as if it determined services.
- **POTENTIALLY UNSAFE:** false "email sent" confirmation; unconsented identifiable health data sent to admin; skipped dependence test still yielding dependence-flavoured output; deterministic dopamine/detox/craving-duration claims in `PrintableQuitPlan` (Gap rows 6–11); Saudi emergency and service numbers that would be shown to a non-Saudi user.

---

## L. Implementation phases (recommended order, none started)

1. **Truthfulness fixes** — remove the false email toast, remove the score-alone treatment sentence, correct the instrument label and maximum, stop the readiness dead end.
2. **Jurisdiction layer** — `Q_COUNTRY` + confirmation before city, `jurisdiction_profiles`, all service/emergency/medication strings moved out of code.
3. **Wire `/quit-chat` to the existing backend** — `startQuitPlan` / `saveAnswer` / `finalizeQuitPlan`, so plans persist, tokens exist, dashboard activates. No new engine.
4. **Complete the assessment** — full FTND, product inventory, age, sex/pregnancy, quit history, previous treatment, with the §D branching.
5. **Safety layer** — medical and medication screens, cardiac ladder, six gates, adolescent and pregnancy variants.
6. **Treatment-selection engine** — eligibility → safety → jurisdiction filter → candidates → preference → confirmation, with the versioned label content table. No app-computed doses.
7. **Lifetime plan generator** — all §H sections, IF→THEN structure, four rescue protocols, single `plan_json`.
8. **Delivery** — on-screen, PDF, download, verified email with retry, dashboard, all from `plan_json`.
9. **Governance** — consent model, de-identified research projection, `evidence_sources` (S01–S27) and `rule_versions` seeded, evidence IDs preserved in output, clinical sign-off gate from Part C.10.

---

## Final counts (item 14, recalculated and internally consistent)

**Current implementation**
- Assessment prompts currently in `/quit-chat`: **13**
- Of which scored dependence items: **4** (of the 6 required by FTND)
- KEEP UNCHANGED: **2** (Q1 name, Q12 supporter)
- MODIFY: **11**
- REMOVE (questions): **0**
- 2 + 11 + 0 = **13** ✔

**Target assessment**
- Total questions in the full table (§C): **43**
- Required: **19** — name, country, city, age, sex, products, dep-consent, prev-attempt, conditions, meds-any, readiness, strategy, treatment-pref, triggers, top-trigger, supporter, email, consent-email, consent-research
- Conditional: **24**
- 19 + 24 = **43** ✔
- Carried over from the current flow: **13** (2 unchanged + 11 modified)
- Net new questions: **30**
- 13 + 30 = **43** ✔

**Clinical**
- Safety gate levels: **6**
- Distinct gate trigger conditions: **21**
- Cardiac states distinguished: **3**
- Plan variants produced by one engine: **8**
- Dependence instruments implemented: **1** (FTND)
- Instruments flagged as proposed, requiring separate validation: **4** (PS-ECDI, LWDS-11, HONC, adapted pouch screen)
- Pharmacotherapy conflicts identified across Parts A–E: **15**, plus **1** verified non-conflict
- Jurisdiction-bound content categories: **11**
- Missing major cessation domains: **13**

**Build surface**
- Existing components requiring removal: **3**
- Existing components requiring modification: **5** (`quit-chat.tsx`, `PrintableQuitPlan.tsx`, `quit-plan-builder.ts`, `quit-plan-pdf.tsx`, `quit-plan.functions.ts`)
- New components required: **11** (jurisdiction profile service, safety screen, interaction screen, quit-history module, treatment-selection engine, label content table, lifetime plan generator, rescue-protocol engine, consent module, evidence/rule registry, plan-variant renderer)

---

## Unresolved clinical questions (must be answered before the relevant phase ships)

1. Which jurisdictions Aqla will formally support at launch (SA only, SA + UK, or wider) — this sizes the jurisdiction profile table.
2. Saudi cessation-specific registration status of **bupropion** (Conflict row 2 — unresolved).
3. Saudi availability/approval of **cytisine / cytisinicline** (Conflict row 1 — unresolved).
4. Saudi-registered short-acting NRT forms and strengths — the Matrix confirms the patch only.
5. Current Saudi and UK **label** text for varenicline dosing, renal adjustment and duration.
6. Whether the Saudi referral channel is **Sehhaty**, 937, or both, and the current verified clinic count (the module's "260+" is 2023 data).
7. UK service-routing details and the NICE sources needed to back a UK profile — absent from Part E.
8. Aqla's per-jurisdiction position on nicotine **e-cigarettes** (Cochrane vs NICE vs WHO), to be recorded as data in `jurisdiction_profiles`, not decided in code.
9. Whether Aqla will offer **NRT in pregnancy** within the app pathway, or route entirely to a clinician while keeping the behavioural plan.
10. Minimum age for app self-service versus mandatory clinician handoff, per jurisdiction.
11. Whether **preloading** (Part D) will be offered at all, and if so under which clinician gate.
12. Legal and ethical basis, and consent wording, for any research/admin copy of identifiable health data, per jurisdiction (PDPL / UK GDPR differ).
13. Whether any medication candidate may be shown without prior clinician confirmation, or whether every medication mention requires it.
14. Clinical back-translation sign-off for Arabic Parts C.3, C.4, C.6 (release gate stated by the module itself).

---

**READY FOR CLINICAL ARCHITECTURE APPROVAL: NO**

Every architecture item requested (1–18) is now fully specified: jurisdiction-first capture and confirmation, jurisdiction-bound services/medications/emergency numbers, the three-way cardiac ladder, readiness as a discussion rather than an assignment, a retained but output-limiting dependence skip, no invented instruments, poly-use as a complexity flag only, pregnancy as a real pathway, jurisdiction-specific e-cigarette handling, confirmed review of Parts D and E, the complete 43-question table, the complete branching flow, reconciled and internally consistent counts, reuse of the existing quit-plan backend, and the single-source-of-truth `plan_json` architecture. No code, UI, database or content was changed.

The answer is **NO** for one reason only: **14 clinical questions above remain unresolved**, and 6 of them (items 2–7) determine what medication and service content may lawfully and safely be displayed. The architecture is complete; the clinical inputs it depends on are not yet confirmed. Approval should follow those confirmations, or should explicitly scope phase 1 to the jurisdiction-neutral, behavioural-only work (phases 1–4), which does not depend on any of them.
