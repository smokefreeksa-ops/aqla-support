import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ensureStaff } from "./_authz.server";
import { renderKeyValueHtml, sendAdminNotification } from "./notifications.server";

export type ShopProduct = {
  id: string;
  product_slug: string;
  name_ar: string;
  name_en: string;
  category: string;
  description_ar: string | null;
  description_en: string | null;
  available_options: { options?: string[] } | null;
  display_order: number;
};

export const getShopCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("nrt_product_catalog" as never)
    .select("id, product_slug, name_ar, name_en, category, description_ar, description_en, available_options, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (error) {
    console.error("getShopCatalog error:", error);
    return { products: [] as ShopProduct[], error: error.message };
  }
  return { products: (data ?? []) as unknown as ShopProduct[], error: null as string | null };
});

const YesNoUnsure = z.enum(["yes", "no", "prefer_not_to_say", "not_applicable"]).optional();
const YesNo = z.enum(["yes", "no"]).optional();
const AgeGroup = z.enum(["under_18", "18_24", "25_34", "35_44", "45_plus"]).optional();
const ContactMethod = z.enum(["whatsapp", "phone", "email"]).optional();
const PrefLang = z.enum(["ar", "en"]).optional();

const RequestInput = z.object({
  full_name: z.string().trim().min(2).max(120),
  mobile_number: z.string().trim().min(5).max(40),
  email: z.string().trim().email().max(255).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  city: z.string().trim().max(80).optional(),
  district: z.string().trim().max(120).optional(),
  delivery_address: z.string().trim().max(500).optional(),
  preferred_contact_method: ContactMethod,
  preferred_language: PrefLang,
  selected_products: z.array(z.string().min(1).max(64)).min(1).max(10),
  quantity_requested: z.record(z.string(), z.number().int().min(1).max(50)).optional(),
  notes: z.string().trim().max(2000).optional(),
  age_group: AgeGroup,
  pregnant_or_breastfeeding: YesNoUnsure,
  chest_pain_or_heart_condition: YesNoUnsure,
  severe_breathing_problem: YesNoUnsure,
  taking_regular_medications: YesNoUnsure,
  completed_aqla_assessment: YesNo,
  consent_to_contact: z.boolean(),
  acknowledgement_not_prescription: z.boolean(),
});

