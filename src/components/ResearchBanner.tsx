import { Mic } from "lucide-react";

// TODO: replace with the actual REDCap questionnaire link from the researcher.
export const RESEARCH_REDCAP_URL = "https://redcap.link/aqla-research";

export function ResearchBanner() {
  return (
    <a
      href={RESEARCH_REDCAP_URL}
      target="_blank"
      rel="noopener noreferrer"
      dir="rtl"
      className="group block w-full border-b border-[#006C35]/25 bg-gradient-to-l from-[#006C35]/15 via-[#00A65A]/10 to-[#006C35]/15 px-4 py-2.5 text-center transition-colors hover:bg-[#006C35]/15"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#006C35] text-white shadow-sm">
          <Mic className="h-3.5 w-3.5" />
        </span>
        <p className="text-[13px] font-semibold leading-5 text-[#006C35] sm:text-sm">
          شارك تجربتك مع أظرف النيكوتين وساهم في البحث العلمي 🌱
        </p>
        <span className="text-[12px] font-semibold text-[#006C35] underline decoration-[#006C35]/40 underline-offset-2 group-hover:decoration-[#006C35]">
          شارك في الاستبيان ←
        </span>
      </div>
    </a>
  );
}
