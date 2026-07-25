import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Languages, Download, Sparkles, ShieldCheck, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useLang, useLangState, LangContext } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import { AqlaLogoBadge } from "@/components/AqlaLogoBadge";
import { ShareButtons } from "@/components/ShareButtons";
import { createShareCard } from "@/lib/share.functions";
import { getAnonSessionId } from "@/lib/analytics";
import { trackEvent } from "@/lib/track-event";
import aqlaLogo from "@/assets/aqla-logo.png";

export const Route = createFileRoute("/support-invite")({
  head: () => ({
    meta: [
      { title: "أرسل رسالة لشخص يهمك — Send a Message to Someone You Care About | Aqla" },
      { name: "description", content: "اكتب اسم الشخص، أضف رسالتك، وصمّم بطاقة دعم تحمل شعار أقلع. Create a respectful, Aqla-branded support card to share by WhatsApp, SMS, or link." },
      { property: "og:title", content: "أرسل رسالة لشخص يهمك — Aqla" },
      { property: "og:description", content: "بطاقة دعم محترمة بشعار أقلع ورابط مباشر للتجربة." },
    ],
  }),
  component: PageWrap,
});

function PageWrap() {
  const ctx = useLangState();
  return (
    <LangContext.Provider value={ctx}>
      <SupportInvitePage />
    </LangContext.Provider>
  );
}

type RelKey = "friend" | "sibling" | "parent" | "spouse" | "colleague" | "student" | "relative" | "someone";
type StyleKey = "gentle" | "emotional" | "short" | "formal" | "warm" | "encouraging";

const REL: { key: RelKey; ar: string; en: string }[] = [
  { key: "friend", ar: "صديق", en: "Friend" },
  { key: "sibling", ar: "أخ / أخت", en: "Brother / Sister" },
  { key: "parent", ar: "أب / أم", en: "Parent" },
  { key: "spouse", ar: "زوج / زوجة", en: "Spouse" },
  { key: "colleague", ar: "زميل", en: "Colleague" },
  { key: "student", ar: "طالب", en: "Student" },
  { key: "relative", ar: "قريب", en: "Relative" },
  { key: "someone", ar: "شخص يهمني", en: "Someone I care about" },
];

const STYLES: { key: StyleKey; ar: string; en: string }[] = [
  { key: "gentle", ar: "لطيفة", en: "Gentle" },
  { key: "emotional", ar: "مؤثرة", en: "Emotional" },
  { key: "short", ar: "مختصرة", en: "Short" },
  { key: "formal", ar: "رسمية", en: "Formal" },
  { key: "warm", ar: "قريبة وعفوية", en: "Warm and personal" },
  { key: "encouraging", ar: "مشجعة بدون ضغط", en: "Encouraging without pressure" },
];

// Default templates by style
const TEMPLATES_AR: Record<StyleKey, (r: string) => string> = {
  gentle: (r) => `أرسلت لك هذه الدعوة لأنني أهتم لأمرك يا ${r}. ليس المطلوب أن تغيّر كل شيء اليوم؛ يكفي أن تبدأ بفهم أوضح وخطوة صغيرة تناسبك.`,
  emotional: (r) => `${r}، صحتك ومستقبلك يستحقان لحظة انتباه. هذه ليست نصيحة أو ضغطًا، فقط باب بسيط إذا أحببت أن تبدأ.`,
  short: (r) => `${r}، قد تكون هذه مجرد رسالة، لكنها قد تفتح بداية مختلفة. جرّب أقلع عندما تكون مستعدًا، واختر خطوتك بنفسك.`,
  formal: (r) => `${r}، أرسل لك هذه الدعوة تقديرًا لصحتك ومستقبلك. منصة أقلع توفر مسارًا مجانيًا لفهم العلاقة مع التدخين أو النيكوتين واختيار الخطوة المناسبة.`,
  warm: (r) => `${r}، من يهتم لأمرك لا يضغط عليك، بل يذكّرك أنك لست وحدك. إذا أحببت أن تبدأ بخطوة بسيطة، أقلع هنا.`,
  encouraging: (r) => `${r}، ما أبغى أضغط عليك، بس لأنك تهمني حبيت أرسل لك أقلع. يمكن خطوة بسيطة اليوم تفتح باب أفضل بكرة.`,
};

