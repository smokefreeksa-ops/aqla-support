// Aqla Release 1 — clinical domain types (behavioural only).

export type Jurisdiction = "SA"| "GENERIC";

export type AgeBand = "under_18"| "18_24"| "25_39"| "40_59"| "60_plus";

export type ProductKey =
  | "cigarettes"| "vape"| "shisha"| "pouches"| "heated"| "other";

export type CardiacState = "none"| "stable"| "recent_event"| "active_symptoms";

export type MentalHealthState = "none"| "stable"| "unstable";

/** Six-level safety ladder. Ordered from lowest to highest. */
export type SafetyGateLevel =
  | "self_management"| "pharmacist"| "cessation_specialist"| "clinician"| "urgent"| "emergency";

export const SAFETY_LEVEL_ORDER: SafetyGateLevel[] = [
  "self_management", "pharmacist", "cessation_specialist", "clinician", "urgent", "emergency",
];

export type QuitStrategy =
  | "quit_now"| "future_date"| "reduce_to_quit"| "not_ready_yet";

export type DependenceStatus =
  | "ftnd_scored"| "ftnd_declined"| "descriptive_only";

export type PlanVariant =
  | "adult_standard"| "adolescent"| "pregnancy"| "emergency_hold";

export type EmailStatus =
  | "not_requested"| "consented_pending"| "sent"| "failed"| "provider_unavailable"| "disabled_minor";

/** Raw answers collected by the conversational runner. */
export interface ClinicalAnswers {
  jurisdiction?: Jurisdiction;
  country_code?: string;
  nickname?: string;
  city?: string;
  privacy_ack?: boolean;

  age_band?: AgeBand;
  sex?: "male"| "female"| "prefer_not";
  pregnancy?: "pregnant"| "breastfeeding"| "neither";

  products?: ProductKey[];

  // FTND — cigarette users only, optional.
  ftnd_opt_in?: boolean;
  ftnd_q1?: number;
  ftnd_q2?: number;
  ftnd_q3?: number;
  ftnd_q4?: number;
  ftnd_q5?: number;
  ftnd_q6?: number;

  // Descriptive-only use info for non-cigarette products.
  vape_pattern?: string;
  shisha_frequency?: string;
  pouch_frequency?: string;
  other_product_note?: string;

  // Safety
  red_flags?: string[];
  cardiac?: CardiacState;
  respiratory?: string;
  mental_health?: MentalHealthState;
  other_conditions?: string[];

  // Motivation
  readiness?: number;
  strategy?: QuitStrategy;
  quit_date?: string;

  triggers?: string[];
  past_attempts?: string;
  supporter?: string;

  money_opt_in?: boolean;
  weekly_spend?: number;

  plan_email_consent?: boolean;
  email?: string;
}

export interface PlanSection {
  id: string;
  title_ar: string;
  title_en: string;
  items: string[];
}

export interface LapsePathway {
  id: "one_puff"| "one_cigarette"| "one_day"| "regular_relapse";
  title_ar: string;
  title_en: string;
  trigger_ar: string;
  steps: string[];
}

export interface SafetyOutcome {
  level: SafetyGateLevel;
  flags: string[];
  /** Whether ordinary behavioural plan generation is suppressed (emergency only). */
  suppress_plan: boolean;
  message_ar: string;
  actions_ar: string[];
}

export interface ClinicalPlanJSON {
  schema_version: string;
  clinical_rule_version: string;
  plan_version: number;
  generated_at: string;

  jurisdiction: Jurisdiction;
  country_code: string | null;
  plan_variant: PlanVariant;
  dependence_status: DependenceStatus;
  quit_strategy: QuitStrategy;
  safety_gate_level: SafetyGateLevel;
  safety_flags: string[];

  medication_content_included: false;

  identity: { nickname: string; city: string | null };
  dependence: {
    instrument: "FTND" | null;
    total: number | null;
    band_ar: string | null;
    descriptive_notes: string[];
  };
  readiness: { score: number | null; text_ar: string };

  safety: SafetyOutcome;
  privacy_notice_version: string;

  timeline: PlanSection[];
  trigger_plan: PlanSection;
  craving_management: PlanSection;
  lapse_pathways: LapsePathway[];
  support: PlanSection;
  money: PlanSection | null;
  services: PlanSection;
  followup: { label_ar: string; offset_days: number }[];
  references: string[];
  disclaimer_ar: string;
}
