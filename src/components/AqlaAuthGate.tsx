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
]);

// Public prefixes (dynamic routes)
const PUBLIC_PREFIXES = ["/certificate/", "/share/"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function AqlaAuthGate({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

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

  if (!session && !publicRoute) {
    return <AqlaWelcomeGate />;
  }

  return <>{children}</>;
}
