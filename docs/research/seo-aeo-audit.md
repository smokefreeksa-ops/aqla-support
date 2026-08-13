# AQla — SEO / AEO / Search Authority & Competitive Intelligence Report

**Status:** Research and evidence only. **No application source file was modified in this phase.**
**Scope of writes:** this file (`docs/research/`) only.
**Search data:** Semrush, Saudi Arabia (`sa`) database, Arabic + English, accessed 13 Aug 2026.
**Search Console:** not connected to this project (`no_project_connection`), so all ranking data
below is Semrush estimate, not first-party. **Connecting Search Console is P0** — see §9.

---

## 0. How to read this report

Every content recommendation carries an evidence block in this exact shape. No page is
recommended on volume alone; where an existing route can absorb the intent, the verdict is
IMPROVE, not NEW PAGE.

```text
Query set + volume + difficulty (SA database)
SERP observed: who ranks, page type, dominant format
Intent
Existing AQla page that could serve it
Verdict: IMPROVE <route> | NEW PAGE <url> | FAQ / tool / section | DO NOT CREATE
```

Capability tags used throughout: **LIVE / PARTIAL / IN DEVELOPMENT / RESEARCH / FUTURE** —
assigned from the code, not from the marketing copy.

---

## 1. The single most important finding

In the Saudi SERP, **vape and nicotine-pouch retailers currently rank as the health authority
on nicotine harm.**

| Query | Vol/mo | KD | #1 result |
|---|---|---|---|
| اكياس نيكوتين | 2,400 | 30 | `gostvape.com` — a vape shop category page |
| اضرار النيكوتين | 880 | 22 | `vape-mazag.com` — a vape shop blog post |
| اضرار الفيب | 1,000 | 20 | an X/Twitter post |

The top 10 for **اكياس نيكوتين** contains: 4 vape retailers, Amazon.sa, an Instagram reel, a
snus-selling site, a YouTube video, and one medical dictionary entry. **There is no Saudi
clinical or academic authority anywhere on that page.**

At the same time, the person behind AQla is a **published primary author on nicotine pouches**:

- Al-Otaibi HM, **Althobiani MA**. *Nicotine pouches: a narrative review of the existing
  literature.* Front Public Health. 2025 Aug 26;13:1641308. DOI 10.3389/fpubh.2025.1641308
- *Patterns and characteristics of nicotine pouch use among adults with a history of cigarette
  smoking.* Front Public Health 14, 2026. DOI 10.3389/fpubh.2026.1806892 (author position
  REQUIRES VERIFICATION)

**That mismatch is the entire strategy.** AQla's defensible wedge is not "quit smoking" in
general — that SERP is already served by MoH, WHO, Mayo Arabic and hospital groups. It is
**Arabic, Saudi, clinically-authored, peer-review-backed content on nicotine pouches and
modern nicotine products**, a space where the only current answer is a shop trying to sell you
the product.

---

## 2. Codebase truth pass

**87 route files.** Public/indexable ≈ 45; authenticated ≈ 12 (`dashboard.*`, `academy`,
`certificates`); admin ≈ 4; functional/utility ≈ 26 (`share.*`, `try.*`, `modules.$slug`,
`unsubscribe`, `sitemap.xml`, OAuth consent).

### Metadata state

| Signal | Coverage | Verdict |
|---|---|---|
| `head()` present | 65 / 87 routes | 22 routes inherit `__root` only |
| `description` meta | ~46 routes | **19 public routes are title-only** |
| `canonical` | **13 routes** | ~32 public routes have no canonical |
| `hreflang` alternates | **8 routes** | AR↔EN pairs exist for far more |
| JSON-LD | **2 files** (`__root`, `about`) | No FAQPage, Article, HowTo, MedicalWebPage |
| `noindex` | `sos`, `dashboard` | correct |
| Sitemap | **25 URLs** hand-listed | ~20 indexable routes missing |

