import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { withoutContactDetails } from "@/lib/contact/public-plan";

export default defineTool({
  name: "list_my_quit_plans",
  title: "List my quit plans",
  description: "List the signed-in user's quit plans from Aqla, most recent first.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).default(10).describe("Max number of plans to return."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const userId = ctx.getUserId();
    if (!userId) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    // Base-table contact reads are admin-only; the verified tool caller gets
    // only their own projected, contact-redacted plan data.
    const { supabaseAdmin: sb } = await import("@/integrations/supabase/client.server");
    const { data, error } = await sb
      .from("quit_plans")
      .select("id, quit_goal, quit_date, plan, created_at, updated_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const plans = (data ?? []).map((row) => ({ ...row, plan: withoutContactDetails(row.plan) }));
    return {
      content: [{ type: "text", text: JSON.stringify(plans, null, 2) }],
      structuredContent: { plans },
    };
  },
});
