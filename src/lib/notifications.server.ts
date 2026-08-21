// Internal admin/physician email notifications for Aqla.
// Safe-by-default: if no email provider is configured, the submission still
// succeeds and the attempt is recorded in notification_log as
// "pending_provider_setup". Never throws to callers.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type NotificationType =
  | "full_quit_support_submission"| "full_volunteer_application"| "follow_up_visit"| "csv_export_alert"| "staff_signup"| "staff_login";

const DEFAULT_RECIPIENT = "smokefreeksa@gmail.com";

type Refs = {
  participant_code?: string | null;
  volunteer_code?: string | null;
  staff_email?: string | null;
  export_type?: string | null;
};

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function renderKeyValueHtml(data: Record<string, unknown>): string {
  const rows = Object.entries(data)
    .map(([k, v]) => {
      const val =
        v === null || v === undefined
          ? "<em>n/a</em>": typeof v === "object"? `<pre style="margin:0;white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:12px">${escapeHtml(JSON.stringify(v, null, 2))}</pre>`
            : escapeHtml(v);
      return `<tr><td style="padding:4px 10px;vertical-align:top;color:#555;border-bottom:1px solid #eee"><b>${escapeHtml(k)}</b></td><td style="padding:4px 10px;border-bottom:1px solid #eee">${val}</td></tr>`;
    })
    .join("");
  return `<table style="border-collapse:collapse;width:100%;font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:13px">${rows}</table>`;
}

const CONFIDENTIAL_FOOTER = `<p style="margin-top:24px;padding:12px;background:#fff7e6;border:1px solid #f5c971;color:#8a5a00;font-size:12px;font-family:-apple-system,Segoe UI,Arial,sans-serif"><b>Confidential:</b> This email contains confidential Aqla service data. Do not forward. Store and handle according to applicable privacy and data-governance requirements.</p>`;

export async function sendAdminNotification(
  type: NotificationType,
  subject: string,
  bodyHtml: string,
  refs: Refs = {},
): Promise<void> {
  try {
    const { data: setting } = await supabaseAdmin
      .from("notification_settings")
      .select("enabled, recipient_email")
      .eq("notification_type", type)
      .maybeSingle();

    if (setting && !setting.enabled) return;

    const recipient = setting?.recipient_email || DEFAULT_RECIPIENT;
    const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
    const fromAddr = process.env.EMAIL_FROM_ADDRESS || "Aqla <onboarding@resend.dev>";

    const html = `${bodyHtml}${CONFIDENTIAL_FOOTER}`;

    if (!apiKey) {
      await supabaseAdmin.from("notification_log").insert({
        event_type: type,
        recipient_email: recipient,
        subject,
        sent_status: "pending_provider_setup",
        error_message: "EMAIL_PROVIDER_API_KEY not configured",
        ...refs,
      });
      return;
    }

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromAddr,
          to: [recipient],
          subject,
          html,
        }),
      });
      const respText = await res.text().catch(() => "");
      const providerResponse = `HTTP ${res.status} ${res.statusText}${respText ? ` — ${respText}` : ""}`.slice(0, 2000);
      if (!res.ok) {
        await supabaseAdmin.from("notification_log").insert({
          event_type: type,
          recipient_email: recipient,
          subject,
          sent_status: "failed",
          error_message: respText.slice(0, 1000) || `HTTP ${res.status}`,
          provider_response: providerResponse,
          ...refs,
        } as never);
        return;
      }
      await supabaseAdmin.from("notification_log").insert({
        event_type: type,
        recipient_email: recipient,
        subject,
        sent_status: "sent",
        sent_at: new Date().toISOString(),
        provider_response: providerResponse,
        ...refs,
      } as never);
    } catch (err) {
      await supabaseAdmin.from("notification_log").insert({
        event_type: type,
        recipient_email: recipient,
        subject,
        sent_status: "failed",
        error_message: (err as Error)?.message?.slice(0, 1000) ?? "Email function not triggered",
        ...refs,
      } as never);
    }
  } catch {
    // Absolute last resort: never let notifications break a submission.
  }
}
