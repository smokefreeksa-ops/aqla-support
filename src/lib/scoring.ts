// Clinical scoring + cohort logic for Aqla
// Cigarette dependence: standard FTND 6-domain scoring (0-10)
// Nicotine control: HONC-style yes/no count (0-10)

export type ProductKey =
  | "cigarettes"
  | "vape"
  | "shisha"
  | "pouches"
  | "smokeless"
  | "multiple"
  | "former"
  | "non_user";

export interface FtndAnswers {
  q1: number; // time to first cigarette: 3=≤5min, 2=6-30, 1=31-60, 0=>60
  q2: number; // difficult to refrain: 1=yes, 0=no
  q3: number; // hardest to give up: 1=first morning, 0=any other
  q4: number; // cigs/day: 0=≤10, 1=11-20, 2=21-30, 3=≥31
  q5: number; // more in morning: 1=yes, 0=no
  q6: number; // smoke when ill: 1=yes, 0=no
}

export function scoreFtnd(a: FtndAnswers) {
  const total = a.q1 + a.q2 + a.q3 + a.q4 + a.q5 + a.q6;
  // Snake-case bands per research-grade spec:
  // 0-2 very_low | 3-4 low | 5 moderate | 6-7 high | 8-10 very_high
  let category: string;
  if (total <= 2) category = "very_low";
  else if (total <= 4) category = "low";
  else if (total === 5) category = "moderate";
  else if (total <= 7) category = "high";
  else category = "very_high";
  return { total, category };
}

export type NicotineAnswers = Record<
  "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9" | "q10",
  boolean
>;

export function scoreNicotineControl(a: NicotineAnswers) {
  const yes_count = Object.values(a).filter(Boolean).length;
  let category: string;
  if (yes_count === 0) category = "low";
  else if (yes_count <= 2) category = "early";
  else if (yes_count <= 5) category = "moderate";
  else category = "high";
  return { yes_count, category };
}

// HONC-style loss-of-autonomy screening (10 yes/no items).
// Not a validated HONC scale — labelled "HONC-style" in UI and exports.
export type HoncAnswers = Record<
  "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9" | "q10",
  boolean
>;
export function scoreHonc(a: HoncAnswers) {
  const positive_count = Object.values(a).filter(Boolean).length;
  const any_yes = positive_count > 0;
  let category: string;
  if (positive_count === 0) category = "none";
  else if (positive_count <= 2) category = "low";
  else if (positive_count <= 5) category = "moderate";
  else category = "high";
  return { positive_count, any_yes, category };
}

export interface CohortInput {
  products: ProductKey[];
  ftnd?: number;
  nicotineYes?: number;
  readiness: string; // readiness_code
  riskFlags: string[];
  age?: number;
}

export interface CohortResult {
  cohort: "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";
  reason: string;
  doctorReviewNeeded: boolean;
  urgent: boolean;
}

const URGENT = new Set(["severe_chest_pain", "severe_sob", "coughing_blood"]);
const HIGH_RISK = new Set([
  "pregnancy",
  "severe_withdrawal",
  "mental_health",
  "repeated_failed",
  "multi_product",
  "very_high_dependence",
  "wants_medication",
  "wants_alternatives",
  "requests_clinician",
  "under_18",
]);

const READY_FOR_QUIT = new Set(["quit_now", "quit_prepare", "reduce_first"]);

