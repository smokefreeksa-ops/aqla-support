import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { trackEvent } from "@/lib/track-event";
import { VisitTracker } from "@/components/VisitTracker";
import { SocialLinks } from "@/components/SocialLinks";
import { getAnonSessionId } from "@/lib/analytics";
import {
  recordChallengeEvent,
  getChallengePublicStats,
  type ChallengePublicStats,
} from "@/lib/challenges.functions";
import {
  getCityChallengeStats,
  type CityChallengeStats,
} from "@/lib/city-challenge.functions";
import {
  Languages, MapPin, Trophy, Calculator, CalendarDays,
  Target, HeartHandshake, Footprints, ArrowRight, MessageCircle,
  Twitter, Copy, Check, ShieldAlert,
} from "lucide-react";
import aqlaLogo from "@/assets/aqla-logo.png";

export const Route = createFileRoute("/challenges")({
  head: () => ({
    meta: [
      { title: "Aqla Challenges — تحديات أقلع" },
      {
        name: "description",
        content:
          "Join safe, privacy-first Aqla challenges. Aggregate community engagement indicators by city, with no personal data displayed.",
      },
      { property: "og:title", content: "Aqla Challenges — تحديات أقلع" },
      {
        property: "og:description",
        content:
          "Simple, safe community challenges with aggregate, privacy-safe impact indicators.",
      },
    ],
  }),
  component: ChallengesPage,
});

const SA_CITIES = [
  "Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Dhahran",
  "Taif", "Abha", "Tabuk", "Hail", "Buraidah", "Qassim", "Jubail", "Yanbu",
  "Najran", "Jizan", "Al-Ahsa", "Hofuf",
];

const AR_CITY: Record<string, string> = {
  Riyadh: "الرياض", Jeddah: "جدة", Makkah: "مكة المكرمة", Madinah: "المدينة المنورة",
  Dammam: "الدمام", Khobar: "الخبر", Dhahran: "الظهران", Taif: "الطائف",
  Abha: "أبها", Tabuk: "تبوك", Hail: "حائل", Buraidah: "بريدة", Qassim: "القصيم",
  Jubail: "الجبيل", Yanbu: "ينبع", Najran: "نجران", Jizan: "جازان",
  "Al-Ahsa": "الأحساء", Hofuf: "الهفوف",
};

function ChallengesPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

