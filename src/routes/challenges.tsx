import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import {
  Languages, ArrowRight, ShieldAlert, Sparkles, Calculator,
  MapPin, Award, Share2, BookOpen, GraduationCap, Trophy,
  Target, Coins, MessageCircleHeart, Megaphone, ShieldCheck,
} from "lucide-react";
import { trackEvent } from "@/lib/track-event";
import { VisitTracker } from "@/components/VisitTracker";
import aqlaLogo from "@/assets/aqla-logo.png";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getChallengePublicStats } from "@/lib/challenges.functions";

export const TABS = ["all", "tools", "challenges", "cities", "points", "learn", "posters", "volunteers"] as const;
type TabKey = (typeof TABS)[number];

export const Route = createFileRoute("/challenges")({
  validateSearch: (search: { tab?: unknown }): { tab?: TabKey } => {
    const raw = typeof search.tab === "string" ? search.tab : "all";
    const tab = (TABS as readonly string[]).includes(raw) ? (raw as TabKey) : "all";
    return { tab };
  },
  head: () => ({
    meta: [
      { title: "Aqla Challenge Hub — مركز تحديات أقلع" },
      { name: "description", content: "Aqla tools, challenges, city map, medals, friend invites, and awareness posters — all in one privacy-safe hub." },
      { property: "og:title", content: "Aqla Challenge Hub" },
      { property: "og:description", content: "One place for Aqla tools, challenges, leaderboards, and awareness sharing." },
    ],
  }),
  component: PageWrap,
});

function PageWrap() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <HubPage />
    </LangContext.Provider>
  );
}

