import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LangContext, useLang, useLangState } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Linkedin, MessageCircle, Twitter, QrCode, Download, Share2 } from "lucide-react";
import { trackEvent } from "@/lib/track-event";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/invite-friends")({
  head: () => ({
    meta: [
      { title: "ادعُ أصدقاءك — Aqla" },
      { name: "description", content: "أنشئ رابط دعوة شخصي وشارك أقلع مع أصدقائك." },
    ],
  }),
  component: InviteFriendsPage,
});

function generateReferralCode(): string {
  // Stable, browser-readable, no PII.
  try {
    const existing = localStorage.getItem("aqla.referralCode");
    if (existing) return existing;
  } catch { /* ignore */ }
  const code = `AQ${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  try { localStorage.setItem("aqla.referralCode", code); } catch { /* ignore */ }
  return code;
}

function InviteFriendsPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

function Inner() {
  const { lang, dir } = useLang();
  const isAr = lang === "ar";

  const [origin, setOrigin] = useState<string>("");
  const [code, setCode] = useState<string>("");

  useEffect(() => {
    setOrigin(window.location.origin);
    setCode(generateReferralCode());
  }, []);

  const referralUrl = useMemo(
    () => (origin && code ? `${origin}/?ref=${code}` : ""),
    [origin, code]
  );
  const shareLandingUrl = useMemo(
    () => (origin && code ? `${origin}/share/invite/${code}` : ""),
    [origin, code]
  );

  const messageAr =
    "انضم معي إلى منصة أقلع — مساحة آمنة ومجانية لدعم الإقلاع عن التدخين والنيكوتين بإشراف مختصين.";
  const messageEn =
    "Join me on Aqla — a free, safe space for smoking and nicotine cessation support supervised by specialists.";
  const message = isAr ? messageAr : messageEn;

  const qrSrc = useMemo(
    () =>
      shareLandingUrl
        ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shareLandingUrl)}`
        : "",
    [shareLandingUrl]
  );

  async function copy() {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success(isAr ? "تم نسخ الرابط." : "Link copied.");
      trackEvent("invite_copy", code);
    } catch {
      toast.error(isAr ? "تعذر النسخ تلقائيًا. يمكنك نسخ الرابط يدويًا." : "Could not copy automatically. Copy the link manually.");
    }
  }

  function share(channel: "whatsapp" | "x" | "linkedin") {
    if (!shareLandingUrl) return;
    const text = `${message} ${referralUrl}`;
    let url = "";
    if (channel === "whatsapp") url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    if (channel === "x") url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralUrl)}`;
    if (channel === "linkedin") url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLandingUrl)}`;
    trackEvent("invite_share", `${channel}:${code}`);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function downloadInviteCard() {
    if (!referralUrl) return;
    try {
      const svg = buildInviteSvg({ isAr, url: referralUrl, code, message });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `aqla-invite-${code}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      trackEvent("invite_download_card", code);
    } catch {
      toast.error(isAr ? "تعذر تحميل الملف حاليًا. حاول مرة أخرى." : "Could not download the file. Please try again.");
    }
  }

  async function nativeShare() {
    if (!referralUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Aqla — أقلع", text: message, url: referralUrl });
        trackEvent("invite_native_share", code);
      } catch { /* user cancelled */ }
    } else {
      copy();
    }
  }

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <div className={isAr ? "text-right" : ""}>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {isAr ? "ادعُ أصدقاءك" : "Invite Your Friends"}
          </h1>
          <p className="mt-3 text-[14.5px] leading-7 text-foreground/75">
            {isAr
              ? "كل دعوة قد تكون بداية رحلة جديدة لأحد أحبائك. هذا الرابط شخصي لك."
              : "Every invitation may be the start of a new journey for someone you care about. This link is personal to you."}
          </p>
        </div>

        <Card className={`mt-6 rounded-2xl p-5 sm:p-6 ${isAr ? "text-right" : ""}`}>
          <label className="text-xs font-semibold uppercase tracking-wider text-primary">
            {isAr ? "رابط الدعوة الشخصي" : "Your invite link"}
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              readOnly
              value={referralUrl}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              className="h-11 flex-1 rounded-md border border-input bg-card px-3 text-sm font-mono"
              aria-label={isAr ? "رابط الدعوة" : "Invite link"}
            />
            <Button onClick={copy} className="gap-2">
              <Copy className="h-4 w-4" />
              {isAr ? "نسخ" : "Copy"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {isAr ? "الرمز: " : "Code: "}
            <span className="font-mono">{code}</span>
          </p>
        </Card>

        <Card className={`mt-6 rounded-2xl p-5 sm:p-6 ${isAr ? "text-right" : ""}`}>
          <h2 className="text-lg font-semibold">{isAr ? "مشاركة" : "Share"}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => share("whatsapp")} className="gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-700" />
              {isAr ? "واتساب" : "WhatsApp"}
            </Button>
            <Button variant="outline" onClick={() => share("x")} className="gap-2">
              <Twitter className="h-4 w-4" />
              X
            </Button>
            <Button variant="outline" onClick={() => share("linkedin")} className="gap-2">
              <Linkedin className="h-4 w-4 text-[#0a66c2]" />
              LinkedIn
            </Button>
            <Button variant="outline" onClick={nativeShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              {isAr ? "خيارات النظام" : "System share"}
            </Button>
            <Button variant="outline" onClick={downloadInviteCard} className="gap-2">
              <Download className="h-4 w-4" />
              {isAr ? "تحميل بطاقة الدعوة" : "Download invite card"}
            </Button>
          </div>
        </Card>

        <Card className={`mt-6 rounded-2xl p-5 sm:p-6 ${isAr ? "text-right" : ""}`}>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <QrCode className="h-4 w-4 text-primary" />
            {isAr ? "رمز QR" : "QR code"}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isAr ? "امسح الرمز للوصول إلى صفحة دعوتك." : "Scan the code to open your invite page."}
          </p>
          {qrSrc && (
            <div className="mt-3 flex flex-col items-start gap-2 sm:items-center sm:justify-center">
              <img src={qrSrc} alt={isAr ? "رمز QR للدعوة" : "Invite QR code"} width={180} height={180} className="rounded-md border border-border/60" />
              <a className="text-xs text-primary underline" href={qrSrc} download={`aqla-invite-${code}.png`}>
                {isAr ? "تحميل صورة الرمز" : "Download QR image"}
              </a>
            </div>
          )}
        </Card>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          {isAr
            ? "بمشاركتك تساهم في نشر التوعية. لا نشارك أي بيانات صحية شخصية."
            : "Sharing helps spread awareness. We never share personal health data."}
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function buildInviteSvg(opts: { isAr: boolean; url: string; code: string; message: string }) {
  const { isAr, url, code, message } = opts;
  const heading = isAr ? "أقلع" : "Aqla";
  const sub = isAr ? "دعوة شخصية للانضمام" : "A personal invitation";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c3b3e" />
      <stop offset="100%" stop-color="#1f7a73" />
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#g)" rx="24"/>
  <text x="400" y="120" text-anchor="middle" font-family="system-ui, sans-serif" font-size="64" font-weight="700" fill="#ffffff">${escapeXml(heading)}</text>
  <text x="400" y="170" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" fill="#cdeeea">${escapeXml(sub)}</text>
  <foreignObject x="60" y="200" width="680" height="120">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color:white;font-family:system-ui,sans-serif;font-size:18px;line-height:1.6;text-align:${isAr ? "right" : "left"};direction:${isAr ? "rtl" : "ltr"};">
      ${escapeXml(message)}
    </div>
  </foreignObject>
  <text x="60" y="380" font-family="monospace" font-size="14" fill="#cdeeea">${escapeXml(code)}</text>
  <text x="740" y="380" text-anchor="end" font-family="monospace" font-size="14" fill="#cdeeea">${escapeXml(url)}</text>
  <text x="400" y="420" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" fill="#9fd6cf">${escapeXml(SITE_URL.replace(/^https?:\/\//, ""))}</text>
</svg>`;
}

function escapeXml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
