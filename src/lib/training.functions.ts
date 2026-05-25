import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ensureAdmin } from "./_authz.server";
import { renderKeyValueHtml, sendAdminNotification } from "./notifications.server";
import { TRAINING_MODULES, OVERALL_PASS, MODULE_PASS } from "./training-content";

// --------- Lazy seed modules (idempotent) ---------
async function ensureModulesSeeded(): Promise<Record<string, string>> {
  const slugToId: Record<string, string> = {};
  const { data: existing } = await supabaseAdmin
    .from("training_modules" as never)
    .select("id, slug");
  const present = new Set<string>();
  for (const row of (existing as Array<{ id: string; slug: string }> | null) ?? []) {
    slugToId[row.slug] = row.id;
    present.add(row.slug);
  }
  const toInsert = TRAINING_MODULES.filter((m) => !present.has(m.slug)).map((m) => ({
    module_number: m.number,
    slug: m.slug,
    title_ar: m.title_ar,
    title_en: m.title_en,
    content_ar: m.lesson_ar,
    content_en: m.lesson_en,
    learning_objectives_ar: m.objectives_ar,
    learning_objectives_en: m.objectives_en,
    is_active: true,
  }));
  if (toInsert.length > 0) {
    const { data: inserted } = await supabaseAdmin
      .from("training_modules" as never)
      .insert(toInsert as never)
      .select("id, slug");
    for (const row of (inserted as Array<{ id: string; slug: string }> | null) ?? []) {
      slugToId[row.slug] = row.id;
    }
  }
  return slugToId;
}

// --------- Register ---------
const RegisterInput = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  mobile: z.string().trim().max(40).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  city: z.string().trim().max(80).optional(),
  age_group: z.string().trim().max(40).optional(),
  role: z.string().trim().max(60).optional(),
  preferred_language: z.enum(["ar", "en"]).default("ar"),
  consent_training_terms: z.literal(true),
});

export const registerTrainee = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RegisterInput.parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("training_users" as never)
      .insert(data as never)
      .select("id, full_name, email, preferred_language, session_token")
      .single();
    if (error || !row) {
      return { ok: false as const, error: error?.message ?? "Could not register" };
    }
    const r = row as unknown as { id: string; full_name: string; email: string; preferred_language: string; session_token: string };
    return { ok: true as const, trainee: r };
  });

// Validate that (training_user_id, session_token) belong together. Throws on mismatch.
async function ensureTraineeOwnership(training_user_id: string, session_token: string): Promise<void> {
  const { data } = await supabaseAdmin
    .from("training_users" as never)
    .select("id")
    .eq("id", training_user_id)
    .eq("session_token", session_token)
    .maybeSingle();
  if (!data) throw new Error("Forbidden: invalid trainee session");
}

// --------- Submit module attempt ---------
const ScoreInput = z.object({
  training_user_id: z.string().uuid(),
  session_token: z.string().min(8).max(80),
  module_slug: z.string().min(1).max(40),
  score: z.number().int().min(0).max(100),
});

