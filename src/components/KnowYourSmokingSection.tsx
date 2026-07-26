import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/* =====================================================================================
   Know Your Smoking Life — self-contained bilingual section.
   No backend, no storage, no analytics. All state is React-local.
   ===================================================================================== */

type Lang = "en" | "ar";
const T = (en: string, ar: string, lang: Lang) => (lang === "ar" ? ar : en);

const tokens = {
  bg: "#EAF3F0",
  card: "#FFFFFF",
  border: "#D5E3DD",
  ink: "#10352F",
  primary: "#1B6E5F",
  ember: "#E08A2E",
  warn: "#C4452F",
  softTeal: "#DFF0EA",
  softEmber: "#FBEEDC",
  softWarn: "#F9E7E2",
};

export default function KnowYourSmokingSection({ standaloneTool }: { standaloneTool?: number }) {
  const [lang, setLang] = useState<Lang>("ar");
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [open, setOpen] = useState<number | null>(null);
  const [done, setDone] = useState<Record<number, boolean>>({});

  const targetHashRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const applyHash = () => {
      const m = window.location.hash.match(/^#kys-(\d+)$/);
      if (m) {
        const idx = Number(m[1]);
        if (idx >= 0 && idx <= 4) {
          targetHashRef.current = idx;
          // Temporarily take over scroll restoration so the router/browser do
          // not fight our manual scroll to the requested card.
          const originalScrollRestoration = window.history.scrollRestoration;
          window.history.scrollRestoration = "manual";
          window.setTimeout(() => {
            const card = document.getElementById(`kys-${idx}`);
            if (!card) return;
            const stickyHeader = document.querySelector("header.sticky, header.fixed") as HTMLElement | null;
            const headerOffset = (stickyHeader?.offsetHeight ?? 56) + 8;
            const top = card.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top, behavior: "auto" });
            // Expand after the scroll has settled.
            window.setTimeout(() => setOpen(idx), 80);
            // Restore auto scroll restoration shortly after.
            window.setTimeout(() => {
              window.history.scrollRestoration = originalScrollRestoration;
            }, 600);
          }, 3000);
        }
      }
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  const setDoneFor = (idx: number, val: boolean) =>
    setDone((d) => (d[idx] === val ? d : { ...d, [idx]: val }));

  const doneCount = Object.values(done).filter(Boolean).length;
  // Tool 5 (shooter) is not part of the 4-quarter burn signature per spec.
  const burnCount = [0, 1, 2, 3].filter((i) => done[i]).length;


  const tools = [
    {
      emoji: "💸",
      name: T("The Money Counter", "عدّاد المال", lang),
      desc: T(
        "See what smoking really costs you.",
        "شاهد كم يكلفك التدخين فعلاً.",
        lang
      ),
      time: T("~1 min", "≈ دقيقة", lang),
    },
    {
      emoji: "🧲",
      name: T("The Grip Test", "اختبار القبضة", lang),
      desc: T(
        "How tight is nicotine's grip on you?",
        "كم قبضة النيكوتين عليك؟",
        lang
      ),
      time: T("~1 min", "≈ دقيقة", lang),
    },
    {
      emoji: "🪞",
      name: T("The Mirror", "المرآة", lang),
      desc: T(
        "Which parts of you keep the smoke alive?",
        "أي جوانبك تبقي التدخين مشتعلاً؟",
        lang
      ),
      time: T("~1 min", "≈ دقيقة", lang),
    },
    {
      emoji: "🧭",
      name: T("The Compass", "البوصلة", lang),
      desc: T(
        "How ready are you to quit — really?",
        "كم أنت مستعد للإقلاع فعلاً؟",
        lang
      ),
      time: T("~1 min", "≈ دقيقة", lang),
    },
    {
      emoji: "🎯",
      name: T("Break the Smoking Habit Challenge", "تحدي كسر عادة التدخين", lang),
      desc: T(
        "30 seconds. Aim at lit cigarettes. Shatter more than glass.",
        "٣٠ ثانية. صوّب على السجائر المولّعة. حطّم أكثر من الزجاج.",
        lang
      ),
      time: T("30 sec", "٣٠ ثانية", lang),
    },
  ];

  const isStandalone =
    standaloneTool !== undefined && standaloneTool >= 0 && standaloneTool <= 4;

  if (isStandalone) {
    const i = standaloneTool;
    const tool = tools[i];
    return (
      <section
        dir={dir}
        lang={lang}
        style={{ background: tokens.bg, color: tokens.ink }}
        className="min-h-screen"
        aria-label={tool.name}
      >
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
          <Link
            to="/try"
            className="inline-flex items-center gap-1.5 text-sm font-medium opacity-80 hover:opacity-100"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            {T("All tools", "كل الأدوات", lang)}
          </Link>

          <div
            className="mt-6 border overflow-hidden"
            style={{
              background: tokens.card,
              borderColor: tokens.border,
              borderRadius: 18,
            }}
          >
            <div className="w-full text-start p-5">
              <div className="flex items-start gap-3">
                <div className="text-2xl" aria-hidden>
                  {tool.emoji}
                </div>
                <div>
                  <div className="font-semibold text-base">{tool.name}</div>
                  <div className="text-sm opacity-75 mt-1">{tool.desc}</div>
                  <div className="text-xs opacity-80 mt-1">⏱ {tool.time}</div>
                </div>
              </div>
            </div>
            <div
              className="border-t p-5"
              style={{ borderColor: tokens.border }}
            >
              {i === 0 && (
                <MoneyCounter lang={lang} onDone={(v) => setDoneFor(0, v)} />
              )}
              {i === 1 && (
                <GripTest lang={lang} onDone={(v) => setDoneFor(1, v)} />
              )}
              {i === 2 && (
                <Mirror lang={lang} onDone={(v) => setDoneFor(2, v)} />
              )}
              {i === 3 && (
                <Compass lang={lang} onDone={(v) => setDoneFor(3, v)} />
              )}
              {i === 4 && (
                <Shooter lang={lang} onDone={(v) => setDoneFor(4, v)} />
              )}
            </div>
          </div>

          <p className="mt-6 text-xs opacity-60 max-w-3xl">
            {T(
              "This tool is educational. The dependence questions are adapted from the Fagerström Test for Cigarette Dependence; the trait items are brief self-reflection prompts. It is not a medical diagnosis.",
              "هذه الأداة تعليمية. أسئلة الاعتماد مقتبسة من اختبار فاجيرستروم للاعتماد على النيكوتين؛ وعبارات السمات هي دعوات قصيرة للتأمل الذاتي. ليست تشخيصاً طبياً.",
              lang
            )}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="know-your-smoking"
      dir={dir}
      lang={lang}
      style={{ background: "transparent", color: "#f4f0e1" }}
      className="scroll-mt-24"

      aria-label="Know Your Smoking Life"
    >
      <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
        {/* Language toggle (scoped to this section only) */}
        <div className="flex items-center justify-end mb-6">
          <div
            role="group"
            aria-label="Language"
            className="inline-flex overflow-hidden rounded-full border"
            style={{ borderColor: tokens.border, background: "#fff" }}
          >
            <button
              onClick={() => setLang("en")}
              className="px-3 py-1 text-sm"
              style={{
                background: lang === "en" ? tokens.primary : "transparent",
                color: lang === "en" ? "#fff" : tokens.ink,
              }}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ar")}
              className="px-3 py-1 text-sm"
              style={{
                background: lang === "ar" ? tokens.primary : "transparent",
                color: lang === "ar" ? "#fff" : tokens.ink,
              }}
            >
              عربي
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
          {T(
            "Four quick ways to know your smoking",
            "أربع طرق سريعة لتعرف حياتك مع التدخين",
            lang
          )}
        </h2>
        <p className="mt-2 text-sm sm:text-base opacity-80">
          {T(
            "Each tool stands on its own, takes about a minute, and gives your answer immediately.",
            "كل أداة مستقلة، تستغرق دقيقة، وتعطيك إجابتك فوراً.",
            lang
          )}
        </p>
        <p className="mt-1 text-xs opacity-70">
          {T(
            "Your answers never leave this page.",
            "إجاباتك لا تغادر هذه الصفحة.",
            lang
          )}
        </p>

        {/* Cigarette burn signature */}
        <CigaretteBurn count={burnCount} lang={lang} />

        {/* Cards grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => {
            const isOpen = open === i;
            const isDone = !!done[i];
            return (
              <div
                key={i}
                id={`kys-${i}`}
                style={{
                  background: tokens.card,
                  borderColor: tokens.border,
                  borderRadius: 18,
                  color: tokens.ink,
                }}
                className={`border overflow-hidden transition scroll-mt-28 ${
                  isOpen ? "sm:col-span-2 lg:col-span-3" : ""
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-start p-5 focus:outline-none focus-visible:ring-2"
                  style={{ outlineColor: tokens.primary }}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl" aria-hidden>
                        {tool.emoji}
                      </div>
                      <div>
                        <div className="font-semibold text-base">
                          {tool.name}
                        </div>
                        <div className="text-sm opacity-75 mt-1">
                          {tool.desc}
                        </div>
                        <div className="text-xs opacity-80 mt-1">
                          ⏱ {tool.time}
                        </div>
                      </div>
                    </div>
                    {isDone && (
                      <span
                        className="shrink-0 rounded-full px-2 py-1 text-xs font-medium"
                        style={{
                          background: tokens.softTeal,
                          color: tokens.primary,
                        }}
                      >
                        {T("Done ✓", "تم ✓", lang)}
                      </span>
                    )}
                  </div>
                </button>
                {isOpen && (
                  <div
                    className="border-t p-5"
                    style={{ borderColor: tokens.border }}
                  >
                    {i === 0 && (
                      <MoneyCounter
                        lang={lang}
                        onDone={(v) => setDoneFor(0, v)}
                      />
                    )}
                    {i === 1 && (
                      <GripTest lang={lang} onDone={(v) => setDoneFor(1, v)} />
                    )}
                    {i === 2 && (
                      <Mirror lang={lang} onDone={(v) => setDoneFor(2, v)} />
                    )}
                    {i === 3 && (
                      <Compass lang={lang} onDone={(v) => setDoneFor(3, v)} />
                    )}
                    {i === 4 && (
                      <Shooter lang={lang} onDone={(v) => setDoneFor(4, v)} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-xs opacity-60 max-w-3xl">
          {T(
            "This tool is educational. The dependence questions are adapted from the Fagerström Test for Cigarette Dependence; the trait items are brief self-reflection prompts. It is not a medical diagnosis.",
            "هذه الأداة تعليمية. أسئلة الاعتماد مقتبسة من اختبار فاجيرستروم للاعتماد على النيكوتين؛ وعبارات السمات هي دعوات قصيرة للتأمل الذاتي. ليست تشخيصاً طبياً.",
            lang
          )}
        </p>
      </div>
    </section>
  );
}

/* --------------------------- Cigarette burn signature --------------------------- */
function CigaretteBurn({ count, lang }: { count: number; lang: Lang }) {
  const pct = Math.min(1, count / 4);
  const all = count >= 4;
  return (
    <div className="mt-6">
      <div
        className="relative w-full max-w-xl h-10 mx-auto"
        role="img"
        aria-label={T(
          `${count} of 4 tools completed`,
          `${count} من 4 أدوات مكتملة`,
          lang
        )}
      >
        {/* body */}
        <div
          className="absolute inset-y-2 left-0 right-10 rounded-l-full overflow-hidden border"
          style={{ borderColor: "#cfcfcf", background: "#fff" }}
        >
          <div
            className="h-full transition-all duration-700 motion-reduce:transition-none"
            style={{
              width: `${pct * 100}%`,
              background:
                "repeating-linear-gradient(90deg,#4b4b4b 0 6px,#666 6px 10px)",
            }}
          />
        </div>
        {/* filter */}
        <div
          className="absolute inset-y-2 right-0 w-10 rounded-r-full border"
          style={{
            background:
              "repeating-linear-gradient(90deg,#d9b877 0 4px,#c9a45c 4px 8px)",
            borderColor: "#b89452",
          }}
        />
        {/* ember */}
        {count > 0 && count < 4 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full shadow motion-reduce:animate-none"
            style={{
              left: `calc(${pct * 100}% - 8px)`,
              background:
                "radial-gradient(circle,#fff2b3 0%,#ffb84d 40%,#e0570a 80%)",
              boxShadow: "0 0 12px 3px rgba(224,138,46,0.7)",
              animation: "pulse 1.2s ease-in-out infinite",
            }}
            aria-hidden
          />
        )}
      </div>
      <p className="mt-2 text-center text-xs sm:text-sm opacity-75">
        {all
          ? T(
              "You burned the whole thing — and learned more than any cigarette ever taught you.",
              "أحرقتها كاملة — وتعلمت منها أكثر مما علّمتك أي سيجارة.",
              lang
            )
          : T(
              "Each tool you finish burns a quarter of this cigarette — your first one to finish, not smoke.",
              "كل أداة تُكملها تحرق ربع هذه السيجارة — أول سيجارة تنهيها دون أن تدخنها.",
              lang
            )}
      </p>
    </div>
  );
}

/* ================================ TOOL 1 — Money =============================== */
function MoneyCounter({
  lang,
  onDone,
}: {
  lang: Lang;
  onDone: (v: boolean) => void;
}) {
  const [cigsPerDay, setCigsPerDay] = useState(20);
  const [packPrice, setPackPrice] = useState(30);
  const [packSize, setPackSize] = useState(20);
  const [years, setYears] = useState(10);
  const [currency, setCurrency] = useState<"SAR" | "USD" | "EUR" | "GBP">(
    "SAR"
  );

  useEffect(() => {
    onDone(packPrice > 0 && years > 0);
  }, [packPrice, years, onDone]);

  const perDay = (cigsPerDay / packSize) * packPrice;
  const perYear = perDay * 365;
  const total = perYear * years;
  const cigs = cigsPerDay * 365 * years;
  const minutes = cigs * 6;
  const days = Math.round(minutes / 60 / 24);

  const rate = { SAR: 3.75, USD: 1, EUR: 0.92, GBP: 0.79 }[currency];
  const perYearUSD = perYear / rate;
  const flights = Math.floor(perYearUSD / 500);
  const phones = Math.floor(perYearUSD / 1100);
  const groceries = Math.floor(perYearUSD / 420);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={T("Cigarettes per day", "عدد السجائر يومياً", lang)}
        >
          <input
            type="range"
            min={1}
            max={60}
            value={cigsPerDay}
            onChange={(e) => setCigsPerDay(+e.target.value)}
            className="w-full"
            aria-label="cigarettes per day"
          />
          <div className="text-sm mt-1">{cigsPerDay}</div>
        </Field>
        <Field label={T("Price per pack", "سعر العلبة", lang)}>
          <input
            type="number"
            value={packPrice}
            min={0}
            onChange={(e) => setPackPrice(+e.target.value || 0)}
            className="w-full rounded-md border px-3 py-2"
            style={{ borderColor: tokens.border }}
          />
        </Field>
        <Field label={T("Cigarettes per pack", "عدد السجائر بالعلبة", lang)}>
          <select
            value={packSize}
            onChange={(e) => setPackSize(+e.target.value)}
            className="w-full rounded-md border px-3 py-2"
            style={{ borderColor: tokens.border }}
          >
            <option value={20}>20</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
          </select>
        </Field>
        <Field label={T("Years smoking", "سنوات التدخين", lang)}>
          <input
            type="number"
            value={years}
            min={0}
            onChange={(e) => setYears(+e.target.value || 0)}
            className="w-full rounded-md border px-3 py-2"
            style={{ borderColor: tokens.border }}
          />
        </Field>
        <Field label={T("Currency", "العملة", lang)}>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as typeof currency)}
            className="w-full rounded-md border px-3 py-2"
            style={{ borderColor: tokens.border }}
          >
            <option>SAR</option>
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          value={`${fmt(perYear)} ${currency}`}
          label={T("Spent every year", "الإنفاق السنوي", lang)}
        />
        <Stat
          value={`${fmt(total)} ${currency}`}
          label={T("Since you started", "منذ أن بدأت", lang)}
          ember
        />
        <Stat
          value={fmt(cigs)}
          label={T("Cigarettes smoked", "السجائر المدخّنة", lang)}
        />
        <Stat
          value={`${fmt(days)} ${T("days", "يوم", lang)}`}
          label={T("Days of life spent smoking", "أيام قضيتها في التدخين", lang)}
          ember
        />
      </div>

      <div
        className="rounded-xl p-4 text-sm"
        style={{ background: tokens.softEmber, color: tokens.ink }}
      >
        <div className="font-medium mb-2">
          {T(
            "Your yearly smoking money could have been…",
            "ما تنفقه سنوياً كان يمكن أن يكون…",
            lang
          )}
        </div>
        <ul className="grid gap-1 sm:grid-cols-3">
          <li>
            ✈️ {fmt(flights)}{" "}
            {T("round-trip flights", "رحلة طيران ذهاب وعودة", lang)}
          </li>
          <li>
            📱 {fmt(phones)} {T("new smartphones", "هاتف جديد", lang)}
          </li>
          <li>
            🛒 {fmt(groceries)}{" "}
            {T("months of family groceries", "شهر من مؤن الأسرة", lang)}
          </li>
        </ul>
        <p className="text-xs opacity-70 mt-2">
          {T(
            "Approximate typical prices, for perspective only.",
            "أسعار تقريبية للمقارنة فقط.",
            lang
          )}
        </p>
        <ShareScore
          lang={lang}
          hash="kys-0"
          headline={T(
            `I've spent ~${fmt(total)} ${currency} on smoking — and ${fmt(days)} days of my life. See yours on Aqla.`,
            `أنفقت ~${fmt(total)} ${currency} على التدخين — وخسرت ${fmt(days)} يوماً من عمري. احسب أنت الآن على أقلع.`,
            lang
          )}
        />
      </div>

    </div>
  );
}