Title-only routes (no description, no canonical): `auth`, `faq`, `contact`, `privacy`, `terms`,
`cookies`, `medical-disclaimer`, `sharing-policy`, `certificates`, `craving-coach`,
`relapse-support`, `safety-guidance`, `when-to-seek-help`, `points-medals`,
`professional-library`, `updates`, `quit-plan.$planToken`, `admin.*`.

No-`head()` public routes: `academy`, `articles` (layout), `community-challenges`, `learn`,
`login`, `movement`, `quit-center`, `quit-plan`, `start`, `tools`, `unsubscribe`, `en`.

### Thin-content risk — confirmed, live, and in the sitemap

`articles.first-week` (35 lines), `articles.withdrawal` (35), `articles.shisha` (34),
`articles.nicotine-pouches` (34) all render `ArticleScaffold` with the literal body text:

> «هيكل المقال جاهز، والمحتوى قيد الكتابة.» *(The article structure is ready, content is being written.)*

All four are listed in `sitemap.xml` at priority 0.7 with full metadata and canonicals. They are
actively inviting Google to index four empty pages under a health topic. This is the report's
**single highest-priority technical fix**.

Also effectively empty: `learn.tsx` (7 lines), `tools.tsx` (7), `start.tsx` (9) — redirect or
index shells with no metadata.

### Capability reality check

| Capability | Route | Tag |
|---|---|---|
| Clinical quit-plan engine + versioned plan, Arabic PDF | `quit-chat`, `quit-plan.$planToken` | **LIVE** |
| Nicotine dependence assessment (6-item FTND) | `assessment` (1,191 lines) | **LIVE** |
| Craving / SOS support | `sos`, `craving-coach` (26 lines) | **PARTIAL** — engine live, content page thin |
| Academy modules + certification | `academy`, `modules.$slug`, `certificate.$code` | **LIVE** |
| Learner dashboard | `dashboard.*` | **LIVE** (noindex, correct) |
| Research participation pathway (REDCap) | banner + overlay | **RESEARCH** |
| Voice craving scan | `voice-craving-scan` | **IN DEVELOPMENT** |
| Challenges / city challenge / movement | `challenges`, `city-challenge`, `movement` | **PARTIAL** |
| Article library | `articles.*` | **FUTURE** — scaffolds only |
| Shop | `shop` | **FUTURE** |

**Guardrail:** no SEO copy may describe the article library, voice scan, or shop as available.

---

## 3. Search evidence — Arabic (SA database)

| Keyword | Vol/mo | KD | Note |
|---|---|---|---|
| اضرار التدخين | 5,400 | 25 | **homework intent** — see below |
| نيكوتين | 5,400 | 26 | mixed |
| الفيب | 4,400 | 13 | product/informational |
| مكافحة التدخين | 2,400 | 27 | institutional/programme |
| **اكياس نيكوتين** | **2,400** | **30** | **retailer-owned SERP — the gap** |
| شامبكس (Champix) | 1,900 | 16 | pharmacotherapy |
| الاقلاع عن التدخين | 1,300 | 20 | core head term |
| علكة النيكوتين | 1,300 | 22 | NRT, high ad competition |
| اقلاع | 1,300 | 25 | brand-adjacent, ambiguous |
| لصقات النيكوتين | 1,000 | 20 | NRT |
| اضرار الفيب | 1,000 | 20 | harm |
| اضرار النيكوتين | 880 | 22 | **retailer-owned SERP** |
| بوبروبيون | 880 | 20 | pharmacotherapy |
| ترك التدخين | 720 | 20 | core |
| اعراض انسحاب النيكوتين | 720 | 32 | **highest-value quitter intent** |
| اضرار الشيشة | 480 | 27 | shisha |
| طرق الاقلاع عن التدخين | 480 | 14 | core, very easy |
| علاج التدخين | 480 | 15 | treatment |
| فوائد ترك التدخين | 260 | 24 | timeline intent |
| برنامج مكافحة التدخين | 260 | 16 | programme |
| فارينيكلين | 210 | 23 | pharmacotherapy |
| عيادة الاقلاع عن التدخين | 110 | 19 | service-seeking |
| ترك الشيشة | 30 | 0 | low |

