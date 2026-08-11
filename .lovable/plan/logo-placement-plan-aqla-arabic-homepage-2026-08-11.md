# Logo Placement Plan — Aqla Arabic Homepage

## Recommendation

Place the new logo as a **prominent brand mark in the hero section**, centered above the main headline "أقلع عن التدخين". This is the first visual anchor visitors see and makes the page feel more branded and professional than text alone.

## What will change

1. **Hero section (`src/components/imported/HeroSection.tsx`)**
   - Add the new logo above the `TypewriterHeadline`.
   - Size: ~80–120 px, responsive (smaller on mobile).
   - Style: clean, no heavy border; subtle drop shadow or glow to lift it off the waving Saudi flag background.
   - Alt text: "شعار أقلع — Aqla Logo".

2. **Header (`src/components/SiteHeader.tsx`) — keep as-is**
   - The existing small logo + wordmark remains the functional navigation anchor.
   - No change required unless the new logo has a different aspect ratio that needs adjustment.

3. **Welcome gate (`src/components/AqlaWelcomeGate.tsx`) — optional**
   - Replace the current circular white-background logo container with the same clean logo treatment.
   - Keeps the login gate visually consistent with the homepage hero.

4. **Study invitation overlay (`src/components/StudyInvitationOverlay.tsx`) — optional**
   - Add a small logo mark at the top of the modal to reinforce brand trust before the research prompt.

## Out of scope

- No changes to footer logo (already present and appropriate at that scale).
- No changes to navigation structure or route behavior.

## Next step

Approve this plan and confirm whether you want the optional logo additions in the welcome gate and study overlay, or only the hero section.
