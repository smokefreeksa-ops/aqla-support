import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function userHasRole(userId: string, role: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role as never)
    .maybeSingle();
  return !!data;
}

export async function userHasAnyRole(userId: string, roles: string[]): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", roles as never);
  return !!(data && data.length > 0);
}

export async function ensureAdmin(userId: string): Promise<void> {
  if (!(await userHasRole(userId, "admin"))) {
    throw new Error("Forbidden: admin role required");
  }
}

export async function ensureStaff(userId: string): Promise<void> {
  if (!(await userHasAnyRole(userId, ["admin", "physician", "receptionist"]))) {
    throw new Error("Forbidden: staff role required");
  }
}
