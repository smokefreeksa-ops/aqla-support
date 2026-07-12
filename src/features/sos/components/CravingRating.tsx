export function CravingRating({
  titleAr,
  titleEn,
  value,
  onChange,
  onConfirm,
  confirmAr,
  confirmEn,
}: {
  titleAr: string;
  titleEn: string;
  value: number;
  onChange: (n: number) => void;
  onConfirm: () => void;
  confirmAr: string;
  confirmEn: string;
}) {
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-md w-full">
      <h1 className="text-3xl sm:text-4xl font-bold text-white">{titleAr}</h1>
      <p className="text-sm text-white/60">{titleEn}</p>

      <div className="w-full">
        <div className="flex justify-between text-xs text-white/50 mb-2 px-1">
          <span>0</span>
          <span>10</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className="w-full accent-red-500 h-2"
          aria-label={titleAr}
        />
        <div className="mt-4 text-6xl font-bold text-white tabular-nums">
          {value}
        </div>
      </div>

      <button
        onClick={onConfirm}
        className="mt-2 rounded-full px-8 py-3 text-white font-semibold text-lg shadow-lg active:scale-95 transition"
        style={{
          backgroundImage:
            "linear-gradient(135deg,#ef4444 0%,#b91c1c 100%)",
          boxShadow: "0 12px 40px -10px rgba(220,38,38,0.7)",
        }}
      >
        {confirmAr}
      </button>
      <p className="text-[11px] text-white/40">{confirmEn}</p>
    </div>
  );
}
