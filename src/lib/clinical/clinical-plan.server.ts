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
  CLINICAL_RULE_VERSION,
  PLAN_EMAIL_CONSENT_VERSION,
} from "./release-flags";
import { withoutContactDetails } from "../contact/public-plan";
import { validateContactAnswers, planEmailRecipient } from "../contact/consent";
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

function contactColumns(answers: ClinicalAnswers) {
  return {
    ...(answers.nickname ? { nickname: answers.nickname } : {}),
    ...(answers.city ? { city: answers.city } : {}),
    ...(answers.contact_email ? { email: answers.contact_email } : {}),
    ...(answers.contact_mobile ? { mobile: answers.contact_mobile } : {}),
    ...(answers.age_band ? { age_band_captured: answers.age_band, is_minor: answers.age_band === "under_18" } : {}),
    ...(answers.contact_consent ? { contact_consent: true, contact_consent_at: answers.contact_consent_at, contact_consent_version: answers.contact_consent_version } : {}),
    ...(answers.guardian_name ? { guardian_name: answers.guardian_name } : {}),
    ...(answers.guardian_relationship ? { guardian_relationship: answers.guardian_relationship } : {}),
    ...(answers.guardian_email ? { guardian_email: answers.guardian_email } : {}),
    ...(answers.guardian_mobile ? { guardian_mobile: answers.guardian_mobile } : {}),
    ...(answers.guardian_consent ? { guardian_consent: true, guardian_consent_at: answers.guardian_consent_at } : {}),
  };
}