export const submitModuleScore = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ScoreInput.parse(input))
  .handler(async ({ data }) => {
    const slugMap = await ensureModulesSeeded();
    const module_id = slugMap[data.module_slug];
    if (!module_id) return { ok: false as const, error: "Unknown module" };

    // Fetch existing row
    const { data: existing } = await supabaseAdmin
      .from("training_progress" as never)
      .select("id, score, attempts")
      .eq("training_user_id", data.training_user_id)
      .eq("module_id", module_id)
      .maybeSingle();

    const ex = existing as unknown as { id: string; score: number | null; attempts: number } | null;
    const newScore = Math.max(ex?.score ?? 0, data.score);
    const newAttempts = (ex?.attempts ?? 0) + 1;
    const completed = newScore >= MODULE_PASS;

    if (ex) {
      await supabaseAdmin
        .from("training_progress" as never)
        .update({
          score: newScore,
          attempts: newAttempts,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", ex.id);
    } else {
      await supabaseAdmin.from("training_progress" as never).insert({
        training_user_id: data.training_user_id,
        module_id,
        score: newScore,
        attempts: newAttempts,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      } as never);
    }
    return { ok: true as const, score: newScore, attempts: newAttempts, completed };
  });

// --------- Get trainee progress ---------
const ProgressInput = z.object({ training_user_id: z.string().uuid() });

export const getTraineeProgress = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ProgressInput.parse(input))
  .handler(async ({ data }) => {
    const slugMap = await ensureModulesSeeded();
    const idToSlug = Object.fromEntries(Object.entries(slugMap).map(([s, i]) => [i, s]));
    const { data: rows } = await supabaseAdmin
      .from("training_progress" as never)
      .select("module_id, score, completed, attempts")
      .eq("training_user_id", data.training_user_id);
    const progress: Record<string, { score: number; completed: boolean; attempts: number }> = {};
    for (const r of (rows as Array<{ module_id: string; score: number | null; completed: boolean; attempts: number }> | null) ?? []) {
      const slug = idToSlug[r.module_id];
      if (slug) progress[slug] = { score: r.score ?? 0, completed: r.completed, attempts: r.attempts };
    }
    // Also fetch existing certificate
    const { data: cert } = await supabaseAdmin
      .from("training_certificates" as never)
      .select("certificate_code, overall_score, issued_at, is_valid")
      .eq("training_user_id", data.training_user_id)
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { progress, certificate: cert as unknown as { certificate_code: string; overall_score: number; issued_at: string; is_valid: boolean } | null };
  });

// --------- Issue certificate ---------
const IssueInput = z.object({
  training_user_id: z.string().uuid(),
  overall_score: z.number().int().min(0).max(100),
});

function genCertCode(): string {
  const yy = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AQ-TR-${yy}-${rand}${Math.floor(1000 + Math.random() * 9000)}`;
}

function genVerifyHash(): string {
  return [...Array(24)].map(() => Math.floor(Math.random() * 36).toString(36)).join("");
}

export const issueTrainingCertificate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IssueInput.parse(input))
  .handler(async ({ data }) => {
    if (data.overall_score < OVERALL_PASS) {
      return { ok: false as const, error: "Score below pass threshold" };
    }
    // Lookup trainee
    const { data: traineeRow } = await supabaseAdmin
      .from("training_users" as never)
      .select("id, full_name, email, city, role, preferred_language")
      .eq("id", data.training_user_id)
      .maybeSingle();
    const trainee = traineeRow as unknown as { id: string; full_name: string; email: string | null; city: string | null; role: string | null; preferred_language: string } | null;
    if (!trainee) return { ok: false as const, error: "Trainee not found" };

    // Confirm all 7 modules completed
    const slugMap = await ensureModulesSeeded();
    const { data: prog } = await supabaseAdmin
      .from("training_progress" as never)
      .select("module_id, completed")
      .eq("training_user_id", data.training_user_id);
    const completed = new Set(
      ((prog as Array<{ module_id: string; completed: boolean }> | null) ?? [])
        .filter((p) => p.completed)
        .map((p) => p.module_id),
    );
    const allModuleIds = Object.values(slugMap);
    if (!allModuleIds.every((id) => completed.has(id))) {
      return { ok: false as const, error: "Not all modules completed" };
    }

    // Re-use existing certificate if present
    const { data: existing } = await supabaseAdmin
      .from("training_certificates" as never)
      .select("certificate_code, verification_hash, overall_score, issued_at")
      .eq("training_user_id", data.training_user_id)
      .maybeSingle();
    if (existing) {
      const e = existing as unknown as { certificate_code: string; verification_hash: string; overall_score: number; issued_at: string };
      return { ok: true as const, certificate_code: e.certificate_code, verification_hash: e.verification_hash, reused: true };
    }

    const certificate_code = genCertCode();
    const verification_hash = genVerifyHash();
    const { error: insErr } = await supabaseAdmin.from("training_certificates" as never).insert({
      certificate_code,
      verification_hash,
      training_user_id: data.training_user_id,
      full_name: trainee.full_name,
      overall_score: data.overall_score,
    } as never);
    if (insErr) return { ok: false as const, error: insErr.message };

    // Notifications (non-blocking)
    try {
      const adminHtml = renderKeyValueHtml({
        certificate_code,
        full_name: trainee.full_name,
        email: trainee.email,
        city: trainee.city,
        role: trainee.role,
        overall_score: data.overall_score,
      });
      await sendAdminNotification(
        "full_volunteer_application" as never,
        `New Aqla Training Certificate Issued — ${certificate_code}`,
        `<h2 style="font-family:-apple-system,Segoe UI,Arial,sans-serif">Aqla Training Certificate Issued</h2>${adminHtml}`,
        { volunteer_code: certificate_code },
      );
    } catch { /* swallow */ }

    if (trainee.email) {
      try {
        const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
        const fromAddr = process.env.EMAIL_FROM_ADDRESS || "Aqla <onboarding@resend.dev>";
        if (apiKey) {
          const lang = trainee.preferred_language === "en" ? "en" : "ar";
          const subject = lang === "ar" ? "شهادة تدريب أقلع الخاصة بك" : "Your Aqla Training Certificate";
          const url = `https://aqla-support.lovable.app/certificate/${certificate_code}`;
          const body = lang === "ar"
            ? `<p>مبروك! لقد أتممت بنجاح تدريب متطوعي أقلع لدعم الإقلاع عن التدخين والنيكوتين.</p><p>شهادتك متاحة هنا: <a href="${url}">${url}</a></p>`
            : `<p>Congratulations! You have successfully completed the Aqla Volunteer Smoking and Nicotine Cessation Support Training.</p><p>Your certificate is available here: <a href="${url}">${url}</a></p>`;
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: fromAddr, to: [trainee.email], subject, html: body }),
          });
        }
        await supabaseAdmin.from("notification_log").insert({
          event_type: "training_certificate_issued" as never,
          recipient_email: trainee.email,
          subject: "Aqla Training Certificate",
          sent_status: apiKey ? "sent" : "pending_provider_setup",
          sent_at: apiKey ? new Date().toISOString() : null,
          volunteer_code: certificate_code,
        } as never);
      } catch { /* swallow */ }
    }

    return { ok: true as const, certificate_code, verification_hash, reused: false };
  });

