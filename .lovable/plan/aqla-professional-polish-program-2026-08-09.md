# Aqla Professional Polish Program

Six workstreams, delivered in phases so each one ships working rather than half-finished.

## Phase 1 — Loading, empty, success and error states

- Build a small set of branded state components: `AqlaSkeleton` (green shimmer on the site gradient), `EmptyState` (icon + bilingual message + primary action), `ErrorState` (friendly message + "أعد المحاولة" retry button wired to query refetch), and `InlineSpinner` for buttons.
- Replace blank waits and generic errors on: dashboard (overview, learning, paths, sessions, certificates, history), academy modules, assessment, certificates lookup, poster studio, challenges, quit engine.
- Every mutation gets a clear success confirmation (toast via sonner) and a failing state that says what to do next, never a raw error string.
- Route-level `pendingComponent` and `errorComponent` for each data route so navigation never shows a white gap.

## Phase 2 — Mobile usability pass

Review and fix at 390px width across: sign-up, study invitation overlay, dashboard, modules, assessment, certificates, poster studio, SOS.

- Kill horizontal scrolling (`min-w-0`, `truncate`, grid instead of bare flex-wrap in header rows).
- Fix clipped Arabic text and line-height on headings.
- Stack floating buttons (WhatsApp, assistant, SOS) in one managed bottom-right column with safe-area padding so they never overlap each other or content.
- Minimum 44x44 tap targets on all icon buttons; larger form fields and bottom-anchored primary actions on long forms.
- Verified with browser screenshots at phone width for each flow.

## Phase 3 — Accessibility and readability

- WCAG AA contrast re-check after Phase 1/2 changes.
- Visible keyboard focus ring on every interactive element using a design token.
- Semantic heading order, one `<main>` per page, `aria-label` on all icon-only buttons, labelled form fields.
- `prefers-reduced-motion` support: stars, galaxy canvas, cursor trail, and animated banners freeze gracefully.
- Dialogs/overlays use Radix primitives with proper titles and descriptions for screen readers.
- Text-size preference deferred until testing shows a need.

## Phase 4 — Search and quick access

- Command palette (Cmd/Ctrl+K, plus a visible search button in the header and dashboard nav) built on the existing `command` component.
- Indexes the 7 modules, tools, FAQs, support pages and dashboard destinations, bilingual matching (Arabic + English).
- "إجراءات سريعة" quick-actions menu: continue learning, start assessment, download certificate, create poster, SOS, join the study.

## Phase 5 — Branded transactional email

Sender domain `notify.aqla1.com` is already verified, so setup is straightforward.

- Set up email infrastructure and scaffold app emails plus branded auth templates.
- Bilingual templates: welcome/sign-up confirmation, certificate issued (with verification link), live-session reminder, password reset and account changes, study-participation thank-you.
- Templates match the Saudi-green brand; each send is triggered by a specific user action, with an idempotency key so retries don't duplicate.

## Phase 6 — Analytics and conversion tracking

- Extend the existing `trackEvent` helper with a typed event list: page visit, study-banner click, sign-up start/complete, module start/complete, assessment start/complete, certificate download, poster created, SOS opened, session registered.
- Admin analytics view showing the funnel (visit → banner click → sign-up → module → assessment → certificate) rather than only a visitor counter.

## Phase 7 — AI enhancements, only where they help

- Bilingual guided help inside the command palette ("كيف أحصل على شهادتي؟") answering from real site content.
- Personalised next-step suggestion on the dashboard based on module progress.
- Module summary ("لخّص لي هذه الوحدة") on module pages.
- Safety rails on the quit-support assistant: no medical dosing advice, escalation to emergency/quit-line contacts on risk language.

## Technical notes

- New shared components under `src/components/state/`; existing shadcn `skeleton`, `command`, `sonner` reused.
- Route `pendingComponent`/`errorComponent` added per TanStack Router conventions; retry uses `router.invalidate()` or query refetch.
- Analytics events go through the existing `recordEngagementEvent` server function — no new tracking vendor.
- Email uses Lovable Email infrastructure (queue + templates in `src/lib/email-templates/`), no third-party provider.
- AI uses the Lovable AI Gateway; no API keys required.

## Suggested order

Phases 1 and 2 first (largest perceived-quality jump), then 3, then 4, then 5, 6, 7. Each phase can be approved and shipped independently.
