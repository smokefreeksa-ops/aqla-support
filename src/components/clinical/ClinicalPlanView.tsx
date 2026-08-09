import { AlertTriangle, ShieldAlert, Info } from "lucide-react";
import type { ClinicalPlanJSON, SafetyGateLevel } from "@/lib/clinical/types";

const LEVEL_STYLES: Record<SafetyGateLevel, { ring: string; bg: string; text: string; label: string }> = {
  self_management: { ring: "ring-[#0b3a25]/20", bg: "bg-[#f2f8f4]", text: "text-[#0b3a25]", label: "دعم ذاتي" },
  pharmacist: { ring: "ring-[#0b3a25]/20", bg: "bg-[#f2f8f4]", text: "text-[#0b3a25]", label: "يمكن استشارة صيدلي" },
  cessation_specialist: { ring: "ring-[#0b3a25]/25", bg: "bg-[#eaf3ed]", text: "text-[#0b3a25]", label: "دعم مختص إقلاع" },
  clinician: { ring: "ring-amber-400/60", bg: "bg-amber-50", text: "text-amber-900", label: "مراجعة طبية موصى بها" },
  urgent: { ring: "ring-orange-500/70", bg: "bg-orange-50", text: "text-orange-900", label: "تقييم طبي عاجل" },
  emergency: { ring: "ring-red-500/70", bg: "bg-red-50", text: "text-red-900", label: "حالة طارئة" },
};

