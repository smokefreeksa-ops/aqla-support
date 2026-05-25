// Aqla Personal Quit Engine — domain types.
export type ProductType =
  | "cigarettes"
  | "shisha"
  | "vape"
  | "heated_tobacco"
  | "pouches"
  | "smokeless"
  | "multiple"
  | "relapse_prevention";

export type FirstUseAfterWaking =
  | "lt_5"
  | "6_30"
  | "31_60"
  | "gt_60"
  | "not_daily";

export type TriggerKey =
  | "coffee"
  | "car"
  | "after_meal"
  | "social"
  | "shisha_session"
  | "stress"
  | "anxiety"
  | "boredom"
  | "before_sleep"
  | "study_work"
  | "phone_games"
  | "weekend"
  | "routine_prayer"
  | "arabic_coffee_majlis";

export type SafetyFlag =
  | "pregnancy"
  | "under_18"
  | "cardiac"
  | "respiratory"
  | "medications"
  | "mental_health"
  | "suicidal_ideation"
  | "seizures"
  | "high_mixed_use"
  | "repeated_failure"
  | "none";

export type ReadinessCategory =
  | "ready_now"
  | "wants_but_low_confidence"
  | "low_importance_high_confidence"
  | "not_ready";

export type DependenceCategory =
  | "low_ritual"
  | "moderate"
  | "high"
  | "complex_mixed";

export interface EngineAnswers {
  email?: string;
  user_name?: string;
  support_person_name?: string;
  product_types: ProductType[];
  primary_product?: ProductType;
  mixed_use: boolean;
  relapse_prevention_mode: boolean;
  first_use_after_waking?: FirstUseAfterWaking;
  cigarettes_per_day?: string;
  shisha_sessions_per_week?: string;
  shisha_session_duration?: string;
  vape_pattern?: string;
  nicotine_pouch_frequency?: string;
  triggers: TriggerKey[];
  importance_score: number;
  confidence_score: number;
  readiness_score: number;
  previous_quit_attempts?: string;
  longest_abstinence?: string;
  relapse_causes: string[];
  safety_flags: SafetyFlag[];
  personal_reasons: string[];
}

export interface PlanSection {
  title: string;
  steps: string[];
  craving_card?: string;
}

export interface EngineResult {
  result_title: string;
  human_explanation: string;
  pattern_labels: string[];
  primary_trigger_pattern: string;
  secondary_trigger_pattern?: string;
  dependence_category: DependenceCategory;
  dependence_text: string;
  hsi_score?: number;
  aqla_intensity_score: number;
  readiness_category: ReadinessCategory;
  readiness_text: string;
  first_24h_step: string;
  seven_day_plan: { day: number; task: string }[];
  seventy_two_hour_plan: string[];
  trigger_plans: PlanSection[];
  base_plan: PlanSection;
  craving_card: string;
  referral_needed: boolean;
  referral_message: string;
  safety_immediate?: string;
  personal_reasons: string[];
  support_message_template?: string;
  follow_up_schedule: { type: string; offset_days: number; label_ar: string }[];
  share_text: string;
}
