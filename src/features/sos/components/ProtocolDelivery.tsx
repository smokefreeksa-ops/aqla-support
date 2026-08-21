import { useEffect, useRef, useState } from "react";
import { useHaptics } from "../hooks/useHaptics";
import { PROTOCOLS } from "../sos.protocols";
import type { ProtocolId, ProtocolStep } from "../sos.types";

export function ProtocolDelivery({
  protocolId,
  onFinished,
}: {
  protocolId: ProtocolId;
  onFinished: () => void;
}) {
  const protocol = PROTOCOLS[protocolId];
  const haptics = useHaptics();
  const [stepIdx, setStepIdx] = useState(0);
  const [stepSecondsLeft, setStepSecondsLeft] = useState(
    protocol.steps[0].seconds,
  );
  const [tapped, setTapped] = useState(false);
  const [choice, setChoice] = useState<"water" | "walk" | null>(null);
  const finishedRef = useRef(false);

  const step = protocol.steps[stepIdx];

  // Reset local sub-state when step changes.
  useEffect(() => {
    setTapped(false);
    setChoice(null);
    setStepSecondsLeft(step.seconds);
    if (step.hapticOnStart) haptics.stepTransition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  // Countdown timer for each step.
  useEffect(() => {
    const id = window.setInterval(() => {
      setStepSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          // advance
          if (stepIdx < protocol.steps.length - 1) {
            setStepIdx((i) => i + 1);
          } else if (!finishedRef.current) {
            finishedRef.current = true;
            haptics.complete();
            onFinished();
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  const totalElapsed =
    protocol.steps.slice(0, stepIdx).reduce((a, s) => a + s.seconds, 0) +
    (step.seconds - stepSecondsLeft);
  const progress = totalElapsed / protocol.totalSeconds;

  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
      {/* Progress ring */}
      <div className="relative h-20 w-20">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="#ef4444"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - progress)}
            style={{ transition: "stroke-dashoffset 1s linear" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-white text-xs font-semibold">
          {stepIdx + 1}/{protocol.steps.length}
        </div>
      </div>

      <div className="min-h-[220px] w-full grid place-items-center">
        <StepVisual
          step={step}
          secondsLeft={stepSecondsLeft}
          tapped={tapped}
          setTapped={setTapped}
          choice={choice}
          setChoice={setChoice}
        />
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug px-2">
        {step.ar}
      </h2>
      <p className="text-sm text-white/50">{step.en}</p>

      <div className="text-white/70 tabular-nums text-lg">
        {stepSecondsLeft}s
      </div>
    </div>
  );
}

function StepVisual({
  step,
  secondsLeft,
  tapped,
  setTapped,
  choice,
  setChoice,
}: {
  step: ProtocolStep;
  secondsLeft: number;
  tapped: boolean;
  setTapped: (b: boolean) => void;
  choice: "water" | "walk" | null;
  setChoice: (c: "water" | "walk") => void;
}) {
  switch (step.visual) {
    case "still_center":
      return (
        <div
          className="h-24 w-24 rounded-full"
          style={{
            background:
              "radial-gradient(circle,#fff 0%,rgba(239,68,68,0.4) 60%,transparent 100%)",
          }}
        />
      );
    case "breath_orb": {
      const scale = 0.6 + (Math.sin(secondsLeft) + 1) * 0.15;
      return (
        <div
          className="h-40 w-40 rounded-full transition-transform duration-1000 ease-in-out"
          style={{
            transform: `scale(${scale})`,
            background:
              "radial-gradient(circle,rgba(255,255,255,0.9) 0%,rgba(239,68,68,0.35) 55%,transparent 100%)",
          }}
        />
      );
    }
    case "wave_reframe":
      return (
        <svg viewBox="0 0 300 100" className="w-full h-24">
          <path
            d="M0,50 C50,10 100,90 150,50 S250,10 300,50"
            stroke="#ef4444"
            strokeWidth="3"
            fill="none"
            opacity="0.9"
          />
        </svg>
      );
    case "grounding":
      return (
        <div className="grid grid-cols-3 gap-2 opacity-80">
          {["1", "2", "3"].map((e, i) => (
            <div
              key={i}
              className="grid place-items-center h-16 w-16 rounded-2xl bg-white/5 text-3xl"
            >
              {e}
            </div>
          ))}
        </div>
      );
    case "action_command":
      return (
        <div
          className="h-24 w-24 rounded-full border-4 border-white/80"
          style={{
            background:
              "radial-gradient(circle,rgba(239,68,68,0.5),transparent 70%)",
          }}
        />
      );
    case "countdown":
      return (
        <div className="text-8xl font-bold text-white tabular-nums drop-shadow-lg">
          {secondsLeft}
        </div>
      );
    case "large_tap_target":
      return (
        <button
          onClick={() => setTapped(true)}
          className={`h-40 w-40 rounded-full text-white font-bold text-xl transition ${
            tapped ? "scale-90 opacity-60" : "active:scale-95"
          }`}
          style={{
            backgroundImage:
              "radial-gradient(circle,#ef4444 0%,#7f1d1d 100%)",
            boxShadow: "0 0 60px -10px rgba(239,68,68,0.7)",
          }}
        >
          {tapped ? "✓" : "المس"}
        </button>
      );
    case "choice":
      return (
        <div className="flex gap-3">
          <button
            onClick={() => setChoice("water")}
            className={`rounded-2xl px-6 py-4 text-white font-semibold ${
              choice === "water" ? "bg-red-600" : "bg-white/10 hover:bg-white/15"
            }`}
          >
            💧 ماء
          </button>
          <button
            onClick={() => setChoice("walk")}
            className={`rounded-2xl px-6 py-4 text-white font-semibold ${
              choice === "walk" ? "bg-red-600" : "bg-white/10 hover:bg-white/15"
            }`}
          >
            🚶 ١٠ خطوات
          </button>
        </div>
      );
  }
}