**Trap identified — do not chase اضرار التدخين (5,400/mo).** Its related-term cluster is
`بحث عن التدخين` (1,900), `تقرير عن التدخين` (1,600), `مقال عن التدخين` (1,600),
`موضوع عن التدخين` (720), `احد اهم اسباب التدخين` (880). This is **school-assignment intent**,
not quitter intent. It converts to nothing, and competing for it would dilute AQla's topical
signal away from cessation. **DO NOT CREATE a "أضرار التدخين" pillar.**

**Zero-volume ≠ zero value.** `كيف أترك التدخين`, `خطة الإقلاع عن التدخين`,
`ماذا يحدث للجسم بعد ترك التدخين`, `ما هي ادوية الاقلاع عن التدخين`,
`متى تتحسن الدورة الدموية بعد الاقلاع عن التدخين` all return 0/mo in Semrush yet are exactly
the phrasing quitters use and exactly what AI Overviews and assistants synthesise from. These
are **AEO targets, not SEO targets** — they justify FAQ/section coverage, never a standalone URL.

## 4. Search evidence — English

English demand in Saudi is negligible: `quit smoking` 210/mo at **KD 77**, `quit smoking app`
40/mo, and *every* other English cessation term tested returned no data in the `sa` database
(`nicotine pouches side effects`, `how to quit nicotine pouches`, `quit vaping`,
`nicotine withdrawal timeline`, `smoking cessation saudi arabia`, `are nicotine pouches safe`).

**Verdict on `/en/*`:** keep as an accessibility and credibility surface (expat clinicians,
researchers, partners). Do **not** invest in English content pillars. Fix hreflang, canonicals
and descriptions; add nothing new. Any English effort should target a global database
(`us`/`uk`) only if AQla decides to pursue international research visibility — a separate
decision, out of scope here.

---

## 5. Opportunities, with SERP evidence and improve-vs-create verdicts

### O1 — Nicotine pouches, the clinical answer ★ highest value

```text
Queries: اكياس نيكوتين 2,400/mo KD30 · اضرار النيكوتين 880/mo KD22 · نيكوتين 5,400/mo KD26
SERP observed: gostvape.com (#1, shop category), alqalaavape.com (#2, product page),
  Instagram reel (#3), vape-mazag.com blog (#4, #10), Amazon.sa (#5), snusforsale (#6),
  ekleelvape (#7), YouTube (#8), altibbi (#9). Zero clinical/institutional results.
  For اضرار النيكوتين: vape-mazag.com ranks #1, above Mayo Clinic Arabic.
Intent: mixed product-curiosity + genuine harm/safety concern. The harm-concerned user is
  currently being answered by the seller.
Existing AQla page: /articles/nicotine-pouches — exists, indexed, canonical set, and EMPTY.
Verdict: IMPROVE /articles/nicotine-pouches. Do not create a new URL. The URL, metadata and
  canonical are already correct; only the body is missing. Fill it from the author's own
  peer-reviewed narrative review (Front Public Health 2025;13:1641308) with citations,
  MedicalWebPage + Article schema, and a reviewer byline.
```

This is the rare case where AQla can be *the* primary source rather than a summariser.

### O2 — Nicotine withdrawal symptoms and timeline

