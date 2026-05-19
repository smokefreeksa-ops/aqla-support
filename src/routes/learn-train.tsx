import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { ArrowRight, Trophy, Sparkles, Share2, BookOpen, GraduationCap, Languages, ShieldCheck } from "lucide-react";
import {
  LEARN_MODULES, BADGE_LABELS, computeBadge, currentWeeklyChallenge, pickRandomQuestions,
  type LearnQuestion,
} from "@/lib/learn-content";
import {
  getLearnPublicStats, getLearnTopLeaderboard, submitQuizAttempt, submitLeaderboardEntry,
} from "@/lib/learn.functions";
import { getAnonSessionId } from "@/lib/analytics";
import { trackEvent } from "@/lib/track-event";
import aqlaLogo from "@/assets/aqla-logo.png";

export const Route = createFileRoute("/learn-train")({
  head: () => ({
    meta: [
      { title: "Learn with Aqla — Interactive Knowledge Challenges" },
      { name: "description", content: "Short interactive lessons and knowledge challenges about smoking, nicotine, and quitting — with an optional leaderboard." },
      { property: "og:title", content: "Learn with Aqla — تعلّم مع أقلع" },
      { property: "og:description", content: "Interactive bilingual lessons and quizzes with an opt-in Top 7 leaderboard." },
    ],
  }),
  component: LearnPage,
});

