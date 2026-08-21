import { createFileRoute, Link, notFound, useLoaderData, useParams } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AqlaLogoBadge } from "@/components/AqlaLogoBadge";
import { ShareButtons } from "@/components/ShareButtons";
import { getShareCard } from "@/lib/share.functions";
import { ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { SITE_URL as SITE } from "@/lib/site";

export const Route = createFileRoute("/share/$type/$id")({
  loader: async ({ params }) => {
    const card = await getShareCard({ data: { id: params.id, type: params.type } });
    if (!card) throw notFound();
    return { card };
  },
  head: ({ params, loaderData }) => {
    const card = loaderData?.card;
    const title =
      card?.title_ar ||
      card?.title_en ||
      "أقلع — Aqla";
    const description =
      card?.message_ar ||
      card?.message_en ||
      "أقلع — منصة مجانية لدعم رحلة الإقلاع عن التدخين والنيكوتين";
    const url = `${SITE}/share/${params.type}/${params.id}`;
    const image = card?.image_url || `${SITE}/aqla-logo.png`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "website" },
        { property: "og:image", content: image },
        { property: "og:site_name", content: "Aqla — أقلع" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
        { name: "twitter:site", content: "@SmokeOffKSA" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <AqlaLogoBadge size={64} className="mx-auto mb-4" />
        <h1 className="text-2xl font-bold">البطاقة غير متاحة</h1>
        <p className="text-muted-foreground mt-2">Share card not available.</p>
        <Link to="/" className="mt-4 inline-block">
          <Button>العودة للرئيسية</Button>
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <AqlaLogoBadge size={64} className="mx-auto mb-4" />
        <h1 className="text-xl font-semibold">حدث خطأ</h1>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
        <Link to="/" className="mt-4 inline-block">
          <Button>الرئيسية</Button>
        </Link>
      </div>
    </div>
  ),
  component: SharePage,
});

function SharePage() {
  const { card } = useLoaderData({ from: "/share/$type/$id" });
  const params = useParams({ from: "/share/$type/$id" });
  const shareUrl = `${SITE}/share/${params.type}/${params.id}`;

  const titleAr = card.title_ar || "أقلع — Aqla";
  const titleEn = card.title_en || "Aqla";
  const messageAr = card.message_ar || "مستقبلي يستاهل أبدأ من اليوم.";
  const messageEn = card.message_en || "My future deserves it. I'm starting today.";
  const ctaAr = card.cta_ar || "ابدأ معنا";
  const ctaEn = card.cta_en || "Get started";
  const targetUrl = card.target_url?.startsWith("http")
    ? card.target_url
    : `${SITE}${card.target_url || "/"}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-stone-50 to-teal-50">
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="mb-4">
          <BackButton fallback="/" labelAr="الرئيسية" labelEn="Home" />
        </div>

        <Card className="overflow-hidden border-emerald-700/20 shadow-lg">
          {/* Header band */}
          <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-6 py-5 flex items-center gap-4">
            <AqlaLogoBadge size={56} />
            <div className="flex-1 min-w-0">
              <div className="text-xl font-bold leading-tight">{titleAr}</div>
              <div className="text-sm opacity-90">{titleEn}</div>
            </div>
          </div>

          {/* Generated card image (if any) */}
          {card.image_url ? (
            <div className="bg-white">
              <img
                src={card.image_url}
                alt={titleAr}
                className="w-full h-auto block"
                loading="eager"
              />
            </div>
          ) : (
            <div
              className="px-6 py-10 text-center"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(20,184,166,0.06) 50%, rgba(217,119,6,0.05) 100%)",
              }}
            >
              <AqlaLogoBadge size={72} className="mx-auto mb-4" />
              <div className="text-xl font-bold text-emerald-900">{titleAr}</div>
              <div className="text-sm text-emerald-800/80 mt-1">{titleEn}</div>
            </div>
          )}

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-lg leading-relaxed text-stone-800 text-center">{messageAr}</p>
            <p className="text-sm text-stone-600 text-center">{messageEn}</p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <a href={targetUrl}>
                <Button size="lg" className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800">
                  {ctaAr} · {ctaEn}
                </Button>
              </a>
            </div>

            <div className="pt-4 border-t">
              <div className="text-xs text-muted-foreground text-center mb-2">
                شارك التحدي · Share
              </div>
              <ShareButtons
                shareUrl={shareUrl}
                textAr={messageAr}
                textEn={messageEn}
                lang="ar"
              />
            </div>

            <div className="pt-4 border-t text-center text-xs text-stone-500 leading-relaxed">
              <div>أقلع — منصة مجانية للجميع، وستبقى مجانية</div>
              <div>Aqla — free for everyone, and always will be</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