```text
Queries: اعراض انسحاب النيكوتين 720/mo KD32 · اعراض الانسحابية للتدخين 720/mo ·
  ماذا يحدث للجسم بعد ترك التدخين (0/mo, AEO) · فوائد ترك التدخين 260/mo KD24 ·
  متى تتحسن الدورة الدموية بعد الاقلاع (0/mo, AEO)
SERP observed: webteb (#1), delta-medlab (#2), JHAH (#3, Saudi hospital), Saudi German
  Health (#4), altibbi (#5), thebalance.clinic (#6), Facebook video (#7), Arabic Wikipedia
  (#8), Mayo Arabic (#9), esaal (#10). Content-farm and hospital-blog dominated; no
  interactive or personalised answer anywhere.
Intent: acute, in-the-moment support-seeking. Highest conversion intent on the whole list.
Existing AQla page: /articles/withdrawal — exists, indexed, EMPTY.
Verdict: IMPROVE /articles/withdrawal. AQla's differentiator over ten static blogs is that it
  can end the page in a live 11-section timeline and the FTND assessment — an answer no
  competitor on this SERP can match. Add HowTo/FAQPage schema for the timeline steps.
  DO NOT create a separate "فوائد ترك التدخين" page: same body-recovery timeline, same page.
```

### O3 — First week after quitting

```text
Queries: طرق الاقلاع عن التدخين 480/mo KD14 · كيف اترك التدخين (0/mo, AEO) ·
  خطة الاقلاع عن التدخين (0/mo, AEO) · كيف يمكن الاقلاع عن التدخين 30/mo
SERP observed (الاقلاع عن التدخين, KD20): Mayo Arabic (#1), MoH tcp.aspx (#2), Fakeeh
  Care blog (#3), Masar Medical (#4), WHO Arabic (#5), St Jude Arabic (#6), YouTube (#7),
  MoH awareness (#8), Magrabi (#9), Cleveland Clinic Abu Dhabi (#10).
  Institutional + hospital-blog. Nothing Saudi-specific and personalised.
Intent: planning / how-to.
Existing AQla page: /articles/first-week — exists, indexed, EMPTY. Also /quit-pathway (114
  lines) and /quit-chat (live plan engine) already serve the "give me a plan" intent better
  than any article can.
Verdict: IMPROVE /articles/first-week as the informational entry point, whose job is to hand
  off to /quit-chat. DO NOT create a separate "خطة الإقلاع" page — /quit-chat is the plan,
  and a second URL would compete with it.
```

### O4 — Pharmacotherapy cluster

```text
Queries: شامبكس 1,900/mo KD16 · بوبروبيون 880/mo KD20 · علكة النيكوتين 1,300/mo KD22
  (competition 0.99) · لصقات النيكوتين 1,000/mo KD20 (competition 1.00) ·
  فارينيكلين 210/mo KD23 · ما هي ادوية الاقلاع عن التدخين (0/mo, AEO)
SERP observed: not individually pulled; the near-1.00 ad competition on NRT terms means these
  SERPs are commercially contested by pharmacies and e-commerce.
Intent: split — some clinical information-seeking, much of it purchase intent.
Existing AQla page: /professional-library (66 lines), /safety-guidance (26 lines),
  and the plan engine's pharmacotherapy logic.
Verdict: IMPROVE /professional-library into a properly cited, clinician-facing
  pharmacotherapy reference. DO NOT create consumer-facing pages per drug. AQla explicitly
  does not prescribe (stated in /faq and /medical-disclaimer); ranking a consumer page for
  «شامبكس» invites medication questions the platform must not answer, and the purchase-intent
  share of that traffic is worthless to a non-commercial platform. Accepting lower traffic
  here is the correct trade.
```

### O5 — Vaping harm

```text
Queries: الفيب 4,400/mo KD13 · اضرار الفيب 1,000/mo KD20
SERP observed: an X/Twitter post ranks #1; then dalilimedical, thebalance.clinic,
  pha.gov.sa (Saudi Public Health Authority), elanaden, Instagram reel, Masar, altibbi,
  Mayo Arabic, YouTube. Notably weak and socially-dominated for a health query.
Intent: harm-curiosity, skewing young.
Existing AQla page: none. /articles/shisha covers shisha, not vaping.
Verdict: NEW PAGE /articles/vaping — justified, but P2 not P0. Justification for a new URL
  rather than improvement: no existing route addresses vaping at all, the audience (youth,
  vape-first never-smokers) is distinct from the cigarette audience, and the clinical framing
  differs. Ship only AFTER O1–O3 are filled; adding a fifth article while four are empty
  worsens the thin-content signal.
```

