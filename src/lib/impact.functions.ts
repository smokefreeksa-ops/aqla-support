import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type ImpactStats = {
  total_visits: number;
  visits_today: number;
  total_assessments: number;
  support_pathway_count: number;
  doctor_review_count: number;
  volunteer_applicants: number;
  cities_represented: number;
  follow_up_visits_logged: number;
  research_consent_count: number;
};

export const getPublicImpactStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("get_public_impact_stats" as never);
  if (error) {
    console.error("get_public_impact_stats error", error);
    const empty: ImpactStats = {
      total_visits: 0,
      visits_today: 0,
      total_assessments: 0,
      support_pathway_count: 0,
      doctor_review_count: 0,
      volunteer_applicants: 0,
      cities_represented: 0,
      follow_up_visits_logged: 0,
      research_consent_count: 0,
    };
    return empty;
  }
  return (data as unknown) as ImpactStats;
});

const PUBLIC_PATHS = new Set(["/", "/about", "/assessment", "/volunteer"]);

const TrackInput = z.object({
  page_path: z.string().min(1).max(255),
  anonymous_session_hash: z.string().min(1).max(128).optional().nullable(),
});

export const trackPageView = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TrackInput.parse(input))
  .handler(async ({ data }) => {
    if (!PUBLIC_PATHS.has(data.page_path)) {
      return { recorded: false };
    }

    // Deduplicate: one visit per anonymous session per page per day.
    if (data.anonymous_session_hash) {
      const { data: existing } = await supabaseAdmin
        .from("page_views")
        .select("id")
        .eq("page_path", data.page_path)
        .eq("visit_date", new Date().toISOString().slice(0, 10))
        .eq("anonymous_session_hash", data.anonymous_session_hash)
        .limit(1)
        .maybeSingle();
      if (existing) return { recorded: false };
    }

    const { error } = await supabaseAdmin.from("page_views").insert({
      page_path: data.page_path,
      anonymous_session_hash: data.anonymous_session_hash ?? null,
    });
    if (error) {
      console.error("trackPageView insert error", error);
      return { recorded: false };
    }
    return { recorded: true };
  });
