import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Anonymous counter for the "Smoke-free Campus" awareness cards (/qarari).
 * Reuses the poster tables; rows are marked poster_type = "kau_awareness_m" | "kau_awareness_f".
 * Names typed on the cards never reach the server.
 *   GET  → { ok, count }            number of cards made so far
 *   POST → { action: "create", … } → { ok, number }   supporter number for this browser
 *          { action: "save" | "share" | "x" | "whatsapp", … } → { ok }
 */
const TYPE_PREFIX = "kau_awareness";

const Body = z.object({
  action: z.enum(["create", "save", "share", "x", "whatsapp"]),
  style: z.string().regex(/^[a-z]{2,16}$/),
  size: z.enum(["x", "sq", "story"]).optional(),
  gender: z.enum(["m", "f"]),
  lang: z.enum(["ar", "en"]).optional(),
  message: z
    .string()
    .regex(/^[a-z0-9]{1,8}$/)
    .optional(),
  sid: z.string().max(128).optional(),
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function countCards(upTo?: string): Promise<number> {
  let query = supabaseAdmin
    .from("poster_creations")
    .select("id", { count: "exact", head: true })
    .like("poster_type", `${TYPE_PREFIX}%`);
  if (upTo) query = query.lte("created_at", upTo);
  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export const Route = createFileRoute("/api/qarari")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return json({ ok: true, count: await countCards() });
        } catch (e) {
          console.error("qarari count error", e);
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
        const posterType = `${TYPE_PREFIX}_${body.gender}`;
        try {
          if (body.action === "create") {
            const { data, error } = await supabaseAdmin
              .from("poster_creations")
              .insert({
                poster_type: posterType,
                template_name: body.style,
                message_key: body.message ?? null,
                language: body.lang ?? null,
                export_size: body.size ?? null,
                anonymous_session_id: body.sid ?? null,
              })
              .select("created_at")
              .single();
            if (error) throw error;
            return json({ ok: true, number: await countCards(data.created_at) });
          }
          const { error } = await supabaseAdmin.from("poster_events").insert({
            event_type: `kau_${body.action}`,
            poster_type: posterType,
            template_name: body.style,
            anonymous_session_id: body.sid ?? null,
          });
          if (error) throw error;
          return json({ ok: true });
        } catch (e) {
          console.error("qarari save error", e);
          return json({ ok: false }, 500);
        }
      },
    },
  },
});