### O6 — Service and programme discovery

```text
Queries: عيادة الاقلاع عن التدخين 110/mo KD19 · برنامج مكافحة التدخين 260/mo KD16 ·
  مكافحة التدخين 2,400/mo KD27 · 937 6,600/mo KD24
SERP observed (الاقلاع عن التدخين): MoH owns positions #2 and #8 with its own programme pages.
Intent: navigational toward an official service.
Existing AQla page: /quit-center, /help-pathway, /request-support.
Verdict: DO NOT CREATE. This intent belongs to MoH and AQla should not attempt to intercept it —
  competing with the national health service on its own service queries is both unwinnable and
  ethically wrong for a public-health platform. IMPROVE /help-pathway to *link out* to MoH 937
  and the cessation-clinic pathway. Being the site that routes users correctly is an E-E-A-T
  asset. Also: never target «937» — that is a life-safety navigational query.
```

### O7 — DZRT / brand queries ★ handle with care

```text
Queries: DZRT 201,000/mo KD23 · دزرت 110,000/mo KD23 · VELO 9,900/mo KD26 · ZYN 1,900/mo KD59
SERP observed (DZRT): dzrt.com owns #1, #5, #6; badaelcompany.com #2; then ananinja pharmacy,
  noon.com, dzrt.sa, ekleelvape blog, Instagram reel, Tamimi Markets. 100% brand-owned or
  retail. No informational slot exists.
Intent: overwhelmingly navigational and transactional — people looking to buy or to reach the
  brand. Not an information-seeking audience.
Existing AQla page: /articles/nicotine-pouches (category-level).
Verdict: DO NOT CREATE brand pages for DZRT, ZYN, VELO or any product. Three reasons:
  (1) the intent is transactional — AQla would attract shoppers, not quitters;
  (2) brand-name pages on a cessation platform read as product association, which is a direct
      conflict with the founder's role as an independent researcher on these products;
  (3) the SERP has no informational slot to win.
  The 200k volume is a mirage. Capture the *quitting* tail instead —
  «كيف أترك أكياس النيكوتين», «أعراض انسحاب أكياس النيكوتين» — as sections inside
  /articles/nicotine-pouches. These returned no Semrush volume in `sa`, which reflects a
  young product category, not absent demand; treat them as AEO/early-mover coverage.
```

---

## 6. Top 20 user questions → routing

| # | Question (AR) | Route to |
|---|---|---|
| 1 | ما هي أعراض انسحاب النيكوتين ومتى تنتهي؟ | IMPROVE `/articles/withdrawal` + FAQPage schema |
| 2 | ماذا يحدث للجسم بعد ترك التدخين؟ | Section in `/articles/withdrawal` (timeline) |
| 3 | كيف أترك التدخين؟ | `/quit-chat` — tool, not page |
| 4 | كيف أعرف مستوى إدماني؟ | `/assessment` — LIVE FTND, add schema |
| 5 | هل أكياس النيكوتين آمنة؟ | IMPROVE `/articles/nicotine-pouches` |
| 6 | ما أضرار أكياس النيكوتين؟ | Same page, dedicated H2 |
| 7 | كيف أترك أكياس النيكوتين؟ | Same page, dedicated H2 + link to `/quit-chat` |
| 8 | ما هي أدوية الإقلاع عن التدخين؟ | `/professional-library` + `/faq` one-liner; **no consumer page** |
| 9 | هل الفيب أقل ضررًا؟ | NEW `/articles/vaping` (P2) |
| 10 | ما أضرار الشيشة؟ | IMPROVE `/articles/shisha` |
| 11 | كم أوفّر إذا تركت التدخين؟ | Existing money-counter tool — expose it, no new URL |
| 12 | ماذا أفعل عند نوبة الرغبة؟ | `/sos` (noindex) + IMPROVE `/craving-coach` (26 lines) |
| 13 | انتكست، ماذا أفعل؟ | IMPROVE `/relapse-support` (26 lines) |
| 14 | متى أراجع الطبيب؟ | IMPROVE `/when-to-seek-help` (28 lines) |
| 15 | أين عيادات الإقلاع في السعودية؟ | `/help-pathway` → link out to MoH |
| 16 | هل أقلع مجاني؟ | `/faq` — **add FAQPage schema** |
| 17 | هل أقلع يعطي وصفة طبية؟ | `/faq` + `/medical-disclaimer` |
| 18 | كيف أساعد شخصًا على الإقلاع؟ | Section on `/help-pathway` |
| 19 | كيف أشارك في دراسة أقلع؟ | Existing research banner / overlay |
| 20 | من يقف خلف أقلع؟ | IMPROVE `/about` — see §8 |

