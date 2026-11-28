import { z } from "zod";
import { normalizeSaudiMobile } from "./normalizePhone";
import type { ClinicalAnswers } from "../clinical/types";

export const CONTACT_CONSENT_VERSION = "contact-consent-v1-2026-11-28";
export const contactEmailSchema = z.string().trim().email().max(254);
const mobileSchema = z.string().max(80).transform((value, ctx) => {
  const normalized = normalizeSaudiMobile(value);
  if (!normalized) {
    ctx.addIssue({ code: "custom", message: "رقم الجوال غير صحيح. مثال: ٠٥٥١٢٣٤٥٦٧" });
    return z.NEVER;
  }
  return normalized;
});
const timestampSchema = z.string().datetime().refine((s) => Date.parse(s) <= Date.now() + 60_000);
export const contactAnswersSchema = z.object({
  contact_consent: z.literal(true),
  contact_consent_at: timestampSchema,
  contact_consent_version: z.literal(CONTACT_CONSENT_VERSION),
  contact_email: contactEmailSchema,
  contact_mobile: mobileSchema,
  guardian_name: z.string().trim().min(1).max(100).optional(),
  guardian_relationship: z.enum(["father", "mother", "brother", "sister", "legal_guardian"]).optional(),
  guardian_email: contactEmailSchema.optional(),
  guardian_mobile: mobileSchema.optional(),
  guardian_consent: z.literal(true).optional(),
  guardian_consent_at: timestampSchema.optional(),
}).passthrough();

export const guardianAnswersSchema = contactAnswersSchema.pick({
  guardian_name: true, guardian_relationship: true, guardian_email: true,
  guardian_mobile: true, guardian_consent: true, guardian_consent_at: true,
}).required();

export function validateContactAnswers(answers: ClinicalAnswers, complete = false): ClinicalAnswers {
  const parsed = (complete ? contactAnswersSchema : contactAnswersSchema.partial()).parse(answers);
  if (complete && answers.age_band === "under_18") guardianAnswersSchema.parse(parsed);
  return parsed as ClinicalAnswers;
}

export function planEmailRecipient(answers: ClinicalAnswers): string | null {
  if (!answers.plan_email_consent) return null;
  if (answers.age_band === "under_18") {
    return guardianAnswersSchema.safeParse(answers).success ? answers.guardian_email ?? null : null;
  }
  return answers.contact_email ?? answers.email ?? null;
}

const PROVIDER_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com", "gmai.com": "gmail.com", "gmail.co": "gmail.com",
  "hotmial.com": "hotmail.com", "hotmai.com": "hotmail.com", "outlok.com": "outlook.com",
  "yaho.com": "yahoo.com", "icloud.co": "icloud.com",
};
export function suggestEmailCorrection(email: string): string | null {
  const [local, domain] = email.trim().split("@");
  const corrected = domain ? PROVIDER_TYPOS[domain.toLowerCase()] : undefined;
  return local && corrected ? `${local}@${corrected}` : null;
}