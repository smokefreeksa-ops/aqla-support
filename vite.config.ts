// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import path from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";

// Load all env vars (including non-VITE_ secrets like SUPABASE_SERVICE_ROLE_KEY)
// into process.env for server routes. Do NOT expose these via envDefine.
const serverEnv = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");
Object.assign(process.env, serverEnv);
// Fallback for the publishable Supabase client config.
// The published build environment does not always provide VITE_SUPABASE_*, which
// made the browser client throw and trip the app-wide error boundary on the live
// site. These are publishable (anon) values and are safe to ship in the bundle.
// Only applied when the env var is genuinely absent at build time.
const PUBLISHABLE_FALLBACK: Record<string, string> = {
  VITE_SUPABASE_URL: "https://axqfmggclwicxhtshloc.supabase.co",
  VITE_SUPABASE_PROJECT_ID: "axqfmggclwicxhtshloc",
  VITE_SUPABASE_PUBLISHABLE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF4cWZtZ2djbHdpY3hodHNobG9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTI1MjgsImV4cCI6MjA5NDU2ODUyOH0.DB5mwafKsbDKNE1U5ziQag0uWKnRlianwpUab288ms4",
};

const envDefine: Record<string, string> = {};
for (const [key, value] of Object.entries(PUBLISHABLE_FALLBACK)) {
  if (!process.env[key]) {
    process.env[key] = value;
    envDefine[`import.meta.env.${key}`] = JSON.stringify(value);
  }
}

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    define: envDefine,
    plugins: [mcpPlugin()],

    resolve: {
      alias: {
        "entities/lib/decode.js": path.resolve(
          process.cwd(),
          "node_modules/entities/lib/decode.js",
        ),
        "entities/lib/encode.js": path.resolve(
          process.cwd(),
          "node_modules/entities/lib/encode.js",
        ),
        entities: path.resolve(process.cwd(), "node_modules/entities"),
      },
    },
  },
});
