import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { getAnonSessionId } from "@/lib/analytics";
import { trackEvent } from "@/lib/track-event";
import {
  getMovementPublicStats,
  getAqlaIndex,
  getPassportSummary,
  signCharter,
  logMovementEvent,
} from "@/lib/movement.functions";
import {
  Languages,
  ArrowRight,
  ShieldCheck,
  Flag,
  Activity,
  MapPin,
  Coffee,
  Stamp,
  Share2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Aqla Movement — حركة أقلع" },
      {
        name: "description",
        content:
          "Sign the Aqla Charter, follow the live Aqla Index, and join a Saudi public-health movement — aligned with Vision 2030.",
      },
      { property: "og:title", content: "Aqla Movement — حركة أقلع" },
    ],
  }),
  component: MovementPage,
});

function MovementPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

const CHARTER_AR = [
  "أنا لست وحدي.",
  "الإقلاع ليس فشلًا متكررًا، بل تجربة تتراكم.",
  "أساند، ولا أحكم.",
  "أتعلّم قبل أن أنصح.",
  "خصوصيتي وخصوصية غيري أمانة.",
  "مدينتي تتنفّس معي.",
];
const CHARTER_EN = [
  "I am not alone.",
  "Quitting is not repeated failure. It is accumulating experience.",
  "I support without judging.",
  "I learn before I advise.",
  "My privacy, and others' privacy, is a trust.",
  "My city breathes with me.",
];

const TRIGGERS: { key: string; ar: string; en: string }[] = [
  { key: "arabic_coffee", ar: "القهوة العربية", en: "Arabic coffee" },
  { key: "majlis", ar: "المجلس أو الديوانية", en: "Majlis / diwaniya" },
  { key: "after_maghrib", ar: "بعد صلاة المغرب", en: "After Maghrib prayer" },
  { key: "after_meal", ar: "بعد الأكل", en: "After meals" },
  { key: "driving", ar: "القيادة", en: "Driving" },
  { key: "work_stress", ar: "ضغط العمل", en: "Work pressure" },
  { key: "exams", ar: "الاختبارات والدراسة", en: "Exams & study" },
  { key: "gatherings", ar: "العزائم والمناسبات", en: "Gatherings & events" },
  { key: "shisha_friends", ar: "الشيشة مع الأصدقاء", en: "Shisha with friends" },
  { key: "late_night", ar: "السهر آخر الليل", en: "Late-night hours" },
  { key: "stress", ar: "التوتر أو الزعل", en: "Stress / upset" },
];

const COPING_AR = [
  "أخّر الرغبة 5 دقائق",
  "اشرب ماء",
  "غيّر مكانك",
  "خذ نفسًا هادئًا",
  "تواصل مع شخص داعم",
  "استخدم مدرب اللحظة",
  "ابدأ تقييم أقلع",
];
const COPING_EN = [
  "Delay the craving 5 minutes",
  "Drink water",
  "Change your location",
  "Take a slow breath",
  "Reach a supportive person",
  "Use the moment coach",
  "Start the Aqla assessment",
];

const MAJLIS_PHRASES = [
  "يعطيك العافية، اليوم بحاول أخفف.",
  "تسلم، خليني على القهوة اليوم.",
  "والله ناوي أبدأ أقلل، ادعمني.",
  "ما قصرت، بس اليوم بجرّب أتركها.",
  "خلنا نغيرها اليوم، قهوة وسوالف بدون دخان.",
];

const PASSPORT_STAMPS: { key: string; ar: string; en: string }[] = [
  { key: "charter_signed", ar: "وقّعت ميثاق أقلع", en: "Signed Aqla Charter" },
  { key: "assessment_completed", ar: "أكملت التقييم", en: "Completed assessment" },
  { key: "quit_pledge_created", ar: "أنشأت وعد إقلاع", en: "Created quit pledge" },
  { key: "poster_created", ar: "صممت منشور توعوي", en: "Created awareness poster" },
  { key: "quiz_completed", ar: "أكملت اختبار معرفي", en: "Completed knowledge quiz" },
  { key: "city_challenge_joined", ar: "شاركت تحدي المدينة", en: "Joined city challenge" },
  { key: "volunteer_training_started", ar: "بدأت تدريب المتطوعين", en: "Started volunteer training" },
  { key: "helped_someone", ar: "ساعدت شخصًا آخر", en: "Helped someone else" },
];

