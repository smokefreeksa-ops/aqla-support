import { Link } from "@tanstack/react-router";
import { Brain, Sparkles, MessageCircle, Shield, Clock, Star } from "lucide-react";

const features = [
  { icon: Brain, text: "مدرّب بأحدث بروتوكولات العلاج السلوكي المعرفي" },
  { icon: Shield, text: "آمن، سري، ومبني على الأدلة العلمية" },
  { icon: Clock, text: "متاح على مدار الساعة — في أي لحظة تحتاجه" },
  { icon: Star, text: "يراعي قيمك الإسلامية وثقافتك السعودية" },
];

export default function DrMalikCard() {
  return (
    <section
      className="relative w-full py-16 md:py-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0a0f1a 0%, #0d1f2d 50%, #0a1520 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,166,90,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,166,90,1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(0,166,90,0.08) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto px-4 md:px-8">
        <div
          className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 md:gap-14"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(0,166,90,0.18)",
            boxShadow:
              "0 0 60px rgba(0,166,90,0.06), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}

        >
          <div className="flex-shrink-0 flex flex-col items-center gap-4">
            <div
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,166,90,0.15), rgba(167,139,250,0.15))",
                border: "2px solid rgba(0,166,90,0.35)",
                boxShadow: "0 0 40px rgba(0,166,90,0.20)",
              }}
            >
              <div
                className="absolute inset-0 rounded-full "
                style={{
                  border: "1px solid rgba(0,166,90,0.25)",
                  animationDuration: "2.5s",
                }}
              />
              <Brain className="w-16 h-16 md:w-20 md:h-20"style={{ color: "#00A65A" }} />
            </div>

            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.30)",
                color: "#4ade80",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-accent-green-light" />
              متاح الآن
            </div>
          </div>

          <div className="flex-1 text-center md:text-right">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{
                background: "rgba(0,166,90,0.10)",
                border: "1px solid rgba(0,166,90,0.25)",
                color: "#00A65A",
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              مدرّبك الذكي المتخصص
            </div>

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 leading-tight"
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, #00A65A 60%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              دكتور مالك
            </h2>

            <p
              className="text-base md:text-lg mb-6 leading-relaxed"style={{ color: "rgba(255,255,255,0.60)" }}
            >
              مساعدك الذكي المتخصص في الإقلاع عن التدخين — يفهم رحلتك، يدعمك في لحظات
              الضعف، ويقدم لك خطة علاجية مبنية على أحدث الأبحاث العلمية.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {features.map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-right"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <Icon className="w-4 h-4 flex-shrink-0"style={{ color: "#00A65A" }} />
                  <span
                    className="text-sm"style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <Link
              to="/quit-chat"className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-base md:text-lg transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background:
                  "linear-gradient(135deg, #00A65A 0%, #006C35 50%, #a78bfa 100%)",
                boxShadow: "0 8px 32px rgba(0,166,90,0.35)",
              }}
            >
              <MessageCircle className="w-5 h-5 flex-shrink-0" />
              ابدأ محادثة مع دكتور مالك
            </Link>

            <p
              className="mt-3 text-xs"style={{ color: "rgba(255,255,255,0.30)" }}
            >
              مجاني تماماً · لا يحتاج تسجيل للبدء
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
