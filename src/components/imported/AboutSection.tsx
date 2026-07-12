import { useEffect, useRef, useState } from "react";
import { GraduationCap, Award, Users, TrendingUp } from "lucide-react";
import founderImg from "@/assets/founder.png";

function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

const stats = [
  { icon: Award, label: "الخبرة", value: 10, suffix: "+", color: "bg-blue-500" },
  { icon: GraduationCap, label: "البحث", value: 15, suffix: "+", color: "bg-emerald-500" },
  { icon: TrendingUp, label: "معدل النجاح", value: 85, suffix: "%", color: "bg-purple-500" },
  { icon: Users, label: "المرضى المساعدون", value: 500, suffix: "+", color: "bg-orange-500" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  animate,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
  color: string;
  animate: boolean;
}) {
  const count = useCountUp(value, 2000, animate);
  return (
    <div className="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-2`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <span className="text-2xl font-bold text-gray-900">
        {count}
        {suffix}
      </span>
      <span className="text-xs text-gray-500 mt-0.5">{label}</span>
    </div>
  );
}

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="about" ref={sectionRef} className="saudi-map-section py-24 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-14 grid gap-5 text-center md:grid-cols-2 md:text-right">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900">
            نبذة عن مؤسس البرنامج
          </h2>
          <p className="text-gray-600 text-lg">
            تعرف على مؤسس برنامج أقلع ورؤيته في مساعدة الناس على تحقيق حياة خالية من التدخين.
          </p>
        </div>

        <div className="grid gap-7 lg:grid-cols-2">
          <div className="relative h-[400px] md:h-[620px] rounded-xl overflow-hidden shadow-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10 flex items-center justify-center">
            <div className="relative w-full h-full max-w-2xl mx-auto">
              <img
                src={founderImg}
                alt="مؤسس برنامج أقلع"
                className="w-full h-full object-cover object-center rounded-lg"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="group relative overflow-hidden flex flex-col justify-between gap-6 rounded-3xl bg-white p-7 card-neumorphic transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2">
              <div className="absolute inset-0 rounded-3xl border border-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              <div className="absolute right-4 top-4 z-10">
                <div className="rounded-full bg-blue-500 p-1.5 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-4 mb-4">
                  <img src="/aqla-logo.png" alt="Aqla" className="h-16 w-auto object-contain" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">الدكتور مالك الذبياني</h3>
                    <p className="text-sm text-blue-600 font-medium">
                      مؤسس برنامج أقلع للإقلاع عن التدخين
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  الدكتور مالك الذبياني باحث في أمراض الجهاز التنفسي، ومحاضر شرفي في جامعة
                  كوليدج لندن في المملكة المتحدة ضمن قسم الطب في مستشفى رويال فري.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  حاصل على دكتوراه الفلسفة (PhD) من جامعة كوليدج لندن (UCL) في المملكة المتحدة
                  عام ٢٠٢٤، وهي أعلى مؤهل أكاديمي يؤسس عمله البحثي والتعليمي في مجال الإقلاع
                  عن التدخين وأمراض الجهاز التنفسي.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  يحمل بكالوريوس علوم في رعاية الجهاز التنفسي من جامعة توليدو بمعدل ٣.٩٥،
                  وماجستير علوم في العلاج التنفسي من جامعة ولاية جورجيا بمعدل ٤ من ٤، إضافة
                  إلى دبلوم صيدلة بتقدير ممتاز مع مرتبة الشرف.
                </p>
              </div>

              <a
                href="/learn-train"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors"
              >
                تعرف أكثر على الدكتور مالك ←
              </a>
            </div>

            <div>
              <h3 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                الإنجازات المهنية
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                إخلاص الدكتور مالك للعلاج التنفسي والصحة العامة أحدث تأثيراً كبيراً في مساعدة
                الناس على الإقلاع عن التدخين.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <StatCard key={stat.label} {...stat} animate={visible} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
