import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AqlaWelcomeGate } from "@/components/AqlaWelcomeGate";

// Routes that remain accessible without authentication.
const PUBLIC_EXACT = new Set<string>([
  "/privacy",
  "/terms",
  "/medical-disclaimer",
  "/contact",
  "/cookies",
  "/sharing-policy",
  "/try",
]);

// Public prefixes (dynamic routes)
const PUBLIC_PREFIXES = ["/certificate/", "/share/"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

// Preview-only auth bypass. NEVER active on the published production domain.
// Activated by visiting any URL with ?test_auth=1 in Lovable preview or dev.
const TEST_AUTH_KEY = "aqla_test_auth_bypass";

function isPreviewHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  // Vite dev
  if (import.meta.env.DEV) return true;
  // Lovable preview sandboxes (id-preview--*, *-dev.lovable.app, *.sandbox.lovable.dev, etc.)
  // Explicitly EXCLUDE the production hosts: aqla-support.lovable.app and any custom domain.
  if (host === "aqla-support.lovable.app") return false;
  if (host.endsWith(".lovable.app") && (host.startsWith("id-preview--") || host.includes("--") || host.endsWith("-dev.lovable.app"))) {
    return true;
  }
  if (host.endsWith(".lovable.dev") || host.endsWith(".sandbox.lovable.dev")) return true;
  if (host === "localhost" || host === "127.0.0.1") return true;
  return false;
}

function readTestAuthBypass(): boolean {
  if (typeof window === "undefined") return false;
  if (!isPreviewHost()) return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("test_auth") === "1") {
      sessionStorage.setItem(TEST_AUTH_KEY, "1");
      return true;
    }
    if (params.get("test_auth") === "0") {
      sessionStorage.removeItem(TEST_AUTH_KEY);
      return false;
    }
    return sessionStorage.getItem(TEST_AUTH_KEY) === "1";
  } catch {
    return false;
  }
}

function TestAuthBanner() {
  return (
    <div
      dir="rtl"
      className="fixed top-0 inset-x-0 z-[200] bg-amber-500 text-black text-center text-xs font-semibold py-1.5 px-3 shadow-md"
      role="status"
    >
      وضع اختبار المعاينة مفعل — Preview test mode (no real user data)
    </div>
  );
}

export function AqlaAuthGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [testAuth, setTestAuth] = useState(false);

  useEffect(() => {
    setTestAuth(readTestAuthBypass());
  }, [location.pathname, location.search]);

  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      if (!mounted) return;
      setSession(s);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setReady(true);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // After successful login, return to the path the user originally requested.
  useEffect(() => {
    if (!session || typeof window === "undefined") return;
    try {
      const target = sessionStorage.getItem("aqla_post_login_redirect");
      if (target && target !== window.location.pathname) {
        sessionStorage.removeItem("aqla_post_login_redirect");
        window.history.replaceState({}, "", target);
      }
    } catch { /* ignore */ }
  }, [session]);

  const publicRoute = isPublicPath(location.pathname);

  // Wait for initial session check to avoid flashing the gate for logged-in users.
  if (!ready) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0b3a25]" />
    );
  }

  if (!session && !publicRoute && !testAuth) {
    return <AqlaWelcomeGate />;
  }

  return (
    <>
      {testAuth && !session ? <TestAuthBanner /> : null}
      {children}
    </>
  );
}
