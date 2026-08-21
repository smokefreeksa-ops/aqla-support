import { Zap, BookOpen, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useLang } from "@/lib/i18n";
import { MODULES } from "@/data/modules";

export default function ModulesSection() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  return (
    <section id="modules" className="saudi-map-section py-24 md:py-32">
      <div className="saudi-map-content container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="mb-16 md:mb-20">
          <div className="section-badge mb-6">
            <Zap className="w-3.5 h-3.5" />
            {isAr ? "المسار التعليمي" : "Learning Track"}
          </div>
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight leading-[1.1]">
              <span className="gradient-text">
                {isAr ? "الوحدات التعليمية" : "Learning Modules"}
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mb-5">
              {isAr
                ? "منهج ثنائي اللغة مبني على مصادر منظمة الصحة العالمية (WHO) ومراكز مكافحة الأمراض الأمريكية (CDC)."
                : "Bilingual curriculum grounded in WHO and U.S. CDC evidence."}
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-soft border border-border-soft">
              <BookOpen className="w-4 h-4 text-brand" />
              <span className="text-sm font-semibold text-ink">
                {isAr ? "ابدأ بالوحدة الأولى • 15 دقيقة فقط" : "Start with Module 1 • 15 min"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-7xl mx-auto">
          {MODULES.map((mod) => (
            <Link
              key={mod.slug}
              to="/modules/$slug"
              params={{ slug: mod.slug }}
              className={`group relative p-5 rounded-xl overflow-hidden transition-all duration-300 ${
                mod.featured
                  ? "bg-gradient-to-br from-brand to-ink-secondary text-white shadow-xl shadow-emerald-700/30 hover:shadow-2xl hover:-translate-y-1"
                  : "glass-card"
              } ${mod.wide ? "md:col-span-2" : ""}`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      mod.featured ? "bg-white/20 text-white" : "bg-surface-soft text-brand"
                    }`}
                  >
                    {isAr ? `الوحدة ${mod.num}` : `Module ${mod.num}`}
                  </span>
                  <span className={`text-xs ${mod.featured ? "text-surface-soft" : "text-gray-400"}`}>
                    {isAr ? mod.duration.ar : mod.duration.en}
                  </span>
                </div>

                <h3
                  className={`font-bold text-base leading-snug mb-2 ${mod.featured ? "text-white" : "text-gray-900"}`}
                >
                  {isAr ? mod.title.ar : mod.title.en}
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-4 ${mod.featured ? "text-surface-soft" : "text-gray-500"}`}
                >
                  {isAr ? mod.summary.ar : mod.summary.en}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {mod.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-0.5 rounded ${
                          mod.featured ? "bg-white/15 text-surface-soft" : "text-gray-500 bg-gray-50"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className={`text-xs ${mod.featured ? "text-surface-soft" : "text-gray-400"}`}>
                    {mod.quiz.length} {isAr ? "أسئلة" : "questions"}
                  </span>
                </div>

                <div className={`mt-3 pt-3 border-t ${mod.featured ? "border-white/20" : "border-gray-100"}`}>
                  <span
                    className={`text-sm font-bold flex items-center gap-1 ${
                      mod.featured ? "text-white" : "text-brand group-hover:text-ink"
                    } transition-colors`}
                  >
                    {isAr ? "ابدأ التعلم" : "Start learning"}
                    <Arrow className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
