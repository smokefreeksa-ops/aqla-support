import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------------------------------------------------------------------------
// Aqla Learner Dashboard — server data layer
// Multi-tenant aware: every read/write is scoped to (user_id, org, program).
// The signed-in user id ALWAYS comes from the verified bearer token, never
// from client input.
// ---------------------------------------------------------------------------

export const DEFAULT_ORG = "aqla";
export const DEFAULT_PROGRAM = "academy";
export const ACADEMY_DOMAIN = "academy";

export type LearnerProfile = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  city: string | null;
  preferred_language: string;
  org_slug: string;
  program_slug: string;
  created_at: string;
};

export type ProgressRow = {
  lesson_slug: string;
  completed: boolean;
  practice_score: number | null;
  completed_at: string | null;
  updated_at: string | null;
};

export type CertificateRow = {
  id: string;
  certificate_code: string;
  full_name: string;
  module_slug: string | null;
  certificate_type: string;
  overall_score: number | null;
  is_valid: boolean;
  issued_at: string;
};

export type ExamAttemptRow = {
  id: string;
  score: number | null;
  passed: boolean | null;
  created_at: string;
};

export type OrganisationRow = {
  slug: string;
  name_ar: string;
  name_en: string;
  logo_url: string | null;
  primary_color: string;
};

export type LiveSessionRow = {
  id: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  session_type: string;
  starts_at: string;
  ends_at: string | null;
  join_url: string | null;
};

export type LearnerDashboardData = {
  profile: LearnerProfile;
  organisation: OrganisationRow | null;
  progress: ProgressRow[];
  certificates: CertificateRow[];
  examAttempts: ExamAttemptRow[];
  sessions: LiveSessionRow[];
};

export const getLearnerDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const email = (context.claims as { email?: string } | null)?.email ?? null;

    // Ensure a learner profile row exists (one source of truth for identity).
    let { data: profile } = await supabaseAdmin
      .from("learner_profiles" as never)
      .select("user_id, full_name, email, city, preferred_language, org_slug, program_slug, created_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (!profile) {
      await supabaseAdmin
        .from("learner_profiles" as never)
        .insert({ user_id: userId, email, org_slug: DEFAULT_ORG, program_slug: DEFAULT_PROGRAM } as never);
      const again = await supabaseAdmin
        .from("learner_profiles" as never)
        .select("user_id, full_name, email, city, preferred_language, org_slug, program_slug, created_at")
        .eq("user_id", userId)
        .maybeSingle();
      profile = again.data;
    }

    const p = (profile ?? {
      user_id: userId,
      full_name: null,
      email,
      city: null,
      preferred_language: "ar",
      org_slug: DEFAULT_ORG,
      program_slug: DEFAULT_PROGRAM,
      created_at: new Date().toISOString(),
    }) as unknown as LearnerProfile;

    const [orgRes, progressRes, certRes, examRes, sessionRes] = await Promise.all([
      supabaseAdmin
        .from("organisations" as never)
        .select("slug, name_ar, name_en, logo_url, primary_color")
        .eq("slug", p.org_slug)
        .maybeSingle(),
      supabaseAdmin
        .from("academy_progress" as never)
        .select("lesson_slug, completed, practice_score, completed_at, updated_at")
        .eq("user_id", userId)
        .eq("domain_slug", ACADEMY_DOMAIN),
      supabaseAdmin
        .from("academy_certificates" as never)
        .select("id, certificate_code, full_name, module_slug, certificate_type, overall_score, is_valid, issued_at")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false }),
      supabaseAdmin
        .from("academy_exam_attempts" as never)
        .select("id, score, passed, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("live_sessions" as never)
        .select("id, title_ar, title_en, description_ar, description_en, session_type, starts_at, ends_at, join_url")
        .eq("is_published", true)
        .eq("org_slug", p.org_slug)
        .order("starts_at", { ascending: true }),
    ]);

    return {
      profile: p,
      organisation: (orgRes.data ?? null) as unknown as OrganisationRow | null,
      progress: ((progressRes.data ?? []) as unknown as ProgressRow[]),
      certificates: ((certRes.data ?? []) as unknown as CertificateRow[]),
      examAttempts: ((examRes.data ?? []) as unknown as ExamAttemptRow[]),
      sessions: ((sessionRes.data ?? []) as unknown as LiveSessionRow[]),
    } satisfies LearnerDashboardData;
  });

const SaveProfileInput = z.object({
  full_name: z.string().trim().min(2).max(120).nullable().optional(),
  city: z.string().trim().min(1).max(80).nullable().optional(),
  preferred_language: z.enum(["ar", "en"]).optional(),
});

export const saveLearnerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveProfileInput.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (data.full_name !== undefined) patch.full_name = data.full_name;
    if (data.city !== undefined) patch.city = data.city;
    if (data.preferred_language) patch.preferred_language = data.preferred_language;

    const { error } = await supabaseAdmin
      .from("learner_profiles" as never)
      .upsert({ user_id: context.userId, ...patch } as never, { onConflict: "user_id" });
    if (error) return { ok: false, error: error.message };
    return { ok: true, error: null as string | null };
  });

const ProgressInput = z.object({
  module_slug: z.string().min(1).max(64).regex(/^[a-z0-9_-]+$/),
  completed: z.boolean().default(false),
  practice_score: z.number().min(0).max(100).nullable().optional(),
});

export const markModuleProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProgressInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    const { data: existing } = await supabaseAdmin
      .from("academy_progress" as never)
      .select("id, completed")
      .eq("user_id", userId)
      .eq("domain_slug", ACADEMY_DOMAIN)
      .eq("lesson_slug", data.module_slug)
      .maybeSingle();

    const row = {
      user_id: userId,
      domain_slug: ACADEMY_DOMAIN,
      lesson_slug: data.module_slug,
      completed: data.completed || !!(existing as { completed?: boolean } | null)?.completed,
      practice_score: data.practice_score ?? null,
      completed_at: data.completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
      org_slug: DEFAULT_ORG,
      program_slug: DEFAULT_PROGRAM,
    };

    if (existing) {
      const { error } = await supabaseAdmin
        .from("academy_progress" as never)
        .update(row as never)
        .eq("id", (existing as { id: string }).id);
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabaseAdmin.from("academy_progress" as never).insert(row as never);
      if (error) return { ok: false, error: error.message };
    }
    return { ok: true, error: null as string | null };
  });
