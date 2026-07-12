/**
 * PRIVACY BOUNDARY:
 * Types in this file describe DERIVED numeric acoustic features only.
 * Raw microphone audio, audio blobs, and speech transcripts are NEVER
 * represented here and must never be persisted, transmitted, or returned
 * from the voice analysis module.
 */

export type SOSState =
  | "idle"
  | "permission"
  | "voice_capture"
  | "local_analysis"
  | "context_fusion"
  | "protocol_selected"
  | "protocol_delivery"
  | "post_craving_check"
  | "logging"
  | "complete"
  | "fallback";

export type ProtocolId = "calm" | "energy_discharge" | "safe_escape" | "reboot";

export type SelectionReason =
  | "acute_state_override"
  | "persona_fight"
  | "persona_flight"
  | "persona_freeze"
  | "high_neuroticism"
  | "historical_effectiveness"
  | "universal_fallback"
  | "default"
  | "second_loop_alt";

export interface AcousticState {
  rmsEnergy: number;
  zeroCrossingRate: number;
  rmsVariability: number;
  pitchStability?: number;
  pitchPerturbation?: number;
  spectralCentroid?: number;
  featureVariability: number;
  signalQuality: number; // 0..1
  currentStateScore: number; // 0..1
}

export interface AqlaPersona {
  neuroticism: number; // 0-100
  extraversion: number;
  openness: number;
  agreeableness: number;
  conscientiousness: number;
  chronotype: "morning" | "intermediate" | "evening";
  stressResponse: "fight" | "flight" | "freeze" | "mixed";
  preferredLanguage: "ar" | "en";
  culturalContext?: {
    prayerAnchorsEnabled: boolean;
    coffeeAnchorEnabled: boolean;
    majlisAnchorEnabled: boolean;
    ramadanMode?: boolean;
  };
  version?: string;
}

export interface ProtocolHistoryEntry {
  protocolId: ProtocolId;
  cravingDelta: number;
  at: number;
}

export interface SOSContext {
  acousticState?: AcousticState;
  persona?: AqlaPersona;
  localHour: number;
  dayOfWeek: number;
  currentCravingRating?: number;
  recentProtocolHistory: ProtocolHistoryEntry[];
  recentSOSCount24h: number;
  previousProtocolEffectiveness: Partial<Record<ProtocolId, number>>;
}

export interface ProtocolSelection {
  protocol: ProtocolId;
  reason: SelectionReason;
  confidence?: number;
}

export interface SOSSession {
  id: string;
  startedAt: string;
  completedAt?: string;
  cravingBefore: number;
  cravingAfter?: number;
  cravingDelta?: number;
  acousticFeatures?: AcousticState;
  protocolId: ProtocolId;
  selectionReason: SelectionReason;
  personaSnapshot?: AqlaPersona;
  protocolCompleted: boolean;
  signalQuality?: number;
  isSecondLoop?: boolean;
  firstProtocolId?: ProtocolId;
  triggerTag?: string;
}

export interface ProtocolStep {
  seconds: number;
  ar: string;
  en: string;
  visual:
    | "still_center"
    | "breath_orb"
    | "wave_reframe"
    | "grounding"
    | "action_command"
    | "countdown"
    | "large_tap_target"
    | "choice";
  countdown?: boolean;
  hapticOnStart?: boolean;
}

export interface ProtocolDefinition {
  id: ProtocolId;
  nameAr: string;
  nameEn: string;
  totalSeconds: number;
  steps: ProtocolStep[];
  accent: "calm" | "active" | "escape" | "reboot";
}
