import type { ProtocolDefinition, ProtocolId } from "./sos.types";

export const PROTOCOLS: Record<ProtocolId, ProtocolDefinition> = {
  calm: {
    id: "calm",
    nameAr: "بروتوكول التهدئة",
    nameEn: "Calm Protocol",
    totalSeconds: 60,
    accent: "calm",
    steps: [
      {
        seconds: 10,
        ar: "لا تقاوم الرغبة. لا تنفذها. فقط انتظر.",
        en: "Do not resist. Do not act. Just wait.",
        visual: "still_center",
        hapticOnStart: true,
      },
      {
        seconds: 20,
        ar: "زفير طويل وبطيء مع الدائرة.",
        en: "Long slow exhale with the orb.",
        visual: "breath_orb",
        hapticOnStart: true,
      },
      {
        seconds: 15,
        ar: "الرغبة موجة. ارتفاعها لا يعني أنك تحتاج إلى التدخين.",
        en: "The craving is a wave. Its peak is not a command.",
        visual: "wave_reframe",
      },
      {
        seconds: 15,
        ar: "ضع قدميك على الأرض. اختر شيئاً تراه الآن وسمّه.",
        en: "Place both feet on the floor. Name one thing you see.",
        visual: "grounding",
        hapticOnStart: true,
      },
    ],
  },
  energy_discharge: {
    id: "energy_discharge",
    nameAr: "بروتوكول تفريغ الاندفاع",
    nameEn: "Energy Discharge",
    totalSeconds: 50,
    accent: "active",
    steps: [
      {
        seconds: 5,
        ar: "قف إن كان ذلك آمناً.",
        en: "Stand up if safe.",
        visual: "action_command",
        hapticOnStart: true,
      },
      {
        seconds: 10,
        ar: "شدّ قبضتيك بقوة. ٥ — ٤ — ٣ — ٢ — ١.",
        en: "Clench both fists hard. 5 — 4 — 3 — 2 — 1.",
        visual: "countdown",
        countdown: true,
      },
      {
        seconds: 5,
        ar: "اترك يديك الآن.",
        en: "Release now.",
        visual: "action_command",
        hapticOnStart: true,
      },
      {
        seconds: 10,
        ar: "اضغط راحتيك ببعضهما بقوة. ٥ — ٤ — ٣ — ٢ — ١.",
        en: "Press palms hard together. 5 — 4 — 3 — 2 — 1.",
        visual: "countdown",
        countdown: true,
      },
      {
        seconds: 10,
        ar: "حرّك كتفيك بسرعة لأعلى ولأسفل.",
        en: "Move shoulders up and down, fast.",
        visual: "action_command",
      },
      {
        seconds: 10,
        ar: "زفير طويل. تباطأ الآن.",
        en: "Long exhale. Slow down now.",
        visual: "breath_orb",
        hapticOnStart: true,
      },
    ],
  },
  safe_escape: {
    id: "safe_escape",
    nameAr: "بروتوكول الانسحاب الآمن",
    nameEn: "Safe Escape",
    totalSeconds: 60,
    accent: "escape",
    steps: [
      {
        seconds: 10,
        ar: "ابتعد الآن ثلاث خطوات عن مكان التدخين.",
        en: "Take three steps away from the smoking spot.",
        visual: "action_command",
        hapticOnStart: true,
      },
      {
        seconds: 10,
        ar: "ضع السيجارة أو الجهاز خارج مدى يدك.",
        en: "Put the cigarette or device out of reach.",
        visual: "action_command",
        hapticOnStart: true,
      },
      {
        seconds: 10,
        ar: "غيّر اتجاه جسمك.",
        en: "Turn your body a different direction.",
        visual: "action_command",
      },
      {
        seconds: 10,
        ar: "اشرب الماء إن كان قريباً.",
        en: "Drink water if it is near.",
        visual: "action_command",
      },
      {
        seconds: 20,
        ar: "ابقَ حيث أنت. تنفّس. ١٠ — ٩ — ٨ — ٧ — ٦ — ٥ — ٤ — ٣ — ٢ — ١.",
        en: "Stay where you are. Breathe. 10 → 1.",
        visual: "countdown",
        countdown: true,
        hapticOnStart: true,
      },
    ],
  },
  reboot: {
    id: "reboot",
    nameAr: "بروتوكول إعادة التشغيل",
    nameEn: "Reboot",
    totalSeconds: 45,
    accent: "reboot",
    steps: [
      {
        seconds: 6,
        ar: "انظر إلى الشاشة.",
        en: "Look at the screen.",
        visual: "still_center",
        hapticOnStart: true,
      },
      {
        seconds: 12,
        ar: "المس الدائرة.",
        en: "Tap the circle.",
        visual: "large_tap_target",
      },
      {
        seconds: 9,
        ar: "ممتاز. الآن خذ نفساً واحداً فقط.",
        en: "Good. Now take a single breath.",
        visual: "breath_orb",
        hapticOnStart: true,
      },
      {
        seconds: 6,
        ar: "حرّك يدك.",
        en: "Move your hand.",
        visual: "action_command",
      },
      {
        seconds: 12,
        ar: "اختر: ماء، أو مشي ١٠ خطوات.",
        en: "Choose: water, or walk 10 steps.",
        visual: "choice",
        hapticOnStart: true,
      },
    ],
  },
};

export function pickAlternateProtocol(first: ProtocolId): ProtocolId {
  switch (first) {
    case "calm":
      return "safe_escape";
    case "energy_discharge":
      return "calm";
    case "safe_escape":
      return "reboot";
    case "reboot":
      return "safe_escape";
  }
}