export async function persistAnswers(planId: string, planToken: string, input: ClinicalAnswers) {
  const answers = validateContactAnswers(input);
  const { error } = await supabaseAdmin
    .from("quit_plans")
    .update({ intake_answers: answers as never, ...contactColumns(answers) })
    .eq("id", planId)
    .eq("plan_token", planToken)
    .eq("status", "in_progress");
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
): Promise<{ status: EmailStatus; error: string | null; messageId: string }> {
  const normalized = to.toLowerCase();
  const messageId = crypto.randomUUID();
  let logged = false;
  const logFailure = async (reason: string) => {
    console.error("[clinical-plan-email] send failed", { idempotencyKey, reason });
    if (logged) return;
    logged = true;
    try {
      await supabaseAdmin.from("email_send_log").insert({
        message_id: messageId,
        template_name: EMAIL_LABEL,
        recipient_email: normalized,
        status: "failed",
        error_message: reason.slice(0, 300),
      });
    } catch (logErr) {
      console.error("[clinical-plan-email] could not write failure log", logErr);
    }
  };

  try {
    const { data: suppressed, error: supErr } = await supabaseAdmin
      .from("suppressed_emails")
      .select("id")
      .eq("email", normalized)
      .maybeSingle();
    if (supErr) {
      await logFailure(`suppression check failed: ${supErr.message}`);
      return { status: "provider_unavailable", error: "suppression check failed", messageId };
    }
    if (suppressed) {
      await logFailure("email_suppressed");
      return { status: "failed", error: "email_suppressed", messageId };
    }

    // Unsubscribe token (one per address) — required by the queue processor.
    let unsubscribeToken: string;
    const { data: existing, error: tokErr } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalized)
      .maybeSingle();
    if (tokErr) {
      await logFailure(`unsubscribe token lookup failed: ${tokErr.message}`);
      return { status: "provider_unavailable", error: tokErr.message.slice(0, 300), messageId };
    }
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

    const { error: pendErr } = await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: EMAIL_LABEL,
      recipient_email: normalized,
      status: "pending",
    });
    if (pendErr) console.error("[clinical-plan-email] pending log insert failed", { idempotencyKey, error: pendErr.message });

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
      await logFailure(`Failed to enqueue email: ${enqueueError.message}`);
      return { status: "provider_unavailable", error: enqueueError.message.slice(0, 300), messageId };
    }

    return { status: "queued", error: null, messageId };
  } catch (e) {
    await logFailure(`exception: ${(e as Error).message}`);
    return { status: "provider_unavailable", error: (e as Error).message.slice(0, 300), messageId };
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

export async function finalizeClinicalPlanRow(planId: string, planTokenInput: string, input: ClinicalAnswers) {
  const answers = validateContactAnswers(input, true);
  const { data: existing } = await supabaseAdmin
    .from("quit_plans")
    .select("plan_version, plan_token, status")
    .eq("id", planId)
    .eq("plan_token", planTokenInput)
    .single();
  if (!existing) throw new Error("Forbidden: invalid plan token");

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

  const recipient = planEmailRecipient(answers);
  const consented = !!recipient;
  let emailStatus: EmailStatus = consented ? "consented_pending" : "not_requested";
  let emailError: string | null = null;
  let emailMessageId: string | null = null;

  const { error } = await supabaseAdmin
    .from("quit_plans")
    .update({
      plan: plan as never,
      intake_answers: answers as never,
      nickname: plan.identity.nickname,
      city: plan.identity.city,
      ...contactColumns(answers),
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
      email_sent_at: null,
      email_message_id: null,
      status: plan.safety.suppress_plan ? "safety_hold" : "finalized",
    })
    .eq("id", planId);
  if (error) throw new Error(error.message);

  // Email requires explicit persisted consent; it can never run without it.
  if (consented && !plan.safety.suppress_plan) {
    const { data: consentRow } = await supabaseAdmin
      .from("quit_plans")
      .select("plan_email_consent, plan_email_consent_at, plan_email_consent_version, email, is_minor, guardian_email, guardian_consent")
      .eq("id", planId)
      .single();

    const storedRecipient = consentRow?.is_minor
      ? (consentRow.guardian_consent ? consentRow.guardian_email : null)
      : consentRow?.email;
    if (consentRow?.plan_email_consent && consentRow.plan_email_consent_at && storedRecipient) {
      const result = await sendPlanEmailViaQueue(
        storedRecipient,
        plan,
        planUrl,
        `clinical-plan-${planId}-v${planVersion}`,
      );
      emailStatus = result.status;
      emailError = result.error;
      emailMessageId = result.messageId;
    } else {
      emailStatus = "failed";
      emailError = "consent not persisted";
    }

    await supabaseAdmin
      .from("quit_plans")
      .update({
        email_status: emailStatus,
        email_sent_at: emailStatus === "sent" ? new Date().toISOString() : null,
        email_message_id: emailMessageId,
      })
      .eq("id", planId);
  }

  return { plan, planUrl, planToken, planVersion, emailStatus, emailError };
}

/** Reads the exact stored immutable plan for a token (latest or a specific version). */
export async function getClinicalPlanByToken(planToken: string, version?: number) {
  const { data: row, error } = await supabaseAdmin
    .from("quit_plans")
    .select("id, plan_token, plan, plan_version, status, email_status, email_message_id, created_at")
    .eq("plan_token", planToken)
    .maybeSingle();
  if (error) {
    console.error("[clinical-plan-email] plan lookup failed", { error: error.message });
    throw new Error(error.message);
  }
  if (!row) return { plan: null as ClinicalPlanJSON | null, planVersion: null, emailStatus: null, isRelease1: false };

  let resolvedEmailStatus = (row.email_status ?? null) as string | null;
  let resolvedEmailError: string | null = null;
  if (resolvedEmailStatus === "queued" && row.email_message_id) {
    try {
      const { data: logRow } = await supabaseAdmin
        .from("email_send_log")
        .select("status, error_message")
        .eq("message_id", row.email_message_id as string)
        .in("status", ["sent", "failed"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (logRow?.status === "sent") {
        await supabaseAdmin
          .from("quit_plans")
          .update({ email_status: "sent", email_sent_at: new Date().toISOString() })
          .eq("id", row.id as string);
        resolvedEmailStatus = "sent";
      } else if (logRow?.status === "failed") {
        await supabaseAdmin.from("quit_plans").update({ email_status: "failed" }).eq("id", row.id as string);
        resolvedEmailStatus = "failed";
        resolvedEmailError = (logRow.error_message as string | null) ?? null;
        console.error("[clinical-plan-email] queued send failed", { planId: row.id, error: resolvedEmailError });
      }
    } catch (e) {
      console.error("[clinical-plan-email] reconcile failed", { planId: row.id, error: (e as Error).message });
    }
  }

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
    legacyPlan: isRelease1 ? null : withoutContactDetails(planJson),
    planVersion: (versionRow?.plan_version ?? row.plan_version ?? null) as number | null,
    emailStatus: resolvedEmailStatus,
    emailError: resolvedEmailError,
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
    .select("id, plan, plan_version, status, is_minor, guardian_email, guardian_consent, guardian_consent_at, contact_consent, email")
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

  const minor = row.is_minor || planJson.plan_variant === "adolescent";
  const recipient = minor ? (row.guardian_consent && row.guardian_consent_at ? row.guardian_email : null) : row.contact_consent ? row.email : normalized;
  if (!recipient) return { ok: false, message: "تعذر إرسال البريد الآن، حاول لاحقًا." };
  const result = await sendPlanEmailViaQueue(
    recipient,
    planJson,
    clinicalPlanUrl(planToken),
    `clinical-plan-${row.id}-v${planVersion}-resend-${Date.now()}`,
  );

  const { error: updErr } = await supabaseAdmin
    .from("quit_plans")
    .update({
      ...(!row.contact_consent && !minor ? { email: normalized } : {}),
      plan_email_consent: true,
      plan_email_consent_at: new Date().toISOString(),
      plan_email_consent_version: PLAN_EMAIL_CONSENT_VERSION,
      email_status: result.status,
      email_sent_at: result.status === "sent" ? new Date().toISOString() : null,
      email_message_id: result.messageId,
    })
    .eq("id", row.id as string);
  if (updErr) console.error("[clinical-plan-email] plan row update failed", { planId: row.id, error: updErr.message });

  if (result.status !== "sent" && result.status !== "queued") {
    console.error("[clinical-plan-email] not sent", { planId: row.id, status: result.status, error: result.error });
    return {
      ok: false,
      message: result.error === "email_suppressed"
        ? "هذا البريد مُلغى الاشتراك من رسائلنا."
        : "تعذر إرسال البريد الآن، حاول لاحقًا.",
    };
  }
  if (result.status === "queued") {
    return { ok: true, message: "جاري إرسال خطتك إلى بريدك الإلكتروني، تصلك خلال دقائق." };
  }
  return { ok: true, message: "تم إرسال خطتك إلى بريدك الإلكتروني." };
}
