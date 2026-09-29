import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Anonymous count for KAU's "Smoke-Free University" cards (/kau).
 * Reuses the poster tables with poster_type = "kau_smokefree".
 * Names and photos stay on the visitor's device and never reach the server.
 *   GET  → { ok, count }                         cards made so far
 *   POST → { action: "create", … } → { ok, count }  once per browser
 *          { action: "save" | "share" | "x" | "whatsapp", … } → { ok }
 */
const POSTER_TYPE = "kau_smokefree";

const Body = z.object({
  action: z.enum(["create", "save", "share", "x", "whatsapp"]),
  design: z.string().regex(/^[a-z]{2,16}$/),
  size: z.enum(["x", "sq", "story"]).optional(),
  lang: z.enum(["ar", "en"]).optional(),
  message: z
    .string()
    .regex(/^([a-z]{1,2}\d{1,2}|custom)$/)
    .optional(),
  sid: z.string().max(128).optional(),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function countCards(): Promise<number> {
  const { count, error } = await supabaseAdmin
    .from("poster_creations")
    .select("id", { count: "exact", head: true })
    .eq("poster_type", POSTER_TYPE);
  if (error) throw error;
  return count ?? 0;
}

export const Route = createFileRoute("/api/kau-cards")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return json({ ok: true, count: await countCards() });
        } catch (e) {
          console.error("kau-cards count error", e);
          return json({ ok: false }, 500);
        }
      },
      POST: async ({ request }) => {
        let body: z.infer<typeof Body>;
        try {
          body = Body.parse(await request.json());
        } catch {
          return json({ ok: false, error: "bad_request" }, 400);
        }
        try {
          if (body.action === "create") {
            const { error } = await supabaseAdmin.from("poster_creations").insert({
              poster_type: POSTER_TYPE,
              template_name: body.design,
              message_key: body.message ?? null,
              language: body.lang ?? null,
              export_size: body.size ?? null,
              anonymous_session_id: body.sid ?? null,
            });
            if (error) throw error;
            return json({ ok: true, count: await countCards() });
          }
          const { error } = await supabaseAdmin.from("poster_events").insert({
            event_type: `kau_${body.action}`,
            poster_type: POSTER_TYPE,
            template_name: body.design,
            anonymous_session_id: body.sid ?? null,
          });
          if (error) throw error;
          return json({ ok: true });
        } catch (e) {
          console.error("kau-cards save error", e);
          return json({ ok: false }, 500);
        }
      },
    },
  },
});
