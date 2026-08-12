import { Video, MessageSquare, Target, HelpCircle, Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const tools = [
  { badge: "Popular", badgeColor: "bg-orange-100 text-orange-700", icon: Video, iconColor: "bg-blue-600", title: "سيناريوهات الحياة الواقعية", desc: "تجربة مواقف حقيقية مثل التوتر، ضغط الأقران، أو رفض السجائر.", tags: ["#Video", "#Practice"] },
  { badge: "New", badgeColor: "bg-surface-muted text-brand", icon: MessageSquare, iconColor: "bg-digital", title: "تمارين رفض التدخين", desc: "تدرب على قول 'لا' من خلال تمارين لعب الأدوار وبناء الثقة.", tags: ["#Communication"] },
  { badge: "Active", badgeColor: "bg-blue-100 text-blue-700", icon: Target, iconColor: "bg-purple-600", title: "تحديد أهداف الإقلاع", desc: "حدد أهدافك الشخصية وتتبع الأيام الخالية من التدخين.", tags: ["#Goals"] },
  { badge: "Active", badgeColor: "bg-blue-100 text-blue-700", icon: HelpCircle, iconColor: "bg-rose-600", title: "اختبارات تفاعلية", desc: "اختبر معرفتك بمخاطر التدخين واستراتيجيات الإقلاع.", tags: ["#Quiz"] },
];

export default function InteractiveToolsSection() {
  const navigate = useNavigate();
  const go = () => navigate({ to: "/craving-coach" });

  return (
    <section id="interactive" className="saudi-map-section py-20 md:py-32">
      <div className="saudi-map-content container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-medium text-blue-700 tracking-wide uppercase">
              الأدوات التفاعلية
            </span>
          </div>
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight leading-[1.1]">
              <span className="gradient-text">مارس ما تتعلمه</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-light max-w-2xl mb-4">
              بعد كل وحدة، استخدم هذه الأدوات لممارسة المهارات: تدرب على السيناريوهات،
              حدد الأهداف، واختبر معرفتك.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-muted border border-border-soft">
              <Target className="w-4 h-4 text-brand" />
              <span className="text-sm font-medium text-ink">
                متاح بعد إكمال كل وحدة
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <button
              type="button"
              key={tool.title}
              onClick={go}
              className="group relative p-6 glass-card cursor-pointer text-right"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 ${tool.iconColor} rounded-xl flex items-center justify-center`}
                >
                  <tool.icon className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tool.badgeColor}`}
                >
                  {tool.badge}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2">
                {tool.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{tool.desc}</p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {tool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                  ابدأ الأداة ←
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            onClick={go}
            className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 text-sm font-medium active:scale-95 bg-white"
          >
            عرض جميع الأدوات التفاعلية
          </button>
        </div>
      </div>
    </section>
  );
}
