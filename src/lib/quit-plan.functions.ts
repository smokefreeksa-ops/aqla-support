import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  buildQuitPlan,
  computeScore,
  type QuitPlanIntake,
  type QuitPlanJSON,
} from "./quit-plan-builder";
import { sendAdminNotification, renderKeyValueHtml } from "./notifications.server";

function randomToken(): string {
  // 24-byte url-safe token
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 32);
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
    // Create a center_session row first (FK requirement)
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
        key: z.string().min(1).max(60),
        value: z.unknown(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: existing, error: rErr } = await supabaseAdmin
      .from("quit_plans")
      .select("intake_answers")
      .eq("id", data.planId)
      .single();
    if (rErr || !existing) throw new Error("Plan not found");
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
        intake: z.object({
          nickname: z.string().min(1),
          email: z.string().email(),
          city: z.string().min(1),
          product: z.enum(["cigarettes", "vape", "shisha", "pouches", "youth", "other"]),
          age: z.number().int().optional(),
          readiness: z.enum([
            "quit_now",
            "quit_prepare",
            "reduce_first",
            "not_ready_score",
            "discuss_alternatives",
          ]),
          goal: z.enum(["quit_full", "reduce_first", "understand"]),
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
        status: "finalized",
      })
      .eq("id", data.planId);
    if (error) throw new Error(error.message);

    // Fetch plan_token for share link
    const { data: row } = await supabaseAdmin
      .from("quit_plans")
      .select("plan_token")
      .eq("id", data.planId)
      .single();
    const token = (row?.plan_token as string | null) ?? null;
    const site = "https://aqla-support.lovable.app";
    const planUrl = `${site}/quit-plan/${data.planId}`;

    // Admin notification (non-sensitive summary)
    let adminNotified = false;
    try {
      await sendAdminNotification(
        "full_quit_support_submission",
        "تم إنشاء خطة إقلاع جديدة في أقلع",
        renderKeyValueHtml({
          nickname: intake.nickname,
          email: intake.email,
          city: intake.city,
          product: intake.product,
          assessment_tool: score.instrument,
          score_band: score.band,
          risk_flag: score.risk_flag,
          followup_preference: intake.followup_preference ?? "—",
          plan_generated_at: new Date().toISOString(),
          plan_url: planUrl,
        }),
        { participant_code: data.planId },
      );
      adminNotified = true;
      await supabaseAdmin
        .from("quit_plans")
        .update({ admin_notified_at: new Date().toISOString() })
        .eq("id", data.planId);
      await supabaseAdmin.from("quit_plan_emails").insert({
        quit_plan_id: data.planId,
        recipient_type: "admin",
        email: "smokefreeksa@gmail.com",
        subject: "تم إنشاء خطة إقلاع جديدة في أقلع",
        status: "queued",
      });
    } catch (e) {
      console.error("admin notify failed", e);
    }

    // User email (best effort — uses same email infra)
    const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
    let userEmailSent = false;
    let userEmailError: string | null = null;
    if (apiKey) {
      try {
        const fromAddr = process.env.EMAIL_FROM_ADDRESS || "Aqla <onboarding@resend.dev>";
        const topTriggers = plan.triggers.slice(0, 5).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
        const triggerActions = plan.trigger_plan.slice(0, 5).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
        const refsList = plan.references.map((r, i) => `<li>${i + 1}. ${escapeHtml(r.full)}</li>`).join("");
        const html = `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.8;color:#222;max-width:640px;margin:auto">
          <h2 style="color:#0b6e4f;margin:0 0 4px">${escapeHtml(plan.title)}</h2>
          <p style="color:#555;margin:0 0 16px">${escapeHtml(plan.subtitle)}</p>
          <p>السلام عليكم ${escapeHtml(intake.nickname)}،</p>
          <p>تم إنشاء خطتك الشخصية في أقلع بناءً على إجاباتك. هذا ملخص سريع، والخطة الكاملة تشمل خطة المحفزات، خطة 24 ساعة و7 أيام و28 يوم، خطة الرغبة الشديدة، وخيارات يمكن مناقشتها مع الصيدلي أو الطبيب.</p>
          <table style="border-collapse:collapse;width:100%;margin:12px 0">
            <tr><td style="padding:6px;border:1px solid #eee"><b>المنتج</b></td><td style="padding:6px;border:1px solid #eee">${escapeHtml(plan.use.product_ar)}</td></tr>
            <tr><td style="padding:6px;border:1px solid #eee"><b>أداة التقييم</b></td><td style="padding:6px;border:1px solid #eee">${escapeHtml(plan.assessment.instrument_label_ar)}</td></tr>
            <tr><td style="padding:6px;border:1px solid #eee"><b>نطاق النتيجة</b></td><td style="padding:6px;border:1px solid #eee">${escapeHtml(plan.assessment.band_ar)}</td></tr>
            <tr><td style="padding:6px;border:1px solid #eee"><b>الهدف</b></td><td style="padding:6px;border:1px solid #eee">${escapeHtml(plan.goal.label_ar)}</td></tr>
            <tr><td style="padding:6px;border:1px solid #eee"><b>تاريخ البداية</b></td><td style="padding:6px;border:1px solid #eee">${escapeHtml(plan.dates.quit_or_reduce_date ?? "—")}</td></tr>
          </table>
          <h3 style="color:#0b6e4f;margin-top:18px">أهم محفزاتك</h3>
          <ul>${topTriggers}</ul>
          <h3 style="color:#0b6e4f;margin-top:18px">خطة التعامل مع المحفزات</h3>
          <ul>${triggerActions}</ul>
          <p style="margin-top:20px">
            <a href="${planUrl}" style="background:#0b6e4f;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold">عرض الخطة الكاملة وتحميل PDF</a>
          </p>
          <p style="color:#666;font-size:12px">إذا لم يعمل الزر، انسخ هذا الرابط: ${planUrl}</p>
          <div style="background:#fdecea;border-radius:6px;padding:10px;color:#8a1a1a;font-size:12px;margin-top:16px">
            ${escapeHtml(plan.emergency_disclaimer)}
          </div>
          <h3 style="color:#0b6e4f;margin-top:18px">المراجع</h3>
          <ol style="font-size:12px;color:#444;padding-inline-start:18px">${refsList}</ol>
          <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>
          <p style="color:#888;font-size:12px">أقلع لا يقدّم تشخيصًا أو وصفة دوائية ولا يحدد جرعات. اختيار الدواء أو الجرعة المناسبة يحتاج مراجعة صيدلي أو طبيب.</p>
        </div>`;
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: fromAddr,
            to: [intake.email],
            subject: "خطة أقلع الشخصية الخاصة بك",
            html,
          }),
        });
        if (!res.ok) {
          userEmailError = `HTTP ${res.status}`;
        } else {
          userEmailSent = true;
          await supabaseAdmin
            .from("quit_plans")
            .update({ email_sent_at: new Date().toISOString() })
            .eq("id", data.planId);
        }
        await supabaseAdmin.from("quit_plan_emails").insert({
          quit_plan_id: data.planId,
          recipient_type: "user",
          email: intake.email,
          subject: "خطة أقلع الشخصية الخاصة بك",
          status: userEmailSent ? "sent" : "failed",
          error_message: userEmailError,
        });
      } catch (e) {
        userEmailError = (e as Error).message;
        await supabaseAdmin.from("quit_plan_emails").insert({
          quit_plan_id: data.planId,
          recipient_type: "user",
          email: intake.email,
          subject: "خطة أقلع الشخصية الخاصة بك",
          status: "failed",
          error_message: userEmailError,
        });
      }
    } else {
      userEmailError = "EMAIL_PROVIDER_API_KEY not configured";
      await supabaseAdmin.from("quit_plan_emails").insert({
        quit_plan_id: data.planId,
        recipient_type: "user",
        email: intake.email,
        subject: "خطة أقلع الشخصية الخاصة بك",
        status: "pending_provider_setup",
        error_message: userEmailError,
      });
    }

    return {
      planId: data.planId,
      planToken: token,
      planUrl,
      userEmailSent,
      userEmailError,
      adminNotified,
    };
  });

function escapeHtml(s: string): string {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
    const dispatcherReady = Boolean(process.env.EMAIL_PROVIDER_API_KEY);
    return {
      ok: true,
      scheduledFor: d.toISOString(),
      message: dispatcherReady
        ? "تم جدولة التذكير."
        : "تم حفظ التذكير، وسيتم تفعيله عند اكتمال إعداد الإرسال.",
    };
  });
