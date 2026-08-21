import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ensureAdmin } from "./_authz.server";

export type ImpactStats = {
  total_visits: number;
  unique_visitors: number;
  visits_today: number;
  assessments_started: number;
  assessments_completed: number;
  total_assessments: number;
  assessment_completion_rate: number;
  quit_track_clicks: number;
  volunteer_track_clicks: number;
  support_pathway_count: number;
  doctor_review_count: number;
  volunteer_applicants: number;
  cities_represented: number;
  follow_up_visits_logged: number;
  research_consent_count: number;
  whatsapp_clicks: number;
  chatbot_opens: number;
  average_session_duration_seconds: number;
};

const EMPTY_STATS: ImpactStats = {
  total_visits: 0, unique_visitors: 0, visits_today: 0,
  assessments_started: 0, assessments_completed: 0, total_assessments: 0,
  assessment_completion_rate: 0, quit_track_clicks: 0, volunteer_track_clicks: 0,
  support_pathway_count: 0, doctor_review_count: 0, volunteer_applicants: 0,
  cities_represented: 0, follow_up_visits_logged: 0, research_consent_count: 0,
  whatsapp_clicks: 0, chatbot_opens: 0, average_session_duration_seconds: 0,
};

export const getPublicImpactStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("get_public_impact_stats" as never);
  if (error) {
    console.error("get_public_impact_stats error", error);
    return EMPTY_STATS;
  }
  return { ...EMPTY_STATS, ...((data as unknown) as Partial<ImpactStats>) };
});

const PUBLIC_PATHS = new Set(["/", "/about", "/assessment", "/volunteer"]);
const BLOCKED_PATHS = new Set(["/admin", "/auth"]);

function isPublicPath(p: string): boolean {
  if (BLOCKED_PATHS.has(p)) return false;
  if (p.startsWith("/admin")) return false;
  return PUBLIC_PATHS.has(p);
}

// ============ Page analytics: entry + duration ============

const PageEntryInput = z.object({
  page_path: z.string().min(1).max(255),
  page_title: z.string().max(255).optional().nullable(),
  language: z.enum(["ar", "en"]).optional().nullable(),
  referrer_type: z.string().max(64).optional().nullable(),
  anonymous_session_id: z.string().min(1).max(128),
});

export const recordPageEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PageEntryInput.parse(input))
  .handler(async ({ data }) => {
    if (!isPublicPath(data.page_path)) return { id: null };
    const { data: row, error } = await supabaseAdmin
      .from("page_analytics" as never)
      .insert({
        anonymous_session_id: data.anonymous_session_id,
        page_path: data.page_path,
        page_title: data.page_title ?? null,
        language: data.language ?? null,
        referrer_type: data.referrer_type ?? null,
      } as never)
      .select("id")
      .single();
    if (error) {
      console.error("recordPageEntry error", error);
      return { id: null };
    }
    return { id: (row as { id: string }).id };
  });

const DurationInput = z.object({
  id: z.string().uuid(),
  duration_seconds: z.number().int().min(0).max(1800),
});

export const recordPageDuration = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => DurationInput.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("page_analytics" as never)
      .update({
        duration_seconds: data.duration_seconds,
        exit_time: new Date().toISOString(),
      } as never)
      .eq("id", data.id);
    if (error) console.error("recordPageDuration error", error);
    return { ok: !error };
  });

// ============ Engagement events ============

const ALLOWED_EVENTS = new Set([
  "homepage_viewed", "about_viewed", "assessment_viewed", "volunteer_viewed", "result_viewed",
  "quit_track_clicked", "volunteer_track_clicked",
  "assessment_started", "consent_completed", "product_step_completed",
  "dependence_step_completed", "readiness_step_completed", "risk_step_completed",
  "assessment_completed",
  "followup_requested",
  "volunteer_started", "volunteer_completed",
  "whatsapp_clicked",
  "social_instagram_clicked", "social_x_clicked", "social_tiktok_clicked", "social_youtube_clicked",
  "chatbot_opened", "chatbot_message_sent",
]);

const EventInput = z.object({
  event_type: z.string().min(1).max(64),
  page_path: z.string().max(255).optional().nullable(),
  event_label: z.string().max(128).optional().nullable(),
  anonymous_session_id: z.string().min(1).max(128),
});

export const recordEngagementEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EventInput.parse(input))
  .handler(async ({ data }) => {
    if (!ALLOWED_EVENTS.has(data.event_type)) return { recorded: false };
    const { error } = await supabaseAdmin
      .from("engagement_events" as never)
      .insert({
        anonymous_session_id: data.anonymous_session_id,
        event_type: data.event_type,
        page_path: data.page_path ?? null,
        event_label: data.event_label ?? null,
      } as never);
    if (error) {
      console.error("recordEngagementEvent error", error);
      return { recorded: false };
    }
    return { recorded: true };
  });

// ============ Admin analytics dashboard ============

export type AdminAnalytics = {
  visits_by_day: Array<{ day: string; visits: number; unique_visitors: number }>;
  avg_session_duration_seconds: number;
  bounce_rate: number;
  assessment_funnel: Record<string, number>;
  volunteer_funnel: Record<string, number>;
  language_distribution: Record<string, number>;
  referrer_distribution: Record<string, number>;
  city_distribution: Record<string, number>;
  cohort_distribution: Record<string, number>;
  product_distribution: Record<string, number>;
  doctor_review_count: number;
  research_consent_count: number;
  follow_up_visits_logged: number;
  whatsapp_clicks: number;
  chatbot_opens: number;
};

const EMPTY_ADMIN: AdminAnalytics = {
  visits_by_day: [],
  avg_session_duration_seconds: 0, bounce_rate: 0,
  assessment_funnel: {}, volunteer_funnel: {},
  language_distribution: {}, referrer_distribution: {},
  city_distribution: {}, cohort_distribution: {}, product_distribution: {},
  doctor_review_count: 0, research_consent_count: 0, follow_up_visits_logged: 0,
  whatsapp_clicks: 0, chatbot_opens: 0,
};

export const getAdminAnalyticsDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
  const { data, error } = await supabaseAdmin.rpc("get_admin_analytics_dashboard" as never);
  if (error) {
    console.error("get_admin_analytics_dashboard error", error);
    return EMPTY_ADMIN;
  }
  return { ...EMPTY_ADMIN, ...((data as unknown) as Partial<AdminAnalytics>) };
});

// Legacy alias for components that still call trackPageView.
export const trackPageView = recordPageEntry;
