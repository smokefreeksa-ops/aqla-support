import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MODULES } from "@/data/modules";
import {
  scoreAttempt,
  ACADEMY_ASSESSMENT_VERSION,
} from "@/lib/assessment-runtime";

const IssueInput = z.object({
  module_slug: z.string().min(1).max(64),
  full_name: z.string().min(2).max(120),
  // v2 shape: { [questionId]: optionKey }. Also accepts legacy numeric indices
  // as strings for backward compat, but v2 quizzes always send keys.
  answers: z.record(z.string(), z.string().min(1).max(8)),
  scope_accepted: z.boolean(),
  language: z.string().max(8).nullable().optional(),
  duration_seconds: z.number().int().min(0).max(7200).nullable().optional(),
  recipient_email: z.string().email().max(254).nullable().optional(),
  assessment_version: z.string().max(16).optional(),
});

function randomCode(len = 10) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

const SITE_NAME = "aqla-support";
const SENDER_DOMAIN = "notify.aqla1.com";
const FROM_DOMAIN = "aqla1.com";
const PUBLIC_SITE_URL = "https://aqla1.com";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function enqueueCertificateEmail(params: {
  recipient: string;
  fullName: string;
  moduleTitleEn: string;
  moduleTitleAr: string;
  score: number;
  certificateCode: string;
}) {
  try {
    const [{ supabaseAdmin }, React, { render }, { TEMPLATES }] = await Promise.all([
      import("@/integrations/supabase/client.server"),
      import("react"),
      import("@react-email/render"),
      import("@/lib/email-templates/registry"),
    ]);

    const template = TEMPLATES["academy-certificate"];
    if (!template) {
      console.error("academy-certificate template not registered");
      return;
    }

    const normalizedEmail = params.recipient.toLowerCase();
    const messageId = crypto.randomUUID();
    const certificateUrl = `${PUBLIC_SITE_URL}/academy-certificate/${params.certificateCode}`;

    const { data: suppressed } = await supabaseAdmin
      .from("suppressed_emails" as never)
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (suppressed) return;

    let unsubscribeToken = generateToken();
    await supabaseAdmin
      .from("email_unsubscribe_tokens" as never)
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail } as never,
        { onConflict: "email", ignoreDuplicates: true },
      );
    const { data: storedToken } = await supabaseAdmin
      .from("email_unsubscribe_tokens" as never)
      .select("token")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (storedToken && (storedToken as { token?: string }).token) {
      unsubscribeToken = (storedToken as { token: string }).token;
    }

    const templateData = {
      fullName: params.fullName,
      moduleTitleEn: params.moduleTitleEn,
      moduleTitleAr: params.moduleTitleAr,
      score: params.score,
      certificateCode: params.certificateCode,
      certificateUrl,
    };

    const element = React.createElement(template.component, templateData);
    const html = await render(element);
    const text = await render(element, { plainText: true });
    const subject =
      typeof template.subject === "function"
        ? template.subject(templateData)
        : template.subject;

    await supabaseAdmin.from("email_send_log" as never).insert({
      message_id: messageId,
      template_name: "academy-certificate",
      recipient_email: params.recipient,
      status: "pending",
    } as never);

    const { error: enqueueError } = await supabaseAdmin.rpc("enqueue_email" as never, {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        to: params.recipient,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: "transactional",
        label: "academy-certificate",
        idempotency_key: `academy-cert-${params.certificateCode}`,
        unsubscribe_token: unsubscribeToken,
        queued_at: new Date().toISOString(),
      },
    } as never);

    if (enqueueError) {
      console.error("cert email enqueue failed:", enqueueError);
      await supabaseAdmin.from("email_send_log" as never).insert({
        message_id: messageId,
        template_name: "academy-certificate",
        recipient_email: params.recipient,
        status: "failed",
        error_message: "Failed to enqueue email",
      } as never);
    }
  } catch (err) {
    console.error("enqueueCertificateEmail error:", err);
  }
}

export const issueAcademyCertificate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IssueInput.parse(input))
  .handler(async ({ data }) => {
    const mod = MODULES.find((m) => m.slug === data.module_slug);
    if (!mod) {
      return {
        ok: false as const,
        error: "module_not_found",
        certificate_code: null as string | null,
        score: 0,
        threshold: 80,
        safety_critical_passed: false,
        safety_critical_missed: [] as string[],
      };
    }

    // v2 server-side scoring by stable answer keys — position-independent.
    const result = scoreAttempt(mod.quiz, data.answers, 80);

    // Scope acceptance is required.
    if (!data.scope_accepted) {
      return {
        ok: false as const,
        error: "scope_not_accepted",
        certificate_code: null,
        score: result.percent,
        threshold: 80,
        safety_critical_passed: result.safetyCriticalPassed,
        safety_critical_missed: result.safetyCriticalMissed,
      };
    }

    // Overall pass mark.
    if (!result.passed) {
      return {
        ok: false as const,
        error: "score_below_threshold",
        certificate_code: null,
        score: result.percent,
        threshold: 80,
        safety_critical_passed: result.safetyCriticalPassed,
        safety_critical_missed: result.safetyCriticalMissed,
      };
    }

    // Safety-critical gate — a passing overall score cannot compensate for
    // an unsafe answer to a safety-critical question.
    if (!result.safetyCriticalPassed) {
      return {
        ok: false as const,
        error: "safety_critical_failed",
        certificate_code: null,
        score: result.percent,
        threshold: 80,
        safety_critical_passed: false,
        safety_critical_missed: result.safetyCriticalMissed,
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = `AQLA-AC-${randomCode(8)}`;
    const hash = randomCode(24);
    const { error } = await supabaseAdmin
      .from("academy_certificates" as never)
      .insert({
        certificate_code: code,
        verification_hash: hash,
        full_name: data.full_name.trim(),
        module_slug: data.module_slug,
        overall_score: result.percent,
        is_valid: true,
        assessment_version: data.assessment_version ?? ACADEMY_ASSESSMENT_VERSION,
        safety_critical_passed: true,
        scope_accepted: true,
      } as never);
    if (error) {
      console.error("issueAcademyCertificate:", error);
      return {
        ok: false as const,
        error: error.message,
        certificate_code: null,
        score: result.percent,
        threshold: 80,
        safety_critical_passed: true,
        safety_critical_missed: [] as string[],
      };
    }

    if (data.recipient_email) {
      await enqueueCertificateEmail({
        recipient: data.recipient_email,
        fullName: data.full_name.trim(),
        moduleTitleEn: mod.title.en,
        moduleTitleAr: mod.title.ar,
        score: result.percent,
        certificateCode: code,
      });
    }

    return {
      ok: true as const,
      certificate_code: code,
      score: result.percent,
      threshold: 80,
      safety_critical_passed: true,
      safety_critical_missed: [] as string[],
      error: null as string | null,
      emailed: !!data.recipient_email,
    };
  });

const VerifyInput = z.object({ code: z.string().min(3).max(64) });

export const verifyAcademyCertificate = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => VerifyInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.rpc("verify_academy_certificate" as never, { p_code: data.code } as never);
    return JSON.parse(JSON.stringify(row ?? { found: false })) as {
      found: boolean;
      is_valid?: boolean;
      full_name?: string;
      certificate_code?: string;
      module_slug?: string;
      track_slug?: string;
      overall_score?: number;
      issued_at?: string;
      title_en?: string;
      title_ar?: string;
    };
  });
