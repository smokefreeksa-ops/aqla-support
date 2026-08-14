// Server-only helpers for the Release 1 clinical plan flow.
// Never imported by client code directly (imported by *.functions.ts handlers only).
//
// Release 1 guarantees enforced here:
//  - plan_json is produced ONLY by generatePlan() (behavioural engine). The legacy
//    medication-producing quit-plan builder is never imported in this module.
//  - every generated plan is written as a NEW immutable row in quit_plan_versions.
//  - plan links always use the real /quit-plan/$planToken route.
//  - plan email reuses the project's existing verified email queue infrastructure.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SITE_URL } from "@/lib/site";
import {
  ADMIN_RESEARCH_DISCLOSURE_ENABLED,
  CLINICAL_RULE_VERSION,
  PLAN_EMAIL_CONSENT_VERSION,
} from "./release-flags";
import { generatePlan } from "./plan-engine";
import type { ClinicalAnswers, ClinicalPlanJSON, EmailStatus } from "./types";

const EMAIL_LABEL = "clinical-quit-plan";
const SENDER_DOMAIN = "notify.aqla1.com";
const FROM_DOMAIN = "aqla1.com";
const SITE_NAME = "aqla-support";

function randomToken(): string {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 32);
}

function hexToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function escapeHtml(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Stable content hash used by immutability tests. */
export function planHash(plan: ClinicalPlanJSON): string {
  const json = JSON.stringify(plan);
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < json.length; i++) {
    const c = json.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
    h2 = Math.imul(h2 + c, 2246822519) >>> 0;
  }
  return `${h1.toString(16)}${h2.toString(16)}`;
}

export function clinicalPlanUrl(planToken: string): string {
  return `${SITE_URL}/quit-plan/${planToken}`;
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

export function planEmailHtml(plan: ClinicalPlanJSON, planUrl: string): string {
  const section = (title: string, items: string[]) =>
    `<h2 style="color:#006C35;font-size:16px;margin:18px 0 6px">${escapeHtml(title)}</h2><ul>${items
      .map((i) => `<li>${escapeHtml(i)}</li>`)
      .join("")}</ul>`;

  return `<div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;font-size:14px;line-height:1.85;color:#1f2933;max-width:720px;margin:auto;background:#fff">
    <h1 style="color:#006C35;font-size:22px;margin:0 0 6px">خطة أقلع السلوكية الشخصية</h1>
    <p style="color:#556;margin:0 0 16px">أهلًا ${escapeHtml(plan.identity.nickname)} — هذه نسخة من خطتك كما ظهرت لك على الشاشة تمامًا (الإصدار ${plan.plan_version}).</p>
    ${section("إدارة الرغبة", plan.craving_management.items)}
    ${section("خطة المحفزات", plan.trigger_plan.items)}
    ${plan.timeline.map((s) => section(s.title_ar, s.items)).join("")}
    ${plan.lapse_pathways.map((p) => section(`إذا حدث: ${p.title_ar}`, p.steps)).join("")}
    ${plan.money ? section(plan.money.title_ar, plan.money.items) : ""}
    ${section("خدمات وإحالات", plan.services.items)}
    <p style="margin:22px 0"><a href="${planUrl}" style="background:#006C35;color:#fff;padding:12px 18px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:bold">عرض الخطة الكاملة وتحميلها PDF</a></p>
    <div style="background:#fdecea;border-radius:6px;padding:10px;color:#8a1a1a;font-size:12px;margin-top:12px">${escapeHtml(plan.disclaimer_ar)}</div>
  </div>`;
}

function htmlToText(html: string): string {
  return html
    .replace(/<li>/g, "• ")
    .replace(/<[^>]+>/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/**
 * Sends the plan email through the project's existing verified email queue
 * (pgmq `transactional_emails` + process-email-queue). No second provider config.
 */
export async function sendPlanEmailViaQueue(
  to: string,
  plan: ClinicalPlanJSON,
  planUrl: string,
  idempotencyKey: string,
): Promise<{ status: EmailStatus; error: string | null }> {
  const normalized = to.toLowerCase();
  const messageId = crypto.randomUUID();

  try {
    const { data: suppressed, error: supErr } = await supabaseAdmin
      .from("suppressed_emails")
      .select("id")
      .eq("email", normalized)
      .maybeSingle();
    if (supErr) return { status: "provider_unavailable", error: "suppression check failed" };
    if (suppressed) return { status: "failed", error: "email_suppressed" };

    // Unsubscribe token (one per address) — required by the queue processor.
    let unsubscribeToken: string;
    const { data: existing } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalized)
      .maybeSingle();
    if (existing?.token) {
      unsubscribeToken = existing.token as string;
    } else {
      unsubscribeToken = hexToken();
      await supabaseAdmin
        .from("email_unsubscribe_tokens")
        .upsert({ token: unsubscribeToken, email: normalized }, { onConflict: "email", ignoreDuplicates: true });
      const { data: stored } = await supabaseAdmin
        .from("email_unsubscribe_tokens")
        .select("token")
        .eq("email", normalized)
        .maybeSingle();
      if (stored?.token) unsubscribeToken = stored.token as string;
    }

    const html = planEmailHtml(plan, planUrl);

    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: EMAIL_LABEL,
      recipient_email: normalized,
      status: "pending",
    });

    const { error: enqueueError } = await supabaseAdmin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to: normalized,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject: "خطة أقلع السلوكية الشخصية",
        html,
        text: htmlToText(html),
        purpose: "transactional",
        label: EMAIL_LABEL,
        idempotency_key: idempotencyKey,
        unsubscribe_token: unsubscribeToken,
        queued_at: new Date().toISOString(),
      } as never,
    });

    if (enqueueError) {
      await supabaseAdmin.from("email_send_log").insert({
        message_id: messageId,
        template_name: EMAIL_LABEL,
        recipient_email: normalized,
        status: "failed",
        error_message: "Failed to enqueue email",
      });
      return { status: "provider_unavailable", error: enqueueError.message.slice(0, 300) };
    }

    return { status: "sent", error: null };
  } catch (e) {
    return { status: "provider_unavailable", error: (e as Error).message.slice(0, 300) };
  }
}