/* ================================ TOOL 2 — Grip =============================== */
type GQ = { q: [string, string]; opts: [string, string, number][] };
const grip = (): GQ[] => [
  {
    q: [
      "How soon after waking do you smoke your first cigarette?",
      "متى تدخّن أول سيجارة بعد الاستيقاظ؟",
    ],
    opts: [
      ["Within 5 min", "خلال 5 دقائق", 3],
      ["6–30 min", "6–30 دقيقة", 2],
      ["31–60 min", "31–60 دقيقة", 1],
      ["After 60 min", "بعد 60 دقيقة", 0],
    ],
  },
  {
    q: [
      "Difficult not to smoke where forbidden (mosque, hospital, plane)?",
      "هل يصعب عليك ألا تدخن في الأماكن الممنوعة (مسجد، مستشفى، طائرة)؟",
    ],
    opts: [
      ["Yes", "نعم", 1],
      ["No", "لا", 0],
    ],
  },
  {
    q: [
      "Which cigarette would you hate most to give up?",
      "أي سيجارة يصعب عليك التخلي عنها أكثر؟",
    ],
    opts: [
      ["First in morning", "أول سيجارة في الصباح", 1],
      ["Any other", "أي سيجارة أخرى", 0],
    ],
  },
  {
    q: ["Cigarettes per day?", "عدد السجائر يومياً؟"],
    opts: [
      ["≤10", "≤10", 0],
      ["11–20", "11–20", 1],
      ["21–30", "21–30", 2],
      ["≥31", "≥31", 3],
    ],
  },
  {
    q: [
      "Smoke more in first hours after waking than rest of day?",
      "هل تدخن في الساعات الأولى بعد الاستيقاظ أكثر من باقي اليوم؟",
    ],
    opts: [
      ["Yes", "نعم", 1],
      ["No", "لا", 0],
    ],
  },
  {
    q: [
      "Smoke even when ill in bed most of the day?",
      "هل تدخن حتى حين تكون مريضاً في الفراش معظم اليوم؟",
    ],
    opts: [
      ["Yes", "نعم", 1],
      ["No", "لا", 0],
    ],
  },
];

