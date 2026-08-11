# Revert Study Invitation Overlay to Pre-Crystal Version

## Goal
Restore the `StudyInvitationOverlay` to the version before the diamond/crystal panel changes, keeping the Saudi flag wave background and the original dark translucent modal.

## What will change
1. `src/components/StudyInvitationOverlay.tsx`
   - Replace the deep-green environment + crystal panel with the original `<SaudiFlagWave />` full-screen background + dark radial scrim.
   - Restore the original rounded modal styling (`rounded-[28px]`, dark translucent background, white text, gold accents).
   - Remove all `.crystal-*`, `.study-environment`, and `.study-aura` class references.
   - Keep the current copy/content, logo, language switch, and behavior intact.

2. `src/styles.css`
   - Remove the entire "LUMINOUS CRYSTAL PANEL IN A DEEP SAUDI-GREEN ENVIRONMENT" block (tokens, `.study-environment`, `.study-aura`, `.crystal-shell`, `.crystal-backlight`, `.crystal-panel`, `.crystal-edge-light`, `.crystal-inner-highlight`, `.glass-frost`, `.glass-noise`).
   - Leave all other CSS untouched.

## What will NOT change
- The `ResearchBanner` content, links, or flashing behavior.
- The Saudi flag wave component itself (`SaudiFlagWave.tsx`).
- Any other page, route, or component outside the study overlay.

## Verification
After the revert, the homepage overlay should show:
- Waving Saudi flag background.
- Dark scrim keeping the modal readable.
- Original rounded dark-green modal with white title, gold eyebrow, and gold CTA button.

No build errors and no residual `.crystal-*` / `.study-*` CSS classes.
