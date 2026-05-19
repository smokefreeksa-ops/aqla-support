
# Aqla V2 — Three-Pathway Rebuild

This is a large rebuild. To avoid leaving the app in a broken state, I'll ship it in **6 phases**, each one independently deployable and type-checked. I will NOT touch: assessment scoring, cohort logic, RLS, dashboard roles, research exports, follow-up logic, or chatbot safety rules.

## Phase 0 — Stabilize (do first, same turn)

- Confirm current build is green (resolve any lingering JSX/parser issues from prior turns).
- Verify the in-progress Share + Support-Invite flows still build and render.
- No new features in this phase.

## Phase 1 — Shell: Header, Footer, Homepage

- New sticky header with full Arabic/English nav (14 items + lang toggle, hamburger on mobile, sticky "ابدأ الآن" CTA on mobile).
- New 6-column professional footer (Aqla / Start / Pathways / Support / Privacy / Social) with WhatsApp `+966555096412`, IG, X, TikTok, and YouTube shown as "قناة اليوتيوب" only.
- New homepage:
  - Elegant hero (RTL-correct, text right / visual left, badge + headline + subtitle + 2 CTAs + 4 trust chips).
  - **Three large pathway cards only** (no agent grid on homepage).
  - Compact trust strip.
  - KPI/Impact section moved near the bottom, with the "started=0 but completed>0" bug fixed (show "غير متاح حاليًا" or coerce started ≥ completed).
- Remove "أقلع ليس موقعًا تقرأه فقط" and the repeated "مساعد ذكي" wording.
- Preserve existing routes; only the homepage layout changes.

## Phase 2 — Pathway routes + specialized chatbots

Three new routes, each hosting **one** specialized chatbot:

- `/quit-pathway` — مسار الإقلاع. Product-coded starter (cigarettes / vape / pouches / shisha / multi / unsure), one-question-at-a-time flow, links into existing assessment + plan + crash-coach + support-request + share-card generation.
- `/help-pathway` — مسار المساعدة. Relationship → tone → recipient name → custom message → generates WhatsApp/SMS + Aqla-branded support card via the existing `support-invite` infra. Phone never stored or shown publicly.
- `/challenge-pathway` — مسار التحديات والأوسمة. Quick challenge / knowledge / cities / poster / points / 28-day / training entries — wires into existing `/challenges`, `/poster-studio`, points and medals.

Chatbot is a shared `PathwayChat` component (single source of truth) with pathway-specific scripts, exam-mode lock, "change my answer" support, and safety guards (no doses, no diagnosis, emergency message).

## Phase 3 — Volunteer training + certificate

- New `/train` route with 7 modules (titles per spec) — content stored in `training_modules` + `training_questions`.
- Learning mode: instant feedback + explanations + points.
- Exam mode: locked, no hints, progress "سؤال X من Y", review screen, submit, then explanations.
- Pass = all modules done + scenarios + ≥80% on final. Retake on fail.
- Certificate generation:
  - Title: "شهادة إتمام تدريب متطوعي أقلع لدعم الإقلاع عن التدخين والنيكوتين".
  - Includes Aqla logo, name, score, date, certificate ID, QR, supervision line, full disclaimer.
  - Actions: Download PDF + PNG, share to X/LinkedIn/WhatsApp, copy verify link, email to user.
- Public verification: `/certificate/{code}` (reuses existing route, extended for training certs).

## Phase 4 — Database & server functions

Single migration to add (with RLS):
- `training_modules`, `training_questions`, `training_attempts`, `training_certificates`, `certificate_verifications`
- `agent_sessions`, `agent_events`, `agent_outputs`
- `point_transactions`, `medal_awards`
- Extend existing `share_cards` only if needed.

Server functions (`createServerFn`, behind existing auth middleware where appropriate):
- `startTrainingAttempt`, `submitTrainingAnswer`, `finalizeExam`, `issueCertificate`, `verifyCertificate`, `emailCertificate`, `logAgentEvent`.

Email via existing provider secret if present; otherwise log failure and surface the "تم الإصدار، لكن تعذر الإرسال" message.

## Phase 5 — Share routes + safety polish

- `/share/certificate/{id}`, `/share/support-invite/{id}`, `/share/challenge/{id}`, `/share/medal/{id}`, `/share/quit-plan/{id}` — all rendering Aqla logo + URL + QR, with OG image + Twitter card, `@SmokeOffKSA`, hashtags.
- Final safety pass: scrub any remaining medication-dose language, remove La-tatten visible branding, ensure no endorsement claims, add `/disclaimer` page with the medical disclaimer text.
- Type-check + smoke-test all new flows.

## What I'd like to confirm before starting

1. **Phase 0 first** — should I begin by verifying the current build is green and the existing Share + Support-Invite flows still work, before touching the homepage? (Strongly recommended.)
2. **Chatbot intelligence** — for the pathway chatbots, should I use **Lovable AI Gateway** (google/gemini-2.5-flash for cost, gpt-5-mini for harder turns) for the free-form conversation, with a scripted backbone for the deterministic steps (assessment routing, plan generation, exam mode)? This is the recommended default.
3. **Email** — do you already have an email provider configured (Lovable Emails / Brevo / Mailgun)? If not, I'll wire Lovable Emails in Phase 4.

Once you confirm, I'll start with **Phase 0 + Phase 1** in the next turn — that gives you a visibly upgraded, professional homepage with the three pathways landing on placeholder chat routes, then we layer Phases 2–5 on top without ever breaking the live site.
