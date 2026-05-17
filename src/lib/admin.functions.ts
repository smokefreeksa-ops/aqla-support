import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

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

export const exportCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        type: z.enum(["full", "anonymized", "cohort", "follow_up_due", "research"]),
        cohort: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const roles = await getRoles(context.userId);
    if (!roles.includes("physician")) throw new Error("Forbidden: physician role required");

    let q = supabaseAdmin
      .from("participants")
      .select(
        "participant_code, full_name, mobile, email, age, gender, city, affiliation, preferred_language, preferred_contact, cohort, cohort_reason, doctor_review_needed, urgent_symptom, contacted, contact_date, follow_up_status, appointment_requested, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(10000);

    if (data.type === "cohort" && data.cohort) q = q.eq("cohort", data.cohort as never);
    if (data.type === "follow_up_due") q = q.eq("contacted", false);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const anonymize = data.type === "anonymized" || data.type === "research";
    const cleaned = (rows ?? []).map((r) => {
      if (anonymize) {
        const { full_name: _n, mobile: _m, email: _e, ...rest } = r as Record<string, unknown>;
        return rest;
      }
      return r;
    });

    const headers = cleaned.length ? Object.keys(cleaned[0] as object) : [];
    const escape = (v: unknown) => {
      if (v == null) return "";
      const s = String(v).replace(/"/g, '""');
      return /[",\n]/.test(s) ? `"${s}"` : s;
    };
    const csv = [
      headers.join(","),
      ...cleaned.map((row) => headers.map((h) => escape((row as Record<string, unknown>)[h])).join(",")),
    ].join("\n");

    await supabaseAdmin.from("export_logs").insert({
      user_id: context.userId,
      export_type: data.type,
      row_count: cleaned.length,
      filters: { cohort: data.cohort ?? null } as never,
    });
    await logAudit(context.userId, "export", "participants", undefined, { type: data.type, count: cleaned.length });

    return { csv, filename: `aqla_${data.type}_${new Date().toISOString().slice(0, 10)}.csv` };
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
