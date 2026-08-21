// Server functions: persist results, schedule follow-ups, fetch result.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildPlan } from "./plan-builder";
import {
  classifyDependence,
  classifyReadiness,
  computeAqlaIntensity,
  computeHSI,
  requiresReferral,
  topTriggerPatterns,
} from "./scoring";
import type { EngineAnswers } from "./types";

const AnswersSchema = z.object({
  email: z.string().email().max(255).optional().nullable(),
  user_name: z.string().max(120).optional().nullable(),
  support_person_name: z.string().max(120).optional().nullable(),
  product_types: z.array(z.string()).min(1).max(10),
  primary_product: z.string().optional().nullable(),
  mixed_use: z.boolean(),
  relapse_prevention_mode: z.boolean(),
  first_use_after_waking: z.string().optional().nullable(),
  cigarettes_per_day: z.string().optional().nullable(),
  shisha_sessions_per_week: z.string().optional().nullable(),
  shisha_session_duration: z.string().optional().nullable(),
  vape_pattern: z.string().optional().nullable(),
  nicotine_pouch_frequency: z.string().optional().nullable(),
  triggers: z.array(z.string()).max(20),
  importance_score: z.number().int().min(0).max(10),
  confidence_score: z.number().int().min(0).max(10),
  readiness_score: z.number().int().min(0).max(10),
  previous_quit_attempts: z.string().optional().nullable(),
  longest_abstinence: z.string().optional().nullable(),
  relapse_causes: z.array(z.string()).max(15),
  safety_flags: z.array(z.string()).max(15),
  personal_reasons: z.array(z.string()).max(3),
});

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  if (!apiKey) return { ok: false, error: "EMAIL_PROVIDER_API_KEY not configured" };
  const from = process.env.EMAIL_FROM_ADDRESS || "Aqla <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export const submitQuitEngine = createServerFn({ method: "POST" })
  .inputValidator((data: { answers: EngineAnswers; sessionId?: string }) => {
    AnswersSchema.parse(data.answers);
    return data;
  })
  .handler(async ({ data }) => {
    const a = data.answers;
    const intensity = computeAqlaIntensity(a);
    const hsi = computeHSI(a);
    const dep = classifyDependence(a, intensity);
    const ready = classifyReadiness(a);
    const patterns = topTriggerPatterns(a);
    const referral = requiresReferral(a) || dep === "high"|| dep === "complex_mixed";
    const plan = buildPlan(a);

    const { data: inserted, error } = await supabaseAdmin
      .from("aqla_quit_engine_results")
      .insert({
        session_id: data.sessionId ?? null,
        email: a.email ?? null,
        user_name: a.user_name ?? null,
        support_person_name: a.support_person_name ?? null,
        product_types: a.product_types,
        primary_product: a.primary_product ?? a.product_types[0] ?? null,
        mixed_use: a.mixed_use,
        relapse_prevention_mode: a.relapse_prevention_mode,
        first_use_after_waking: a.first_use_after_waking ?? null,
        cigarettes_per_day: a.cigarettes_per_day ?? null,
        shisha_sessions_per_week: a.shisha_sessions_per_week ?? null,
        shisha_session_duration: a.shisha_session_duration ?? null,
        vape_pattern: a.vape_pattern ?? null,
        nicotine_pouch_frequency: a.nicotine_pouch_frequency ?? null,
        triggers: a.triggers,
        importance_score: a.importance_score,
        confidence_score: a.confidence_score,
        readiness_score: a.readiness_score,
        readiness_category: ready,
        previous_quit_attempts: a.previous_quit_attempts ?? null,
        longest_abstinence: a.longest_abstinence ?? null,
        relapse_causes: a.relapse_causes,
        safety_flags: a.safety_flags,
        personal_reasons: a.personal_reasons,
        hsi_score: hsi ?? null,
        aqla_intensity_score: intensity,
        dependence_category: dep,
        primary_trigger_pattern: patterns[0] ?? null,
        secondary_trigger_pattern: patterns[1] ?? null,
        referral_needed: referral,
        result_json: plan,
      } as never)
      .select("id")
      .single();
    if (error || !inserted) throw new Error(error?.message ?? "insert failed");

    const resultId = (inserted as { id: string }).id;

    // Schedule follow-ups (3, 7, 30 days)
    const now = Date.now();
    const followups = plan.follow_up_schedule.map((f) => ({
      result_id: resultId,
      followup_type: f.type,
      scheduled_at: new Date(now + f.offset_days * 86400000).toISOString(),
      status: "scheduled",
    }));
    await supabaseAdmin.from("aqla_quit_engine_followups").insert(followups as never);

    // Email user (best effort)
    let emailDelivered = false;
    if (a.email) {
      const html = `<div dir="rtl"style="font-family:Tajawal,Cairo,Arial,sans-serif">
        <h2>خطتك الشخصية للإقلاع جاهزة</h2>
        <p>${plan.human_explanation}</p>
        <p>يمكنك مراجعة الخطة الكاملة عبر الرابط أدناه وتنزيلها كملف PDF.</p>
      </div>`;
      const r = await sendEmail(a.email, "خطة إقلاعك الشخصية — أقلع", html);
      emailDelivered = r.ok;
      await supabaseAdmin.from("aqla_quit_engine_email_logs").insert({
        result_id: resultId,
        recipient_type: "user",
        email: a.email,
        subject: "خطة إقلاعك الشخصية — أقلع",
        status: r.ok ? "sent": "failed",
        error_message: r.error ?? null,
      } as never);
    }

    // Admin summary (privacy-safe)
    const adminHtml = `<div style="font-family:Arial">
      <h3>Aqla Quit Engine — new result</h3>
      <ul>
        <li>Date: ${new Date().toISOString()}</li>
        <li>Primary product: ${a.primary_product ?? a.product_types[0]}</li>
        <li>Mixed use: ${a.mixed_use ? "yes": "no"}</li>
        <li>Dependence: ${dep}</li>
        <li>Readiness: ${ready}</li>
        <li>Referral needed: ${referral ? "yes": "no"}</li>
        <li>Top triggers: ${patterns.slice(0, 3).join(", ")}</li>
        <li>Result ID: ${resultId}</li>
      </ul>
    </div>`;
    const adminRes = await sendEmail("smokefreeksa@gmail.com", "Aqla Quit Engine — new result", adminHtml);
    await supabaseAdmin.from("aqla_quit_engine_email_logs").insert({
      result_id: resultId,
      recipient_type: "admin",
      email: "smokefreeksa@gmail.com",
      subject: "Aqla Quit Engine — new result",
      status: adminRes.ok ? "sent": "failed",
      error_message: adminRes.error ?? null,
    } as never);

    await supabaseAdmin
      .from("aqla_quit_engine_results")
      .update({ email_sent: emailDelivered, admin_notified: adminRes.ok } as never)
      .eq("id", resultId);

    return { resultId, emailDelivered, plan };
  });