export function assignCohort(i: CohortInput): CohortResult {
  const urgent = i.riskFlags.some((f) => URGENT.has(f));
  const hasCig = i.products.includes("cigarettes");
  const hasNicProduct = ["vape", "pouches", "smokeless", "shisha"].some((p) =>
    i.products.includes(p as ProductKey),
  );
  const multiProduct = hasCig && hasNicProduct;
  // Multi-product use auto-escalates to clinician review
  if (multiProduct && !i.riskFlags.includes("multi_product")) {
    i.riskFlags = [...i.riskFlags, "multi_product"];
  }
  const isMinor = (i.age ?? 99) < 18;

  const veryHighDep = (i.ftnd ?? 0) >= 8;
  const highDep = (i.ftnd ?? 0) >= 6; // FTND high band (6-7) or higher
  
  const otherRiskFlags = i.riskFlags.filter(
    (f) => f !== "multi_product" && f !== "very_high_dependence",
  );
  const highDepPlusRisk = highDep && otherRiskFlags.length > 0;

  const fTrigger =
    urgent ||
    i.riskFlags.includes("pregnancy") ||
    i.riskFlags.includes("mental_health") ||
    veryHighDep ||
    multiProduct ||
    
    highDepPlusRisk ||
    i.riskFlags.includes("multi_product") ||
    (isMinor && ((i.ftnd ?? 0) >= 3 || (i.nicotineYes ?? 0) >= 3)) ||
    i.riskFlags.includes("repeated_failed") ||
    i.riskFlags.includes("wants_medication") ||
    i.riskFlags.includes("requests_clinician");

  if (fTrigger) {
    const reasons: string[] = [];
    if (urgent) reasons.push("Urgent safety symptoms");
    if (i.riskFlags.includes("pregnancy")) reasons.push("Pregnancy");
    if (i.riskFlags.includes("mental_health")) reasons.push("Mental-health concern");
    if (veryHighDep) reasons.push("Very-high cigarette dependence");
    else if (highDepPlusRisk) reasons.push("High cigarette dependence with additional risk flags");
    if (multiProduct || i.riskFlags.includes("multi_product")) reasons.push("Multiple product use");
    
    if (i.riskFlags.includes("repeated_failed")) reasons.push("Repeated failed quit attempts");
    if (i.riskFlags.includes("wants_medication")) reasons.push("Medication request");
    if (i.riskFlags.includes("requests_clinician")) reasons.push("Clinician review requested");
    return {
      cohort: "F",
      reason: `High-priority clinician review (${reasons.join("; ") || "safety flags"}).`,
      doctorReviewNeeded: true,
      urgent,
    };
  }

  if (i.readiness === "discuss_alternatives" || i.riskFlags.includes("wants_alternatives")) {
    return {
      cohort: "E",
      reason: "Participant requests clinician counseling about nicotine alternatives.",
      doctorReviewNeeded: true,
      urgent,
    };
  }

  if (i.readiness === "score_only" || i.readiness === "helping_someone") {
    return {
      cohort: "G",
      reason:
        i.readiness === "helping_someone"
          ? "Helping-someone session — score shared for educational support."
          : "Score-only session — score shared and invitation to return later.",
      doctorReviewNeeded: false,
      urgent,
    };
  }

  if (i.products.includes("non_user") || i.products.includes("former")) {
    return {
      cohort: "H",
      reason: "No current nicotine/tobacco use — prevention/education pathway.",
      doctorReviewNeeded: false,
      urgent,
    };
  }

  if (i.readiness === "not_ready_score") {
    return {
      cohort: "D",
      reason: "Not ready to quit — motivational support pathway, no pressure.",
      doctorReviewNeeded: false,
      urgent,
    };
  }

  if (hasNicProduct && (i.nicotineYes ?? 0) >= 3) {
    const highConcern = (i.nicotineYes ?? 0) >= 6;
    return {
      cohort: "C",
      reason: highConcern
        ? "High nicotine-control concern (vape / nicotine pouch / non-cigarette nicotine use) — clinician review recommended."
        : "Vape / nicotine pouch / non-cigarette nicotine user with moderate nicotine-control concern.",
      doctorReviewNeeded: highConcern,
      urgent,
    };
  }

  if (hasCig && READY_FOR_QUIT.has(i.readiness)) {
    if ((i.ftnd ?? 0) >= 5) {
      return {
        cohort: "B",
        reason:
          "Cigarette smoker with moderate/high dependence, ready to quit or prepare — structured support + follow-up.",
        doctorReviewNeeded: false,
        urgent,
      };
    }
    return {
      cohort: "A",
      reason:
        "Cigarette smoker with low dependence, ready to quit or prepare — self-guided support + follow-up.",
      doctorReviewNeeded: false,
      urgent,
    };
  }

  return {
    cohort: "D",
    reason: "Motivational support pathway.",
    doctorReviewNeeded: false,
    urgent,
  };
}

// ============================================================
// STEP 5 — additional validated instruments for /quit-pathway
// All scoring is deterministic and server-only.
// Bands are stored in DB but never exposed in shareable text.
// ============================================================

// ---------- Penn State Electronic Cigarette Dependence Index (PSECDI, 10 items) ----------
// Items 1–4 use the official Penn State item-score tables.
// Items 5–10 are yes/no (1 / 0). Total range 0–20.
// Bands (per PSECDI): 0–3 not, 4–8 low, 9–12 medium, 13+ high.
export interface PennStateEcigAnswers {
  q1: number; // times per day vaped → 0–3
  q2: number; // minutes after waking → 0–3
  q3: number; // do you vape now because hard to quit → 0–1
  q4: number; // do you ever crave → 0–1
  q5: boolean; // do you NEED to vape
  q6: boolean; // is it hard to keep from vaping in places not allowed
  q7: boolean; // when you haven't vaped a while or tried to stop, do you feel more irritable
  q8: boolean; // ...more anxious
  q9: boolean; // ...more restless
  q10: boolean; // ...more hungry
}
export const PENN_STATE_ITEM_SCORES = {
  // Q1 — How many times per day do you usually use your e-cig?
  q1: {
    "0": 0, // 0
    "1-4": 0, // 1–4
    "5-9": 1, // 5–9
    "10-14": 2, // 10–14
    "15+": 3, // 15+
  },
  // Q2 — How soon after waking?
  q2: {
    ">60": 0,
    "31-60": 1,
    "6-30": 2,
    "<=5": 3,
  },
  // Q3 — Do you vape now because it's really hard to quit?
  q3: { no: 0, yes: 1 },
  // Q4 — Do you ever crave to use your e-cig?
  q4: { no: 0, yes: 1 },
} as const;

