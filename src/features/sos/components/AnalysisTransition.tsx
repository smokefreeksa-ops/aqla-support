export function AnalysisTransition() {
  return (
    <div className="flex flex-col items-center text-center gap-6">
      <div className="relative h-28 w-28">
        <div
          className="absolute inset-0 rounded-full animate-spin"
          style={{
            background:
              "conic-gradient(from 0deg,rgba(239,68,68,0),rgba(239,68,68,0.8),rgba(239,68,68,0))",
            animationDuration: "1.6s",
            maskImage:
              "radial-gradient(circle,transparent 55%,#000 60%)",
            WebkitMaskImage:
              "radial-gradient(circle,transparent 55%,#000 60%)",
          }}
        />
      </div>
      <p className="text-xl text-white font-semibold">
        جارٍ تهيئة تدخل اللحظة...
      </p>
      <p className="text-sm text-white/60">Preparing your intervention…</p>
    </div>
  );
}
