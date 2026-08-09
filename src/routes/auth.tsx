import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import aqlaLogo from "@/assets/aqla-logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Staff Login — Aqla" }] }),
  validateSearch: (s: { next?: unknown }): { next?: string } => ({
    next:
      typeof s.next === "string" && s.next.startsWith("/") && !s.next.startsWith("//")
        ? s.next
        : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  const goNext = () => {
    if (next) window.location.href = next;
    else nav({ to: "/dashboard" });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) goNext();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const emailRedirectTo = next
          ? window.location.origin + next
          : window.location.origin + "/dashboard";
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo },
        });
        if (error) throw error;
        toast.success("Account created. Ask a physician/admin to assign your role.");
      }
      goNext();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4 py-8">
      <div className="w-full max-w-sm space-y-4">
        <div
          dir="rtl"
          className="rounded-2xl border border-[#006C35]/25 bg-gradient-to-br from-[#006C35]/10 to-[#00A65A]/5 p-4 text-center shadow-sm"
        >
          <p className="text-sm font-semibold leading-6 text-[#006C35]">
            شارك تجربتك مع أضرار النيكوتين وساهم في البحث العلمي 🌱
          </p>
          <p className="mt-1 text-xs text-foreground/70">
            تسجيلك يساعدنا نفهم أكثر ونطوّر دعم الإقلاع في السعودية.
          </p>
        </div>
        <Card className="w-full p-6">
        <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground">
          <img src={aqlaLogo} alt="Aqla — أقلع logo" className="h-10 w-auto object-contain" />
          <span>← Aqla — أقلع</span>
        </Link>

        <h1 className="mt-3 text-xl font-semibold">{mode === "signin" ? "Staff Login" : "Create staff account"}</h1>
        <form onSubmit={handle} className="mt-4 space-y-3">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Password</Label>
            <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>
        <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="mt-3 w-full text-xs text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "No account? Create one" : "Have an account? Sign in"}
        </button>
        <p className="mt-4 text-xs text-muted-foreground">
          Roles (receptionist / physician) must be assigned by a physician/admin in the backend.
        </p>
      </Card>
      </div>
    </div>

  );
}
