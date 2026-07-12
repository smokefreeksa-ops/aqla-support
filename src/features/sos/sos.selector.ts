import {
  ACUTE_STATE_OVERRIDE_THRESHOLD,
  HIGH_NEUROTICISM_THRESHOLD,
} from "./sos.constants";
import type {
  ProtocolId,
  ProtocolSelection,
  SOSContext,
  SelectionReason,
} from "./sos.types";

/**
 * Deterministic, readable protocol selector.
 * Never expose selection.reason to the user — it is for logging and debug only.
 */
export function selectSOSProtocol(context: SOSContext): ProtocolSelection {
  const score = context.acousticState?.currentStateScore;
  const persona = context.persona;

  // Acute-state override always wins.
  if (typeof score === "number" && score >= ACUTE_STATE_OVERRIDE_THRESHOLD) {
    return {
      protocol: "calm",
      reason: "acute_state_override",
      confidence: 0.9,
    };
  }

  if (!persona) {
    return { protocol: "calm", reason: "universal_fallback", confidence: 0.4 };
  }

  let candidate: ProtocolId;
  let reason: SelectionReason;
  switch (persona.stressResponse) {
    case "fight":
      candidate = "energy_discharge";
      reason = "persona_fight";
      break;
    case "flight":
      candidate = "safe_escape";
      reason = "persona_flight";
      break;
    case "freeze":
      candidate = "reboot";
      reason = "persona_freeze";
      break;
    default:
      if (persona.neuroticism >= HIGH_NEUROTICISM_THRESHOLD) {
        candidate = "calm";
        reason = "high_neuroticism";
      } else {
        candidate = "calm";
        reason = "default";
      }
  }

  // Historical-effectiveness tie-break: if a different protocol has a strictly
  // greater average craving reduction (by > 1 point) than the persona pick,
  // prefer it and mark the reason accordingly.
  const eff = context.previousProtocolEffectiveness;
  const entries = Object.entries(eff) as [ProtocolId, number][];
  if (entries.length >= 2) {
    const best = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
    const candidateEff = eff[candidate] ?? 0;
    if (best[1] - candidateEff > 1) {
      return {
        protocol: best[0],
        reason: "historical_effectiveness",
        confidence: 0.7,
      };
    }
  }

  return { protocol: candidate, reason, confidence: 0.6 };
}