function Inner() {
  const { lang, setLang, dir } = useLang();
  const isAr = lang === "ar";
  const qc = useQueryClient();
  const session = useMemo(
    () => (typeof window === "undefined" ? "ssr" : getAnonSessionId()),
    []
  );

  const stats = useServerFn(getMovementPublicStats);
  const indexFn = useServerFn(getAqlaIndex);
  const passportFn = useServerFn(getPassportSummary);
  const signFn = useServerFn(signCharter);
  const logFn = useServerFn(logMovementEvent);

  const statsQ = useQuery({
    queryKey: ["movement-stats"],
    queryFn: () => stats({}),
    refetchInterval: 30000,
  });
  const indexQ = useQuery({
    queryKey: ["aqla-index"],
    queryFn: () => indexFn({}),
    refetchInterval: 20000,
  });
  const passportQ = useQuery({
    queryKey: ["passport", session],
    queryFn: () => passportFn({ data: { session } }),
    enabled: !!session && session !== "ssr",
  });

  useEffect(() => {
    if (session && session !== "ssr") {
      void logFn({ data: { session, event_type: "movement_page_viewed" } });
      trackEvent("movement_page_viewed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (indexQ.data && session && session !== "ssr") {
      void logFn({ data: { session, event_type: "aqla_index_viewed" } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!!indexQ.data]);

  // Charter
  const [signed, setSigned] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [consent, setConsent] = useState(false);

  const signMut = useMutation({
    mutationFn: (input: { display_name?: string | null; city?: string | null; consent_public_display: boolean }) =>
      signFn({ data: { session, ...input } }),
    onSuccess: () => {
      setSigned(true);
      toast.success(isAr ? "تم التوقيع على الميثاق" : "Charter signed");
      trackEvent("charter_signed");
      void qc.invalidateQueries({ queryKey: ["movement-stats"] });
      void qc.invalidateQueries({ queryKey: ["passport", session] });
    },
    onError: () => toast.error(isAr ? "تعذّر التوقيع" : "Sign failed"),
  });

  // Trigger map
  const [selectedTriggers, setSelectedTriggers] = useState<Set<string>>(new Set());
  const toggleTrigger = (k: string) => {
    setSelectedTriggers((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  };

  const completeTrigger = () => {
    void logFn({ data: { session, event_type: "trigger_map_completed" } });
    trackEvent("trigger_map_completed");
    toast.success(isAr ? "تم حفظ المحفزات" : "Triggers saved");
  };

  // Majlis copy
  const copyPhrase = async (p: string) => {
    try {
      await navigator.clipboard.writeText(p);
      void logFn({ data: { session, event_type: "majlis_phrase_copied" } });
      trackEvent("majlis_phrase_copied");
      toast.success(isAr ? "تم النسخ" : "Copied");
    } catch {
      toast.error(isAr ? "تعذّر النسخ" : "Copy failed");
    }
  };

  // Share
  const shareCharter = (channel: "whatsapp" | "x") => {
    const text = isAr
      ? "وقّعت ميثاق أقلع. انضم إلينا: "
      : "I signed the Aqla Charter. Join us: ";
    const url = typeof window !== "undefined" ? `${window.location.origin}/movement` : "";
    const full = `${text}${url}`;
    const link =
      channel === "whatsapp"
        ? `https://wa.me/?text=${encodeURIComponent(full)}`
        : `https://twitter.com/intent/tweet?text=${encodeURIComponent(full)}`;
    void logFn({ data: { session, event_type: channel === "whatsapp" ? "movement_share_whatsapp" : "movement_share_x" } });
    trackEvent("movement_share_clicked", channel);
    window.open(link, "_blank", "noopener");
  };

  const passportStamps = new Set(passportQ.data?.stamps ?? []);
  const stampCount = passportQ.data?.count ?? 0;

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-sm font-semibold">
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            {isAr ? "العودة" : "Back"}
          </Link>
          <Button variant="ghost" size="sm" onClick={() => setLang(isAr ? "en" : "ar")} className="gap-1.5">
            <Languages className="h-4 w-4" />
            {isAr ? "English" : "العربية"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
        {/* Hero */}
        <section className="text-center">
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            {isAr ? "متوافق مع رؤية 2030" : "Aligned with Vision 2030"}
          </span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {isAr ? "حركة أقلع" : "Aqla Movement"}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-[15px] leading-8 text-muted-foreground">
            {isAr
              ? "أقلع ليست مجرد منصة. إنها مساحة يشارك فيها الأفراد والمدن والمتطوعون في نشر الوعي، دعم الإقلاع، وبناء أثر مجتمعي قابل للقياس دون عرض أي بيانات شخصية."
              : "Aqla is more than a platform. It is a space where people, cities, and volunteers participate in awareness, cessation support, and measurable community impact without displaying personal data."}
          </p>
        </section>

        {/* Aqla Index */}
        <section className="mt-12">
          <Card className="rounded-3xl border-0 p-6 sm:p-8 shadow-elegant card-gradient">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl quit-gradient text-white shadow-md">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{isAr ? "مؤشر أقلع" : "Aqla Index"}</h2>
                <p className="text-xs text-muted-foreground">{isAr ? "آخر 24 ساعة" : "Last 24 hours"}</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <div className="text-6xl font-bold text-primary tabular-nums">
                {indexQ.data?.index ?? "—"}
                <span className="ms-2 text-2xl text-muted-foreground/70">/ 1000</span>
              </div>
              <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full quit-gradient transition-all"
                  style={{ width: `${Math.min(100, ((indexQ.data?.index ?? 0) / 1000) * 100)}%` }}
                />
              </div>
            </div>
            <p className="mt-4 text-xs leading-6 text-muted-foreground">
              {isAr
                ? "مؤشر أقلع يعكس التفاعل المجتمعي مع المنصة، ولا يمثل نتيجة طبية أو معدل إقلاع مؤكد."
                : "The Aqla Index reflects community engagement with the platform. It is not a medical outcome or confirmed quit rate."}
            </p>
          </Card>
        </section>

        {/* Live Impact Wall */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            {isAr ? "في هذه اللحظة مع أقلع" : "At this moment with Aqla"}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { ar: "التقييمات المكتملة", en: "Assessments completed", v: statsQ.data?.assessments_completed },
              { ar: "تعهدات الإقلاع", en: "Quit pledges", v: statsQ.data?.quit_pledges },
              { ar: "أعضاء ميثاق أقلع", en: "Charter members", v: statsQ.data?.charter_signatures },
              { ar: "المنشورات التوعوية المنشأة", en: "Awareness posters created", v: statsQ.data?.posters_created },
              { ar: "الاختبارات المعرفية المكتملة", en: "Knowledge quizzes completed", v: statsQ.data?.quizzes_completed },
              { ar: "المتطوعون الذين بدأوا التدريب", en: "Volunteers training started", v: statsQ.data?.volunteers_started_training },
              { ar: "المدن المشاركة", en: "Cities participating", v: statsQ.data?.cities_participating },
              { ar: "المشاركات عبر واتساب و X", en: "WhatsApp & X shares", v: statsQ.data?.whatsapp_x_shares },
              { ar: "إجمالي التوفير التقديري (ر.س)", en: "Estimated total savings (SAR)", v: statsQ.data?.estimated_savings_sar },
            ].map((s, i) => (
              <Card key={i} className="rounded-2xl border-0 p-5 card-gradient">
                <div className="text-3xl font-bold text-primary tabular-nums">
                  {s.v === undefined ? "—" : Number(s.v).toLocaleString(isAr ? "ar-SA" : "en-US")}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{isAr ? s.ar : s.en}</div>
              </Card>
            ))}
          </div>
        </section>

        {/* Charter */}
        <section className="mt-12">
          <Card className="rounded-3xl border-0 p-6 sm:p-8 shadow-elegant card-gradient">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-700 shadow-md">
                <Flag className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">{isAr ? "ميثاق أقلع" : "The Aqla Charter"}</h2>
            </div>
            <ol className="mt-5 grid gap-2 ps-5 text-[15px] leading-8 text-foreground/85" style={{ listStyle: isAr ? "arabic-indic" : "decimal" }}>
              {(isAr ? CHARTER_AR : CHARTER_EN).map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>

            {signed ? (
              <div className="mt-6 rounded-2xl border border-primary/20 bg-primary-soft p-5">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                  <strong>
                    {isAr
                      ? `شكرًا ${name?.trim() || "داعم أقلع"} — أنت الآن من أعضاء ميثاق أقلع.`
                      : `Thank you ${name?.trim() || "Aqla Supporter"} — you are now a Charter member.`}
                  </strong>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => shareCharter("whatsapp")}>
                    <Share2 className="h-4 w-4" /> WhatsApp
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => shareCharter("x")}>
                    <Share2 className="h-4 w-4" /> X
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ch-name" className="text-xs">
                    {isAr ? "الاسم أو اللقب (اختياري)" : "Name or nickname (optional)"}
                  </Label>
                  <Input
                    id="ch-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? "داعم أقلع" : "Aqla Supporter"}
                    maxLength={40}
                  />
                </div>
                <div>
                  <Label htmlFor="ch-city" className="text-xs">
                    {isAr ? "المدينة (اختياري)" : "City (optional)"}
                  </Label>
                  <Input
                    id="ch-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    maxLength={60}
                  />
                </div>
                <label className="sm:col-span-2 flex items-start gap-2 text-xs text-muted-foreground">
                  <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
                  <span>
                    {isAr
                      ? "أوافق على عرض اسمي (أو لقبي) ضمن أعضاء الميثاق علنًا. (اختياري)"
                      : "I consent to my name/nickname being shown publicly among Charter members. (Optional)"}
                  </span>
                </label>
                <div className="sm:col-span-2">
                  <Button
                    className="quit-gradient border-0 text-white"
                    disabled={signMut.isPending}
                    onClick={() =>
                      signMut.mutate({
                        display_name: name.trim() || null,
                        city: city.trim() || null,
                        consent_public_display: consent,
                      })
                    }
                  >
                    {isAr ? "أوقّع الميثاق" : "Sign the Charter"}
                  </Button>
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    {isAr
                      ? "لا نطلب بريدك أو رقم جوالك للتوقيع على الميثاق."
                      : "We do not collect email or phone for charter signing."}
                  </p>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* Saudi Trigger Map */}
        <section className="mt-12">
          <Card className="rounded-3xl border-0 p-6 sm:p-8 shadow-elegant card-gradient">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl quit-gradient text-white shadow-md">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">
                {isAr ? "خريطة المحفزات السعودية" : "Saudi Trigger Map"}
              </h2>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {isAr ? "اختر ما يحفّزك، وسنقترح أفكار تأقلم آمنة (دون أدوية)." : "Pick your triggers and we'll suggest safe coping ideas (no medication)."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {TRIGGERS.map((t) => {
                const on = selectedTriggers.has(t.key);
                return (
                  <button
                    key={t.key}
                    onClick={() => toggleTrigger(t.key)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      on ? "bg-primary text-primary-foreground border-primary" : "bg-background hover:bg-muted"
                    }`}
                  >
                    {isAr ? t.ar : t.en}
                  </button>
                );
              })}
            </div>

            {selectedTriggers.size > 0 && (
              <div className="mt-6 rounded-2xl border bg-background/60 p-5">
                <h3 className="text-sm font-semibold">{isAr ? "أفكار تأقلم آمنة" : "Safe coping ideas"}</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {(isAr ? COPING_AR : COPING_EN).map((c, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" /> {c}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" onClick={completeTrigger} className="quit-gradient border-0 text-white">
                    {isAr ? "حفظ المحفزات" : "Save triggers"}
                  </Button>
                  <Link to="/assessment">
                    <Button size="sm" variant="outline">{isAr ? "ابدأ تقييم أقلع" : "Start Aqla assessment"}</Button>
                  </Link>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* Majlis Mode */}
        <section className="mt-12">
          <Card className="rounded-3xl border-0 p-6 sm:p-8 shadow-elegant card-gradient">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-700 shadow-md">
                <Coffee className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">{isAr ? "وضع المجلس" : "Majlis Mode"}</h2>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {isAr
                ? "عبارات مهذبة بالعربية الطبيعية للاعتذار عن التدخين في المجلس أو الديوانية، دون إحراج أو حكم."
                : "Culturally respectful Arabic phrases to decline smoking in majlis/diwaniya without judgment or embarrassment."}
            </p>
            <div className="mt-5 grid gap-2">
              {MAJLIS_PHRASES.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-xl border bg-background/60 p-3">
                  <span className="text-sm" dir="rtl">{p}</span>
                  <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => copyPhrase(p)}>
                    <Copy className="h-4 w-4" /> {isAr ? "نسخ" : "Copy"}
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-primary/20 bg-primary-soft p-4 text-center text-sm font-semibold text-primary">
              {isAr ? "اليوم مجلسنا أوعى" : "Majlis with more awareness today"}
            </div>
          </Card>
        </section>

        {/* Aqla Passport */}
        <section className="mt-12">
          <Card className="rounded-3xl border-0 p-6 sm:p-8 shadow-elegant card-gradient">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-100 text-amber-700 shadow-md">
                <Stamp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{isAr ? "جواز أقلع" : "Aqla Passport"}</h2>
                <p className="text-xs text-muted-foreground">
                  {isAr ? `جمعت ${stampCount} من ${PASSPORT_STAMPS.length} أختام` : `You have ${stampCount} of ${PASSPORT_STAMPS.length} stamps`}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PASSPORT_STAMPS.map((s) => {
                const earned = passportStamps.has(s.key);
                return (
                  <div
                    key={s.key}
                    className={`rounded-2xl border p-4 text-center transition ${
                      earned ? "border-primary bg-primary-soft" : "border-dashed bg-background/40 opacity-70"
                    }`}
                  >
                    <Stamp className={`mx-auto h-6 w-6 ${earned ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="mt-2 text-xs font-medium">{isAr ? s.ar : s.en}</div>
                    {earned && (
                      <Badge variant="secondary" className="mt-2 text-[10px]">
                        {isAr ? "تم" : "Earned"}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
            {stampCount > 0 && (
              <div className="mt-5">
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    const text = isAr
                      ? `جمعت ${stampCount} أختام في جواز أقلع. انضم: `
                      : `I collected ${stampCount} stamps in my Aqla Passport. Join: `;
                    const url = `${window.location.origin}/movement`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, "_blank", "noopener");
                    void logFn({ data: { session, event_type: "passport_share_clicked" } });
                    trackEvent("movement_share_clicked", "passport");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  {isAr ? "شارك جواز أقلع" : "Share my Passport"}
                </Button>
              </div>
            )}
          </Card>
        </section>

        <p className="mt-10 text-center text-[11px] text-muted-foreground">
          {isAr
            ? "العدّادات تجميعية وعامة فقط. لا نعرض بيانات شخصية أو نتائج صحية فردية."
            : "All counters are aggregate and public-safe. No personal data or individual health outcomes are shown."}
        </p>
      </main>
    </div>
  );
}
