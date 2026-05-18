import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type LeaderboardEntry = {
  rank: number;
  display_name: string | null;
  social_handle: string | null;
  city: string | null;
  score: number;
  duration_seconds: number | null;
  badge: string | null;
  module_slug: string | null;
  date: string;
};

export type LearnTopLeaderboard = {
  generated_at: string;
  window: string;
  city_filter: string | null;
  entries: LeaderboardEntry[];
};

export type LearnPublicStats = {
  generated_at: string;
  participants: number;
  completed_quizzes: number;
  average_score: number;
  badges_earned: number;
  top_city_week: string | null;
  most_attempted_module: string | null;
};

export type AdminLearnAnalytics = {
  generated_at: string;
  total_attempts: number;
  unique_participants: number;
  average_score: number;
  attempts_by_module: Record<string, number>;
  avg_score_by_module: Record<string, number>;
  city_leaderboard: { city: string; attempts: number; avg_score: number }[];
  pending_leaderboard: number;
  approved_leaderboard: number;
  hidden_leaderboard: number;
  attempts_by_day: { day: string; attempts: number }[];
};

export const getLearnTopLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({
      window: z.enum(["week", "all"]).default("all"),
      city: z.string().trim().min(1).max(80).optional().nullable(),
    }).parse(input ?? {}),
  )
  .handler(async ({ data }) => {
    const { data: res, error } = await supabaseAdmin.rpc("get_learn_top_leaderboard" as never, {
      p_window: data.window,
      p_city: data.city ?? null,
    } as never);
    if (error) {
      console.error("get_learn_top_leaderboard error:", error);
      return { leaderboard: null as LearnTopLeaderboard | null, error: error.message };
    }
    return { leaderboard: res as unknown as LearnTopLeaderboard, error: null as string | null };
  });

export const getLearnPublicStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("get_learn_public_stats" as never);
  if (error) {
    console.error("get_learn_public_stats error:", error);
    return { stats: null as LearnPublicStats | null, error: error.message };
  }
  return { stats: data as unknown as LearnPublicStats, error: null as string | null };
});

export const getAdminLearnAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("get_admin_learn_analytics" as never);
  if (error) {
    console.error("get_admin_learn_analytics error:", error);
    return { analytics: null as AdminLearnAnalytics | null, error: error.message };
  }
  return { analytics: data as unknown as AdminLearnAnalytics, error: null as string | null };
});

const SubmitAttemptInput = z.object({
  module_slug: z.string().min(1).max(64).regex(/^[a-z0-9_-]+$/),
  score: z.number().int().min(0).max(100),
  total_questions: z.number().int().min(1).max(20),
  correct_answers: z.number().int().min(0).max(20),
  duration_seconds: z.number().int().min(0).max(3600).nullable().optional(),
  city: z.string().trim().min(1).max(80).nullable().optional(),
  anonymous_session_id: z.string().max(128).nullable().optional(),
});

export const submitQuizAttempt = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitAttemptInput.parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("quiz_attempts" as never)
      .insert({
        module_slug: data.module_slug,
        score: data.score,
        total_questions: data.total_questions,
        correct_answers: data.correct_answers,
        duration_seconds: data.duration_seconds ?? null,
        city: data.city ?? null,
        anonymous_session_id: data.anonymous_session_id ?? null,
      } as never)
      .select("id")
      .single();
    if (error) {
      console.error("submitQuizAttempt error:", error);
      return { ok: false, attempt_id: null as string | null, error: error.message };
    }
    return { ok: true, attempt_id: (row as { id: string }).id, error: null as string | null };
  });

const INAPPROPRIATE = /(fuck|shit|bitch|كلب|حمار|عاهر)/i;

const SubmitLeaderboardInput = z.object({
  quiz_attempt_id: z.string().uuid().nullable().optional(),
  module_slug: z.string().min(1).max(64).regex(/^[a-z0-9_-]+$/),
  display_name: z.string().trim().min(1).max(40).nullable().optional(),
  social_handle: z.string().trim().min(1).max(60).nullable().optional(),
  city: z.string().trim().min(1).max(80).nullable().optional(),
  score: z.number().int().min(0).max(100),
  duration_seconds: z.number().int().min(0).max(3600).nullable().optional(),
  badge: z.string().trim().min(1).max(40).nullable().optional(),
  consent_public_display: z.literal(true),
  consent_social_tag: z.boolean().default(false),
  is_under_18: z.boolean().default(false),
});

export const submitLeaderboardEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitLeaderboardInput.parse(input))
  .handler(async ({ data }) => {
    const flaggedName = data.display_name && INAPPROPRIATE.test(data.display_name);
    const hasHandle = data.consent_social_tag && data.social_handle && !data.is_under_18;
    // Auto-approve nickname entries that pass moderation; handles always require admin review
    const auto_approve = !flaggedName && !hasHandle;
    const { error } = await supabaseAdmin.from("leaderboard_entries" as never).insert({
      quiz_attempt_id: data.quiz_attempt_id ?? null,
      module_slug: data.module_slug,
      display_name: data.display_name ?? null,
      social_handle: data.is_under_18 ? null : (data.social_handle ?? null),
      city: data.city ?? null,
      score: data.score,
      duration_seconds: data.duration_seconds ?? null,
      badge: data.badge ?? null,
      consent_public_display: true,
      consent_social_tag: data.consent_social_tag,
      is_under_18: data.is_under_18,
      is_approved: auto_approve,
      is_hidden: false,
    } as never);
    if (error) {
      console.error("submitLeaderboardEntry error:", error);
      return { ok: false, error: error.message, pending: !auto_approve };
    }
    return { ok: true, error: null as string | null, pending: !auto_approve };
  });

const AdminListInput = z.object({
  status: z.enum(["pending", "approved", "hidden", "all"]).default("pending"),
});

export const adminListLeaderboard = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => AdminListInput.parse(input ?? {}))
  .handler(async ({ data }) => {
    const { data: res, error } = await supabaseAdmin.rpc("admin_list_leaderboard" as never, {
      p_status: data.status,
    } as never);
    type Row = {
      id: string;
      module_slug: string;
      display_name: string | null;
      social_handle: string | null;
      city: string | null;
      score: number;
      duration_seconds: number | null;
      badge: string | null;
      is_approved: boolean;
      is_hidden: boolean;
      is_under_18: boolean;
      created_at: string;
    };
    if (error) return { rows: [] as Row[], error: error.message };
    return { rows: ((res as Row[]) ?? []), error: null as string | null };
  });

const ModerateInput = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "hide", "remove_handle"]),
});

export const moderateLeaderboardEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ModerateInput.parse(input))
  .handler(async ({ data }) => {
    const patch: Record<string, unknown> =
      data.action === "approve" ? { is_approved: true, is_hidden: false }
      : data.action === "hide" ? { is_hidden: true, is_approved: false }
      : { social_handle: null, consent_social_tag: false };
    const { error } = await supabaseAdmin
      .from("leaderboard_entries" as never)
      .update(patch as never)
      .eq("id", data.id);
    if (error) return { ok: false, error: error.message };
    return { ok: true, error: null as string | null };
  });