function Inner() {
  const { lang, setLang, dir } = useLang();
  const isAr = lang === "ar";
  const statsFn = useServerFn(getChallengePublicStats);
  const cityFn = useServerFn(getCityChallengeStats);
  const { data: pubData } = useQuery({
    queryKey: ["challenges-public-stats"],
    queryFn: () => statsFn(),
    staleTime: 60_000,
  });
  const { data: cityData } = useQuery({
    queryKey: ["city-challenge-stats"],
    queryFn: () => cityFn(),
    staleTime: 60_000,
  });
  const stats = pubData?.stats ?? null;
  const cityStats = cityData?.stats ?? null;

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={aqlaLogo} alt="Aqla — أقلع logo" className="h-[38px] w-auto object-contain sm:h-12" />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">{isAr ? "أقلع" : "Aqla"}</div>
              <div className="text-[11px] text-muted-foreground">Aqla — أقلع</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(isAr ? "en" : "ar")} className="gap-1.5">
              <Languages className="h-4 w-4" /> {isAr ? "English" : "العربية"}
            </Button>
            <Link to="/tools"><Button variant="ghost" size="sm">{isAr ? "الأدوات" : "Tools"}</Button></Link>
            <Link to="/about"><Button variant="ghost" size="sm">{isAr ? "عن أقلع" : "About"}</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        <section className="text-center">
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            {isAr ? "مشاركة آمنة وبدون بيانات شخصية" : "Safe, privacy-first participation"}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "تحديات أقلع" : "Aqla Challenges"}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            {isAr
              ? "شارك في تحديات بسيطة وآمنة تساعدك على بدء التغيير أو مساعدة غيرك، مع مؤشرات مجمعة تعكس أثر المجتمع دون عرض أي بيانات شخصية."
              : "Join simple, safe challenges that help you start change or support others, with aggregate community impact indicators and no personal data displayed."}
          </p>
        </section>

        <PublicKpiStrip stats={stats} isAr={isAr} />

        <div className="mt-10 grid gap-6">
          <PledgeMapCard isAr={isAr} />
          <CityChallengeCard cityStats={cityStats} isAr={isAr} />
          <SaveItCard isAr={isAr} />
          <TwentyEightDayCard isAr={isAr} />
          <TriggerBattleCard isAr={isAr} />
          <VolunteerCupCard isAr={isAr} stats={stats} />
          <FirstStepCard isAr={isAr} />
        </div>

        <Card className="mt-10 rounded-2xl border-l-4 border-l-secondary p-4">
          <div className="flex gap-3 text-sm text-muted-foreground">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
            <p>
              {isAr
                ? "هذه التحديات للتوعية والتفاعل المجتمعي فقط، ولا تعتبر علاجًا أو نجاحًا طبيًا. الإقلاع ليس مضمونًا، ودائمًا استشر طبيبك للحالات الطبية. لا تشارك معلومات صحية خاصة إذا لم تكن مرتاحًا لذلك."
                : "These challenges are for awareness and community engagement only. They are not medical treatment and do not guarantee quitting. Always consult your doctor for medical concerns. Do not share private health information unless you are comfortable doing so."}
            </p>
          </div>
        </Card>

        <VisitTracker path="/challenges" />
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground">
        <SocialLinks />
        <p className="mt-3">© Aqla — {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

/* -------------------- PUBLIC KPI STRIP -------------------- */
function PublicKpiStrip({ stats, isAr }: { stats: ChallengePublicStats | null; isAr: boolean }) {
  const items = [
    { label: isAr ? "إجمالي التعهدات" : "Total pledges", value: stats?.total_pledges ?? 0 },
    { label: isAr ? "تعهدات إقلاع" : "Quit pledges", value: stats?.quit_pledges ?? 0 },
    { label: isAr ? "تعهدات دعم" : "Supporter pledges", value: stats?.supporter_pledges ?? 0 },
    { label: isAr ? "مدن مشاركة" : "Cities participating", value: stats?.cities_participating ?? 0 },
    { label: isAr ? "مشاركات اجتماعية" : "Shares", value: stats?.challenge_shares ?? 0 },
    { label: isAr ? "وفّرها" : "Save It runs", value: stats?.save_it_calculations ?? 0 },
  ];
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {items.map((it, i) => (
        <Card key={i} className="rounded-xl border-0 p-3 text-center card-gradient">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{it.label}</div>
          <div className="mt-1 text-xl font-bold text-primary">{Number(it.value).toLocaleString()}</div>
        </Card>
      ))}
    </div>
  );
}

/* -------------------- SHARE HELPERS -------------------- */
function shareWhatsApp(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
function shareX(text: string) {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}
function ShareRow({ text, challenge, isAr }: { text: string; challenge: string; isAr: boolean }) {
  const [copied, setCopied] = useState(false);
  const sid = typeof window !== "undefined" ? getAnonSessionId() : null;
  const fire = (event_type: string) => {
    trackEvent(event_type, challenge);
    void recordChallengeEvent({ data: { challenge_type: challenge, event_type, anonymous_session_id: sid } });
  };
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <a href={shareWhatsApp(text)} target="_blank" rel="noopener noreferrer"
         onClick={() => fire("share_whatsapp")}>
        <Button size="sm" variant="outline" className="gap-1.5"><MessageCircle className="h-4 w-4" />WhatsApp</Button>
      </a>
      <a href={shareX(text)} target="_blank" rel="noopener noreferrer"
         onClick={() => fire("share_x")}>
        <Button size="sm" variant="outline" className="gap-1.5"><Twitter className="h-4 w-4" />X</Button>
      </a>
      <Button size="sm" variant="outline" className="gap-1.5"
        onClick={() => {
          navigator.clipboard?.writeText(text).then(() => {
            setCopied(true); setTimeout(() => setCopied(false), 1500);
          });
          fire("share_copy");
        }}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {isAr ? "نسخ" : "Copy"}
      </Button>
    </div>
  );
}