export function scorePennStateEcig(a: PennStateEcigAnswers) {
  const part1 = (a.q1 ?? 0) + (a.q2 ?? 0) + (a.q3 ?? 0) + (a.q4 ?? 0);
  const part2 =
    (a.q5 ? 1 : 0) + (a.q6 ? 1 : 0) + (a.q7 ? 1 : 0) + (a.q8 ? 1 : 0) + (a.q9 ? 1 : 0) + (a.q10 ? 1 : 0);
  const total = part1 + part2;
  let category: string;
  if (total <= 3) category = "not_dependent";
  else if (total <= 8) category = "low";
  else if (total <= 12) category = "medium";
  else category = "high";
  return { total, category };
}

// ---------- LWDS-11 (Lebanon Waterpipe Dependence Scale, 11 items) ----------
// Item-level scoring follows the published LWDS-11 (max ~39 across 11 items
// with mixed 0–3 / 0–1 scales). We accept caller-provided integer item values.
export type Lwds11Answers = Record<
  "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9" | "q10" | "q11",
  number
>;
export function scoreLwds11(a: Lwds11Answers) {
  const total = Object.values(a).reduce((acc, v) => acc + (v || 0), 0);
  // Published cut-points: <10 low, 10–15 moderate, >15 high.
  let category: string;
  if (total < 10) category = "low";
  else if (total <= 15) category = "moderate";
  else category = "high";
  return { total, category };
}

// ---------- Oral nicotine / pouch — adapted screen (NOT validated) ----------
// 6 yes/no items. Score = count of yes. UI MUST label this غير معتمد and
// stored row MUST set validated:false.
export type OralNicotineAnswers = Record<
  "q1" | "q2" | "q3" | "q4" | "q5" | "q6",
  boolean
>;
export function scoreOralNicotineAdapted(a: OralNicotineAnswers) {
  const yes_count = Object.values(a).filter(Boolean).length;
  let category: string;
  if (yes_count <= 1) category = "low";
  else if (yes_count <= 3) category = "moderate";
  else category = "high";
  return { yes_count, category, validated: false };
}

// ---------- Instrument routing ----------
export type Instrument =
  | "ftnd_cigarettes"
  | "ps_ecdi_vape"
  | "ps_ndi_all_nicotine"
  | "lwds11_waterpipe"
  | "honc_youth";

export function pickInstrument(product: string, opts?: { youthOrLossOfControl?: boolean }): Instrument {
  if (opts?.youthOrLossOfControl) return "honc_youth";
  switch (product) {
    case "cigarettes":
      return "ftnd_cigarettes";
    case "vape":
      return "ps_ecdi_vape";
    case "shisha":
      return "lwds11_waterpipe";
    case "pouches":
      return "ps_ndi_all_nicotine";
    case "multiple":
    case "unsure":
    default:
      return "ftnd_cigarettes";
  }
}

// ---------- Risk-flag helper for assessments ----------
// Maps instrument + band → boolean risk_flag for downstream referral logic.
export function instrumentRiskFlag(instrument: Instrument, band: string): boolean {
  if (instrument === "ftnd_cigarettes") return band === "high" || band === "very_high";
  if (instrument === "ps_ecdi_vape") return band === "medium" || band === "high";
  if (instrument === "lwds11_waterpipe") return band === "high";
  if (instrument === "ps_ndi_all_nicotine") return band === "high";
  if (instrument === "honc_youth") return band === "high";
  return false;
}

// ---------- Money saved calculator ----------
// units = packs/day for cigarettes, or cartridges/pouches/sessions per day.
// price = local currency per unit. Returns rounded daily/weekly/yearly.
export function moneySaved(units_per_day: number, price_per_unit: number) {
  const safeUnits = Math.max(0, Number(units_per_day) || 0);
  const safePrice = Math.max(0, Number(price_per_unit) || 0);
  const daily = safeUnits * safePrice;
  return {
    daily: Math.round(daily * 100) / 100,
    weekly: Math.round(daily * 7 * 100) / 100,
    monthly: Math.round(daily * 30 * 100) / 100,
    yearly: Math.round(daily * 365 * 100) / 100,
  };
}

