# Aqla SOS — Closed-Loop Craving Rescue Engine

Build one focused feature: a full-screen, voice-triggered, personality-adaptive SOS flow that interrupts a craving in under 60 seconds and adapts across sessions. No other Aqla pages are touched except to mount the global SOS button.

## Scope (single feature, self-contained)

**New route:** `/sos` — full-screen, no site header/footer, RTL Arabic-first.

**New global button:** persistent red circular "نجدة" button visible on authenticated pages (fixed bottom-inline, thumb-friendly, subtle pulse when idle only). Not on the pre-login landing.

**Everything else on the site stays as-is.**

## Feature loop (must actually work end-to-end)

1. Tap SOS → full-screen takeover, craving slider `قوة الرغبة الآن؟ 0–10` (~1 tap)
2. Request mic permission → 5s voice capture with live waveform + `5→4→3→2→1`
3. Local acoustic analysis via Web Audio `AnalyserNode` (no upload, no transcript)
4. Context fusion (score + persona + local hour + recent history)
5. Deterministic protocol selector → one of 4 protocols
6. 45–60s guided protocol (single dominant instruction per step, countdown, haptics)
7. Post-craving slider → delta computed
8. If `cravingAfter ≥ 7`: automatic **second rescue loop** with a different protocol
9. Completion screen: `انخفضت الرغبة من X إلى Y` + optional trigger tag + optional REDCap CTA
10. Session logged (derived features only, never audio)

## Four protocols (genuinely different, not four breathing exercises)

- **Calm** — stationary orb, guided exhale, wave reframe, grounding (60s) — for high acoustic score
- **Energy Discharge** — stand, fist clench, palm press, shoulder shake, exhale (45–60s) — fight
- **Safe Escape** — physical interruption: step away, put device out of reach, turn body, water (60s) — flight
- **Reboot** — one command at a time, tap a large circle, single breath, pick water-or-10-steps (45s) — freeze

Selector rule (transparent, deterministic):
`score ≥ 0.72 → Calm (acute override)` else by `persona.stressResponse` (fight/flight/freeze) else `neuroticism ≥ 70 → Calm` else `Calm (default)`. Historical effectiveness used as tie-breaker.

## Privacy boundary (hard rule enforced in code)

Raw microphone audio never leaves the browser tab, is never persisted, is never uploaded. Mic tracks stopped and audio nodes disconnected the moment analysis returns. Only derived numeric features + session outcome persist to the backend. Explicit `PRIVACY BOUNDARY` code comments in the voice module.

## Persistence

New backend table `sos_sessions` (Lovable Cloud, RLS scoped to `auth.uid()`), stores only derived features, protocol id, selection reason, craving before/after, completion status, timestamp, optional trigger, persona snapshot version. No audio columns. Reads own rows only.

## What ships

**New folder** `src/features/sos/`:
- `sos.types.ts`, `sos.constants.ts`, `sos.protocols.ts`, `sos.selector.ts`, `sos.scoring.ts`, `sos.storage.ts`
- `SOSEngine.ts` — central state machine (`idle | permission | voice_capture | local_analysis | context_fusion | protocol_selected | protocol_delivery | post_craving_check | logging | complete | fallback`)
- `hooks/useSOSMachine.ts`, `hooks/useVoiceAnalysis.ts`, `hooks/useHaptics.ts`
- `components/SOSButton.tsx`, `SOSScreen.tsx`, `VoiceCapture.tsx`, `AnalysisTransition.tsx`, `ProtocolDelivery.tsx`, `CravingRating.tsx`, `SOSComplete.tsx`

**New route** `src/routes/sos.tsx` (full-screen, no site chrome).

**Mount SOSButton** once inside the authenticated layout so it appears on all logged-in pages.

**Migration** creating `sos_sessions` with grants + RLS.

**Debug panel** behind `?sosDebug=1` (dev only): current state, signal quality, derived features, score, persona, selected protocol, reason, timings.

## Explicitly NOT in scope

- No changes to landing page, hero, existing tools, headers, footers, other routes.
- No new personality assessment inside SOS — reads existing persona if present, otherwise uses default protocol and continues.
- No location/GPS, no speech recognition, no transcription.
- No autonomous ML retraining — selector stays readable rules with historical tie-break.
- No native mobile.

## Acceptance criteria

Ten scenarios (A–J) from the spec — including mic-denied fallback, silent-input fallback, high-score → Calm override, persona-driven routing, second rescue loop trigger, completion delta screen, and network/DB inspection showing zero raw audio leaves the device.

## One thing to confirm

- **Persona source**: does the existing Aqla profile already expose `stressResponse`, big-five scores, and `chronotype`? If yes I'll wire to it; if no, I'll build a dev-only persona adapter with mock values (isolated behind a clearly marked file) so the loop works today, and expose a `TODO` seam for real persona wiring later.

If yes, ship exactly the above. Approve and I build.
