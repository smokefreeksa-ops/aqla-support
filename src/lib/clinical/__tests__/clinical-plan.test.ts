import { describe, expect, it } from "vitest";
import { generatePlan, LIFETIME_SECTION_IDS } from "@/lib/clinical/plan-engine";
import { nextQuestion, QUESTIONS } from "@/lib/clinical/questions";
import { canRenderMedicationContent, SAUDI_MEDICATION_CONTENT_APPROVED } from "@/lib/clinical/release-flags";
import { SAUDI_IDENTIFIERS } from "@/lib/clinical/jurisdiction";
import type { ClinicalAnswers } from "@/lib/clinical/types";

const base: ClinicalAnswers = {
  nickname: "مالك",
  jurisdiction: "SA",
  city: "جدة",
  privacy_ack: true,
  age_band: "25_39",
  sex: "male",
  products: ["cigarettes"],
  ftnd_opt_in: true,
  ftnd_q1: 3,
  ftnd_q2: 1,
  ftnd_q3: 1,
  ftnd_q4: 2,
  ftnd_q5: 1,
  ftnd_q6: 0,
  red_flags: ["none"],
  cardiac: "none",
  respiratory: "none",
  mental_health: "none",
  other_conditions: ["none"],
  readiness: 8,
  strategy: "quit_now",
  quit_date: "2026-01-01",
  triggers: ["coffee", "stress"],
  past_attempts: "days",
  supporter: "أخي",
  money_opt_in: false,
  plan_email_consent: false,
};

const gen = (a: Partial<ClinicalAnswers>) => generatePlan({ answers: { ...base, ...a }, planVersion: 1 });

describe("release gates", () => {
  it("medication content is structurally impossible in Release 1", () => {
    expect(SAUDI_MEDICATION_CONTENT_APPROVED).toBe(false);
    expect(canRenderMedicationContent("anything")).toBe(false);
    expect(canRenderMedicationContent(null)).toBe(false);
    expect(gen({}).medication_content_included).toBe(false);
  });

  it("no medication wording leaks into any generated text", () => {
    const plan = gen({});
    const text = JSON.stringify(plan);
    for (const term of ["فارينيكلين", "بوبروبيون", "لصقة النيكوتين", "varenicline", "bupropion", "NRT"]) {
      expect(text).not.toContain(term);
    }
  });
});

describe("dependence instruments", () => {
  it("scores FTND only for cigarette users who opted in", () => {
    const plan = gen({});
    expect(plan.dependence.instrument).toBe("FTND");
    expect(plan.dependence.total).toBe(8);
    expect(plan.dependence_status).toBe("ftnd_scored");
  });

  it("never invents a dependence score for vape/shisha/pouch users", () => {
    const plan = gen({ products: ["vape", "pouches"], ftnd_opt_in: undefined, vape_pattern: "all_day" });
    expect(plan.dependence.instrument).toBeNull();
    expect(plan.dependence.total).toBeNull();
    expect(plan.dependence_status).toBe("descriptive_only");
  });

  it("records a declined FTND distinctly from descriptive-only", () => {
    expect(gen({ ftnd_opt_in: false }).dependence_status).toBe("ftnd_declined");
  });

  it("does not offer FTND to non-cigarette users", () => {
    const answers: ClinicalAnswers = { products: ["vape"] };
    const ftndQ = QUESTIONS.find((q) => q.id === "ftnd_opt_in")!;
    expect(ftndQ.when!(answers)).toBe(false);
  });
});

