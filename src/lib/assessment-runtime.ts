// Aqla Assessment Runtime
// -----------------------------------------------------------------------------
// Shared helpers for the academy quizzes and the volunteer-training final exam.
//
// Design goals (from the professional-assessment spec):
//   1. Correct answers are stored by STABLE KEY (e.g. "a"/ "b"/ "c"), never by
//      display position. Options are shuffled per-attempt at serve time; scoring
//      matches on the key that travels with the option, so shuffling can never
//      change which answer is correct.
//   2. Every question exposes a `safetyCritical` flag. A passing overall score
//      never compensates for a missed safety-critical item; those must ALL be
//      correct in addition to the overall threshold.
//   3. Questions expose difficulty / competency / source metadata so an admin
//      dashboard (future phase) can audit the item bank.
//
// This module is pure — no side effects, safe to import from client OR server.
// -----------------------------------------------------------------------------

export type Bi = { ar: string; en: string };

export type AnswerOption = {
  /** Stable identifier for this option — never changes across attempts. */
  key: string;
  ar: string;
  en: string;
};

export type QuestionDifficulty = "foundational"| "intermediate"| "advanced";

export type AssessmentQuestion = {
  /** Stable question identifier (e.g. "acad.m1.q3"). Used server-side for scoring. */
  id: string;
  q: Bi;
  options: AnswerOption[];
  correctKey: string;
  explanation: Bi;
  difficulty: QuestionDifficulty;
  competency: string;
  /** True if this item guards a life-safety, safeguarding, or scope-of-practice rule. */
  safetyCritical?: boolean;
  /** Short human-readable source reference (WHO 2024, CDC, Saudi MoH, …). */
  source: string;
};

// ---------- Deterministic shuffle -------------------------------------------

/** Small deterministic PRNG (Mulberry32) so the option order is stable within
 *  one attempt but different across attempts / users. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function shuffleOptions<T extends AnswerOption>(options: T[], seed: string): T[] {
  const rand = mulberry32(hashString(seed));
  const arr = options.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Generate a random attempt seed the client uses to shuffle options. */
export function newAttemptSeed(): string {
  const bytes = new Uint8Array(8);
  (globalThis.crypto ?? crypto).getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- Scoring ---------------------------------------------------------

export type ScoreResult = {
  total: number;
  correct: number;
  percent: number;
  passed: boolean;
  safetyCriticalTotal: number;
  safetyCriticalMissed: string[]; // question IDs
  safetyCriticalPassed: boolean;
  perQuestion: Array<{ id: string; correct: boolean; safetyCritical: boolean }>;
};

/** Score an attempt by matching the learner's `answerKey` to `question.correctKey`.
 *  `answers` is keyed by question.id — display position is irrelevant. */
export function scoreAttempt(
  questions: AssessmentQuestion[],
  answers: Record<string, string | undefined | null>,
  passPercent = 80,
): ScoreResult {
  let correct = 0;
  const safetyMissed: string[] = [];
  let safetyTotal = 0;
  const perQuestion: ScoreResult["perQuestion"] = [];

  for (const q of questions) {
    const chosen = answers[q.id];
    const isCorrect = typeof chosen === "string" && chosen === q.correctKey;
    if (isCorrect) correct++;
    if (q.safetyCritical) {
      safetyTotal++;
      if (!isCorrect) safetyMissed.push(q.id);
    }
    perQuestion.push({ id: q.id, correct: isCorrect, safetyCritical: !!q.safetyCritical });
  }

  const total = questions.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return {
    total,
    correct,
    percent,
    passed: percent >= passPercent,
    safetyCriticalTotal: safetyTotal,
    safetyCriticalMissed: safetyMissed,
    safetyCriticalPassed: safetyMissed.length === 0,
    perQuestion,
  };
}

// ---------- Scope-and-conduct statement -------------------------------------
// Bilingual acceptance the learner must confirm before claiming a certificate.
export const SCOPE_STATEMENT: Bi = {
  ar:
    "أتعهد بأنني متطوع توعوي وليس طبيبًا ولا مقدم رعاية سريرية؛ ولن أُشخّص أو أصف علاجًا أو جرعات دواء؛ وسأحيل الأسئلة الطبية إلى مختصين مرخّصين؛ وسأحترم خصوصية المستفيدين ولن أُشارك معلوماتهم إلا عند وجود خطر مباشر يستوجب التبليغ؛ وسأتّبع مسارات أقلع المعتمدة وخدمات الصحة السعودية.",
  en:
    "I acknowledge that I am an awareness volunteer, not a clinician; that I will not diagnose, prescribe, or advise on medication doses; that I will refer medical questions to licensed professionals; that I will protect participants' privacy and only share information when an immediate safety risk requires escalation; and that I will follow approved Aqla pathways and Saudi health services.",
};

// ---------- Version stamp ---------------------------------------------------
// Bumped whenever the item bank or scoring logic changes materially.
export const ACADEMY_ASSESSMENT_VERSION = "v2";
export const TRAINING_ASSESSMENT_VERSION = "v2";
