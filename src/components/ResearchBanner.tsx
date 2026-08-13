import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPublicImpactStats } from "@/lib/impact.functions";
import { QuitChatDrawer } from "@/components/QuitChatDrawer";

import { track } from "@/lib/events";

export const RESEARCH_REDCAP_URL = "https://redcap.kau.edu.sa/surveys/?s=FLJKYNNLYEA7HXAM";

function formatCount(n: number): string {
  return new Intl.NumberFormat("ar-EG").format(n);
}

export function ResearchBanner() {
  const { data } = useQuery({
    queryKey: ["public-impact-stats-banner"],
    queryFn: () => getPublicImpactStats(),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
  const visits = data?.total_visits ?? 0;
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div
        dir="rtl"
        className="relative block w-full overflow-hidden border-b border-red-500/30 px-3 py-1.5 backdrop-blur-sm"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(127,29,29,0.55) 0%, rgba(185,28,28,0.6) 25%, rgba(239,68,68,0.6) 50%, rgba(185,28,28,0.6) 75%, rgba(127,29,29,0.55) 100%)",
        }}
      >
        <div className="relative mx-auto flex max-w-6xl flex-row flex-wrap items-center justify-center gap-2 text-center sm:gap-3">
          <p className="text-[11px] font-semibold leading-tight text-white drop-shadow-sm sm:text-xs">
            تجربتك تهمنا وتساهم في البحث العلمي
          </p>

          <a
            href={RESEARCH_REDCAP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("study_banner_click", "banner")}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-red-700 ring-1 ring-white/60 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:text-[11px]"
          >
            شارك الآن في الدراسة
          </a>

          <button
            type="button"
            onClick={() => {
              track("quick_action", "quit_plan_banner");
              setChatOpen(true);
            }}
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-red-700 ring-1 ring-white/60 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:text-[11px]"
          >
            ابدأ خطة الإقلاع السريعة مع د. مالك
          </button>

          <Link
            to="/poster-studio"
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/25 transition-colors hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:text-[11px]"
          >
            أنشئ بطاقة إنجازك
          </Link>

          <span
            title="إجمالي الزيارات"
            className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-white ring-1 ring-white/20 sm:text-[11px]"
          >
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            {formatCount(visits)} زيارة
          </span>
        </div>
      </div>
      <QuitChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
