import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { trackEvent } from "@/lib/track-event";
import { VisitTracker } from "@/components/VisitTracker";
import { SocialLinks } from "@/components/SocialLinks";
import { getCityChallengeStats, type CityRow, type CityChallengeStats } from "@/lib/city-challenge.functions";
import { Trophy, MapPin, Sparkles, Users, HeartHandshake, ArrowRight, Languages, MessageCircle, Twitter, Copy } from "lucide-react";
import aqlaLogo from "@/assets/aqla-logo.png";

export const Route = createFileRoute("/city-challenge")({
  head: () => ({
    meta: [
      { title: "Aqla City Challenge — تحدي مدن أقلع" },
      { name: "description", content: "An interactive, privacy-safe view of community engagement with Aqla by city — aggregate indicators only." },
      { property: "og:title", content: "Aqla City Challenge — تحدي مدن أقلع" },
      { property: "og:description", content: "Which city is leading the change? Aggregate, privacy-safe community engagement by city." },
    ],
  }),
  component: CityChallengePage,
});

function CityChallengePage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

const ARABIC_CITY: Record<string, string> = {
  riyadh: "الرياض", jeddah: "جدة", makkah: "مكة المكرمة", mecca: "مكة المكرمة",
  madinah: "المدينة المنورة", medina: "المدينة المنورة", dammam: "الدمام",
  khobar: "الخبر", "al khobar": "الخبر", dhahran: "الظهران", taif: "الطائف",
  abha: "أبها", tabuk: "تبوك", hail: "حائل", buraidah: "بريدة",
  qassim: "القصيم", jubail: "الجبيل", yanbu: "ينبع", najran: "نجران",
  jizan: "جازان", "al-ahsa": "الأحساء", ahsa: "الأحساء", hofuf: "الهفوف",
  other: "أخرى",
};

function titleCase(s: string) {
  return s
    .split(/\s+/)
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join("");
}
function displayCity(raw: string, isAr: boolean) {
  const key = raw.toLowerCase().trim();
  if (isAr) return ARABIC_CITY[key] ?? raw;
  return key === "other"? "Other" : titleCase(raw);
}