Note that **13 of 20 route to an existing page**. AQla's problem is not missing URLs. It is
empty and unschema'd existing URLs.

---

## 7. Topical authority map

| Pillar | Owner route | State |
|---|---|---|
| 1. Nicotine dependence & assessment | `/assessment` | LIVE, needs schema |
| 2. Quitting plan & pathway | `/quit-chat`, `/quit-pathway` | LIVE, needs metadata |
| 3. Withdrawal & recovery timeline | `/articles/withdrawal` | **EMPTY — P0** |
| 4. Modern nicotine products (pouches) | `/articles/nicotine-pouches` | **EMPTY — P0, highest value** |
| 5. Traditional products (shisha, vaping) | `/articles/shisha`, new `/articles/vaping` | EMPTY / absent |
| 6. Relapse, cravings & safety | `/craving-coach`, `/relapse-support`, `/when-to-seek-help`, `/safety-guidance` | all ~26 lines, thin |
| 7. Professional & research | `/professional-library`, `/about`, `/la-tatten` | partial |

---

## 8. Entity, founder and ecosystem verification

Primary institutional and scholarly sources were prioritised; aggregators are marked and are
corroboration only.

### Confirmed from PRIMARY sources — safe to publish

| Fact | Primary source |
|---|---|
| **PhD, UCL, 2024** — thesis *Home Monitoring in Interstitial Lung Disease* | UCL Discovery `discovery.ucl.ac.uk/id/eprint/10196667/` |
| **Honorary Lecturer, Division of Medicine, UCL** | UCL Profiles `profiles.ucl.ac.uk/78848-malik-a-althobiani` |
| **ORCID 0000-0002-2230-5708** | shown on the UCL staff profile |
| **Author, nicotine-pouch narrative review**, Front Public Health 2025;13:1641308 | PMC12417499 / DOI 10.3389/fpubh.2025.1641308 |
| Peer-reviewed body of work in respiratory medicine, remote monitoring and digital health (PMIDs 34969772, 32348262; JMIR Form Res 2023;7:e51507; PLOS Digit Health 10.1371/journal.pdig.0000318) | PubMed / PMC / publisher pages |
| **Badael Company is a PIF-established company** founded to reduce smoking prevalence in KSA | PIF portfolio page + PIF press release, 25 May 2023 |
| **DZRT is Badael's nicotine-pouch brand** | badaelcompany.com (corporate primary) |
| **MoH 937 service is live** | `moh.gov.sa/937/` |
| **MoH anti-smoking educational programme is live** | `moh.gov.sa/healthawareness/educationalcontent/anti-smoking/` |

### REQUIRES VERIFICATION — must not be published as stated

