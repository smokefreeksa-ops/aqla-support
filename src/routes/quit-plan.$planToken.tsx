import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Download, Mail, MessageCircle, Loader2 } from "lucide-react";
import { getQuitPlan, scheduleReminder } from "@/lib/quit-plan.functions";
import { getClinicalPlan } from "@/lib/clinical/clinical-plan.functions";
import { ClinicalPlanPage } from "@/components/clinical/ClinicalPlanPage";
import type { ClinicalPlanJSON } from "@/lib/clinical/types";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { QuitPlanJSON } from "@/lib/quit-plan-builder";

export const Route = createFileRoute("/quit-plan/$planToken")({
  head: () => ({ meta: [{ title: "خطة أقلع الشخصية" }] }),
  component: PlanRouter,
});

/**
 * Release 1 plans are rendered by ClinicalPlanView. A Release 1 token is never
 * passed into the legacy QuitPlanJSON renderer (which can contain medication wording).
 */
function PlanRouter() {
  const { planToken } = Route.useParams();
  const getClinical = useServerFn(getClinicalPlan);

  const { data, isLoading } = useQuery({
    queryKey: ["clinical-plan", planToken],
    queryFn: () => getClinical({ data: { planToken } }),
  });

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" /> جارٍ تحميل الخطة…
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (data?.isRelease1 && data.plan) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <SiteHeader />
        <ClinicalPlanPage plan={data.plan as ClinicalPlanJSON} planToken={planToken} />
        <SiteFooter />
      </div>
    );
  }

  return <PlanPage />;
}

