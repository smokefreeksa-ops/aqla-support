import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useMemo, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Languages, Download, Share2, Copy, RotateCcw, Sparkles, ArrowLeft, Award, HeartHandshake } from "lucide-react";
import { useLangState, LangContext, useLang } from "@/lib/i18n";
import { recordPosterCreation, recordPosterEvent, isUnsafeMessage } from "@/lib/poster.functions";
import { createShareCard } from "@/lib/share.functions";
import { ShareButtons } from "@/components/ShareButtons";
import { getAnonSessionId } from "@/lib/analytics";
import { trackEvent } from "@/lib/track-event";
import { toast } from "sonner";
import aqlaLogo from "@/assets/aqla-logo.png";
import html2canvas from "html2canvas";

export const Route = createFileRoute("/poster-studio")({
  head: () => ({
    meta: [
      { title: "Aqla Awareness Poster Studio — استوديو أقلع للتوعية" },
      { name: "description", content: "Create personalized tobacco and nicotine awareness posters with Aqla. Add your name, choose a message, and share." },
      { property: "og:title", content: "Aqla Awareness Poster Studio" },
      { property: "og:description", content: "Design and share Aqla awareness posters to spread tobacco and nicotine awareness." },
    ],
  }),
  component: PosterStudioPage,
});

type PosterType = "awareness" | "medal" | "quit_pledge" | "supporter" | "volunteer" | "ig_story" | "square";
type TemplateKey = "premium_green" | "youth_modern" | "saudi_vision" | "minimal_white" | "challenge_winner" | "volunteer_supporter" | "quit_pledge";
type ExportSize = "ig_square" | "ig_story" | "x_post" | "wa_status" | "a4";

const POSTER_TYPES: { key: PosterType; ar: string; en: string; icon: typeof Sparkles }[] = [
  { key: "awareness", ar: "منشور توعوي", en: "Awareness Poster", icon: Sparkles },
  { key: "medal", ar: "وسام داعم للتوعية", en: "Awareness Support Medal", icon: Award },
  { key: "quit_pledge", ar: "بطاقة وعد الإقلاع", en: "Quit Pledge Card", icon: HeartHandshake },
  { key: "supporter", ar: "بطاقة داعم لشخص يريد الإقلاع", en: "Supporter Card", icon: HeartHandshake },
  { key: "volunteer", ar: "بطاقة متطوع توعوي", en: "Volunteer Awareness Card", icon: HeartHandshake },
  { key: "ig_story", ar: "قصة إنستغرام", en: "Instagram Story", icon: Sparkles },
  { key: "square", ar: "منشور مربع", en: "Square Post", icon: Sparkles },
];

const MESSAGES: { key: string; ar: string; en: string }[] = [
  { key: "msg1", ar: "أنا أدعم مجتمعًا أكثر وعيًا", en: "I support a more aware community" },
  { key: "msg2", ar: "التوعية تبدأ بخطوة", en: "Awareness starts with one step" },
  { key: "msg3", ar: "أبدأ التغيير اليوم", en: "I start change today" },
  { key: "msg4", ar: "كن سببًا في مساعدة غيرك", en: "Be the reason someone gets support" },
  { key: "msg5", ar: "لست وحدك في رحلة الإقلاع", en: "You are not alone in the quitting journey" },
  { key: "msg6", ar: "صحتي تستحق بداية جديدة", en: "My health deserves a new start" },
  { key: "msg7", ar: "معًا لمجتمع أقل تدخينًا وأكثر وعيًا", en: "Together for a more aware, smoke-free community" },
  { key: "msg8", ar: "أنا داعم للتوعية ضد التدخين والنيكوتين", en: "I support tobacco and nicotine awareness" },
  { key: "msg9", ar: "أقلع… خطوة نحو حياة أصفى", en: "Aqla: one step toward a clearer life" },
  { key: "msg10", ar: "أشارك لنشر الوعي", en: "I share to spread awareness" },
];

type Template = {
  key: TemplateKey;
  ar: string;
  en: string;
  bg: string; // tailwind/inline css
  fg: string;
  accent: string;
};

