import { Clock, RefreshCw, TrendingUp, BarChart3, Shield, Brain, Zap } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "متاح 24/7",
    desc: "يمكنك الوصول إلى البرنامج في أي وقت ومن أي مكان عبر الإنترنت.",
    color: "bg-blue-600",
  },
  {
    icon: RefreshCw,
    title: "مستدام",
    desc: "برنامج مستدام ذاتياً يضمن المشاركة المستمرة ويحافظ على فعاليته.",
    color: "bg-emerald-600",
  },
  {
    icon: TrendingUp,
    title: "قابل للتوسع",
    desc: "يتكيف بسهولة مع زيادة عدد الطلاب دون الحاجة لموارد إضافية.",
    color: "bg-purple-600",
  },
  {
    icon: BarChart3,
    title: "مبني على البيانات",
    desc: "يستخدم مؤشرات أداء لقياس فعالية البرنامج وتحسينه باستمرار.",
    color: "bg-orange-500",
  },
  {
    icon: Shield,
    title: "تثقيف وقائي",
    desc: "تعليم شامل عن مخاطر التدخين والوقاية لتعزيز الوعي الصحي المجتمعي.",
    color: "bg-rose-600",
  },
  {
    icon: Brain,
    title: "دعم سلوكي",
    desc: "أدوات وتقنيات لإدارة التوتر واتخاذ القرار لتجاوز التحديات النفسية.",
    color: "bg-cyan-600",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="saudi-map-section py-24 md:py-32">
      <div className="saudi-map-content container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="mb-14 text-center">
          <div className="section-badge mb-5">
            <Zap className="w-3.5 h-3.5" />
            المميزات
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
            مميزات <span className="gradient-text">البرنامج</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto">
            برنامج مستدام يجمع بين التوعية والبيانات والدعم
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-6 group">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 ${f.color} rounded-xl mb-4 shadow-md transition-transform duration-300 group-hover:scale-110`}
              >
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
