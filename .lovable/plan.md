# First-screen click map + fix the English/Arabic switch

## What I found (verified in code)

The first thing a visitor sees is the full-screen study invitation overlay, plus the red banner above it.

### Study invitation overlay (`StudyInvitationOverlay.tsx`)

| Element | Current behaviour |
| --- | --- |
| "English" / "العربية" pill (top corner) | Flips an internal language state, but the invitation card itself is a **baked image** (`saudi-study-panel.png`) with Arabic text painted into it. So nothing visible changes except the pill's own label. This is the bug you saw. |
| "شارك في الدراسة" | Invisible hotspot over the image — opens the KAU REDCap survey in a new tab, then closes the overlay. |
| "تخطي" | Invisible hotspot — goes to the confirm step (stay / continue / go back). |
| Anywhere else on the dark background | Closes the overlay (browser Back behaviour). |
| Confirm step: "متابعة إلى الموقع" | Dismisses the overlay and enters the site. |
| Confirm step: "العودة للصفحة السابقة" | Browser back, two entries. |

### Red banner (`ResearchBanner.tsx`) — shown on every page

| Element | Goes to |
| --- | --- |
| شارك الآن في الدراسة | REDCap survey, new tab |
| ابدأ خطة الإقلاع السريعة مع د. مالك | Opens the quit-chat drawer in place (no navigation) |
| أنشئ بطاقة إنجازك | `/challenge-pathway` |
| ١٬٦١٤ زيارة | Not clickable (live counter) |

## What to change

1. **Make the language switch actually work on the first screen.** Stop showing the Arabic-only baked artwork when the language is English: render the existing text-based crystal-map panel (the one already used for the confirm step, with full AR/EN copy already written in the file) whenever `lang === "en"`. Arabic keeps the artwork exactly as it is today — nothing changes visually for Arabic visitors.
2. **Make the switch discoverable.** In the invite step the pill currently sits over the artwork with very low contrast (grey on mint, as in your screenshots). Give it a solid dark-green pill with white text so it reads as a real button on both variants.
3. **Fix the hotspot dependency.** Because the participate/skip hotspots are positioned in percentages over the image, they only exist in the artwork variant. The English text variant already has real labelled buttons, so both paths stay clickable.
4. **Deliver a full click map.** After the fix I'll give you a written list — every clickable element on the first screen and the header, with its exact destination path — so you can confirm nothing dead-ends.

## Open question worth flagging

"أنشئ بطاقة إنجازك" currently lands on `/challenge-pathway`, not the poster studio (`/poster-studio`). Say which one you want and I'll point it there.

## Technical notes

- Single file for the behaviour fix: `src/components/StudyInvitationOverlay.tsx` (branch the invite step on `lang`, reuse the existing `crystal-panel--map` layout and `COPY.en` strings already defined there).
- Minor style-only touch to the language pill classes; no changes to `styles.css` needed.
- No backend, routing, or content changes.
