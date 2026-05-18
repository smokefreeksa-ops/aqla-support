import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type MovementPublicStats = {
  generated_at: string;
  assessments_completed: number;
  quit_pledges: number;
  charter_signatures: number;
  posters_created: number;
  quizzes_completed: number;
  volunteers_started_training: number;
  cities_participating: number;
  whatsapp_x_shares: number;
  estimated_savings_sar: number;
};

export type AqlaIndex = {
  generated_at: string;
  index: number;
  window_hours: number;
  breakdown: Record<string, number>;
};

export type PassportSummary = { stamps: string[]; count: number };

export const getMovementPublicStats = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin.rpc("get_movement_public_stats");
    if (error) throw new Error(error.message);
    return data as MovementPublicStats;
  }
);

export const getAqlaIndex = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin.rpc("get_aqla_index");
  if (error) throw new Error(error.message);
  return data as AqlaIndex;
});

export const getPassportSummary = createServerFn({ method: "POST" })
  .inputValidator((input: { session: string }) =>
    z.object({ session: z.string().min(4).max(200) }).parse(input)
  )
  .handler(async ({ data }) => {
    const { data: out, error } = await supabaseAdmin.rpc(
      "get_passport_summary_for_session",
      { p_session: data.session }
    );
    if (error) throw new Error(error.message);
    return out as PassportSummary;
  });

const NAME_RE = /^[\p{L}\p{M}\p{N} _.\-']{1,40}$/u;
const CITY_RE = /^[\p{L}\p{M} _.\-']{1,60}$/u;

export const signCharter = createServerFn({ method: "POST" })
  .inputValidator((input: {
    session: string;
    display_name?: string | null;
    city?: string | null;
    consent_public_display?: boolean;
  }) =>
    z.object({
      session: z.string().min(4).max(200),
      display_name: z.string().regex(NAME_RE).max(40).optional().nullable(),
      city: z.string().regex(CITY_RE).max(60).optional().nullable(),
      consent_public_display: z.boolean().optional().default(false),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin.from("charter_signatures").insert({
      anonymous_session_id: data.session,
      display_name: data.display_name || null,
      city: data.city || null,
      consent_public_display: !!data.consent_public_display,
    });
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("movement_events").insert({
      anonymous_session_id: data.session,
      event_type: "charter_signed",
      city: data.city || null,
    });
    await supabaseAdmin.from("aqla_passport_events").insert({
      anonymous_session_id: data.session,
      stamp_key: "charter_signed",
      source_event_type: "charter_signed",
    });
    return { ok: true };
  });

const ALLOWED_EVENTS = new Set([
  "movement_page_viewed",
  "aqla_index_viewed",
  "trigger_map_completed",
  "majlis_phrase_copied",
  "movement_share_clicked",
  "movement_share_whatsapp",
  "movement_share_x",
  "passport_share_clicked",
]);

export const logMovementEvent = createServerFn({ method: "POST" })
  .inputValidator((input: {
    session: string;
    event_type: string;
    city?: string | null;
  }) =>
    z.object({
      session: z.string().min(4).max(200),
      event_type: z.string().min(1).max(80),
      city: z.string().max(60).optional().nullable(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    if (!ALLOWED_EVENTS.has(data.event_type)) return { ok: false };
    await supabaseAdmin.from("movement_events").insert({
      anonymous_session_id: data.session,
      event_type: data.event_type,
      city: data.city || null,
    });
    return { ok: true };
  });

const ALLOWED_STAMPS = new Set([
  "charter_signed",
  "assessment_completed",
  "quit_pledge_created",
  "poster_created",
  "quiz_completed",
  "city_challenge_joined",
  "volunteer_training_started",
  "helped_someone",
]);

export const earnPassportStamp = createServerFn({ method: "POST" })
  .inputValidator((input: { session: string; stamp_key: string }) =>
    z.object({
      session: z.string().min(4).max(200),
      stamp_key: z.string().min(1).max(60),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    if (!ALLOWED_STAMPS.has(data.stamp_key)) return { ok: false };
    await supabaseAdmin.from("aqla_passport_events").insert({
      anonymous_session_id: data.session,
      stamp_key: data.stamp_key,
      source_event_type: data.stamp_key,
    });
    return { ok: true };
  });