const TEMPLATES: Template[] = [
  { key: "premium_green", ar: "الأخضر الرسمي", en: "Premium Green", bg: "linear-gradient(135deg,#064e3b 0%,#0d7a5f 50%,#10b981 100%)", fg: "#ffffff", accent: "#fcd34d" },
  { key: "youth_modern", ar: "الشبابي العصري", en: "Youth Modern", bg: "linear-gradient(135deg,#14b8a6 0%,#06b6d4 100%)", fg: "#ffffff", accent: "#fef3c7" },
  { key: "saudi_vision", ar: "أسلوب وطني أنيق", en: "Saudi Vision Style", bg: "linear-gradient(135deg,#0f3d2e 0%,#1a5e3a 60%,#2d8a5a 100%)", fg: "#ffffff", accent: "#d4af37" },
  { key: "minimal_white", ar: "الأبيض البسيط", en: "Minimal White", bg: "linear-gradient(180deg,#f8faf9 0%,#e6f4ee 100%)", fg: "#0f3d2e", accent: "#0d7a5f" },
  { key: "challenge_winner", ar: "وسام التحدي", en: "Challenge Winner", bg: "linear-gradient(135deg,#1a3a2e 0%,#2d6a4f 50%,#74c69d 100%)", fg: "#fffbeb", accent: "#fcd34d" },
  { key: "volunteer_supporter", ar: "داعم متطوع", en: "Volunteer Supporter", bg: "linear-gradient(135deg,#0d7a5f 0%,#52b788 100%)", fg: "#ffffff", accent: "#fef9c3" },
  { key: "quit_pledge", ar: "وعد الإقلاع", en: "Quit Pledge", bg: "linear-gradient(160deg,#0c4a3e 0%,#10b981 100%)", fg: "#ffffff", accent: "#fcd34d" },
];

const EXPORT_SIZES: { key: ExportSize; ar: string; en: string; w: number; h: number }[] = [
  { key: "ig_square", ar: "مربع إنستغرام", en: "Instagram Square", w: 1080, h: 1080 },
  { key: "ig_story", ar: "قصة إنستغرام", en: "Instagram Story", w: 1080, h: 1920 },
  { key: "x_post", ar: "منشور منصة X", en: "X / Twitter Post", w: 1600, h: 900 },
  { key: "wa_status", ar: "حالة واتساب", en: "WhatsApp Status", w: 1080, h: 1920 },
  { key: "a4", ar: "ملصق A4", en: "A4 Poster", w: 1240, h: 1754 },
];

function PosterStudioPage() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <Inner />
    </LangContext.Provider>
  );
}

