import { ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

const benefits = [
  "محتوى معتمد علمياً من متخصصين",
  "مجاني تماماً بدون أي رسوم",
  "شهادة إتمام معتمدة",
  "دعم متواصل على مدار الساعة",
  "7 وحدات تعليمية شاملة",
  "أدوات تفاعلية متطورة",
];

export default function CTASection() {
  const navigate = useNavigate();

  return (
    <section id="register" className="relative overflow-hidden py-24 md:py-32">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 90% 90% at 50% 40%, rgba(10,58,34,0.75) 0%, rgba(4,24,14,0.85) 55%, rgba(2,8,4,0.95) 100%)" }} />
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, #93c5fd 0%, transparent 70%)" }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 rounded-full border border-white/25 mb-6 backdrop-blur-sm">
              <img
                src="/aqla-logo.png"
                alt="Aqla"
                className="w-5 h-5 object-contain brightness-0 invert"
              />
              <span className="text-sm font-bold text-white">انضم إلى برنامج أقلع</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight tracking-tight">
              ابدأ رحلتك نحو
              <span className="block text-blue-200">حياة صحية خالية من التدخين</span>
            </h2>

            <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              برنامج تعليمي شامل معتمد، يساعدك على الإقلاع عن التدخين بطريقة علمية ومدروسة.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <button
                onClick={() => navigate({ to: "/quit-pathway" })}
                className="w-full sm:w-auto group bg-white hover:bg-blue-50 text-blue-700 px-8 py-4 rounded-xl font-extrabold text-lg shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span>ابدأ الآن مجاناً</span>
                <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
              </button>

              <button
                onClick={() => navigate({ to: "/learn-train" })}
                className="w-full sm:w-auto group bg-white/15 hover:bg-white/25 text-white border border-white/30 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                استكشف المحتوى
              </button>
            </div>

            <p className="text-sm text-blue-200">
              مجاناً تماماً • لا يلزم بطاقة ائتمان • ابدأ فوراً
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-xl font-bold text-white text-center mb-6">
              لماذا تختار برنامج أقلع؟
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {benefits.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-300 flex-shrink-0" />
                  <span className="text-sm text-blue-100 font-medium">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
