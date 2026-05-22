# Aqla Core Product Fix — Quit Plan & Academy Certificate Flows

This is a large, multi-system build. Before I start editing 20+ files and creating database tables, I need to confirm scope and a few critical decisions so we don't waste cycles.

## What you're asking for (my understanding)

**Two end-to-end product flows must actually work**, not just look good:

1. **Quit Plan flow** (`/quit-pathway`) — chatbot-led intake → deterministic scoring (FTND/PSE/HONC/LWDS-11/oral-adapted) → personalized Arabic quit plan → PDF download → email to user → admin notification to `smokefreeksa@gmail.com` → schedulable reminders.

2. **Academy flow** (`/learn-train`) — chatbot-led training across 16 domains → practice scenarios → progress saved → final exam (code-scored, ≥80% to pass) → certificate (PDF + PNG) with QR verification → download/share/email.

Plus: fix navigation so quit-plan clicks never bounce to homepage; keep `/learn-train` strictly academy (no help-pathway content); clear medication safety rules (no doses, refer to pharmacist).

## Proposed implementation plan

### Phase 1 — Database & infrastructure
- Migration: `quit_plans`, `quit_plan_reminders`, `quit_plan_emails` tables (per your schema).
- Verify/extend academy tables (`academy_attempts`, `academy_certificates` already exist).
- pg_cron job to process `quit_plan_reminders` (calls a public server route).
- Storage bucket for generated PDFs (or generate on-demand).

### Phase 2 — Quit Plan flow
- New server functions in `src/lib/quit-plan.functions.ts`:
  - `startQuitPlanIntake`, `saveQuitPlanAnswer`, `finalizeQuitPlan` (runs scoring from `scoring.ts`, builds plan JSON, stores row).
  - `generateQuitPlanPdf` (server-side PDF using `@react-pdf/renderer` or HTML→PDF).
  - `emailQuitPlanToUser`, `notifyAdminQuitPlan`, `scheduleReminder`.
- New chatbot component `QuitPlanChat` (or extend `AqlaCenterChat`) that runs a **deterministic 16-step intake state machine** with AI used only for warm phrasing/explanations between steps — never for scoring or routing.
- New route `/quit-plan/$planId` to view/download generated plan.
- Update `/quit-pathway` to host the new flow; remove any redirect-to-home behavior.

### Phase 3 — Academy flow
- Content module `src/lib/academy-curriculum.ts` with the 16 domains, lessons, practice questions, scenarios, and exam bank.
- Server functions: `getAcademyProgress`, `submitLessonAnswer`, `startExam`, `submitExam` (uses `scoreExam()`), `issueCertificate` (only if ≥80%).
- Certificate generation: PDF + PNG with QR linking to `/verify/$code`, stored in storage bucket.
- New chatbot component `AcademyChat` that runs deterministic lesson progression + exam mode (no AI hints during exam).
- Update `/learn-train` to host only this; strip any help-pathway content if present.

### Phase 4 — Email & admin notifications
- Use existing transactional email infra (Lovable Emails).
- Templates: `quit-plan-user`, `quit-plan-admin`, `certificate-issued`, `reminder`.
- Clear fallback UI when email isn't configured ("تم إنشاء الخطة، لكن تعذر إرسال البريد…").

### Phase 5 — Safety & QA
- Hard-coded safety guards in chat handler: medication-dose questions → fixed pharmacist-referral reply; emergency keywords (ألم صدر, ضيق تنفس) → urgent-care reply. These bypass the AI.
- Manual QA walkthrough of both flows end-to-end before declaring done.

## Decisions I need from you before starting

This is ~2-3 days of focused work. To avoid building the wrong thing, I need answers to these — otherwise I'll have to make assumptions and you may reject the result.

**1. Email infrastructure.** The project has `EMAIL_FROM_ADDRESS` and `EMAIL_PROVIDER_API_KEY` secrets but I need to confirm Lovable Emails is set up with a verified sending domain. Should I:
   - (a) Use the existing Lovable Emails setup (you confirm the domain is verified), or
   - (b) Set up email infrastructure from scratch as part of this work, or
   - (c) Ship without real email and only show "download PDF" + admin-mailto links for now?

**2. PDF generation strategy.** Server-side PDF in a Cloudflare Worker is constrained (no native libs). Options:
   - (a) `@react-pdf/renderer` (pure JS, works in Workers, basic styling),
   - (b) HTML + client-side `html2pdf.js`/`jsPDF` (richer styling, but generated in browser),
   - (c) External service (Browserless, etc. — needs new API key).
   I recommend **(a) for quit plans and certificates** — works server-side, emailable, no extra services. Confirm?

**3. WhatsApp reminders.** You said "do not promise automated WhatsApp unless configured." I'll implement: email reminders (real), WhatsApp = generates a `wa.me` link the user can tap themselves. OK?

**4. Scope of academy content.** Writing all 16 training domains with lessons + scenarios + exam questions is a lot of Arabic content. Should I:
   - (a) Write full curriculum content for all 16 domains now (large delivery, ~1 week of writing alone), or
   - (b) Build the **engine** (progression, scoring, certificate) with 3-4 domains fully written as a working vertical slice, and stub the rest with TODOs so you/an editor can fill in content later?
   I strongly recommend **(b)** — otherwise this PR is unreviewable and content quality will suffer.

**5. Existing `AqlaCenterChat`.** It currently delegates everything to the AI assistant via `chatWithAssistant`. The quit plan flow needs a **deterministic state machine** (collect name → email → city → product → … → score → plan), with AI used only for natural-sounding transitions. I'll build a new `QuitPlanChat` component rather than retrofitting the generic one. OK?

Please answer those 5 questions (even short answers — "a, a, yes, b, yes" works) and I'll start with the database migration and Phase 1 immediately.