const TEMPLATES_EN: Record<StyleKey, (r: string) => string> = {
  gentle: (r) => `${r}, I sent you this because I care about you. You do not have to change everything today. A clearer understanding and one small step can be enough to begin.`,
  emotional: (r) => `${r}, your health and future are worth a moment of attention. This is not pressure or judgment, just a simple door if you ever want to start.`,
  short: (r) => `${r}, this may be just a message, but it could open a different beginning. Try Aqla when you are ready and choose your own step.`,
  formal: (r) => `${r}, I send you this with respect for your health and future. Aqla is a free pathway to understand smoking or nicotine use and choose the right step.`,
  warm: (r) => `${r}, someone who cares does not pressure you. They simply remind you that you are not alone. If you ever want to start with one small step, Aqla is here.`,
  encouraging: (r) => `${r}, no pressure at all — I just wanted to share Aqla with you because you matter to me. One small step today can open a better door tomorrow.`,
};

// Basic safety filter — block obvious shaming / medical-claim / endorsement wording.
const UNSAFE_PATTERNS: RegExp[] = [
  /أنت\s*ضعيف/i, /أنت\s*فاشل/i, /لازم\s*توقف/i, /غصب/i, /مدمن\s*خطير/i,
  /معتمد\s*من\s*وزارة/i, /وزارة\s*الصحة/i, /شراكة\s*رسمية/i, /تابع\s*لوزارة/i,
  /أشخص/i, /أعالج/i, /وصفة/i, /علاج\s*مضمون/i,
  /you\s+are\s+weak/i, /you\s+failed/i, /you\s+must\s+quit/i,
  /\bi\s+diagnose\b/i, /\bi\s+treat\b/i, /guaranteed\s+cure/i,
  /moh\s+approved/i, /official\s+partner/i, /medically\s+certified/i,
  /ministry\s+of\s+health/i, /vision\s+2030/i,
];

function isUnsafe(text: string): boolean {
  return UNSAFE_PATTERNS.some((p) => p.test(text));
}