// --------- Verify certificate (public-safe) ---------
const VerifyInput = z.object({ code: z.string().trim().min(4).max(64) });

export const verifyCertificate = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => VerifyInput.parse(input))
  .handler(async ({ data }) => {
    const { data: row } = await supabaseAdmin.rpc("verify_training_certificate" as never, { p_code: data.code } as never);
    return (row ?? { found: false }) as {
      found: boolean;
      is_valid?: boolean;
      full_name?: string;
      certificate_code?: string;
      overall_score?: number;
      issued_at?: string;
      title_en?: string;
      title_ar?: string;
    };
  });

// --------- Admin analytics ---------
export const getAdminTrainingAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data, error } = await supabaseAdmin.rpc("get_admin_training_analytics" as never);
    if (error) return { ok: false as const, error: error.message, analytics_json: null as string | null };
    return { ok: true as const, error: null as string | null, analytics_json: JSON.stringify(data ?? null) as string | null };
  });

// --------- Admin list trainees & export ---------
export const listTrainees = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
    const { data: users } = await supabaseAdmin
      .from("training_users" as never)
      .select("id, full_name, email, mobile, city, role, created_at, preferred_language")
      .order("created_at", { ascending: false })
      .limit(500);
    const { data: certs } = await supabaseAdmin
      .from("training_certificates" as never)
      .select("training_user_id, certificate_code, overall_score, issued_at, is_valid");
    const certByUser = new Map<string, { certificate_code: string; overall_score: number; issued_at: string; is_valid: boolean }>();
    for (const c of (certs as Array<{ training_user_id: string; certificate_code: string; overall_score: number; issued_at: string; is_valid: boolean }> | null) ?? []) {
      certByUser.set(c.training_user_id, c);
    }
    type Row = {
      id: string; full_name: string; email: string; mobile: string | null; city: string | null;
      role: string | null; created_at: string; preferred_language: string | null;
      certificate_code: string | null; overall_score: number | null; issued_at: string | null; is_valid: boolean | null;
    };
    const rows: Row[] = ((users as Array<Omit<Row, "certificate_code" | "overall_score" | "issued_at" | "is_valid">> | null) ?? []).map((u) => {
      const c = certByUser.get(u.id);
      return {
        ...u,
        certificate_code: c?.certificate_code ?? null,
        overall_score: c?.overall_score ?? null,
        issued_at: c?.issued_at ?? null,
        is_valid: c?.is_valid ?? null,
      };
    });
    return { rows };
  });

export const revokeCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ certificate_code: z.string().min(4).max(64), valid: z.boolean() }).parse(input))
  .handler(async ({ context, data }) => {
    await ensureAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("training_certificates" as never)
      .update({ is_valid: data.valid } as never)
      .eq("certificate_code", data.certificate_code);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
