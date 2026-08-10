# Saudi Research Participant Outreach

## Goal
Create a secure admin workflow to import the user’s consented Saudi participant list from CSV/Excel, store contact details in Lovable Cloud, and send a REDCap study invitation by email and WhatsApp with delivery tracking.

## User experience
- Add an admin-only “Research participants” workspace.
- Upload CSV or Excel and preview the detected columns before importing.
- Validate Saudi mobile numbers and email addresses, normalize formats, detect duplicates, and show rejected rows with reasons.
- Require confirmation that the uploaded list has documented research-contact consent before import or sending.
- Allow selecting a saved REDCap invitation template in Arabic, English, or bilingual form.
- Support test sends to a small approved group before any larger release.
- Show campaign progress, sent/failed/suppressed status, provider errors, and exportable results.
- Include unsubscribe handling for email and opt-out handling for WhatsApp where supported.

## Sending approach
- Use Lovable’s built-in app-email infrastructure for individual, consented transactional messages, but not as a single 100,000-recipient bulk request.
- For the requested high-volume study invitation, connect a dedicated email campaign provider such as Brevo and use its controlled batch/rate-limited sending and suppression features.
- Connect Twilio or another approved WhatsApp Business provider for automated WhatsApp delivery. A normal WhatsApp click-to-chat link is not sufficient for sending to the participant list.
- Keep provider credentials server-side and never expose them in the browser.

## Safety and privacy
- Restrict participant data, imports, campaigns, phone numbers, and email addresses to verified admin/research staff roles.
- Store consent source, consent date, import batch, message version, and opt-out state for auditability.
- Do not send until duplicate, suppression, consent, and test-send checks pass.
- Never log full phone numbers, email addresses, or message content in browser logs.
- Keep import files private and delete temporary upload files after processing according to the project’s retention policy.

## Technical implementation
1. Add a research-participant import model with batch status, normalized contact fields, consent metadata, deduplication keys, and communication preferences.
2. Add private file upload and server-side CSV/XLSX parsing with strict size, row-count, column, type, and field-length limits.
3. Add authenticated admin/research server functions for preview, validation, import confirmation, campaign creation, test send, launch, pause, and reporting.
4. Add a durable, resumable send queue that processes recipients individually, applies rate limits, retries transient failures, and prevents duplicate sends with idempotency keys.
5. Add provider adapters for the selected email and WhatsApp connectors, with clear provider error reporting and delivery status synchronization where available.
6. Add bilingual invitation templates containing the REDCap link, study contact details, consent context, and unsubscribe/opt-out instructions.
7. Add an admin monitoring view with deduplicated delivery metrics and participant-level status search.
8. Verify the flow with a small test dataset, then a staged production batch before enabling the full list.

## Required setup before implementation
- Provide the CSV/Excel file for schema mapping and validation.
- Provide the REDCap study URL and the exact Arabic/English invitation copy.
- Connect the email campaign provider and WhatsApp Business provider through the secure connector flow.
- Confirm the approved sender email/domain, WhatsApp business number, daily sending window, and any ethics/IRB communication restrictions.

## Acceptance checks
- A malformed or duplicate row cannot enter the sendable audience.
- Only consented participants with an eligible channel are queued.
- A retry cannot send the same message twice.
- Admins can pause the campaign and see the exact reason for every failure or suppression.
- No participant contact data is visible to unauthenticated users or ordinary participants.
- The system is tested on a small staged audience before any large send.