function Inner() {
  const { lang, setLang, dir } = useLang();
  const isAr = lang === "ar";
  const t = (ar: string, en: string) => (isAr ? ar : en);

  useEffect(() => { trackEvent("city_challenge_viewed"); }, []);

  const fetchStats = useServerFn(getCityChallengeStats);
  const { data, isLoading } = useQuery({
    queryKey: ["city-challenge-stats"],
    queryFn: () => fetchStats(),
    staleTime: 60_000,
  });
  const stats = data?.stats ?? null;

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/"className="flex items-center gap-3">
            <img src={aqlaLogo} alt="Aqla logo"className="h-[38px] w-auto object-contain sm:h-12" />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">Aqla — أقلع</div>
              <div className="text-[11px] text-muted-foreground">{t("تحدي المدن", "City Challenge")}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost"size="sm"onClick={() => setLang(isAr ? "en": "ar")} className="gap-1.5">
              <Languages className="h-4 w-4"/>{isAr ? "English": "العربية"}
            </Button>
            <Link to="/request-support"><Button variant="ghost"size="sm">{t("الأدوات", "Tools")}</Button></Link>
            <Link to="/assessment"><Button size="sm"className="quit-gradient border-0 text-white">{t("ابدأ التقييم", "Start assessment")}</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <section className="text-center">
          <span className="inline-block rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            {t("تفاعل مجتمعي، آمن للخصوصية", "Community engagement — privacy-safe")}
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl text-primary">
            {t("تحدي مدن أقلع", "Aqla City Challenge")}
          </h1>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            {t("أي مدينة تقود التغيير؟", "Which city is leading the change?")}
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-foreground/80">
            {t(
              "تحدي مدن أقلع يعرض التفاعل المجتمعي مع المنصة حسب المدن، بطريقة إجمالية وآمنة دون عرض أي بيانات شخصية. الهدف ليس المقارنة السلبية، بل تحفيز المدن على المشاركة في التوعية، دعم الإقلاع، وتدريب المتطوعين.", "The Aqla City Challenge shows community engagement by city using aggregate, privacy-safe data. The goal is not to shame or rank negatively, but to encourage awareness, cessation support, and volunteer participation."
            )}
          </p>
        </section>

        {/* Totals */}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <TotalTile label={t("التقييمات المكتملة", "Completed assessments")} value={stats?.totals?.completed_assessments ?? 0} />
          <TotalTile label={t("تعهدات الإقلاع", "Quit pledges")} value={stats?.totals?.quit_pledges ?? 0} />
          <TotalTile label={t("طلبات التطوع", "Volunteer applications")} value={stats?.totals?.volunteer_applications ?? 0} />
          <TotalTile label={t("زيارات المتابعة", "Follow-up visits")} value={stats?.totals?.follow_up_visits ?? 0} />
          <TotalTile label={t("سجلات وافقت على الاستخدام البحثي", "Research-consented")} value={stats?.totals?.research_consent ?? 0} />
          <TotalTile label={t("تعهدات هذا الأسبوع", "Pledges this week")} value={stats?.totals?.weekly_pledges ?? 0} highlight />
        </section>

        {/* Weekly challenge */}
        <section className="mt-8">
          <Card className="rounded-3xl border-0 p-6 shadow-elegant quit-gradient text-white">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <div className="text-xs uppercase tracking-wider opacity-90">{t("تحدي هذا الأسبوع", "This week's challenge")}</div>
                <div className="mt-1 text-lg font-semibold leading-7">
                  {t("أي مدينة تحقق أكبر عدد من تعهدات الإقلاع؟", "Which city can create the most quit pledges?")}
                </div>
              </div>
              <Link to="/request-support"onClick={() => trackEvent("city_challenge_pledge_cta_clicked")}>
                <Button variant="secondary"className="gap-1.5">
                  {t("أنشئ تعهدك", "Create your pledge")}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              </Link>
            </div>
          </Card>
        </section>

        {/* Leaderboard */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-primary sm:text-2xl">
            {t("المدن الأكثر تفاعلًا", "Most Engaged Cities")}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <LeaderCard icon={Sparkles}      label={t("الأعلى في التقييمات المكتملة", "Top in completed assessments")} entry={stats?.leaderboard?.top_completed ?? null} isAr={isAr} />
            <LeaderCard icon={Users}         label={t("الأعلى في طلبات التطوع", "Top in volunteer applications")}   entry={stats?.leaderboard?.top_volunteers ?? null} isAr={isAr} />
            <LeaderCard icon={HeartHandshake} label={t("الأعلى في تعهدات الإقلاع", "Top in quit pledges")}           entry={stats?.leaderboard?.top_pledges ?? null} isAr={isAr} />
            <LeaderCard icon={Trophy}        label={t("المدينة الصاعدة هذا الأسبوع", "Rising city this week")}         entry={stats?.leaderboard?.rising_weekly ?? null} isAr={isAr} />
            <LeaderCard icon={MapPin}        label={t("الأعلى في زيارات المتابعة", "Top in follow-up engagement")}    entry={stats?.leaderboard?.top_followups ?? null} isAr={isAr} />
          </div>
        </section>

        {/* Map / city grid */}
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-primary sm:text-2xl">
            {t("خريطة المدن", "City Map")}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {t("تعرض المدن ذات التفاعل الكافي فقط. تُجمع المدن الأقل من 5 تفاعلات تحت \"أخرى\"لحماية الخصوصية.", "Only cities with sufficient engagement are shown. Cities with fewer than 5 engagements are grouped under \"Other\"to protect privacy.")}
          </p>
          {isLoading ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="h-28 animate-pulse rounded-2xl border-0 bg-muted/40" />
              ))}
            </div>
          ) : (
            <CityGrid cities={stats?.cities ?? []} isAr={isAr} />
          )}
        </section>

        {/* Share */}
        <section className="mt-10">
          <Card className="rounded-3xl border-0 p-6 shadow-elegant card-gradient">
            <h3 className="text-lg font-semibold">{t("شارك التحدي", "Share the challenge")}</h3>
            <p className="mt-2 text-sm text-foreground/80">
              {t(
                "مدينتي تشارك في تحدي مدن أقلع. لنكن جزءًا من التغيير ودعم الإقلاع عن التدخين والنيكوتين.", "My city is part of the Aqla City Challenge. Let's support smoking and nicotine cessation together."
              )}
            </p>
            <ShareRow isAr={isAr} text={t(
              "مدينتي تشارك في تحدي مدن أقلع. لنكن جزءًا من التغيير ودعم الإقلاع عن التدخين والنيكوتين.", "My city is part of the Aqla City Challenge. Let's support smoking and nicotine cessation together."
            )} />
            <p className="mt-3 text-[11px] text-muted-foreground/80">
              {t("تنبيه: لا تشارك معلومات صحية خاصة إذا لم تكن مرتاحًا لذلك.", "Note: Do not share private health information unless you are comfortable doing so.")}
            </p>
          </Card>
        </section>

        {/* Policy note */}
        <Card className="mt-8 rounded-2xl border-l-4 border-l-primary p-4 card-gradient">
          <p className="text-sm leading-7 text-foreground/85">
            {t(
              "هذه المؤشرات تساعد في فهم الطلب المجتمعي على دعم الإقلاع وتحديد فرص التوسع والتوعية. لا تعرض أي بيانات شخصية.", "These indicators help demonstrate community demand for cessation support and identify opportunities for expansion and awareness. No personal data is displayed."
            )}
          </p>
        </Card>

        <VisitTracker path="/city-challenge" />
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground">
        <SocialLinks />
        <p className="mt-3">© Aqla — {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function TotalTile({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Card className={`rounded-2xl border-0 p-4 shadow-sm ${highlight ? "quit-gradient text-white": "card-gradient"}`}>
      <div className={`text-2xl font-bold tabular-nums ${highlight ? "text-white": "text-primary"}`}>
        {value.toLocaleString()}
      </div>
      <div className={`mt-1 text-[11px] leading-4 ${highlight ? "text-white/90": "text-muted-foreground"}`}>{label}</div>
    </Card>
  );
}

function LeaderCard({ icon: Icon, label, entry, isAr }:
  { icon: React.ComponentType<{ className?: string }>; label: string; entry: { city: string; count: number } | null; isAr: boolean }) {
  return (
    <Card className="rounded-2xl border-0 p-4 shadow-sm card-gradient">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl quit-gradient text-white">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="truncate text-base font-semibold">
            {entry ? displayCity(entry.city, isAr) : (isAr ? "لا بيانات بعد": "No data yet")}
          </div>
        </div>
        <div className="ms-auto text-right">
          <div className="text-lg font-bold tabular-nums text-primary">
            {entry ? entry.count.toLocaleString() : "—"}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CityGrid({ cities, isAr }: { cities: CityRow[]; isAr: boolean }) {
  const t = (ar: string, en: string) => (isAr ? ar : en);
  const max = useMemo(() => Math.max(1, ...cities.map((c) => c.city_engagement_score)), [cities]);
  if (!cities.length) {
    return (
      <Card className="mt-4 rounded-2xl border-0 p-6 card-gradient">
        <p className="text-sm text-muted-foreground">
          {t("لا توجد بيانات كافية بعد لعرض المدن. كن أول من يبدأ في مدينتك بإكمال تقييم أقلع أو تعهد الإقلاع.", "Not enough data yet to display cities. Be the first in your city — complete the Aqla assessment or a quit pledge.")}
        </p>
      </Card>
    );
  }
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cities.map((c) => {
        const pct = Math.max(8, Math.round((c.city_engagement_score / max) * 100));
        const bg = `linear-gradient(135deg, color-mix(in oklab, hsl(var(--primary)) ${Math.min(35, pct/3)}%, transparent), color-mix(in oklab, hsl(var(--primary)) 8%, transparent))`;
        return (
          <Card key={c.city} className="overflow-hidden rounded-2xl border-0 shadow-sm">
            <div className="relative p-5" style={{ background: bg }}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="truncate text-base font-semibold">{displayCity(c.city, isAr)}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    {t("درجة التفاعل", "Engagement score")}
                  </div>
                </div>
                <div className="text-2xl font-bold tabular-nums text-primary">{c.display_engagement}</div>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/40">
                <div className="h-full quit-gradient" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-foreground/80">
                <Cell label={t("تقييمات", "Assessments")} value={c.completed_assessments_count} />
                <Cell label={t("تعهدات", "Pledges")} value={c.quit_pledges_count} />
                <Cell label={t("متطوعون", "Volunteers")} value={c.volunteer_applications_count} />
                <Cell label={t("متابعات", "Follow-ups")} value={c.follow_up_visits_count} />
                <Cell label={t("هذا الأسبوع", "This week")} value={c.weekly_pledges_count} />
                <Cell label={t("استخدام بحثي", "Research-consent")} value={c.research_consent_count} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function ShareRow({ text, isAr }: { text: string; isAr: boolean }) {
  const enc = encodeURIComponent(text);
  const wa = `https://wa.me/?text=${enc}`;
  const tw = `https://x.com/intent/tweet?text=${enc}`;
  const t = (ar: string, en: string) => (isAr ? ar : en);
  async function copy() {
    try { await navigator.clipboard.writeText(text); trackEvent("share_text_copied", "city_challenge"); } catch { /* ignore */ }
  }
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <a href={wa} target="_blank"rel="noopener noreferrer"onClick={() => trackEvent("share_whatsapp_clicked", "city_challenge")}>
        <Button size="sm"variant="outline"className="gap-1.5"><MessageCircle className="h-4 w-4"/>{t("واتساب", "WhatsApp")}</Button>
      </a>
      <a href={tw} target="_blank"rel="noopener noreferrer"onClick={() => trackEvent("share_x_clicked", "city_challenge")}>
        <Button size="sm"variant="outline"className="gap-1.5"><Twitter className="h-4 w-4" />X</Button>
      </a>
      <Button size="sm"variant="outline"className="gap-1.5" onClick={copy}>
        <Copy className="h-4 w-4"/>{t("نسخ النص", "Copy text")}
      </Button>
    </div>
  );
}

// Stats type re-export for type narrowing in JSX above
export type { CityChallengeStats };
