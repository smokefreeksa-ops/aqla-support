import { useEffect, useState } from "react";
import { Linkedin, Twitter, X as XIcon } from "lucide-react";
import { toast } from "sonner";

const STORAGE = "aqla.challenge.banner.v1";
const OWNER_EMAIL = "prof.maliking@gmail.com";

type Stats = { joined: number; cards: number; shares: number; visits: number };

function loadStats(): Stats {
  if (typeof window === "undefined") return { joined: 21, cards: 7, shares: 18, visits: 58 };
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { joined: 21, cards: 7, shares: 18, visits: 58 };
}
function saveStats(s: Stats) {
  try { localStorage.setItem(STORAGE, JSON.stringify(s)); } catch { /* ignore */ }
}

export function ChallengeBanner() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // count a visit once per tab session
    if (typeof window === "undefined") return;
    const key = "aqla.challenge.visited";
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      setStats((s) => {
        const next = { ...s, visits: s.visits + 1 };
        saveStats(next);
        return next;
      });
    }
  }, []);

  if (dismissed) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      university: String(fd.get("university") || "").trim(),
      college: String(fd.get("college") || "").trim(),
      role: String(fd.get("role") || "").trim(),
      consent: fd.get("consent") === "on",
      at: new Date().toISOString(),
      page: typeof window !== "undefined" ? window.location.href : "",
    };
    if (!payload.name || !payload.email || !payload.consent) {
      toast.error("الاسم والبريد والموافقة مطلوبة");
      setSending(false);
      return;
    }

    const subject = encodeURIComponent("تسجيل جديد — تحدي أقلع");
    const body = encodeURIComponent(
      `تسجيل جديد عبر البانر:\n\n` +
      `الاسم: ${payload.name}\nالبريد: ${payload.email}\nالجوال: ${payload.phone}\n` +
      `الجامعة: ${payload.university}\nالكلية: ${payload.college}\nالصفة: ${payload.role}\n` +
      `الصفحة: ${payload.page}\nالتاريخ: ${payload.at}\n`
    );
    // Open mail client to deliver to owner email
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;

    setStats((s) => {
      const next = { ...s, joined: s.joined + 1 };
      saveStats(next);
      return next;
    });
    toast.success("تم تسجيلك بنجاح ✨");
    setOpen(false);
    setSending(false);
  }

  return (
    <div dir="rtl" className="relative w-full overflow-hidden bg-gradient-to-l from-red-900 via-red-800 to-red-950 text-white shadow-lg">
      {/* shimmer stars */}
      <div className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 12% 30%, #fff, transparent), radial-gradient(1px 1px at 38% 70%, #fff, transparent), radial-gradient(1.5px 1.5px at 65% 25%, #fff, transparent), radial-gradient(1px 1px at 88% 60%, #fff, transparent), radial-gradient(1px 1px at 50% 50%, #fff, transparent)",
          backgroundSize: "300px 100%",
          animation: "aqlaShimmer 6s linear infinite",
        }}
      />
      <style>{`
        @keyframes aqlaShimmer { from { background-position: 0 0; } to { background-position: 600px 0; } }
        @keyframes aqlaPulseDot { 0%,100% { opacity:1; transform:scale(1);} 50%{opacity:.55; transform:scale(1.35);} }
      `}</style>

      <div className="relative flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
        <div className="flex items-center gap-3 order-1">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-rose-300 shadow-[0_0_12px_rgba(255,200,200,.9)]"
            style={{ animation: "aqlaPulseDot 1.4s ease-in-out infinite" }}
          />
          <span className="text-[13px] sm:text-sm font-semibold tracking-wide">
            أنشئ بطاقة إنجازك وشاركها مع زملائك
          </span>
          <button
            onClick={() => setOpen(true)}
            className="ms-1 rounded-full bg-white text-red-800 text-[12px] sm:text-[13px] font-bold px-3 py-1 hover:bg-rose-50 transition"
          >
            انضم بسرعة
          </button>
        </div>

        <div className="flex items-center gap-4 text-[11px] sm:text-xs order-3 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
          <span className="hidden sm:inline opacity-80">مباشر · تفاعل اللحظة</span>
          <Stat n={stats.joined} label="طالب انضم" />
          <Stat n={stats.cards} label="بطاقة أُنشئت" />
          <Stat n={stats.shares} label="مشاركة" />
          <Stat n={stats.visits} label="زيارة" />
        </div>

        <div className="flex items-center gap-2 order-2 sm:order-3">
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer"
             className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition">
            <Linkedin className="h-3.5 w-3.5" />
          </a>
          <a href="https://twitter.com/" target="_blank" rel="noreferrer"
             className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 transition">
            <Twitter className="h-3.5 w-3.5" />
          </a>
          <span className="text-[11px] opacity-80 hidden sm:inline">تابعنا</span>
          <button
            onClick={() => setDismissed(true)}
            aria-label="إغلاق"
            className="ms-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4" onClick={() => setOpen(false)}>
          <div
            dir="rtl"
            className="w-full max-w-md rounded-2xl bg-white text-slate-900 p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-red-900">انضم بسرعة</h3>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-800 text-sm">إغلاق</button>
            </div>
            <form onSubmit={onSubmit} className="space-y-2.5">
              <input name="name" required placeholder="الاسم" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input name="email" type="email" required placeholder="البريد الإلكتروني" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <input name="phone" placeholder="الجوال (اختياري)" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input name="university" placeholder="الجامعة" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input name="college" placeholder="الكلية" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <input name="role" placeholder="الصفة" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <label className="flex items-start gap-2 text-xs text-slate-600 leading-5">
                <input type="checkbox" name="consent" className="mt-0.5" required />
                أوافق على إرسال بياناتي للمُيسّر لغرض التواصل والمتابعة.
              </label>
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-lg bg-red-800 text-white py-2 text-sm font-semibold hover:bg-red-900 disabled:opacity-60"
              >
                {sending ? "جارٍ الإرسال…" : "إرسال"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <span className="flex items-baseline gap-1">
      <strong className="text-white font-bold">{n}</strong>
      <span className="opacity-85">{label}</span>
    </span>
  );
}
