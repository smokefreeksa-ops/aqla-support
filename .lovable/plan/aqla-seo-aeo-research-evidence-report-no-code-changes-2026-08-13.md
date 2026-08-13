# AQla — SEO/AEO Research & Evidence Report (no code changes)

This pass produces evidence and a prioritised roadmap. No route, copy, schema, or
metadata changes are made until you approve what gets built.

## Guardrails agreed

- Every external fact is verified from an authoritative source, with URL and date accessed.
- Anything unverified is marked **REQUIRES VERIFICATION** and is not proposed for publication.
- Dr Malik A. Althobiani / د. مالك عبدالملك الذبياني is treated as the professional entity
  associated with AQla; exact public designation (Founder / Director / other), credentials,
  affiliations and publications are only stated when confirmed from **primary institutional
  and scholarly sources first** — university staff pages, ORCID, PubMed, journal pages,
  official research-group pages. Aggregators (ResearchGate, Scholar profiles, directories,
  press) are corroboration only, never the sole basis for a published claim.
- Badael / DZRT: a documented research or collaboration relationship may be described only
  where evidence supports the exact wording. No sponsor, funder, commercial partner, clinical
  partner or endorsement language. No implied endorsement of any nicotine product.
- ZYN, VELO, Nordic Spirit and others are external entities for landscape/search analysis only.
- Medical accuracy outranks search opportunity. Marketing claims are never treated as evidence.
- **No new page is recommended on volume alone.** Every recommendation carries: the query set,
  volume and difficulty, the observed SERP (who ranks, page type, whether AI Overview / PAA /
  forum / video dominates), the inferred intent, and an explicit verdict on whether an existing
  AQla page can satisfy that intent better than a new URL. Default answer is improve, not create.
- **No application source file is modified in this phase.** The report is written to
  `docs/research/` (documentation only) and to `/mnt/documents` for download. Nothing under
  `src/`, `public/`, or config is touched.


## Phase 1 — Codebase truth pass (what AQla actually is)

Inventory of all 87 routes, split into: public/indexable, authenticated, functional-only,
and admin/system. For each public page, record its real purpose, current title, description,
canonical, hreflang, schema, H1 structure and whether the content is substantive or a stub.

Feature reality check: for each capability the site implies (quit plan engine, clinical plan,
craving/SOS support, voice scan, academy + certificates, dashboard, challenges, research
pathway, follow-up, reminders), classify as **LIVE / PARTIAL / IN DEVELOPMENT / RESEARCH /
FUTURE** based on the code, not on the copy. This is the guardrail that prevents SEO copy
promising things the product does not do.

Known items already visible and to be confirmed in this phase: the four `/articles/*` pages
are scaffolds with headings and no body content (thin-content risk); JSON-LD exists only on
`__root` and `/about`; hreflang alternates appear on the homepage only; the sitemap lists 25
URLs while many more public routes exist.

## Phase 2 — Search evidence (Saudi-first)

Semrush, Saudi Arabia database, Arabic and English:

- Arabic seed set: الإقلاع عن التدخين، كيف أترك التدخين، كيف أبطل التدخين، خطة الإقلاع،
  أعراض انسحاب النيكوتين ومدتها، الرغبة في التدخين، ماذا يحدث للجسم بعد ترك التدخين،
  ترك الفيب، ترك الشيشة، عيادة الإقلاع عن التدخين، علاج إدمان النيكوتين.
- Nicotine-pouch set: أكياس/أظرف النيكوتين، أضرارها، إدمانها، أعراض انسحابها،
  كيف أتركها، DZRT / دزرت، ZYN، VELO، plus quitting-intent variants.
- English set: quit smoking Saudi Arabia, Arabic quit smoking support, nicotine withdrawal
  symptoms, quit vaping, quit nicotine pouches, digital smoking cessation.

Per keyword: volume, difficulty, intent, SERP type, questions, who ranks. Volume-only terms
without Saudi relevance are dropped. Current AQla visibility is checked with a domain/page
analysis on aqla1.com, and (if available) Search Console evidence takes precedence over
estimates for what already ranks.

## Phase 3 — Ecosystem verification

- Saudi cessation services: MoH cessation programme and clinics, 937, Kafa/Naqa and any
  successor programmes, university and charity initiatives — verified for current status,
  official name, scope, and digital offering. Dead or renamed programmes are marked as such.
- Nicotine-pouch market: company ownership, Saudi availability and regulatory status for
  DZRT (Badael/PIF), ZYN, VELO, Nordic Spirit, verified from primary sources.
- International benchmarks: NHS stop-smoking pathway, Smokefree.gov, Stoptober, quitlines,
  Quit Sense, Smoke Free — principles only, no branding or copy reuse.

## Phase 4 — Report

Summarised in chat, written in full to `docs/research/seo-aeo-audit.md` and to
`/mnt/documents` for download. No application source file is touched.

1. Strongest defendable positioning, with the Arabic and English statements tested against
   verified capability rather than aspiration.
2. Top 5 genuine differentiators, each tagged LIVE/PARTIAL/IN DEVELOPMENT/RESEARCH/FUTURE.
3. Top 10 Arabic and top 10 English opportunities, with volume, difficulty and intent.
4. Top 20 user questions, each routed to: pillar section / dedicated page / FAQ / tool /
   existing page / DO NOT CREATE.
5. Topical-authority map across the 7 pillars, mapped onto existing routes.
6. Saudi competitor gap map and the internal capability matrix.
7. Nicotine-pouch ecosystem and search matrix, with a page-or-not verdict per brand.
8. Badael/DZRT and founder entity findings, each marked verified or REQUIRES VERIFICATION,
   with the primary source cited for every credential or affiliation claim.
9. Technical SEO problem list: metadata gaps, thin pages, sitemap gaps, hreflang coverage,
   canonical issues, missing schema, heading and alt-text issues, crawl and CWV risks —
   each with a fix, an effort estimate, and a P0/P1/P2/P3 priority.
10. 90-day plan, sequenced into what is safe to implement immediately versus what needs
    your sign-off (medical copy, URL changes, relationship or credential claims).

Every entry in items 3, 4, 5 and 7 that proposes new content uses one evidence block:

```text
Query set + volume + difficulty (SA database)
SERP observed: page types ranking, AI Overview / PAA presence, who owns the result
Intent: informational / navigational / support-seeking / product
Existing AQla page that could serve it: <route> — and why it does or does not
Verdict: IMPROVE <route>  |  NEW PAGE <url> (with the reason improvement is insufficient)
          |  FAQ / tool / section  |  DO NOT CREATE
```

## Technical notes

Read-only phase: file reads and searches, Semrush tools, web verification via the search
gateway, and an SEO scan of the live site. Writes are limited to `docs/research/` and
`/mnt/documents`.


## What comes next

You pick from the report which items get built. My recommendation for the first build wave
is the technical/entity layer (per-page metadata, hreflang, schema, sitemap completeness,
internal linking, noindex or completion for the article stubs), since it carries no medical
claim risk. Content pillars follow, with sources cited and your review before publication.
