import { describe, expect, it } from "vitest";
import { generatePlan, LIFETIME_SECTION_IDS } from "@/lib/clinical/plan-engine";
import { canRenderMedicationContent } from "@/lib/clinical/release-flags";
import type { ClinicalAnswers, ClinicalPlanJSON } from "@/lib/clinical/types";

/**
 * Release 1 acceptance tests — one test per approved blocker fix.
 * These cover the pure, deterministic layer (plan_json). Database-backed
 * behaviour is asserted through the shapes the persistence layer stores.
 */

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

const gen = (a: Partial<ClinicalAnswers> = {}, planVersion = 1) =>
  generatePlan({ answers: { ...base, ...a }, planVersion });

describe("R1-1 lifetime timeline", () => {
  it("emits exactly eleven distinct sections in the approved order", () => {
    const timeline = gen().timeline;
    expect(timeline).toHaveLength(11);
    expect(timeline.map((t) => t.id)).toEqual([...LIFETIME_SECTION_IDS]);
  });

  it("never collapses two horizons into one section", () => {
    const ids = gen().timeline.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every section its own non-empty Arabic title and content", () => {
    for (const s of gen().timeline) {
      expect(s.title_ar.trim().length).toBeGreaterThan(0);
      expect(s.items.length).toBeGreaterThan(0);
      for (const item of s.items) expect(item.trim().length).toBeGreaterThan(0);
    }
  });

  it("keeps section content distinct across horizons", () => {
    const bodies = gen().timeline.map((s) => s.items.join("|"));
    expect(new Set(bodies).size).toBe(bodies.length);
  });

  it("covers beyond one year with after_one_year and long_term_maintenance", () => {
    const ids = gen().timeline.map((t) => t.id);
    expect(ids).toContain("after_one_year");
    expect(ids).toContain("long_term_maintenance");
  });

  it("keeps the eleven sections for reduce-first strategy too", () => {
    expect(gen({ strategy: "reduce_to_quit" }).timeline.map((t) => t.id)).toEqual([...LIFETIME_SECTION_IDS]);
  });

  it("keeps the eleven sections for not-ready users", () => {
    expect(gen({ strategy: "not_ready_yet", readiness: 2 }).timeline).toHaveLength(11);
  });
});

describe("R1-2 lapse and relapse protocols", () => {
  it("preserves the four graded protocols", () => {
    expect(gen().lapse_pathways.map((p) => p.id)).toEqual([
      "one_puff",
      "one_cigarette",
      "one_day",
      "regular_relapse",
    ]);
  });

  it("gives each protocol its own distinct steps", () => {
    const steps = gen().lapse_pathways.map((p) => p.steps.join("|"));
    expect(new Set(steps).size).toBe(4);
  });

  it("keeps the protocols regardless of strategy", () => {
    for (const strategy of ["quit_now", "future_date", "reduce_to_quit", "not_ready_yet"] as const) {
      expect(gen({ strategy }).lapse_pathways).toHaveLength(4);
    }
  });

  it("removes protocols only when the plan is safety-suppressed", () => {
    expect(gen({ red_flags: ["chest_pain_now"] }).lapse_pathways).toHaveLength(0);
  });
});

describe("R1-3 plan immutability and versioning", () => {
  it("stamps the version passed by the persistence layer", () => {
    expect(gen({}, 3).plan_version).toBe(3);
  });

  it("regeneration produces a new object rather than mutating the previous one", () => {
    const v1 = gen({}, 1);
    const snapshot = JSON.stringify(v1);
    const v2 = gen({ nickname: "أبو خالد" }, 2);
    expect(JSON.stringify(v1)).toBe(snapshot);
    expect(v2.plan_version).toBe(2);
    expect(v2.identity.nickname).not.toBe(v1.identity.nickname);
  });

  it("each version carries its own generated_at stamp", () => {
    expect(typeof gen({}, 2).generated_at).toBe("string");
  });
});

describe("R1-4 / R1-5 plan route and dashboard reopen contract", () => {
  it("plan_json is self-contained so /quit-plan/$planToken can render it without recomputation", () => {
    const plan: ClinicalPlanJSON = gen();
    expect(plan.identity.nickname).toBeTruthy();
    expect(plan.timeline.length).toBe(11);
    expect(plan.lapse_pathways.length).toBe(4);
    expect(plan.safety).toBeTruthy();
    expect(plan.plan_version).toBe(1);
  });

  it("plan_json survives a JSON round-trip unchanged (what the DB stores is what renders)", () => {
    const plan = gen();
    expect(JSON.parse(JSON.stringify(plan))).toEqual(plan);
  });

  it("a suppressed plan still round-trips a renderable safety payload", () => {
    const plan = gen({ red_flags: ["chest_pain_now"] });
    expect(plan.safety.suppress_plan).toBe(true);
    expect(plan.safety.actions_ar.length).toBeGreaterThan(0);
  });
});

describe("R1-6 PDF parity", () => {
  it("exposes every section the PDF must print", () => {
    const plan = gen();
    for (const id of LIFETIME_SECTION_IDS) {
      expect(plan.timeline.some((s) => s.id === id)).toBe(true);
    }
  });

  it("contains only Arabic-renderable plain strings (no HTML) for the PDF", () => {
    const text = JSON.stringify(gen());
    expect(text).not.toMatch(/<\/?[a-z][\s\S]*>/i);
  });
});

describe("R1-8 legacy medication safety", () => {
  it("blocks medication rendering for every token", () => {
    for (const token of ["legacy", "release1", "", null]) {
      expect(canRenderMedicationContent(token as string | null)).toBe(false);
    }
  });

  it("marks generated plans as medication-free", () => {
    expect(gen().medication_content_included).toBe(false);
  });

  it("keeps medication wording out of every timeline section", () => {
    const text = gen()
      .timeline.map((s) => `${s.title_ar} ${s.items.join(" ")}`)
      .join(" ");
    for (const term of ["نيكوتين بديل", "لصقة", "علكة النيكوتين", "varenicline", "bupropion"]) {
      expect(text).not.toContain(term);
    }
  });
});
