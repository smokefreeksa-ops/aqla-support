import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { sendAdminNotification, renderKeyValueHtml } from "./notifications.server";

async function getRoles(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.role as "receptionist" | "physician");
}

async function logAudit(userId: string, action: string, entity: string, entityId?: string, details?: unknown) {
  await supabaseAdmin.from("audit_log").insert({
    user_id: userId,
    action,
    entity,
    entity_id: entityId ?? null,
    details: (details ?? null) as never,
  });
}

export const getCurrentRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await getRoles(context.userId);
    return { roles };
  });

export const listParticipants = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        search: z.string().optional(),
        cohort: z.string().optional(),
        doctorReview: z.boolean().optional(),
        followUp: z.string().optional(),
        product: z.string().optional(),
        readiness: z.string().optional(),
        depCategory: z.string().optional(),
        city: z.string().optional(),
        affiliation: z.string().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (roles.length === 0) throw new Error("Forbidden: no role assigned");

    // Build participant-id restriction from joined tables
    const idSets: string[][] = [];
    if (data.product) {
      const { data: rows } = await supabaseAdmin
        .from("product_use").select("participant_id").contains("products", [data.product]);
      idSets.push((rows ?? []).map((r) => r.participant_id));
    }
    if (data.readiness) {
      const { data: rows } = await supabaseAdmin
        .from("readiness_stage").select("participant_id").eq("stage", data.readiness as never);
      idSets.push((rows ?? []).map((r) => r.participant_id));
    }
    if (data.depCategory) {
      const { data: rows } = await supabaseAdmin
        .from("cigarette_dependence_scores").select("participant_id").eq("category", data.depCategory);
      idSets.push((rows ?? []).map((r) => r.participant_id));
    }
    const pidFilter: string[] | null = idSets.length === 0
      ? null
      : idSets.reduce((acc, cur) => acc.filter((x) => cur.includes(x)), idSets[0]);

    let q = supabaseAdmin
      .from("participants")
      .select(
        "id, participant_code, full_name, mobile, age, city, affiliation, cohort, doctor_review_needed, urgent_symptom, contacted, contact_date, follow_up_status, appointment_requested, preferred_contact, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);

    type Enrich = Record<string, {
      products?: string[]; readiness?: string;
      ftnd?: { total: number; category: string };
      nic?: { yes_count: number; category: string };
      followUp?: string;
    }>;

    if (pidFilter !== null) {
      if (pidFilter.length === 0) {
        await logAudit(context.userId, "list", "participants", undefined, { count: 0 });
        return { rows: [] as never[], roles, enrich: {} as Enrich };
      }
      q = q.in("id", pidFilter);
    }
    if (data.search) {
      const s = data.search.trim();
      q = q.or(
        `full_name.ilike.%${s}%,mobile.ilike.%${s}%,participant_code.ilike.%${s}%,city.ilike.%${s}%`,
      );
    }
    if (data.cohort) q = q.eq("cohort", data.cohort as never);
    if (typeof data.doctorReview === "boolean") q = q.eq("doctor_review_needed", data.doctorReview);
    if (data.city) q = q.ilike("city", `%${data.city}%`);
    if (data.affiliation) q = q.ilike("affiliation", `%${data.affiliation}%`);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // Enrich with product/readiness/dependence/follow-up for display
    const ids = (rows ?? []).map((r) => r.id);
    const enrich: Enrich = {};
    if (ids.length > 0) {
      const [pu, rd, cig, nic, fp] = await Promise.all([
        supabaseAdmin.from("product_use").select("participant_id, products").in("participant_id", ids),
        supabaseAdmin.from("readiness_stage").select("participant_id, stage").in("participant_id", ids),
        supabaseAdmin.from("cigarette_dependence_scores").select("participant_id, total_score, category").in("participant_id", ids),
        supabaseAdmin.from("nicotine_control_scores").select("participant_id, yes_count, category").in("participant_id", ids),
        supabaseAdmin.from("follow_up_preferences").select("participant_id, preference").in("participant_id", ids),
      ]);
      for (const id of ids) enrich[id] = {};
      (pu.data ?? []).forEach((r) => { enrich[r.participant_id].products = r.products as string[]; });
      (rd.data ?? []).forEach((r) => { enrich[r.participant_id].readiness = r.stage as string; });
      (cig.data ?? []).forEach((r) => { enrich[r.participant_id].ftnd = { total: r.total_score, category: r.category }; });
      (nic.data ?? []).forEach((r) => { enrich[r.participant_id].nic = { yes_count: r.yes_count, category: r.category }; });
      (fp.data ?? []).forEach((r) => { enrich[r.participant_id].followUp = r.preference; });
    }

    await logAudit(context.userId, "list", "participants", undefined, { count: rows?.length });
    return { rows: rows ?? [], roles, enrich };
  });

export const getParticipant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (roles.length === 0) throw new Error("Forbidden");
    const isPhysician = roles.includes("physician");

    const [participant, consent, products, cig, nic, readiness, risk, cohort, pref, outcome, notes, followups] =
      await Promise.all([
        supabaseAdmin.from("participants").select("*").eq("id", data.id).single(),
        supabaseAdmin.from("consent_records").select("*").eq("participant_id", data.id).maybeSingle(),
        supabaseAdmin.from("product_use").select("*").eq("participant_id", data.id).maybeSingle(),
        supabaseAdmin.from("cigarette_dependence_scores").select("*").eq("participant_id", data.id).maybeSingle(),
        supabaseAdmin.from("nicotine_control_scores").select("*").eq("participant_id", data.id).maybeSingle(),
        supabaseAdmin.from("readiness_stage").select("*").eq("participant_id", data.id).maybeSingle(),
        supabaseAdmin.from("risk_flags").select("*").eq("participant_id", data.id).maybeSingle(),
        supabaseAdmin.from("cohort_assignment").select("*").eq("participant_id", data.id).maybeSingle(),
        supabaseAdmin.from("follow_up_preferences").select("*").eq("participant_id", data.id).maybeSingle(),
        supabaseAdmin.from("outcome_tracking").select("*").eq("participant_id", data.id).maybeSingle(),
        isPhysician
          ? supabaseAdmin.from("clinical_notes").select("*").eq("participant_id", data.id).order("created_at", { ascending: false })
          : Promise.resolve({ data: [] as never[] }),
        supabaseAdmin.from("follow_up_records").select("*").eq("participant_id", data.id).order("created_at", { ascending: false }),
      ]);

    await logAudit(context.userId, "view", "participants", data.id);

    return {
      roles,
      participant: participant.data,
      consent: consent.data,
      products: products.data,
      cigScore: cig.data,
      nicScore: nic.data,
      readiness: readiness.data,
      risk: risk.data,
      cohort: cohort.data,
      preference: pref.data,
      outcome: outcome.data,
      notes: notes.data ?? [],
      followups: followups.data ?? [],
    };
  });