| Claim | Why |
|---|---|
| **Assistant Professor, Respiratory Therapy, King Abdulaziz University** | Strongly indicated by journal affiliation lines (primary scholarly) and the `malthobiani@kau.edu.sa` address, but **no standalone KAU faculty directory page was located**. Publish only after a KAU staff-page URL is supplied. Note KAU's official faculty name is *College of Medical Rehabilitation Sciences*, not *Applied Medical Sciences* — use the official name. |
| Authorship position on Front Public Health 2026;14:1806892 | Byline order not confirmed from the article page |
| Citation/h-index figures (15 papers, 730 citations, h-index 8) | Aggregator only (rankless.org). **Never publish these.** |
| Any **AQla-specific** public role or title | The verification pass found **no independent third-party source linking Dr Althobiani to aqla1.com**. This is expected for a new platform, but it means the site's own `/about` page is currently the *only* source of that association. Publish the association as a first-party statement ("أسّس منصة أقلع") — never as if externally corroborated. |
| «لا تتعن» / La-tatten founder attribution | Sourced only from la-tatten.com itself (self-published). Fine as a first-party claim on AQla; not citable as independent evidence. |
| **SFDA classification of nicotine pouches** | No official SFDA regulation or gazette notice located. Trade press describes the position as unclear/evolving. **Do not publish any statement about the legal status of nicotine pouches in KSA.** |
| MoH cessation-clinic network current operational status (2025/26) | Operation confirmed in peer-reviewed studies using 2019–2023 data; no current MoH directory located. If `/help-pathway` links out, link to the MoH anti-smoking page and 937, not to a clinic list. |
| MoH «#حاول_وبتوصل» initiative | SPA wire only, not MoH's own site; live status unconfirmed |
| A dedicated national quit-line or MoH cessation app | Not found. Do not claim one exists or that AQla fills its absence. |

### The Badael/DZRT relationship — recommended handling

Badael is a **PIF-established company whose stated purpose is reducing smoking prevalence**,
and it sells DZRT nicotine pouches. AQla's founder is an **independent published researcher on
nicotine pouches**. These two facts sit close together and will be read together.

Recommendation: **state neither a relationship nor a denial.** On `/about` and on
`/articles/nicotine-pouches`, publish a short, plain independence statement — that AQla receives
no funding from and has no commercial relationship with any nicotine or tobacco product company,
and that its content is grounded in peer-reviewed evidence. If a documented research
collaboration exists, it must be disclosed with the exact institutional wording and a
verifiable reference — and only then. No sponsor, funder, partner or endorsement language under
any circumstance. This is both an ethics requirement and, under Google's health E-E-A-T
signals, a ranking asset.

---

## 9. Technical SEO problem list

### P0 — do first, no medical-copy risk

| # | Problem | Fix | Effort |
|---|---|---|---|
| 1 | Four empty `/articles/*` pages are indexed and in the sitemap | Add `noindex` **and** remove from sitemap until each has real content. Reversible per page as content ships. | S |
| 2 | Search Console not connected | Connect and verify the property; submit the sitemap. Everything above is estimate until this exists. | S |
| 3 | No canonical on ~32 public routes | Add `canonical` to every public `head()` | M |
| 4 | 19 public routes are title-only | Add unique `description`, `og:title`, `og:description`, `og:type`, `twitter:card` | M |
| 5 | 12 public routes have no `head()` at all | Add one each | M |
| 6 | Sitemap is a hand-maintained 25-URL list, ~20 short | Generate from the route tree, excluding auth/admin/utility | M |

### P1

| # | Problem | Fix | Effort |
|---|---|---|---|
| 7 | `/faq` has no FAQPage schema | Add — the single biggest AEO win available today | S |
| 8 | No `MedicalWebPage` / `Article` / `HowTo` schema anywhere | Add per content page, with `author`, `reviewedBy`, `datePublished`, `citation` | M |
| 9 | `hreflang` on only 8 of the AR↔EN pairs | Complete the set; add `x-default` | S |
| 10 | `Organization`/`Person` schema in `__root`/`/about` not linked to verified identifiers | Add `sameAs` → ORCID, UCL profile, publication DOIs. Highest-leverage E-E-A-T change on the site. | S |
| 11 | `learn`, `tools`, `start` are 7–9-line shells with no metadata | Give them content or 301 them | S |

