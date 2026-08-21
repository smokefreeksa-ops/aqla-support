import { useEffect } from "react";
import { useVoiceAnalysis } from "../hooks/useVoiceAnalysis";
import type { AcousticState } from "../sos.types";

export function VoiceCapture({
  onComplete,
  onSkip,
}: {
  onComplete: (a: AcousticState | undefined) => void;
  onSkip: () => void;
}) {
  const { state, capture, cancel } = useVoiceAnalysis();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const r = await capture();
      if (!mounted) return;
      onComplete(r);
    })();
    return () => {
      mounted = false;
      cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const level = state.liveLevel;
  const size = 180 + level * 60;

  return (
    <div className="flex flex-col items-center text-center gap-5 max-w-md w-full">
      <h1 className="text-2xl sm:text-3xl font-bold text-white">
        دعني ألتقط حالتك الآن
      </h1>
      <p className="text-base text-white/80">قل أي جملة لمدة ٥ ثوانٍ</p>
      <p className="text-sm text-white/60 italic">
        «أنا أشعر بالرغبة الآن وسأتجاوز هذه اللحظة»
      </p>

      <div className="relative grid place-items-center h-64 w-64">
        <div
          className="absolute rounded-full transition-all duration-100 ease-out"
          style={{
            width: size,
            height: size,
            background:
              "radial-gradient(circle,rgba(239,68,68,0.55) 0%,rgba(239,68,68,0) 70%)",
          }}
        />
        <div
          className="absolute rounded-full border border-white/20"
          style={{ width: 180, height: 180 }}
        />
        <div className="relative text-white text-6xl font-bold tabular-nums">
          {state.status === "requesting" ? "…" : state.secondsLeft}
        </div>
      </div>

      <p className="text-xs text-white/60 max-w-xs leading-relaxed">
        يُحلَّل الصوت على جهازك فقط. لا نحفظ التسجيل الصوتي ولا نرسله إلى الخادم.
      </p>
      <p className="text-[11px] text-white/40 max-w-xs">
        Your voice is analysed on your device. The audio recording is not stored or uploaded.
      </p>

      {state.status === "error" && (
        <div className="flex flex-col gap-3 items-center mt-2">
          <p className="text-sm text-white/90">
            لا مشكلة. سنبدأ مباشرة بناءً على نمطك الشخصي.
          </p>
          <button
            onClick={onSkip}
            className="rounded-full px-6 py-2 bg-white/10 text-white text-sm hover:bg-white/20"
          >
            المتابعة
          </button>
        </div>
      )}

      {state.status !== "error" && (
        <button
          onClick={onSkip}
          className="text-white/50 text-xs underline underline-offset-4 hover:text-white/70"
        >
          تخطي التحليل الصوتي
        </button>
      )}
    </div>
  );
}
