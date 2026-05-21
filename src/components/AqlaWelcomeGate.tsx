import { useState } from "react";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import aqlaLogo from "@/assets/aqla-logo.png";
import { PreLoginAssistant } from "@/components/PreLoginAssistant";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";

export function AqlaWelcomeGate() {
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);
    try {
      // Save intended destination so we can return after login
      try {
        if (typeof window !== "undefined" && window.location.pathname !== "/") {
          sessionStorage.setItem("aqla_post_login_redirect", window.location.pathname + window.location.search);
        }
      } catch { /* ignore */ }

      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("تعذّر تسجيل الدخول. حاول مرة أخرى.");
        setLoading(false);
        return;
      }
      // Redirect happens via lovable broker; nothing else to do.
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ غير متوقع. حاول مرة أخرى.");
      setLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      lang="ar"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto bg-gradient-to-b from-[#0b3a25] via-[#0e4a30] to-[#072018] px-5 py-10 text-[#f4f0e1]"
      style={{ unicodeBidi: "plaintext" }}
    >
      {/* subtle decorative gold glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9a84c]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-[#c9a84c]/30 bg-black/20 px-6 py-10 text-center shadow-2xl backdrop-blur-sm sm:px-10 sm:py-12">
        <img
          src={aqlaLogo}
          alt="أقلع — Aqla"
          className="mx-auto mb-6 h-20 w-20 rounded-full bg-white/95 object-contain p-2 shadow-lg sm:h-24 sm:w-24"
        />

        <h1 className="text-3xl font-bold tracking-tight text-[#f6e7b8] sm:text-4xl" style={{ unicodeBidi: "plaintext" }}>
          يا هلا والله في أقلع
        </h1>

        <p
          dir="rtl"
          className="mt-5 text-base leading-relaxed text-[#eae3c6] sm:text-lg"
          style={{ textAlign: "right", unicodeBidi: "plaintext" }}
        >
          للدخول إلى المنصة والاطلاع على المسارات والخدمات، نرجو التسجيل باستخدام حساب Google.
        </p>

        <p className="mt-3 text-xs text-[#d6cda3] sm:text-sm">
          منصة مجانية للجميع، وستبقى مجانية.
        </p>

        <button
          type="button"
          onClick={() => void signIn()}
          disabled={loading}
          className="mt-7 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[#c9a84c]/50 bg-white px-6 py-3 text-base font-semibold text-[#0b3a25] shadow-md transition hover:bg-[#fdf8e6] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          <GoogleMark />
          <span style={{ unicodeBidi: "plaintext" }}>
            {loading ? "جارٍ التحويل…" : "الدخول باستخدام Google"}
          </span>
        </button>

        <p
          dir="rtl"
          lang="ar"
          className="mt-8 text-[12px] leading-relaxed text-[#cfc69a] sm:text-[13px]"
          style={{ textAlign: "right", unicodeBidi: "plaintext" }}
        >
          في أقلع، نضع صحة الإنسان وجودة الحياة في قلب رسالتنا، ونسعى لجعل أول خطوة للإقلاع أسهل، وأقرب، وأكثر إنسانية — بما يتماشى مع مستهدفات رؤية المملكة 2030 بقيادة صاحب السمو الملكي الأمير محمد بن سلمان بن عبدالعزيز آل سعود، حفظه الله.‏
        </p>
      </div>

      {/* Pre-login floating widgets */}
      <PreLoginAssistant />
      <FloatingWhatsAppButton forceVisible />
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.7 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 6.1 29.7 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.5 0 10.5-2.1 14.3-5.5l-6.6-5.4C29.6 34.7 26.9 36 24 36c-5.2 0-9.7-3.3-11.3-8l-6.5 5C9.4 39.6 16.1 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.6 5.4C41 35.9 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