export const updateParticipantReception = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        contacted: z.boolean().optional(),
        contact_date: z.string().nullable().optional(),
        follow_up_status: z.string().nullable().optional(),
        appointment_requested: z.boolean().optional(),
        receptionist_notes: z.string().max(2000).nullable().optional(),
        doctor_review_needed: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (roles.length === 0) throw new Error("Forbidden");
    const { id, ...rest } = data;
    const { error } = await supabaseAdmin.from("participants").update(rest).eq("id", id);
    if (error) throw new Error(error.message);
    await logAudit(context.userId, "update", "participants", id, rest);
    return { ok: true };
  });

export const addClinicalNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        participant_id: z.string().uuid(),
        note: z.string().min(1).max(4000),
        risk_review: z.string().max(500).optional(),
        follow_up_level: z.string().max(80).optional(),
        outcome_status: z.string().max(80).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (!roles.includes("physician")) throw new Error("Forbidden: physician role required");
    const { error } = await supabaseAdmin.from("clinical_notes").insert({
      ...data,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    await logAudit(context.userId, "create", "clinical_notes", data.participant_id);
    return { ok: true };
  });

export const updateOutcome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        participant_id: z.string().uuid(),
        quit_date: z.string().nullable().optional(),
        status_1w: z.string().nullable().optional(),
        status_4w: z.string().nullable().optional(),
        status_12w: z.string().nullable().optional(),
        status_6m: z.string().nullable().optional(),
        status_12m: z.string().nullable().optional(),
        current_product_use: z.string().nullable().optional(),
        abstinent: z.boolean().nullable().optional(),
        reduced_use: z.boolean().nullable().optional(),
        relapsed: z.boolean().nullable().optional(),
        lost_to_follow_up: z.boolean().nullable().optional(),
        co_reading: z.number().nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (!roles.includes("physician")) throw new Error("Forbidden: physician role required");
    const { participant_id, ...rest } = data;
    const { error } = await supabaseAdmin
      .from("outcome_tracking")
      .update(rest)
      .eq("participant_id", participant_id);
    if (error) throw new Error(error.message);
    await logAudit(context.userId, "update", "outcome_tracking", participant_id, rest);
    return { ok: true };
  });

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Array.from(rows.reduce<Set<string>>((s, r) => { Object.keys(r).forEach((k) => s.add(k)); return s; }, new Set()));
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = (typeof v === "object" ? JSON.stringify(v) : String(v)).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

// Light strip: removes direct identifiers only. Used for "anonymized" basic export.
function stripPii<T extends Record<string, unknown>>(r: T): Record<string, unknown> {
  const {
    full_name: _n, mobile: _m, email: _e,
    receptionist_notes: _r, notes: _no,
    ...rest
  } = r as Record<string, unknown>;
  return rest;
}

// Strict strip for research-grade exports:
// drops direct identifiers, free-text notes, exact affiliation, DOB,
// and internal UUIDs. participant_code remains the only linkage key.
function stripPiiStrict<T extends Record<string, unknown>>(r: T): Record<string, unknown> {
  const {
    full_name: _n, mobile: _m, email: _e,
    receptionist_notes: _rn, notes: _no, note: _no2,
    school_university_workplace: _suw,
    affiliation: _aff,
    date_of_birth: _dob,
    contact_date: _cd,
    id: _id, participant_id: _pid,
    created_by: _cb,
    ...rest
  } = r as Record<string, unknown>;
  return rest;
}

// Canonical product types for research exports
const PRODUCT_TYPES = [
  "cigarettes", "vape/e-cigarette", "shisha/hookah",
  "nicotine_pouches", "smokeless_tobacco", "heated_tobacco", "other",
] as const;
type ProductType = typeof PRODUCT_TYPES[number];

function canonicalProduct(raw: string | null | undefined): ProductType {
  const s = (raw ?? "").toLowerCase().trim();
  if (!s) return "other";
  if (/(cigarette|cig\b|smok(e|ing)\s*cig)/.test(s) && !/e-?cig|vape|electronic/.test(s)) return "cigarettes";
  if (/vape|e-?cig|electronic|ecig|pod|mod/.test(s)) return "vape/e-cigarette";
  if (/shisha|hookah|narghile|waterpipe|argile/.test(s)) return "shisha/hookah";
  if (/pouch|snus|zyn/.test(s)) return "nicotine_pouches";
  if (/smokeless|chew|dip|snuff|sweika|shamma/.test(s)) return "smokeless_tobacco";
  if (/heat(ed)?|iqos|hnb|glo|ploom/.test(s)) return "heated_tobacco";
  return "other";
}

// FTND item-score → human label (standard Fagerström wording)
const FTND_LABELS = {
  q1: { 3: "≤5 min", 2: "6–30 min", 1: "31–60 min", 0: ">60 min" } as Record<number, string>,
  q2: { 1: "yes", 0: "no" } as Record<number, string>,
  q3: { 1: "first one in the morning", 0: "any other" } as Record<number, string>,
  q4: { 0: "≤10", 1: "11–20", 2: "21–30", 3: "≥31" } as Record<number, string>,
  q5: { 1: "yes", 0: "no" } as Record<number, string>,
  q6: { 1: "yes", 0: "no" } as Record<number, string>,
};
const ftndLabel = (q: keyof typeof FTND_LABELS, v: number | null | undefined) =>
  v == null ? "not_answered" : (FTND_LABELS[q][v] ?? "unknown");

