import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Loader2, ShieldCheck, Waves, Wind, AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/voice-craving-scan")({
  head: () => ({
    meta: [
      { title: "فحص الرغبة الصوتي — Aqla" },
      {
        name: "description",
        content:
          "كشف الرغبة بتحليل الرجفان الصوتي: خمس ثوانٍ من صوتك، معالجة كاملة على جهازك، لا حفظ ولا رفع للصوت.",
      },
    ],
  }),
  component: VoiceCravingScan,
});

type Phase = "idle" | "recording" | "analyzing" | "done" | "error";

type Result = {
  jitter: number;
  zcr: number;
  rms: number;
  band: "calm" | "watch" | "surge";
};

const SAMPLE_MS = 5000;

function classify(jitter: number): Result["band"] {
  if (jitter > 0.6) return "surge";
  if (jitter > 0.35) return "watch";
  return "calm";
}

async function recordAndAnalyze(): Promise<Result> {
  const AudioCtx =
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) throw new Error("AudioContext not supported");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const ctx = new AudioCtx();
  const source = ctx.createMediaStreamSource(stream);
  const proc = ctx.createAnalyser();
  proc.fftSize = 2048;
  source.connect(proc);

  const buf = new Float32Array(proc.fftSize);
  let zeroCross = 0;
  let sumSquares = 0;
  let totalSamples = 0;

  const start = performance.now();
  await new Promise<void>((resolve) => {
    const tick = () => {
      proc.getFloatTimeDomainData(buf);
      let prev = buf[0];
      for (let i = 1; i < buf.length; i++) {
        const cur = buf[i];
        if ((prev >= 0 && cur < 0) || (prev < 0 && cur >= 0)) zeroCross++;
        sumSquares += cur * cur;
        prev = cur;
      }
      totalSamples += buf.length;
      if (performance.now() - start >= SAMPLE_MS) return resolve();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  stream.getTracks().forEach((t) => t.stop());
  await ctx.close();

  const rms = Math.sqrt(sumSquares / Math.max(1, totalSamples));
  const zcr = zeroCross / Math.max(1, totalSamples);
  // Patent §4.3.3: jitter = min(1.0, ZCR * 3.0 * (RMS > 0.01 ? 1.0 : 0.3))
  const jitter = Math.min(1.0, zcr * 3.0 * (rms > 0.01 ? 1.0 : 0.3));
  return { jitter, zcr, rms, band: classify(jitter) };
}

function CalmProtocol({ ar }: { ar: boolean }) {
  const [step, setStep] = useState<"in" | "hold" | "out">("in");
  const [count, setCount] = useState(4);
  useEffect(() => {
    const id = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setStep((s) => (s === "in" ? "hold" : s === "hold" ? "out" : "in"));
        return step === "in" ? 7 : step === "hold" ? 8 : 4;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step]);

  const label = ar
    ? step === "in"
      ? "استنشق"
      : step === "hold"
        ? "احبس"
        : "أخرج"
    : step === "in"
      ? "Inhale"
      : step === "hold"
        ? "Hold"
        : "Exhale";
  const scale = step === "in" ? 1.35 : step === "hold" ? 1.35 : 0.85;

  return (
    <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-emerald-400 font-semibold mb-4">
        <Wind className="w-5 h-5" />
        {ar ? "بروتوكول التهدئة 4-7-8" : "Calm Protocol 4-7-8"}
      </div>
      <div
        className="mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400/40 to-emerald-700/40 transition-transform duration-1000 ease-in-out"
        style={{ transform: `scale(${scale})` }}
      >
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{label}</div>
          <div className="text-4xl font-extrabold text-white tabular-nums">{count}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-white/70">
        {ar
          ? "تابع الدائرة لدورة كاملة. سيتراجع الاندفاع خلال 90 ثانية."
          : "Follow the circle for one full cycle. The surge fades within 90 seconds."}
      </p>
    </div>
  );
}

function VoiceCravingScan() {
  const { lang, dir } = useLang();
  const ar = lang === "ar";
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<number | null>(null);

  const start = useCallback(async () => {
    setError(null);
    setResult(null);
    setPhase("recording");
    setElapsed(0);
    const t0 = performance.now();
    timerRef.current = window.setInterval(() => {
      setElapsed(Math.min(SAMPLE_MS, performance.now() - t0));
    }, 100);
    try {
      const r = await recordAndAnalyze();
      setPhase("analyzing");
      await new Promise((r) => setTimeout(r, 450));
      setResult(r);
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setPhase("error");
    } finally {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const pct = Math.round((elapsed / SAMPLE_MS) * 100);

  return (
    <div dir={dir} className="min-h-screen bg-[#05090a] text-white">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            {ar ? "معالجة كاملة على جهازك · لا حفظ ولا رفع" : "On-device only · Nothing stored or uploaded"}
          </div>
          <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
            {ar ? "فحص الرغبة الصوتي" : "Voice Craving Scan"}
          </h1>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">
            {ar
              ? "خمس ثوانٍ من صوتك تكفي. نحسب الرجفان الدقيق في نبرتك (Zero-crossing × RMS) لنقيس شدة الاندفاع، ثم نُشغّل بروتوكول التهدئة إذا لزم."
              : "Five seconds of your voice is enough. We compute the fine tremor in your tone (Zero-crossing × RMS) to gauge the surge, and launch the Calm Protocol if needed."}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur">
          <div className="flex flex-col items-center gap-6">
            <button
              type="button"
              onClick={start}
              disabled={phase === "recording" || phase === "analyzing"}
              className="group relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-[#00A65A] to-[#006C35] text-white shadow-[0_0_60px_rgba(0,166,90,0.35)] transition-transform active:scale-95 disabled:opacity-70"
            >
              {phase === "recording" && (
                <span className="absolute inset-0 rounded-full border-2 border-emerald-300/60 animate-ping" />
              )}
              {phase === "analyzing" ? (
                <Loader2 className="h-14 w-14 animate-spin" />
              ) : (
                <Mic className="h-14 w-14" />
              )}
            </button>

            <div className="w-full max-w-md">
              <div className="mb-2 flex justify-between text-xs text-white/50">
                <span>
                  {phase === "recording"
                    ? ar
                      ? "جارٍ الالتقاط..."
                      : "Capturing..."
                    : phase === "analyzing"
                      ? ar
                        ? "تحليل..."
                        : "Analyzing..."
                      : ar
                        ? "اضغط للبدء"
                        : "Tap to start"}
                </span>
                <span className="tabular-nums">{(elapsed / 1000).toFixed(1)}s / 5.0s</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[#00A65A] to-[#34d399] transition-[width] duration-100"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <p className="max-w-md text-center text-sm text-white/60">
              {ar
                ? 'قل بصوت طبيعي: "أنا أستطيع تجاوز هذه اللحظة."'
                : 'Say in a natural voice: "I can get through this moment."'}
            </p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                {ar
                  ? "تعذّر الوصول إلى الميكروفون. تأكد من منح الإذن للمتصفح."
                  : "Could not access the microphone. Please grant permission."}
                <div className="mt-1 text-xs text-red-200/70">{error}</div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8">
              <div className="grid grid-cols-3 gap-3">
                <Metric label={ar ? "Jitter" : "Jitter"} value={result.jitter.toFixed(3)} highlight />
                <Metric label="ZCR" value={result.zcr.toFixed(3)} />
                <Metric label="RMS" value={result.rms.toFixed(4)} />
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 p-6">
                <div className="mb-3 flex items-center gap-2 text-sm text-white/60">
                  <Waves className="h-4 w-4" />
                  {ar ? "قراءة الاندفاع" : "Surge reading"}
                </div>
                <BandBar band={result.band} jitter={result.jitter} />
                <p className="mt-4 text-sm text-white/80">
                  {result.band === "calm" &&
                    (ar
                      ? "الحالة هادئة. صوتك مستقر — الرغبة تحت السيطرة الآن. تابع نشاطك."
                      : "Calm. Your voice is stable — the craving is under control right now. Carry on.")}
                  {result.band === "watch" &&
                    (ar
                      ? "منطقة مراقبة. ارتفاع خفيف — خذ نفسًا عميقًا واشرب ماء."
                      : "Watch zone. Slight elevation — take a deep breath and drink water.")}
                  {result.band === "surge" &&
                    (ar
                      ? "اندفاع رغبة قوي. سنبدأ بروتوكول التهدئة الآن."
                      : "Strong craving surge detected. Launching the Calm Protocol now.")}
                </p>
              </div>

              {result.band === "surge" && <CalmProtocol ar={ar} />}

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={start}
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  {ar ? "فحص جديد" : "Scan again"}
                </button>
                <Link
                  to="/craving-coach"
                  className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-400"
                >
                  {ar ? "أدوات إضافية للحظة الرغبة" : "More craving tools"}
                </Link>
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/40">
          {ar
            ? "الميزة مبنية على §4.3.3 من طلب براءة اختراع Aqla — Persona OS 2030."
            : "Feature based on §4.3.3 of the Aqla — Persona OS 2030 patent filing."}
        </p>
      </div>
    </div>
  );
}

function Metric({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-xl border p-3 text-center ${highlight ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-white/5"}`}
    >
      <div className="text-[10px] uppercase tracking-widest text-white/50">{label}</div>
      <div className={`mt-1 text-lg font-extrabold tabular-nums ${highlight ? "text-emerald-300" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function BandBar({ band, jitter }: { band: Result["band"]; jitter: number }) {
  const pct = Math.round(jitter * 100);
  const color = band === "surge" ? "bg-red-500" : band === "watch" ? "bg-amber-400" : "bg-emerald-400";
  return (
    <div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/5">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
        <div className="absolute inset-y-0 left-[35%] w-px bg-white/20" />
        <div className="absolute inset-y-0 left-[60%] w-px bg-white/20" />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-white/40">
        <span>0.00</span>
        <span>0.35</span>
        <span>0.60</span>
        <span>1.00</span>
      </div>
    </div>
  );
}