function HubPage() {
  const { lang, setLang, dir, t } = useLang();
  const isAr = lang === "ar";
  const { tab = "all" } = Route.useSearch();
  const navigate = useNavigate({ from: "/challenges" });

  useEffect(() => { trackEvent("challenge_hub_viewed"); }, []);

  const setTab = (next: TabKey) => {
    trackEvent("challenge_tab_selected", next);
    navigate({ search: { tab: next } });
  };

  const statsFn = useServerFn(getChallengePublicStats);
  const { data: stats } = useQuery({
    queryKey: ["challenge-hub-public-stats"],
    queryFn: () => statsFn(),
    staleTime: 60_000,
  });

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <Header lang={lang} setLang={setLang} isAr={isAr} t={t} />
      <VisitTracker path="/challenges" />

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {/* Hero */}
        <section className="text-center">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            <ShieldCheck className="me-1 inline h-3.5 w-3.5" />
            {isAr ? "شارك بالوعي، لا بمعلوماتك الصحية" : "Share awareness, not private health data"}
          </Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl text-primary">
            {isAr ? "مركز تحديات أقلع" : "Aqla Challenge Hub"}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-muted-foreground sm:text-lg">
            {isAr
              ? "مكان واحد يجمع أدوات أقلع، التحديات، خريطة المدن، الأوسمة، دعوة الأصدقاء، والبطاقات التوعوية. شارك، تعلّم، اجمع النقاط، وساعد في نشر الوعي دون عرض أي بيانات شخصية."
              : "One place for Aqla tools, challenges, city map, medals, friend invites, and awareness cards. Participate, learn, collect points, and help spread awareness without displaying personal data."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button onClick={() => { setTab("challenges"); trackEvent("knowledge_challenge_started"); }} className="quit-gradient border-0 text-white"><Trophy className="h-4 w-4"/>{isAr ? "ابدأ تحدي المعرفة" : "Start Knowledge Challenge"}</Button>
            <Button variant="outline" onClick={() => { setTab("points"); trackEvent("points_page_opened"); }}><Share2 className="h-4 w-4"/>{isAr ? "ادعُ أصدقاءك" : "Invite Friends"}</Button>
            <Link to="/poster-studio" onClick={() => trackEvent("poster_studio_opened")}>
              <Button variant="outline"><Megaphone className="h-4 w-4"/>{isAr ? "صمم منشورك" : "Create Poster"}</Button>
            </Link>
            <Link to="/city-challenge" onClick={() => trackEvent("city_challenge_opened")}>
              <Button variant="outline"><MapPin className="h-4 w-4"/>{isAr ? "شاهد تحدي المدن" : "View City Challenge"}</Button>
            </Link>
            <Link to="/assessment" onClick={() => trackEvent("start_assessment_clicked_from_challenges")}>
              <Button variant="secondary"><Sparkles className="h-4 w-4"/>{isAr ? "ابدأ تقييم أقلع" : "Start Aqla Assessment"}</Button>
            </Link>
          </div>
        </section>

        {/* Aggregate KPIs */}
        <section className="mt-10">
          <Card className="rounded-3xl border-0 p-5 sm:p-7 shadow-elegant card-gradient">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Kpi label={isAr ? "المشاركات في التحديات" : "Challenge participations"} value={stats?.stats?.total_pledges ?? 0} />
              <Kpi label={isAr ? "الملصقات التوعوية المنشأة" : "Awareness posters created"} value={(stats?.stats as any)?.posters_created ?? 0} />
              <Kpi label={isAr ? "روابط الدعوة" : "Invite links created"} value={(stats?.stats as any)?.invite_links_created ?? 0} />
              <Kpi label={isAr ? "النقاط المكتسبة" : "Points earned"} value={(stats?.stats as any)?.points_earned ?? 0} />
              <Kpi label={isAr ? "الأوسمة الممنوحة" : "Medals awarded"} value={(stats?.stats as any)?.medals_awarded ?? 0} />
              <Kpi label={isAr ? "الاختبارات المعرفية المكتملة" : "Knowledge quizzes completed"} value={(stats?.stats as any)?.quizzes_completed ?? 0} />
              <Kpi label={isAr ? "المدن المشاركة" : "Cities participating"} value={stats?.stats?.cities_participating ?? 0} />
              <Kpi label={isAr ? "مشاركات واتساب و X" : "WhatsApp & X shares"} value={(stats?.stats?.whatsapp_shares ?? 0) + (stats?.stats?.x_shares ?? 0)} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              {isAr ? "جميع المؤشرات معروضة بشكل إجمالي ودون عرض أي بيانات شخصية." : "All indicators are displayed in aggregate without personal data."}
            </p>
          </Card>
        </section>

        {/* Tabs */}
        <section className="mt-10">
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
            <TabsList className="flex w-full flex-wrap h-auto justify-center gap-1 bg-muted/40">
              <TabsTrigger value="all">{isAr ? "الكل" : "All"}</TabsTrigger>
              <TabsTrigger value="tools">{isAr ? "الأدوات" : "Tools"}</TabsTrigger>
              <TabsTrigger value="challenges">{isAr ? "التحديات" : "Challenges"}</TabsTrigger>
              <TabsTrigger value="cities">{isAr ? "المدن" : "Cities"}</TabsTrigger>
              <TabsTrigger value="points">{isAr ? "النقاط والأوسمة" : "Points & Medals"}</TabsTrigger>
              <TabsTrigger value="learn">{isAr ? "التثقيف" : "Learn"}</TabsTrigger>
              <TabsTrigger value="posters">{isAr ? "المنشورات" : "Posters"}</TabsTrigger>
              <TabsTrigger value="volunteers">{isAr ? "المتطوعون" : "Volunteers"}</TabsTrigger>
            </TabsList>

            {TABS.map((k) => (
              <TabsContent key={k} value={k} className="mt-6">
                <FeatureGrid isAr={isAr} tab={k} />
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* Leaderboards */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight text-primary">{isAr ? "لوحات الشرف" : "Leaderboards"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <LeaderboardCard
              title={isAr ? "أفضل ٧ نتائج في تحدي المعرفة" : "Top 7 Knowledge Scores"}
              note={isAr ? "تظهر فقط الأسماء التي وافقت على العرض العلني." : "Only consented entries are shown."}
              href="/learn-train"
              icon={<Trophy className="h-5 w-5" />}
            />
            <LeaderboardCard
              title={isAr ? "أفضل ٧ أوسمة توعوية" : "Top 7 Awareness Medals"}
              note={isAr ? "تتطلب الموافقة على العرض، ومراجعة الإدارة لمعرّفات وسائل التواصل." : "Requires display consent and admin approval for social handles."}
              href="/learn-train"
              icon={<Award className="h-5 w-5" />}
            />
            <LeaderboardCard
              title={isAr ? "المدن الأكثر تفاعلًا" : "Most Engaged Cities"}
              note={isAr ? "تُعرض الأرقام بشكل إجمالي، والمدن التي تقل عن ٥ تُجمَّع." : "Aggregate only — cities below 5 are grouped."}
              href="/city-challenge"
              icon={<MapPin className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Points explainer */}
        <section className="mt-12">
          <Card className="rounded-3xl border-0 p-6 sm:p-8 shadow-elegant card-gradient">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl quit-gradient text-white shadow-md">
                <Coins className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold text-primary">{isAr ? "كيف تجمع النقاط؟" : "How to collect points"}</h2>
            </div>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {(isAr
                ? [
                    "أكمل تحدي المعرفة",
                    "صمم منشورًا توعويًا",
                    "شارك رابط الدعوة",
                    "أنشئ وعد إقلاع",
                    "ساعد شخصًا برسالة دعم",
                    "أكمل تدريب المتطوعين",
                    "شارك تحدي مدينتك",
                  ]
                : [
                    "Complete a knowledge challenge",
                    "Create an awareness poster",
                    "Share your invite link",
                    "Create a quit pledge",
                    "Help someone with a support message",
                    "Complete volunteer training",
                    "Share your city challenge",
                  ]
              ).map((it, i) => (
                <li key={i} className="rounded-xl border bg-card/70 px-3 py-2 text-sm">{it}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-xl bg-primary-soft/70 p-3 text-sm text-foreground/80">
              {isAr
                ? "النقاط تكافئ نشر الوعي والمشاركة المجتمعية، ولا تعتمد على الحالة الصحية أو سرعة الإقلاع."
                : "Points reward awareness and community participation, not health status or quitting speed."}
            </p>
          </Card>
        </section>

        {/* Safety */}
        <section className="mt-12">
          <Card className="rounded-2xl border-l-4 border-l-destructive p-4">
            <div className="flex gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm leading-7">
                {isAr
                  ? "هذه التحديات للتوعية والدعم المجتمعي فقط. لا تمثل تشخيصًا أو علاجًا أو نصيحة طبية شخصية. إذا كنت تعاني من أعراض طارئة مثل ألم شديد في الصدر أو ضيق تنفس شديد، فاطلب الرعاية الطبية العاجلة."
                  : "These challenges are for awareness and community support only. They are not diagnosis, treatment, or personal medical advice. If you have urgent symptoms such as severe chest pain or severe shortness of breath, seek urgent medical care."}
              </p>
            </div>
          </Card>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground">
        <p>© {t.brandShort} — {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function Header({ lang, setLang, isAr, t }: { lang: "ar" | "en"; setLang: (l: "ar" | "en") => void; isAr: boolean; t: { adminLogin: string; brandShort: string } }) {
  return (
    <header className="border-b bg-card/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src={aqlaLogo} alt="Aqla — أقلع logo" className="h-[38px] w-auto object-contain sm:h-12" />
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">{t.brandShort}</div>
            <div className="text-[11px] text-muted-foreground">Aqla — أقلع</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="gap-1.5">
            <Languages className="h-4 w-4" />{lang === "ar" ? "English" : "العربية"}
          </Button>
          <Link to="/challenges"><Button variant="ghost" size="sm">{isAr ? "تحديات أقلع" : "Challenges"}</Button></Link>
          <Link to="/about"><Button variant="ghost" size="sm">{isAr ? "عن أقلع" : "About"}</Button></Link>
          <Link to="/auth"><Button variant="outline" size="sm">{t.adminLogin}</Button></Link>
        </div>
      </div>
    </header>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-background/60 p-3">
      <div className="text-2xl font-bold text-primary">{Number(value || 0).toLocaleString()}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function LeaderboardCard({ title, note, href, icon }: { title: string; note: string; href: string; icon: React.ReactNode }) {
  return (
    <Card className="group h-full rounded-2xl border-0 p-5 shadow-elegant card-gradient">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl quit-gradient text-white shadow-md">{icon}</div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{note}</p>
      <Link to={href} className="mt-4 inline-flex"><Button size="sm" variant="outline">{href === "/city-challenge" ? "Open" : "Open"}<ArrowRight className="h-4 w-4 rtl:rotate-180" /></Button></Link>
    </Card>
  );
}

type Feat = {
  key: TabKey;
  icon: React.ComponentType<{ className?: string }>;
  titleAr: string; titleEn: string;
  bodyAr: string; bodyEn: string;
  href: string;
  ctaAr: string; ctaEn: string;
  event?: string;
};

const FEATURES: Feat[] = [
  { key: "tools", icon: Calculator, titleAr: "أدوات أقلع التفاعلية", titleEn: "Aqla Interactive Tools", bodyAr: "حاسبة تكلفة التدخين، فحص الاعتماد بدقيقة، تحدي التنفس، خريطة المحفزات، مقياس الاستعداد، ووعد الإقلاع.", bodyEn: "Smoking cost calculator, 1-minute dependence check, breath awareness, trigger map, readiness meter, and quit pledge.", href: "/request-support", ctaAr: "جرّب الأدوات", ctaEn: "Try Tools", event: "challenge_card_clicked" },
  { key: "cities", icon: MapPin, titleAr: "تحدي مدن أقلع", titleEn: "Aqla City Challenge", bodyAr: "أي مدينة تقود التغيير؟ خريطة تعهدات وأكثر المدن تفاعلًا.", bodyEn: "Which city is leading the change? Pledge map and most-engaged cities.", href: "/city-challenge", ctaAr: "شاهد خريطة التحدي", ctaEn: "View City Map", event: "city_challenge_opened" },
  { key: "points", icon: Award, titleAr: "نقاط وأوسمة أقلع", titleEn: "Aqla Points & Medals", bodyAr: "اجمع النقاط من التوعية ومشاركة الروابط وإكمال التحديات ودعم الآخرين.", bodyEn: "Collect points by spreading awareness, sharing links, completing challenges, and supporting others.", href: "/challenges?tab=points", ctaAr: "ابدأ جمع النقاط", ctaEn: "Start Collecting Points", event: "points_page_opened" },
  { key: "points", icon: Share2, titleAr: "ادعُ أصدقاءك", titleEn: "Invite Friends", bodyAr: "شارك رابطك الخاص، وكل مشاركة توعوية أو تقييم مكتمل عبر رابطك يضيف إلى أثر أقلع المجتمعي.", bodyEn: "Share your invite link. Awareness actions and completed assessments through your link add to Aqla's community impact.", href: "/challenges?tab=points", ctaAr: "أنشئ رابط الدعوة", ctaEn: "Create Invite Link", event: "invite_link_created" },
  { key: "challenges", icon: Trophy, titleAr: "تحدي المعرفة", titleEn: "Knowledge Challenge", bodyAr: "اختبر معرفتك حول التدخين والنيكوتين، واجمع النقاط، وادخل لوحة الشرف إذا رغبت.", bodyEn: "Test your knowledge about smoking and nicotine, collect points, and join the leaderboard if you choose.", href: "/learn-train", ctaAr: "ابدأ التحدي المعرفي", ctaEn: "Start Knowledge Challenge", event: "knowledge_challenge_started" },
  { key: "challenges", icon: Target, titleAr: "تحدي أقلع 28 يوم", titleEn: "Aqla 28-Day Challenge", bodyAr: "ابدأ بخطوة صغيرة، تابع تقدمك، واجمع شارات الإنجاز.", bodyEn: "Start with one small step, track progress, and collect achievement badges.", href: "/request-support", ctaAr: "ابدأ التحدي", ctaEn: "Start Challenge" },
  { key: "posters", icon: Megaphone, titleAr: "استوديو أقلع للتوعية", titleEn: "Aqla Poster Studio", bodyAr: "صمم منشورًا توعويًا باسمك أو اسم مستعار، وشاركه لنشر الوعي.", bodyEn: "Create a personalized awareness poster with your name or nickname and share it.", href: "/poster-studio", ctaAr: "صمم منشورك", ctaEn: "Create Poster", event: "poster_studio_opened" },
  { key: "challenges", icon: MessageCircleHeart, titleAr: "ساعد شخصًا تحبه", titleEn: "Help Someone Quit", bodyAr: "اختر الموقف، واحصل على رسالة دعم جاهزة للمشاركة دون ضغط أو لوم.", bodyEn: "Choose the situation and get a supportive message to share without pressure or blame.", href: "/request-support", ctaAr: "أنشئ رسالة دعم", ctaEn: "Create Support Message", event: "help_someone_opened" },
  { key: "challenges", icon: MessageCircleHeart, titleAr: "أرسل رسالة لشخص يهمك", titleEn: "Send a Message to Someone You Care About", bodyAr: "اكتب اسم الشخص، أضف رسالتك، وصمّم بطاقة دعم بشعار أقلع يمكن إرسالها عبر واتساب أو الرسائل.", bodyEn: "Add the person's name, write your message, and create an Aqla-branded support card to send by WhatsApp or SMS.", href: "/support-invite", ctaAr: "ابدأ الرسالة", ctaEn: "Start message", event: "support_invite_opened" },
  { key: "volunteers", icon: GraduationCap, titleAr: "أثر المتطوعين", titleEn: "Volunteer Impact", bodyAr: "للمتطوعين: اجمع النقاط من التدريب، نشر الوعي، مشاركة الروابط، ودعم الآخرين.", bodyEn: "For volunteers: collect points through training, awareness sharing, referral links, and support actions.", href: "/training", ctaAr: "ابدأ مسار المتطوعين", ctaEn: "Start Volunteer Pathway", event: "volunteer_pathway_clicked_from_challenges" },
  { key: "learn", icon: BookOpen, titleAr: "تعلم أقلع", titleEn: "Aqla Learn", bodyAr: "وحدات تثقيفية، اختبارات، وشارات لفهم التدخين والنيكوتين.", bodyEn: "Educational modules, quizzes, and badges to understand smoking and nicotine.", href: "/learn-train", ctaAr: "ابدأ التعلم", ctaEn: "Start Learning" },
];

function FeatureGrid({ isAr, tab }: { isAr: boolean; tab: TabKey }) {
  const items = tab === "all" ? FEATURES : FEATURES.filter((f) => f.key === tab);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((f, i) => (
        <Card key={i} className="flex h-full flex-col rounded-2xl border-0 p-5 shadow-elegant card-gradient transition-transform hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl quit-gradient text-white shadow-md">
              <f.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold">{isAr ? f.titleAr : f.titleEn}</h3>
          </div>
          <p className="mt-3 flex-1 text-sm text-muted-foreground leading-6">{isAr ? f.bodyAr : f.bodyEn}</p>
          <div className="mt-4">
            <Link to={f.href} onClick={() => { if (f.event) trackEvent(f.event); trackEvent("challenge_card_clicked", f.titleEn); }}>
              <Button size="sm" className="quit-gradient border-0 text-white">
                {isAr ? f.ctaAr : f.ctaEn}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