const yesNo = (v: boolean | null | undefined) =>
  v == null ? "not_answered" : v ? "yes" : "no";

const FOLLOWUP_TIMEPOINTS = ["1w", "4w", "12w", "6m", "12m"] as const;
const FOLLOWUP_LABEL: Record<string, string> = {
  "1w": "1_week", "4w": "4_week", "12w": "12_week", "6m": "6_month", "12m": "12_month",
};


export const exportCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        type: z.enum([
          "full", "anonymized", "cohort", "follow_up_due", "research",
          "baseline", "follow_up_outcomes", "product_use", "youth_nicotine", "city_summary",
          "dependence_items", "readiness_quit_history", "research_consent_only",
          "community_exposure",
        ]),
        cohort: z.string().optional(),
        researchConsentOnly: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (!roles.includes("physician")) throw new Error("Forbidden: physician role required");

    // Per-branch logic decides PII handling; no global flag needed.


    // Resolve participant set based on cohort + research consent filters.
    // We always fetch participant_code so it can serve as the pseudonymous
    // linkage key across every research export.
    let pidQ = supabaseAdmin
      .from("participants")
      .select("id, participant_code")
      .limit(20000);
    if (data.cohort) pidQ = pidQ.eq("cohort", data.cohort as never);
    if (data.researchConsentOnly) pidQ = pidQ.eq("research_consent_status", "given");
    const { data: pidRows } = await pidQ;
    const pids = (pidRows ?? []).map((r) => r.id);
    const codeByPid = new Map<string, string>(
      (pidRows ?? []).map((r) => [r.id, r.participant_code as string]),
    );
    const codeOf = (pid: string | null | undefined) =>
      (pid && codeByPid.get(pid)) || null;
    const PID_SAFE = pids.length ? pids : ["00000000-0000-0000-0000-000000000000"];

    let cleaned: Record<string, unknown>[] = [];

    if (data.type === "city_summary") {
      const { data: rows } = await supabaseAdmin
        .from("participants")
        .select("city, cohort, doctor_review_needed, research_consent_status")
        .in("id", PID_SAFE);
      const agg: Record<string, { city: string; total: number; doctor_review: number; research_consent: number; cohorts: Record<string, number> }> = {};
      for (const r of rows ?? []) {
        const city = (r.city as string) || "(unknown)";
        const a = agg[city] ?? (agg[city] = { city, total: 0, doctor_review: 0, research_consent: 0, cohorts: {} });
        a.total++;
        if (r.doctor_review_needed) a.doctor_review++;
        if (r.research_consent_status === "given") a.research_consent++;
        const c = (r.cohort as string) || "?";
        a.cohorts[c] = (a.cohorts[c] ?? 0) + 1;
      }
      cleaned = Object.values(agg).map((a) => ({ ...a, cohorts: JSON.stringify(a.cohorts) }));
    } else if (data.type === "follow_up_outcomes") {
      // Long format: one row per participant_code per timepoint
      // (baseline + 1w/4w/12w/6m/12m), so analysts can pivot easily.
      const [{ data: ot }, { data: fv }] = await Promise.all([
        supabaseAdmin.from("outcome_tracking").select("*").in("participant_id", PID_SAFE),
        supabaseAdmin.from("follow_up_visits").select("*").in("participant_id", PID_SAFE),
      ]);
      const baselineRows: Record<string, unknown>[] = (ot ?? []).map((r) => ({
        participant_code: codeOf(r.participant_id),
        followup_timepoint: "baseline",
        followup_completed_date: r.baseline_date ?? null,
        quit_date_if_any: r.quit_date ?? null,
        contacted_yes_no: "not_applicable",
        lost_to_followup_yes_no: yesNo(r.lost_to_follow_up as boolean | null),
        abstinent_yes_no: yesNo(r.abstinent as boolean | null),
        reduced_use_yes_no: yesNo(r.reduced_use as boolean | null),
        relapsed_yes_no: yesNo(r.relapsed as boolean | null),
        current_product_use: r.current_product_use ?? "not_answered",
        co_reading_ppm_optional: r.co_reading ?? null,
        withdrawal_severity_0_10: "not_applicable",
        abstinence_duration_days: "not_applicable",
        percent_reduction_estimate: "not_applicable",
        satisfaction_with_support_0_10: "not_applicable",
      }));
      const visitRows: Record<string, unknown>[] = (fv ?? []).map((r) => ({
        participant_code: codeOf(r.participant_id),
        followup_timepoint: FOLLOWUP_LABEL[r.visit_point as string] ?? r.visit_point,
        followup_completed_date: r.visit_date ?? null,
        contacted_yes_no: yesNo(r.contacted as boolean | null),
        lost_to_followup_yes_no: yesNo(r.lost_to_follow_up as boolean | null),
        quit_attempt_made_yes_no: yesNo(r.quit_attempt_made as boolean | null),
        abstinent_yes_no: yesNo(r.abstinent as boolean | null),
        reduced_use_yes_no: yesNo(r.reduced_use as boolean | null),
        relapsed_yes_no: yesNo(r.relapsed as boolean | null),
        current_product_use: r.current_product_use ?? "not_answered",
        current_cigarettes_per_day: r.cigarettes_per_day ?? null,
        current_pouches_per_day: r.pouches_per_day ?? null,
        current_vape_frequency: r.vaping_frequency ?? null,
        craving_severity_0_10: r.craving_0_10 ?? null,
        confidence_to_quit_0_10: r.confidence_0_10 ?? null,
        co_reading_ppm_optional: r.co_reading ?? null,
        withdrawal_severity_0_10: r.withdrawal_severity_0_10 ?? null,
        abstinence_duration_days: r.abstinence_duration_days ?? null,
        percent_reduction_estimate: r.percent_reduction_estimate ?? null,
        satisfaction_with_support_0_10: r.satisfaction_with_support_0_10 ?? null,
      }));
      // Sort: by code, then timepoint order
      const order = ["baseline", ...FOLLOWUP_TIMEPOINTS.map((t) => FOLLOWUP_LABEL[t])];
      cleaned = [...baselineRows, ...visitRows].sort((a, b) => {
        const ca = String(a.participant_code ?? ""); const cb = String(b.participant_code ?? "");
        if (ca !== cb) return ca.localeCompare(cb);
        return order.indexOf(String(a.followup_timepoint)) - order.indexOf(String(b.followup_timepoint));
      });
    } else if (data.type === "dependence_items") {
      // Item-level FTND (cigarette smokers) + Nicotine-Control / Loss-of-Control
      // (vape / pouch / shisha / other non-cigarette nicotine users) + HONC-style.
      const [{ data: cig }, { data: nic }, { data: hon }] = await Promise.all([
        supabaseAdmin.from("cigarette_dependence_scores").select("*").in("participant_id", PID_SAFE),
        supabaseAdmin.from("nicotine_control_scores").select("*").in("participant_id", PID_SAFE),
        supabaseAdmin.from("honc_screening").select("*").in("participant_id", PID_SAFE),
      ]);
      const cigMap = new Map((cig ?? []).map((r) => [r.participant_id, r]));
      const nicMap = new Map((nic ?? []).map((r) => [r.participant_id, r]));
      const honMap = new Map((hon ?? []).map((r) => [r.participant_id, r]));
      const allPids = new Set<string>([
        ...cigMap.keys(), ...nicMap.keys(), ...honMap.keys(),
      ]);
      cleaned = Array.from(allPids).map((pid) => {
        const c = cigMap.get(pid);
        const n = nicMap.get(pid);
        const h = honMap.get(pid);
        const nAns = (n?.answers ?? {}) as Record<string, boolean | null>;
        return {
          participant_code: codeOf(pid),
          // FTND items (raw value = item score in Fagerström scoring)
          ftnd_item_1_time_to_first_cigarette: ftndLabel("q1", c?.q1_time_to_first ?? null),
          ftnd_item_1_score: c?.q1_time_to_first ?? "not_applicable",
          ftnd_item_2_difficulty_refraining: ftndLabel("q2", c?.q2_difficulty_refrain ?? null),
          ftnd_item_2_score: c?.q2_difficulty_refrain ?? "not_applicable",
          ftnd_item_3_hardest_cigarette_to_give_up: ftndLabel("q3", c?.q3_hardest_to_give_up ?? null),
          ftnd_item_3_score: c?.q3_hardest_to_give_up ?? "not_applicable",
          ftnd_item_4_cigarettes_per_day: ftndLabel("q4", c?.q4_cigs_per_day ?? null),
          ftnd_item_4_score: c?.q4_cigs_per_day ?? "not_applicable",
          ftnd_item_5_smoke_more_in_morning: ftndLabel("q5", c?.q5_more_in_morning ?? null),
          ftnd_item_5_score: c?.q5_more_in_morning ?? "not_applicable",
          ftnd_item_6_smoke_when_ill: ftndLabel("q6", c?.q6_smoking_when_ill ?? null),
          ftnd_item_6_score: c?.q6_smoking_when_ill ?? "not_applicable",
          ftnd_total_score: c?.total_score ?? "not_applicable",
          ftnd_category: c?.category ?? "not_applicable",
          // Heaviness of Smoking Index — derived from FTND items q1 + q4
          hsi_time_to_first_cigarette: ftndLabel("q1", c?.q1_time_to_first ?? null),
          hsi_cigarettes_per_day: ftndLabel("q4", c?.q4_cigs_per_day ?? null),
          hsi_score_if_available: c ? (c.q1_time_to_first ?? 0) + (c.q4_cigs_per_day ?? 0) : "not_applicable",
          // Nicotine Control / Loss-of-Control (10 items)
          nic_control_item_1_tried_to_stop_could_not: yesNo(nAns.q1 ?? null),
          nic_control_item_2_strong_cravings: yesNo(nAns.q2 ?? null),
          nic_control_item_3_withdrawal_mood_symptoms: yesNo(nAns.q3 ?? null),
          nic_control_item_4_use_soon_after_waking: yesNo(nAns.q4 ?? null),
          nic_control_item_5_difficult_in_restricted_places: yesNo(nAns.q5 ?? null),
          nic_control_item_6_need_to_concentrate_or_feel_normal: yesNo(nAns.q6 ?? null),
          nic_control_item_7_increased_use_over_time: yesNo(nAns.q7 ?? null),
          nic_control_item_8_continued_despite_health_concern: yesNo(nAns.q8 ?? null),
          nic_control_item_9_feels_addicted_or_controlled: yesNo(nAns.q9 ?? null),
          nic_control_item_10_stopping_feels_difficult: yesNo(nAns.q10 ?? null),
          nicotine_control_score: n?.yes_count ?? "not_applicable",
          nicotine_control_category: n?.category ?? "not_applicable",
          // HONC-style loss-of-autonomy screening
          honc_style_q1_tried_quit_failed: yesNo(h?.q1_tried_quit_failed ?? null),
          honc_style_q2_strong_cravings: yesNo(h?.q2_strong_cravings ?? null),
          honc_style_q3_felt_addicted: yesNo(h?.q3_felt_addicted ?? null),
          honc_style_q4_hard_in_restricted: yesNo(h?.q4_hard_in_restricted ?? null),
          honc_style_q5_withdrawal: yesNo(h?.q5_withdrawal ?? null),
          honc_style_q6_needed_to_feel_normal: yesNo(h?.q6_needed_to_feel_normal ?? null),
          honc_style_q7_increased_use: yesNo(h?.q7_increased_use ?? null),
          honc_style_q8_felt_controlled: yesNo(h?.q8_felt_controlled ?? null),
          honc_style_q9_continued_despite_health: yesNo(h?.q9_continued_despite_health ?? null),
          honc_style_q10_stopping_difficult: yesNo(h?.q10_stopping_difficult ?? null),
          loss_of_autonomy_any_yes: yesNo(h?.any_yes ?? null),
          loss_of_autonomy_positive_count: h?.positive_count ?? "not_applicable",
          honc_category: h?.category ?? "not_applicable",
        };
      });
    } else if (data.type === "readiness_quit_history") {
      const [{ data: rd }, { data: mot }, { data: qh }] = await Promise.all([
        supabaseAdmin.from("readiness_stage").select("*").in("participant_id", PID_SAFE),
        supabaseAdmin.from("motivation_assessment").select("*").in("participant_id", PID_SAFE),
        supabaseAdmin.from("quit_history").select("*").in("participant_id", PID_SAFE),
      ]);
      const rdMap = new Map((rd ?? []).map((r) => [r.participant_id, r]));
      const motMap = new Map((mot ?? []).map((r) => [r.participant_id, r]));
      const qhMap = new Map((qh ?? []).map((r) => [r.participant_id, r]));
      const allPids = new Set<string>([...rdMap.keys(), ...motMap.keys(), ...qhMap.keys()]);
      cleaned = Array.from(allPids).map((pid) => {
        const r = rdMap.get(pid); const m = motMap.get(pid); const q = qhMap.get(pid);
        return {
          participant_code: codeOf(pid),
          readiness_stage: r?.stage ?? "not_answered",
          importance_to_quit_0_10: m?.importance_0_10 ?? "not_answered",
          confidence_to_quit_0_10: m?.confidence_0_10 ?? "not_answered",
          main_reason_for_quitting: m?.main_reason ?? "not_answered",
          main_barriers_multi_select: Array.isArray(m?.barriers) ? (m!.barriers as string[]).join("|") : "not_answered",
          ever_tried_to_quit: yesNo(q?.ever_tried ?? null),
          number_of_quit_attempts: q?.attempts_count ?? "not_answered",
          longest_quit_duration: q?.longest_quit_duration ?? "not_answered",
          quit_methods_used_before: Array.isArray(q?.methods_used) ? (q!.methods_used as string[]).join("|") : "not_answered",
          main_reason_for_relapse: q?.main_relapse_reason ?? "not_answered",
        };
      });
    } else if (data.type === "research_consent_only") {
      // Baseline-shaped export restricted to participants who granted research consent.
      const { data: parts } = await supabaseAdmin
        .from("participants")
        .select("id, participant_code, age, gender, city, affiliation_type, education_level, preferred_language, cohort, cohort_reason, doctor_review_needed, research_consent_status, created_at")
        .eq("research_consent_status", "given")
        .in("id", PID_SAFE)
        .limit(20000);
      cleaned = (parts ?? []).map((p) => {
        const { id: _id, ...keep } = p as Record<string, unknown>;
        return { ...keep, submission_date: keep.created_at };
      });
    } else if (data.type === "product_use") {
      // Research-grade product-use export:
      // one row per participant per canonical product type.
      const [{ data: pud }, { data: cigm }, { data: vapem }, { data: pouchm }, { data: shisham }] = await Promise.all([
        supabaseAdmin.from("product_use_details").select("*").in("participant_id", PID_SAFE),
        supabaseAdmin.from("cigarette_module").select("*").in("participant_id", PID_SAFE),
        supabaseAdmin.from("vape_module").select("*").in("participant_id", PID_SAFE),
        supabaseAdmin.from("pouch_module").select("*").in("participant_id", PID_SAFE),
        supabaseAdmin.from("shisha_module").select("*").in("participant_id", PID_SAFE),
      ]);

      type Row = {
        participant_id: string;
        participant_code: string | null;
        product_type: ProductType;
        ever_use: boolean | null;
        current_use_past_30_days: boolean | null;
        days_used_past_30_days: number | null;
        age_first_use: number | null;
        age_regular_use: number | null;
        main_product_yes_no: "yes" | "no" | null;
        usual_place_of_use: string | null;
        source_of_product: string | null;
        use_at_school_work: boolean | null;
        family_peer_use: boolean | null;
        social_media_ad_exposure: boolean | null;
        quit_interest: string | null;
        created_at: string | null;
      };
      const rowMap = new Map<string, Row>(); // key: participant_id|product_type
      const ensure = (pid: string, pt: ProductType, created_at?: string | null): Row => {
        const key = `${pid}|${pt}`;
        let row = rowMap.get(key);
        if (!row) {
          row = {
            participant_id: pid,
            participant_code: codeOf(pid),
            product_type: pt,
            ever_use: null,
            current_use_past_30_days: null,
            days_used_past_30_days: null,
            age_first_use: null,
            age_regular_use: null,
            main_product_yes_no: null,
            usual_place_of_use: null,
            source_of_product: null,
            use_at_school_work: null,
            family_peer_use: null,
            social_media_ad_exposure: null,
            quit_interest: null,
            created_at: created_at ?? null,
          };
          rowMap.set(key, row);
        }
        if (created_at && !row.created_at) row.created_at = created_at;
        return row;
      };

      for (const d of pud ?? []) {
        const pt = canonicalProduct(d.product as string);
        const r = ensure(d.participant_id, pt, d.created_at as string);
        r.ever_use = (d.ever_use as boolean | null) ?? r.ever_use;
        r.current_use_past_30_days = (d.current_use_30d as boolean | null) ?? r.current_use_past_30_days;
        r.days_used_past_30_days = (d.days_used_30d as number | null) ?? r.days_used_past_30_days;
        r.age_first_use = (d.age_first_use as number | null) ?? r.age_first_use;
        r.age_regular_use = (d.age_regular_use as number | null) ?? r.age_regular_use;
        if (d.is_main_product != null) r.main_product_yes_no = d.is_main_product ? "yes" : "no";
        r.usual_place_of_use = (d.usual_place as string | null) ?? r.usual_place_of_use;
        r.source_of_product = (d.source as string | null) ?? r.source_of_product;
        r.family_peer_use = (d.family_peer_use as boolean | null) ?? r.family_peer_use;
        r.social_media_ad_exposure = (d.ad_exposure as boolean | null) ?? r.social_media_ad_exposure;
      }
      for (const v of vapem ?? []) {
        const r = ensure(v.participant_id, "vape/e-cigarette", v.created_at as string);
        r.days_used_past_30_days = (v.days_30d as number | null) ?? r.days_used_past_30_days;
        if (r.ever_use == null && v.days_30d != null) r.ever_use = (v.days_30d as number) > 0;
        if (r.current_use_past_30_days == null && v.days_30d != null) r.current_use_past_30_days = (v.days_30d as number) > 0;
        if (v.used_at_institution != null) r.use_at_school_work = v.used_at_institution as boolean;
        // Vape-specific extras
        (r as Record<string, unknown>).times_per_day = v.times_per_day ?? null;
        (r as Record<string, unknown>).time_to_first_use_after_waking = v.time_to_first ?? null;
        (r as Record<string, unknown>).device_type = v.device_type ?? null;
        (r as Record<string, unknown>).disposable_or_refillable_or_pod = v.refillable ?? null;
        (r as Record<string, unknown>).nicotine_concentration = v.nicotine_concentration ?? null;
        (r as Record<string, unknown>).flavor_type = v.flavors ?? null;
        (r as Record<string, unknown>).tried_to_stop = yesNo(v.tried_to_stop as boolean | null);
      }
      for (const p of pouchm ?? []) {
        const r = ensure(p.participant_id, "nicotine_pouches", p.created_at as string);
        r.days_used_past_30_days = (p.days_30d as number | null) ?? r.days_used_past_30_days;
        r.source_of_product = (p.source as string | null) ?? r.source_of_product;
        if (r.ever_use == null && p.days_30d != null) r.ever_use = (p.days_30d as number) > 0;
        if (r.current_use_past_30_days == null && p.days_30d != null) r.current_use_past_30_days = (p.days_30d as number) > 0;
        if (p.used_at_institution != null) r.use_at_school_work = p.used_at_institution as boolean;
        // Pouch-specific extras
        (r as Record<string, unknown>).pouches_per_day = p.pouches_per_day ?? null;
        (r as Record<string, unknown>).time_to_first_use_after_waking = p.time_to_first ?? null;
        (r as Record<string, unknown>).nicotine_strength = p.nicotine_strength ?? null;
        (r as Record<string, unknown>).flavor_type = p.flavors ?? null;
        (r as Record<string, unknown>).tried_to_stop = yesNo(p.tried_to_stop as boolean | null);
        (r as Record<string, unknown>).wants_clinician_counseling = yesNo(p.wants_counseling as boolean | null);
      }
      for (const s of shisham ?? []) {
        const r = ensure(s.participant_id, "shisha/hookah", s.created_at as string);
        r.days_used_past_30_days = (s.days_30d as number | null) ?? r.days_used_past_30_days;
        if (r.ever_use == null && s.days_30d != null) r.ever_use = (s.days_30d as number) > 0;
        if (r.current_use_past_30_days == null && s.days_30d != null) r.current_use_past_30_days = (s.days_30d as number) > 0;
        r.usual_place_of_use = (s.setting as string | null) ?? r.usual_place_of_use;
        r.quit_interest = (s.quit_interest as string | null) ?? r.quit_interest;
        // Shisha-specific extras
        (r as Record<string, unknown>).sessions_per_week = s.sessions_per_week ?? null;
        (r as Record<string, unknown>).average_session_duration_minutes = s.avg_session_minutes ?? null;
        (r as Record<string, unknown>).shared_mouthpiece = yesNo(s.shared_mouthpiece as boolean | null);
        (r as Record<string, unknown>).tobacco_or_nicotine_type = s.tobacco_type ?? null;
        (r as Record<string, unknown>).used_with_other_products = yesNo(s.also_uses_other as boolean | null);
      }
      for (const c of cigm ?? []) {
        const r = ensure(c.participant_id, "cigarettes", c.created_at as string);
        if (r.ever_use == null && c.cigarettes_per_day != null) r.ever_use = true;
        (r as Record<string, unknown>).cigarettes_per_day = c.cigarettes_per_day ?? null;
        (r as Record<string, unknown>).time_to_first_use_after_waking = c.time_to_first_cig ?? null;
        (r as Record<string, unknown>).hsi_score = c.hsi_score ?? null;
      }

      // Final shape: drop internal participant_id, expose submission_date,
      // and convert booleans to coded strings for research-grade output.
      cleaned = Array.from(rowMap.values()).map((r) => {
        const { participant_id: _pid, created_at, ever_use, current_use_past_30_days,
          family_peer_use, social_media_ad_exposure, use_at_school_work, ...rest } = r as Record<string, unknown>;
        return {
          submission_date: created_at ?? null,
          ...rest,
          ever_use: yesNo(ever_use as boolean | null),
          current_use_past_30_days: yesNo(current_use_past_30_days as boolean | null),
          use_at_school_university_work: yesNo(use_at_school_work as boolean | null),
          family_member_uses_product: yesNo(family_peer_use as boolean | null),
          social_media_or_ad_exposure: yesNo(social_media_ad_exposure as boolean | null),
        };
      }) as Record<string, unknown>[];
    } else if (data.type === "youth_nicotine") {
      const { data: young } = await supabaseAdmin
        .from("participants").select("id, participant_code, age, city, cohort, research_consent_status")
        .lt("age", 25)
        .in("id", PID_SAFE);
      const youngIds = (young ?? []).map((r) => r.id);
      const YIDS = youngIds.length ? youngIds : ["00000000-0000-0000-0000-000000000000"];
      const [{ data: honc }, { data: nic }] = await Promise.all([
        supabaseAdmin.from("honc_screening").select("*").in("participant_id", YIDS),
        supabaseAdmin.from("nicotine_control_scores")
          .select("participant_id, yes_count, category, youth_flag").in("participant_id", YIDS),
      ]);
      const byId = new Map((young ?? []).map((r) => [r.id, r]));
      const projectBase = (pid: string) => {
        const p = byId.get(pid);
        if (!p) return {};
        return {
          participant_code: p.participant_code,
          age: p.age,
          city: p.city,
          cohort: p.cohort,
          research_consent_status: p.research_consent_status,
        };
      };
      const honcRows: Record<string, unknown>[] = (honc ?? []).map((h) => ({
        ...projectBase(h.participant_id),
        honc_positive_count: h.positive_count,
        honc_category: h.category,
      }));
      const nicRows: Record<string, unknown>[] = (nic ?? []).map((n) => ({
        ...projectBase(n.participant_id),
        nic_yes_count: n.yes_count,
        nic_category: n.category,
        youth_flag: n.youth_flag,
      }));
      cleaned = [...honcRows, ...nicRows];
    } else if (data.type === "baseline") {
      let q = supabaseAdmin
        .from("participants")
        .select("id, participant_code, age, gender, city, affiliation_type, education_level, nationality, preferred_language, cohort, cohort_reason, doctor_review_needed, urgent_symptom, research_consent_status, created_at")
        .order("created_at", { ascending: false }).limit(10000);
      if (data.cohort) q = q.eq("cohort", data.cohort as never);
      if (data.researchConsentOnly) q = q.eq("research_consent_status", "given");
      const { data: parts } = await q;
      const ids = (parts ?? []).map((r) => r.id);
      const IDS_SAFE = ids.length ? ids : ["00000000-0000-0000-0000-000000000000"];
      const [{ data: cig }, { data: nic }, { data: rd }, { data: hon }] = await Promise.all([
        supabaseAdmin.from("cigarette_dependence_scores").select("participant_id, total_score, category").in("participant_id", IDS_SAFE),
        supabaseAdmin.from("nicotine_control_scores").select("participant_id, yes_count, category").in("participant_id", IDS_SAFE),
        supabaseAdmin.from("readiness_stage").select("participant_id, stage").in("participant_id", IDS_SAFE),
        supabaseAdmin.from("honc_screening").select("participant_id, positive_count, category").in("participant_id", IDS_SAFE),
      ]);
      const cigMap = new Map((cig ?? []).map((r) => [r.participant_id, r]));
      const nicMap = new Map((nic ?? []).map((r) => [r.participant_id, r]));
      const rdMap = new Map((rd ?? []).map((r) => [r.participant_id, r]));
      const honMap = new Map((hon ?? []).map((r) => [r.participant_id, r]));
      cleaned = (parts ?? []).map((p) => {
        const { id: _id, ...keep } = p as Record<string, unknown>;
        return {
          ...keep,
          ftnd_total: cigMap.get(p.id)?.total_score ?? null,
          ftnd_category: cigMap.get(p.id)?.category ?? null,
          nic_yes_count: nicMap.get(p.id)?.yes_count ?? null,
          nic_category: nicMap.get(p.id)?.category ?? null,
          readiness: rdMap.get(p.id)?.stage ?? null,
          honc_positive: honMap.get(p.id)?.positive_count ?? null,
          honc_category: honMap.get(p.id)?.category ?? null,
        };
      });
    } else if (data.type === "community_exposure") {
      const { data: ce } = await supabaseAdmin
        .from("community_exposure").select("*").in("participant_id", PID_SAFE);
      const NA = (v: unknown) => (v == null || v === "" ? "not_answered" : v);
      cleaned = (ce ?? []).map((r) => ({
        participant_code: codeOf(r.participant_id),
        submission_date: r.created_at,
        family_smoking_exposure: NA(r.family_smoking_exposure),
        close_friend_smoking_or_nicotine_use: NA(r.close_friend_smoking_or_nicotine_use),
        secondhand_smoke_exposure_home: NA(r.secondhand_smoke_exposure_home),
        secondhand_smoke_exposure_public_places: NA(r.secondhand_smoke_exposure_public_places),
        seen_tobacco_or_nicotine_ads_social_media: NA(r.seen_tobacco_or_nicotine_ads_social_media),
        seen_tobacco_or_nicotine_ads_shops: NA(r.seen_tobacco_or_nicotine_ads_shops),
        influencer_or_online_promotion_exposure: NA(r.influencer_or_online_promotion_exposure),
        easy_access_to_products: NA(r.easy_access_to_products),
        main_source_of_products: NA(r.main_source_of_products),
        online_purchase_or_delivery_exposure: NA(r.online_purchase_or_delivery_exposure),
        purchase_attempt_underage_if_applicable: NA(r.purchase_attempt_underage_if_applicable),
      }));
    } else {
      // full / anonymized / cohort / follow_up_due / research
      const isAnon = data.type === "anonymized" || data.type === "research";
      const cols: string = isAnon
        ? "participant_code, age, gender, city, affiliation_type, education_level, nationality, preferred_language, cohort, cohort_reason, doctor_review_needed, urgent_symptom, research_consent_status, created_at"
        : "participant_code, full_name, mobile, email, age, gender, city, affiliation, affiliation_type, education_level, preferred_language, preferred_contact, cohort, cohort_reason, doctor_review_needed, urgent_symptom, contacted, contact_date, follow_up_status, appointment_requested, research_consent_status, created_at";
      let q = supabaseAdmin
        .from("participants")
        .select(cols as never)
        .order("created_at", { ascending: false }).limit(10000);
      if (data.type === "cohort" && data.cohort) q = q.eq("cohort", data.cohort as never);
      if (data.type === "follow_up_due") q = q.eq("contacted", false);
      if (data.researchConsentOnly || data.type === "research") q = q.eq("research_consent_status", "given");
      const { data: rows, error } = await q;
      if (error) throw new Error(error.message);
      cleaned = (rows ?? []).map((r) =>
        isAnon ? stripPiiStrict(r as unknown as Record<string, unknown>) : (r as unknown as Record<string, unknown>),
      );
    }


    const csv = toCsv(cleaned);

    await supabaseAdmin.from("export_logs").insert({
      user_id: context.userId,
      export_type: data.type,
      row_count: cleaned.length,
      filters: { cohort: data.cohort ?? null, researchConsentOnly: data.researchConsentOnly ?? false } as never,
    });
    await logAudit(context.userId, "export", "participants", undefined, { type: data.type, count: cleaned.length });

    // Lookup who ran the export
    const { data: userInfo } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const generatedBy = userInfo?.user?.email ?? context.userId;
    await sendAdminNotification(
      "csv_export_alert",
      `Aqla export generated — ${data.type}`,
      `<h2 style="font-family:-apple-system,Segoe UI,Arial,sans-serif">Aqla CSV export</h2>${renderKeyValueHtml({
        export_type: data.type,
        generated_by: generatedBy,
        generated_at: new Date().toISOString(),
        research_consent_only: data.researchConsentOnly ? "yes" : "no",
        cohort_filter: data.cohort ?? null,
        estimated_row_count: cleaned.length,
      })}<p style="font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:12px;color:#666">CSV file not attached. Download from the admin dashboard.</p>`,
      { export_type: data.type, staff_email: generatedBy },
    );

    return { csv, filename: `aqla_${data.type}_${new Date().toISOString().slice(0, 10)}.csv` };
  });

