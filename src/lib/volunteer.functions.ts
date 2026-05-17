import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { sendAdminNotification, renderKeyValueHtml } from "./notifications.server";

const INTERESTS = [
  "awareness_campaigns",
  "smoker_support",
  "data_entry",
  "follow_up_coordination",
  "content_creation",
  "events",
] as const;

const STATUSES = [
  "new_applicant",
  "awaiting_review",
  "accepted_for_training",
  "in_training",
  "active_volunteer",
  "needs_follow_up",
  "not_accepted",
] as const;

export const submitVolunteer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z
      .object({
        full_name: z.string().min(2).max(120),
        mobile: z.string().min(6).max(30),
        email: z.string().email().max(160).optional().nullable(),
        age: z.number().int().min(14).max(100).optional().nullable(),
        gender: z.string().max(20).optional().nullable(),
        city: z.string().max(80).optional().nullable(),
        affiliation: z.string().max(160).optional().nullable(),
        academic_level: z.string().max(80).optional().nullable(),
        preferred_language: z.enum(["ar", "en"]),
        preferred_contact: z.enum(["whatsapp", "sms", "phone", "email"]),
        motivation: z.string().max(2000).optional().nullable(),
        prior_awareness_work: z.boolean().optional().nullable(),
        smoking_status: z.enum(["smoker", "former_smoker", "non_smoker"]).optional().nullable(),
        availability: z.string().max(500).optional().nullable(),
        interests: z.array(z.enum(INTERESTS)).min(1).max(INTERESTS.length),
        screening: z.object({
          agree_professional_boundaries: z.literal(true),
          understand_no_medical_advice: z.literal(true),
          agree_clinical_referral: z.literal(true),
          agree_complete_training: z.literal(true),
        }),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { interests, screening, ...app } = data;
    const { data: created, error } = await supabaseAdmin
      .from("volunteer_applications")
      .insert(app as never)
      .select("id, application_code")
      .single();
    if (error || !created) throw new Error(error?.message ?? "Failed to create application");

    if (interests.length) {
      const { error: iErr } = await supabaseAdmin
        .from("volunteer_interests")
        .insert(interests.map((i) => ({ application_id: created.id, interest: i })) as never);
      if (iErr) throw new Error(iErr.message);
    }
    const { error: sErr } = await supabaseAdmin
      .from("volunteer_screening")
      .insert({ application_id: created.id, ...screening } as never);
    if (sErr) throw new Error(sErr.message);

    await supabaseAdmin.from("volunteer_status_history").insert({
      application_id: created.id,
      status: "new_applicant",
      reason: "initial submission",
    } as never);

    void sendAdminNotification(
      "full_volunteer_application",
      `Aqla volunteer application submitted — ${created.application_code}`,
      `<h2 style="font-family:-apple-system,Segoe UI,Arial,sans-serif">Aqla volunteer application</h2>${renderKeyValueHtml({
        volunteer_code: created.application_code,
        submitted_at: new Date().toISOString(),
        full_name: app.full_name,
        mobile: app.mobile,
        email: app.email,
        age: app.age,
        city: app.city,
        affiliation: app.affiliation,
        academic_level: app.academic_level,
        preferred_language: app.preferred_language,
        preferred_contact: app.preferred_contact,
        interests,
        prior_awareness_work: app.prior_awareness_work,
        smoking_status: app.smoking_status,
        availability: app.availability,
        motivation: app.motivation,
        screening,
        volunteer_status: "new_applicant",
      })}`,
      { volunteer_code: created.application_code },
    );

    return { id: created.id, code: created.application_code };
  });

async function ensureStaff(userId: string) {
  const { data } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (roles.length === 0) throw new Error("Forbidden");
  return roles;
}

