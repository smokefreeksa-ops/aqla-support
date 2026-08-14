import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { ClinicalAnswers } from "./types";

export const startClinicalPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ anonymousSessionId: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { createClinicalPlanRow } = await import("./clinical-plan.server");
    return createClinicalPlanRow(data.anonymousSessionId);
  });

export const saveClinicalAnswers = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        planId: z.string().uuid(),
        answers: z.record(z.string(), z.unknown()),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { persistAnswers } = await import("./clinical-plan.server");
    await persistAnswers(data.planId, data.answers as ClinicalAnswers);
    return { ok: true };
  });

export const finalizeClinicalPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        planId: z.string().uuid(),
        answers: z.record(z.string(), z.unknown()),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { finalizeClinicalPlanRow } = await import("./clinical-plan.server");
    return finalizeClinicalPlanRow(data.planId, data.answers as ClinicalAnswers);
  });

/** Public read of the exact immutable Release 1 plan for a plan token. */
export const getClinicalPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        planToken: z.string().min(8).max(80),
        version: z.number().int().positive().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { getClinicalPlanByToken } = await import("./clinical-plan.server");
    return getClinicalPlanByToken(data.planToken, data.version);
  });

/** Dashboard: the signed-in user's Release 1 plans. */
export const listMyClinicalPlans = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { listUserClinicalPlans } = await import("./clinical-plan.server");
    return { plans: await listUserClinicalPlans(context.userId) };
  });

/** Attaches a plan generated while anonymous to the signed-in user. */
export const claimClinicalPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ planToken: z.string().min(8).max(80) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { claimClinicalPlanForUser } = await import("./clinical-plan.server");
    return claimClinicalPlanForUser(data.planToken, context.userId);
  });

/** Sends the stored plan to an email address (holder of the plan token). */
export const emailClinicalPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        planToken: z.string().min(8).max(80),
        email: z.string().email().max(254),
        consent: z.literal(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { resendClinicalPlanEmail } = await import("./clinical-plan.server");
    return resendClinicalPlanEmail(data.planToken, data.email);
  });