export const getQuitEngineResult = createServerFn({ method: "GET" })
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("aqla_quit_engine_results")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Not found");
    return row;
  });

export const getQuitEngineAdminStats = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: rows } = await supabaseAdmin
      .from("aqla_quit_engine_results")
      .select("product_types,mixed_use,triggers,importance_score,confidence_score,readiness_category,referral_needed,dependence_category,personal_reasons");
    const list = (rows ?? []) as Array<{
      product_types: string[];
      mixed_use: boolean;
      triggers: string[];
      importance_score: number | null;
      confidence_score: number | null;
      readiness_category: string | null;
      referral_needed: boolean;
      dependence_category: string | null;
    }>;
    const total = list.length;
    const productCounts: Record<string, number> = {};
    const triggerCounts: Record<string, number> = {};
    const depCounts: Record<string, number> = {};
    let mixed = 0, referrals = 0, importanceSum = 0, confidenceSum = 0, importanceN = 0, confidenceN = 0;
    for (const r of list) {
      for (const p of r.product_types ?? []) productCounts[p] = (productCounts[p] ?? 0) + 1;
      for (const t of r.triggers ?? []) triggerCounts[t] = (triggerCounts[t] ?? 0) + 1;
      if (r.dependence_category) depCounts[r.dependence_category] = (depCounts[r.dependence_category] ?? 0) + 1;
      if (r.mixed_use) mixed++;
      if (r.referral_needed) referrals++;
      if (typeof r.importance_score === "number") { importanceSum += r.importance_score; importanceN++; }
      if (typeof r.confidence_score === "number") { confidenceSum += r.confidence_score; confidenceN++; }
    }
    const { count: followups3 } = await supabaseAdmin
      .from("aqla_quit_engine_followups")
      .select("*", { count: "exact", head: true })
      .eq("followup_type", "day_3");
    const { count: followups7 } = await supabaseAdmin
      .from("aqla_quit_engine_followups")
      .select("*", { count: "exact", head: true })
      .eq("followup_type", "day_7");
    const { count: followups30 } = await supabaseAdmin
      .from("aqla_quit_engine_followups")
      .select("*", { count: "exact", head: true })
      .eq("followup_type", "day_30");
    return {
      total_completed: total,
      product_counts: productCounts,
      mixed_use_count: mixed,
      mixed_use_pct: total ? Math.round((mixed / total) * 100) : 0,
      trigger_counts: triggerCounts,
      avg_importance: importanceN ? +(importanceSum / importanceN).toFixed(1) : 0,
      avg_confidence: confidenceN ? +(confidenceSum / confidenceN).toFixed(1) : 0,
      referral_needed_count: referrals,
      referral_needed_pct: total ? Math.round((referrals / total) * 100) : 0,
      dependence_counts: depCounts,
      followups: { day_3: followups3 ?? 0, day_7: followups7 ?? 0, day_30: followups30 ?? 0 },
    };
  });