function generateRequestCode(): string {
  const yy = new Date().getFullYear().toString().slice(-2);
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AQS-${yy}-${rand}`;
}

function escapeCsv(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "object" ? JSON.stringify(v) : String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export const submitNrtRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RequestInput.parse(input))
  .handler(async ({ data }) => {
    if (!data.consent_to_contact || !data.acknowledgement_not_prescription) {
      return { ok: false as const, error: "Required consents missing." };
    }

    const safetyFlags = {
      under_18: data.age_group === "under_18",
      pregnant_or_breastfeeding:
        data.pregnant_or_breastfeeding === "yes" || data.pregnant_or_breastfeeding === "prefer_not_to_say",
      chest_pain_or_heart_condition:
        data.chest_pain_or_heart_condition === "yes" || data.chest_pain_or_heart_condition === "prefer_not_to_say",
      severe_breathing_problem:
        data.severe_breathing_problem === "yes" || data.severe_breathing_problem === "prefer_not_to_say",
      taking_regular_medications:
        data.taking_regular_medications === "yes" || data.taking_regular_medications === "prefer_not_to_say",
    };
    const requiresReview = Object.values(safetyFlags).some(Boolean);
    const orderStatus = requiresReview ? "pending_clinician_review" : "new_request";
    const requestCode = generateRequestCode();

    const { data: inserted, error } = await supabaseAdmin
      .from("nrt_requests" as never)
      .insert({
        request_code: requestCode,
        full_name: data.full_name,
        mobile_number: data.mobile_number,
        email: data.email ?? null,
        city: data.city ?? null,
        district: data.district ?? null,
        delivery_address: data.delivery_address ?? null,
        preferred_contact_method: data.preferred_contact_method ?? null,
        preferred_language: data.preferred_language ?? null,
        selected_products: data.selected_products,
        quantity_requested: data.quantity_requested ?? null,
        notes: data.notes ?? null,
        age_group: data.age_group ?? null,
        pregnant_or_breastfeeding: data.pregnant_or_breastfeeding ?? null,
        chest_pain_or_heart_condition: data.chest_pain_or_heart_condition ?? null,
        severe_breathing_problem: data.severe_breathing_problem ?? null,
        taking_regular_medications: data.taking_regular_medications ?? null,
        completed_aqla_assessment: data.completed_aqla_assessment ?? null,
        requires_clinician_review: requiresReview,
        order_status: orderStatus,
        consent_to_contact: data.consent_to_contact,
        acknowledgement_not_prescription: data.acknowledgement_not_prescription,
      } as never)
      .select("id, request_code")
      .single();

    if (error || !inserted) {
      console.error("submitNrtRequest insert error:", error);
      return { ok: false as const, error: error?.message ?? "Insert failed" };
    }

    // Admin notification
    const adminBody = renderKeyValueHtml({
      "Request code": requestCode,
      Name: data.full_name,
      Mobile: data.mobile_number,
      Email: data.email ?? "—",
      City: data.city ?? "—",
      District: data.district ?? "—",
      "Delivery address": data.delivery_address ?? "—",
      "Selected products": data.selected_products,
      Quantity: data.quantity_requested ?? "—",
      "Preferred contact": data.preferred_contact_method ?? "—",
      "Preferred language": data.preferred_language ?? "—",
      "Age group": data.age_group ?? "—",
      "Pregnant/breastfeeding": data.pregnant_or_breastfeeding ?? "—",
      "Chest pain / heart condition": data.chest_pain_or_heart_condition ?? "—",
      "Severe breathing problem": data.severe_breathing_problem ?? "—",
      "Taking regular medications": data.taking_regular_medications ?? "—",
      "Completed Aqla assessment": data.completed_aqla_assessment ?? "—",
      "Requires clinician review": requiresReview ? "YES" : "no",
      Notes: data.notes ?? "—",
      Submitted: new Date().toISOString(),
    });
    await sendAdminNotification(
      "nrt_shop_request" as never,
      `New Aqla Shop Request — ${requestCode}`,
      `<h2 style="margin:0 0 12px;font-family:-apple-system,Segoe UI,Arial,sans-serif">New Aqla Shop Request</h2>${adminBody}`,
      { participant_code: requestCode },
    );

    // Optional user confirmation
    if (data.email) {
      const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
      const fromAddr = process.env.EMAIL_FROM_ADDRESS || "Aqla <onboarding@resend.dev>";
      const isAr = data.preferred_language === "ar";
      const userSubject = "Aqla request received";
      const userHtml = isAr
        ? `<div style="font-family:-apple-system,Segoe UI,Tahoma,Arial,sans-serif;direction:rtl;text-align:right">
             <h2>تم استلام طلبك</h2>
             <p>رقم الطلب: <b>${requestCode}</b></p>
             <p>سيقوم فريق أقلع بمراجعة طلبك والتواصل معك. هذه الرسالة ليست وصفة طبية ولا تأكيدًا تلقائيًا للشراء.</p>
           </div>`
        : `<div style="font-family:-apple-system,Segoe UI,Tahoma,Arial,sans-serif">
             <h2>Your request has been received</h2>
             <p>Request code: <b>${requestCode}</b></p>
             <p>The Aqla team will review your request and contact you. This is not a prescription or automatic purchase confirmation.</p>
           </div>`;
      if (apiKey) {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: fromAddr, to: [data.email], subject: userSubject, html: userHtml }),
          });
          const respText = await res.text().catch(() => "");
          await supabaseAdmin.from("notification_log").insert({
            event_type: "nrt_shop_request",
            recipient_email: data.email,
            subject: userSubject,
            sent_status: res.ok ? "sent" : "failed",
            sent_at: res.ok ? new Date().toISOString() : null,
            provider_response: `HTTP ${res.status} ${res.statusText}${respText ? ` — ${respText.slice(0, 500)}` : ""}`,
            error_message: res.ok ? null : respText.slice(0, 1000),
            participant_code: requestCode,
          } as never);
        } catch (err) {
          await supabaseAdmin.from("notification_log").insert({
            event_type: "nrt_shop_request",
            recipient_email: data.email,
            subject: userSubject,
            sent_status: "failed",
            error_message: (err as Error)?.message?.slice(0, 1000) ?? "fetch failed",
            participant_code: requestCode,
          } as never);
        }
      } else {
        await supabaseAdmin.from("notification_log").insert({
          event_type: "nrt_shop_request",
          recipient_email: data.email,
          subject: userSubject,
          sent_status: "pending_provider_setup",
          error_message: "EMAIL_PROVIDER_API_KEY not configured",
          participant_code: requestCode,
        } as never);
      }
    }

    return {
      ok: true as const,
      request_code: requestCode,
      requires_clinician_review: requiresReview,
      order_status: orderStatus,
    };
  });

// ---------------- Admin ----------------

type AdminRequestRow = {
  id: string;
  request_code: string;
  created_at: string;
  full_name: string;
  mobile_number: string;
  email: string | null;
  city: string | null;
  district: string | null;
  delivery_address: string | null;
  selected_products: string[];
  quantity_requested: Record<string, number> | null;
  notes: string | null;
  age_group: string | null;
  pregnant_or_breastfeeding: string | null;
  chest_pain_or_heart_condition: string | null;
  severe_breathing_problem: string | null;
  taking_regular_medications: string | null;
  completed_aqla_assessment: string | null;
  requires_clinician_review: boolean;
  order_status: string;
  preferred_contact_method: string | null;
  preferred_language: string | null;
  internal_notes: string | null;
};

const AdminListInput = z.object({
  status: z.string().max(64).optional(),
  search: z.string().max(120).optional(),
});

export const adminListNrtRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => AdminListInput.parse(input ?? {}))
  .handler(async ({ context, data }) => {
    await ensureStaff(context.userId);
    let q = supabaseAdmin
      .from("nrt_requests" as never)
      .select(
        "id, request_code, created_at, full_name, mobile_number, email, city, district, delivery_address, selected_products, quantity_requested, notes, age_group, pregnant_or_breastfeeding, chest_pain_or_heart_condition, severe_breathing_problem, taking_regular_medications, completed_aqla_assessment, requires_clinician_review, order_status, preferred_contact_method, preferred_language, internal_notes",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.status && data.status !== "all") q = q.eq("order_status", data.status);
    if (data.search) {
      const s = `%${data.search}%`;
      q = q.or(`request_code.ilike.${s},full_name.ilike.${s},mobile_number.ilike.${s},city.ilike.${s}`);
    }
    const { data: rows, error } = await q;
    if (error) {
      console.error("adminListNrtRequests:", error);
      return { rows: [] as AdminRequestRow[], error: error.message };
    }
    return { rows: ((rows ?? []) as unknown as AdminRequestRow[]), error: null as string | null };
  });

const UpdateInput = z.object({
  id: z.string().uuid(),
  new_status: z
    .enum([
      "new_request",
      "pending_clinician_review",
      "contacted",
      "approved_for_fulfillment",
      "sent_to_pharmacy_or_supplier",
      "completed",
      "cancelled",
      "not_eligible",
      "unable_to_contact",
    ])
    .optional(),
  requires_clinician_review: z.boolean().optional(),
  internal_note: z.string().trim().max(2000).optional(),
});

export const adminUpdateNrtRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateInput.parse(input))
  .handler(async ({ context, data }) => {
    await ensureStaff(context.userId);
    // Read current row for old status & to append note
    const { data: current, error: readErr } = await supabaseAdmin
      .from("nrt_requests" as never)
      .select("id, order_status, internal_notes")
      .eq("id", data.id)
      .single();
    if (readErr || !current) {
      return { ok: false, error: readErr?.message ?? "Not found" };
    }
    const cur = current as unknown as { id: string; order_status: string; internal_notes: string | null };

    const patch: Record<string, unknown> = {};
    if (data.new_status) patch.order_status = data.new_status;
    if (typeof data.requires_clinician_review === "boolean") patch.requires_clinician_review = data.requires_clinician_review;
    if (data.internal_note) {
      const stamp = new Date().toISOString();
      const appended = `${cur.internal_notes ? cur.internal_notes + "\n" : ""}[${stamp}] ${data.internal_note}`;
      patch.internal_notes = appended;
    }
    if (Object.keys(patch).length === 0) return { ok: true };

    const { error: updErr } = await supabaseAdmin
      .from("nrt_requests" as never)
      .update(patch as never)
      .eq("id", data.id);
    if (updErr) return { ok: false, error: updErr.message };

    if (data.new_status && data.new_status !== cur.order_status) {
      await supabaseAdmin.from("nrt_request_status_history" as never).insert({
        request_id: data.id,
        old_status: cur.order_status,
        new_status: data.new_status,
        note: data.internal_note ?? null,
      } as never);
    }
    return { ok: true, error: null as string | null };
  });

export const adminExportNrtRequestsCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureStaff(context.userId);
  const { data: rows, error } = await supabaseAdmin
    .from("nrt_requests" as never)
    .select(
      "request_code, created_at, full_name, mobile_number, email, city, district, delivery_address, selected_products, requires_clinician_review, order_status, preferred_contact_method, preferred_language",
    )
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) return { csv: "", error: error.message };
  const headers = [
    "request_code",
    "created_at",
    "full_name",
    "mobile_number",
    "email",
    "city",
    "district",
    "delivery_address",
    "selected_products",
    "requires_clinician_review",
    "order_status",
    "preferred_contact_method",
    "preferred_language",
  ];
  const list = (rows ?? []) as unknown as Record<string, unknown>[];
  const lines = [headers.join(",")];
  for (const r of list) lines.push(headers.map((h) => escapeCsv(r[h])).join(","));
  return { csv: lines.join("\n"), error: null as string | null };
});
