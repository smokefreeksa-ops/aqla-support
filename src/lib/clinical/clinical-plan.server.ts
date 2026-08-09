// Server-only helpers for the Release 1 clinical plan flow.
// Never imported by client code directly (imported by *.functions.ts handlers only).

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SITE_URL } from "@/lib/site";
import {
  ADMIN_RESEARCH_DISCLOSURE_ENABLED,
  CLINICAL_RULE_VERSION,
  PLAN_EMAIL_CONSENT_VERSION,
} from "./release-flags";
import { generatePlan } from "./plan-engine";
import type { ClinicalAnswers, ClinicalPlanJSON, EmailStatus } from "./types";

function randomToken(): string {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 32);
}

function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function createClinicalPlanRow(anonymousSessionId: string) {
  const { data: session, error: sErr } = await supabaseAdmin
    .from("center_sessions")
    .insert({
      anonymous_session_id: anonymousSessionId,
      center_type: "quit_pathway",
      workflow_state: "clinical_intake",
      language: "ar",
      meta: { source: "clinical_plan_chat_r1" },
    })
    .select("id")
    .single();
  if (sErr || !session) throw new Error(`Failed to create session: ${sErr?.message}`);

  const planToken = randomToken();
  const { data: row, error } = await supabaseAdmin
    .from("quit_plans")
    .insert({
      session_id: session.id,
      anonymous_session_id: anonymousSessionId,
      intake_answers: {},
      plan_token: planToken,
      status: "in_progress",
      plan_version: 1,
      clinical_rule_version: CLINICAL_RULE_VERSION,
      email_status: "not_requested" satisfies EmailStatus,
      plan_email_consent: false,
    })
    .select("id, plan_token")
    .single();
  if (error || !row) throw new Error(`Failed to create plan: ${error?.message}`);
  return { planId: row.id as string, planToken: row.plan_token as string };
}

export async function persistAnswers(planId: string, answers: ClinicalAnswers) {
  const { error } = await supabaseAdmin
    .from("quit_plans")
    .update({ intake_answers: answers as never })
    .eq("id", planId);
  if (error) throw new Error(error.message);
}

function planEmailHtml(plan: ClinicalPlanJSON, planUrl: string): string {
  const section = (title: string, items: string[]) =>
    `<h2 style="color:#006C35;font-size:16px;margin:18px 0 6px">${escapeHtml(title)}</h2><ul>${items
      .map((i) => `<li>${escapeHtml(i)}</li>`)
      .join("")}</ul>`;

  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.85;color:#1f2933;max-width:720px;margin:auto;background:#fff">
    <h1 style="color:#006C35;font-size:22px;margin:0 0 6px">خطة أقلع السلوكية الشخصية</h1>
    <p style="color:#556;margin:0 0 16px">أهلًا ${escapeHtml(plan.identity.nickname)} — هذه نسخة من خطتك كما ظهرت لك على الشاشة تمامًا.</p>
    ${section("إدارة الرغبة", plan.craving_management.items)}
    ${section("خطة المحفزات", plan.trigger_plan.items)}
    ${plan.timeline.map((s) => section(s.title_ar, s.items)).join("")}
    ${plan.lapse_pathways.map((p) => section(`إذا حدث: ${p.title_ar}`, p.steps)).join("")}
    ${plan.money ? section(plan.money.title_ar, plan.money.items) : ""}
    ${section("خدمات وإحالات", plan.services.items)}
    <p style="margin:22px 0"><a href="${planUrl}" style="background:#006C35;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold">عرض الخطة الكاملة</a></p>
    <div style="background:#fdecea;border-radius:6px;padding:10px;color:#8a1a1a;font-size:12px;margin-top:12px">${escapeHtml(plan.disclaimer_ar)}</div>
  </div>`;
}

async function sendPlanEmail(to: string, html: string): Promise<{ status: EmailStatus; error: string | null }> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS;
  if (!apiKey || !from) return { status: "provider_unavailable", error: "Email provider not configured" };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], subject: "خطة أقلع السلوكية الشخصية", html }),
    });
    if (!res.ok) return { status: "failed", error: `HTTP ${res.status}` };
    return { status: "sent", error: null };
  } catch (e) {
    return { status: "failed", error: (e as Error).message.slice(0, 500) };
  }
}

export async function finalizeClinicalPlanRow(planId: string, answers: ClinicalAnswers) {
  const { data: existing } = await supabaseAdmin
    .from("quit_plans")
    .select("plan_version, plan_token, status")
    .eq("id", planId)
    .single();

  // Immutability: a finalized plan is never mutated in place — regenerating bumps the version.
  const planVersion = existing?.status === "finalized" ? (existing.plan_version ?? 1) + 1 : (existing?.plan_version ?? 1);

  const plan = generatePlan({ answers, planVersion });
  const planToken = (existing?.plan_token as string | null) ?? randomToken();
  const planUrl = `${SITE_URL}/plan/${planToken}`;

  const isMinor = answers.age_band === "under_18";
  const consented = answers.plan_email_consent === true && !!answers.email && !isMinor;

  let emailStatus: EmailStatus = isMinor && answers.plan_email_consent
    ? "disabled_minor"
    : consented
      ? "consented_pending"
      : "not_requested";
  let emailError: string | null = null;

  const { error } = await supabaseAdmin
    .from("quit_plans")
    .update({
      plan: plan as never,
      intake_answers: answers as never,
      nickname: plan.identity.nickname,
      city: plan.identity.city,
      email: consented ? answers.email : null,
      product: (answers.products ?? [])[0] ?? null,
      assessment_tool: plan.dependence.instrument,
      score_total: plan.dependence.total,
      score_band: plan.dependence.band_ar,
      readiness: plan.readiness.score != null ? String(plan.readiness.score) : null,
      quit_date: answers.quit_date ?? null,
      triggers: (answers.triggers ?? []) as never,
      jurisdiction: plan.jurisdiction,
      country_code: plan.country_code,
      plan_variant: plan.plan_variant,
      dependence_status: plan.dependence_status,
      quit_strategy: plan.quit_strategy,
      safety_gate_level: plan.safety_gate_level,
      safety_flags: plan.safety_flags as never,
      plan_version: planVersion,
      clinical_rule_version: plan.clinical_rule_version,
      generated_at: plan.generated_at,
      plan_token: planToken,
      plan_email_consent: consented,
      plan_email_consent_at: consented ? new Date().toISOString() : null,
      plan_email_consent_version: consented ? PLAN_EMAIL_CONSENT_VERSION : null,
      email_status: emailStatus,
      status: plan.safety.suppress_plan ? "safety_hold" : "finalized",
    })
    .eq("id", planId);
  if (error) throw new Error(error.message);

  if (consented && !plan.safety.suppress_plan) {
    const result = await sendPlanEmail(answers.email!, planEmailHtml(plan, planUrl));
    emailStatus = result.status;
    emailError = result.error;
    await supabaseAdmin
      .from("quit_plans")
      .update({
        email_status: emailStatus,
        email_sent_at: emailStatus === "sent" ? new Date().toISOString() : null,
      })
      .eq("id", planId);
  }

  // Governance: identifiable admin/research disclosure stays off in Release 1.
  if (ADMIN_RESEARCH_DISCLOSURE_ENABLED) {
    console.warn("Admin disclosure flag enabled without an approved governance path.");
  }

  return { plan, planUrl, planToken, emailStatus, emailError };
}
