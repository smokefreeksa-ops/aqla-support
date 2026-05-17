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
  let category: string;
  if (total <= 2) category = "Very low cigarette dependence";
  else if (total <= 4) category = "Low cigarette dependence";
  else if (total === 5) category = "Moderate cigarette dependence";
  else if (total <= 7) category = "High cigarette dependence";
  else category = "Very high cigarette dependence";
  return { total, category };
}

export type NicotineAnswers = Record<
  "q1" | "q2" | "q3" | "q4" | "q5" | "q6" | "q7" | "q8" | "q9" | "q10",
  boolean
>;

export function scoreNicotineControl(a: NicotineAnswers) {
  const yes_count = Object.values(a).filter(Boolean).length;
  let category: string;
  if (yes_count === 0) category = "Low current concern";
  else if (yes_count <= 2) category = "Early loss-of-control concern";
  else if (yes_count <= 5) category = "Moderate nicotine-control concern";
  else category = "High nicotine-control concern — clinician review recommended";
  return { yes_count, category };
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

  const veryHighDep = (i.ftnd ?? 0) >= 8 || (i.nicotineYes ?? 0) >= 8;
  const fTrigger =
    urgent ||
    i.riskFlags.includes("pregnancy") ||
    i.riskFlags.includes("mental_health") ||
    veryHighDep ||
    multiProduct ||
    i.riskFlags.includes("multi_product") ||
    (isMinor && ((i.ftnd ?? 0) >= 3 || (i.nicotineYes ?? 0) >= 3)) ||
    i.riskFlags.includes("repeated_failed") ||
    i.riskFlags.includes("wants_medication") ||
    i.riskFlags.includes("requests_clinician");

  if (fTrigger) {
    return {
      cohort: "F",
      reason:
        "High-priority clinician review (safety flags, very-high dependence, multi-product use, or clinician request).",
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