export const addFollowUpVisit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        participant_id: z.string().uuid(),
        visit_point: z.enum(["1w", "4w", "12w", "6m", "12m"]),
        visit_date: z.string().optional(),
        contacted: z.boolean().optional(),
        lost_to_follow_up: z.boolean().optional(),
        quit_attempt_made: z.boolean().optional(),
        abstinent: z.boolean().optional(),
        reduced_use: z.boolean().optional(),
        relapsed: z.boolean().optional(),
        current_product_use: z.string().max(120).optional(),
        cigarettes_per_day: z.number().int().min(0).max(200).optional(),
        pouches_per_day: z.number().int().min(0).max(100).optional(),
        vaping_frequency: z.string().max(60).optional(),
        craving_0_10: z.number().int().min(0).max(10).optional(),
        confidence_0_10: z.number().int().min(0).max(10).optional(),
        co_reading: z.number().min(0).max(100).optional(),
        withdrawal_severity_0_10: z.number().int().min(0).max(10).optional(),
        abstinence_duration_days: z.number().int().min(0).max(3650).optional(),
        percent_reduction_estimate: z.number().int().min(0).max(100).optional(),
        satisfaction_with_support_0_10: z.number().int().min(0).max(10).optional(),
        notes: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (!roles.includes("physician")) throw new Error("Forbidden: physician role required");
    const { error } = await supabaseAdmin.from("follow_up_visits").insert({
      ...data,
      created_by: context.userId,
    });
    if (error) throw new Error(error.message);
    await logAudit(context.userId, "create", "follow_up_visits", data.participant_id, { visit_point: data.visit_point });

    const { data: pInfo } = await supabaseAdmin
      .from("participants")
      .select("participant_code")
      .eq("id", data.participant_id)
      .maybeSingle();
    const { data: userInfo } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    const staffEmail = userInfo?.user?.email ?? context.userId;
    const pcode = (pInfo?.participant_code as string | undefined) ?? data.participant_id;
    await sendAdminNotification(
      "follow_up_visit",
      `Aqla follow-up visit logged — ${pcode}`,
      `<h2 style="font-family:-apple-system,Segoe UI,Arial,sans-serif">Aqla follow-up visit</h2>${renderKeyValueHtml({
        participant_code: pcode,
        followup_timepoint: data.visit_point,
        followup_completed_at: data.visit_date ?? new Date().toISOString(),
        contacted_yes_no: data.contacted,
        quit_attempt_made_yes_no: data.quit_attempt_made,
        abstinent_yes_no: data.abstinent,
        reduced_use_yes_no: data.reduced_use,
        relapsed_yes_no: data.relapsed,
        current_product_use: data.current_product_use,
        cigarettes_per_day: data.cigarettes_per_day,
        vaping_frequency: data.vaping_frequency,
        pouches_per_day: data.pouches_per_day,
        craving_0_10: data.craving_0_10,
        withdrawal_severity_0_10: data.withdrawal_severity_0_10,
        confidence_0_10: data.confidence_0_10,
        satisfaction_with_support_0_10: data.satisfaction_with_support_0_10,
        co_reading: data.co_reading,
        logged_by_staff: staffEmail,
      })}`,
      { participant_code: pcode, staff_email: staffEmail },
    );

    return { ok: true };
  });

