import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import {
  PRODUCT_OPTIONS, FIRST_USE_OPTIONS, CIGS_PER_DAY, SHISHA_SESSIONS,
  SHISHA_DURATION, VAPE_PATTERNS, POUCH_FREQ, TRIGGER_OPTIONS,
  PREV_ATTEMPTS, RELAPSE_CAUSES, SAFETY_OPTIONS, PERSONAL_REASONS,
  STEP_TITLES,
} from "@/lib/aqla-engine/questions";
import type {
  EngineAnswers, ProductType, FirstUseAfterWaking, TriggerKey, SafetyFlag,
} from "@/lib/aqla-engine/types";
import { submitQuitEngine } from "@/lib/aqla-engine/storage";

const EMPTY: EngineAnswers = {
  product_types: [], mixed_use: false, relapse_prevention_mode: false,
  triggers: [], importance_score: 5, confidence_score: 5, readiness_score: 5,
  relapse_causes: [], safety_flags: [], personal_reasons: [],
};

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  const k = "aqla_engine_session";
  let s = localStorage.getItem(k);
  if (!s) { s = crypto.randomUUID(); localStorage.setItem(k, s); }
  return s;
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-right px-4 py-3 rounded-xl border-2 transition-all text-sm md:text-base ${
        active
          ? "bg-blue-900 text-white border-blue-900 shadow-md": "bg-white text-slate-800 border-slate-200 hover:border-blue-400"
      }`}
    >
      {children}
    </button>
  );
}

function MultiPick<T extends string>({
  options, values, onToggle,
}: {
  options: { value: T; label: string }[];
  values: T[];
  onToggle: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((o) => (
        <Chip key={o.value} active={values.includes(o.value)} onClick={() => onToggle(o.value)}>
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

function SinglePick<T extends string>({
  options, value, onChange,
}: {
  options: { value: T; label: string }[];
  value: T | undefined;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((o) => (
        <Chip key={o.value} active={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </Chip>
      ))}
    </div>
  );
}

function StringSinglePick({ options, value, onChange }: { options: string[]; value: string | undefined; onChange: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((o) => (
        <Chip key={o} active={value === o} onClick={() => onChange(o)}>{o}</Chip>
      ))}
    </div>
  );
}

function StringMultiPick({ options, values, onToggle }: { options: string[]; values: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((o) => (
        <Chip key={o} active={values.includes(o)} onClick={() => onToggle(o)}>{o}</Chip>
      ))}
    </div>
  );
}

export function AqlaQuitEngine() {
  const [step, setStep] = useState(0);
  const [a, setA] = useState<EngineAnswers>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const submit = useServerFn(submitQuitEngine);

  const update = (patch: Partial<EngineAnswers>) => setA((p) => ({ ...p, ...patch }));

  const toggleProduct = (v: ProductType) => {
    const next = a.product_types.includes(v)
      ? a.product_types.filter((x) => x !== v)
      : [...a.product_types, v];
    const real = next.filter((p) => p !== "multiple"&& p !== "relapse_prevention");
    update({
      product_types: next,
      primary_product: real[0],
      mixed_use: real.length > 1 || next.includes("multiple"),
      relapse_prevention_mode: next.includes("relapse_prevention"),
    });
  };

  const toggleTrigger = (v: TriggerKey) => {
    const next = a.triggers.includes(v) ? a.triggers.filter((x) => x !== v) : [...a.triggers, v];
    update({ triggers: next });
  };

  const toggleSafety = (v: SafetyFlag) => {
    let next = a.safety_flags.includes(v) ? a.safety_flags.filter((x) => x !== v) : [...a.safety_flags, v];
    if (v === "none"&& next.includes("none")) next = ["none"];
    else if (v !== "none") next = next.filter((x) => x !== "none");
    update({ safety_flags: next });
  };

  const toggleReason = (v: string) => {
    if (a.personal_reasons.includes(v)) {
      update({ personal_reasons: a.personal_reasons.filter((x) => x !== v) });
    } else if (a.personal_reasons.length < 3) {
      update({ personal_reasons: [...a.personal_reasons, v] });
    } else {
      toast.info("يمكنك اختيار 3 أسباب كحد أقصى");
    }
  };

  const toggleRelapseCause = (v: string) => {
    update({
      relapse_causes: a.relapse_causes.includes(v)
        ? a.relapse_causes.filter((x) => x !== v)
        : [...a.relapse_causes, v],
    });
  };

  const canNext = (): boolean => {
    switch (step) {
      case 0: return a.product_types.length > 0;
      case 1: return !!a.first_use_after_waking;
      case 2: {
        if (a.product_types.includes("cigarettes") && !a.cigarettes_per_day) return false;
        if (a.product_types.includes("shisha") && (!a.shisha_sessions_per_week || !a.shisha_session_duration)) return false;
        if (a.product_types.includes("vape") && !a.vape_pattern) return false;
        if (a.product_types.includes("pouches") && !a.nicotine_pouch_frequency) return false;
        return true;
      }
      case 3: return a.triggers.length > 0 || a.relapse_prevention_mode;
      case 4: return true;
      case 5: return !!a.previous_quit_attempts;
      case 6: return a.safety_flags.length > 0;
      case 7: return true;
      default: return true;
    }
  };

  const onSubmit = async () => {
    setSubmitting(true);
    try {
      const r = await submit({ data: { answers: a, sessionId: getSessionId() } });
      if (!r.emailDelivered && a.email) {
        toast.info("تم إنشاء الخطة، لكن تعذر إرسال البريد الإلكتروني حاليًا. يمكنك تحميل الخطة PDF أو نسخ الرابط.");
      } else {
        toast.success("تم إنشاء خطتك الشخصية");
      }
      navigate({ to: "/aqla-quit-engine/result/$resultId", params: { resultId: r.resultId } });
    } catch (e) {
      toast.error("تعذر إنشاء الخطة. حاول مجددًا.");
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / 8) * 100;

  return (
    <div dir="rtl"className="text-right max-w-2xl mx-auto px-4 py-6 print:hidden">
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
          <span>الخطوة {step + 1} من 8</span>
          <span className="font-semibold text-blue-900">{STEP_TITLES[step]}</span>
        </div>
        <Progress value={progress} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-7"
        >
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-3">أي من هذه تستخدم حاليًا؟</h2>
              <p className="text-slate-600 text-sm mb-4">اختر كل ما ينطبق عليك.</p>
              <MultiPick options={PRODUCT_OPTIONS} values={a.product_types} onToggle={toggleProduct} />
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-3">بعد الاستيقاظ، متى تستخدم أول نيكوتين؟</h2>
              <SinglePick options={FIRST_USE_OPTIONS} value={a.first_use_after_waking} onChange={(v: FirstUseAfterWaking) => update({ first_use_after_waking: v })} />
              {(a.first_use_after_waking === "lt_5"|| a.first_use_after_waking === "6_30") && (
                <div className="mt-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-sm">
                  يبدو أن النيكوتين يدخل يومك مبكرًا. هذا لا يعني أنك ضعيف، لكنه يعني أن جسمك قد يطلب النيكوتين بسرعة. خطتك تحتاج دعمًا أقوى في الصباح وأول 72 ساعة.
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {a.product_types.includes("cigarettes") && (
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">كم سيجارة تدخن في اليوم عادة؟</h3>
                  <StringSinglePick options={CIGS_PER_DAY} value={a.cigarettes_per_day} onChange={(v) => update({ cigarettes_per_day: v })} />
                </div>
              )}
              {a.product_types.includes("shisha") && (
                <>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">كم جلسة شيشة في الأسبوع؟</h3>
                    <StringSinglePick options={SHISHA_SESSIONS} value={a.shisha_sessions_per_week} onChange={(v) => update({ shisha_sessions_per_week: v })} />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-2">كم تستمر الجلسة غالبًا؟</h3>
                    <StringSinglePick options={SHISHA_DURATION} value={a.shisha_session_duration} onChange={(v) => update({ shisha_session_duration: v })} />
                  </div>
                </>
              )}
              {a.product_types.includes("vape") && (
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">كيف تصف استخدامك للفيب أو السحبة؟</h3>
                  <StringSinglePick options={VAPE_PATTERNS} value={a.vape_pattern} onChange={(v) => update({ vape_pattern: v })} />
                </div>
              )}
              {a.product_types.includes("pouches") && (
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">كم مرة تستخدم أكياس النيكوتين يوميًا؟</h3>
                  <StringSinglePick options={POUCH_FREQ} value={a.nicotine_pouch_frequency} onChange={(v) => update({ nicotine_pouch_frequency: v })} />
                </div>
              )}
              {!a.product_types.some((p) => ["cigarettes","shisha","vape","pouches"].includes(p)) && (
                <p className="text-slate-600">لا توجد أسئلة كمية إضافية لاختياراتك. اضغط متابعة.</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-3">متى تكون الرغبة أقوى؟</h2>
              <p className="text-slate-600 text-sm mb-4">اختر كل ما ينطبق.</p>
              <MultiPick options={TRIGGER_OPTIONS} values={a.triggers} onToggle={toggleTrigger} />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <SliderQ label="من 0 إلى 10، ما مدى أهمية الإقلاع بالنسبة لك الآن؟" value={a.importance_score} onChange={(v) => update({ importance_score: v })} />
              <SliderQ label="من 0 إلى 10، ما مدى ثقتك أنك تستطيع البدء بخطة إقلاع؟" value={a.confidence_score} onChange={(v) => update({ confidence_score: v })} />
              <SliderQ label="من 0 إلى 10، ما مدى استعدادك لتحديد تاريخ إقلاع خلال 14 يومًا؟" value={a.readiness_score} onChange={(v) => update({ readiness_score: v })} />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-3">هل حاولت الإقلاع من قبل؟</h2>
                <StringSinglePick options={PREV_ATTEMPTS} value={a.previous_quit_attempts} onChange={(v) => update({ previous_quit_attempts: v, longest_abstinence: v })} />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">ما الذي أعادك غالبًا؟</h3>
                <StringMultiPick options={RELAPSE_CAUSES} values={a.relapse_causes} onToggle={toggleRelapseCause} />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
                محاولتك السابقة ليست فشلًا. هي تعطينا خريطة. إذا عدت بسبب القهوة مثلًا، فخطة هذه المرة تبدأ من القهوة، لا من تكرار نفس القرار.
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="text-xl font-bold text-blue-900 mb-3">هل ينطبق عليك أي مما يلي؟</h2>
              <p className="text-slate-600 text-sm mb-4">اختر كل ما ينطبق. هذه المعلومة لسلامتك.</p>
              <MultiPick options={SAFETY_OPTIONS} values={a.safety_flags} onToggle={toggleSafety} />
              {a.safety_flags.includes("suicidal_ideation") && (
                <div className="mt-4 bg-red-50 border-2 border-red-300 rounded-lg p-4 text-red-900 text-sm">
                  سلامتك أهم من الإقلاع الآن. إذا لديك أفكار إيذاء للنفس أو تشعر أنك في خطر، تواصل فورًا مع خدمات الطوارئ في بلدك أو شخص موثوق قريب منك. يمكننا العودة لخطة الإقلاع بعد تأمين سلامتك.
                </div>
              )}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-3">ما أهم سبب يجعلك تريد الإقلاع؟</h2>
                <p className="text-slate-600 text-sm mb-3">اختر 3 كحد أقصى.</p>
                <StringMultiPick options={PERSONAL_REASONS} values={a.personal_reasons} onToggle={toggleReason} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">اسمك (اختياري)</label>
                  <Input value={a.user_name ?? ""} onChange={(e) => update({ user_name: e.target.value })} placeholder="مثلًا: أبو خالد" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">شخص الدعم (اختياري)</label>
                  <Input value={a.support_person_name ?? ""} onChange={(e) => update({ support_person_name: e.target.value })} placeholder="اسم صديق أو قريب" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">بريدك الإلكتروني (اختياري — لإرسال نسخة من الخطة)</label>
                  <Input type="email"value={a.email ?? ""} onChange={(e) => update({ email: e.target.value })} placeholder="name@example.com" />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center justify-between mt-6 gap-3">
        <Button variant="outline" disabled={step === 0 || submitting} onClick={() => setStep((s) => Math.max(0, s - 1))}>
          السابق
        </Button>
        {step < 7 ? (
          <Button disabled={!canNext()} className="bg-blue-900 hover:bg-blue-800 text-white" onClick={() => setStep((s) => s + 1)}>
            متابعة
          </Button>
        ) : (
          <Button disabled={submitting} className="bg-blue-900 hover:bg-blue-800 text-white" onClick={onSubmit}>
            {submitting ? "جاري إنشاء الخطة...": "أنشئ خطتي الشخصية"}
          </Button>
        )}
      </div>
    </div>
  );
}

function SliderQ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      <div className="flex items-center gap-4 mt-3">
        <span className="text-2xl font-extrabold text-blue-900 w-10 text-center">{value}</span>
        <Slider value={[value]} min={0} max={10} step={1} onValueChange={(v) => onChange(v[0] ?? 0)} />
      </div>
    </div>
  );
}
