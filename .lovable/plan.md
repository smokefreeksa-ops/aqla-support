# Aqla Share System Overhaul

Goal: every public-facing card has the Aqla logo, share links produce rich previews on LinkedIn/X/WhatsApp/copy, and OG metadata works.

## 1. Database & storage (one migration)

- Create `public.share_cards` table (columns per spec: id, share_type, anonymous_session_id, title_ar/en, message_ar/en, cta_ar/en, image_url, target_url, safe_public_payload jsonb, created_at).
- RLS: public can `SELECT` all rows (rows by design contain only safe public payload — enforced at insert via server fn); public can `INSERT` via server-fn-only path with sanitization; admin can `UPDATE`/`DELETE`.
- Create public storage bucket `share-images` (public read). No public writes — uploads only via server function using service-role client.

## 2. Server functions (`src/lib/share.functions.ts`)

- `createShareCard({ share_type, title_*, message_*, cta_*, target_path, safe_public_payload, image_data_url? })`:
  - Sanitizes payload (strips any forbidden keys: phone, email, participant_code, doctor_review, cohort, clinical_*, raw_answers, health_*).
  - If `image_data_url` provided, decode base64 → upload to `share-images/{share_type}/{uuid}.png` via `supabaseAdmin` → public URL.
  - Inserts row; returns `{ id, share_url, image_url }`.
- `getShareCard({ id })`: returns sanitized public payload + image_url + target_url for the share page loader.

## 3. Public share route

- Single dynamic route `src/routes/share.$type.$id.tsx` (file: `share.$type.$id.tsx` → `/share/:type/:id`) handles all 12 share types via a `type` discriminator. Loader calls `getShareCard`. `head()` returns og:title, og:description, og:image (absolute via `getRequestOrigin`), og:url, og:type=website, twitter:card=summary_large_image, twitter:title/description/image.
- Page UI: Aqla logo (use `src/assets/aqla-logo.png` in white badge), generated card image (if present) else fallback Aqla card, message, CTA button linking to `target_url`, social share row (LinkedIn / X / WhatsApp / Copy), footer line in AR + EN.

## 4. Reusable share UI

- `src/components/ShareButtons.tsx`: takes `{ shareUrl, textAr, textEn, lang }`. Buttons:
  - LinkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`
  - X: `https://twitter.com/intent/tweet?text=${encoded(text + " " + url + " @SmokeOffKSA #أقلع #Aqla")}`
  - WhatsApp: `https://wa.me/?text=${encoded(text + "\n" + url)}`
  - Copy: writes text+url to clipboard, toast.
- `src/components/AqlaLogoBadge.tsx`: shared white-rounded-badge logo (fixes blank-placeholder rule everywhere).

## 5. Wire into existing flows (display-only changes — no scoring/cohort logic touched)

For each existing card/result surface, after the result is computed, call `createShareCard` once and show the new `ShareButtons` row using the returned `/share/{type}/{id}` URL. Replace any existing ad-hoc share buttons. Surfaces:

- Pledge (challenges tab) → `pledge`
- Quick-check results (challenges tools) → `quick-check`
- Breath/Cost/Trigger/Readiness challenges → respective types
- Knowledge quiz result (learn) → `knowledge`
- Medal earned → `medal`
- Poster Studio export → `poster` (use the html2canvas dataURL)
- City challenge card → `city`
- Aqla Passport stamp → `passport`
- Training certificate → `certificate`

For surfaces that already render their own card via html2canvas (Poster Studio, certificate), pass the captured dataURL to `createShareCard` so it becomes the og:image. For others, the share page renders a styled fallback card with the Aqla logo, message, and CTA — still passes OG checks.

## 6. Privacy sanitizer

Server-side allowlist for `safe_public_payload` keys per share_type. Reject keys: `phone`, `email`, `participant_code`, `cohort`, `doctor_review*`, `clinical_*`, `raw_*`, `answers`, `score_raw`. For quick-checks, only allow generic wording strings, never numeric raw scores.

## 7. Final checks

- type-check passes
- `/share/pledge/{id}` renders with Aqla logo and OG tags (verified via `view-source` / curl head)
- All share buttons open correct intents
- Fallback (no image_url) still shows Aqla logo card
- No private fields in any DB row by construction

## Out of scope (untouched)

assessment scoring, cohort assignment, RLS on participant/clinical tables, dashboard roles, research exports, chatbot, training certificate issuance logic, shop/NRT logic, analytics events.

## Technical notes

- Route file naming uses TanStack flat convention: `share.$type.$id.tsx`.
- `og:image` URL is the Supabase public storage URL (already absolute, CDN-cached, no auth) — satisfies LinkedIn requirements.
- Anonymous inserts: server fn uses `supabaseAdmin` (no auth required for public sharing), so RLS on `share_cards` can be restrictive (`SELECT` public, `INSERT/UPDATE/DELETE` admin-only).
- Logo embedding in generated PNGs already fixed in previous turn (html2canvas + crossOrigin + image-load wait); ShareButtons + share-page fallback ensures logo also appears when no PNG was generated.
