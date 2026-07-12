import { useState } from "react";

const TRIGGERS: { key: string; label: string }[] = [
  { key: "coffee", label: "بعد القهوة" },
  { key: "meal", label: "بعد الأكل" },
  { key: "stress", label: "ضغط أو توتر" },
  { key: "smokers", label: "مع المدخنين" },
  { key: "car", label: "في السيارة" },
  { key: "work", label: "في العمل" },
  { key: "bored", label: "ملل" },
  { key: "anger", label: "غضب" },
  { key: "other", label: "أخرى" },
];

export function SOSComplete({
  cravingBefore,
  cravingAfter,
  onDone,
  redcapUrl,
  onLogTrigger,
}: {
  cravingBefore: number;
  cravingAfter: number;
  onDone: () => void;
  redcapUrl?: string;
  onLogTrigger: (key: string | undefined) => void;
}) {
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [selectedTrigger, setSelectedTrigger] = useState<string | undefined>();
  const delta = cravingBefore - cravingAfter;
  const dropped = delta > 0;

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
      <div className="rounded-3xl bg-white/5 border border-white/10 p-8 w-full">
        <p className="text-white/60 text-sm mb-2">قوة الرغبة</p>
        <div className="flex items-baseline justify-center gap-4">
          <span className="text-5xl font-bold text-white/80 line-through decoration-red-500/60">
            {cravingBefore}
          </span>
          <span className="text-white/40 text-2xl">→</span>
          <span className="text-6xl font-extrabold text-white">
            {cravingAfter}
          </span>
        </div>
        <p className="text-white/60 text-sm mt-2">من ١٠</p>
      </div>

      {dropped ? (
        <>
          <h1 className="text-2xl font-bold text-white">
            انخفضت الرغبة من {cravingBefore} إلى {cravingAfter}
          </h1>
          <p className="text-white/80 leading-relaxed">
            أنت لم تنتظر انتهاء الرغبة. أنت غيّرت مسارها.
          </p>
          <p className="text-white/60 text-sm">
            {delta} {delta === 1 ? "درجة" : "درجات"} أقل خلال جلسة واحدة
          </p>
        </>
      ) : (
        <>
          <h1 className="text-xl font-bold text-white">
            الجلسة اكتملت
          </h1>
          <p className="text-white/70 text-sm max-w-xs leading-relaxed">
            أحياناً الفائدة ليست فوراً. المهم أنك تدخلت بدل أن تتصرف.
          </p>
        </>
      )}

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => onDone()}
          className="rounded-full px-6 py-3 text-white font-semibold shadow-lg"
          style={{
            backgroundImage: "linear-gradient(135deg,#ef4444,#b91c1c)",
          }}
        >
          العودة إلى أقلع
        </button>
        <button
          onClick={() => setTriggerOpen((o) => !o)}
          className="text-white/70 text-sm underline underline-offset-4 hover:text-white"
        >
          ما الذي أشعل الرغبة؟
        </button>
      </div>

      {triggerOpen && (
        <div className="w-full flex flex-wrap gap-2 justify-center">
          {TRIGGERS.map((t) => {
            const sel = selectedTrigger === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setSelectedTrigger(t.key);
                  onLogTrigger(t.key);
                }}
                className={`rounded-full px-3 py-1.5 text-sm border transition ${
                  sel
                    ? "bg-red-600 border-red-500 text-white"
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      {redcapUrl && (
        <div className="mt-4 rounded-2xl bg-white/5 border border-white/10 p-4 w-full">
          <h3 className="text-white font-semibold text-sm">
            ساعدنا في تطوير تدخلات الإقلاع
          </h3>
          <p className="text-white/60 text-xs mt-1">
            شارك طوعاً في دراستنا البحثية حول الرغبة بالتدخين.
          </p>
          <a
            href={redcapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 rounded-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm"
          >
            المشاركة في الدراسة
          </a>
        </div>
      )}
    </div>
  );
}