describe("safety ladder", () => {
  it("stable cardiac history does not escalate or block the plan", () => {
    const plan = gen({ cardiac: "stable" });
    expect(plan.safety_gate_level).toBe("self_management");
    expect(plan.safety.suppress_plan).toBe(false);
    expect(plan.timeline.length).toBeGreaterThan(0);
  });

  it("recent cardiac event routes to clinician, not emergency", () => {
    expect(gen({ cardiac: "recent_event"}).safety_gate_level).toBe("clinician");
  });

  it("active symptoms route to urgent, not emergency", () => {
    const plan = gen({ cardiac: "active_symptoms" });
    expect(plan.safety_gate_level).toBe("urgent");
    expect(plan.safety.suppress_plan).toBe(false);
  });

  it("only true red flags reach emergency and suppress the plan", () => {
    const plan = gen({ red_flags: ["chest_pain_now"] });
    expect(plan.safety_gate_level).toBe("emergency");
    expect(plan.safety.suppress_plan).toBe(true);
    expect(plan.timeline).toHaveLength(0);
    expect(plan.lapse_pathways).toHaveLength(0);
  });

  it("stable mental health does not suppress the behavioural plan", () => {
    const plan = gen({ mental_health: "stable" });
    expect(plan.safety.suppress_plan).toBe(false);
    expect(plan.safety_gate_level).toBe("self_management");
  });
});

describe("jurisdiction routing", () => {
  it("surfaces 997 only for Saudi emergencies", () => {
    const sa = gen({ red_flags: ["chest_pain_now"] });
    expect(sa.safety.message_ar).toContain("997");
  });

  it("never leaks Saudi identifiers into GENERIC plans", () => {
    const generic = JSON.stringify(gen({ jurisdiction: "GENERIC", city: undefined, red_flags: ["chest_pain_now"] }));
    for (const id of SAUDI_IDENTIFIERS) expect(generic).not.toContain(id);
  });

  it("does not invent a foreign emergency number", () => {
    const generic = gen({ jurisdiction: "GENERIC", red_flags: ["chest_pain_now"] });
    expect(generic.safety.message_ar).toContain("رقم الطوارئ المحلي");
  });
});

describe("relapse pathways", () => {
  it("provides four distinct graded pathways", () => {
    const ids = gen({}).lapse_pathways.map((p) => p.id);
    expect(ids).toEqual(["one_puff", "one_cigarette", "one_day", "regular_relapse"]);
  });

  it("a single puff does not reset the counter", () => {
    const puff = gen({}).lapse_pathways[0];
    expect(puff.steps.join("")).toContain("لا تعيد ضبط عدّاد أيامك");
  });
});

describe("timeline", () => {
  it("covers preparation through long-term maintenance", () => {
    const ids = gen({}).timeline.map((t) => t.id);
    expect(ids).toEqual([...LIFETIME_SECTION_IDS]);
  });
});


describe("determinism and privacy", () => {
  it("same answers produce the same plan (ignoring timestamp)", () => {
    const a = gen({});
    const b = gen({});
    const strip = (p: object) => JSON.stringify({ ...p, generated_at: null });
    expect(strip(a)).toBe(strip(b));
  });

  it("asks the privacy notice before any health question", () => {
    const noticeIndex = QUESTIONS.findIndex((q) => q.id === "privacy_ack");
    const firstHealthIndex = QUESTIONS.findIndex((q) => q.health);
    expect(noticeIndex).toBeGreaterThanOrEqual(0);
    expect(noticeIndex).toBeLessThan(firstHealthIndex);
  });

  it("does not ask for email unless the user consents", () => {
    const emailQ = QUESTIONS.find((q) => q.id === "email")!;
    expect(emailQ.when!({ plan_email_consent: false })).toBe(false);
    expect(emailQ.when!({ plan_email_consent: true })).toBe(true);
  });

  it("skips the email consent question entirely for minors", () => {
    const consentQ = QUESTIONS.find((q) => q.id === "plan_email_consent")!;
    expect(consentQ.when!({ age_band: "under_18" })).toBe(false);
  });
});

describe("question flow", () => {
  it("terminates once every applicable question is answered", () => {
    let answers: ClinicalAnswers = {};
    const answered: string[] = [];
    for (let i = 0; i < 60; i++) {
      const q = nextQuestion(answers, answered);
      if (!q) break;
      answered.push(q.id as string);
      answers = { ...answers, [q.id]: q.kind === "multi"? ["none"] : q.kind === "scale"? 7 : "x" };
    }
    expect(nextQuestion(answers, answered)).toBeNull();
  });
});
