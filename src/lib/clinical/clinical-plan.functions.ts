import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  createClinicalPlanRow,
  finalizeClinicalPlanRow,
  persistAnswers,
} from "./clinical-plan.server";
import type { ClinicalAnswers } from "./types";

export const startClinicalPlan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ anonymousSessionId: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data }) => createClinicalPlanRow(data.anonymousSessionId));

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
  .handler(async ({ data }) =>
    finalizeClinicalPlanRow(data.planId, data.answers as ClinicalAnswers),
  );
