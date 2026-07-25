import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getModule, MODULES, type Module } from "@/data/modules";
import { issueAcademyCertificate } from "@/lib/academy-certificate.functions";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ArrowRight, ArrowLeft, BookOpen, ExternalLink, Award } from "lucide-react";

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
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const correct = mod.quiz.reduce(
    (n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0),
    0,
  );
  const scorePct = Math.round((correct / mod.quiz.length) * 100);
  const passed = submitted && scorePct >= 80;

  const [fullName, setFullName] = useState("");
  const [issuing, setIssuing] = useState(false);
  const issueFn = useServerFn(issueAcademyCertificate);
  const navigate = useNavigate();

  async function claimCertificate() {
    if (fullName.trim().length < 2) {
      toast.error(isAr ? "أدخل اسمك الكامل" : "Enter your full name");
      return;
    }
    setIssuing(true);
    try {
      const answersMap: Record<string, number> = {};
      Object.entries(answers).forEach(([k, v]) => { answersMap[String(k)] = v; });
      const res = await issueFn({
        data: {
          module_slug: mod.slug,
          full_name: fullName,
          answers: answersMap,
          language: lang,
        },
      });
      if (!res.ok || !res.certificate_code) {
        toast.error(isAr ? "تعذّر إصدار الشهادة" : "Could not issue certificate");
        return;
      }
      toast.success(isAr ? "تم إصدار شهادتك 🎉" : "Certificate issued 🎉");
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
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline mb-4">
          {isAr ? "الرئيسية" : "Home"}
        </Link>

        <div className="mb-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-800">
            <BookOpen className="h-3.5 w-3.5" />
            {isAr ? `الوحدة ${mod.num}` : `Module ${mod.num}`}
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            {isAr ? mod.title.ar : mod.title.en}
          </h1>
          <p className="mt-2 text-gray-600 text-[15px]">{isAr ? mod.summary.ar : mod.summary.en}</p>
          <div className="mt-2 text-xs text-gray-400">
            {isAr ? mod.duration.ar : mod.duration.en}
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
                  className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:underline"
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
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            {isAr ? "اختبار الوحدة" : "Module quiz"}
          </h2>
          <div className="space-y-4">
            {mod.quiz.map((q, i) => {
              const chosen = answers[i];
              const isCorrect = submitted && chosen === q.correctIndex;
              const isWrong = submitted && chosen !== undefined && chosen !== q.correctIndex;
              return (
                <div
                  key={i}
                  className={`rounded-xl border p-4 bg-white ${
                    isCorrect ? "border-emerald-400" : isWrong ? "border-red-400" : "border-gray-200"
                  }`}
                >
                  <div className="font-semibold text-gray-900 text-[15px] mb-3">
                    {i + 1}. {isAr ? q.q.ar : q.q.en}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const active = chosen === oi;
                      const showCorrect = submitted && oi === q.correctIndex;
                      const showWrong = submitted && active && oi !== q.correctIndex;
                      return (
                        <button
                          key={oi}
                          type="button"
                          disabled={submitted}
                          onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                          className={`w-full text-start px-3 py-2 rounded-lg border text-sm transition ${
                            showCorrect
                              ? "bg-emerald-50 border-emerald-400 text-emerald-900"
                              : showWrong
                              ? "bg-red-50 border-red-400 text-red-900"
                              : active
                              ? "border-emerald-500 bg-emerald-50/50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="inline-flex items-center gap-2">
                            {showCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                            {showWrong && <XCircle className="w-4 h-4 text-red-600" />}
                            {isAr ? opt.ar : opt.en}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {submitted && (
                    <div className="mt-3 text-xs text-gray-600 border-t border-gray-100 pt-2">
                      <span className="font-bold">{isAr ? "المرجع: " : "Reference: "}</span>
                      {isAr ? q.explanation.ar : q.explanation.en}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-center gap-3">
            {!submitted ? (
              <button
                onClick={() => setSubmitted(true)}
                disabled={Object.keys(answers).length < mod.quiz.length}
                className="px-5 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 disabled:opacity-40"
              >
                {isAr ? "تحقق من الإجابات" : "Check answers"}
              </button>
            ) : (
              <>
                <div className="text-sm font-bold text-gray-900">
                  {isAr
                    ? `نتيجتك: ${correct} من ${mod.quiz.length}`
                    : `Your score: ${correct} / ${mod.quiz.length}`}
                </div>
                <button
                  onClick={() => {
                    setAnswers({});
                    setSubmitted(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:border-gray-400"
                >
                  {isAr ? "إعادة" : "Retry"}
                </button>
              </>
            )}
          </div>

          {submitted && (
            <div className={`mt-6 rounded-2xl border-2 p-5 ${passed ? "border-emerald-500 bg-emerald-50/60" : "border-amber-400 bg-amber-50/60"}`}>
              <div className="flex items-center gap-2 mb-2">
                <Award className={`w-5 h-5 ${passed ? "text-emerald-700" : "text-amber-700"}`} />
                <div className="font-bold text-gray-900">
                  {passed
                    ? isAr ? `نجحت — ${scorePct}%` : `Passed — ${scorePct}%`
                    : isAr ? `تحتاج 80% للحصول على الشهادة (نتيجتك ${scorePct}%)` : `Need 80% to earn the certificate (you scored ${scorePct}%)`}
                </div>
              </div>
              {passed ? (
                <div className="space-y-3">
                  <p className="text-sm text-emerald-900">
                    {isAr
                      ? "أدخل اسمك الكامل كما ترغب بظهوره على الشهادة الرسمية."
                      : "Enter your full name exactly as you want it printed on the certificate."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder={isAr ? "الاسم الكامل" : "Full name"}
                      className="flex-1 rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600"
                      maxLength={120}
                    />
                    <button
                      onClick={claimCertificate}
                      disabled={issuing || fullName.trim().length < 2}
                      className="px-5 py-2.5 rounded-lg bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 disabled:opacity-40"
                    >
                      {issuing
                        ? (isAr ? "جارٍ الإصدار..." : "Issuing...")
                        : (isAr ? "أصدر الشهادة" : "Issue certificate")}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-amber-900">
                  {isAr ? "أعد المحاولة بعد مراجعة المحتوى أعلاه." : "Retry after reviewing the content above."}
                </p>
              )}
            </div>
          )}
        </section>


        {/* Nav */}
        <nav className="mt-10 flex items-center justify-between gap-3 border-t border-gray-200 pt-5">
          {prev ? (
            <Link
              to="/modules/$slug"
              params={{ slug: prev.slug }}
              className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-emerald-700"
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
              className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-900"
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