function Inner() {
  const { lang, setLang, dir } = useLang();
  const isAr = lang === "ar";

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [posterType, setPosterType] = useState<PosterType>("awareness");
  const [displayName, setDisplayName] = useState("");
  const [city, setCity] = useState("");
  const [messageKey, setMessageKey] = useState<string>("msg2");
  const [customMessage, setCustomMessage] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [template, setTemplate] = useState<TemplateKey>("premium_green");
  const [exportSize, setExportSize] = useState<ExportSize>("ig_square");
  const [downloading, setDownloading] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [sharePath, setSharePath] = useState<string | null>(null);
  const [generatingShare, setGeneratingShare] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  const createFn = useServerFn(recordPosterCreation);
  const eventFn = useServerFn(recordPosterEvent);
  const shareFn = useServerFn(createShareCard);

  useEffect(() => { trackEvent("poster_studio_viewed"); }, []);

  const selectedTemplate = useMemo(() => TEMPLATES.find((t) => t.key === template)!, [template]);
  const selectedSize = useMemo(() => EXPORT_SIZES.find((s) => s.key === exportSize)!, [exportSize]);
  const finalName = displayName.trim() || (isAr ? "داعم أقلع" : "Aqla Supporter");
  const finalMessage = useCustom && customMessage.trim()
    ? customMessage.trim()
    : (MESSAGES.find((m) => m.key === messageKey)?.[isAr ? "ar" : "en"] ?? "");

  const customLen = isAr ? 90 : 120;
  const customTooLong = useCustom && customMessage.length > customLen;
  const customUnsafe = useCustom && customMessage.trim().length > 0 && isUnsafeMessage(customMessage);

  const fireEvent = async (event_type: string) => {
    try {
      await eventFn({ data: {
        event_type,
        poster_type: posterType,
        template_name: template,
        city: city.trim() || null,
        anonymous_session_id: getAnonSessionId(),
      }});
    } catch { /* ignore */ }
  };

  const recordOnce = async () => {
    if (recorded) return;
    setRecorded(true);
    try {
      const res = await createFn({ data: {
        poster_type: posterType,
        template_name: template,
        display_name: displayName.trim() || null,
        city: city.trim() || null,
        message_key: useCustom ? null : messageKey,
        custom_message: useCustom ? (customMessage.trim() || null) : null,
        language: lang,
        export_size: exportSize,
        anonymous_session_id: getAnonSessionId(),
      }});
      if (!res.ok && res.error === "unsafe_message") {
        toast.error(isAr
          ? "لا يمكن استخدام هذه العبارة لأنها قد تُفهم كنصيحة طبية أو ادعاء علاجي. يرجى اختيار عبارة توعوية عامة."
          : "This phrase cannot be used because it may be understood as medical advice or a treatment claim. Please choose a general awareness message.");
        setRecorded(false);
      }
    } catch { setRecorded(false); }
  };

  const downloadPng = async () => {
    if (!previewRef.current) return;
    if (customUnsafe || customTooLong) return;
    setDownloading(true);
    try {
      // Ensure all images (logo) inside the preview are fully loaded before snapshot
      const imgs = Array.from(previewRef.current.querySelectorAll("img"));
      await Promise.all(imgs.map((img) => img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })));
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: Math.max(2, Math.min(3, selectedSize.w / previewRef.current.offsetWidth)),
        useCORS: true,
        allowTaint: false,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `aqla-poster-${template}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      void fireEvent("poster_downloaded");
      void recordOnce();
      toast.success(isAr ? "تم تحميل الصورة" : "Image downloaded");
    } catch (e) {
      toast.error(isAr ? "تعذّر التحميل" : "Download failed");
    } finally {
      setDownloading(false);
    }
  };

  const shareText = useMemo(() => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/poster-studio` : "/poster-studio";
    return isAr
      ? `صممت منشوري التوعوي مع أقلع لنشر الوعي حول التدخين والنيكوتين. جرّب أنت أيضًا: ${url}`
      : `I created my Aqla awareness poster to spread tobacco and nicotine awareness. Try it here: ${url}`;
  }, [isAr]);

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
    void fireEvent("poster_shared_whatsapp");
    void recordOnce();
  };
  const shareX = () => {
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
    void fireEvent("poster_shared_x");
    void recordOnce();
  };
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success(isAr ? "تم نسخ النص" : "Text copied");
      void fireEvent("poster_text_copied");
      void recordOnce();
    } catch { /* ignore */ }
  };

  const createShareLink = async () => {
    if (!previewRef.current || generatingShare) return;
    if (customUnsafe || customTooLong) return;
    setGeneratingShare(true);
    try {
      const imgs = Array.from(previewRef.current.querySelectorAll("img"));
      await Promise.all(imgs.map((img) => img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })));
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: false,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const res = await shareFn({ data: {
        share_type: "poster",
        anonymous_session_id: getAnonSessionId(),
        title_ar: "بطاقة توعوية من أقلع",
        title_en: "An Aqla awareness poster",
        message_ar: finalMessage || "مستقبلي يستاهل أبدأ من اليوم.",
        message_en: "Share awareness with Aqla.",
        cta_ar: "صمم بطاقتك",
        cta_en: "Create yours",
        target_path: "/poster-studio",
        safe_public_payload: {
          template,
          poster_type: posterType,
          city: city.trim() || null,
          language: lang,
        },
        image_data_url: dataUrl,
      }});
      setSharePath(res.share_path);
      void recordOnce();
      toast.success(isAr ? "تم إنشاء رابط المشاركة" : "Share link ready");
    } catch (e) {
      console.error(e);
      toast.error(isAr ? "تعذّر إنشاء رابط المشاركة" : "Couldn't create share link");
    } finally {
      setGeneratingShare(false);
    }
  };

  const reset = () => {
    setStep(1);
    setRecorded(false);
    setUseCustom(false);
    setCustomMessage("");
    setSharePath(null);
  };

  return (
    <div dir={dir} className="min-h-screen bg-background">
      <header className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={aqlaLogo} alt="Aqla — أقلع logo" className="h-10 w-auto" />
            <div className="leading-tight">
              <div className="font-semibold">{isAr ? "أقلع" : "Aqla"}</div>
              <div className="text-[11px] text-muted-foreground">{isAr ? "استوديو التوعية" : "Awareness Studio"}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLang(isAr ? "en" : "ar")} className="gap-1.5">
              <Languages className="h-4 w-4" />
              {isAr ? "English" : "العربية"}
            </Button>
            <Link to="/">
              <Button variant="outline" size="sm">{isAr ? "الرئيسية" : "Home"}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-primary">
            {isAr ? "استوديو أقلع للتوعية" : "Aqla Awareness Poster Studio"}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {isAr
              ? "اكتب اسمك، اختر رسالتك، وشارك بطاقة توعوية تحمل شعار أقلع لنشر الوعي حول التدخين والنيكوتين."
              : "Add your name, choose your message, and share an Aqla awareness card to spread tobacco and nicotine awareness."}
          </p>
        </section>

        {/* Stepper */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={`flex h-7 w-7 items-center justify-center rounded-full border ${step === n ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground"}`}>
              {n}
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_440px]">
          {/* LEFT — controls */}
          <div className="space-y-6">
            {step === 1 && (
              <Card className="p-5">
                <h2 className="text-lg font-semibold">{isAr ? "اختر نوع التصميم" : "Choose poster type"}</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {POSTER_TYPES.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => { setPosterType(p.key); void fireEvent("poster_type_selected"); setStep(2); }}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-start transition hover:border-primary hover:bg-primary-soft ${posterType === p.key ? "border-primary bg-primary-soft" : ""}`}
                    >
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">{isAr ? p.ar : p.en}</span>
                    </button>
                  ))}
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card className="p-5 space-y-4">
                <h2 className="text-lg font-semibold">{isAr ? "اكتب اسمك (اختياري)" : "Enter your name (optional)"}</h2>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value.slice(0, 60))}
                  placeholder={isAr ? "اكتب اسمك أو اسمًا مستعارًا" : "Enter your name or nickname"}
                  dir={dir}
                />
                <p className="text-xs text-muted-foreground">
                  {isAr ? `إذا تركته فارغًا سيُستخدم "داعم أقلع".` : `If left empty, "Aqla Supporter" will be used.`}
                </p>
                <div>
                  <label className="text-sm font-medium">{isAr ? "أضف مدينتك (اختياري)" : "Add your city (optional)"}</label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value.slice(0, 60))}
                    placeholder={isAr ? "مثال: جدة" : "e.g. Jeddah"}
                    dir={dir}
                    className="mt-2"
                  />
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 rtl:rotate-180" />{isAr ? "السابق" : "Back"}</Button>
                  <Button onClick={() => setStep(3)}>{isAr ? "التالي" : "Next"}</Button>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card className="p-5 space-y-4">
                <h2 className="text-lg font-semibold">{isAr ? "اختر رسالتك التوعوية" : "Choose your awareness message"}</h2>
                <div className="grid gap-2">
                  {MESSAGES.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => { setMessageKey(m.key); setUseCustom(false); }}
                      className={`rounded-lg border p-3 text-start text-sm transition hover:border-primary ${!useCustom && messageKey === m.key ? "border-primary bg-primary-soft" : ""}`}
                    >
                      {isAr ? m.ar : m.en}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={useCustom} onChange={(e) => setUseCustom(e.target.checked)} />
                    {isAr ? "رسالة مخصصة قصيرة" : "Use a short custom message"}
                  </label>
                  {useCustom && (
                    <>
                      <Textarea
                        className="mt-2"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value.slice(0, customLen + 20))}
                        placeholder={isAr ? "اكتب رسالة توعوية قصيرة" : "Write a short awareness message"}
                        dir={dir}
                        maxLength={customLen + 20}
                      />
                      <div className={`mt-1 text-xs ${customTooLong ? "text-destructive" : "text-muted-foreground"}`}>
                        {customMessage.length} / {customLen}
                      </div>
                      {customUnsafe && (
                        <p className="mt-2 text-xs text-destructive">
                          {isAr
                            ? "لا يمكن استخدام هذه العبارة لأنها قد تُفهم كنصيحة طبية أو ادعاء علاجي. يرجى اختيار عبارة توعوية عامة."
                            : "This phrase cannot be used because it may be understood as medical advice or a treatment claim. Please choose a general awareness message."}
                        </p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 rtl:rotate-180" />{isAr ? "السابق" : "Back"}</Button>
                  <Button onClick={() => setStep(4)} disabled={customUnsafe || customTooLong}>{isAr ? "التالي" : "Next"}</Button>
                </div>
              </Card>
            )}

            {step === 4 && (
              <Card className="p-5 space-y-4">
                <h2 className="text-lg font-semibold">{isAr ? "اختر القالب" : "Choose template"}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setTemplate(t.key)}
                      className={`rounded-xl border-2 p-3 text-start transition ${template === t.key ? "border-primary" : "border-transparent hover:border-primary/40"}`}
                    >
                      <div className="h-16 w-full rounded-md" style={{ background: t.bg }} />
                      <div className="mt-2 text-sm font-medium">{isAr ? t.ar : t.en}</div>
                    </button>
                  ))}
                </div>

                <h3 className="pt-2 text-sm font-semibold">{isAr ? "حجم التصدير" : "Export size"}</h3>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {EXPORT_SIZES.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setExportSize(s.key)}
                      className={`rounded-lg border p-2 text-xs transition ${exportSize === s.key ? "border-primary bg-primary-soft" : ""}`}
                    >
                      {isAr ? s.ar : s.en}
                      <div className="text-[10px] text-muted-foreground">{s.w}×{s.h}</div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4 rtl:rotate-180" />{isAr ? "السابق" : "Back"}</Button>
                  <Button onClick={() => { setStep(5); void fireEvent("poster_preview_generated"); }}>{isAr ? "معاينة" : "Preview"}</Button>
                </div>
              </Card>
            )}

            {step === 5 && (
              <Card className="p-5 space-y-3">
                <h2 className="text-lg font-semibold">{isAr ? "حفظ ومشاركة" : "Save & share"}</h2>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={downloadPng} disabled={downloading || customUnsafe} className="gap-1.5">
                    <Download className="h-4 w-4" />{isAr ? "تحميل الصورة" : "Download image"}
                  </Button>
                  <Button onClick={shareWhatsApp} variant="secondary" className="gap-1.5">
                    <Share2 className="h-4 w-4" />{isAr ? "واتساب" : "WhatsApp"}
                  </Button>
                  <Button onClick={shareX} variant="secondary" className="gap-1.5">
                    <Share2 className="h-4 w-4" />{isAr ? "منصة X" : "Share on X"}
                  </Button>
                  <Button onClick={copyText} variant="outline" className="gap-1.5">
                    <Copy className="h-4 w-4" />{isAr ? "نسخ النص" : "Copy text"}
                  </Button>
                  <Button onClick={reset} variant="outline" className="gap-1.5">
                    <RotateCcw className="h-4 w-4" />{isAr ? "تصميم آخر" : "Another design"}
                  </Button>
                  <Link to="/assessment" onClick={() => fireEvent("poster_start_assessment_clicked")}>
                    <Button className="w-full gap-1.5">
                      <Sparkles className="h-4 w-4" />{isAr ? "ابدأ تقييم أقلع" : "Start Aqla assessment"}
                    </Button>
                  </Link>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <div className="text-sm font-medium">
                    {isAr ? "رابط مشاركة عام (يعمل على LinkedIn و X)" : "Public share link (works on LinkedIn & X)"}
                  </div>
                  {!sharePath ? (
                    <Button
                      onClick={createShareLink}
                      disabled={generatingShare || customUnsafe}
                      variant="default"
                      className="w-full gap-1.5 bg-emerald-700 hover:bg-emerald-800"
                    >
                      <Share2 className="h-4 w-4" />
                      {generatingShare
                        ? (isAr ? "جاري الإنشاء…" : "Creating…")
                        : (isAr ? "أنشئ رابط مشاركة" : "Create share link")}
                    </Button>
                  ) : (
                    <ShareButtons
                      shareUrl={`https://aqla-support.lovable.app${sharePath}`}
                      textAr={`${finalMessage}\n\nصممت بطاقتي مع أقلع — جرّب أنت أيضًا.`}
                      textEn="I created my Aqla awareness card. Try yours too."
                      lang={isAr ? "ar" : "en"}
                    />
                  )}
                </div>

                <p className="text-[11px] text-muted-foreground">
                  {isAr
                    ? "منشور توعوي ولا يمثل نصيحة طبية شخصية."
                    : "Awareness content only. Not personal medical advice."}
                </p>
              </Card>
            )}
          </div>

          {/* RIGHT — preview */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <Card className="p-3">
              <div className="text-center text-xs text-muted-foreground mb-2">
                {isAr ? "معاينة مباشرة" : "Live preview"}
              </div>
              <div className="mx-auto" style={{ width: "100%", maxWidth: 380 }}>
                <PosterPreview
                  ref={previewRef}
                  template={selectedTemplate}
                  posterType={posterType}
                  size={selectedSize}
                  name={finalName}
                  city={city.trim()}
                  message={finalMessage}
                  isAr={isAr}
                />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

import { forwardRef } from "react";

type PreviewProps = {
  template: Template;
  posterType: PosterType;
  size: { key: ExportSize; w: number; h: number };
  name: string;
  city: string;
  message: string;
  isAr: boolean;
};

const PosterPreview = forwardRef<HTMLDivElement, PreviewProps>(function PosterPreview(
  { template, posterType, size, name, city, message, isAr },
  ref,
) {
  const aspect = size.w / size.h;
  const isMedal = posterType === "medal";
  const isVolunteer = posterType === "volunteer";
  const isPledge = posterType === "quit_pledge";

  return (
    <div
      ref={ref}
      dir={isAr ? "rtl" : "ltr"}
      style={{
        background: template.bg,
        color: template.fg,
        aspectRatio: `${aspect}`,
        width: "100%",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
        padding: "6%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: isAr ? "'Tajawal', 'Inter', sans-serif" : "'Inter', sans-serif",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
      }}
    >
      {/* Decorative ring */}
      <div style={{
        position: "absolute", top: "-20%", right: "-15%", width: "60%", height: "60%",
        borderRadius: "50%", background: `${template.accent}22`, filter: "blur(2px)",
      }} />
      <div style={{
        position: "absolute", bottom: "-20%", left: "-15%", width: "55%", height: "55%",
        borderRadius: "50%", background: `${template.accent}15`, filter: "blur(2px)",
      }} />

      {/* Top: logo + title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: "#ffffff",
            borderRadius: 10,
            padding: "6px 8px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}>
            <img
              src={aqlaLogo}
              alt="Aqla — أقلع"
              crossOrigin="anonymous"
              onError={(e) => { console.warn("Aqla logo failed to load"); (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              style={{ height: "min(44px, 7.5vw)", width: "auto", display: "block", objectFit: "contain" }}
            />
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 700, fontSize: "clamp(14px, 3.6vw, 22px)" }}>Aqla — أقلع</div>
            <div style={{ fontSize: "clamp(9px, 2vw, 12px)", opacity: 0.85 }}>Tobacco & Nicotine Awareness</div>
          </div>
        </div>
        {isMedal && (
          <div style={{
            border: `3px solid ${template.accent}`, color: template.accent,
            borderRadius: "50%", padding: "8px 10px", fontSize: "clamp(10px, 2.2vw, 14px)", fontWeight: 700,
          }}>
            ★
          </div>
        )}
      </div>

      {/* Center: main content */}
      <div style={{ position: "relative", textAlign: "center" }}>
        {isMedal ? (
          <>
            <div style={{ fontSize: "clamp(11px, 2.4vw, 14px)", opacity: 0.9 }}>
              {isAr ? "يُمنح هذا الوسام إلى" : "This medal is presented to"}
            </div>
            <div style={{ marginTop: 8, fontWeight: 800, fontSize: "clamp(22px, 6vw, 38px)", color: template.accent }}>
              {name}
            </div>
            <div style={{ marginTop: 8, fontSize: "clamp(11px, 2.6vw, 14px)", opacity: 0.95 }}>
              {isAr
                ? "لمساهمته في نشر الوعي حول التدخين والنيكوتين"
                : "for supporting tobacco and nicotine awareness"}
            </div>
          </>
        ) : isVolunteer ? (
          <>
            <div style={{ fontWeight: 800, fontSize: "clamp(18px, 5vw, 30px)", color: template.accent }}>{name}</div>
            <div style={{ marginTop: 10, fontWeight: 700, fontSize: "clamp(14px, 3.4vw, 20px)" }}>
              {isAr ? "أنا متطوع/ة لدعم التوعية مع أقلع" : "I volunteer to support awareness with Aqla"}
            </div>
          </>
        ) : isPledge ? (
          <>
            <div style={{ fontSize: "clamp(11px, 2.4vw, 14px)", opacity: 0.9 }}>
              {isAr ? "وعد الإقلاع" : "Quit Pledge"}
            </div>
            <div style={{ marginTop: 8, fontWeight: 800, fontSize: "clamp(20px, 5.5vw, 34px)", color: template.accent }}>{name}</div>
            <div style={{ marginTop: 10, fontWeight: 600, fontSize: "clamp(13px, 3vw, 18px)", lineHeight: 1.4 }}>
              {message}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 700, fontSize: "clamp(16px, 4.5vw, 28px)", lineHeight: 1.3 }}>{message}</div>
            <div style={{ marginTop: 14, fontSize: "clamp(11px, 2.4vw, 14px)", opacity: 0.85 }}>
              {isAr ? "— " : "— "}{name}
            </div>
          </>
        )}
        {city && (
          <div style={{ marginTop: 10, display: "inline-block", padding: "4px 10px", borderRadius: 999, background: `${template.accent}33`, color: template.fg, fontSize: "clamp(9px, 2vw, 12px)" }}>
            {isAr ? `من ${city} لدعم التوعية` : `From ${city} for awareness`}
          </div>
        )}
      </div>

      {/* Bottom: footer */}
      <div style={{ position: "relative", textAlign: "center", fontSize: "clamp(9px, 2vw, 11px)", opacity: 0.85, lineHeight: 1.5 }}>
        <div style={{ fontWeight: 600 }}>
          {isAr ? "أقلع — Aqla | للتوعية حول التدخين والنيكوتين" : "Aqla — أقلع | Tobacco & Nicotine Awareness"}
        </div>
        {isMedal && (
          <div style={{ marginTop: 4, fontSize: "clamp(8px, 1.7vw, 10px)", opacity: 0.7 }}>
            {isAr
              ? "وسام توعوي رمزي، وليس شهادة تدريب أو اعتماد مهني."
              : "Symbolic awareness badge, not a training certificate or professional credential."}
          </div>
        )}
        <div style={{ marginTop: 4, fontSize: "clamp(8px, 1.7vw, 10px)", opacity: 0.7 }}>
          {isAr ? "منشور توعوي ولا يمثل نصيحة طبية شخصية." : "Awareness content only. Not personal medical advice."}
        </div>
      </div>
    </div>
  );
});