function GripTest({
  lang,
  onDone,
}: {
  lang: Lang;
  onDone: (v: boolean) => void;
}) {
  const qs = useMemo(grip, []);
  const [ans, setAns] = useState<(number | null)[]>(Array(6).fill(null));
  const complete = ans.every((a) => a !== null);
  const score = ans.reduce<number>((s, a) => s + (a ?? 0), 0);

  useEffect(() => {
    onDone(complete);
  }, [complete, onDone]);

  const level = (() => {
    if (score <= 2)
      return {
        name: T("Low dependence", "اعتماد منخفض", lang),
        color: tokens.primary,
        bg: tokens.softTeal,
        text: T(
          "Habit and routine are a bigger opponent than nicotine; behaviour change strategies can carry most of the weight.",
          "العادة والروتين خصم أكبر من النيكوتين؛ استراتيجيات تغيير السلوك تكفي غالباً.",
          lang
        ),
      };
    if (score <= 4)
      return {
        name: T("Moderate", "متوسط", lang),
        color: tokens.ember,
        bg: tokens.softEmber,
        text: T(
          "A real but manageable hold; a clear plan plus support puts success in reach.",
          "قبضة حقيقية لكن يمكن إدارتها؛ خطة واضحة مع الدعم تجعل النجاح ممكناً.",
          lang
        ),
      };
    if (score <= 7)
      return {
        name: T("High", "عالٍ", lang),
        color: tokens.warn,
        bg: tokens.softWarn,
        text: T(
          "Nicotine replacement or medication roughly doubles quit success at this level; talk to a clinician or cessation service.",
          "بدائل النيكوتين أو الأدوية تضاعف فرص النجاح تقريباً عند هذا المستوى؛ راجع مختصاً أو خدمة إقلاع.",
          lang
        ),
      };
    return {
      name: T("Very high", "عالٍ جداً", lang),
      color: tokens.warn,
      bg: tokens.softWarn,
      text: T(
        "Do not attempt on willpower alone; combined medication plus counselling exists for this level and works.",
        "لا تعتمد على الإرادة وحدها؛ العلاج الدوائي مع الإرشاد النفسي مصمّم لهذا المستوى وفعّال.",
        lang
      ),
    };
  })();

  const q1 = ans[0];
  const extra =
    q1 !== null
      ? q1 >= 2
        ? T(
            "Time to first cigarette is the strongest single sign of dependence — yours suggests a strong morning need for nicotine.",
            "الوقت إلى أول سيجارة هو أقوى مؤشر للاعتماد — ويشير جوابك إلى حاجة صباحية قوية للنيكوتين.",
            lang
          )
        : T(
            "Time to first cigarette is the strongest single sign of dependence — nicotine is not the first thing your body demands.",
            "الوقت إلى أول سيجارة هو أقوى مؤشر للاعتماد — والنيكوتين ليس أول ما يطلبه جسمك.",
            lang
          )
      : "";

  return (
    <div className="space-y-4">
      {qs.map((q, i) => (
        <fieldset key={i} className="space-y-2">
          <legend className="font-medium text-sm">
            {i + 1}. {lang === "ar" ? q.q[1] : q.q[0]}
          </legend>
          <div className="flex flex-wrap gap-2">
            {q.opts.map(([en, ar, sc], j) => {
              const selected = ans[i] === sc;
              return (
                <label
                  key={j}
                  className="cursor-pointer rounded-full border px-3 py-1 text-sm"
                  style={{
                    borderColor: selected ? tokens.primary : tokens.border,
                    background: selected ? tokens.primary : "#fff",
                    color: selected ? "#fff" : tokens.ink,
                  }}
                >
                  <input
                    type="radio"
                    name={`grip-${i}`}
                    className="sr-only"
                    checked={selected}
                    onChange={() =>
                      setAns((a) => {
                        const c = [...a];
                        c[i] = sc;
                        return c;
                      })
                    }
                  />
                  {lang === "ar" ? ar : en}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {complete && (
        <div className="mt-4 space-y-3">
          <div
            className="rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4"
            style={{ background: level.bg }}
          >
            <Gauge score={score} max={10} color={level.color} />
            <div>
              <div
                className="font-semibold text-lg"
                style={{ color: level.color }}
              >
                {level.name} — {score}/10
              </div>
              <p className="text-sm mt-1">{level.text}</p>
              <p className="text-xs mt-2 opacity-80">{extra}</p>
            </div>
          </div>
          <ShareScore
            lang={lang}
            hash="kys-1"
            headline={T(
              `My nicotine grip score is ${score}/10 — ${level.name}. Test yours on Aqla:`,
              `درجة قبضة النيكوتين عندي ${score}/10 — ${level.name}. اختبر نفسك على أقلع:`,
              lang
            )}
          />
        </div>
      )}

    </div>
  );
}

function Gauge({
  score,
  max,
  color,
}: {
  score: number;
  max: number;
  color: string;
}) {
  const pct = score / max;
  const r = 40;
  const c = 2 * Math.PI * r;
  return (
    <svg width={110} height={110} viewBox="0 0 110 110" aria-hidden>
      <circle
        cx={55}
        cy={55}
        r={r}
        stroke="#e5e5e5"
        strokeWidth={10}
        fill="none"
      />
      <circle
        cx={55}
        cy={55}
        r={r}
        stroke={color}
        strokeWidth={10}
        fill="none"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 55 55)"
        style={{ transition: "stroke-dashoffset .8s ease" }}
      />
      <text
        x="55"
        y="60"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fill={color}
      >
        {score}
      </text>
    </svg>
  );
}

/* =============================== TOOL 3 — Mirror ============================== */
function Mirror({
  lang,
  onDone,
}: {
  lang: Lang;
  onDone: (v: boolean) => void;
}) {
  const items: [string, string][] = [
    [
      "I get stressed, tense, or anxious easily",
      "أتوتر وأقلق بسهولة",
    ],
    [
      "I am organized and stick to routines and plans",
      "أنا منظم وألتزم بالروتين والخطط",
    ],
    [
      "I am outgoing — most of my smoking happens around people",
      "أنا اجتماعي ومعظم تدخيني مع الناس",
    ],
    [
      "I get bored quickly and love new experiences",
      "أملّ بسرعة وأحب التجارب الجديدة",
    ],
    [
      "I often light a cigarette without noticing — automatically",
      "كثيراً ما أشعل سيجارة دون أن أنتبه",
    ],
  ];
  const [vals, setVals] = useState<number[]>([4, 4, 4, 4, 4]);
  const triggerOpts: [string, string][] = [
    ["with coffee or tea", "مع القهوة أو الشاي"],
    ["after meals", "بعد الوجبات"],
    ["when stressed", "عند التوتر"],
    ["with smoking friends", "مع أصدقاء يدخنون"],
    ["when bored", "عند الملل"],
    ["first thing after waking", "أول شيء بعد الاستيقاظ"],
    ["while driving", "أثناء القيادة"],
    ["on the phone", "على الهاتف"],
    ["after exercise", "بعد التمرين"],
    ["before sleep", "قبل النوم"],
  ];
  const [triggers, setTriggers] = useState<number[]>([]);
  const [shown, setShown] = useState(false);

  const toggle = (i: number) =>
    setTriggers((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]));

  const reveal = () => {
    setShown(true);
    onDone(true);
  };

  const insights: string[] = [];
  if (vals[0] >= 5)
    insights.push(
      T(
        "Stress fuels the smoking; withdrawal itself creates part of the tension. Build stress tools before quit day (breathing, short walks, prayer breaks).",
        "التوتر يغذي التدخين؛ والانسحاب نفسه يخلق جزءاً من التوتر. جهّز أدوات التوتر قبل يوم الإقلاع (تنفس، مشي قصير، فواصل صلاة).",
        lang
      )
    );
  if (vals[1] <= 3)
    insights.push(
      T(
        "Borrow structure — fixed quit date, phone alarms, written two-week plan.",
        "استعِر البنية — تاريخ إقلاع محدد، تنبيهات هاتف، خطة مكتوبة لأسبوعين.",
        lang
      )
    );
  if (vals[1] >= 6)
    insights.push(
      T(
        "Planning is a genuine quitting advantage — write the plan.",
        "التخطيط ميزة حقيقية للإقلاع — اكتب خطتك.",
        lang
      )
    );
  if (vals[2] >= 5)
    insights.push(
      T(
        "Change the setting for two weeks, tell friends, hold something else, recruit a quit buddy.",
        "غيّر البيئة لأسبوعين، أخبر أصدقاءك، أمسك شيئاً غير السيجارة، جنّد رفيق إقلاع.",
        lang
      )
    );
  if (vals[3] >= 5)
    insights.push(
      T(
        "Replace nicotine's stimulation with a new challenge; boredom is the relapse door.",
        "استبدل تحفيز النيكوتين بتحدٍّ جديد؛ الملل هو باب الانتكاسة.",
        lang
      )
    );
  if (vals[4] >= 5)
    insights.push(
      T(
        "Break the pairings — change places, switch hands, keep cigarettes far so every smoke requires a decision.",
        "اكسر الاقترانات — غيّر الأماكن، بدّل اليد، أبعد السجائر ليصبح كل تدخين قراراً.",
        lang
      )
    );
  if (triggers.length > 0) {
    const list = triggers
      .map((i) => (lang === "ar" ? triggerOpts[i][1] : triggerOpts[i][0]))
      .join("، ");
    insights.push(
      T(
        `Your triggers: ${list} — each is a learned pairing; plan a specific replacement for every one.`,
        `محفزاتك: ${list} — كل واحد اقتران متعلَّم؛ خطط لبديل محدد لكل منها.`,
        lang
      )
    );
  }
  if (insights.length === 0)
    insights.push(
      T(
        "Your traits are balanced — focus on a clear practical plan for quit day.",
        "سماتك متوازنة — ركّز على خطة عملية واضحة ليوم الإقلاع.",
        lang
      )
    );

  return (
    <div className="space-y-4">
      <div className="font-medium">
        {T("How much is this like you? (1–7)", "كم يشبهك هذا؟ (1–7)", lang)}
      </div>
      {items.map((it, i) => (
        <div key={i}>
          <label className="text-sm">{lang === "ar" ? it[1] : it[0]}</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={7}
              value={vals[i]}
              onChange={(e) =>
                setVals((v) => {
                  const c = [...v];
                  c[i] = +e.target.value;
                  return c;
                })
              }
              className="w-full"
              aria-label={it[0]}
            />
            <span className="text-sm w-6 text-center">{vals[i]}</span>
          </div>
        </div>
      ))}

      <div>
        <div className="font-medium mt-2 mb-1">
          {T("When do you usually smoke?", "متى تدخن عادة؟", lang)}
        </div>
        <div className="flex flex-wrap gap-2">
          {triggerOpts.map(([en, ar], i) => {
            const selected = triggers.includes(i);
            return (
              <button
                key={i}
                onClick={() => toggle(i)}
                className="rounded-full border px-3 py-1 text-sm"
                style={{
                  borderColor: selected ? tokens.primary : tokens.border,
                  background: selected ? tokens.softTeal : "#fff",
                  color: tokens.ink,
                }}
              >
                {lang === "ar" ? ar : en}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={reveal}
        className="rounded-full px-4 py-2 text-sm font-medium"
        style={{ background: tokens.primary, color: "#fff" }}
      >
        {T("Show me the mirror", "أرني المرآة", lang)}
      </button>

      {shown && (
        <div className="space-y-2 mt-3">
          {insights.map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-sm"
              style={{ background: tokens.softTeal }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== TOOL 4 — Compass ============================== */
function Compass({
  lang,
  onDone,
}: {
  lang: Lang;
  onDone: (v: boolean) => void;
}) {
  const [imp, setImp] = useState(5);
  const [conf, setConf] = useState(5);
  const [attempts, setAttempts] = useState<
    "never" | "once" | "2-4" | "5+" | null
  >(null);
  const [shown, setShown] = useState(false);

  const reveal = () => {
    if (attempts) {
      setShown(true);
      onDone(true);
    }
  };

  const main = (() => {
    if (imp >= 7 && conf >= 7)
      return T(
        "Genuinely ready — set a quit date within 14 days, tell someone, prepare replacements this week.",
        "جاهز فعلاً — حدّد تاريخ إقلاع خلال 14 يوماً، أخبر شخصاً، وجهّز البدائل هذا الأسبوع.",
        lang
      );
    if (imp >= 7 && conf < 7)
      return T(
        "Confidence is what support fixes — NRT, medication, or a programme can double the odds; willpower alone is not required.",
        "الدعم يعالج الثقة — بدائل النيكوتين، الأدوية، أو برنامج، تضاعف الفرص؛ الإرادة وحدها ليست ضرورية.",
        lang
      );
    if (imp < 7 && conf >= 7)
      return T(
        "Try the Money Counter above — those are your numbers, not statistics; revisit in a month.",
        "جرّب عدّاد المال أعلاه — تلك أرقامك أنت، لا إحصاءات عامة؛ عاود بعد شهر.",
        lang
      );
    return T(
      "Honest starting point, no pressure; keep the numbers in mind and the door open.",
      "نقطة بداية صادقة دون ضغط؛ احتفظ بالأرقام في ذهنك وأبقِ الباب مفتوحاً.",
      lang
    );
  })();

  const attemptMsg =
    attempts === "never"
      ? T(
          "Plan properly from day one.",
          "خطط بشكل جيد من اليوم الأول.",
          lang
        )
      : attempts === "once"
      ? T(
          "Training, not failure — most quitters needed several tries.",
          "تدريب لا فشل — معظم من أقلعوا احتاجوا محاولات عديدة.",
          lang
        )
      : attempts === "2-4"
      ? T(
          "You know your weak moments — that is a map.",
          "تعرف لحظات ضعفك — هذه خريطة.",
          lang
        )
      : attempts === "5+"
      ? T(
          "Persistence, not weakness — with the right support, the next can be the last.",
          "مثابرة لا ضعف — مع الدعم المناسب، القادمة قد تكون الأخيرة.",
          lang
        )
      : "";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm">
          {T(
            "How important is quitting to you right now? (0–10)",
            "كم يهمك الإقلاع الآن؟ (0–10)",
            lang
          )}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={10}
            value={imp}
            onChange={(e) => setImp(+e.target.value)}
            className="w-full"
          />
          <span className="text-sm w-6 text-center">{imp}</span>
        </div>
      </div>
      <div>
        <label className="text-sm">
          {T(
            "If you decided today, how confident are you that you could quit? (0–10)",
            "لو قررت اليوم، كم أنت واثق أنك قادر على الإقلاع؟ (0–10)",
            lang
          )}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={10}
            value={conf}
            onChange={(e) => setConf(+e.target.value)}
            className="w-full"
          />
          <span className="text-sm w-6 text-center">{conf}</span>
        </div>
      </div>
      <fieldset>
        <legend className="text-sm mb-1">
          {T(
            "Have you tried to quit before?",
            "هل حاولت الإقلاع من قبل؟",
            lang
          )}
        </legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["never", T("never", "لم أحاول", lang)],
              ["once", T("once", "مرة", lang)],
              ["2-4", T("2–4 times", "2–4 مرات", lang)],
              ["5+", T("5+ times", "5+ مرات", lang)],
            ] as const
          ).map(([v, label]) => {
            const sel = attempts === v;
            return (
              <label
                key={v}
                className="cursor-pointer rounded-full border px-3 py-1 text-sm"
                style={{
                  borderColor: sel ? tokens.primary : tokens.border,
                  background: sel ? tokens.primary : "#fff",
                  color: sel ? "#fff" : tokens.ink,
                }}
              >
                <input
                  type="radio"
                  name="attempts"
                  className="sr-only"
                  checked={sel}
                  onChange={() => setAttempts(v)}
                />
                {label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <button
        onClick={reveal}
        disabled={!attempts}
        className="rounded-full px-4 py-2 text-sm font-medium disabled:opacity-50"
        style={{ background: tokens.primary, color: "#fff" }}
      >
        {T("Read my compass", "اقرأ بوصلتي", lang)}
      </button>

      {shown && (
        <div className="space-y-2 mt-2">
          <div
            className="rounded-xl p-3 text-sm"
            style={{ background: tokens.softTeal }}
          >
            {main}
          </div>
          <div
            className="rounded-xl p-3 text-sm"
            style={{ background: tokens.softEmber }}
          >
            {attemptMsg}
          </div>
        </div>
      )}
    </div>
  );
}

/* =============================== TOOL 5 — Shooter ============================= */
function Shooter({
  lang,
  onDone,
}: {
  lang: Lang;
  onDone: (v: boolean) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const crackCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hits, setHits] = useState(0);
  const [shots, setShots] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState({ score: 0, acc: 0 });
  const [ended, setEnded] = useState(false);

  const audioRef = useRef<AudioContext | null>(null);
  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const ensureAudio = () => {
    if (typeof window === "undefined") return null;
    if (!audioRef.current) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      audioRef.current = new Ctx();
    }
    if (audioRef.current.state === "suspended") {
      audioRef.current.resume();
    }
    return audioRef.current;
  };

  const noiseBuffer = (ctx: AudioContext, dur = 0.2) => {
    const b = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  };

  const playShot = () => {
    if (mutedRef.current) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const master = ctx.createDynamicsCompressor();
    master.threshold.value = -14;
    master.knee.value = 24;
    master.ratio.value = 10;
    master.attack.value = 0.002;
    master.release.value = 0.15;
    master.connect(ctx.destination);

    // Rocket whoosh — long filtered noise sweeping from low→high
    const dur = 0.75;
    const n = ctx.createBufferSource();
    n.buffer = noiseBuffer(ctx, dur);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(300, now);
    bp.frequency.exponentialRampToValueAtTime(4200, now + dur);
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.001, now);
    ng.gain.exponentialRampToValueAtTime(0.85, now + 0.08);
    ng.gain.exponentialRampToValueAtTime(0.001, now + dur);
    n.connect(bp).connect(ng).connect(master);
    n.start(now);
    n.stop(now + dur);

    // Roar body — sawtooth sweeping up (rocket engine)
    const saw = ctx.createOscillator();
    saw.type = "sawtooth";
    saw.frequency.setValueAtTime(90, now);
    saw.frequency.exponentialRampToValueAtTime(520, now + dur);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.001, now);
    sg.gain.exponentialRampToValueAtTime(0.35, now + 0.1);
    sg.gain.exponentialRampToValueAtTime(0.001, now + dur);
    const sf = ctx.createBiquadFilter();
    sf.type = "lowpass";
    sf.frequency.value = 1600;
    saw.connect(sf).connect(sg).connect(master);
    saw.start(now);
    saw.stop(now + dur);

    // Ignition click
    const click = ctx.createOscillator();
    click.type = "square";
    click.frequency.value = 180;
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.4, now);
    cg.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    click.connect(cg).connect(master);
    click.start(now);
    click.stop(now + 0.05);
  };

  // Big explosion + crowd cheer on hit
  const playHit = (comboStep: number) => {
    if (mutedRef.current) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    const master = ctx.createDynamicsCompressor();
    master.threshold.value = -16;
    master.knee.value = 24;
    master.ratio.value = 12;
    master.attack.value = 0.001;
    master.release.value = 0.2;
    master.connect(ctx.destination);

    // ---- EXPLOSION ----
    // Deep boom sub
    const boom = ctx.createOscillator();
    boom.type = "sine";
    boom.frequency.setValueAtTime(180, now);
    boom.frequency.exponentialRampToValueAtTime(30, now + 0.35);
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(1.1, now);
    bg.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    boom.connect(bg).connect(master);
    boom.start(now);
    boom.stop(now + 0.5);

    // Debris crackle — lowpass noise long tail
    const rumble = ctx.createBufferSource();
    rumble.buffer = noiseBuffer(ctx, 0.7);
    const rlp = ctx.createBiquadFilter();
    rlp.type = "lowpass";
    rlp.frequency.setValueAtTime(2200, now);
    rlp.frequency.exponentialRampToValueAtTime(400, now + 0.6);
    const rg = ctx.createGain();
    rg.gain.setValueAtTime(0.9, now);
    rg.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    rumble.connect(rlp).connect(rg).connect(master);
    rumble.start(now);

    // Sharp crack on top
    const crack = ctx.createBufferSource();
    crack.buffer = noiseBuffer(ctx, 0.08);
    const chp = ctx.createBiquadFilter();
    chp.type = "highpass";
    chp.frequency.value = 3500;
    const cg2 = ctx.createGain();
    cg2.gain.setValueAtTime(0.6, now);
    cg2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    crack.connect(chp).connect(cg2).connect(master);
    crack.start(now);

    // ---- CROWD CHEER (synthesized applause + voice-band roar) ----
    const cheerDur = 1.6;
    const cheer = ctx.createBufferSource();
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, Math.floor(sr * cheerDur), sr);
    const data = buf.getChannelData(0);
    // Applause: dense random claps modulated over voice band noise
    for (let i = 0; i < data.length; i++) {
      const t = i / sr;
      // base roar
      let s = (Math.random() * 2 - 1) * 0.35;
      // clap transients
      if (Math.random() < 0.012) s += (Math.random() * 2 - 1) * 1.1;
      // slow amplitude swell
      const env = Math.sin((t / cheerDur) * Math.PI);
      data[i] = s * env;
    }
    cheer.buffer = buf;
    const cbp = ctx.createBiquadFilter();
    cbp.type = "bandpass";
    cbp.frequency.value = 1600;
    cbp.Q.value = 0.7;
    const chg = ctx.createGain();
    chg.gain.setValueAtTime(0.001, now + 0.05);
    chg.gain.exponentialRampToValueAtTime(0.55, now + 0.25);
    chg.gain.exponentialRampToValueAtTime(0.001, now + 0.05 + cheerDur);
    cheer.connect(cbp).connect(chg).connect(master);
    cheer.start(now + 0.05);

    // Whistle / triumphant ping rising with combo
    const semis = Math.min(comboStep, 8);
    const base = 880 * Math.pow(2, semis / 12);
    const o = ctx.createOscillator();
    o.type = "triangle";
    o.frequency.setValueAtTime(base, now + 0.12);
    o.frequency.exponentialRampToValueAtTime(base * 1.6, now + 0.35);
    const og = ctx.createGain();
    og.gain.setValueAtTime(0.001, now + 0.12);
    og.gain.exponentialRampToValueAtTime(0.35, now + 0.18);
    og.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    o.connect(og).connect(master);
    o.start(now + 0.12);
    o.stop(now + 0.52);
  };


  const playMiss = () => {
    if (mutedRef.current) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    for (let i = 0; i < 3; i++) {
      const n = ctx.createBufferSource();
      n.buffer = noiseBuffer(ctx, 0.08);
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 2000 + Math.random() * 1500;
      const g = ctx.createGain();
      const t = ctx.currentTime + i * 0.04;
      g.gain.setValueAtTime(0.2, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      n.connect(hp).connect(g).connect(ctx.destination);
      n.start(t);
    }
  };

  const playTick = () => {
    if (mutedRef.current) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.value = 1000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.07);
  };

  const playEnd = (isNewBest: boolean) => {
    if (mutedRef.current) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const notes = isNewBest ? [523, 659, 784] : [523, 392];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = f;
      const g = ctx.createGain();
      const t = ctx.currentTime + i * 0.15;
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.26);
    });
  };

  /* ============ Viewport-wide glass shatter (4D burst) ============ */
  const shardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const shardsRef = useRef<
    {
      x: number;
      y: number;
      vx: number;
      vy: number;
      vrot: number;
      rot: number;
      life: number;
      max: number;
      size: number;
      pts: { x: number; y: number }[];
      hue: number;
    }[]
  >([]);
  const flashRef = useRef<{ x: number; y: number; life: number; max: number }[]>([]);
  const arenaShakeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sizeShardCanvas = () => {
      const c = shardCanvasRef.current;
      if (!c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = window.innerWidth * dpr;
      c.height = window.innerHeight * dpr;
      c.style.width = window.innerWidth + "px";
      c.style.height = window.innerHeight + "px";
      const ctx = c.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    sizeShardCanvas();
    window.addEventListener("resize", sizeShardCanvas);

    let raf = 0;
    const loop = () => {
      const c = shardCanvasRef.current;
      if (!c) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const ctx = c.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(loop);
        return;
      }
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // radial flashes
      flashRef.current = flashRef.current.filter((f) => f.life < f.max);
      flashRef.current.forEach((f) => {
        f.life += 16;
        const a = 1 - f.life / f.max;
        const r = 40 + (f.life / f.max) * 180;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
        g.addColorStop(0, `rgba(255,255,255,${0.55 * a})`);
        g.addColorStop(0.4, `rgba(200,240,255,${0.25 * a})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // shards
      shardsRef.current = shardsRef.current.filter((s) => s.life < s.max);
      shardsRef.current.forEach((s) => {
        s.life += 16;
        s.vy += 0.55; // gravity
        s.vx *= 0.995;
        s.vy *= 0.995;
        s.x += s.vx;
        s.y += s.vy;
        s.rot += s.vrot;
        const a = Math.max(0, 1 - s.life / s.max);
        ctx.save();
        ctx.globalAlpha = a;
        ctx.translate(s.x, s.y);
        ctx.rotate(s.rot);
        // glass gradient
        const grad = ctx.createLinearGradient(-s.size, -s.size, s.size, s.size);
        grad.addColorStop(0, `hsla(${s.hue},60%,96%,0.95)`);
        grad.addColorStop(0.5, `hsla(${s.hue},50%,82%,0.75)`);
        grad.addColorStop(1, `hsla(${s.hue},40%,68%,0.55)`);
        ctx.fillStyle = grad;
        ctx.strokeStyle = `hsla(${s.hue},70%,98%,${0.9 * a})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        s.pts.forEach((p, i) => {
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // specular highlight
        ctx.strokeStyle = `rgba(255,255,255,${0.7 * a})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(s.pts[0].x, s.pts[0].y);
        ctx.lineTo(s.pts[1].x, s.pts[1].y);
        ctx.stroke();
        ctx.restore();
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sizeShardCanvas);
    };
  }, []);

  function spawnGlassShatter(clientX: number, clientY: number) {
    const st = stateRef.current;
    if (st.prefersReducedMotion) {
      flashRef.current.push({ x: clientX, y: clientY, life: 0, max: 220 });
      return;
    }
    const isSmall = typeof window !== "undefined" && window.innerWidth < 640;
    const count = isSmall ? 32 : 60;
    const cap = 500;
    // white flash
    flashRef.current.push({ x: clientX, y: clientY, life: 0, max: 160 });
    for (let i = 0; i < count; i++) {
      if (shardsRef.current.length >= cap) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 6 + Math.random() * 16;
      const size = 6 + Math.random() * 22;
      // polygon points (triangle or quad)
      const sides = Math.random() < 0.55 ? 3 : 4;
      const pts: { x: number; y: number }[] = [];
      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * Math.PI * 2 + Math.random() * 0.9;
        const r = size * (0.4 + Math.random() * 0.7);
        pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
      }
      shardsRef.current.push({
        x: clientX,
        y: clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (4 + Math.random() * 6), // upward bias
        vrot: (Math.random() - 0.5) * 0.6,
        rot: Math.random() * Math.PI * 2,
        life: 0,
        max: 1400 + Math.random() * 700,
        size,
        pts,
        hue: 180 + Math.random() * 30, // pale cyan-white
      });
    }
    // arena shake
    const el = arenaShakeRef.current;
    if (el && !isSmall) {
      el.style.transition = "transform 40ms";
      let step = 0;
      const shake = () => {
        step++;
        if (step > 6) {
          el.style.transform = "";
          return;
        }
        const dx = (Math.random() - 0.5) * 10;
        const dy = (Math.random() - 0.5) * 10;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        setTimeout(shake, 45);
      };
      shake();
    }
  }

  const stateRef = useRef({
    W: 480,
    H: 360,
    angle: 0,
    cigs: [] as { alive: boolean; respawnAt: number }[],
    particles: [] as {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      max: number;
      color: string;
      size: number;
      rot: number;
      vrot: number;
      kind: "spark" | "ash" | "shard" | "half";
    }[],
    running: false,
    startedAt: 0,
    lastCountdown: -1,
    prefersReducedMotion: false,
  });

  useEffect(() => {
    stateRef.current.prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    stateRef.current.cigs = Array.from({ length: 6 }, () => ({
      alive: true,
      respawnAt: 0,
    }));
  }, []);

  useEffect(() => {
    let raf = 0;
    const loop = (t: number) => {
      const st = stateRef.current;
      const cvs = canvasRef.current;
      const crackC = crackCanvasRef.current;
      if (!cvs || !crackC) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const ctx = cvs.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const W = cvs.width;
      const H = cvs.height;
      ctx.clearRect(0, 0, W, H);
      // background stays transparent — the dark arena shows through

      // composited cracks
      ctx.drawImage(crackC, 0, 0);

      // update angle
      if (st.running && !st.prefersReducedMotion) st.angle += 0.008;

      // Hexagon
      const cx = W / 2;
      const cy = H / 2;
      const R = Math.min(W, H) * 0.32;
      ctx.strokeStyle = tokens.primary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = st.angle + (i / 6) * Math.PI * 2;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Cigarettes at vertices
      const now = performance.now();
      st.cigs.forEach((c, i) => {
        if (!c.alive && now >= c.respawnAt) c.alive = true;
        if (!c.alive) return;
        const a = st.angle + (i / 6) * Math.PI * 2;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        drawCig(ctx, x, y, a + Math.PI / 2);
      });

      // Particles
      st.particles = st.particles.filter((p) => p.life < p.max);
      st.particles.forEach((p) => {
        p.life += 16;
        p.vy += 0.25;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        const alpha = 1 - p.life / p.max;
        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.kind === "half") {
          ctx.fillRect(-p.size, -2, p.size * 2, 4);
        } else if (p.kind === "shard") {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(p.size, 0);
          ctx.lineTo(p.size * 0.4, p.size);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // Countdown ticks
      if (st.running) {
        const elapsed = (now - st.startedAt) / 1000;
        const left = Math.max(0, 30 - elapsed);
        const wholeLeft = Math.ceil(left);
        if (wholeLeft !== st.lastCountdown) {
          st.lastCountdown = wholeLeft;
          if (wholeLeft <= 5 && wholeLeft > 0) playTick();
        }
        setTimeLeft(wholeLeft);
        if (left <= 0) endRound();
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function drawCig(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rot: number
  ) {
    const t = performance.now() / 1000;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // subtle drop shadow
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(-2, 7, 22, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // paper body — gradient white → cream
    const paper = ctx.createLinearGradient(0, -5, 0, 5);
    paper.addColorStop(0, "#fdfdfa");
    paper.addColorStop(0.5, "#ffffff");
    paper.addColorStop(1, "#e8e6dd");
    ctx.fillStyle = paper;
    ctx.fillRect(-20, -5, 28, 10);
    // paper texture lines
    ctx.strokeStyle = "rgba(180,175,160,0.35)";
    ctx.lineWidth = 0.5;
    for (let i = -18; i < 6; i += 3) {
      ctx.beginPath();
      ctx.moveTo(i, -4.5);
      ctx.lineTo(i + 1.5, 4.5);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(150,145,130,0.5)";
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-20, -5, 28, 10);

    // filter — tan gradient with cork speckle
    const filt = ctx.createLinearGradient(8, -5, 8, 5);
    filt.addColorStop(0, "#d9a869");
    filt.addColorStop(1, "#a8783f");
    ctx.fillStyle = filt;
    ctx.fillRect(8, -5, 12, 10);
    ctx.fillStyle = "rgba(80,50,20,0.35)";
    for (let i = 0; i < 14; i++) {
      const dx = 8 + Math.random() * 12;
      const dy = -5 + Math.random() * 10;
      ctx.fillRect(dx, dy, 0.7, 0.7);
    }
    // brand ring
    ctx.strokeStyle = "#8a5a2a";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(8, -5);
    ctx.lineTo(8, 5);
    ctx.stroke();

    // burnt paper zone right at ember (charred edge)
    const burn = ctx.createLinearGradient(-20, 0, -14, 0);
    burn.addColorStop(0, "#2a1a10");
    burn.addColorStop(0.6, "#6b3a1a");
    burn.addColorStop(1, "rgba(107,58,26,0)");
    ctx.fillStyle = burn;
    ctx.fillRect(-20, -5, 7, 10);

    // pulsing ember glow (halo)
    const pulse = 0.7 + 0.3 * Math.sin(t * 5 + x * 0.13);
    const glow = ctx.createRadialGradient(-20, 0, 0, -20, 0, 12);
    glow.addColorStop(0, `rgba(255,220,120,${0.9 * pulse})`);
    glow.addColorStop(0.4, `rgba(255,120,30,${0.55 * pulse})`);
    glow.addColorStop(1, "rgba(255,60,0,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(-20, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // hot ember core
    const emberG = ctx.createRadialGradient(-20, 0, 0, -20, 0, 4);
    emberG.addColorStop(0, "#fff7c0");
    emberG.addColorStop(0.35, "#ffb347");
    emberG.addColorStop(1, "#c9310a");
    ctx.fillStyle = emberG;
    ctx.beginPath();
    ctx.arc(-20, 0, 3.4 + pulse * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // tiny hot flecks
    if (Math.random() < 0.35) {
      ctx.fillStyle = "#ffe08a";
      ctx.fillRect(-20 + (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3, 0.8, 0.8);
    }

    // wispy smoke
    const smokeAlpha = 0.14;
    for (let i = 0; i < 3; i++) {
      const phase = t * 0.9 + i * 0.7 + x * 0.02;
      const sx = -20 + Math.sin(phase) * 2;
      const sy = -8 - i * 6 - (phase % 1) * 4;
      const sr = 3 + i * 2;
      ctx.fillStyle = `rgba(200,200,200,${smokeAlpha - i * 0.03})`;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function spawnParticles(
    x: number,
    y: number,
    kind: "hit" | "miss",
    hexEdge = false
  ) {
    const st = stateRef.current;
    if (st.prefersReducedMotion) return;
    const cap = 150;
    const add = (p: (typeof st.particles)[number]) => {
      if (st.particles.length < cap) st.particles.push(p);
    };
    if (kind === "hit") {
      // two halves
      for (let i = 0; i < 2; i++) {
        add({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: -3 - Math.random() * 2,
          life: 0,
          max: 900,
          color: "#fff",
          size: 10,
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.4,
          kind: "half",
        });
      }
      // sparks
      for (let i = 0; i < 10; i++) {
        add({
          x,
          y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5,
          life: 0,
          max: 500,
          color: tokens.ember,
          size: 2,
          rot: 0,
          vrot: 0,
          kind: "spark",
        });
      }
      // ash
      for (let i = 0; i < 8; i++) {
        add({
          x,
          y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 0,
          max: 700,
          color: "#888",
          size: 3,
          rot: 0,
          vrot: 0,
          kind: "ash",
        });
      }
    } else {
      // shards
      for (let i = 0; i < 3; i++) {
        add({
          x,
          y,
          vx: (Math.random() - 0.5) * 5,
          vy: -2 - Math.random() * 3,
          life: 0,
          max: 700,
          color: "rgba(16,53,47,0.6)",
          size: 5,
          rot: Math.random(),
          vrot: (Math.random() - 0.5) * 0.5,
          kind: "shard",
        });
      }
      if (hexEdge) {
        for (let i = 0; i < 5; i++) {
          add({
            x,
            y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 0,
            max: 400,
            color: tokens.ember,
            size: 2,
            rot: 0,
            vrot: 0,
            kind: "spark",
          });
        }
      }
    }
  }

  function drawCrackAt(x: number, y: number, isEdge: boolean) {
    const crackC = crackCanvasRef.current;
    if (!crackC) return;
    const ctx = crackC.getContext("2d");
    if (!ctx) return;
    ctx.save();
    ctx.strokeStyle = "rgba(16,53,47,0.55)";
    ctx.lineWidth = isEdge ? 2 : 1;
    ctx.translate(x, y);
    const n = 5 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const len = isEdge ? 8 + Math.random() * 8 : 12 + Math.random() * 20;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      let px = 0;
      let py = 0;
      const steps = 3;
      for (let s = 1; s <= steps; s++) {
        const jitter = (Math.random() - 0.5) * 6;
        const na = a + jitter * 0.05;
        px = (Math.cos(na) * len * s) / steps;
        py = (Math.sin(na) * len * s) / steps;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    ensureAudio();
    if (!running) return;
    const cvs = canvasRef.current;
    if (!cvs) return;
    const rect = cvs.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * cvs.width;
    const y = ((e.clientY - rect.top) / rect.height) * cvs.height;
    playShot();
    setShots((s) => s + 1);

    const st = stateRef.current;
    const cx = cvs.width / 2;
    const cy = cvs.height / 2;
    const R = Math.min(cvs.width, cvs.height) * 0.32;

    let hitIndex = -1;
    st.cigs.forEach((c, i) => {
      if (!c.alive) return;
      const a = st.angle + (i / 6) * Math.PI * 2;
      const px = cx + Math.cos(a) * R;
      const py = cy + Math.sin(a) * R;
      const d = Math.hypot(px - x, py - y);
      if (d < 22 && hitIndex === -1) hitIndex = i;
    });

    if (hitIndex >= 0) {
      st.cigs[hitIndex].alive = false;
      st.cigs[hitIndex].respawnAt = performance.now() + 1500;
      setHits((h) => h + 1);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
      setCombo((c) => {
        const nc = c + 1;
        playHit(nc);
        return nc;
      });
      setScore((sc) => sc + 10);
      spawnParticles(x, y, "hit");
      // 4D shattered glass in viewport coordinates
      spawnGlassShatter(e.clientX, e.clientY);
    } else {
      // Check hex edge proximity
      const distToCenter = Math.hypot(x - cx, y - cy);
      const nearEdge = Math.abs(distToCenter - R) < 10;
      playMiss();
      setStreak(0);
      setCombo(0);
      drawCrackAt(x, y, nearEdge);
      spawnParticles(x, y, "miss", nearEdge);
    }
  }

  const startRound = () => {
    ensureAudio();
    const crackC = crackCanvasRef.current;
    if (crackC) {
      const ctx = crackC.getContext("2d");
      ctx?.clearRect(0, 0, crackC.width, crackC.height);
    }
    setHits(0);
    setShots(0);
    setStreak(0);
    setBestStreak(0);
    setCombo(0);
    setScore(0);
    setEnded(false);
    setTimeLeft(30);
    stateRef.current.cigs = Array.from({ length: 6 }, () => ({
      alive: true,
      respawnAt: 0,
    }));
    stateRef.current.startedAt = performance.now();
    stateRef.current.running = true;
    stateRef.current.lastCountdown = -1;
    setRunning(true);
  };

  const endRound = () => {
    if (!stateRef.current.running) return;
    stateRef.current.running = false;
    setRunning(false);
    setEnded(true);
    onDone(true);
    setBest((b) => {
      const acc = shots > 0 ? Math.round((hits / shots) * 100) : 0;
      const isNewBest = score > b.score;
      playEnd(isNewBest);
      return {
        score: Math.max(b.score, score),
        acc: Math.max(b.acc, acc),
      };
    });
  };

  const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-4 text-sm">
          <span>🎯 {T("Hits", "إصابات", lang)}: <b>{hits}</b></span>
          <span>🔫 {T("Shots", "طلقات", lang)}: <b>{shots}</b></span>
          <span>📊 {T("Accuracy", "الدقة", lang)}: <b>{accuracy}%</b></span>
          <span>🔥 {T("Best streak", "أفضل سلسلة", lang)}: <b>{bestStreak}</b></span>
          <span>⏱ {timeLeft}s</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted((m) => !m)}
            className="rounded-full border px-2 py-1 text-sm"
            style={{ borderColor: tokens.border, background: "#fff" }}
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          {!running && (
            <button
              onClick={startRound}
              className="rounded-full px-4 py-1 text-sm font-medium"
              style={{ background: tokens.primary, color: "#fff" }}
            >
              {ended
                ? T("Play again", "العب مجدداً", lang)
                : T("Start", "ابدأ", lang)}
            </button>
          )}
        </div>
      </div>
      <div
        ref={arenaShakeRef}
        className="relative w-full mx-auto"
        style={{
          aspectRatio: "4 / 3",
          maxWidth: 640,
          perspective: "1200px",
          willChange: "transform",
        }}
      >
        {/* Professional layered background */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, #0f4a30 0%, #072518 55%, #030f0a 100%)",
            boxShadow:
              "0 30px 80px -30px rgba(0,0,0,0.7), inset 0 0 60px rgba(0,0,0,0.4)",
          }}
        >
          {/* subtle grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(217,184,119,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(217,184,119,0.35) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />
          {/* vignette */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)",
            }}
          />
        </div>

        {/* Outer hexagon — breathes inward */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hex-pulse-out"
        >
          <div
            className="absolute inset-[-4%]"
            style={{
              clipPath:
                "polygon(25% 4%, 75% 4%, 98% 50%, 75% 96%, 25% 96%, 2% 50%)",
              boxShadow:
                "inset 0 0 0 2px rgba(217,184,119,0.85), inset 0 0 40px rgba(217,184,119,0.18)",
            }}
          />
        </div>

        {/* Inner hexagon (rotated 30°) — breathes outward, meeting the outer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hex-pulse-in"
        >
          <div
            className="absolute inset-[10%]"
            style={{
              clipPath:
                "polygon(25% 4%, 75% 4%, 98% 50%, 75% 96%, 25% 96%, 2% 50%)",
              boxShadow:
                "inset 0 0 0 1.5px rgba(255,255,255,0.55), inset 0 0 24px rgba(255,255,255,0.08)",
            }}
          />
        </div>

        <canvas
          ref={canvasRef}
          width={480}
          height={360}
          onMouseDown={handleCanvasClick}
          className="relative w-full h-full cursor-crosshair"
          style={{
            clipPath:
              "polygon(25% 4%, 75% 4%, 98% 50%, 75% 96%, 25% 96%, 2% 50%)",
            background: "transparent",
          }}
          aria-label="Shooting game canvas"
        />


        <canvas
          ref={crackCanvasRef}
          width={480}
          height={360}
          className="hidden"
        />
        {ended && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ background: "rgba(16,53,47,0.85)", color: "#fff" }}
          >
            <div className="text-center p-4 max-w-sm">
              <div className="text-lg font-semibold mb-2">
                {T("Round complete", "انتهت الجولة", lang)}
              </div>
              <div className="text-sm space-y-1">
                <div>🎯 {hits} / 🔫 {shots} — {accuracy}%</div>
                <div>🔥 {T("Best streak", "أفضل سلسلة", lang)}: {bestStreak}</div>
                <div>🏆 {T("Score", "النقاط", lang)}: {score}</div>
                <div className="opacity-80 text-xs mt-2">
                  {T("Session best", "أفضل جلسة", lang)}: {best.score} / {best.acc}%
                </div>
                {accuracy >= 70 && (
                  <div className="mt-2" style={{ color: tokens.ember }}>
                    {T(
                      "Precision like this deserves a quit date.",
                      "دقة كهذه تستحق تاريخ إقلاع.",
                      lang
                    )}
                  </div>
                )}
                {shots - hits > hits && (
                  <div className="mt-2 text-xs opacity-90">
                    {T(
                      "You broke more glass than cigarettes — cravings win when we rush. Slow down, aim, breathe.",
                      "كسرت زجاجاً أكثر من السجائر — الرغبة تفوز حين نستعجل. تمهّل، صوّب، تنفّس.",
                      lang
                    )}
                  </div>
                )}
                <ShareScore
                  lang={lang}
                  hash="kys-4"
                  tone="dark"
                  headline={T(
                    `I scored ${score} in Aqla's Break-the-Smoking-Habit Challenge — ${hits}/${shots} (${accuracy}%). Beat me:`,
                    `سجّلت ${score} نقطة في تحدي كسر عادة التدخين — ${hits}/${shots} (${accuracy}%). تحدّاني:`,
                    lang
                  )}
                  scoreCard={{
                    title: T(
                      "Break the Smoking Habit — Aqla",
                      "تحدي كسر عادة التدخين — أقلع",
                      lang
                    ),
                    stats: [
                      { label: T("Score", "النقاط", lang), value: String(score) },
                      { label: T("Hits", "إصابات", lang), value: `${hits}/${shots}` },
                      { label: T("Accuracy", "الدقة", lang), value: `${accuracy}%` },
                      { label: T("Best streak", "أفضل سلسلة", lang), value: String(bestStreak) },
                    ],
                    cta: T("Try free at", "جرّبها مجاناً على", lang),
                  }}
                />
              </div>

            </div>
          </div>
        )}
      </div>
      {/* Full-viewport shard canvas — glass flies outside the hex */}
      <canvas
        ref={shardCanvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 70 }}
        aria-hidden
      />
      <p className="text-xs opacity-70">
        {T(
          "Aim at the lit cigarettes. Every hit shatters glass across the screen.",
          "صوّب على السجائر المولّعة. كل إصابة تنثر الزجاج في كل الشاشة.",
          lang
        )}
      </p>
    </div>
  );
}

/* --------------------------- shared small components --------------------------- */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <div className="mb-1 font-medium">{label}</div>
      {children}
    </label>
  );
}
function Stat({
  value,
  label,
  ember,
}: {
  value: string;
  label: string;
  ember?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-3 text-white"
      style={{
        background: ember
          ? "linear-gradient(135deg,#E08A2E,#C4452F)"
          : "linear-gradient(135deg,#10352F,#1B6E5F)",
      }}
    >
      <div className="text-xl font-bold leading-tight">{value}</div>
      <div className="text-xs opacity-90 mt-1">{label}</div>
    </div>
  );
}

/* --------------------------- Share your result --------------------------- */
const SHARE_URL = "https://aqla1.com";
function ShareScore({
  lang,
  headline,
  hash,
  tone = "teal",
  scoreCard,
}: {
  lang: Lang;
  headline: string;
  hash: string; // e.g. "kys-0"
  tone?: "teal" | "ember" | "dark";
  scoreCard?: {
    title: string;
    stats: { label: string; value: string }[];
    cta: string;
  };
}) {
  const url = `${SHARE_URL}/#${hash}`;
  const tagline = T(
    "Try Aqla — free, no signup:",
    "جرّب أقلع — مجاناً وبدون تسجيل:",
    lang
  );
  const fullText = `${headline}\n\n${tagline} ${url}`;
  const enc = encodeURIComponent(fullText);
  const [copied, setCopied] = useState(false);
  const [imgBusy, setImgBusy] = useState(false);

  async function nativeShare() {
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: "Aqla — أقلع",
          text: `${headline}\n\n${tagline}`,
          url,
        });
        return;
      } catch { /* user cancelled */ }
    }
    void copy();
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  }

  function renderScoreCanvas(): HTMLCanvasElement | null {
    if (!scoreCard) return null;
    const W = 1080;
    const H = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Saudi green gradient background
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0b3a25");
    bg.addColorStop(0.55, "#0e4a30");
    bg.addColorStop(1, "#06231a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle glow
    const glow = ctx.createRadialGradient(W / 2, H * 0.35, 40, W / 2, H * 0.35, 700);
    glow.addColorStop(0, "rgba(255,215,120,0.20)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = "center";
    ctx.direction = lang === "ar" ? "rtl" : "ltr";

    // Brand
    ctx.fillStyle = "#F6D68A";
    ctx.font = "700 44px system-ui, -apple-system, 'Segoe UI', Tahoma";
    ctx.fillText("أقلع | Aqla", W / 2, 130);

    // Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 58px system-ui, -apple-system, 'Segoe UI', Tahoma";
    ctx.fillText(scoreCard.title, W / 2, 220);

    // Big score (first stat highlighted)
    const primary = scoreCard.stats[0];
    if (primary) {
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "500 40px system-ui";
      ctx.fillText(primary.label, W / 2, 340);
      ctx.fillStyle = "#F6D68A";
      ctx.font = "900 260px system-ui";
      ctx.fillText(primary.value, W / 2, 570);
    }

    // Stat row
    const rest = scoreCard.stats.slice(1);
    const rowY = 720;
    const boxW = 260;
    const gap = 24;
    const totalW = rest.length * boxW + (rest.length - 1) * gap;
    let x = (W - totalW) / 2;
    rest.forEach((s) => {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.strokeStyle = "rgba(246,214,138,0.35)";
      ctx.lineWidth = 2;
      const r = 24;
      const bx = x, by = rowY, bw = boxW, bh = 170;
      ctx.beginPath();
      ctx.moveTo(bx + r, by);
      ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
      ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
      ctx.arcTo(bx, by + bh, bx, by, r);
      ctx.arcTo(bx, by, bx + bw, by, r);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.font = "500 30px system-ui";
      ctx.fillText(s.label, bx + bw / 2, by + 60);
      ctx.fillStyle = "#ffffff";
      ctx.font = "800 60px system-ui";
      ctx.fillText(s.value, bx + bw / 2, by + 130);
      x += boxW + gap;
    });

    // CTA / URL
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "500 34px system-ui";
    ctx.fillText(scoreCard.cta, W / 2, 970);
    ctx.fillStyle = "#F6D68A";
    ctx.font = "800 44px system-ui";
    ctx.fillText(SHARE_URL.replace(/^https?:\/\//, ""), W / 2, 1030);

    return canvas;
  }

  async function shareImage() {
    if (!scoreCard) return;
    setImgBusy(true);
    try {
      const canvas = renderScoreCanvas();
      if (!canvas) return;
      const blob: Blob | null = await new Promise((res) =>
        canvas.toBlob((b) => res(b), "image/png", 0.95)
      );
      if (!blob) return;
      const file = new File([blob], "aqla-score.png", { type: "image/png" });
      const nav = navigator as Navigator & {
        canShare?: (d: { files?: File[] }) => boolean;
        share?: (d: ShareData & { files?: File[] }) => Promise<void>;
      };
      if (nav.canShare && nav.canShare({ files: [file] }) && nav.share) {
        try {
          await nav.share({
            files: [file],
            title: "Aqla — أقلع",
            text: `${headline}\n\n${tagline} ${url}`,
          });
          return;
        } catch { /* fall through to download */ }
      }
      const dl = document.createElement("a");
      dl.href = URL.createObjectURL(blob);
      dl.download = "aqla-score.png";
      document.body.appendChild(dl);
      dl.click();
      dl.remove();
      setTimeout(() => URL.revokeObjectURL(dl.href), 2000);
    } finally {
      setImgBusy(false);
    }
  }

  const btnBase =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 disabled:opacity-60";
  const primary =
    tone === "dark"
      ? { background: "#fff", color: "#10352F" }
      : tone === "ember"
      ? { background: "#C4452F", color: "#fff" }
      : { background: "#1B6E5F", color: "#fff" };
  const ghost =
    tone === "dark"
      ? { background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.35)" }
      : { background: "#fff", color: "#10352F", border: "1px solid #D5E3DD" };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className={tone === "dark" ? "text-xs opacity-80" : "text-xs opacity-70"}>
        {T("Share your result:", "شارك نتيجتك:", lang)}
      </span>
      {scoreCard && (
        <button
          type="button"
          onClick={() => void shareImage()}
          disabled={imgBusy}
          className={btnBase}
          style={primary}
        >
          🖼️ {imgBusy
            ? T("Preparing…", "جاري التحضير…", lang)
            : T("Share image", "شارك صورة النتيجة", lang)}
        </button>
      )}
      <button type="button" onClick={() => void nativeShare()} className={btnBase} style={scoreCard ? ghost : primary}>
        📣 {T("Share", "شارك", lang)}
      </button>
      <a
        href={`https://wa.me/?text=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnBase}
        style={ghost}
      >
        🟢 WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${enc}`}
        target="_blank"
        rel="noopener noreferrer"
        className={btnBase}
        style={ghost}
      >
        𝕏
      </a>
      <button type="button" onClick={() => void copy()} className={btnBase} style={ghost}>
        {copied ? T("Copied ✓", "تم النسخ ✓", lang) : T("Copy link", "نسخ الرابط", lang)}
      </button>
    </div>
  );
}


