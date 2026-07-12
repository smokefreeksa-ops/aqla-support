import { useEffect, useState } from "react";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Loader2, Mail, Phone } from "lucide-react";
import aqlaLogo from "@/assets/aqla-logo.png";
import { PreLoginAssistant } from "@/components/PreLoginAssistant";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";
import { ResearchBanner } from "@/components/ResearchBanner";

type Mode = "choose" | "phone" | "email";
type PhoneStep = "enter" | "verify";
type EmailStep = "enter" | "sent";

const COUNTRY_CODES: Array<{ code: string; label: string }> = [
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+965", label: "🇰🇼 +965" },
  { code: "+973", label: "🇧🇭 +973" },
  { code: "+974", label: "🇶🇦 +974" },
  { code: "+968", label: "🇴🇲 +968" },
  { code: "+20", label: "🇪🇬 +20" },
  { code: "+962", label: "🇯🇴 +962" },
  { code: "+90", label: "🇹🇷 +90" },
  { code: "+62", label: "🇮🇩 +62" },
  { code: "+60", label: "🇲🇾 +60" },
  { code: "+92", label: "🇵🇰 +92" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+1", label: "🇺🇸 +1" },
];

const RESEND_COOLDOWN = 60;

function savePostLoginRedirect() {
  try {
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      sessionStorage.setItem(
        "aqla_post_login_redirect",
        window.location.pathname + window.location.search,
      );
    }
  } catch {
    /* ignore */
  }
}

function normalizePhone(country: string, local: string): string | null {
  const digits = local.replace(/\D/g, "");
  if (!digits) return null;
  // strip a leading 0 commonly typed in KSA/GCC formats
  const trimmed = digits.replace(/^0+/, "");
  if (trimmed.length < 6 || trimmed.length > 15) return null;
  return `${country}${trimmed}`;
}

