import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const dtxGetState = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [pact, halt, slips, nrt] = await Promise.all([
      supabase.from("dtx_pacts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("dtx_halt_events").select("trigger_type, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(200),
      supabase.from("dtx_slips").select("reason, created_at").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
      supabase.from("dtx_nrt_log").select("log_date, taken").eq("user_id", userId).order("log_date", { ascending: false }).limit(60),
    ]);
    return {
      pact: pact.data ?? null,
      halt: halt.data ?? [],
      slips: slips.data ?? [],
      nrt: nrt.data ?? [],
    };
  });

export const dtxSavePact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      full_name: z.string().min(1).max(120),
      quit_start_date: z.string().min(1).max(20),
      monthly_spend: z.number().min(0).max(1_000_000),
      reason_1: z.string().min(1).max(200),
      reason_2: z.string().min(1).max(200),
      ftnd_score: z.number().int().min(0).max(10).nullable().optional(),
      readiness_score: z.number().int().min(1).max(10).nullable().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("dtx_pacts")
      .insert({ ...data, user_id: userId })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const dtxUpdateScores = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      pact_id: z.string().uuid(),
      ftnd_score: z.number().int().min(0).max(10),
      readiness_score: z.number().int().min(1).max(10),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("dtx_pacts")
      .update({ ftnd_score: data.ftnd_score, readiness_score: data.readiness_score })
      .eq("id", data.pact_id)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const dtxLogHalt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ trigger_type: z.enum(["hungry", "angry", "lonely", "tired"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("dtx_halt_events").insert({ user_id: userId, trigger_type: data.trigger_type });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const dtxLogSlip = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ reason: z.enum(["work_stress", "argument", "social", "boredom"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("dtx_slips").insert({ user_id: userId, reason: data.reason });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const dtxLogNrt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ log_date: z.string().min(8).max(20), taken: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("dtx_nrt_log")
      .upsert({ user_id: userId, log_date: data.log_date, taken: data.taken }, { onConflict: "user_id,log_date" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
