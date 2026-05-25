import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { EngineResult } from "@/lib/aqla-engine/types";

type Props = {
  result: EngineResult;
  resultId: string;
  userName?: string;
  supportPersonName?: string;
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6">
      <h2 className="text-lg md:text-xl font-extrabold text-blue-900 mb-3 border-b-2 border-blue-100 pb-2">{title}</h2>
      <div className="text-slate-800 leading-7 text-[15px]">{children}</div>
    </div>
  );
}

export function AqlaEngineResult({ result, resultId, userName, supportPersonName }: Props) {
  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(result.share_text);
      toast.success("تم نسخ نص المشاركة");
    } catch {
      toast.error("تعذر النسخ");
    }
  };

  return (
    <div dir="rtl" className="text-right max-w-3xl mx-auto px-4 py-6 print:hidden space-y-5">
      {result.safety_immediate && (
        <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 text-red-900">
          <p className="font-bold mb-1">رسالة سلامة</p>
          <p>{result.safety_immediate}</p>
        </div>
      )}

      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-900">{result.result_title}</h1>
        <p className="text-slate-600 mt-2">{result.human_explanation}</p>
      </div>

      <Card title="1. نمطك مع النيكوتين">
        <div className="flex flex-wrap gap-2">
          {result.pattern_labels.length ? result.pattern_labels.map((p) => (
            <span key={p} className="bg-blue-100 text-blue-900 px-3 py-1 rounded-full text-sm font-semibold">{p}</span>
          )) : <span className="text-slate-500">لم تُحدد محفزات بعد</span>}
        </div>
      </Card>

      <Card title="2. مستوى الاعتماد العملي">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Stat label="الفئة" value={result.dependence_category} />
          {typeof result.hsi_score === "number" && <Stat label="HSI (سجائر)" value={`${result.hsi_score} / 6`} />}
          <Stat label="مؤشر أقلع العملي" value={`${result.aqla_intensity_score} / 10`} />
        </div>
        <p className="mt-3 text-slate-700">{result.readiness_text}</p>
      </Card>

      <Card title="3. أقوى محفزاتك">
        <p>المحفز الأساسي: <b className="text-blue-900">{result.primary_trigger_pattern}</b></p>
        {result.secondary_trigger_pattern && <p>المحفز الثانوي: <b className="text-blue-900">{result.secondary_trigger_pattern}</b></p>}
      </Card>

      <Card title="4. أول خطوة خلال 24 ساعة">
        <p className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900">{result.first_24h_step}</p>
      </Card>

      <Card title="5. خطتك خلال 7 أيام">
        <ol className="space-y-2">
          {result.seven_day_plan.map((d) => (
            <li key={d.day} className="flex gap-3">
              <span className="bg-blue-900 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">{d.day}</span>
              <span>{d.task}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card title="6. خطتك لأول 72 ساعة بعد الإقلاع">
        <ul className="list-disc pr-5 space-y-1">
          {result.seventy_two_hour_plan.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
        {result.trigger_plans.length > 0 && (
          <div className="mt-4 space-y-3">
            {result.trigger_plans.map((p) => (
              <div key={p.title} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="font-bold text-blue-900 mb-2">{p.title}</p>
                <ul className="list-disc pr-5 space-y-1">
                  {p.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
                {p.craving_card && (
                  <p className="mt-2 text-sm text-slate-700 border-r-4 border-blue-900 pr-3">{p.craving_card}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="7. بطاقة الرغبة الشخصية">
        <div className="border-2 border-blue-900 rounded-xl p-4 bg-blue-50">
          <p className="font-semibold text-blue-900">{result.craving_card}</p>
        </div>
      </Card>

      <Card title="8. هل تحتاج إحالة؟">
        <p className={result.referral_needed ? "text-amber-900" : "text-emerald-900"}>{result.referral_message}</p>
      </Card>

      {(supportPersonName || result.support_message_template) && (
        <Card title="9. خطة الدعم من شخص واحد">
          {supportPersonName && <p className="mb-2">شخص الدعم: <b className="text-blue-900">{supportPersonName}</b></p>}
          {result.support_message_template && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm">
              {result.support_message_template}
            </div>
          )}
        </Card>
      )}

      <Card title="10. المتابعة">
        <ul className="space-y-1">
          {result.follow_up_schedule.map((f) => (
            <li key={f.type} className="flex items-center gap-2">
              <span className="text-blue-900">●</span> {f.label_ar}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="11. مشاركة النتيجة">
        <p className="text-slate-700 mb-3">{result.share_text}</p>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={copyShare} className="bg-blue-900 hover:bg-blue-800 text-white">نسخ نص المشاركة</Button>
          <Button onClick={() => window.print()} className="bg-emerald-700 hover:bg-emerald-800 text-white">
            تحميل / طباعة PDF
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-2">رمز النتيجة: {resultId.slice(0, 8)} — {userName ?? ""}</p>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-bold text-blue-900">{value}</div>
    </div>
  );
}