export function AqlaWelcomeGate() {
  const [mode, setMode] = useState<Mode>("choose");

  // Google
  const [googleLoading, setGoogleLoading] = useState(false);

  // Phone state
  const [country, setCountry] = useState("+966");
  const [phone, setPhone] = useState("");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("enter");
  const [phoneFull, setPhoneFull] = useState("");
  const [otp, setOtp] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Email state
  const [email, setEmail] = useState("");
  const [emailStep, setEmailStep] = useState<EmailStep>("enter");
  const [emailLoading, setEmailLoading] = useState(false);

  // Resend cooldown shared
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    try {
      savePostLoginRedirect();
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("تعذّر تسجيل الدخول. حاول مرة أخرى.");
        setGoogleLoading(false);
      }
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ غير متوقع. حاول مرة أخرى.");
      setGoogleLoading(false);
    }
  }

  async function sendPhoneOtp() {
    const full = normalizePhone(country, phone);
    if (!full) {
      toast.error("رقم الجوال غير صحيح.");
      return;
    }
    setPhoneLoading(true);
    try {
      savePostLoginRedirect();
      const { error } = await supabase.auth.signInWithOtp({ phone: full });
      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        if (msg.includes("rate") || msg.includes("limit")) {
          toast.error("يرجى الانتظار قليلًا قبل طلب رمز جديد.");
        } else if (msg.includes("sms") || msg.includes("provider") || msg.includes("not enabled")) {
          toast.error("خدمة الرسائل النصية غير مفعّلة حاليًا. الرجاء استخدام Google أو البريد الإلكتروني.");
        } else {
          toast.error("تعذّر إرسال رمز التحقق. حاول مرة أخرى.");
        }
        setPhoneLoading(false);
        return;
      }
      setPhoneFull(full);
      setPhoneStep("verify");
      setCooldown(RESEND_COOLDOWN);
      toast.success("تم إرسال رمز التحقق إلى رقم الجوال.");
    } catch (e) {
      console.error(e);
      toast.error("تعذّر الاتصال. حاول مرة أخرى.");
    } finally {
      setPhoneLoading(false);
    }
  }

  async function verifyPhoneOtp() {
    if (!otp.trim()) return;
    setPhoneLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phoneFull,
        token: otp.trim(),
        type: "sms",
      });
      if (error) {
        toast.error("رمز التحقق غير صحيح أو انتهت صلاحيته. حاول مرة أخرى.");
        setPhoneLoading(false);
        return;
      }
      toast.success("تم تسجيل الدخول.");
      // onAuthStateChange in root will refresh; gate disappears automatically.
    } catch (e) {
      console.error(e);
      toast.error("تعذّر التحقق. حاول مرة أخرى.");
      setPhoneLoading(false);
    }
  }

  async function sendEmailLink() {
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error("البريد الإلكتروني غير صحيح.");
      return;
    }
    setEmailLoading(true);
    try {
      savePostLoginRedirect();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        const msg = error.message?.toLowerCase() ?? "";
        if (msg.includes("rate") || msg.includes("limit")) {
          toast.error("يرجى الانتظار قليلًا قبل طلب رابط جديد.");
        } else {
          toast.error("تعذّر إرسال رابط الدخول. حاول مرة أخرى.");
        }
        setEmailLoading(false);
        return;
      }
      setEmailStep("sent");
      setCooldown(RESEND_COOLDOWN);
      toast.success("تم إرسال رابط الدخول إلى بريدك الإلكتروني.");
    } catch (e) {
      console.error(e);
      toast.error("تعذّر الاتصال. حاول مرة أخرى.");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div
      dir="rtl"
      lang="ar"
      className="fixed inset-0 z-[100] flex flex-col items-center overflow-y-auto bg-gradient-to-b from-[#0b3a25] via-[#0e4a30] to-[#072018] text-[#f4f0e1]"
      style={{ unicodeBidi: "plaintext" }}
    >
      <div className="sticky top-0 z-20 w-full">
        <ResearchBanner />
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center px-5 py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9a84c]/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-[#c9a84c]/30 bg-black/20 px-6 py-9 text-center shadow-2xl backdrop-blur-sm sm:px-10 sm:py-12">
        <img
          src={aqlaLogo}
          alt="أقلع — Aqla"
          className="mx-auto mb-5 h-20 w-20 rounded-full bg-white/95 object-contain p-2 shadow-lg sm:h-24 sm:w-24"
        />

        <h1
          className="text-3xl font-bold tracking-tight text-[#f6e7b8] sm:text-4xl"
          style={{ unicodeBidi: "plaintext" }}
        >
          يا هلا والله في أقلع
        </h1>

        <p
          dir="rtl"
          className="mt-4 text-base leading-relaxed text-[#eae3c6] sm:text-lg"
          style={{ textAlign: "right", unicodeBidi: "plaintext" }}
        >
          للدخول إلى المنصة والاطلاع على المسارات والخدمات، نرجو التسجيل باستخدام حساب Google أو رقم الجوال أو البريد الإلكتروني.
        </p>

        <p className="mt-2 text-xs text-[#d6cda3] sm:text-sm">منصة مجانية للجميع، وستبقى مجانية.</p>

        {/* === Login options === */}
        <div className="mt-6 space-y-3">
          {/* Google — always visible & prominent */}
          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={googleLoading}
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[#c9a84c]/50 bg-white px-6 py-3 text-base font-semibold text-[#0b3a25] shadow-md transition hover:bg-[#fdf8e6] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {googleLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <GoogleMark />}
            <span style={{ unicodeBidi: "plaintext" }}>
              {googleLoading ? "جارٍ التحويل…" : "الدخول باستخدام Google"}
            </span>
          </button>

          {mode === "choose" && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setMode("phone")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9a84c]/40 bg-transparent px-4 py-2.5 text-sm font-semibold text-[#f4f0e1] transition hover:bg-white/5"
              >
                <Phone className="h-4 w-4" />
                <span>الدخول برقم الجوال</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("email")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9a84c]/40 bg-transparent px-4 py-2.5 text-sm font-semibold text-[#f4f0e1] transition hover:bg-white/5"
              >
                <Mail className="h-4 w-4" />
                <span>الدخول بالبريد الإلكتروني</span>
              </button>
            </div>
          )}

          {/* Phone flow */}
          {mode === "phone" && (
            <div className="rounded-xl border border-[#c9a84c]/30 bg-black/20 p-4 text-right">
              {phoneStep === "enter" && (
                <>
                  <label className="mb-1.5 block text-xs text-[#d6cda3]">رقم الجوال</label>
                  <div className="flex gap-2" dir="ltr">
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="rounded-md border border-white/20 bg-[#0b3a25] px-2 py-2 text-sm text-[#f4f0e1] focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                    >
                      {COUNTRY_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="5XXXXXXXX"
                      className="flex-1 rounded-md border border-white/20 bg-white/95 px-3 py-2 text-sm text-[#0b3a25] placeholder:text-[#0b3a25]/40 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                      dir="ltr"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setMode("choose")}
                      className="text-xs text-[#d6cda3] underline-offset-4 hover:underline"
                    >
                      رجوع
                    </button>
                    <button
                      type="button"
                      onClick={() => void sendPhoneOtp()}
                      disabled={phoneLoading || !phone.trim()}
                      className="inline-flex items-center gap-2 rounded-md bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#0b3a25] disabled:opacity-50"
                    >
                      {phoneLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 rotate-180" />}
                      <span>إرسال رمز التحقق</span>
                    </button>
                  </div>
                </>
              )}
              {phoneStep === "verify" && (
                <>
                  <p className="mb-2 text-xs text-[#d6cda3]" dir="rtl" style={{ unicodeBidi: "plaintext" }}>
                    أدخل رمز التحقق المرسل إلى <span dir="ltr">{phoneFull}</span>
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full rounded-md border border-white/20 bg-white/95 px-3 py-2 text-center text-lg tracking-widest text-[#0b3a25] placeholder:text-[#0b3a25]/30 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                    dir="ltr"
                  />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneStep("enter");
                        setOtp("");
                      }}
                      className="text-xs text-[#d6cda3] underline-offset-4 hover:underline"
                    >
                      تعديل الرقم
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={cooldown > 0 || phoneLoading}
                        onClick={() => void sendPhoneOtp()}
                        className="text-xs text-[#d6cda3] underline-offset-4 hover:underline disabled:opacity-50"
                      >
                        {cooldown > 0 ? `إعادة الإرسال (${cooldown})` : "إعادة إرسال الرمز"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void verifyPhoneOtp()}
                        disabled={phoneLoading || !otp.trim()}
                        className="inline-flex items-center gap-2 rounded-md bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#0b3a25] disabled:opacity-50"
                      >
                        {phoneLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        <span>تحقق ودخول</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Email flow */}
          {mode === "email" && (
            <div className="rounded-xl border border-[#c9a84c]/30 bg-black/20 p-4 text-right">
              {emailStep === "enter" && (
                <>
                  <label className="mb-1.5 block text-xs text-[#d6cda3]">البريد الإلكتروني</label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-md border border-white/20 bg-white/95 px-3 py-2 text-sm text-[#0b3a25] placeholder:text-[#0b3a25]/40 focus:outline-none focus:ring-2 focus:ring-[#c9a84c]/40"
                    dir="ltr"
                  />
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setMode("choose")}
                      className="text-xs text-[#d6cda3] underline-offset-4 hover:underline"
                    >
                      رجوع
                    </button>
                    <button
                      type="button"
                      onClick={() => void sendEmailLink()}
                      disabled={emailLoading || !email.trim()}
                      className="inline-flex items-center gap-2 rounded-md bg-[#c9a84c] px-4 py-2 text-sm font-semibold text-[#0b3a25] disabled:opacity-50"
                    >
                      {emailLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 rotate-180" />}
                      <span>إرسال رابط الدخول</span>
                    </button>
                  </div>
                </>
              )}
              {emailStep === "sent" && (
                <div className="space-y-3 text-right">
                  <p className="text-sm text-[#f4f0e1]" dir="rtl" style={{ unicodeBidi: "plaintext" }}>
                    تم إرسال رابط الدخول إلى <span dir="ltr">{email}</span>. افتح الرسالة من جوالك أو جهازك لإكمال الدخول.
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEmailStep("enter");
                      }}
                      className="text-xs text-[#d6cda3] underline-offset-4 hover:underline"
                    >
                      تعديل البريد
                    </button>
                    <button
                      type="button"
                      disabled={cooldown > 0 || emailLoading}
                      onClick={() => void sendEmailLink()}
                      className="text-xs text-[#d6cda3] underline-offset-4 hover:underline disabled:opacity-50"
                    >
                      {cooldown > 0 ? `إعادة الإرسال (${cooldown})` : "إعادة إرسال الرابط"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <p
          dir="rtl"
          lang="ar"
          className="mt-7 text-[12px] leading-relaxed text-[#cfc69a] sm:text-[13px]"
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