export const listVolunteers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        search: z.string().optional(),
        status: z.string().optional(),
        city: z.string().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    const roles = await ensureStaff(context.userId);
    let q = supabaseAdmin
      .from("volunteer_applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.search) {
      const s = data.search.trim();
      q = q.or(
        `full_name.ilike.%${s}%,mobile.ilike.%${s}%,application_code.ilike.%${s}%,city.ilike.%${s}%,affiliation.ilike.%${s}%`,
      );
    }
    if (data.status) q = q.eq("status", data.status as never);
    if (data.city) q = q.ilike("city", `%${data.city}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    // attach interests
    const ids = (rows ?? []).map((r) => r.id);
    let interests: Record<string, string[]> = {};
    if (ids.length) {
      const { data: i } = await supabaseAdmin
        .from("volunteer_interests")
        .select("application_id, interest")
        .in("application_id", ids);
      for (const row of i ?? []) {
        const key = row.application_id as string;
        (interests[key] ||= []).push(row.interest as string);
      }
    }
    return { rows: rows ?? [], roles, interests };
  });

export const getVolunteerStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureStaff(context.userId);
    const { data: rows } = await supabaseAdmin
      .from("volunteer_applications")
      .select("status, city, affiliation, contacted, created_at")
      .limit(10000);
    const { data: ints } = await supabaseAdmin
      .from("volunteer_interests")
      .select("interest");
    const list = rows ?? [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const count = <T extends string>(arr: { [k: string]: unknown }[], key: string) =>
      arr.reduce<Record<string, number>>((acc, r) => {
        const k = (r[key] as T) ?? "?"; acc[k] = (acc[k] ?? 0) + 1; return acc;
      }, {});
    return {
      stats: {
        total: list.length,
        today: list.filter((r) => new Date(r.created_at as string) >= today).length,
        contacted: list.filter((r) => r.contacted).length,
        pending: list.filter((r) => !r.contacted).length,
        byStatus: count(list as never, "status"),
        byCity: count(list as never, "city"),
        byAffiliation: count(list as never, "affiliation"),
        byInterest: (ints ?? []).reduce<Record<string, number>>((a, r) => {
          const k = r.interest as string; a[k] = (a[k] ?? 0) + 1; return a;
        }, {}),
      },
    };
  });

export const updateVolunteer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(STATUSES).optional(),
        contacted: z.boolean().optional(),
        contact_date: z.string().nullable().optional(),
        reason: z.string().max(500).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureStaff(context.userId);
    const { id, reason, ...rest } = data;
    if (Object.keys(rest).length) {
      const { error } = await supabaseAdmin.from("volunteer_applications").update(rest as never).eq("id", id);
      if (error) throw new Error(error.message);
    }
    if (data.status) {
      await supabaseAdmin.from("volunteer_status_history").insert({
        application_id: id,
        status: data.status,
        changed_by: context.userId,
        reason: reason ?? null,
      } as never);
    }
    return { ok: true };
  });

export const addVolunteerNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ application_id: z.string().uuid(), note: z.string().min(1).max(4000) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    await ensureStaff(context.userId);
    const { error } = await supabaseAdmin
      .from("volunteer_notes")
      .insert({ ...data, created_by: context.userId } as never);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getVolunteer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    await ensureStaff(context.userId);
    const [app, interests, screening, notes, training, history] = await Promise.all([
      supabaseAdmin.from("volunteer_applications").select("*").eq("id", data.id).single(),
      supabaseAdmin.from("volunteer_interests").select("interest").eq("application_id", data.id),
      supabaseAdmin.from("volunteer_screening").select("*").eq("application_id", data.id).maybeSingle(),
      supabaseAdmin.from("volunteer_notes").select("*").eq("application_id", data.id).order("created_at", { ascending: false }),
      supabaseAdmin.from("volunteer_training_records").select("*").eq("application_id", data.id).order("assigned_at", { ascending: false }),
      supabaseAdmin.from("volunteer_status_history").select("*").eq("application_id", data.id).order("created_at", { ascending: false }),
    ]);
    return {
      application: app.data,
      interests: (interests.data ?? []).map((r) => r.interest),
      screening: screening.data,
      notes: notes.data ?? [],
      training: training.data ?? [],
      history: history.data ?? [],
    };
  });
