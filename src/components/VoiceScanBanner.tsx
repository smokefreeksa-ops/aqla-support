import { Link } from "@tanstack/react-router";
import { Mic } from "lucide-react";

export function VoiceScanBanner() {
  return (
    <section className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          to="/voice-craving-scan"
          dir="rtl"
          className="group block rounded-2xl border border-[#006C35]/25 bg-gradient-to-br from-[#006C35]/10 to-[#00A65A]/5 p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-center justify-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#006C35] text-white shadow-sm">
              <Mic className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold leading-6 text-[#006C35] sm:text-base">
              شارك تجربتك مع أظرف النيكوتين وساهم في البحث العلمي 🌱
            </p>
          </div>
          <p className="mt-2 text-xs text-foreground/70 sm:text-sm">
            دقيقة واحدة تسجيل صوتي يساعدنا نفهم أكثر ونطوّر دعم الإقلاع في السعودية.
          </p>
          <span className="mt-3 inline-block text-xs font-semibold text-[#006C35] group-hover:underline">
            ابدأ المسح الصوتي ←
          </span>
        </Link>
      </div>
    </section>
  );
}
