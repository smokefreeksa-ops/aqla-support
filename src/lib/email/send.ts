import { supabase } from "@/integrations/supabase/client";

export interface SendEmailInput {
  templateName: string;
  recipientEmail?: string;
  idempotencyKey?: string;
  templateData?: Record<string, unknown>;
}

/**
 * Sends a branded transactional email through the app's email queue.
 * Requires an authenticated Supabase session. Never throws — email delivery
 * must not break the user-facing flow.
 */
export async function sendTransactionalEmail(input: SendEmailInput): Promise<boolean> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return false;

    const response = await fetch("/lovable/email/transactional/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      console.warn("Email send failed", response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.warn("Email send error", error);
    return false;
  }
}