export const getDashboardStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const roles = await getRoles(context.userId);
    if (roles.length === 0) throw new Error("Forbidden");

    const { data: rows } = await supabaseAdmin
      .from("participants")
      .select("cohort, doctor_review_needed, contacted, appointment_requested, created_at, follow_up_status")
      .limit(10000);

    const list = rows ?? [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const stats = {
      total: list.length,
      today: list.filter((r) => new Date(r.created_at) >= today).length,
      doctorReview: list.filter((r) => r.doctor_review_needed).length,
      contacted: list.filter((r) => r.contacted).length,
      pending: list.filter((r) => !r.contacted).length,
      appointments: list.filter((r) => r.appointment_requested).length,
      byCohort: list.reduce<Record<string, number>>((acc, r) => {
        const k = r.cohort ?? "?"; acc[k] = (acc[k] ?? 0) + 1; return acc;
      }, {}),
    };
    return { stats, roles };
  });

// ---- Notification log: admin-only test + recent log viewer ----

async function requireAdmin(userId: string) {
  const roles = await getRoles(userId);
  if (roles.length === 0) throw new Error("Forbidden: admin role required");
}

export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    await sendAdminNotification(
      "staff_login",
      "Aqla notification test",
      `<p style="font-family:-apple-system,Segoe UI,Arial,sans-serif">This is a safe test email from Aqla. No real participant data included.</p>`,
      { staff_email: "smokefreeksa@gmail.com" },
    );
    const { data } = await supabaseAdmin
      .from("notification_log")
      .select("sent_status, error_message, provider_response")
      .eq("subject", "Aqla notification test")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { ok: data?.sent_status === "sent", result: data };
  });

export const listRecentNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("notification_log")
      .select("id, event_type, recipient_email, sent_status, provider_response, error_message, created_at, subject")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw new Error(error.message);
    return { rows: data ?? [] };
  });