/** Writes an immutable version row. Never updates an existing version. */
export async function storePlanVersion(planId: string, plan: ClinicalPlanJSON) {
  const { error } = await supabaseAdmin.from("quit_plan_versions").insert({
    quit_plan_id: planId,
    plan_version: plan.plan_version,
    plan_json: plan as never,
    clinical_rule_version: plan.clinical_rule_version,
    jurisdiction: plan.jurisdiction,
    plan_variant: plan.plan_variant,
    plan_hash: planHash(plan),
    generated_at: plan.generated_at,
  });
  if (error) throw new Error(`Failed to persist immutable plan version: ${error.message}`);
}

export async function finalizeClinicalPlanRow(planId: string, answers: ClinicalAnswers) {
  const { data: existing } = await supabaseAdmin
    .from("quit_plans")
    .select("plan_version, plan_token, status")
    .eq("id", planId)
    .single();

  // Immutability: every regeneration produces a NEW version row; previous versions
  // are never overwritten (enforced additionally by a DB trigger).
  const { data: lastVersion } = await supabaseAdmin
    .from("quit_plan_versions")
    .select("plan_version")
    .eq("quit_plan_id", planId)
    .order("plan_version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const planVersion = lastVersion?.plan_version
    ? (lastVersion.plan_version as number) + 1
    : existing?.status === "finalized"
      ? (existing.plan_version ?? 1) + 1
      : (existing?.plan_version ?? 1);

  const plan = generatePlan({ answers, planVersion });
  const planToken = (existing?.plan_token as string | null) ?? randomToken();
  const planUrl = clinicalPlanUrl(planToken);

  // Persist the immutable version FIRST so the delivered artefact always exists.
  await storePlanVersion(planId, plan);

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

  // Email requires explicit persisted consent; it can never run without it.
  if (consented && !plan.safety.suppress_plan) {
    const { data: consentRow } = await supabaseAdmin
      .from("quit_plans")
      .select("plan_email_consent, plan_email_consent_at, plan_email_consent_version, email")
      .eq("id", planId)
      .single();

    if (consentRow?.plan_email_consent && consentRow.plan_email_consent_at && consentRow.email) {
      const result = await sendPlanEmailViaQueue(
        consentRow.email as string,
        plan,
        planUrl,
        `clinical-plan-${planId}-v${planVersion}`,
      );
      emailStatus = result.status;
      emailError = result.error;
    } else {
      emailStatus = "failed";
      emailError = "consent not persisted";
    }

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

  return { plan, planUrl, planToken, planVersion, emailStatus, emailError };
}

/** Reads the exact stored immutable plan for a token (latest or a specific version). */
export async function getClinicalPlanByToken(planToken: string, version?: number) {
  const { data: row, error } = await supabaseAdmin
    .from("quit_plans")
    .select("id, plan_token, plan, plan_version, status, email_status, created_at")
    .eq("plan_token", planToken)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) return { plan: null as ClinicalPlanJSON | null, planVersion: null, emailStatus: null, isRelease1: false };

  const { data: versionRow } = await supabaseAdmin
    .from("quit_plan_versions")
    .select("plan_json, plan_version")
    .eq("quit_plan_id", row.id as string)
    .eq("plan_version", version ?? (row.plan_version as number))
    .maybeSingle();

  const planJson = (versionRow?.plan_json ?? row.plan) as ClinicalPlanJSON | null;
  const isRelease1 =
    !!planJson && typeof planJson === "object" && typeof planJson.schema_version === "string" &&
    planJson.schema_version.startsWith("plan_json.v");

  return {
    plan: isRelease1 ? planJson : null,
    legacyPlan: isRelease1 ? null : planJson,
    planVersion: (versionRow?.plan_version ?? row.plan_version ?? null) as number | null,
    emailStatus: (row.email_status ?? null) as string | null,
    isRelease1,
  };
}

/** Lists Release 1 plans owned by a signed-in user. */
export async function listUserClinicalPlans(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("quit_plans")
    .select("id, plan_token, nickname, plan_version, status, generated_at, created_at, clinical_rule_version")
    .eq("user_id", userId)
    .not("plan_token", "is", null)
    .eq("clinical_rule_version", CLINICAL_RULE_VERSION)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Attaches an anonymous Release 1 plan to the signed-in user (dashboard reopen). */
export async function claimClinicalPlanForUser(planToken: string, userId: string) {
  const { data: row } = await supabaseAdmin
    .from("quit_plans")
    .select("id, user_id")
    .eq("plan_token", planToken)
    .maybeSingle();
  if (!row) return { ok: false };
  if (row.user_id && row.user_id !== userId) return { ok: false };
  const { error } = await supabaseAdmin
    .from("quit_plans")
    .update({ user_id: userId })
    .eq("id", row.id as string);
  if (error) throw new Error(error.message);
  return { ok: true };
}

/**
 * Re-sends (or first-time sends) the stored immutable plan to an email address
 * chosen by the plan holder. Requires the secret plan token, explicit consent,
 * and a plan that is not under a clinical safety hold.
 */
export async function resendClinicalPlanEmail(planToken: string, email: string) {
  const normalized = email.trim().toLowerCase();
  const { data: row, error } = await supabaseAdmin
    .from("quit_plans")
    .select("id, plan, plan_version, status")
    .eq("plan_token", planToken)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row) return { ok: false, message: "لم يتم العثور على الخطة." };
  if (row.status === "safety_hold") {
    return { ok: false, message: "لا يمكن إرسال هذه الخطة بالبريد لأسباب تتعلق بالسلامة. يرجى التواصل مع الدعم." };
  }

  const planVersion = (row.plan_version as number) ?? 1;
  const { data: versionRow } = await supabaseAdmin
    .from("quit_plan_versions")
    .select("plan_json")
    .eq("quit_plan_id", row.id as string)
    .eq("plan_version", planVersion)
    .maybeSingle();

  const planJson = (versionRow?.plan_json ?? row.plan) as ClinicalPlanJSON | null;
  if (!planJson) return { ok: false, message: "الخطة غير جاهزة للإرسال بعد." };

  const result = await sendPlanEmailViaQueue(
    normalized,
    planJson,
    clinicalPlanUrl(planToken),
    `clinical-plan-${row.id}-v${planVersion}-resend-${Date.now()}`,
  );

  await supabaseAdmin
    .from("quit_plans")
    .update({
      email: normalized,
      plan_email_consent: true,
      plan_email_consent_at: new Date().toISOString(),
      plan_email_consent_version: PLAN_EMAIL_CONSENT_VERSION,
      email_status: result.status,
      email_sent_at: result.status === "sent" ? new Date().toISOString() : null,
    })
    .eq("id", row.id as string);

  if (result.status !== "sent") {
    return {
      ok: false,
      message: result.error === "email_suppressed"
        ? "هذا البريد مُلغى الاشتراك من رسائلنا."
        : "تعذر إرسال البريد الآن، حاول لاحقًا.",
    };
  }
  return { ok: true, message: "تم إرسال خطتك إلى بريدك الإلكتروني." };
}
