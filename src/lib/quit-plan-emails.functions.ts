import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function ensureAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const roles = (data ?? []).map((r) => r.role as string);
  if (roles.length === 0) throw new Error("Forbidden: no role assigned");
  return roles;
}

export type QuitPlanEmailRow = {
  id: string;
  quit_plan_id: string;
  recipient_type: "user" | "admin";
  email: string;
  subject: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

export type QuitPlanGroup = {
  quit_plan_id: string;
  plan_created_at: string | null;
  plan_user_email: string | null;
  total: number;
  sent: number;
  failed: number;
  queued: number;
  last_attempt_at: string;
  emails: QuitPlanEmailRow[];
};

export const listQuitPlanEmails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAdmin(context.userId);

    const { data: emails, error } = await supabaseAdmin
      .from("quit_plan_emails")
      .select("id, quit_plan_id, recipient_type, email, subject, status, error_message, created_at")
      .order("created_at", { ascending: false })
      .limit(2000);
    if (error) throw new Error(error.message);

    const rows = (emails ?? []) as QuitPlanEmailRow[];
    const planIds = Array.from(new Set(rows.map((r) => r.quit_plan_id)));

    let plansById: Record<string, { created_at: string | null; user_email: string | null }> = {};
    if (planIds.length > 0) {
      const { data: plans } = await supabaseAdmin
        .from("quit_plans")
        .select("id, created_at, user_email")
        .in("id", planIds);
      plansById = Object.fromEntries(
        (plans ?? []).map((p: { id: string; created_at: string | null; user_email: string | null }) => [
          p.id,
          { created_at: p.created_at, user_email: p.user_email },
        ]),
      );
    }

    const groupsMap = new Map<string, QuitPlanGroup>();
    for (const r of rows) {
      let g = groupsMap.get(r.quit_plan_id);
      if (!g) {
        const meta = plansById[r.quit_plan_id];
        g = {
          quit_plan_id: r.quit_plan_id,
          plan_created_at: meta?.created_at ?? null,
          plan_user_email: meta?.user_email ?? null,
          total: 0,
          sent: 0,
          failed: 0,
          queued: 0,
          last_attempt_at: r.created_at,
          emails: [],
        };
        groupsMap.set(r.quit_plan_id, g);
      }
      g.emails.push(r);
      g.total += 1;
      const s = r.status.toLowerCase();
      if (s === "sent") g.sent += 1;
      else if (s === "failed" || s === "error" || s === "bounced") g.failed += 1;
      else g.queued += 1;
      if (r.created_at > g.last_attempt_at) g.last_attempt_at = r.created_at;
    }

    const groups = Array.from(groupsMap.values()).sort((a, b) =>
      a.last_attempt_at < b.last_attempt_at ? 1 : -1,
    );

    const totals = {
      plans: groups.length,
      emails: rows.length,
      sent: rows.filter((r) => r.status.toLowerCase() === "sent").length,
      failed: rows.filter((r) => ["failed", "error", "bounced"].includes(r.status.toLowerCase())).length,
      queued: rows.filter((r) => !["sent", "failed", "error", "bounced"].includes(r.status.toLowerCase())).length,
    };

    return { groups, totals };
  });
