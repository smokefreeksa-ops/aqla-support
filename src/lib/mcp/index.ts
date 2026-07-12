import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listMyQuitPlans from "./tools/list-my-quit-plans";
import listMyCravingEvents from "./tools/list-my-craving-events";

// Build a direct Supabase issuer from the project ref. On publish, SUPABASE_URL
// is rewritten to a .lovable.cloud proxy which mcp-js rejects; the project ref
// survives publish unchanged via VITE_SUPABASE_PROJECT_ID (inlined by Vite).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "aqla-mcp",
  title: "Aqla — أقلع",
  version: "0.1.0",
  instructions:
    "Tools for Aqla (أقلع), a Saudi tobacco/nicotine cessation research app. Read the signed-in user's own quit plans and craving-event history. All tools are scoped to the authenticated user via OAuth.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listMyQuitPlans, listMyCravingEvents],
});