function SupportInvitePage() {
  const { lang, setLang, dir } = useLang();
  const isAr = lang === "ar";

  const [recipient, setRecipient] = useState("");
  const [phone, setPhone] = useState("");
  const [inviter, setInviter] = useState("");
  const [relationship, setRelationship] = useState<RelKey>("someone");
  const [style, setStyle] = useState<StyleKey>("gentle");
  const [custom, setCustom] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const createFn = useServerFn(createShareCard);

  useEffect(() => { trackEvent("support_invite_viewed"); }, []);

  const recipientDisplay = recipient.trim() || (isAr ? "شخص يهمني" : "Someone I care about");
  const inviterDisplay = inviter.trim() || (isAr ? "شخص يهتم لأمرك" : "Someone who cares about you");

  const messageAr = useMemo(() => custom.trim() || TEMPLATES_AR[style](recipientDisplay), [custom, style, recipientDisplay]);
  const messageEn = useMemo(() => custom.trim() || TEMPLATES_EN[style](recipientDisplay), [custom, style, recipientDisplay]);
  const message = isAr ? messageAr : messageEn;

  const limitAr = 180, limitEn = 220;
  const limit = isAr ? limitAr : limitEn;
  const customSafe = !custom.trim() || !isUnsafe(custom);

  async function snapshotDataUrl(): Promise<string | null> {
    const el = cardRef.current;
    if (!el) return null;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const imgs = Array.from(el.querySelectorAll("img"));
      await Promise.all(imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : new Promise<void>((res) => {
              img.addEventListener("load", () => res(), { once: true });
              img.addEventListener("error", () => res(), { once: true });
            }),
      ));
      const canvas = await html2canvas(el, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
      return canvas.toDataURL("image/png");
    } catch {
      return null;
    }
  }

  async function createInvite() {
    if (!customSafe) {
      toast.error(isAr
        ? "خلّ الرسالة داعمة ومحترمة، بدون ضغط أو أحكام أو ادعاءات طبية."
        : "Keep the message supportive and respectful, without pressure, judgment, or medical claims.");
      return;
    }
    if (custom.length > limit) {
      toast.error(isAr ? `الرسالة أطول من المسموح (${limit})` : `Message exceeds ${limit} characters`);
      return;
    }
    setCreating(true);
    try {
      const image_data_url = await snapshotDataUrl();
      const res = await createFn({ data: {
        share_type: "support-invite",
        anonymous_session_id: getAnonSessionId(),
        title_ar: isAr ? `رسالة دعم إلى ${recipientDisplay}` : `Support message to ${recipientDisplay}`,
        title_en: `A support message from Aqla`,
        message_ar: messageAr.slice(0, 500),
        message_en: messageEn.slice(0, 500),
        cta_ar: "جرّب أقلع الآن",
        cta_en: "Try Aqla now",
        target_path: "/",
        safe_public_payload: {
          recipient_name: recipientDisplay,
          inviter_name: inviterDisplay,
          relationship,
          message_style: style,
          language: lang,
        },
        image_data_url,
      }});
      if (res?.share_path) {
        const url = `${window.location.origin}${res.share_path}`;
        setShareUrl(url);
        trackEvent("support_invite_created", style);
        toast.success(isAr ? "تم إنشاء البطاقة" : "Card created");
      }
    } catch (e) {
      toast.error(isAr ? "تعذّر إنشاء البطاقة" : "Could not create card");
      console.error(e);
    } finally {
      setCreating(false);
    }
  }

  async function downloadCard() {
    const dataUrl = await snapshotDataUrl();
    if (!dataUrl) {
      toast.error(isAr ? "تعذّر تحميل البطاقة" : "Could not download card");
      return;
    }
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `aqla-support-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    trackEvent("support_invite_downloaded");
  }

  const waText = isAr
    ? `السلام عليك ${recipientDisplay}،\n\nأرسلت لك هذه الدعوة لأنني أهتم لأمرك.\n\n${message}\n\nجرّب أقلع هنا:\n${shareUrl ?? ""}\n\nمن / ${inviterDisplay}\n\n@SmokeOffKSA\n#أقلع #Aqla #ابدأ_بخطوة`
    : `Hi ${recipientDisplay},\n\nI sent you this because I care about you.\n\n${message}\n\nTry Aqla here:\n${shareUrl ?? ""}\n\nFrom / ${inviterDisplay}\n\n@SmokeOffKSA #Aqla #StartWithOneStep`;

  const smsText = isAr
    ? `${recipientDisplay}، ${message}\nجرّب أقلع: ${shareUrl ?? ""}\nمن / ${inviterDisplay}`
    : `${recipientDisplay}, ${message}\nTry Aqla: ${shareUrl ?? ""}\nFrom / ${inviterDisplay}`;

  const directWa = phone.trim()
    ? `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(waText)}`
    : null;
  const directSms = phone.trim()
    ? `sms:${phone.replace(/[^0-9+]/g, "")}?body=${encodeURIComponent(smsText)}`
    : null;

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-emerald-50 via-stone-50 to-teal-50">
      {/* Header */}
      <header className="border-b border-emerald-700/10 bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <AqlaLogoBadge size={36} />
            <span className="font-semibold text-emerald-900">{isAr ? "أقلع" : "Aqla"}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/challenges">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
                {isAr ? "تحديات أقلع" : "Challenges"}
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={() => setLang(isAr ? "en" : "ar")} className="gap-1">
              <Languages className="h-4 w-4" /> {isAr ? "EN" : "ع"}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          <Badge variant="secondary" className="rounded-full px-3 py-1 mb-3">
            <ShieldCheck className="me-1 inline h-3.5 w-3.5" />
            {isAr ? "رسائل دعم محترمة، بدون ضغط" : "Respectful support, no pressure"}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-emerald-900">
            {isAr ? "أرسل رسالة لشخص يهمك" : "Send a Message to Someone You Care About"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {isAr
              ? "اكتب اسم الشخص، أضف رسالتك، وصمّم بطاقة دعم تحمل شعار أقلع يمكن إرسالها عبر واتساب أو الرسائل أو مشاركتها برابط مباشر."
              : "Add the person's name, write your message, and create an Aqla-branded support card that can be sent by WhatsApp, SMS, or shared with a direct link."}
          </p>
          <p className="mt-2 text-xs text-amber-700">
            {isAr
              ? "هذه الرسائل للتوعية والدعم فقط. لا تستخدمها للضغط أو اللوم أو تقديم نصيحة طبية."
              : "These messages are for awareness and support only. Do not use them to pressure, blame, or provide medical advice."}
          </p>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Form */}
          <Card className="p-6 space-y-4">
            <div>
              <Label>{isAr ? "اسم الشخص الذي تريد دعوته" : "Recipient name"}</Label>
              <Input
                value={recipient}
                onChange={(e) => setRecipient(e.target.value.slice(0, 80))}
                placeholder={isAr ? "مثال: محمد" : "Example: Mohammed"}
              />
            </div>

            <div>
              <Label>{isAr ? "رقم الجوال للإرسال (اختياري)" : "Mobile number for sending (optional)"}</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value.slice(0, 20))}
                placeholder="+9665XXXXXXXX"
                inputMode="tel"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {isAr
                  ? "يُستخدم فقط لفتح واتساب أو الرسائل، ولن يظهر في البطاقة أو صفحة المشاركة."
                  : "Used only to open WhatsApp or SMS. Never shown on the card or share page, never stored."}
              </p>
            </div>

            <div>
              <Label>{isAr ? "اسمك أو لقبك" : "Your name or nickname"}</Label>
              <Input
                value={inviter}
                onChange={(e) => setInviter(e.target.value.slice(0, 80))}
                placeholder={isAr ? "مثال: مالك" : "Example: Malik"}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{isAr ? "ما علاقتك به؟" : "Relationship"}</Label>
                <Select value={relationship} onValueChange={(v) => setRelationship(v as RelKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REL.map((r) => (
                      <SelectItem key={r.key} value={r.key}>{isAr ? r.ar : r.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{isAr ? "أسلوب الرسالة" : "Message style"}</Label>
                <Select value={style} onValueChange={(v) => setStyle(v as StyleKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STYLES.map((s) => (
                      <SelectItem key={s.key} value={s.key}>{isAr ? s.ar : s.en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>{isAr ? "اكتب رسالتك الخاصة (اختياري)" : "Write your own message (optional)"}</Label>
              <Textarea
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                placeholder={isAr
                  ? "مثال: أرسلت لك هذه الدعوة لأن صحتك تهمني، ولأن خطوة بسيطة قد تصنع فرقًا كبيرًا."
                  : "Example: I sent you this because your health matters to me, and one small step can make a real difference."}
                rows={4}
                maxLength={limit + 50}
              />
              <div className="flex items-center justify-between text-xs mt-1">
                <span className={custom.length > limit ? "text-destructive" : "text-muted-foreground"}>
                  {custom.length}/{limit}
                </span>
                {!customSafe && (
                  <span className="text-destructive">
                    {isAr ? "الرجاء استخدام صياغة داعمة بدون ضغط أو ادعاءات طبية." : "Please use supportive wording without pressure or medical claims."}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button onClick={createInvite} disabled={creating || !customSafe} className="quit-gradient text-white border-0">
                <Sparkles className="h-4 w-4" />
                {creating
                  ? (isAr ? "جاري الإنشاء…" : "Creating…")
                  : (isAr ? "أنشئ البطاقة وشاركها" : "Create & share card")}
              </Button>
              <Button variant="outline" onClick={downloadCard}>
                <Download className="h-4 w-4" />
                {isAr ? "تحميل البطاقة" : "Download card"}
              </Button>
            </div>
          </Card>

          {/* Preview */}
          <div className="space-y-4">
            <div
              ref={cardRef}
              className="rounded-2xl border border-emerald-700/20 bg-[#fffdf7] shadow-elegant p-6 sm:p-8"
              style={{ minHeight: 480 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={aqlaLogo}
                    alt="Aqla"
                    crossOrigin="anonymous"
                    className="h-12 w-12 object-contain rounded-lg bg-white p-1 shadow-sm"
                  />
                  <div>
                    <div className="font-bold text-emerald-900 leading-tight">{isAr ? "أقلع" : "Aqla"}</div>
                    <div className="text-[11px] text-emerald-700">
                      {isAr ? "رسالة دعم من أقلع" : "A support message from Aqla"}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-600/40 text-emerald-700 text-[10px]">
                  {SITE_URL.replace(/^https?:\/\//, "")}
                </Badge>
              </div>

              <div className="mt-6 border-t border-emerald-700/10 pt-4">
                <div className="text-sm text-emerald-800/80">
                  {isAr ? "إلى /" : "To /"} <span className="font-semibold text-emerald-900">{recipientDisplay}</span>
                </div>
                <p className="mt-4 text-emerald-950 leading-7 whitespace-pre-line">{message}</p>
                <div className="mt-6 text-sm text-emerald-800/80">
                  {isAr ? "من /" : "From /"} <span className="font-semibold text-emerald-900">{inviterDisplay}</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-4 text-center">
                <div className="text-sm">{isAr ? "ابدأ بخطوة بسيطة اليوم" : "Start with one small step today"}</div>
                <div className="font-bold mt-1">{isAr ? "جرّب أقلع الآن" : "Try Aqla now"}</div>
              </div>

              <div className="mt-4 text-[11px] text-emerald-800/70 text-center">
                {isAr
                  ? "أقلع — منصة مجانية للجميع، وستبقى مجانية"
                  : "Aqla — free for everyone, and always will be"}
              </div>
            </div>

            {shareUrl && (
              <Card className="p-4 space-y-3">
                <div className="text-sm font-medium text-emerald-900">
                  {isAr ? "رابط البطاقة للمشاركة" : "Shareable card link"}
                </div>
                <div className="text-xs break-all text-muted-foreground bg-muted p-2 rounded">{shareUrl}</div>
                <ShareButtons
                  shareUrl={shareUrl}
                  textAr={isAr
                    ? `أرسلت رسالة دعم لشخص يهمني عبر أقلع.\n\nأحيانًا لا يحتاج الإنسان إلى ضغط، بل إلى بداية لطيفة.\n\nجرّبها أنت أيضًا:`
                    : undefined}
                  textEn={!isAr
                    ? `I created a support message for someone I care about through Aqla.\n\nSometimes people do not need pressure. They need a gentle beginning.\n\nTry it here:`
                    : undefined}
                  lang={isAr ? "ar" : "en"}
                />
                <div className="flex flex-wrap gap-2 pt-1">
                  {directWa && (
                    <a href={directWa} target="_blank" rel="noopener noreferrer"
                       onClick={() => trackEvent("support_invite_whatsapp_clicked")}>
                      <Button size="sm" variant="outline" className="gap-1 text-emerald-700">
                        <MessageCircle className="h-4 w-4" />
                        {isAr ? "إرسال واتساب مباشر" : "Send via WhatsApp"}
                      </Button>
                    </a>
                  )}
                  {directSms && (
                    <a href={directSms} onClick={() => trackEvent("support_invite_sms_clicked")}>
                      <Button size="sm" variant="outline" className="gap-1">
                        {isAr ? "إرسال رسالة SMS" : "Send via SMS"}
                      </Button>
                    </a>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
