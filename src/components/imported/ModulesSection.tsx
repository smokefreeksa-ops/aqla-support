import { Zap, BookOpen, ArrowLeft } from "lucide-react";

const modules = [
  { num: "01", title: "أساسيات التبغ", desc: "حقائق أساسية حول أنواع التبغ ومخاطرها الصحية.", duration: "15 دقيقة", learners: "2,500+", tags: ["#أساسي", "#تعليمي"], wide: true, featured: true },
  { num: "02", title: "أنواع منتجات التبغ", desc: "معلومات عن السجائر والشيشة والتبغ غير المدخن.", duration: "20 دقيقة", learners: "2,200+", tags: ["#نفسي"], wide: false, featured: false },
  { num: "03", title: "النيكوتين والمخاطر", desc: "فهم إدمان النيكوتين وتأثيره على الدماغ والجسم.", duration: "18 دقيقة", learners: "2,800+", tags: ["#صحة"], wide: false, featured: false },
  { num: "04", title: "استراتيجيات الإقلاع", desc: "نصائح عملية للإقلاع والبدائل وقصص نجاح ملهمة.", duration: "25 دقيقة", learners: "2,100+", tags: ["#استراتيجية"], wide: true, featured: false },
  { num: "05", title: "السياسات المؤسسية", desc: "قواعد وأنظمة تعزز بيئة خالية من التدخين.", duration: "12 دقيقة", learners: "1,900+", tags: ["#سياسة"], wide: false, featured: false },
  { num: "06", title: "فوائد الإقلاع", desc: "التحسينات الصحية وجدول التعافي بعد الإقلاع.", duration: "16 دقيقة", learners: "2,300+", tags: ["#تعافي"], wide: false, featured: false },
  { num: "07", title: "عيادات الدعم", desc: "خدمات الدعم والموارد المتاحة لمساعدتك.", duration: "22 دقيقة", learners: "1,800+", tags: ["#دعم"], wide: false, featured: false },
];

export default function ModulesSection() {
  return (
    <section id="modules" className="saudi-map-section py-24 md:py-32">
      <div className="saudi-map-content container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="mb-16 md:mb-20">
          <div className="section-badge mb-6">
            <Zap className="w-3.5 h-3.5" />
            المسار التعليمي
          </div>
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight leading-[1.1]">
              <span className="gradient-text">الوحدات التعليمية</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-500 leading-relaxed max-w-2xl mb-5">
              مجموعة شاملة من الوحدات لفهم مخاطر التدخين وتعلم استراتيجيات الإقلاع الفعالة.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span className="text-sm font-semibold text-blue-900">
                ابدأ بالوحدة الأولى • 15 دقيقة فقط
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-7xl mx-auto">
          {modules.map((mod) => (
            <a
              key={mod.num}
              href="/learn-train"
              className={`group relative p-5 rounded-xl overflow-hidden transition-all duration-300 will-change-transform ${
                mod.featured
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:-translate-y-1"
                  : "glass-card"
              } ${mod.wide ? "md:col-span-2" : ""}`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md ${
                      mod.featured ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    الوحدة {mod.num}
                  </span>
                  <span
                    className={`text-xs ${mod.featured ? "text-blue-100" : "text-gray-400"}`}
                  >
                    {mod.duration}
                  </span>
                </div>

                <h3
                  className={`font-bold text-base leading-snug mb-2 ${mod.featured ? "text-white" : "text-gray-900"}`}
                >
                  {mod.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-4 ${mod.featured ? "text-blue-100" : "text-gray-500"}`}
                >
                  {mod.desc}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {mod.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-xs px-2 py-0.5 rounded ${
                          mod.featured ? "bg-white/15 text-blue-100" : "text-gray-400 bg-gray-50"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span
                    className={`text-xs ${mod.featured ? "text-blue-100" : "text-gray-400"}`}
                  >
                    {mod.learners} متعلم
                  </span>
                </div>

                <div
                  className={`mt-3 pt-3 border-t ${mod.featured ? "border-white/20" : "border-gray-100"}`}
                >
                  <span
                    className={`text-sm font-bold flex items-center gap-1 ${
                      mod.featured ? "text-white" : "text-blue-600 group-hover:text-blue-700"
                    } transition-colors`}
                  >
                    ابدأ التعلم
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-10">
          <a
            href="/learn-train"
            className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-gray-200 rounded-xl text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-all duration-200 text-sm font-semibold bg-white"
          >
            عرض جميع الوحدات
          </a>
        </div>
      </div>
    </section>
  );
}
