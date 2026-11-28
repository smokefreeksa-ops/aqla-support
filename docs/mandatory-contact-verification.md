# Mandatory contact verification — 2026-11-28

## Verified
- Required notice, email and mobile are immediately after nickname and before jurisdiction.
- Empty/malformed email and mobile reject inline in Arabic; jurisdiction remains unavailable.
- `test@gmial.com` offers a correction; accepting it stores `test@gmail.com`.
- Arabic and Eastern Arabic digits normalize to canonical Saudi international form.
- A complete under-18 conversation asks all five guardian questions in order.
- Participant email remains stored; the guardian email is the queued recipient and the provider log reports sent.
- No-email completion retains PDF and WhatsApp buttons in chat and on the plan page.
- 390×844 RTL button bounds and document width passed; the guardian consent button wraps without clipping.
- Admin Contacts lists the real test records; nickname/email/mobile search and minors filtering passed.
- Actual CSV download starts with UTF-8 BOM and preserves Arabic; mobile cells have text prefixes, not formulas.
- Anonymous direct table and view reads denied; temporary admin grant removed after verification.
- 80 contact/clinical/safety regression tests passed. Existing WhatsApp/PDF-navigation/support-row browser regression passed.
- Original 176 rows, excluding added columns, retain checksum `e1065492b35e8819b174049a04244a1c` before and after.
- New records get a retention date exactly ten years after creation; old rows were not backfilled.

## Limits and review notes
- Browser verification is Chromium at phone dimensions, not a physical iPhone.
- CSV bytes/download were checked; Microsoft Excel itself was not available.
- Provider sent status and guardian recipient were verified; the guardian inbox was not inspected.
- No publish/deploy action was performed. The requested additive migration and access changes applied to the shared project database.
- The owner's account has physician, not admin, access. No existing role was changed.
- Test conversations created new clearly labelled test plans; no original plan was edited or deleted.
- The trigger records the retention deadline; this task does not introduce an automated deletion scheduler.