function CityPicker({ value, onChange, isAr }: {
  value: string; onChange: (v: string) => void; isAr: boolean;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">
        {isAr ? "اختر مدينتك (اختياري)" : "Choose your city (optional)"}
      </Label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
        <option value="">{isAr ? "— لا أرغب —" : "— Prefer not to say —"}</option>
        {SA_CITIES.map((c) => (
          <option key={c} value={c}>{isAr ? (AR_CITY[c] ?? c) : c}</option>
        ))}
      </select>
    </div>
  );
}

/* -------------------- 1. PLEDGE MAP -------------------- */
function PledgeMapCard({ isAr }: { isAr: boolean }) {
  const [pledge, setPledge] = useState<"quit" | "supporter" | null>(null);
  const [city, setCity] = useState("");
  const [done, setDone] = useState(false);
  const submit = () => {
    if (!pledge) return;
    const sid = getAnonSessionId();
    const event_type = pledge === "quit" ? "quit_pledge" : "supporter_pledge";
    void recordChallengeEvent({ data: {
      challenge_type: "pledge_map", event_type,
      city: city || null, anonymous_session_id: sid,
    }});
    trackEvent(event_type, "pledge_map");
    setDone(true);
  };
  const shareText = isAr
    ? "أضفت تعهدي في خريطة أقلع. خلّي مدينتك تقود التغيير."
    : "I added my pledge to the Aqla map. Help your city lead the change.";
  return (
    <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-elegant">
      <div className="quit-gradient-soft p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl quit-gradient text-white shadow-md">
            <MapPin className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold">{isAr ? "خريطة تعهدات أقلع" : "Aqla Quit Pledge Map"}</h2>
        </div>
        {!done ? (
          <>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button onClick={() => setPledge("quit")}
                className={`rounded-xl border p-4 text-start text-sm ${pledge === "quit" ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
                {isAr ? "أتعهد أن أبدأ خطوة نحو الإقلاع" : "I pledge to take one step toward quitting"}
              </button>
              <button onClick={() => setPledge("supporter")}
                className={`rounded-xl border p-4 text-start text-sm ${pledge === "supporter" ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
                {isAr ? "أتعهد أن أساعد شخصًا يريد الإقلاع" : "I pledge to help someone who wants to quit"}
              </button>
            </div>
            <div className="mt-4"><CityPicker value={city} onChange={setCity} isAr={isAr} /></div>
            <Button onClick={submit} disabled={!pledge} className="mt-4 quit-gradient border-0 text-white">
              {isAr ? "أضف تعهدي" : "Add my pledge"}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm text-foreground/80">
              {isAr ? "شكرًا لتعهدك! تمت إضافته إلى الخريطة المجمعة." : "Thank you for your pledge. It has been added to the aggregate map."}
            </p>
            <p className="mt-2 text-sm">{shareText}</p>
            <ShareRow text={shareText} challenge="pledge_map" isAr={isAr} />
          </>
        )}
      </div>
    </Card>
  );
}

/* -------------------- 2. CITY CHALLENGE -------------------- */
function CityChallengeCard({ cityStats, isAr }: {
  cityStats: CityChallengeStats | null; isAr: boolean;
}) {
  const topCities = useMemo(() => (cityStats?.cities ?? []).slice(0, 9), [cityStats]);
  return (
    <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-elegant">
      <div className="quit-gradient p-6 text-white sm:p-7">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6" />
          <h2 className="text-xl font-semibold">{isAr ? "تحدي مدن أقلع" : "Aqla City Challenge"}</h2>
        </div>
        <p className="mt-2 opacity-95 text-sm">{isAr ? "أي مدينة تقود التغيير؟" : "Which city is leading the change?"}</p>
      </div>
      <div className="p-6 sm:p-7">
        <div className="grid gap-3 sm:grid-cols-2">
          <Leader title={isAr ? "المدن الأكثر تفاعلًا" : "Most engaged cities"}
            value={topCities[0] ? `${labelCity(topCities[0].city, isAr)} · ${topCities[0].display_engagement}` : "—"} />
          <Leader title={isAr ? "المدينة الصاعدة هذا الأسبوع" : "Rising city this week"}
            value={leaderText(cityStats?.leaderboard.rising_weekly, isAr)} />
          <Leader title={isAr ? "أكثر مدينة في تعهدات الإقلاع" : "Top city for quit pledges"}
            value={leaderText(cityStats?.leaderboard.top_pledges, isAr)} />
          <Leader title={isAr ? "أكثر مدينة في طلبات التطوع" : "Top city for volunteer applications"}
            value={leaderText(cityStats?.leaderboard.top_volunteers, isAr)} />
        </div>
        <div className="mt-5">
          <div className="text-sm font-semibold">{isAr ? "تفاعل المدن" : "City engagement grid"}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {topCities.length === 0 && (
              <div className="col-span-full text-sm text-muted-foreground">
                {isAr ? "لا توجد بيانات كافية بعد." : "Not enough data yet."}
              </div>
            )}
            {topCities.map((c) => (
              <div key={c.city} className="rounded-lg border bg-card p-3">
                <div className="text-sm font-semibold">{labelCity(c.city, isAr)}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {isAr ? "نقاط التفاعل" : "Engagement"}: <span className="font-medium text-primary">{c.display_engagement}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {isAr ? "العدّاد <5 يعني عدد قليل لحماية الخصوصية." : "<5 means a small count, shown that way to protect privacy."}
          </p>
        </div>
      </div>
    </Card>
  );
}
function leaderText(l: { city: string; count: number } | null | undefined, isAr: boolean) {
  if (!l) return "—";
  return `${labelCity(l.city, isAr)} · ${l.count}`;
}
function labelCity(c: string, isAr: boolean) {
  if (!isAr) return c.split(" ").map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p)).join(" ");
  const key = Object.keys(AR_CITY).find((k) => k.toLowerCase() === c.toLowerCase());
  return key ? AR_CITY[key] : c;
}
function Leader({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{title}</div>
      <div className="mt-1 text-base font-semibold text-primary">{value}</div>
    </div>
  );
}

/* -------------------- 3. SAVE IT (Smoking Cost) -------------------- */
function SaveItCard({ isAr }: { isAr: boolean }) {
  const [cigs, setCigs] = useState<number>(20);
  const [price, setPrice] = useState<number>(28);
  const [done, setDone] = useState(false);
  const yearly = useMemo(() => {
    const perDay = (cigs / 20) * price;
    return Math.round(perDay * 365);
  }, [cigs, price]);
  const submit = () => {
    void recordChallengeEvent({ data: {
      challenge_type: "save_it", event_type: "calculation_completed",
      value_numeric: yearly, anonymous_session_id: getAnonSessionId(),
    }});
    trackEvent("save_it_calculation", String(yearly));
    setDone(true);
  };
  const shareText = isAr
    ? `اكتشفت أن التدخين قد يكلفني حوالي ${yearly.toLocaleString()} ريال سنويًا. ماذا كنت ستفعل بهذا المبلغ؟`
    : `I found out smoking may cost around ${yearly.toLocaleString()} SAR per year. What would you do with that money?`;
  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient sm:p-7">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl quit-gradient text-white shadow-md">
          <Calculator className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">{isAr ? "تحدي وفّرها" : "Save It Challenge"}</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label className="text-xs">{isAr ? "عدد السجائر يوميًا" : "Cigarettes per day"}</Label>
          <Input type="number" min={1} max={100} value={cigs} onChange={(e) => setCigs(Math.max(0, +e.target.value || 0))} />
        </div>
        <div>
          <Label className="text-xs">{isAr ? "سعر العلبة (ريال)" : "Pack price (SAR)"}</Label>
          <Input type="number" min={1} max={500} value={price} onChange={(e) => setPrice(Math.max(0, +e.target.value || 0))} />
        </div>
      </div>
      <div className="mt-4 rounded-xl bg-primary-soft p-4">
        <div className="text-xs text-muted-foreground">{isAr ? "التكلفة السنوية التقديرية" : "Estimated yearly cost"}</div>
        <div className="mt-1 text-2xl font-bold text-primary">{yearly.toLocaleString()} {isAr ? "ريال" : "SAR"}</div>
      </div>
      {!done ? (
        <Button onClick={submit} className="mt-4 quit-gradient border-0 text-white">
          {isAr ? "احسب وشارك" : "Calculate & share"}
        </Button>
      ) : (
        <>
          <p className="mt-4 text-sm">{shareText}</p>
          <ShareRow text={shareText} challenge="save_it" isAr={isAr} />
        </>
      )}
      <div className="mt-3">
        <Link to="/assessment" onClick={() => {
          trackEvent("start_assessment_clicked_from_challenge", "save_it");
          void recordChallengeEvent({ data: { challenge_type: "save_it", event_type: "start_assessment_clicked_from_challenge", anonymous_session_id: getAnonSessionId() } });
        }}>
          <Button variant="outline" size="sm" className="gap-1.5">
            {isAr ? "ابدأ التقييم الكامل" : "Start full assessment"} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

/* -------------------- 4. 28-DAY CHALLENGE -------------------- */
function TwentyEightDayCard({ isAr }: { isAr: boolean }) {
  const choices: { id: string; ar: string; en: string }[] = [
    { id: "quit",    ar: "سأحاول الإقلاع",       en: "I will try to quit" },
    { id: "reduce",  ar: "سأقلل",               en: "I will reduce" },
    { id: "track",   ar: "سأراقب محفزاتي",      en: "I will track my triggers" },
    { id: "support", ar: "سأساعد شخصًا آخر",    en: "I will support someone else" },
  ];
  const [pick, setPick] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const submit = () => {
    if (!pick) return;
    void recordChallengeEvent({ data: {
      challenge_type: "28day", event_type: "challenge_started",
      value_label: pick, anonymous_session_id: getAnonSessionId(),
    }});
    trackEvent("28day_started", pick);
    setDone(true);
  };
  const milestones = [
    { d: 1,  ar: "بدأت",          en: "Started" },
    { d: 3,  ar: "صامد",          en: "Holding on" },
    { d: 7,  ar: "أسبوع قوي",     en: "Strong week" },
    { d: 14, ar: "نصف الطريق",    en: "Halfway" },
    { d: 28, ar: "أنجزت التحدي",  en: "Challenge complete" },
  ];
  const shareText = isAr
    ? "بدأت تحدي أقلع 28 يوم. الخطوة الأولى بدأت اليوم."
    : "I started the Aqla 28-Day Challenge. The first step starts today.";
  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient sm:p-7">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl quit-gradient text-white shadow-md">
          <CalendarDays className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">{isAr ? "تحدي أقلع 28 يوم" : "Aqla 28-Day Challenge"}</h2>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {isAr ? "تحدي للتحفيز والمشاركة فقط، ولا يعتبر نجاحًا طبيًا." : "Engagement and motivation only — not a clinical outcome."}
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {choices.map((c) => (
          <button key={c.id} onClick={() => setPick(c.id)}
            className={`rounded-xl border p-3 text-start text-sm ${pick === c.id ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
            {isAr ? c.ar : c.en}
          </button>
        ))}
      </div>
      <div className="mt-5">
        <div className="text-xs font-semibold uppercase text-muted-foreground">{isAr ? "المحطات" : "Milestones"}</div>
        <div className="mt-2 grid grid-cols-5 gap-2">
          {milestones.map((m) => (
            <div key={m.d} className="rounded-lg border bg-card p-2 text-center">
              <div className="text-[10px] text-muted-foreground">{isAr ? `يوم ${m.d}` : `Day ${m.d}`}</div>
              <div className="mt-1 text-[11px] font-semibold">{isAr ? m.ar : m.en}</div>
            </div>
          ))}
        </div>
      </div>
      {!done ? (
        <Button onClick={submit} disabled={!pick} className="mt-4 quit-gradient border-0 text-white">
          {isAr ? "ابدأ التحدي" : "Start the challenge"}
        </Button>
      ) : (
        <>
          <p className="mt-4 text-sm">{shareText}</p>
          <ShareRow text={shareText} challenge="28day" isAr={isAr} />
        </>
      )}
    </Card>
  );
}

/* -------------------- 5. TRIGGER BATTLE -------------------- */
function TriggerBattleCard({ isAr }: { isAr: boolean }) {
  const triggers = [
    { id: "coffee",      ar: "القهوة",            en: "Coffee" },
    { id: "after_meals", ar: "بعد الوجبات",       en: "After meals" },
    { id: "stress",      ar: "التوتر",            en: "Stress" },
    { id: "friends",     ar: "مع الأصدقاء",       en: "Friends" },
    { id: "boredom",     ar: "الملل",             en: "Boredom" },
    { id: "studying",    ar: "الدراسة/الاختبارات", en: "Studying/exams" },
    { id: "driving",     ar: "أثناء القيادة",     en: "Driving" },
    { id: "social",      ar: "المناسبات",         en: "Social gatherings" },
    { id: "before_sleep", ar: "قبل النوم",        en: "Before sleep" },
    { id: "after_wake",  ar: "بعد الاستيقاظ",     en: "After waking" },
  ];
  const [pick, setPick] = useState<string | null>(null);
  const submit = (id: string) => {
    setPick(id);
    const label = triggers.find((t) => t.id === id);
    void recordChallengeEvent({ data: {
      challenge_type: "trigger_battle", event_type: "trigger_selected",
      value_label: id, anonymous_session_id: getAnonSessionId(),
    }});
    trackEvent("trigger_battle_selected", id);
    void label;
  };
  const picked = triggers.find((t) => t.id === pick);
  const triggerLabel = picked ? (isAr ? picked.ar : picked.en) : "";
  const shareText = isAr
    ? `اكتشفت محفزي الأول مع أقلع: ${triggerLabel}. الوعي أول خطوة للتغيير.`
    : `I discovered my top trigger with Aqla: ${triggerLabel}. Awareness is the first step to change.`;
  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient sm:p-7">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl quit-gradient text-white shadow-md">
          <Target className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">{isAr ? "تحدي المحفزات" : "Trigger Battle"}</h2>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {triggers.map((t) => (
          <button key={t.id} onClick={() => submit(t.id)}
            className={`rounded-xl border p-3 text-sm ${pick === t.id ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
            {isAr ? t.ar : t.en}
          </button>
        ))}
      </div>
      {pick && (
        <>
          <div className="mt-4 rounded-xl border bg-card p-4 text-sm">
            <div className="font-semibold">{isAr ? "مهمتك اليوم:" : "Today's mission:"}</div>
            <p className="mt-1 text-foreground/80">
              {isAr
                ? "أخّر الرغبة 5 دقائق، اشرب ماء، غيّر مكانك، ثم قيّم رغبتك من جديد."
                : "Delay the urge for 5 minutes, drink water, change location, then reassess the craving."}
            </p>
          </div>
          <p className="mt-3 text-sm">{shareText}</p>
          <ShareRow text={shareText} challenge="trigger_battle" isAr={isAr} />
        </>
      )}
    </Card>
  );
}

/* -------------------- 6. VOLUNTEER SUPPORT CUP -------------------- */
function VolunteerCupCard({ isAr, stats }: { isAr: boolean; stats: ChallengePublicStats | null }) {
  return (
    <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-elegant">
      <div className="volunteer-gradient p-6 text-white sm:p-7">
        <div className="flex items-center gap-3">
          <HeartHandshake className="h-6 w-6" />
          <h2 className="text-xl font-semibold">{isAr ? "كأس متطوعي أقلع" : "Aqla Volunteer Support Cup"}</h2>
        </div>
        <p className="mt-2 text-sm opacity-95">
          {isAr ? "مؤشرات مجمعة لدعم المجتمع — بدون أسماء أو معلومات شخصية." : "Aggregate community support indicators — no names or personal info."}
        </p>
      </div>
      <div className="grid gap-3 p-6 sm:grid-cols-2 sm:p-7">
        <KpiTile label={isAr ? "طلبات التطوع" : "Volunteer applications"} value={stats?.volunteers_joined ?? 0} />
        <KpiTile label={isAr ? "تعهدات الدعم" : "Supporter pledges"} value={stats?.supporter_pledges ?? 0} />
        <KpiTile label={isAr ? "مشاركات اجتماعية" : "Supporter shares"} value={stats?.challenge_shares ?? 0} />
        <KpiTile label={isAr ? "مدن مشاركة" : "Cities participating"} value={stats?.cities_participating ?? 0} />
        <div className="sm:col-span-2">
          <Link to="/volunteer" onClick={() => {
            trackEvent("volunteer_apply_clicked_from_challenge", "volunteer_cup");
            void recordChallengeEvent({ data: { challenge_type: "volunteer_cup", event_type: "volunteer_apply_clicked_from_challenge", anonymous_session_id: getAnonSessionId() } });
          }}>
            <Button className="volunteer-gradient border-0 text-white">
              {isAr ? "انضم كمتطوع" : "Apply to volunteer"} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
function KpiTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-bold text-primary">{Number(value).toLocaleString()}</div>
    </div>
  );
}

/* -------------------- 7. FIRST STEP -------------------- */
function FirstStepCard({ isAr }: { isAr: boolean }) {
  const steps = [
    { id: "score",         ar: "سأعرف درجتي",         en: "I will learn my score" },
    { id: "delay_first",   ar: "سأؤجل أول استخدام",   en: "I will delay my first use" },
    { id: "reduce_today",  ar: "سأقلل اليوم",         en: "I will reduce today" },
    { id: "remove_trigger",ar: "سأحذف محفزًا",        en: "I will remove one trigger" },
    { id: "ask_support",   ar: "سأطلب دعمًا",         en: "I will ask for support" },
    { id: "help_other",    ar: "سأساعد شخصًا آخر",    en: "I will help someone else" },
  ];
  const [pick, setPick] = useState<string | null>(null);
  const submit = (id: string) => {
    setPick(id);
    void recordChallengeEvent({ data: {
      challenge_type: "first_step", event_type: "choice_selected",
      value_label: id, anonymous_session_id: getAnonSessionId(),
    }});
    trackEvent("first_step_chosen", id);
  };
  const picked = steps.find((s) => s.id === pick);
  const shareText = picked
    ? (isAr ? `خطوتي الأولى مع أقلع: ${picked.ar}` : `My first step with Aqla: ${picked.en}`)
    : "";
  return (
    <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient sm:p-7">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl quit-gradient text-white shadow-md">
          <Footprints className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-semibold">{isAr ? "تحدي أول خطوة" : "First Step Challenge"}</h2>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((s) => (
          <button key={s.id} onClick={() => submit(s.id)}
            className={`rounded-xl border p-3 text-start text-sm ${pick === s.id ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
            {isAr ? s.ar : s.en}
          </button>
        ))}
      </div>
      {picked && (
        <>
          <p className="mt-4 text-sm">{shareText}</p>
          <ShareRow text={shareText} challenge="first_step" isAr={isAr} />
          <div className="mt-3">
            <Link to="/assessment" onClick={() => {
              trackEvent("start_assessment_clicked_from_challenge", "first_step");
              void recordChallengeEvent({ data: { challenge_type: "first_step", event_type: "start_assessment_clicked_from_challenge", anonymous_session_id: getAnonSessionId() } });
            }}>
              <Button variant="outline" size="sm" className="gap-1.5">
                {isAr ? "ابدأ التقييم" : "Start assessment"} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </>
      )}
    </Card>
  );
}

// silence unused Sparkles import warning
void Sparkles;