function Section({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <section className="rounded-2xl bg-white ring-1 ring-[#0b3a25]/10 p-4 print:ring-0 print:break-inside-avoid">
      <h3 className="mb-2 text-base font-bold text-[#0b3a25]">{title}</h3>
      <ul className="space-y-1.5 text-[14px] leading-7 text-[#12241b]">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#006C35]" />
            <span style={{ unicodeBidi: "plaintext" }}>{it}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function SafetyCard({ plan }: { plan: ClinicalPlanJSON }) {
  const s = LEVEL_STYLES[plan.safety.level];
  const Icon = plan.safety.level === "emergency" ? ShieldAlert : plan.safety.level === "urgent" ? AlertTriangle : Info;
  return (
    <div className={`rounded-2xl ${s.bg} ring-2 ${s.ring} p-4 print:break-inside-avoid`}>
      <div className={`flex items-center gap-2 font-bold ${s.text}`}>
        <Icon className="h-5 w-5" />
        <span>{s.label}</span>
      </div>
      <p className={`mt-2 text-[14px] leading-7 ${s.text}`} style={{ unicodeBidi: "plaintext" }}>
        {plan.safety.message_ar}
      </p>
      <ul className={`mt-2 space-y-1 text-[13.5px] leading-7 ${s.text}`}>
        {plan.safety.actions_ar.map((a, i) => (
          <li key={i} style={{ unicodeBidi: "plaintext" }}>• {a}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Single renderer for the immutable plan_json.
 * Chat summary, plan page and PDF all render THIS component, so the three
 * surfaces cannot drift apart.
 */
export function ClinicalPlanView({ plan }: { plan: ClinicalPlanJSON }) {
  return (
    <div dir="rtl" className="space-y-3 text-right">
      <SafetyCard plan={plan} />

      {plan.safety.suppress_plan ? (
        <p className="rounded-2xl bg-white ring-1 ring-[#0b3a25]/10 p-4 text-[14px] leading-7">
          أوقفنا توليد خطة الإقلاع مؤقتًا لأن سلامتك الآن أهم. بعد ما تطمئن، ارجع لنا ونكمل الخطة من نفس النقطة.
        </p>
      ) : (
        <>
          <section className="rounded-2xl bg-white ring-1 ring-[#0b3a25]/10 p-4">
            <h2 className="text-lg font-bold text-[#0b3a25]">
              خطة {plan.identity.nickname} السلوكية
            </h2>
            <div className="mt-2 grid gap-1 text-[13.5px] text-[#12241b]/80">
              {plan.dependence.instrument === "FTND" ? (
                <span>
                  مقياس فاجرستروم (FTND): {plan.dependence.total} / 10 — {plan.dependence.band_ar}
                </span>
              ) : (
                <span>
                  {plan.dependence_status === "ftnd_declined"
                    ? "تم تخطي اختبار الاعتماد بناءً على اختيارك."
                    : "لم يُستخدم مقياس اعتماد رقمي — الوصف فقط."}
                </span>
              )}
              {plan.dependence.descriptive_notes.map((n, i) => (
                <span key={i}>{n}</span>
              ))}
              <span>{plan.readiness.text_ar}</span>
            </div>
          </section>

          <Section title={plan.craving_management.title_ar} items={plan.craving_management.items} />
          <Section title={plan.trigger_plan.title_ar} items={plan.trigger_plan.items} />

          <section className="rounded-2xl bg-white ring-1 ring-[#0b3a25]/10 p-4">
            <h3 className="mb-3 text-base font-bold text-[#0b3a25]">الجدول الزمني الكامل</h3>
            <div className="space-y-3">
              {plan.timeline.map((t) => (
                <div key={t.id} className="rounded-xl bg-[#f2f8f4] p-3 print:break-inside-avoid">
                  <h4 className="font-semibold text-[#0b3a25]">{t.title_ar}</h4>
                  <ul className="mt-1 space-y-1 text-[13.5px] leading-7">
                    {t.items.map((i2, i) => (
                      <li key={i} style={{ unicodeBidi: "plaintext" }}>• {i2}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white ring-1 ring-[#0b3a25]/10 p-4">
            <h3 className="mb-1 text-base font-bold text-[#0b3a25]">إذا حصلت زلّة أو انتكاسة</h3>
            <p className="mb-3 text-[13px] text-[#12241b]/70">
              أربع حالات مختلفة تمامًا — لكل واحدة استجابة مختلفة. لا تعاملها كلها كفشل واحد.
            </p>
            <div className="space-y-3">
              {plan.lapse_pathways.map((p) => (
                <div key={p.id} className="rounded-xl bg-[#f2f8f4] p-3 print:break-inside-avoid">
                  <h4 className="font-semibold text-[#0b3a25]">{p.title_ar}</h4>
                  <p className="text-[12.5px] text-[#12241b]/70">{p.trigger_ar}</p>
                  <ul className="mt-1 space-y-1 text-[13.5px] leading-7">
                    {p.steps.map((s, i) => (
                      <li key={i} style={{ unicodeBidi: "plaintext" }}>• {s}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <Section title={plan.support.title_ar} items={plan.support.items} />
          {plan.money ? <Section title={plan.money.title_ar} items={plan.money.items} /> : null}
          <Section title={plan.services.title_ar} items={plan.services.items} />

          {plan.followup.length > 0 && (
            <Section
              title="مواعيد المتابعة"
              items={plan.followup.map((f) => f.label_ar)}
            />
          )}
        </>
      )}

      <div className="rounded-2xl bg-[#fdf3f2] ring-1 ring-red-200 p-4 text-[13px] leading-7 text-red-900">
        {plan.disclaimer_ar}
      </div>

      <details className="rounded-2xl bg-white ring-1 ring-[#0b3a25]/10 p-4 text-[12.5px] text-[#12241b]/70">
        <summary className="cursor-pointer font-semibold text-[#0b3a25]">المراجع ومعلومات الإصدار</summary>
        <ul className="mt-2 space-y-1">
          {plan.references.map((r, i) => (
            <li key={i} dir="ltr" className="text-left">{r}</li>
          ))}
        </ul>
        <p className="mt-2" dir="ltr">
          {plan.clinical_rule_version} · {plan.schema_version} · v{plan.plan_version} ·{" "}
          {plan.jurisdiction} · medication content: excluded
        </p>
      </details>
    </div>
  );
}
