import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ensureAdmin } from "./_authz.server";

export type PosterPublicStats = {
  generated_at: string;
  total_posters_created: number;
  posters_created_today: number;
  most_used_template: string | null;
  total_shares_clicked: number;
  cities_participating: number;
};

export type AdminPosterAnalytics = {
  generated_at: string;
  total_posters: number;
  downloads: number;
  whatsapp_shares: number;
  x_shares: number;
  text_copies: number;
  popular_templates: Record<string, number>;
  popular_messages: Record<string, number>;
  poster_types: Record<string, number>;
  city_distribution: Record<string, number>;
  language_distribution: Record<string, number>;
  conversion_to_assessment: number;
  events_by_day: { day: string; events: number }[];
};

// Server-side safety check for custom messages
const UNSAFE_PATTERNS: RegExp[] = [
  /\bmedically?\s+certified\b/i,
  /\bcured?\s+smoking\b/i,
  /\bguarantee/i,
  /\bdoctor[-\s]?approved\b/i,
  /\bbest\s+nrt\b/i,
  /\bprescrib/i,
  /\bdiagnos/i,
  /\bi\s+treat\b/i,
  /\b(hate|stupid|idiot|loser)\b/i,
  /أعالج/, /أشخص/, /أصف\s*علاج/, /مضمون/, /علاج\s*نهائي/, /معتمد\s*طبي/, /خبير\s*علاجي/,
];

export function isUnsafeMessage(text: string): boolean {
  if (!text) return false;
  return UNSAFE_PATTERNS.some((re) => re.test(text));
}

const PosterCreationInput = z.object({
  poster_type: z.string().min(1).max(64),
  template_name: z.string().min(1).max(64),
  display_name: z.string().trim().max(60).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  message_key: z.string().max(64).nullable().optional(),
  custom_message: z.string().trim().max(240).nullable().optional(),
  language: z.enum(["ar", "en"]).nullable().optional(),
  export_size: z.string().max(32).nullable().optional(),
  anonymous_session_id: z.string().max(128).nullable().optional(),
});

export const recordPosterCreation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PosterCreationInput.parse(input))
  .handler(async ({ data }) => {
    if (data.custom_message && isUnsafeMessage(data.custom_message)) {
      return { ok: false, error: "unsafe_message" };
    }
    const { error } = await supabaseAdmin.from("poster_creations").insert({
      poster_type: data.poster_type,
      template_name: data.template_name,
      display_name: data.display_name ?? null,
      city: data.city ?? null,
      message_key: data.message_key ?? null,
      custom_message: data.custom_message ?? null,
      language: data.language ?? null,
      export_size: data.export_size ?? null,
      anonymous_session_id: data.anonymous_session_id ?? null,
    });
    if (error) {
      console.error("recordPosterCreation error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true, error: null as string | null };
  });

const PosterEventInput = z.object({
  event_type: z.string().min(1).max(64).regex(/^[a-z0-9_]+$/),
  poster_type: z.string().max(64).nullable().optional(),
  template_name: z.string().max(64).nullable().optional(),
  city: z.string().trim().max(80).nullable().optional(),
  anonymous_session_id: z.string().max(128).nullable().optional(),
});

export const recordPosterEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PosterEventInput.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("poster_events").insert({
      event_type: data.event_type,
      poster_type: data.poster_type ?? null,
      template_name: data.template_name ?? null,
      city: data.city ?? null,
      anonymous_session_id: data.anonymous_session_id ?? null,
    });
    if (error) {
      console.error("recordPosterEvent error:", error);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  });

export const getPosterPublicStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("get_poster_studio_public_stats");
  if (error) {
    console.error("get_poster_studio_public_stats error:", error);
    return { stats: null as PosterPublicStats | null, error: error.message };
  }
  return { stats: data as unknown as PosterPublicStats, error: null as string | null };
});

export const getAdminPosterAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);
  const { data, error } = await supabaseAdmin.rpc("get_admin_poster_analytics");
  if (error) {
    console.error("get_admin_poster_analytics error:", error);
    return { analytics: null as AdminPosterAnalytics | null, error: error.message };
  }
  return { analytics: data as unknown as AdminPosterAnalytics, error: null as string | null };
});
