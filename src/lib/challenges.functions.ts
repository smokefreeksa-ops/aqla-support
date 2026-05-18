import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ChallengePublicStats = {
  generated_at: string;
  total_pledges: number;
  quit_pledges: number;
  supporter_pledges: number;
  cities_participating: number;
  challenge_shares: number;
  whatsapp_shares: number;
  x_shares: number;
  copy_shares: number;
  save_it_calculations: number;
  total_estimated_yearly_savings: number;
  first_step_challenges: number;
  trigger_battles_completed: number;
  twentyeight_day_starts: number;
  volunteers_joined: number;
};

export type AdminChallengeAnalytics = {
  generated_at: string;
  engagement_by_day: { day: string; events: number }[];
  by_challenge: Record<string, number>;
  share_clicks: Record<string, number>;
  top_triggers: Record<string, number>;
  city_leaderboard: { city: string; events: number }[];
  estimated_savings_total: number;
  conversion_to_assessment: number;
  conversion_to_volunteer: number;
  most_used_challenge: string | null;
};

export const getChallengePublicStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("get_challenge_public_stats" as never);
  if (error) {
    console.error("get_challenge_public_stats error:", error);
    return { stats: null as ChallengePublicStats | null, error: error.message };
  }
  return { stats: data as unknown as ChallengePublicStats, error: null as string | null };
});

export const getAdminChallengeAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("get_admin_challenge_analytics" as never);
  if (error) {
    console.error("get_admin_challenge_analytics error:", error);
    return { analytics: null as AdminChallengeAnalytics | null, error: error.message };
  }
  return { analytics: data as unknown as AdminChallengeAnalytics, error: null as string | null };
});

const ChallengeEventInput = z.object({
  challenge_type: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/),
  event_type: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/),
  city: z.string().trim().min(1).max(80).nullable().optional(),
  region: z.string().trim().min(1).max(80).nullable().optional(),
  value_numeric: z.number().finite().min(0).max(1e9).nullable().optional(),
  value_label: z.string().trim().min(1).max(120).nullable().optional(),
  anonymous_session_id: z.string().max(128).nullable().optional(),
});

export const recordChallengeEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChallengeEventInput.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("challenge_events" as never).insert({
      challenge_type: data.challenge_type,
      event_type: data.event_type,
      city: data.city ?? null,
      region: data.region ?? null,
      value_numeric: data.value_numeric ?? null,
      value_label: data.value_label ?? null,
      anonymous_session_id: data.anonymous_session_id ?? null,
    } as never);
    if (error) {
      console.error("recordChallengeEvent error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  });
