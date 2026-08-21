// Six-level safety ladder for Aqla Release 1.
//
// Key rule: "active symptom" is NEVER automatically an emergency.
// Only true emergency red flags reach the emergency gate, and 997 is only ever
// surfaced by the SA jurisdiction profile at that gate.

import { getJurisdictionProfile } from "./jurisdiction";
import type {
  ClinicalAnswers,
  Jurisdiction,
  SafetyGateLevel,
  SafetyOutcome,
} from "./types";
import { SAFETY_LEVEL_ORDER } from "./types";

export const EMERGENCY_RED_FLAGS = [
  "chest_pain_now",
  "severe_breathlessness",
  "coughing_blood",
  "loss_of_consciousness",
  "self_harm_risk",
] as const;

export const RED_FLAG_LABELS_AR: Record<string, string> = {
  chest_pain_now: "ألم في الصدر الآن",
  severe_breathlessness: "ضيق تنفس شديد",
  coughing_blood: "سعال مصحوب بدم",
  loss_of_consciousness: "فقدان وعي أو تدهور مفاجئ",
  self_harm_risk: "أفكار إيذاء النفس",
  none: "لا شيء مما سبق",
};

function highest(a: SafetyGateLevel, b: SafetyGateLevel): SafetyGateLevel {
  return SAFETY_LEVEL_ORDER.indexOf(a) >= SAFETY_LEVEL_ORDER.indexOf(b) ? a : b;
}

export function evaluateSafety(
  answers: ClinicalAnswers,
  jurisdiction: Jurisdiction,
): SafetyOutcome {
  const profile = getJurisdictionProfile(jurisdiction);
  const flags: string[] = [];
  let level: SafetyGateLevel = "self_management";

  const redFlags = (answers.red_flags ?? []).filter(
    (f) => f !== "none" && (EMERGENCY_RED_FLAGS as readonly string[]).includes(f),
  );

  // ---- Emergency gate (the ONLY gate that suppresses plan generation) ----
  if (redFlags.length > 0) {
    flags.push(...redFlags.map((f) => `red_flag:${f}`));
    return {
      level: "emergency",
      flags,
      suppress_plan: true,
      message_ar: profile.emergency_ar,
      actions_ar: [
        profile.emergency_ar,
        "لا تنتظر ولا تقُد بنفسك إن كنت تشعر بتدهور.",
        "أخبر شخصًا قريبًا منك الآن بما تشعر به.",
        "يمكننا العودة لخطة الإقلاع بعد أن تطمئن على سلامتك.",
      ],
    };
  }

  // ---- Cardiac ladder (four distinct states) ----
  switch (answers.cardiac) {
    case "stable":
      flags.push("cardiac:stable");
      // No escalation. Behavioural plan continues normally.
      break;
    case "recent_event":
      flags.push("cardiac:recent_event");
      level = highest(level, "clinician");
      break;
    case "active_symptoms":
      flags.push("cardiac:active_symptoms_no_red_flag");
      level = highest(level, "urgent");
      break;
    default:
      break;
  }

  if (answers.respiratory === "worsening") {
    flags.push("respiratory:worsening");
    level = highest(level, "urgent");
  } else if (answers.respiratory === "diagnosed_stable") {
    flags.push("respiratory:stable");
    level = highest(level, "cessation_specialist");
  }

  // ---- Mental health ----
  if (answers.mental_health === "stable") {
    flags.push("mental_health:stable_monitored");
    // Not suppressed, no escalation beyond supportive content.
  } else if (answers.mental_health === "unstable") {
    flags.push("mental_health:unstable_or_unclear");
    level = highest(level, "clinician");
  }

  // ---- Pregnancy / breastfeeding ----
  if (answers.pregnancy === "pregnant" || answers.pregnancy === "breastfeeding") {
    flags.push(`pregnancy:${answers.pregnancy}`);
    level = highest(level, "clinician");
  }

  // ---- Adolescent ----
  if (answers.age_band === "under_18") {
    flags.push("age:under_18");
    level = highest(level, "cessation_specialist");
  }

  // ---- Poly-use complexity ----
  if ((answers.products ?? []).length >= 2) {
    flags.push("poly_use_complexity");
    level = highest(level, "cessation_specialist");
  }

  // ---- Other conditions / interactions ----
  const others = answers.other_conditions ?? [];
  if (others.some((c) => c !== "none")) {
    flags.push(...others.filter((c) => c !== "none").map((c) => `condition:${c}`));
    level = highest(level, "clinician");
  }

  const messages: Record<SafetyGateLevel, string> = {
    self_management:
      "لا يظهر من إجاباتك ما يستدعي إحالة عاجلة. خطتك السلوكية جاهزة، ويمكنك دائمًا استشارة مختص متى رغبت.",
    pharmacist:
      "خطتك السلوكية جاهزة. يمكنك أيضًا مناقشة خيارات الدعم مع صيدلي مؤهل عند الحاجة.",
    cessation_specialist: `خطتك السلوكية جاهزة، ونوصي بدعم إضافي من مختص إقلاع. ${profile.booking_ar}`,
    clinician: `خطتك السلوكية جاهزة، ولكن بناءً على إجاباتك ننصح بمراجعة طبية قبل أي خطوة علاجية. ${profile.clinician_ar}`,
    urgent: profile.urgent_ar,
    emergency: profile.emergency_ar,
  };

  const actions: Record<SafetyGateLevel, string[]> = {
    self_management: ["تابع خطتك السلوكية كما هي.", profile.support_ar],
    pharmacist: ["تابع خطتك السلوكية.", "ناقش خيارات الدعم مع صيدلي مؤهل."],
    cessation_specialist: ["تابع خطتك السلوكية.", profile.booking_ar, profile.support_ar],
    clinician: [
      "تابع خطتك السلوكية — لا تتوقف عن العمل عليها.",
      profile.clinician_ar,
      profile.support_ar,
    ],
    urgent: [
      profile.urgent_ar,
      "لا تؤجل التقييم إلى موعد لاحق.",
      "إذا ظهرت أعراض خطيرة (ألم صدر شديد، ضيق تنفس شديد، دم مع السعال، فقدان وعي) فهذه حالة طارئة.",
    ],
    emergency: [profile.emergency_ar],
  };

  return {
    level,
    flags,
    suppress_plan: false,
    message_ar: messages[level],
    actions_ar: actions[level],
  };
}