function LearnPage() {
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
  const statsFn = useServerFn(getLearnPublicStats);
  const { data: statsData } = useQuery({ queryKey: ["learn-stats"], queryFn: () => statsFn(), staleTime: 60_000 });
  const stats = statsData?.stats;

  const weekly = currentWeeklyChallenge();
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  useEffect(() => { trackEvent("learn_page_viewed"); }, []);

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
              <Languages className="h-4 w-4" />{isAr ? "English" : "العربية"}
            </Button>
            <Link to="/"><Button variant="ghost" size="sm">{isAr ? "الرئيسية" : "Home"}</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <section className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
            <GraduationCap className="h-3.5 w-3.5" />
            {isAr ? "محتوى تثقيفي مجاني" : "Free educational content"}
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "تعلّم مع أقلع" : "Learn with Aqla"}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {isAr
              ? "محتوى تفاعلي قصير يساعدك على فهم التدخين والنيكوتين والإقلاع بطريقة ممتعة، مع تحديات معرفية ولوحة شرف اختيارية."
              : "Short interactive lessons to help you understand smoking, nicotine, and quitting in an engaging way, with knowledge challenges and an optional leaderboard."}
          </p>
        </section>

        {/* This week's challenge */}
        <section className="mt-8">
          <Card className="overflow-hidden rounded-3xl border-0 p-0 shadow-elegant">
            <div className="quit-gradient p-6 text-white sm:p-7">
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium">
                {isAr ? "تحدي هذا الأسبوع" : "This Week’s Challenge"}
              </span>
              <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{isAr ? weekly.ar : weekly.en}</h2>
              <Button variant="secondary" className="mt-4 gap-1.5" onClick={() => { setActiveSlug(weekly.slug); trackEvent("learn_weekly_challenge_started", weekly.slug); }}>
                {isAr ? "ابدأ التحدي" : "Start Challenge"}<ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </Card>
        </section>

        {/* KPI cards */}
        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label={isAr ? "مشاركون في التحديات" : "Knowledge challenge participants"} value={stats?.participants ?? 0} />
          <Kpi label={isAr ? "اختبارات مكتملة" : "Completed quizzes"} value={stats?.completed_quizzes ?? 0} />
          <Kpi label={isAr ? "متوسط الدرجة" : "Average score"} value={`${stats?.average_score ?? 0}/100`} />
          <Kpi label={isAr ? "شارات مكتسبة" : "Badges earned"} value={stats?.badges_earned ?? 0} />
        </section>

        {/* Modules */}
        <section className="mt-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-primary">
            <BookOpen className="h-5 w-5" />
            {isAr ? "الوحدات التثقيفية" : "Educational modules"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LEARN_MODULES.map((m) => (
              <Card key={m.slug} className="flex flex-col rounded-2xl border-0 p-5 shadow-elegant card-gradient">
                <h3 className="text-base font-semibold">{isAr ? m.title_ar : m.title_en}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{isAr ? m.subtitle_ar : m.subtitle_en}</p>
                <ul className="mt-3 list-disc space-y-1 text-xs text-foreground/80 ps-5">
                  {(isAr ? m.key_points_ar : m.key_points_en).slice(0, 3).map((p, i) => (<li key={i}>{p}</li>))}
                </ul>
                <div className="mt-3 rounded-lg bg-primary/5 p-2.5 text-xs text-foreground/80">
                  <span className="font-semibold text-primary">{isAr ? "هل تعلم؟ " : "Did you know? "}</span>
                  {isAr ? m.did_you_know_ar : m.did_you_know_en}
                </div>
                <div className="mt-auto flex gap-2 pt-4">
                  <Button size="sm" className="flex-1 quit-gradient border-0 text-white" onClick={() => { setActiveSlug(m.slug); trackEvent("learn_module_quiz_started", m.slug); }}>
                    {isAr ? "ابدأ الاختبار" : "Start quiz"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => shareModule(m.slug, isAr)}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                {m.sources.length > 0 && (
                  <div className="mt-3 text-[11px] text-muted-foreground">
                    {isAr ? "مصادر: " : "Sources: "}
                    {m.sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{s.label}{i < m.sources.length - 1 ? ", " : ""}</a>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </section>

        {/* Leaderboard */}
        <section className="mt-12">
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-primary">
            <Trophy className="h-5 w-5" />
            {isAr ? "لوحة الشرف — أفضل ٧ نتائج" : "Top 7 Knowledge Scores"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "لا تظهر في لوحة الشرف إلا النتائج التي وافق أصحابها على عرضها." : "Only users who consented to public display appear on this leaderboard."}
          </p>
          <LeaderboardSection isAr={isAr} />
        </section>

        <section className="mt-10 grid gap-3 sm:grid-cols-2">
          <Card className="rounded-2xl border-l-4 border-l-primary p-4 card-gradient">
            <p className="text-sm text-foreground/80">
              {isAr
                ? "هذه الأدوات للتثقيف العام، ولا تغني عن استشارة المختص. للحصول على دعم شخصي، يمكنك إجراء التقييم الكامل أو التواصل عبر واتساب."
                : "These tools are educational and do not replace professional advice. For personalized support, take the full assessment or contact us via WhatsApp."}
            </p>
            <div className="mt-3 flex gap-2">
              <Link to="/assessment"><Button size="sm" className="quit-gradient border-0 text-white">{isAr ? "ابدأ التقييم" : "Start Assessment"}</Button></Link>
              <Link to="/volunteer"><Button size="sm" variant="outline">{isAr ? "كن متطوعًا" : "Become a Volunteer"}</Button></Link>
            </div>
          </Card>
          <Card className="rounded-2xl border-l-4 border-l-secondary p-4">
            <p className="text-sm text-foreground/80">
              {isAr
                ? "يمكن لفريق أقلع مشاركة أو الإشارة إلى الحسابات التي وافقت على الظهور، بهدف نشر التوعية وتشجيع المشاركة المجتمعية."
                : "Aqla may share or tag users who consented to be recognized, to promote awareness and encourage community participation."}
            </p>
          </Card>
        </section>
      </main>

      {activeSlug && (
        <QuizModal slug={activeSlug} isAr={isAr} onClose={() => setActiveSlug(null)} />
      )}

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-muted-foreground">
        © Aqla — {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number | string }) {
  return (
    <Card className="rounded-2xl border-0 p-4 text-center card-gradient">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{label}</div>
    </Card>
  );
}

function LeaderboardSection({ isAr }: { isAr: boolean }) {
  const [tab, setTab] = useState<"week" | "all" | "city">("all");
  const [city, setCity] = useState("");
  const fn = useServerFn(getLearnTopLeaderboard);
  const { data, refetch } = useQuery({
    queryKey: ["learn-leaderboard", tab, tab === "city" ? city : null],
    queryFn: () => fn({ data: { window: tab === "week" ? "week" : "all", city: tab === "city" && city ? city : null } }),
    staleTime: 30_000,
  });
  const entries = data?.leaderboard?.entries ?? [];
  return (
    <div className="mt-4">
      <Tabs value={tab} onValueChange={(v) => setTab(v as "week" | "all" | "city")}>
        <TabsList>
          <TabsTrigger value="week">{isAr ? "هذا الأسبوع" : "This Week"}</TabsTrigger>
          <TabsTrigger value="all">{isAr ? "الأعلى دائمًا" : "All-Time"}</TabsTrigger>
          <TabsTrigger value="city">{isAr ? "حسب المدينة" : "By City"}</TabsTrigger>
        </TabsList>
        <TabsContent value="city" className="mt-3">
          <div className="flex gap-2">
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder={isAr ? "اكتب اسم المدينة" : "Type a city"} className="max-w-xs" />
            <Button size="sm" variant="outline" onClick={() => refetch()}>{isAr ? "بحث" : "Search"}</Button>
          </div>
        </TabsContent>
      </Tabs>
      <div className="mt-4 space-y-2">
        {entries.length === 0 && (
          <Card className="rounded-xl p-4 text-sm text-muted-foreground">{isAr ? "لا توجد نتائج للعرض بعد." : "No public results yet."}</Card>
        )}
        {entries.map((e) => {
          const medal = e.rank === 1 ? "🥇" : e.rank === 2 ? "🥈" : e.rank === 3 ? "🥉" : `#${e.rank}`;
          return (
            <Card key={`${e.rank}-${e.date}`} className="flex items-center justify-between rounded-xl border-0 p-3 shadow-sm card-gradient">
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold w-10 text-center">{medal}</div>
                <div>
                  <div className="text-sm font-semibold">{e.display_name || (isAr ? "مشارك" : "Participant")}</div>
                  <div className="text-[11px] text-muted-foreground flex gap-2">
                    {e.social_handle && <span>@{e.social_handle.replace(/^@/, "")}</span>}
                    {e.city && <span>• {e.city}</span>}
                    {e.badge && <span>• {BADGE_LABELS[e.badge]?.[isAr ? "ar" : "en"] ?? e.badge}</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold text-primary">{e.score}/100</div>
                <div className="text-[10px] text-muted-foreground">{e.date}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function shareModule(slug: string, isAr: boolean) {
  const url = `${window.location.origin}/learn`;
  const text = isAr
    ? `تعلّم مع أقلع — وحدة ${slug}. ${url}`
    : `Learn with Aqla — module ${slug}. ${url}`;
  if (navigator.share) navigator.share({ title: "Aqla Learn", text, url }).catch(() => { /* ignore */ });
  else navigator.clipboard?.writeText(text);
  trackEvent("learn_module_shared", slug);
}

function QuizModal({ slug, isAr, onClose }: { slug: string; isAr: boolean; onClose: () => void }) {
  const questions = useMemo<LearnQuestion[]>(() => pickRandomQuestions(slug, 5), [slug]);
  const [idx, setIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const submitFn = useServerFn(submitQuizAttempt);
  const submitLb = useServerFn(submitLeaderboardEntry);

  const q = questions[idx];
  const total = questions.length;
  const score = Math.round((correctCount / total) * 100);
  const badge = finished ? computeBadge(score, 1, slug === "support") : null;

  function answer(i: number) {
    if (revealed) return;
    setChosen(i);
    setRevealed(true);
    if (i === q.correct) setCorrectCount((c) => c + 1);
  }

  async function next() {
    if (idx + 1 < total) {
      setIdx(idx + 1); setChosen(null); setRevealed(false);
    } else {
      setFinished(true);
      const duration = Math.round((Date.now() - startedAt) / 1000);
      const sid = getAnonSessionId();
      try {
        const res = await submitFn({ data: {
          module_slug: slug, score, total_questions: total, correct_answers: correctCount,
          duration_seconds: duration, anonymous_session_id: sid,
        }});
        if (res.ok) setAttemptId(res.attempt_id);
      } catch (e) { console.error(e); }
      trackEvent("learn_quiz_completed", `${slug}:${score}`);
      setShowConsent(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 sm:items-center" onClick={onClose}>
      <Card className="w-full max-w-lg rounded-2xl border-0 p-5 shadow-elegant" onClick={(e) => e.stopPropagation()}>
        {!finished && q && (
          <>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{isAr ? "سؤال" : "Question"} {idx + 1}/{total}</span>
              <button onClick={onClose} aria-label="close" className="rounded p-1 hover:bg-muted">✕</button>
            </div>
            <Progress value={((idx + (revealed ? 1 : 0)) / total) * 100} className="mt-2" />
            <h3 className="mt-4 text-base font-semibold">{isAr ? q.question_ar : q.question_en}</h3>
            <div className="mt-3 space-y-2">
              {(isAr ? q.options_ar : q.options_en).map((opt, i) => {
                const isCorrect = i === q.correct;
                const isChosen = i === chosen;
                const cls = !revealed
                  ? "border-input hover:border-primary"
                  : isCorrect ? "border-green-500 bg-green-500/10"
                  : isChosen ? "border-red-500 bg-red-500/10"
                  : "border-input opacity-60";
                return (
                  <button key={i} onClick={() => answer(i)} className={`w-full rounded-lg border p-3 text-start text-sm transition ${cls}`}>{opt}</button>
                );
              })}
            </div>
            {revealed && (
              <div className="mt-3 rounded-lg bg-muted/50 p-3 text-xs">
                <div className="font-semibold">{chosen === q.correct ? (isAr ? "إجابة صحيحة." : "Correct.") : (isAr ? "إجابة غير صحيحة." : "Not quite.")}</div>
                <div className="mt-1 text-muted-foreground">{isAr ? q.explanation_ar : q.explanation_en}</div>
                <Button size="sm" className="mt-3 quit-gradient border-0 text-white" onClick={next}>
                  {idx + 1 < total ? (isAr ? "التالي" : "Next") : (isAr ? "إنهاء" : "Finish")}
                </Button>
              </div>
            )}
          </>
        )}
        {finished && (
          <FinishView slug={slug} isAr={isAr} score={score} badge={badge} attemptId={attemptId} onClose={onClose} showConsent={showConsent} submitLb={submitLb} duration={Math.round((Date.now() - startedAt) / 1000)} />
        )}
      </Card>
    </div>
  );
}

function FinishView({ slug, isAr, score, badge, attemptId, onClose, showConsent, submitLb, duration }: {
  slug: string; isAr: boolean; score: number; badge: string | null; attemptId: string | null;
  onClose: () => void; showConsent: boolean;
  submitLb: ReturnType<typeof useServerFn<typeof submitLeaderboardEntry>>;
  duration: number;
}) {
  const [mode, setMode] = useState<"nickname" | "social" | "private" | null>(null);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [city, setCity] = useState("");
  const [under18, setUnder18] = useState(false);
  const [agree, setAgree] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  async function submit() {
    if (!agree || mode === "private" || mode === null) { setSubmitted(true); return; }
    try {
      const res = await submitLb({ data: {
        quiz_attempt_id: attemptId, module_slug: slug, score, duration_seconds: duration,
        display_name: name.trim() || null,
        social_handle: mode === "social" && !under18 ? (handle.trim() || null) : null,
        city: city.trim() || null, badge: badge ?? null,
        consent_public_display: true,
        consent_social_tag: mode === "social" && !under18,
        is_under_18: under18,
      }});
      setPending(!!res.pending);
      setSubmitted(true);
      trackEvent("learn_leaderboard_submitted", mode);
    } catch (e) { console.error(e); }
  }

  const shareText = isAr
    ? `أنهيت تحدي المعرفة في أقلع وحصلت على ${score}/100. اختبر معرفتك أنت أيضًا: ${window.location.origin}/learn`
    : `I completed the Aqla Knowledge Challenge and scored ${score}/100. Test your knowledge too: ${window.location.origin}/learn`;

  return (
    <div>
      <div className="text-center">
        <Sparkles className="mx-auto h-8 w-8 text-primary" />
        <h3 className="mt-2 text-xl font-bold">{score}/100</h3>
        {badge && <Badge className="mt-2">{BADGE_LABELS[badge]?.[isAr ? "ar" : "en"] ?? badge}</Badge>}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(shareText); trackEvent("learn_share_copy"); }}>
          <Share2 className="h-4 w-4" />{isAr ? "نسخ" : "Copy"}
        </Button>
        <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("learn_share_whatsapp")}>
          <Button size="sm" variant="outline">WhatsApp</Button>
        </a>
        <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("learn_share_x")}>
          <Button size="sm" variant="outline">X</Button>
        </a>
      </div>

      {showConsent && !submitted && (
        <div className="mt-5 space-y-3 rounded-xl bg-muted/40 p-4">
          <div className="text-sm font-semibold">{isAr ? "هل ترغب في الظهور في لوحة الشرف؟" : "Would you like to appear on the leaderboard?"}</div>
          <div className="grid gap-2 sm:grid-cols-3">
            <Button size="sm" variant={mode === "nickname" ? "default" : "outline"} onClick={() => setMode("nickname")}>{isAr ? "اسم مستعار" : "Nickname"}</Button>
            <Button size="sm" variant={mode === "social" ? "default" : "outline"} onClick={() => setMode("social")}>{isAr ? "حساب التواصل" : "Social handle"}</Button>
            <Button size="sm" variant={mode === "private" ? "default" : "outline"} onClick={() => { setMode("private"); setAgree(true); }}>{isAr ? "احتفاظ خاص" : "Keep private"}</Button>
          </div>
          {(mode === "nickname" || mode === "social") && (
            <div className="space-y-2">
              <Input placeholder={isAr ? "اكتب اسمًا مستعارًا للعرض" : "Enter a display nickname"} value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
              {mode === "social" && (
                <Input placeholder={isAr ? "حسابك في وسائل التواصل (اختياري)" : "Your social handle (optional)"} value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={60} />
              )}
              <Input placeholder={isAr ? "المدينة (اختياري)" : "City (optional)"} value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} />
              <label className="flex items-center gap-2 text-xs"><Checkbox checked={under18} onCheckedChange={(v) => setUnder18(Boolean(v))} />{isAr ? "أقل من 18 عامًا" : "Under 18"}</label>
              {mode === "social" && under18 && (
                <p className="text-[11px] text-amber-700">{isAr ? "لن يتم عرض حساب التواصل لمن هم دون 18 عامًا." : "Social handles are not shown for users under 18."}</p>
              )}
              <label className="flex items-start gap-2 text-xs"><Checkbox checked={agree} onCheckedChange={(v) => setAgree(Boolean(v))} />
                {isAr ? "أوافق على عرض اسمي المستعار أو حسابي في لوحة الشرف العامة في منصة أقلع." : "I agree for my nickname or social media handle to appear publicly on Aqla’s leaderboard."}
              </label>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground"><ShieldCheck className="inline h-3 w-3 me-1" />{isAr ? "لا تشارك أي معلومات صحية خاصة إذا لم تكن مرتاحًا لذلك." : "Do not share private health information unless you are comfortable doing so."}</p>
          <div className="flex gap-2">
            <Button size="sm" className="quit-gradient border-0 text-white" onClick={submit} disabled={!mode || (mode !== "private" && !agree)}>{isAr ? "إرسال" : "Submit"}</Button>
            <Button size="sm" variant="outline" onClick={onClose}>{isAr ? "إغلاق" : "Close"}</Button>
          </div>
        </div>
      )}
      {submitted && (
        <div className="mt-4 rounded-xl bg-primary/10 p-3 text-xs text-foreground/80">
          {mode === "private" || !mode
            ? (isAr ? "تم حفظ نتيجتك بشكل خاص." : "Your score has been kept private.")
            : pending
              ? (isAr ? "تم استلام مشاركتك وستظهر بعد المراجعة." : "Submitted — your entry will appear after review.")
              : (isAr ? "تمت إضافتك إلى لوحة الشرف!" : "You’ve been added to the leaderboard!")}
          <div className="mt-3"><Button size="sm" variant="outline" onClick={onClose}>{isAr ? "إغلاق" : "Close"}</Button></div>
        </div>
      )}
    </div>
  );
}
