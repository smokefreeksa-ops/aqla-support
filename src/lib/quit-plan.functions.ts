import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  buildQuitPlan,
  computeScore,
  type QuitPlanIntake,
  type QuitPlanJSON,
} from "./quit-plan-builder";

const ADMIN_EMAIL = "smokefreeksa@gmail.com";
const SITE_URL = "https://aqla-support.lovable.app";

function randomToken(): string {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 32);
}

function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function emailConfig() {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS;
  if (!apiKey || !from) {
    return {
      ok: false as const,
      error: !apiKey && !from
        ? "EMAIL_PROVIDER_API_KEY and EMAIL_FROM_ADDRESS not configured"
        : !apiKey
          ? "EMAIL_PROVIDER_API_KEY not configured"
          : "EMAIL_FROM_ADDRESS not configured",
    };
  }
  return { ok: true as const, apiKey, from };
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ sent: boolean; error: string | null }> {
  const cfg = emailConfig();
  if (!cfg.ok) return { sent: false, error: cfg.error };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: cfg.from, to: [to], subject, html }),
    });
    const body = await res.text().catch(() => "");
    if (!res.ok) return { sent: false, error: `HTTP ${res.status}${body ? ` — ${body}` : ""}`.slice(0, 1000) };
    return { sent: true, error: null };
  } catch (e) {
    return { sent: false, error: ((e as Error).message || "Email provider request failed").slice(0, 1000) };
  }
}

async function logPlanEmail(input: {
  quitPlanId: string;
  recipientType: "user" | "admin";
  email: string;
  subject: string;
  sent: boolean;
  error: string | null;
}) {
  await supabaseAdmin.from("quit_plan_emails").insert({
    quit_plan_id: input.quitPlanId,
    recipient_type: input.recipientType,
    email: input.email,
    subject: input.subject,
    status: input.sent ? "sent" : input.error?.includes("not configured") ? "pending_provider_setup" : "failed",
    error_message: input.error,
  });
}

