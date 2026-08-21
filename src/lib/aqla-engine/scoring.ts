// Deterministic scoring for the Aqla Quit Engine. No AI involved.
import type {
  DependenceCategory,
  EngineAnswers,
  ReadinessCategory,
  TriggerKey,
} from "./types";

export function computeHSI(a: EngineAnswers): number | undefined {
  if (!a.product_types.includes("cigarettes")) return undefined;
  if (!a.cigarettes_per_day || a.cigarettes_per_day === "غير يومي") return undefined;
  let time = 0;
  switch (a.first_use_after_waking) {
    case "lt_5": time = 3; break;
    case "6_30": time = 2; break;
    case "31_60": time = 1; break;
    case "gt_60": time = 0; break;
    default: time = 0;
  }
  let cpd = 0;
  switch (a.cigarettes_per_day) {
    case "1–10": cpd = 0; break;
    case "11–20": cpd = 1; break;
    case "21–30": cpd = 2; break;
    case "أكثر من 30": cpd = 3; break;
  }
  return time + cpd;
}

export function computeAqlaIntensity(a: EngineAnswers): number {
  let s = 0;
  // first use within 30 min
  if (a.first_use_after_waking === "lt_5"|| a.first_use_after_waking === "6_30") s++;
  // daily use
  const daily =
    (a.cigarettes_per_day && a.cigarettes_per_day !== "غير يومي" && a.cigarettes_per_day !== undefined) ||
    a.shisha_sessions_per_week === "يوميًا أو شبه يومي" ||
    a.vape_pattern === "طوال اليوم تقريبًا" ||
    a.vape_pattern === "أول شيء بعد الاستيقاظ" ||
    a.nicotine_pouch_frequency === "4–8" ||
    a.nicotine_pouch_frequency === "أكثر من 8";
  if (daily) s++;
  // more than one product
  const realProducts = a.product_types.filter((p) => p !== "multiple"&& p !== "relapse_prevention");
  if (realProducts.length > 1 || a.mixed_use) s++;
  // strong craving (stress/anxiety triggers as proxy)
  if (a.triggers.includes("stress") || a.triggers.includes("anxiety")) s++;
  // use with stress/anger
  if (a.triggers.includes("stress")) s++;
  // use inside home/car despite wanting to stop (car trigger as proxy)
  if (a.triggers.includes("car") || a.triggers.includes("before_sleep")) s++;
  // failed attempt in last 12 months
  if (
    a.previous_quit_attempts &&
    a.previous_quit_attempts !== "لا" &&
    a.previous_quit_attempts !== "نعم، أكثر من 3 أشهر ثم عدت"
  ) s++;
  // all-day vape
  if (a.vape_pattern === "طوال اليوم تقريبًا"|| a.vape_pattern === "لا أعرف الكمية") s++;
  // unable to complete one day nicotine-free (longest_abstinence < day)
  if (
    a.previous_quit_attempts === "نعم، أقل من 24 ساعة" ||
    a.longest_abstinence === "نعم، أقل من 24 ساعة"
  ) s++;
  // withdrawal symptoms when stopping (relapse_causes contains craving/irritability)
  if (
    a.relapse_causes.includes("رغبة شديدة") ||
    a.relapse_causes.includes("عصبية أو توتر")
  ) s++;
  return Math.min(10, s);
}

export function classifyDependence(a: EngineAnswers, intensity: number): DependenceCategory {
  const realProducts = a.product_types.filter((p) => p !== "multiple"&& p !== "relapse_prevention");
  if (realProducts.length > 1 || a.mixed_use) return "complex_mixed";
  if (intensity >= 6) return "high";
  if (intensity >= 3) return "moderate";
  return "low_ritual";
}

export function classifyReadiness(a: EngineAnswers): ReadinessCategory {
  const i = a.importance_score;
  const c = a.confidence_score;
  const r = a.readiness_score;
  if (i >= 7 && c >= 7 && r >= 7) return "ready_now";
  if (i >= 7 && c < 7) return "wants_but_low_confidence";
  if (i < 7 && c >= 7) return "low_importance_high_confidence";
  return "not_ready";
}

export const TRIGGER_PATTERN_LABEL: Record<TriggerKey, string> = {
  coffee: "نمط القهوة",
  car: "نمط السيارة",
  after_meal: "نمط بعد الأكل",
  social: "نمط الأصدقاء والمجالس",
  shisha_session: "نمط الشيشة الاجتماعي",
  stress: "نمط التوتر والزعل",
  anxiety: "نمط التوتر والزعل",
  boredom: "نمط الملل والفراغ",
  before_sleep: "نمط الاعتماد الصباحي",
  study_work: "نمط الملل والفراغ",
  phone_games: "نمط الملل والفراغ",
  weekend: "نمط الأصدقاء والمجالس",
  routine_prayer: "نمط القهوة",
  arabic_coffee_majlis: "نمط الأصدقاء والمجالس",
};

export function topTriggerPatterns(a: EngineAnswers): string[] {
  const counts = new Map<string, number>();
  for (const t of a.triggers) {
    const label = TRIGGER_PATTERN_LABEL[t];
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((x, y) => y[1] - x[1])
    .map(([k]) => k);
}

export function requiresReferral(a: EngineAnswers): boolean {
  const refer: Array<typeof a.safety_flags[number]> = [
    "pregnancy", "under_18", "cardiac", "respiratory", "medications", "mental_health", "seizures",
  ];
  return a.safety_flags.some((f) => refer.includes(f));
}

export function hasSuicidalIdeation(a: EngineAnswers): boolean {
  return a.safety_flags.includes("suicidal_ideation");
}
