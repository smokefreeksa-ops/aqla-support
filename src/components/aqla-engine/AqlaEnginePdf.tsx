import type { EngineResult } from "@/lib/aqla-engine/types";

type Props = {
  result: EngineResult;
  resultId: string;
  userName?: string;
  supportPersonName?: string;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="text-blue-900 text-lg font-extrabold border-b-2 border-blue-900 pb-1 mb-2">
        {title}
      </h2>
      <div className="text-[14px] leading-7">{children}</div>
    </section>
  );
}

export function AqlaEnginePdf({ result, resultId, userName, supportPersonName }: Props) {
  const today = new Date().toLocaleDateString("ar-SA");
  return (
    <div
      id="aqla-engine-print-area"dir="rtl"className="hidden print:block bg-white text-slate-900 p-8 max-w-4xl mx-auto text-right"style={{ fontFamily: "Tajawal, Cairo, system-ui, sans-serif" }}
    >
      <div className="border-b-4 border-blue-900 pb-3 mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-blue-900">أقلع — Aqla</h1>
          <p className="text-slate-700 font-semibold mt-1">خطة إقلاعي الشخصية</p>
        </div>
        <div className="text-xs text-slate-600 text-left">
          <div>التاريخ: {today}</div>
          <div>رمز النتيجة: {resultId.slice(0, 8)}</div>
          {userName && <div>الاسم: {userName}</div>}
        </div>
      </div>

      <Section title="1. نمطي مع النيكوتين">
        <p>{result.human_explanation}</p>
        <ul className="list-disc pr-5 mt-2">
          {result.pattern_labels.map((p) => <li key={p}>{p}</li>)}
        </ul>
      </Section>

      <Section title="2. مستوى الاعتماد العملي">
        <p>الفئة: <b>{result.dependence_category}</b></p>
        {typeof result.hsi_score === "number" && <p>مؤشر HSI للسجائر: {result.hsi_score} / 6</p>}
        <p>مؤشر أقلع العملي للنيكوتين: {result.aqla_intensity_score} / 10</p>
        <p className="mt-2">جاهزية: {result.readiness_text}</p>
      </Section>

      <Section title="3. أقوى محفزاتي">
        <p>المحفز الأساسي: {result.primary_trigger_pattern}</p>
        {result.secondary_trigger_pattern && <p>المحفز الثانوي: {result.secondary_trigger_pattern}</p>}
      </Section>

      <Section title="4. سببي الشخصي">
        {result.personal_reasons.length ? (
          <ul className="list-disc pr-5">
            {result.personal_reasons.map((r) => <li key={r}>{r}</li>)}
          </ul>
        ) : <p>—</p>}
      </Section>

      <Section title="5. أول خطوة خلال 24 ساعة">
        <p>{result.first_24h_step}</p>
      </Section>

      <Section title="6. خطة 7 أيام">
        <ol className="list-decimal pr-5 space-y-1">
          {result.seven_day_plan.map((d) => (
            <li key={d.day}><b>اليوم {d.day}:</b> {d.task}</li>
          ))}
        </ol>
      </Section>

      <Section title="7. خطة أول 72 ساعة">
        <ul className="list-disc pr-5 space-y-1">
          {result.seventy_two_hour_plan.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        {result.trigger_plans.length > 0 && (
          <div className="mt-3 space-y-2">
            {result.trigger_plans.map((p) => (
              <div key={p.title}>
                <p className="font-bold text-blue-900">{p.title}</p>
                <ul className="list-disc pr-5">
                  {p.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="8. بطاقة الرغبة">
        <div className="border-2 border-blue-900 rounded p-3 bg-blue-50">
          <p className="font-semibold">{result.craving_card}</p>
        </div>
      </Section>

      <Section title="9. هل أحتاج مختصًا؟">
        <p>{result.referral_message}</p>
      </Section>

      <Section title="10. موعد المتابعة">
        <ul className="list-disc pr-5">
          {result.follow_up_schedule.map((f) => <li key={f.type}>{f.label_ar}</li>)}
        </ul>
        {supportPersonName && (
          <p className="mt-2">شخص الدعم: <b>{supportPersonName}</b></p>
        )}
      </Section>

      <p className="mt-6 text-[11px] text-slate-500 border-t border-slate-200 pt-2">
        هذه الوثيقة لأغراض الدعم والتثقيف الصحي ضمن منصة أقلع، ولا تُغني عن استشارة الطبيب أو الصيدلي
        المختص، ولا تتضمن أي جرعات دوائية. — Aqla Personal Quit Engine
      </p>
    </div>
  );
}
