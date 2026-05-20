import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// ============================================================
// Aqla Academy — STUBS
// These are intentionally minimal scaffolds. Full curriculum
// serving, server-side scoring, and certificate issuance will
// land in a dedicated pass after Part 4.
// ============================================================

export type AcademyTrackRow = {
  id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  summary_en: string | null;
  summary_ar: string | null;
};

export type AcademyModuleRow = {
  id: string;
  track_id: string;
  slug: string;
  title_en: string;
  title_ar: string;
  summary_en: string | null;
  summary_ar: string | null;
  requires_assessment: boolean;
};

export const listAcademyTracks = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("academy_tracks" as never)
    .select("id, slug, title_en, title_ar, summary_en, summary_ar, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) {
    console.error("listAcademyTracks:", error);
    return { tracks: [] as AcademyTrackRow[], error: error.message };
  }
  return { tracks: (data ?? []) as unknown as AcademyTrackRow[], error: null as string | null };
});

const ListModulesInput = z.object({
  track_slug: z.string().min(1).max(64).regex(/^[a-z0-9_-]+$/),
});

export const listAcademyModules = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => ListModulesInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { data: track, error: tErr } = await supabaseAdmin
      .from("academy_tracks" as never)
      .select("id")
      .eq("slug", data.track_slug)
      .eq("is_active", true)
      .maybeSingle();
    if (tErr || !track) {
      return { modules: [] as AcademyModuleRow[], error: tErr?.message ?? "track_not_found" };
    }
    const { data: mods, error } = await supabaseAdmin
      .from("academy_modules" as never)
      .select("id, track_id, slug, title_en, title_ar, summary_en, summary_ar, requires_assessment, sort_order, is_active")
      .eq("track_id", (track as { id: string }).id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    if (error) {
      return { modules: [] as AcademyModuleRow[], error: error.message };
    }
    return { modules: (mods ?? []) as unknown as AcademyModuleRow[], error: null as string | null };
  });

const ServeModuleInput = z.object({
  module_slug: z.string().min(1).max(64).regex(/^[a-z0-9_-]+$/),
});

// STUB: returns module metadata + active lesson list, but NOT
// the sensitive question/scenario bodies. Full assessment payload
// will be served by a future serveModuleAssessment fn that
// returns only safe-to-render prompts (no scoring metadata).
export const serveAcademyModule = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => ServeModuleInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    type ModRow = {
      id: string;
      slug: string;
      title_en: string;
      title_ar: string;
      summary_en: string | null;
      summary_ar: string | null;
      requires_assessment: boolean;
      pass_threshold: number;
    };
    type LessonRow = {
      id: string;
      slug: string;
      title_en: string;
      title_ar: string;
      lesson_type: string;
      sort_order: number;
    };
    const { data: mod, error } = await supabaseAdmin
      .from("academy_modules" as never)
      .select("id, slug, title_en, title_ar, summary_en, summary_ar, requires_assessment, pass_threshold")
      .eq("slug", data.module_slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !mod) {
      return {
        module: null as ModRow | null,
        lessons: [] as LessonRow[],
        error: error?.message ?? "module_not_found",
      };
    }
    const { data: lessons } = await supabaseAdmin
      .from("academy_lessons" as never)
      .select("id, slug, title_en, title_ar, lesson_type, sort_order")
      .eq("module_id", (mod as unknown as ModRow).id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });
    return {
      module: mod as unknown as ModRow,
      lessons: ((lessons ?? []) as unknown as LessonRow[]),
      error: null as string | null,
    };
  });

const SubmitAttemptInput = z.object({
  module_slug: z.string().min(1).max(64).regex(/^[a-z0-9_-]+$/),
  raw_answers: z.record(z.string().min(1).max(128), z.unknown()),
  anonymous_session_id: z.string().max(128).nullable().optional(),
  duration_seconds: z.number().int().min(0).max(7200).nullable().optional(),
  language: z.string().min(2).max(8).nullable().optional(),
});

// STUB: stores the raw attempt but does NOT score yet.
// Real server-side scoring (using academy_sensitive_questions
// / academy_sensitive_scenarios) will land in the dedicated
// Academy pass after Part 4.
export const submitAcademyAttempt = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitAttemptInput.parse(input))
  .handler(async ({ data }) => {
    const { data: mod, error: mErr } = await supabaseAdmin
      .from("academy_modules" as never)
      .select("id")
      .eq("slug", data.module_slug)
      .eq("is_active", true)
      .maybeSingle();
    if (mErr || !mod) {
      return { ok: false, attempt_id: null as string | null, error: mErr?.message ?? "module_not_found" };
    }
    const { data: row, error } = await supabaseAdmin
      .from("academy_attempts" as never)
      .insert({
        module_id: (mod as { id: string }).id,
        anonymous_session_id: data.anonymous_session_id ?? null,
        raw_answers: data.raw_answers,
        score: null,
        passed: null,
        duration_seconds: data.duration_seconds ?? null,
        language: data.language ?? null,
      } as never)
      .select("id")
      .single();
    if (error) {
      console.error("submitAcademyAttempt:", error);
      return { ok: false, attempt_id: null as string | null, error: error.message };
    }
    return {
      ok: true,
      attempt_id: (row as { id: string }).id,
      scored: false as const,
      message: "Attempt stored. Scoring will be enabled in the next Academy pass.",
      error: null as string | null,
    };
  });
