import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { CONTACT_COLUMNS, contactsCsv, type ContactRow } from "./contacts-csv";

export const listQuitChatContacts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    search: z.string().trim().max(254).default(""),
    minors: z.enum(["all", "minors", "adults"]).default("all"),
    page: z.number().int().min(0).max(10000).default(0),
    exportCsv: z.boolean().default(false),
  }).parse(input))
  .handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId, _role: "admin",
    });
    if (roleError || !isAdmin) throw new Error("Forbidden: admin access required");
    const fetchPage = async (from: number, size: number) => {
      let query = context.supabase.from("v_quit_chat_contacts").select(CONTACT_COLUMNS.join(","), { count: "exact" });
      const search = data.search.replace(/[(),"\\%_]/g, "");
      if (search) query = query.or(`nickname.ilike.%${search}%,email.ilike.%${search}%,mobile.ilike.%${search}%`);
      if (data.minors !== "all") query = query.eq("is_minor", data.minors === "minors");
      const result = await query.order("created_at", { ascending: false }).range(from, from + size - 1);
      if (result.error) throw new Error("Unable to load contacts");
      return { rows: (result.data ?? []) as unknown as ContactRow[], total: result.count ?? 0 };
    };
    const first = await fetchPage(data.exportCsv ? 0 : data.page * 50, data.exportCsv ? 500 : 50);
    if (!data.exportCsv) return { ...first, csv: null as string | null };
    const rows = [...first.rows];
    for (let from = 500; from < first.total; from += 500) rows.push(...(await fetchPage(from, 500)).rows);
    return { rows: [] as ContactRow[], total: first.total, csv: contactsCsv(rows) };
  });