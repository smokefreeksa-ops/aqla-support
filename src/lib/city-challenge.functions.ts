import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getCityChallengeStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("get_city_challenge_stats" as never);
  if (error) {
    console.error("get_city_challenge_stats error:", error);
    return { stats: null, error: error.message };
  }
  return { stats: data as unknown, error: null };
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
