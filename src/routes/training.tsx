import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TRAINING_MODULES, TOTAL_QUESTIONS, TOTAL_CASES, MODULE_PASS, OVERALL_PASS } from "@/lib/training-content";
import { registerTrainee, submitModuleScore, getTraineeProgress, issueTrainingCertificate } from "@/lib/training.functions";
import { CheckCircle2, Lock, Trophy, BookOpen, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/training")({
  head: () => ({
    meta: [
      { title: "Aqla Volunteer Training — تدريب متطوعي أقلع" },
      { name: "description", content: "Interactive volunteer training for awareness, support, and safe referral — 7 modules, 49 questions, applied scenarios, certificate of completion." },
      { property: "og:title", content: "Aqla Volunteer Training" },
      { property: "og:description", content: "Bilingual interactive training preparing volunteers for awareness and safe referral." },
    ],
  }),
  component: TrainingPage,
});

type Lang = "ar" | "en";
type Trainee = { id: string; full_name: string; email: string; preferred_language: string };

const STORE_KEY = "aqla_trainee_v1";

function TrainingPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const dir = lang === "ar" ? "rtl" : "ltr";
  const [trainee, setTrainee] = useState<Trainee | null>(null);
  const [progress, setProgress] = useState<Record<string, { score: number; completed: boolean; attempts: number }>>({});
  const [certificate, setCertificate] = useState<{ certificate_code: string; overall_score: number; issued_at: string; is_valid: boolean } | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);

  const registerFn = useServerFn(registerTrainee);
  const submitFn = useServerFn(submitModuleScore);
  const progressFn = useServerFn(getTraineeProgress);
  const issueFn = useServerFn(issueTrainingCertificate);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const t = JSON.parse(raw) as Trainee;
        setTrainee(t);
        if (t.preferred_language === "en" || t.preferred_language === "ar") setLang(t.preferred_language);
      }
    } catch { /* noop */ }
  }, []);

  useEffect(() => {
    if (!trainee) return;
    (async () => {
      const res = await progressFn({ data: { training_user_id: trainee.id } });
      setProgress(res.progress);
      setCertificate(res.certificate ?? null);
    })();
  }, [trainee, progressFn]);

  const completedCount = Object.values(progress).filter((p) => p.completed).length;
  const allCompleted = completedCount === TRAINING_MODULES.length;
  const overall = TRAINING_MODULES.length > 0
    ? Math.round(TRAINING_MODULES.reduce((s, m) => s + (progress[m.slug]?.score ?? 0), 0) / TRAINING_MODULES.length)
    : 0;
  const canIssue = allCompleted && overall >= OVERALL_PASS && !certificate;

  async function handleIssue() {
    if (!trainee) return;
    const res = await issueFn({ data: { training_user_id: trainee.id, overall_score: overall } });
    if (!res.ok) { toast.error(res.error); return; }
    toast.success(lang === "ar" ? "تم إصدار الشهادة" : "Certificate issued");
    const r = await progressFn({ data: { training_user_id: trainee.id } });
    setCertificate(r.certificate ?? null);
  }

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-semibold text-primary">Aqla — أقلع</Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")}>
              {lang === "ar" ? "English" : "العربية"}
            </Button>
            <Link to="/"><Button variant="outline" size="sm">{lang === "ar" ? "الرئيسية" : "Home"}</Button></Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {lang === "ar" ? "تدريب متطوعي أقلع" : "Aqla Volunteer Training"}
          </h1>
          <p className="mx-auto max-w-3xl text-muted-foreground">
            {lang === "ar"
              ? "برنامج تدريبي تفاعلي لإعداد المتطوعين على التوعية، المساندة، الإحالة الآمنة، وفهم أساسيات التدخين والنيكوتين دون تقديم تشخيص أو علاج."
              : "An interactive training program preparing volunteers for awareness, support, safe referral, and understanding smoking and nicotine basics without providing diagnosis or treatment."}
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <Badge variant="secondary">{lang === "ar" ? "٧ وحدات تدريبية" : "7 modules"}</Badge>
            <Badge variant="secondary">{lang === "ar" ? `${TOTAL_QUESTIONS} سؤالًا` : `${TOTAL_QUESTIONS} questions`}</Badge>
            <Badge variant="secondary">{lang === "ar" ? `${TOTAL_CASES} سيناريو تطبيقي` : `${TOTAL_CASES} applied scenarios`}</Badge>
            <Badge variant="secondary">{lang === "ar" ? "شهادة إتمام" : "Certificate of completion"}</Badge>
          </div>
        </div>

        {!trainee ? (
          <RegistrationForm
            lang={lang}
            onRegistered={(t) => {
              setTrainee(t);
              try { localStorage.setItem(STORE_KEY, JSON.stringify(t)); } catch { /* noop */ }
            }}
            registerFn={registerFn}
          />
        ) : (
          <>
            <Card className="p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-sm text-muted-foreground">{lang === "ar" ? "المتدرّب" : "Trainee"}</div>
                  <div className="font-semibold">{trainee.full_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">{lang === "ar" ? "المعدّل" : "Overall"}</div>
                  <div className="text-2xl font-bold">{overall}%</div>
                </div>
              </div>
              <Progress value={(completedCount / TRAINING_MODULES.length) * 100} />
              <div className="text-xs text-muted-foreground">
                {lang === "ar" ? `أكملت ${completedCount}/${TRAINING_MODULES.length} وحدات` : `Completed ${completedCount}/${TRAINING_MODULES.length} modules`}
              </div>

              {certificate ? (
                <div className="flex flex-wrap items-center gap-3 rounded-md border border-green-200 bg-green-50 p-3 text-green-900">
                  <Trophy className="h-5 w-5" />
                  <div className="text-sm">
                    <div className="font-semibold">{lang === "ar" ? "تم إصدار شهادتك" : "Your certificate is issued"}</div>
                    <div className="opacity-80">{certificate.certificate_code} · {certificate.overall_score}%</div>
                  </div>
                  <Link to="/certificate/$code" params={{ code: certificate.certificate_code }} className="ms-auto">
                    <Button size="sm">{lang === "ar" ? "عرض الشهادة" : "View certificate"} <ArrowRight className="ms-1 h-4 w-4" /></Button>
                  </Link>
                </div>
              ) : canIssue ? (
                <Button onClick={handleIssue} className="w-full sm:w-auto">
                  <Trophy className="me-2 h-4 w-4" />
                  {lang === "ar" ? "إصدار الشهادة" : "Issue certificate"}
                </Button>
              ) : (
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  {lang === "ar"
                    ? `لم يتم فتح الشهادة بعد. أكمل جميع الوحدات بمعدل ${OVERALL_PASS}٪ أو أعلى.`
                    : `Certificate not unlocked yet. Complete all modules with ${OVERALL_PASS}% or higher.`}
                </div>
              )}
            </Card>

            <div className="grid gap-3">
              {TRAINING_MODULES.map((m) => {
                const p = progress[m.slug];
                const done = p?.completed ?? false;
                return (
                  <Card key={m.slug} className="p-4">
                    <button
                      type="button"
                      onClick={() => setActiveSlug(activeSlug === m.slug ? null : m.slug)}
                      className="w-full flex items-center justify-between gap-3 text-start"
                    >
                      <div className="flex items-center gap-3">
                        {done ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <BookOpen className="h-5 w-5 text-primary" />}
                        <div>
                          <div className="font-semibold">
                            {m.number}. {lang === "ar" ? m.title_ar : m.title_en}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {lang === "ar" ? m.subtitle_ar : m.subtitle_en}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm">
                        {p ? <Badge variant={done ? "default" : "secondary"}>{p.score}%</Badge> : <Badge variant="outline">{lang === "ar" ? "لم تبدأ" : "Not started"}</Badge>}
                      </div>
                    </button>
                    {activeSlug === m.slug && (
                      <ModulePanel
                        lang={lang}
                        moduleSlug={m.slug}
                        traineeId={trainee.id}
                        onScoreSubmitted={async () => {
                          const r = await progressFn({ data: { training_user_id: trainee.id } });
                          setProgress(r.progress);
                          setCertificate(r.certificate ?? null);
                        }}
                        submitFn={submitFn}
                      />
                    )}
                  </Card>
                );
              })}
            </div>

            <Card className="p-4 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="h-4 w-4" /> {lang === "ar" ? "إخلاء مسؤولية" : "Disclaimer"}
              </div>
              <p>{lang === "ar"
                ? "هذا التدريب للتوعية والمساندة المجتمعية فقط. لا يخوّل المتدرّب لتقديم تشخيص أو علاج أو وصف أدوية أو بدائل نيكوتين."
                : "This training is for awareness and community support only. It does not authorize diagnosis, treatment, prescribing, or recommending nicotine replacement products."}</p>
              <p className="opacity-70">
                {lang === "ar" ? "محتوى التدريب مبني على مصادر معتمدة في الصحة العامة وعلاج التبغ:" : "Training content is informed by recognized tobacco cessation and public-health education resources:"}
                {" "}
                <a className="underline" target="_blank" rel="noreferrer" href="https://www.who.int/publications/i/item/9789240096431">WHO</a>{" · "}
                <a className="underline" target="_blank" rel="noreferrer" href="https://www.nice.org.uk/guidance/ng209">NICE NG209</a>{" · "}
                <a className="underline" target="_blank" rel="noreferrer" href="https://www.ncsct.co.uk/publications/VBA_2021">NCSCT</a>{" · "}
                <a className="underline" target="_blank" rel="noreferrer" href="https://www.cdc.gov/tobacco/campaign/tips/quit-smoking/index.html">CDC</a>{" · "}
                <a className="underline" target="_blank" rel="noreferrer" href="https://smokefree.gov/">Smokefree.gov</a>
              </p>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

function RegistrationForm({
  lang, onRegistered, registerFn,
}: {
  lang: Lang;
  onRegistered: (t: Trainee) => void;
  registerFn: ReturnType<typeof useServerFn<typeof registerTrainee>>;
}) {
  const [form, setForm] = useState({
    full_name: "", email: "", mobile: "", city: "", age_group: "",
    role: "", preferred_language: lang as "ar" | "en", consent_training_terms: false,
  });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consent_training_terms) { toast.error(lang === "ar" ? "يجب الموافقة على شروط التدريب" : "You must accept the training terms"); return; }
    setBusy(true);
    try {
      const res = await registerFn({ data: { ...form, consent_training_terms: true } as never });
      if (!res.ok) { toast.error(res.error); return; }
      onRegistered(res.trainee);
      toast.success(lang === "ar" ? "تم التسجيل" : "Registered");
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <Card className="p-5">
      <h2 className="text-xl font-semibold mb-4">{lang === "ar" ? "تسجيل المتدرّب" : "Trainee registration"}</h2>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{lang === "ar" ? "الاسم الكامل" : "Full name"} *</Label>
          <Input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>{lang === "ar" ? "البريد الإلكتروني" : "Email"} *</Label>
          <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>{lang === "ar" ? "الجوال (اختياري)" : "Mobile (optional)"}</Label>
          <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>{lang === "ar" ? "المدينة" : "City"}</Label>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>{lang === "ar" ? "الفئة العمرية" : "Age group"}</Label>
          <Select value={form.age_group} onValueChange={(v) => setForm({ ...form, age_group: v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="under_18">{lang === "ar" ? "أقل من ١٨" : "Under 18"}</SelectItem>
              <SelectItem value="18_24">18–24</SelectItem>
              <SelectItem value="25_34">25–34</SelectItem>
              <SelectItem value="35_44">35–44</SelectItem>
              <SelectItem value="45_plus">45+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{lang === "ar" ? "الدور" : "Role"}</Label>
          <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="student">{lang === "ar" ? "طالب" : "Student"}</SelectItem>
              <SelectItem value="healthcare_student">{lang === "ar" ? "طالب صحي" : "Healthcare student"}</SelectItem>
              <SelectItem value="volunteer">{lang === "ar" ? "متطوع" : "Volunteer"}</SelectItem>
              <SelectItem value="healthcare_worker">{lang === "ar" ? "ممارس صحي" : "Healthcare worker"}</SelectItem>
              <SelectItem value="community_member">{lang === "ar" ? "فرد من المجتمع" : "Community member"}</SelectItem>
              <SelectItem value="other">{lang === "ar" ? "آخر" : "Other"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>{lang === "ar" ? "اللغة المفضلة" : "Preferred language"}</Label>
          <Select value={form.preferred_language} onValueChange={(v: "ar" | "en") => setForm({ ...form, preferred_language: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <label className="sm:col-span-2 flex items-start gap-3 rounded-md border bg-muted/30 p-3 text-sm cursor-pointer">
          <Checkbox checked={form.consent_training_terms} onCheckedChange={(v) => setForm({ ...form, consent_training_terms: v === true })} />
          <span>
            {lang === "ar"
              ? "أفهم أن هذا التدريب يهدف إلى التوعية والمساندة المجتمعية فقط، ولا يؤهلني لتقديم تشخيص أو علاج أو وصف أدوية أو بدائل نيكوتين."
              : "I understand that this training is for education and community support only, and does not qualify me to diagnose, treat, prescribe, or recommend nicotine replacement products."}
          </span>
        </label>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy} className="w-full sm:w-auto">
            {busy ? "…" : lang === "ar" ? "ابدأ التدريب" : "Start training"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

function ModulePanel({
  lang, moduleSlug, traineeId, onScoreSubmitted, submitFn,
}: {
  lang: Lang;
  moduleSlug: string;
  traineeId: string;
  onScoreSubmitted: () => Promise<void> | void;
  submitFn: ReturnType<typeof useServerFn<typeof submitModuleScore>>;
}) {
  const m = TRAINING_MODULES.find((x) => x.slug === moduleSlug)!;
  const items = [...m.questions.map((q, i) => ({ kind: "q" as const, idx: i, ...q })),
                 ...m.cases.map((c) => ({ kind: "c" as const, ...c }))];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  function pick(i: number, opt: number) {
    if (revealed[i]) return;
    setAnswers((a) => ({ ...a, [i]: opt }));
    setRevealed((r) => ({ ...r, [i]: true }));
  }

  async function submit() {
    const total = items.length;
    let correct = 0;
    items.forEach((it, i) => { if (answers[i] === it.correct) correct++; });
    const s = Math.round((correct / total) * 100);
    setScore(s);
    const res = await submitFn({ data: { training_user_id: traineeId, module_slug: moduleSlug, score: s } });
    if (res.ok) {
      setSubmitted(true);
      toast.success(s >= MODULE_PASS ? (lang === "ar" ? "اجتزت الوحدة" : "Module passed") : (lang === "ar" ? "أعد المحاولة" : "Try again"));
      await onScoreSubmitted();
    }
  }

  const allAnswered = items.every((_, i) => answers[i] !== undefined);

  return (
    <div className="mt-4 space-y-4 border-t pt-4">
      <div className="prose prose-sm max-w-none">
        <h4 className="font-semibold mb-1">{lang === "ar" ? "الأهداف" : "Objectives"}</h4>
        <ul className="text-sm list-disc ps-5 space-y-0.5">
          {(lang === "ar" ? m.objectives_ar : m.objectives_en).map((o, i) => <li key={i}>{o}</li>)}
        </ul>
        <h4 className="font-semibold mt-3 mb-1">{lang === "ar" ? "الدرس" : "Lesson"}</h4>
        <p className="text-sm">{lang === "ar" ? m.lesson_ar : m.lesson_en}</p>
        <h4 className="font-semibold mt-3 mb-1">{lang === "ar" ? "النقاط الأساسية" : "Key points"}</h4>
        <ul className="text-sm list-disc ps-5 space-y-0.5">
          {(lang === "ar" ? m.key_points_ar : m.key_points_en).map((o, i) => <li key={i}>{o}</li>)}
        </ul>
        {m.script_ar && m.script_en && (
          <>
            <h4 className="font-semibold mt-3 mb-1">{lang === "ar" ? "نص المتطوّع" : "Volunteer script"}</h4>
            <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-3 rounded">{lang === "ar" ? m.script_ar : m.script_en}</pre>
          </>
        )}
        <h4 className="font-semibold mt-3 mb-1">{lang === "ar" ? "أخطاء شائعة" : "Common mistakes"}</h4>
        <ul className="text-sm list-disc ps-5 space-y-0.5">
          {(lang === "ar" ? m.mistakes_ar : m.mistakes_en).map((o, i) => <li key={i}>{o}</li>)}
        </ul>
      </div>

      <div className="space-y-3">
        <h4 className="font-semibold">{lang === "ar" ? "الأسئلة والسيناريوهات" : "Questions & scenarios"}</h4>
        {items.map((it, i) => {
          const opts = lang === "ar" ? it.opts_ar : it.opts_en;
          const q = it.kind === "q" ? (lang === "ar" ? it.q_ar : it.q_en) : (lang === "ar" ? it.text_ar : it.text_en);
          const title = it.kind === "c" ? (lang === "ar" ? it.title_ar : it.title_en) : null;
          const exp = lang === "ar" ? it.exp_ar : it.exp_en;
          const script = it.kind === "c" ? (lang === "ar" ? it.script_ar : it.script_en) : null;
          return (
            <div key={i} className="rounded-md border p-3 space-y-2">
              {title && <div className="font-semibold text-sm">{title}</div>}
              <div className="text-sm">{q}</div>
              <div className="grid gap-1.5">
                {opts.map((o, oi) => {
                  const picked = answers[i] === oi;
                  const isCorrect = oi === it.correct;
                  const show = revealed[i];
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => pick(i, oi)}
                      className={`text-start text-sm rounded border px-3 py-2 transition ${
                        show
                          ? isCorrect
                            ? "border-green-500 bg-green-50"
                            : picked
                              ? "border-red-400 bg-red-50"
                              : "opacity-70"
                          : "hover:bg-muted/40"
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
              {revealed[i] && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  <div><strong>{lang === "ar" ? "التفسير: " : "Explanation: "}</strong>{exp}</div>
                  {script && <div className="mt-1"><strong>{lang === "ar" ? "نص المتطوّع: " : "Volunteer script: "}</strong>{script}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        {score !== null && (
          <div className="text-sm">
            {lang === "ar" ? "نتيجتك:" : "Your score:"} <strong>{score}%</strong>
            {score < MODULE_PASS && <span className="text-red-600 ms-2">{lang === "ar" ? "(الحد الأدنى 70٪)" : "(min 70%)"}</span>}
          </div>
        )}
        <Button onClick={submit} disabled={!allAnswered}>
          {submitted ? (lang === "ar" ? "أعد التقديم" : "Resubmit") : (lang === "ar" ? "تقديم النتيجة" : "Submit score")}
        </Button>
      </div>
    </div>
  );
}
