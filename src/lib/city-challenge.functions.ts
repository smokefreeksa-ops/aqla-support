import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type CityRow = {
  city: string;
  completed_assessments_count: number;
  quit_pledges_count: number;
  volunteer_applications_count: number;
  follow_up_visits_count: number;
  research_consent_count: number;
  weekly_pledges_count: number;
  city_engagement_score: number;
  display_engagement: string;
};
export type LeaderEntry = { city: string; count: number } | null;
export type CityChallengeStats = {
  generated_at: string;
  weekly_window_start: string;
  cities: CityRow[];
  totals: {
    completed_assessments: number;
    quit_pledges: number;
    volunteer_applications: number;
    follow_up_visits: number;
    research_consent: number;
    weekly_pledges: number;
  } | null;
  leaderboard: {
    top_completed: LeaderEntry;
    top_volunteers: LeaderEntry;
    top_pledges: LeaderEntry;
    rising_weekly: LeaderEntry;
    top_followups: LeaderEntry;
  };
};

export const getCityChallengeStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("get_city_challenge_stats" as never);
  if (error) {
    console.error("get_city_challenge_stats error:", error);
    return { stats: null as CityChallengeStats | null, error: error.message as string | null };
  }
  return { stats: data as unknown as CityChallengeStats, error: null as string | null };
});

const CityEventInput = z.object({
  event_type: z.string().min(1).max(64).regex(/^[a-z_]+$/),
  city: z.string().trim().min(1).max(80).nullable().optional(),
  region: z.string().trim().min(1).max(80).nullable().optional(),
  anonymous_session_id: z.string().max(128).nullable().optional(),
});

export const recordCityChallengeEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CityEventInput.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("city_challenge_events" as never).insert({
      event_type: data.event_type,
      city: data.city ?? null,
      region: data.region ?? null,
      anonymous_session_id: data.anonymous_session_id ?? null,
    } as never);
    if (error) {
      console.error("recordCityChallengeEvent error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  });
