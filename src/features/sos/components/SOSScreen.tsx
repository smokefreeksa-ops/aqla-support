import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useSOSMachine } from "../hooks/useSOSMachine";
import { CravingRating } from "./CravingRating";
import { VoiceCapture } from "./VoiceCapture";
import { AnalysisTransition } from "./AnalysisTransition";
import { ProtocolDelivery } from "./ProtocolDelivery";
import { SOSComplete } from "./SOSComplete";
import { PROTOCOLS } from "../sos.protocols";

const REDCAP_URL =
  typeof import.meta !== "undefined"
    ? (import.meta.env as Record<string, string | undefined>).VITE_REDCAP_STUDY_URL
    : undefined;

export function SOSScreen() {
  const machine = useSOSMachine();
  const router = useRouter();
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(3);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setDebug(params.get("sosDebug") === "1");
    }
  }, []);

  useEffect(() => {
    if (machine.state === "post_craving_check" && machine.cravingBefore != null) {
      setAfter(Math.min(machine.cravingBefore, 5));
    }
  }, [machine.state, machine.cravingBefore]);

  const exit = () => {
    machine.reset();
    router.navigate({ to: "/" });
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at top,#1a0505 0%,#0a0202 60%,#000 100%)",
      }}
    >
      {/* subtle close */}
      <button
        onClick={exit}
        aria-label="إغلاق"
        className="absolute top-4 end-4 text-white/40 hover:text-white text-sm"
      >
        إغلاق ✕
      </button>

      {debug && <DebugPanel machine={machine} />}

      <div className="w-full grid place-items-center">
        {machine.state === "idle" && (
          <CravingRating
            titleAr="قوة الرغبة الآن؟"
            titleEn="How strong is the craving right now?"
            value={before}
            onChange={setBefore}
            onConfirm={() => machine.setCravingBefore(before)}
            confirmAr="ابدأ التدخل"
            confirmEn="Start intervention"
          />
        )}

        {machine.state === "permission" && (
          <PermissionGate
            onAllow={machine.requestPermission}
            onSkip={machine.skipVoice}
          />
        )}

        {machine.state === "voice_capture" && (
          <VoiceCapture
            onComplete={machine.onVoiceCaptured}
            onSkip={machine.skipVoice}
          />
        )}

        {(machine.state === "local_analysis" ||
          machine.state === "context_fusion" ||
          machine.state === "protocol_selected") && <AnalysisTransition />}

        {machine.state === "fallback" && <AnalysisTransition />}

        {machine.state === "protocol_delivery" && machine.selection && (
          <ProtocolDelivery
            key={`${machine.selection.protocol}-${machine.isSecondLoop ? "2" : "1"}`}
            protocolId={machine.selection.protocol}
            onFinished={machine.onProtocolFinished}
          />
        )}

        {machine.state === "post_craving_check" && (
          <CravingRating
            titleAr={machine.isSecondLoop ? "والآن بعد الجولة الثانية؟" : "والآن؟"}
            titleEn="And now?"
            value={after}
            onChange={setAfter}
            onConfirm={() => {
              machine.setCravingAfter(after);
              void machine.finalize();
            }}
            confirmAr="تسجيل"
            confirmEn="Log"
          />
        )}

        {machine.state === "logging" && <AnalysisTransition />}

        {machine.state === "complete" &&
          machine.cravingBefore != null &&
          machine.cravingAfter != null && (
            <SOSComplete
              cravingBefore={
                machine.isSecondLoop
                  ? // For a completed second loop, "before" is the very first rating.
                    machine.cravingBefore
                  : machine.cravingBefore
              }
              cravingAfter={machine.cravingAfter}
              onDone={exit}
              redcapUrl={REDCAP_URL}
              onLogTrigger={(t) => void machine.finalize(t)}
            />
          )}
      </div>

      {machine.isSecondLoop && machine.state === "protocol_delivery" && (
        <div className="absolute top-4 start-4 text-red-300 text-xs font-semibold">
          الرغبة ما زالت قوية. لن نتركك هنا. سنغيّر الطريقة الآن.
        </div>
      )}
    </div>
  );
}

function PermissionGate({
  onAllow,
  onSkip,
}: {
  onAllow: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-5 max-w-md">
      <h2 className="text-2xl font-bold text-white">
        نستخدم إشارات صوتية قصيرة للمساعدة في تهيئة تدخل يناسب اللحظة
      </h2>
      <p className="text-sm text-white/70 leading-relaxed">
        سنطلب إذن الميكروفون لتحليل ٥ ثوانٍ من صوتك على جهازك فقط. لا تسجيل، لا رفع، لا نص.
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onAllow}
          className="rounded-full px-6 py-3 text-white font-semibold shadow-lg"
          style={{
            backgroundImage: "linear-gradient(135deg,#ef4444,#b91c1c)",
          }}
        >
          السماح والبدء
        </button>
        <button
          onClick={onSkip}
          className="text-white/60 text-sm underline underline-offset-4 hover:text-white/80"
        >
          تخطي والبدء مباشرة
        </button>
      </div>
    </div>
  );
}

function DebugPanel({
  machine,
}: {
  machine: ReturnType<typeof useSOSMachine>;
}) {
  const proto = machine.selection
    ? PROTOCOLS[machine.selection.protocol]
    : undefined;
  return (
    <div className="absolute bottom-2 start-2 text-[10px] font-mono bg-black/70 text-green-300 p-2 rounded max-w-[280px] leading-tight">
      <div>state: {machine.state}</div>
      <div>cravingBefore: {String(machine.cravingBefore)}</div>
      <div>cravingAfter: {String(machine.cravingAfter)}</div>
      <div>secondLoop: {String(machine.isSecondLoop)}</div>
      {machine.acoustic && (
        <>
          <div>signalQ: {machine.acoustic.signalQuality.toFixed(2)}</div>
          <div>score: {machine.acoustic.currentStateScore.toFixed(2)}</div>
          <div>rms: {machine.acoustic.rmsEnergy.toFixed(3)}</div>
          <div>zcr: {machine.acoustic.zeroCrossingRate.toFixed(3)}</div>
          <div>
            centroid:{" "}
            {machine.acoustic.spectralCentroid?.toFixed(0) ?? "-"}
          </div>
        </>
      )}
      {machine.selection && (
        <>
          <div>protocol: {machine.selection.protocol}</div>
          <div>reason: {machine.selection.reason}</div>
          <div>confidence: {machine.selection.confidence ?? "-"}</div>
        </>
      )}
      {proto && <div>duration: {proto.totalSeconds}s</div>}
      {machine.persona && (
        <div>
          persona: {machine.persona.stressResponse}, N=
          {machine.persona.neuroticism}
        </div>
      )}
    </div>
  );
}