### P2

| # | Problem | Fix | Effort |
|---|---|---|---|
| 12 | `/craving-coach`, `/relapse-support`, `/safety-guidance`, `/when-to-seek-help` are ~26 lines each | Expand with cited clinical content | L |
| 13 | Weak internal linking from article pages into `/quit-chat` and `/assessment` | Add contextual links | S |
| 14 | Image `alt` coverage not audited (heavy hero/logo/artwork use) | Audit and fix | M |
| 15 | Core Web Vitals unmeasured; homepage carries a full-screen overlay, starfield canvas and large PNG artwork | Measure, then optimise LCP | M |
| 16 | Overlay/interstitial on first load is a Google intrusive-interstitial risk on mobile | Verify against the mobile guidelines | S |

### P3

`/en/*` metadata completion; `share.$type.$id` OG-image validation; breadcrumb schema;
per-article `og:image`.

---

## 10. 90-day plan

**Days 1–14 — safe, no sign-off needed.** P0 items 1–6. Deindex the four empty articles,
connect Search Console, complete canonicals/descriptions/`head()`, auto-generate the sitemap.
Net effect: stop the bleeding, start measuring.

**Days 15–30 — schema and entity.** P1 items 7–10. FAQPage on `/faq`; `Person` schema on
`/about` with `sameAs` → ORCID + UCL profile + the two nicotine-pouch DOIs; complete hreflang.
**Needs your sign-off:** the exact KAU title wording (blocked on a KAU staff-page URL) and the
independence statement.

**Days 31–60 — the wedge.** Write and ship `/articles/nicotine-pouches` (O1) and
`/articles/withdrawal` (O2), each with citations, reviewer byline, MedicalWebPage schema, and a
handoff into `/quit-chat` and `/assessment`. Remove their `noindex` on publish.
**Needs your sign-off:** all medical copy.

**Days 61–90 — depth.** `/articles/first-week` (O3); expand the four thin support pages (P2 #12);
`/professional-library` pharmacotherapy reference (O4); internal linking; CWV pass. Then
reassess `/articles/vaping` (O5) against real Search Console data rather than estimates.

**Explicitly not doing:** an «أضرار التدخين» pillar (homework intent); DZRT/ZYN/VELO brand
pages (transactional intent + conflict of interest); consumer pharmacotherapy pages
(prescribing risk); MoH service-query interception (unwinnable and inappropriate); an English
content programme (no measurable Saudi demand).

---

## 11. Recommended positioning

**Arabic:** «أقلع — منصة سعودية للإقلاع عن التدخين والنيكوتين، مبنية على الأدلة العلمية
المحكّمة، تقدّم خطة إقلاع شخصية وتقييمًا لمستوى الاعتماد على النيكوتين، مجانًا.»

**English:** *Aqla — a Saudi, evidence-based platform for quitting smoking and nicotine, with a
personalised quit plan and a validated dependence assessment. Free.*

Every element of that statement maps to a **LIVE** capability. Nothing in it promises the
article library, the voice scan, or the shop.

**Top 5 defensible differentiators**

1. Peer-review-authored coverage of nicotine pouches, from the researcher who published on them — **RESEARCH → LIVE once O1 ships**
2. A working personalised clinical quit-plan engine with a versioned, downloadable Arabic PDF — **LIVE**
3. Validated 6-item FTND dependence assessment in Arabic — **LIVE**
4. Certified academy with issued certificates — **LIVE**
5. Genuine RTL, Saudi-first design and language, not a translated foreign product — **LIVE**

No competitor on any SERP examined has more than one of these.
