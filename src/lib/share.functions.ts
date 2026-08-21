import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Forbidden keys — never stored in safe_public_payload
const FORBIDDEN_KEYS = new Set([
  "phone", "phone_number", "email", "email_address",
  "participant_code", "participant_id",
  "cohort", "cohort_assignment",
  "doctor_review", "doctor_review_needed",
  "clinical_notes", "clinical_diagnosis",
  "raw_answers", "answers", "raw_score", "score_raw",
  "health_details", "health_history",
  "full_name", "first_name", "last_name",
  "date_of_birth", "dob", "national_id",
]);

function sanitizePayload(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const lower = key.toLowerCase();
    if (FORBIDDEN_KEYS.has(lower)) continue;
    // Block any key that contains obvious PII signals
    if (/email|phone|password|token|secret|cohort|clinical|doctor_review|participant_code/i.test(key)) continue;
    // Truncate long strings
    if (typeof value === "string") {
      out[key] = value.slice(0, 500);
    } else if (typeof value === "number" || typeof value === "boolean" || value === null) {
      out[key] = value;
    } else if (Array.isArray(value)) {
      out[key] = value.slice(0, 20).map((v) =>
        typeof v === "string" ? v.slice(0, 200) : v,
      );
    } else {
      // skip nested objects to keep payload simple
    }
  }
  return out;
}

const ALLOWED_TYPES = new Set([
  "pledge", "quick-check", "breath", "cost", "trigger",
  "readiness", "knowledge", "medal", "poster", "city",
  "passport", "certificate", "support-invite",
]);

const createInputSchema = z.object({
  share_type: z.string().min(1).max(64),
  anonymous_session_id: z.string().max(128).optional().nullable(),
  title_ar: z.string().max(200).optional().nullable(),
  title_en: z.string().max(200).optional().nullable(),
  message_ar: z.string().max(600).optional().nullable(),
  message_en: z.string().max(600).optional().nullable(),
  cta_ar: z.string().max(120).optional().nullable(),
  cta_en: z.string().max(120).optional().nullable(),
  target_path: z.string().max(300).default("/"),
  safe_public_payload: z.unknown().optional(),
  image_data_url: z.string().max(8_000_000).optional().nullable(), // ~6MB base64 cap
});

export const createShareCard = createServerFn({ method: "POST" })
  .inputValidator((input) => createInputSchema.parse(input))
  .handler(async ({ data }) => {
    if (!ALLOWED_TYPES.has(data.share_type)) {
      throw new Error(`Unsupported share_type: ${data.share_type}`);
    }

    const safe = sanitizePayload(data.safe_public_payload);

    let image_url: string | null = null;

    // Optionally upload a generated PNG snapshot
    if (data.image_data_url && data.image_data_url.startsWith("data:image/")) {
      try {
        const match = data.image_data_url.match(/^data:(image\/[a-z]+);base64,(.+)$/);
        if (match) {
          const mime = match[1];
          const ext = mime.split("/")[1] === "jpeg" ? "jpg" : mime.split("/")[1];
          const bytes = Buffer.from(match[2], "base64");
          const path = `${data.share_type}/${crypto.randomUUID()}.${ext}`;
          const { error: upErr } = await supabaseAdmin.storage
            .from("share-images")
            .upload(path, bytes, { contentType: mime, upsert: false });
          if (!upErr) {
            const { data: pub } = supabaseAdmin.storage
              .from("share-images")
              .getPublicUrl(path);
            image_url = pub.publicUrl;
          } else {
            console.error("share image upload failed", upErr);
          }
        }
      } catch (e) {
        console.error("share image processing failed", e);
      }
    }

    const target_url = data.target_path.startsWith("http")
      ? data.target_path
      : data.target_path;

    const { data: row, error } = await supabaseAdmin
      .from("share_cards")
      .insert({
        share_type: data.share_type,
        anonymous_session_id: data.anonymous_session_id ?? null,
        title_ar: data.title_ar ?? null,
        title_en: data.title_en ?? null,
        message_ar: data.message_ar ?? null,
        message_en: data.message_en ?? null,
        cta_ar: data.cta_ar ?? null,
        cta_en: data.cta_en ?? null,
        image_url,
        target_url,
        safe_public_payload: safe as never,
      })
      .select("id")
      .single();

    if (error || !row) {
      console.error("share_cards insert failed", error);
      throw new Error("Failed to create share card");
    }

    return {
      id: row.id as string,
      share_path: `/share/${data.share_type}/${row.id}`,
      image_url,
    };
  });

export const getShareCard = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ id: z.string().uuid(), type: z.string().max(64) }).parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabaseAdmin
      .from("share_cards")
      .select("id, share_type, title_ar, title_en, message_ar, message_en, cta_ar, cta_en, image_url, target_url, safe_public_payload, created_at")
      .eq("id", data.id)
      .eq("share_type", data.type)
      .maybeSingle();

    if (error) {
      console.error("share_cards read failed", error);
      return null;
    }
    return row;
  });