function PlanPage() {
  const { planToken } = Route.useParams();
  const getFn = useServerFn(getQuitPlan);
  const remindFn = useServerFn(scheduleReminder);
  const [downloading, setDownloading] = useState(false);
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["quit-plan", planToken],
    queryFn: () => getFn({ data: { planToken } }),
  });

  const plan = data?.plan as { id: string; nickname: string | null; plan: QuitPlanJSON | null; email_sent_at: string | null } | null | undefined;
  const planJson = (plan?.plan ?? null) as QuitPlanJSON | null;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";


  async function downloadPdf() {
    if (!planJson) return;
    setDownloading(true);
    try {
      const [{ pdf }, { QuitPlanPdf }, QR] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/lib/quit-plan-pdf"),
        import("qrcode"),
      ]);
      const qrDataUrl = await QR.toDataURL(shareUrl, { margin: 1, width: 200 });
      const blob = await pdf(<QuitPlanPdf plan={planJson} qrDataUrl={qrDataUrl} shareUrl={shareUrl} planId={plan?.id ?? planToken} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `aqla-quit-plan-${plan?.id ?? planToken}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("تم إنشاء الخطة، لكن تعذر إنشاء ملف PDF حاليًا. يرجى المحاولة مرة أخرى.");
    } finally {
      setDownloading(false);
    }
  }

  async function schedule(type: "24h" | "3d" | "7d" | "14d" | "28d") {
    try {
      const res = await remindFn({ data: { planToken, type, channel: "email" } });
      setReminderMsg(res.message);
    } catch {
      setReminderMsg("تعذر حفظ التذكير الآن، حاول لاحقًا.");
    }
  }

  if (isLoading) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-10 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto h-6 w-6 animate-spin" /> جارٍ تحميل الخطة…
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!plan || !planJson) {
    return (
      <div dir="rtl" className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <p className="text-sm">لم يتم العثور على الخطة.</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">خطة أقلع الشخصية — {planJson.identity.nickname}</h1>
          <p className="text-xs text-muted-foreground">
            {plan.email_sent_at
              ? "تم إرسال نسخة إلى بريدك الإلكتروني."
              : "تم إنشاء الخطة، لكن تعذر إرسال البريد الإلكتروني حاليًا. يمكنك تحميل الخطة PDF أو نسخ الرابط."}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={downloadPdf} disabled={downloading} className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              تحميل خطة أقلع PDF
            </button>
            <button onClick={() => { navigator.clipboard.writeText(shareUrl); setReminderMsg("تم نسخ الرابط."); }} className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
              نسخ الرابط
            </button>
            <a href="https://wa.me/966555096412" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <MessageCircle className="h-4 w-4" /> دعم واتساب
            </a>
            <a href="mailto:smokefreeksa@gmail.com" className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm">
              <Mail className="h-4 w-4" /> إيميل الدعم
            </a>
          </div>
        </header>

        <div className="rounded-2xl bg-primary/5 p-4">
          <h2 className="text-lg font-bold">{planJson.title}</h2>
          <p className="mt-1 text-xs text-muted-foreground">{planJson.subtitle}</p>
        </div>

        <Section title="A. ملخص خطتك">
          <Row k="الاسم" v={planJson.identity.nickname} />
          <Row k="المدينة" v={planJson.identity.city} />
          <Row k="تاريخ إنشاء الخطة" v={new Date(planJson.meta.generated_at).toLocaleString("ar-SA")} />
          <Row k="المنتج" v={planJson.use.product_ar} />
          {planJson.use.daily_use_pattern && <Row k="نمط الاستخدام اليومي" v={planJson.use.daily_use_pattern} />}
          {planJson.use.time_to_first_use && <Row k="أول استخدام بعد الاستيقاظ" v={planJson.use.time_to_first_use} />}
          {planJson.use.craving_pattern && <Row k="نمط الرغبة الشديدة" v={planJson.use.craving_pattern} />}
          {planJson.use.previous_quit_attempts && <Row k="محاولات سابقة" v={planJson.use.previous_quit_attempts} />}
          <Row k="الأداة المستخدمة" v={planJson.assessment.instrument_label_ar} />
          <Row k="نطاق النتيجة" v={`${planJson.assessment.band_ar} (مجموع ${planJson.assessment.total})`} />
          {!planJson.assessment.validated && <p className="text-xs text-amber-600">تقييم مكيّف (غير معتمد).</p>}
          <Row k="الهدف الحالي" v={planJson.goal.label_ar} />
          <Row k="الاستعداد" v={planJson.readiness.label_ar} />
          <Row k="تاريخ البداية" v={planJson.dates.quit_or_reduce_date ?? "—"} />
          <Row k="طريقة المتابعة" v={planJson.followup_preference_ar} />
          <Cite text={planJson.summary_citation} />
        </Section>

        <Section title="B. ماذا تعني نتيجتك؟">
          <p>{planJson.score_meaning}</p>
        </Section>

        <Section title="C. هدفك الحالي">
          <p>{planJson.goal.text}</p>
        </Section>

        <Section title="D. محفزاتك الأساسية">
          <List items={planJson.triggers} />
        </Section>

        <Section title="E. خطة التعامل مع المحفزات">
          <List items={planJson.trigger_plan} />
          <Cite text={planJson.trigger_plan_citation} />
        </Section>

        <Section title="F. خطة أول 24 ساعة"><List items={planJson.first_24h} /></Section>
        <Section title="G. خطة أول 7 أيام"><List items={planJson.first_7d} /></Section>

        <Section title="H. خطة 28 يوم">
          <List items={planJson.follow_up_28d} />
          <Cite text={planJson.follow_up_28d_citation} />
        </Section>

        <Section title="I. خطة الرغبة الشديدة">
          <List items={planJson.craving_rescue} />
          <Cite text={planJson.craving_rescue_citation} />
        </Section>

        <Section title="J. إذا رجعت للاستخدام">
          <List items={planJson.relapse_plan} />
          <Cite text={planJson.relapse_plan_citation} />
        </Section>

        <Section title="شخص الدعم"><List items={planJson.support_person_plan} /></Section>

        <Section title="K. خيارات يمكن مناقشتها مع الصيدلي أو الطبيب">
          <p className="text-sm">{planJson.pharmacy_discussion.intro}</p>

          <h3 className="mt-4 text-sm font-semibold">1. بدائل النيكوتين (NRT)</h3>
          <p className="text-sm">{planJson.pharmacy_discussion.nrt_intro}</p>
          <div className="mt-2 space-y-3">
            {planJson.pharmacy_discussion.nrt_details.map((o, i) => (
              <div key={i} className="rounded-md border border-border bg-background p-3">
                <p className="font-semibold">• {o.name}</p>
                <p className="text-xs mt-1"><span className="text-muted-foreground">ما هو؟</span> {o.what_is}</p>
                <p className="text-xs mt-1"><span className="text-muted-foreground">الفائدة:</span> {o.purpose}</p>
                <p className="text-xs mt-1"><span className="text-muted-foreground">أعراض محتملة:</span> {o.common_issues}</p>
                <p className="text-xs mt-1"><span className="text-muted-foreground">ملاحظة سلامة:</span> {o.safety}</p>
              </div>
            ))}
          </div>

          <h3 className="mt-4 text-sm font-semibold">2. أدوية وصفية غير نيكوتينية</h3>
          <div className="mt-2 space-y-3">
            {planJson.pharmacy_discussion.prescription_details.map((o, i) => (
              <div key={i} className="rounded-md border border-border bg-background p-3">
                <p className="font-semibold">• {o.name}</p>
                <p className="text-xs mt-1"><span className="text-muted-foreground">ما هو؟</span> {o.what_is}</p>
                <p className="text-xs mt-1"><span className="text-muted-foreground">الفائدة:</span> {o.purpose}</p>
                <p className="text-xs mt-1"><span className="text-muted-foreground">أعراض محتملة:</span> {o.common_issues}</p>
                <p className="text-xs mt-1"><span className="text-muted-foreground">ملاحظة سلامة:</span> {o.safety}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-md bg-amber-50 p-3 text-xs text-amber-900">
            {planJson.pharmacy_discussion.important_notes.map((n, i) => <p key={i}>• {n}</p>)}
          </div>
          <p className="mt-2 text-sm">{planJson.pharmacy_discussion.closing}</p>
          <Cite text={planJson.pharmacy_discussion.citations} />
        </Section>

        <Section title="L. متى أحتاج مراجعة مختص؟">
          <List items={planJson.when_to_seek_help} />
          <Cite text={planJson.when_to_seek_help_citation} />
        </Section>

        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
          <p className="font-semibold mb-1">M. الحالات الطارئة</p>
          {planJson.emergency_disclaimer}
        </div>

        <Section title="N. المتابعة">
          <Row k="طريقة المتابعة المختارة" v={planJson.followup_preference_ar} />
          <Row k="المتابعة القادمة" v={planJson.dates.followup_next} />
          <List items={planJson.followup_schedule} />
          <div className="flex flex-wrap gap-2 mt-3">
            {(["24h", "3d", "7d", "14d", "28d"] as const).map((t) => (
              <button key={t} onClick={() => schedule(t)} className="rounded-full border border-input bg-background px-3 py-1.5 text-xs">
                جدول تذكير {t}
              </button>
            ))}
          </div>
          {reminderMsg && <p className="mt-2 text-xs text-muted-foreground">{reminderMsg}</p>}
        </Section>

        <Section title="O. روابط أقلع">
          <List items={planJson.aqla_links.map((l) => `${l.label}: ${l.href}`)} />
        </Section>

        <Section title="P. المراجع">
          <ol className="list-decimal pr-5 space-y-1 text-xs text-foreground/80">
            {planJson.references.map((r) => (
              <li key={r.id}>{r.full}</li>
            ))}
          </ol>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}

function Cite({ text }: { text: string }) {
  return <p className="mt-2 text-[11px] text-primary/80">{text}</p>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="text-sm font-semibold mb-2">{title}</h2>
      <div className="text-sm leading-7 text-foreground/80 space-y-1">{children}</div>
    </section>
  );
}
function Row({ k, v }: { k: string; v: string | number }) {
  return <p><span className="text-muted-foreground">{k}:</span> <span className="font-medium">{v}</span></p>;
}
function List({ items }: { items: string[] }) {
  return <ul className="list-disc pr-5 space-y-1">{items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>;
}