function listHtml(items: string[]): string {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function userPlanEmailHtml(plan: QuitPlanJSON, planUrl: string): string {
  const refsList = plan.references.map((r, i) => `<li>${i + 1}. ${escapeHtml(r.full)}</li>`).join("");
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.85;color:#1f2933;max-width:720px;margin:auto;background:#fff">
    <h1 style="color:#0b6e4f;font-size:22px;margin:0 0 6px">${escapeHtml(plan.title)}</h1>
    <p style="color:#556;margin:0 0 18px">السلام عليكم ${escapeHtml(plan.identity.nickname)}، تم إنشاء خطتك الشخصية في أقلع بناءً على إجاباتك.</p>
    <table style="border-collapse:collapse;width:100%;margin:12px 0;background:#fafafa">
      <tr><td style="padding:8px;border:1px solid #e5e7eb"><b>المدينة</b></td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(plan.identity.city)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e5e7eb"><b>المنتج</b></td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(plan.use.product_ar)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e5e7eb"><b>أداة التقييم</b></td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(plan.assessment.instrument_label_ar)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e5e7eb"><b>نطاق النتيجة</b></td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(plan.assessment.band_ar)} — ${escapeHtml(plan.score_meaning)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e5e7eb"><b>الهدف</b></td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(plan.goal.label_ar)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e5e7eb"><b>تاريخ البداية</b></td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(plan.dates.quit_or_reduce_date ?? "—")}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e5e7eb"><b>المتابعة القادمة</b></td><td style="padding:8px;border:1px solid #e5e7eb">${escapeHtml(plan.dates.followup_next)}</td></tr>
    </table>
    <h2 style="color:#0b6e4f;font-size:16px;margin-top:18px">محفزاتك الأساسية</h2><ul>${listHtml(plan.triggers)}</ul>
    <h2 style="color:#0b6e4f;font-size:16px;margin-top:18px">خطة التعامل مع المحفزات</h2><ul>${listHtml(plan.trigger_plan)}</ul>
    <h2 style="color:#0b6e4f;font-size:16px;margin-top:18px">خطة الرغبة الشديدة</h2><ul>${listHtml(plan.craving_rescue)}</ul>
    <p style="margin:22px 0"><a href="${planUrl}" style="background:#0b6e4f;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold">عرض الخطة الكاملة وتحميل خطة أقلع PDF</a></p>
    <p style="color:#667085;font-size:12px">إذا لم يعمل الزر، انسخ الرابط: ${planUrl}</p>
    <div style="background:#fff7e6;border:1px solid #f0c36a;border-radius:6px;padding:10px;margin-top:14px;font-size:12px;color:#7a4b00">${escapeHtml(plan.pharmacy_discussion.intro)}</div>
    <div style="background:#fdecea;border-radius:6px;padding:10px;color:#8a1a1a;font-size:12px;margin-top:12px">${escapeHtml(plan.emergency_disclaimer)}</div>
    <h2 style="color:#0b6e4f;font-size:16px;margin-top:18px">المراجع</h2><ol style="font-size:12px;color:#444;padding-inline-start:18px">${refsList}</ol>
  </div>`;
}

function adminPlanEmailHtml(plan: QuitPlanJSON, intake: QuitPlanIntake, planId: string, planUrl: string): string {
  const rows: Record<string, unknown> = {
    "name/nickname": intake.nickname,
    email: intake.email,
    city: intake.city,
    "product type": plan.use.product_ar,
    "assessment tool": plan.assessment.instrument_label_ar,
    "score band": `${plan.assessment.band_ar} (${plan.assessment.band})`,
    "validated": plan.assessment.validated,
    "risk flag": plan.assessment.risk_flag,
    goal: plan.goal.label_ar,
    "quit/reduction date": plan.dates.quit_or_reduce_date ?? "—",
    "follow-up preference": plan.followup_preference_ar,
    "plan link": planUrl,
    "created date": plan.meta.generated_at,
  };
  const htmlRows = Object.entries(rows)
    .map(([k, v]) => `<tr><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb;color:#555"><b>${escapeHtml(k)}</b></td><td style="padding:7px 10px;border-bottom:1px solid #e5e7eb">${escapeHtml(v)}</td></tr>`)
    .join("");
  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.7;color:#1f2933;max-width:720px;margin:auto;background:#fff">
    <h1 style="color:#0b6e4f;font-size:20px;margin:0 0 12px">تم إنشاء خطة إقلاع جديدة في أقلع</h1>
    <p>ملخص إداري محدود للخطة رقم ${escapeHtml(planId)}. لا يتضمن تفاصيل صحية خاصة أو الإجابات الخام.</p>
    <table dir="ltr" style="border-collapse:collapse;width:100%;margin:12px 0;background:#fafafa;text-align:left">${htmlRows}</table>
    <p><a href="${planUrl}" style="color:#0b6e4f;font-weight:bold">Open plan</a></p>
  </div>`;
}

// ---------------- startQuitPlan ----------------
export const startQuitPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        nickname: z.string().min(1).max(60),
        email: z.string().email().max(200),
        city: z.string().min(1).max(60),
        product: z.enum(["cigarettes", "vape", "shisha", "pouches", "youth", "other"]),
        age: z.number().int().min(8).max(99).optional(),
        anonymousSessionId: z.string().min(1).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: session, error: sErr } = await supabaseAdmin
      .from("center_sessions")
      .insert({
        anonymous_session_id: data.anonymousSessionId,
        center_type: "quit_pathway",
        workflow_state: "quit_intake",
        language: "ar",
        meta: { source: "quit_plan_chat" },
      })
      .select("id")
      .single();
    if (sErr || !session) throw new Error(`Failed to create session: ${sErr?.message}`);

    const planToken = randomToken();
    const { data: plan, error } = await supabaseAdmin
      .from("quit_plans")
      .insert({
        session_id: session.id,
        anonymous_session_id: data.anonymousSessionId,
        nickname: data.nickname,
        email: data.email,
        city: data.city,
        product: data.product,
        intake_answers: { age: data.age ?? null },
        plan_token: planToken,
        status: "in_progress",
      })
      .select("id, plan_token")
      .single();
    if (error || !plan) throw new Error(`Failed to create plan: ${error?.message}`);
    return { planId: plan.id as string, planToken: plan.plan_token as string };
  });

// ---------------- saveAnswer ----------------
export const saveAnswer = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        planId: z.string().uuid(),
        planToken: z.string().min(8).max(80),
        key: z.string().min(1).max(60),
        value: z.unknown(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: existing, error: rErr } = await supabaseAdmin
      .from("quit_plans")
      .select("intake_answers, plan_token")
      .eq("id", data.planId)
      .single();
    if (rErr || !existing) throw new Error("Plan not found");
    if ((existing as { plan_token: string | null }).plan_token !== data.planToken) {
      throw new Error("Forbidden: invalid plan token");
    }
    const next = {
      ...((existing.intake_answers as Record<string, unknown>) ?? {}),
      [data.key]: data.value,
    };
    const { error } = await supabaseAdmin
      .from("quit_plans")
      .update({ intake_answers: next as never })
      .eq("id", data.planId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------- finalizeQuitPlan ----------------
export const finalizeQuitPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        planId: z.string().uuid(),
        planToken: z.string().min(8).max(80),
        intake: z.object({
          nickname: z.string().min(1),
          email: z.string().email(),
          city: z.string().min(1),
          product: z.enum(["cigarettes", "vape", "shisha", "pouches", "youth", "other"]),
          age: z.number().int().optional(),
          daily_use_pattern: z.string().optional(),
          time_to_first_use: z.string().optional(),
          craving_pattern: z.string().optional(),
          previous_quit_attempts: z.string().optional(),
          readiness: z.enum([
            "quit_now",
            "quit_prepare",
            "reduce_first",
            "not_ready_score",
            "discuss_alternatives",
          ]),
          goal: z.enum(["quit_full", "reduce_first", "understand", "not_ready_now"]),
          quit_date: z.string().nullable().optional(),
          triggers: z.array(z.string()).default([]),
          support_person: z
            .object({
              name: z.string().optional(),
              relation: z.string().optional(),
              phone: z.string().optional(),
            })
            .nullable()
            .optional(),
          followup_preference: z.enum(["email", "whatsapp", "none"]).optional(),
          reminder_consent: z.boolean().optional(),
          assessment_answers: z.record(z.string(), z.unknown()).default({}),
          emergency_consent: z.boolean().optional(),
        }),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const intake = data.intake as QuitPlanIntake;
    const score = computeScore(intake);
    const plan: QuitPlanJSON = buildQuitPlan(intake, score);
    const planUrl = `${SITE_URL}/quit-plan/${data.planId}`;

    const { error } = await supabaseAdmin
      .from("quit_plans")
      .update({
        nickname: intake.nickname,
        email: intake.email,
        city: intake.city,
        product: intake.product,
        readiness: intake.readiness,
        quit_goal: intake.goal,
        quit_date: intake.quit_date ?? null,
        triggers: intake.triggers,
        support_person: intake.support_person ?? {},
        assessment_tool: score.instrument,
        score_total: score.total,
        score_band: score.band,
        risk_flag: score.risk_flag,
        validated: score.validated,
        intake_answers: intake as never,
        plan: plan as never,
        followup_schedule: plan.followup_schedule as never,
        status: "finalized",
      })
      .eq("id", data.planId);
    if (error) throw new Error(error.message);

    const { data: row } = await supabaseAdmin
      .from("quit_plans")
      .select("plan_token")
      .eq("id", data.planId)
      .single();
    const token = (row?.plan_token as string | null) ?? null;

    const userSubject = "خطة أقلع الشخصية الخاصة بك";
    const userResult = await sendEmail(intake.email, userSubject, userPlanEmailHtml(plan, planUrl));
    await logPlanEmail({
      quitPlanId: data.planId,
      recipientType: "user",
      email: intake.email,
      subject: userSubject,
      sent: userResult.sent,
      error: userResult.error,
    });
    if (userResult.sent) {
      await supabaseAdmin.from("quit_plans").update({ email_sent_at: new Date().toISOString() }).eq("id", data.planId);
    }

    const adminSubject = "تم إنشاء خطة إقلاع جديدة في أقلع";
    const adminResult = await sendEmail(ADMIN_EMAIL, adminSubject, adminPlanEmailHtml(plan, intake, data.planId, planUrl));
    await logPlanEmail({
      quitPlanId: data.planId,
      recipientType: "admin",
      email: ADMIN_EMAIL,
      subject: adminSubject,
      sent: adminResult.sent,
      error: adminResult.error,
    });
    if (adminResult.sent) {
      await supabaseAdmin.from("quit_plans").update({ admin_notified_at: new Date().toISOString() }).eq("id", data.planId);
    } else {
      console.error("quit plan admin email failed", adminResult.error);
    }

    return {
      planId: data.planId,
      planToken: token,
      planUrl,
      userEmailSent: userResult.sent,
      userEmailError: userResult.error,
      adminEmailSent: adminResult.sent,
      adminEmailError: adminResult.error,
    };
  });

// ---------------- getQuitPlan ----------------
export const getQuitPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        planId: z.string().uuid().optional(),
        planToken: z.string().min(8).max(80).optional(),
      })
      .refine((v) => v.planId || v.planToken, { message: "planId or planToken required" })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const q = supabaseAdmin
      .from("quit_plans")
      .select(
        "id, plan_token, nickname, email, city, product, assessment_tool, score_total, score_band, risk_flag, validated, readiness, quit_goal, quit_date, triggers, plan, status, created_at, email_sent_at, admin_notified_at",
      );
    const { data: row, error } = data.planId
      ? await q.eq("id", data.planId).maybeSingle()
      : await q.eq("plan_token", data.planToken!).maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return { plan: null };
    return { plan: row };
  });

// ---------------- scheduleReminder ----------------
export const scheduleReminder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        planId: z.string().uuid(),
        type: z.enum(["24h", "3d", "7d", "14d", "28d"]),
        channel: z.enum(["email", "whatsapp"]).default("email"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const offsets: Record<string, number> = { "24h": 1, "3d": 3, "7d": 7, "14d": 14, "28d": 28 };
    const d = new Date();
    d.setDate(d.getDate() + offsets[data.type]);
    const { error } = await supabaseAdmin.from("quit_plan_reminders").insert({
      quit_plan_id: data.planId,
      reminder_type: data.type,
      scheduled_at: d.toISOString(),
      channel: data.channel,
      status: "pending",
    });
    if (error) throw new Error(error.message);
    const dispatcherReady = Boolean(process.env.EMAIL_PROVIDER_API_KEY && process.env.EMAIL_FROM_ADDRESS);
    return {
      ok: true,
      scheduledFor: d.toISOString(),
      message: dispatcherReady
        ? "تم جدولة التذكير."
        : "تم حفظ التذكير، وسيتم تفعيله عند اكتمال إعداد الإرسال.",
    };
  });
