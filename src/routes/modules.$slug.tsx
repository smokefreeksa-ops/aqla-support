import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getModule, MODULES, type Module } from "@/data/modules";
import { issueAcademyCertificate } from "@/lib/academy-certificate.functions";
import {
  shuffleOptions,
  newAttemptSeed,
  scoreAttempt,
  SCOPE_STATEMENT,
  ACADEMY_ASSESSMENT_VERSION,
  type AssessmentQuestion,
} from "@/lib/assessment-runtime";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, BookOpen, ExternalLink, Award, ShieldAlert } from "lucide-react";
import { BackButton } from "@/components/BackButton";

export const Route = createFileRoute("/modules/$slug")({
  loader: ({ params }) => {
    const mod = getModule(params.slug);
    if (!mod) throw notFound();
    return { mod };
  },
  head: ({ loaderData }) => {
    const m = loaderData?.mod;
    const title = m ? `${m.title.ar} | ${m.title.en} — Aqla` : "Aqla Module";
    const desc = m ? `${m.summary.ar} — ${m.summary.en}` : "Aqla learning module";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ModulePage,
});

function ModulePage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

function Inner() {
  const { mod } = Route.useLoaderData() as { mod: Module };
  const { lang, dir } = useLang();
  const isAr = lang === "ar";
  const idx = MODULES.findIndex((m) => m.slug === mod.slug);
  const prev = MODULES[idx - 1];
  const next = MODULES[idx + 1];

  // Per-attempt seed — shuffles option order for every fresh attempt.
  const [attemptSeed, setAttemptSeed] = useState(() => newAttemptSeed());

  // Answers stored by { [questionId]: optionKey } — position-independent.
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Precompute the display order of each question's options for THIS attempt.
  const shuffledOptionsByQ = useMemo(() => {
    const m: Record<string, AssessmentQuestion["options"]> = {};
    for (const qq of mod.quiz) {
      m[qq.id] = shuffleOptions(qq.options, `${attemptSeed}:${qq.id}`);
    }
    return m;
  }, [mod.quiz, attemptSeed]);

  // Client-side score preview (server re-scores on cert issuance).
  const result = useMemo(() => scoreAttempt(mod.quiz, answers, 80), [mod.quiz, answers]);
  const passed = submitted && result.passed && result.safetyCriticalPassed;
  const safetyBlocked = submitted && result.passed && !result.safetyCriticalPassed;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [scopeAccepted, setScopeAccepted] = useState(false);
  const [issuing, setIssuing] = useState(false);
  const issueFn = useServerFn(issueAcademyCertificate);
  const navigate = useNavigate();

  function resetAttempt() {
    setAnswers({});
    setSubmitted(false);
    setAttemptSeed(newAttemptSeed());
  }

  async function claimCertificate() {
    if (fullName.trim().length < 2) {
      toast.error(isAr ? "أدخل اسمك الكامل" : "Enter your full name");
      return;
    }
    if (!scopeAccepted) {
      toast.error(isAr ? "يجب الموافقة على تعهّد المتطوّع أولًا" : "You must accept the volunteer scope statement first");
      return;
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmedEmail)) {
      toast.error(isAr ? "بريد إلكتروني غير صالح" : "Invalid email address");
      return;
    }
    setIssuing(true);
    try {
      const res = await issueFn({
        data: {
          module_slug: mod.slug,
          full_name: fullName,
          answers,
          scope_accepted: true,
          language: lang,
          recipient_email: trimmedEmail || null,
          assessment_version: ACADEMY_ASSESSMENT_VERSION,
        },
      });
      if (!res.ok || !res.certificate_code) {
        const msg =
          res.error === "safety_critical_failed"
            ? isAr
              ? "لم تنجح لأن سؤالًا يتعلق بالسلامة أُجيب خطأً. راجع القسم المرتبط وأعد المحاولة."
              : "Blocked — a safety-critical question was answered incorrectly. Review the safety section and retry."
            : res.error === "scope_not_accepted"
            ? isAr ? "يجب قبول تعهّد المتطوّع" : "Scope acceptance is required"
            : res.error === "score_below_threshold"
            ? isAr ? `نتيجتك ${res.score}% (المطلوب 80%)` : `Your score ${res.score}% (need 80%)`
            : isAr ? "تعذّر إصدار الشهادة" : "Could not issue certificate";
        toast.error(msg);
        return;
      }
      toast.success(
        trimmedEmail
          ? (isAr ? "تم إصدار شهادتك وأُرسلت إلى بريدك" : "Certificate issued & emailed ")
          : (isAr ? "تم إصدار شهادتك" : "Certificate issued "),
      );
      navigate({ to: "/academy-certificate/$code", params: { code: res.certificate_code } });
    } catch (e) {
      console.error(e);
      toast.error(isAr ? "خطأ في الشبكة" : "Network error");
    } finally {
      setIssuing(false);
    }
  }

  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="mb-5">
          <BackButton fallback="/academy" labelAr="الأكاديمية" labelEn="Academy" />
        </div>
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-brand hover:underline mb-4">
          {isAr ? "الرئيسية" : "Home"}
        </Link>

        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface-soft border border-border-soft px-3 py-1 text-[11px] font-semibold text-ink-secondary">
            <BookOpen className="h-3.5 w-3.5" />
            {isAr ? `الوحدة ${mod.num}` : `Module ${mod.num}`}
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            {isAr ? mod.title.ar : mod.title.en}
          </h1>
          <p className="mt-2 text-gray-600 text-[15px]">{isAr ? mod.summary.ar : mod.summary.en}</p>
          <div className="mt-2 text-xs text-gray-400">
            {isAr ? mod.duration.ar : mod.duration.en} · {isAr ? `الإصدار ${ACADEMY_ASSESSMENT_VERSION}` : `Assessment ${ACADEMY_ASSESSMENT_VERSION}`}
          </div>
        </div>

        {/* Content */}
        <article className="space-y-5">
          {mod.content.map((s, i) => (
            <section key={i} className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-base font-bold text-gray-900 mb-2">
                {isAr ? s.heading.ar : s.heading.en}
              </h2>
              <p className="text-[14.5px] leading-7 text-gray-700">
                {isAr ? s.body.ar : s.body.en}
              </p>
            </section>
          ))}
        </article>

        {/* Sources */}
        <section className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4">
          <div className="text-xs font-bold text-gray-500 uppercase mb-2">
            {isAr ? "المصادر الرسمية" : "Official sources"}
          </div>
          <ul className="space-y-1">
            {mod.sources.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
                >
                  {s.label}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Quiz */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {isAr ? "اختبار الوحدة" : "Module quiz"}
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            {isAr
              ? `يتم خلط ترتيب الخيارات لكل محاولة. تحتاج ${result.total ? Math.ceil(result.total * 0.8) : 0} من ${result.total} على الأقل، وكل سؤال يخص السلامة يجب أن يكون صحيحًا.`
              : `Option order is shuffled each attempt. You need at least ${result.total ? Math.ceil(result.total * 0.8) : 0}/${result.total}, and every safety-critical question must be correct.`}
          </p>
          <div className="space-y-4">
            {mod.quiz.map((qq, i) => {
              const chosenKey = answers[qq.id];
              const isCorrect = submitted && chosenKey === qq.correctKey;
              const isWrong = submitted && chosenKey !== undefined && chosenKey !== qq.correctKey;
              const opts = shuffledOptionsByQ[qq.id] ?? qq.options;
              return (
                <div
                  key={qq.id}
                  className={`rounded-xl border p-4 bg-white ${
                    isCorrect ? "border-accent-green-light" : isWrong ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <div className="font-semibold text-gray-900 text-[15px] flex-1">
                      {i + 1}. {isAr ? qq.q.ar : qq.q.en}
                    </div>
                    {qq.safetyCritical && (
                      <span
                        title={isAr ? "سؤال يخص السلامة — يجب أن يكون صحيحًا" : "Safety-critical — must be correct"}
                        className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        {isAr ? "سلامة" : "Safety"}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {opts.map((opt) => {
                      const active = chosenKey === opt.key;
                      const showCorrect = submitted && opt.key === qq.correctKey;
                      const showWrong = submitted && active && opt.key !== qq.correctKey;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          disabled={submitted}
                          onClick={() => setAnswers((a) => ({ ...a, [qq.id]: opt.key }))}
                          className={`w-full text-start px-3 py-2 rounded-lg border text-sm transition ${
                            showCorrect
                              ? "bg-surface-soft border-accent-green-light text-ink"
                              : showWrong
                              ? "bg-red-50 border-red-400 text-red-900"
                              : active
                              ? "border-accent-green bg-surface-soft/50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            {showCorrect && <CheckCircle2 className="w-4 h-4 text-digital" />}
                            {showWrong && <XCircle className="w-4 h-4 text-red-600" />}
                            {isAr ? opt.ar : opt.en}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="mt-3 text-xs text-gray-600 border-t border-gray-100 pt-2">
                      <span className="font-bold">{isAr ? "المرجع:" : "Reference: "}</span>
                      {isAr ? qq.explanation.ar : qq.explanation.en}
                      <span className="ms-2 text-gray-400">· {qq.source}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length < mod.quiz.length}
                className="px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-bold hover:bg-ink-secondary disabled:opacity-40"
              >
                {isAr ? "تحقق من الإجابات" : "Check answers"}
              </button>
            ) : (
              <>
                <div className="text-sm font-bold text-gray-900">
                  {isAr
                    ? `نتيجتك: ${result.correct} من ${result.total} (${result.percent}%)`
                    : `Your score: ${result.correct} / ${result.total} (${result.percent}%)`}
                </div>
                <button
                  onClick={resetAttempt}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-gray-400"
                >
                  {isAr ? "إعادة (خيارات جديدة)" : "Retry (new option order)"}
                </button>
              </>
            )}
          </div>

          {safetyBlocked && (
            <div className="mt-6 rounded-2xl border-2 border-red-400 bg-red-50/60 p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="w-5 h-5 text-red-700" />
                <div className="font-bold text-gray-900">
                  {isAr ? "يلزم مراجعة جانب السلامة" : "Safety Review Required"}
                </div>
              </div>
              <p className="text-sm text-red-900">
                {isAr
                  ? "درجتك الإجمالية تجاوزت الحد، لكن سؤالًا (أو أكثر) يخص السلامة أُجيب بشكل غير صحيح. الشهادة لا تُصدر حتى تُجيب على كل أسئلة السلامة بشكل صحيح. راجع «وحدة السلامة والحدود والإحالة» ثم أعد المحاولة."
                  : "Your overall score passed, but at least one safety-critical question was answered incorrectly. A certificate is not issued until every safety-critical question is correct. Review the Safety, Boundaries & Referral module, then retry."}
              </p>
              <div className="mt-3">
                <Link
                  to="/modules/$slug"
                  params={{ slug: "safety-and-referral" }}
                  className="inline-flex items-center gap-1 text-sm font-bold text-red-800 underline"
                >
                  {isAr ? "افتح وحدة السلامة" : "Open the Safety module"}
                </Link>
              </div>
            </div>
          )}

          {passed && (
            <div className="mt-6 rounded-2xl border-2 border-accent-green bg-surface-soft/60 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-brand" />
                <div className="font-bold text-gray-900">
                  {isAr ? `اجتزت التقييم — ${result.percent}%` : `Assessment Passed — ${result.percent}%`}
                </div>
              </div>
              <p className="text-sm text-ink">
                {isAr
                  ? "قبل إصدار الشهادة، يرجى إدخال اسمك والموافقة على تعهّد المتطوّع أدناه."
                  : "Before we issue the certificate, please enter your name and confirm the volunteer scope statement below."}
              </p>

              {/* Scope statement */}
              <div className="mt-4 rounded-lg border border-border-soft bg-white p-3">
                <div className="text-xs font-bold text-ink-secondary mb-1">
                  {isAr ? "تعهّد نطاق الدور" : "Scope & conduct statement"}
                </div>
                <p className="text-[13px] leading-6 text-gray-700">
                  {isAr ? SCOPE_STATEMENT.ar : SCOPE_STATEMENT.en}
                </p>
                <label className="mt-3 flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scopeAccepted}
                    onChange={(e) => setScopeAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-800">
                    {isAr ? "أوافق على هذا التعهّد." : "I accept this statement."}
                  </span>
                </label>
              </div>

              <div className="mt-3 grid gap-2">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAr ? "الاسم الكامل" : "Full name"}
                  className="w-full rounded-lg border border-accent-green-light bg-white px-3 py-2 text-sm outline-none focus:border-digital"
                  maxLength={120}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAr ? "البريد الإلكتروني (اختياري — لإرسال الشهادة)" : "Email (optional — to receive certificate)"}
                  className="w-full rounded-lg border border-accent-green-light bg-white px-3 py-2 text-sm outline-none focus:border-digital"
                  maxLength={254}
                />
                <button
                  onClick={claimCertificate}
                  disabled={issuing || fullName.trim().length < 2 || !scopeAccepted}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-bold hover:bg-ink-secondary disabled:opacity-40"
                >
                  {issuing
                    ? (isAr ? "جارٍ الإصدار..." : "Issuing...")
                    : (isAr ? "أصدر الشهادة" : "Issue certificate")}
                </button>
              </div>
            </div>
          )}

          {submitted && !result.passed && (
            <div className="mt-6 rounded-2xl border-2 border-amber-400 bg-amber-50/60 p-5">
              <div className="font-bold text-gray-900 mb-1">
                {isAr ? `لم يتم الاجتياز بعد — ${result.percent}%` : `Not Yet Passed — ${result.percent}%`}
              </div>
              <p className="text-sm text-amber-900">
                {isAr
                  ? "راجع محتوى الوحدة أعلاه ثم أعد المحاولة. سيتم توليد ترتيب جديد للخيارات."
                  : "Review the module content above, then retry. A new option order will be generated."}
              </p>
            </div>
          )}
        </section>

        {/* Nav */}
        <nav className="mt-10 flex items-center justify-between gap-3 border-t border-gray-200 pt-5">
          {prev ? (
            <Link
              to="/modules/$slug"
              params={{ slug: prev.slug }}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-brand"
            >
              <ArrowRight className="w-4 h-4 rtl:hidden" />
              <ArrowLeft className="w-4 h-4 ltr:hidden" />
              {isAr ? prev.title.ar : prev.title.en}
            </Link>
          ) : <span />}
          {next && (
            <Link
              to="/modules/$slug"
              params={{ slug: next.slug }}
              className="inline-flex items-center gap-1 text-sm font-bold text-brand hover:text-ink"
            >
              {isAr ? next.title.ar : next.title.en}
              <Arrow className="w-4 h-4" />
            </Link>
          )}
        </nav>
      </main>
      <SiteFooter />
    </div>
  );
}
