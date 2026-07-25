import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MODULES } from "@/data/modules";

const IssueInput = z.object({
  module_slug: z.string().min(1).max(64),
  full_name: z.string().min(2).max(120),
  answers: z.record(z.string(), z.number().int().min(0).max(10)),
  language: z.string().max(8).nullable().optional(),
  duration_seconds: z.number().int().min(0).max(7200).nullable().optional(),
});

function randomCode(len = 10) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export const issueAcademyCertificate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => IssueInput.parse(input))
  .handler(async ({ data }) => {
    const mod = MODULES.find((m) => m.slug === data.module_slug);
    if (!mod) return { ok: false as const, error: "module_not_found", certificate_code: null as string | null };

    const total = mod.quiz.length;
    let correct = 0;
    mod.quiz.forEach((q, i) => {
      if (data.answers[String(i)] === q.correctIndex) correct += 1;
    });
    const score = Math.round((correct / total) * 100);
    const threshold = 80;
    if (score < threshold) {
      return { ok: false as const, error: "score_below_threshold", score, threshold, certificate_code: null };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const code = `AQLA-AC-${randomCode(8)}`;
    const hash = randomCode(24);
    const { error } = await supabaseAdmin
      .from("academy_certificates" as never)
      .insert({
        certificate_code: code,
        verification_hash: hash,
        full_name: data.full_name.trim(),
        module_slug: data.module_slug,
        overall_score: score,
        is_valid: true,
      } as never);
    if (error) {
      console.error("issueAcademyCertificate:", error);
      return { ok: false as const, error: error.message, certificate_code: null };
    }
    return { ok: true as const, certificate_code: code, score, error: null };
  });

const VerifyInput = z.object({ code: z.string().min(3).max(64) });

export const verifyAcademyCertificate = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => VerifyInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.rpc("verify_academy_certificate" as never, { p_code: data.code } as never);
    return JSON.parse(JSON.stringify(row ?? { found: false })) as {
      found: boolean;
      is_valid?: boolean;
      full_name?: string;
      certificate_code?: string;
      module_slug?: string;
      track_slug?: string;
      overall_score?: number;
      issued_at?: string;
      title_en?: string;
      title_ar?: string;
    };
  });
