import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ============================================================
// Aqla Center Chat — hardened, multilingual, Gateway-backed
// Part 2 port: static approved openings, deterministic safety
// override, structured JSON contract, bot_name enforced,
// Arabic-first multi-language, fixed route registry.
// AI never computes assessment scores.
// ============================================================

export const getAssistantStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { enabled: Boolean(process.env.LOVABLE_API_KEY) };
});

// ---------- Language handling ----------
const PRIMARY_LANGS = ["ar", "en", "ur", "id", "ms", "tr", "fa", "fr"] as const;
const FALLBACK_LANGS = ["bn", "hi", "ha"] as const; // fallback to ar+en safety lines
type Lang = (typeof PRIMARY_LANGS)[number] | (typeof FALLBACK_LANGS)[number];

// ---------- Center types ----------
const CenterType = z.enum([
  "general",
  "quit_pathway",
  "quit_center",
  "help_pathway",
  "help_center",
  "learn_train",
  "academy",
  "challenge_pathway",
  "community_challenges",
]);
type Center = z.infer<typeof CenterType>;
type CanonicalCenter = "general" | "quit_pathway" | "help_pathway" | "learn_train" | "challenge_pathway";

function normalizeCenter(center: Center): CanonicalCenter {
  if (center === "quit_center") return "quit_pathway";
  if (center === "help_center") return "help_pathway";
  if (center === "academy") return "learn_train";
  if (center === "community_challenges") return "challenge_pathway";
  return center;
}

// ---------- Approved openings (static, never generated) ----------
const APPROVED_OPENINGS: Record<CanonicalCenter, Partial<Record<Lang, string>>> = {
  general: {
    ar: "مرحبًا، أنا مساعد أقلع التثقيفي. لا أقدّم تشخيصًا أو علاجًا، ولا أصف أدوية. اختر أحد مراكز أقلع أو اكتب سؤالك التوعوي.",
    en: "Hello, I am Aqla's educational assistant. I do not diagnose, treat, or prescribe medication. How can I help?",
  },
  quit_pathway: {
    ar: "أهلًا بك في مركز أقلع الافتراضي لدعم الإقلاع. سأرشدك خطوة بخطوة لفهم استخدامك للتدخين أو النيكوتين، تقييم مستوى الاعتماد، بناء خطة مناسبة، ومتابعتك بطريقة آمنة. لن نعرض بياناتك الصحية في أي مشاركة عامة، ولن نقدم وصفات أو جرعات دوائية.",
    en: "Welcome to the Aqla Virtual Quit Center. I will guide you step by step — understand your use, take the assessment, build a quit plan, follow up, and request support when needed.",
  },
  help_pathway: {
    ar: "أهلًا بك في مسار المساعدة من أقلع. سأساعدك على دعم شخص يهمك بطريقة محترمة وآمنة، دون ضغط أو لوم، من خلال رسالة أو بطاقة دعم قابلة للمشاركة.",
    en: "Welcome to the Aqla Help Pathway. I will help you craft a respectful, safe message of support — no pressure, no blame.",
  },
  learn_train: {
    ar: "أهلًا بك في أكاديمية أقلع للتدريب والشهادات. سأرشدك داخل مسار تدريبي تفاعلي لتعلّم دعم الإقلاع عن التدخين والنيكوتين، والتدرّب على سيناريوهات واقعية، ثم دخول اختبار نهائي وإصدار شهادة إتمام قابلة للتحميل والمشاركة والتحقق.",
    en: "Welcome to the Aqla Academy for Training & Certification. I will guide you through interactive training, realistic scenarios, a final exam, and a verifiable downloadable certificate.",
  },
  challenge_pathway: {
    ar: "أهلًا بك في مجتمع وتحديات أقلع. هنا يمكنك المشاركة في تحديات توعوية، جمع النقاط والأوسمة، دعوة الأصدقاء، تصميم بطاقات قابلة للمشاركة، واستخدام هاشتاقات أقلع لدعم الأثر المجتمعي دون عرض أي بيانات صحية خاصة.",
    en: "Welcome to the Aqla Community & Challenges. Join challenges, awareness games, hashtags, invites, points, medals, and design awareness cards.",
  },
};

// Starter conversational buttons rendered with the opening. Clicking sends
// the label back into the chat as a user message.
const OPENING_BUTTONS: Record<CanonicalCenter, Array<{ ar: string; en: string; action?: string }>> = {
  general: [],
  quit_pathway: [
    { ar: "أبدأ التقييم", en: "Start assessment", action: "start_intake" },
    { ar: "أريد خطة للإقلاع", en: "I want a quit plan", action: "generate_quit_plan" },
    { ar: "أحتاج مساعدة مع الرغبة الشديدة", en: "I need craving help", action: "craving_rescue" },
    { ar: "أريد تقليل الاستخدام أولًا", en: "I want to reduce use first" },
    { ar: "أريد متابعة تقدمي", en: "Track my progress", action: "log_followup" },
    { ar: "أحتاج مراجعة مختص", en: "I need a specialist review", action: "create_support_request" },
  ],
  help_pathway: [
    { ar: "أنشئ رسالة دعم", en: "Create a support message", action: "create_support_message" },
    { ar: "أصمم بطاقة دعم", en: "Design a support card", action: "create_support_card" },
    { ar: "أتعلم كيف أساعد بدون ضغط", en: "Learn how to help without pressure" },
    { ar: "أرسل عبر WhatsApp", en: "Send via WhatsApp", action: "send_whatsapp" },
    { ar: "أحتاج نصيحة قبل الحديث معه", en: "I need advice before talking" },
  ],
  learn_train: [
    { ar: "ابدأ التدريب", en: "Start training", action: "start_training" },
    { ar: "عرض مسارات الأكاديمية", en: "View academy tracks" },
    { ar: "متابعة تدريبي", en: "Resume my training", action: "resume_training" },
    { ar: "ابدأ الاختبار النهائي", en: "Start final exam", action: "start_exam_mode" },
    { ar: "عرض شهادتي", en: "View my certificate", action: "view_certificate" },
    { ar: "التحقق من شهادة", en: "Verify a certificate", action: "verify_certificate" },
  ],
  challenge_pathway: [
    { ar: "أبدأ تحديًا سريعًا", en: "Start a quick challenge", action: "start_challenge" },
    { ar: "أشارك في تحدي المعرفة", en: "Knowledge challenge", action: "knowledge_challenge" },
    { ar: "أدعو أصدقائي", en: "Invite friends", action: "generate_invite_link" },
    { ar: "أصمم بطاقة توعوية", en: "Design an awareness card", action: "create_awareness_card" },
    { ar: "أجمع النقاط والأوسمة", en: "Collect points & medals", action: "view_points" },
    { ar: "أشارك في تحدي المدن", en: "Join city challenge", action: "city_challenge" },
    { ar: "أستخدم هاشتاقات أقلع", en: "Use Aqla hashtags", action: "create_hashtag_post" },
    { ar: "أتابع أخبار وتحديثات أقلع", en: "Follow Aqla updates", action: "view_updates" },
  ],
};

function openingButtonsFor(center: CanonicalCenter, lang: Lang) {
  return OPENING_BUTTONS[center].map((b) => ({
    label: lang === "en" ? (b.en || b.ar) : b.ar,
    action: b.action ?? `chat:${b.ar}`,
  }));
}


// ---------- Route registry (no duplicates) ----------
const ROUTES = {
  quit_pathway: "/quit-pathway",
  learn_train: "/learn-train",
  help_pathway: "/help-pathway",
  challenge_pathway: "/challenge-pathway",
} as const;

// ---------- Safety override (deterministic, in code) ----------
const EMERGENCY_PATTERNS =
  /(chest pain|short(ness)? of breath|coughing blood|suicid|kill myself|أعراض طارئة|ألم (?:ال)?صدر|ضيق (?:ال)?تنفس|نفث (?:ال)?دم|انتحار|أريد أن أموت)/i;

const MEDICATION_PATTERNS =
  /(dose|dosage|mg\b|milligram|prescribe|prescription|nicotine patch dose|varenicline|bupropion|champix|zyban|جرعة|ملغ|ملج|وصف(?:ة)? طبية|بوبروبيون|فارينيكلين|تشامبيكس)/i;

const SAFETY_REPLIES = {
  emergency: {
    ar: "إذا كنت تواجه أعراضًا طارئة (ألم في الصدر، صعوبة شديدة في التنفس، نفث دم، أفكار لإيذاء النفس)، اطلب الرعاية الطبية العاجلة فورًا أو اتصل بالطوارئ. أنا أداة تثقيفية ولا أغني عن الرعاية الطبية.",
    en: "If you are experiencing urgent symptoms (chest pain, severe shortness of breath, coughing blood, thoughts of self-harm), seek urgent medical care or call emergency services immediately. I am an educational tool and cannot replace medical care.",
  },
  medication: {
    ar: "لا أستطيع تقديم جرعات أدوية أو وصفات طبية. علاج الإقلاع الدوائي يتطلب تقييمًا من طبيب مختص. يمكنني فقط مشاركة معلومات تثقيفية عامة.",
    en: "I cannot provide medication doses or prescriptions. Pharmacological cessation treatment requires assessment by a qualified clinician. I can only share general educational information.",
  },
};

function pickSafetyLang(lang: Lang): "ar" | "en" {
  // Arabic-first for fallback languages; Arabic also for ar/ur/fa speakers culturally close
  if (lang === "ar") return "ar";
  return "en";
}

function safetyOverride(userText: string, lang: Lang): string | null {
  if (EMERGENCY_PATTERNS.test(userText)) {
    const l = pickSafetyLang(lang);
    return SAFETY_REPLIES.emergency[l] + (l === "ar" ? "\n\n" + SAFETY_REPLIES.emergency.en : "");
  }
  if (MEDICATION_PATTERNS.test(userText)) {
    const l = pickSafetyLang(lang);
    return SAFETY_REPLIES.medication[l] + (l === "ar" ? "\n\n" + SAFETY_REPLIES.medication.en : "");
  }
  return null;
}

// ---------- System prompt (structured JSON contract) ----------
function buildSystem(center: CanonicalCenter, lang: Lang) {
  const isFallback = (FALLBACK_LANGS as readonly string[]).includes(lang);
  const replyLang = isFallback ? "Arabic + English (bilingual)" : lang;
  return `You are the Aqla Education Assistant — a physician-supervised, education-only bilingual chatbot for the Aqla (أقلع) smoking and nicotine cessation program. Your bot_name is "Aqla Assistant" and you must never claim to be a different bot or model.

Current center context: ${center}
Reply language: ${replyLang}
Arabic is the primary language of Aqla. If Reply language is ar, always answer in Arabic even when the user types English words like hi or hello.

STRICT RULES:
- You provide GENERAL EDUCATIONAL INFORMATION ONLY.
- You DO NOT diagnose, treat, prescribe, give medication doses, or compute clinical scores.
- You DO NOT compute or interpret assessment scores (FTND, HONC, LWDS-11, readiness). Direct the user to the validated in-app assessment instead.
- You DO NOT claim access to the user's medical records or personal data.
- For urgent symptoms, instruct the user to seek urgent medical care.
- Keep responses concise (under ~180 words).

KNOWN ROUTES (use ONLY these, no duplicates, no invented paths):
- Quit pathway: ${ROUTES.quit_pathway}
- Help pathway: ${ROUTES.help_pathway}
- Learn & Train: ${ROUTES.learn_train}
- Challenge pathway: ${ROUTES.challenge_pathway}

OUTPUT CONTRACT — return ONLY valid JSON, no markdown fences, with this shape:
{
  "bot_name": "Aqla Assistant",
  "language": "<reply language code>",
  "reply": "<your educational response in ${replyLang}>",
  "suggested_route": "<one of the known route paths above, or null>",
  "is_safety_critical": false
}

If the user asks something you cannot answer safely, set reply to a kind redirection to a clinician or to the appropriate Aqla pathway route.`;
}

// ---------- Chat input ----------
const ChatInput = z.object({
  lang: z.enum([...PRIMARY_LANGS, ...FALLBACK_LANGS]).default("ar"),
  center_type: CenterType.default("general"),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(20),
});

// ---------- Gateway call ----------
type GatewayResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

function tryParseJson(text: string): {
  bot_name?: string;
  language?: string;
  reply?: string;
  suggested_route?: string | null;
  is_safety_critical?: boolean;
} | null {
  // Strip code fences if model added them despite instructions
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("Assistant is not configured.");
    }

    const lang = data.lang as Lang;
    const center = normalizeCenter(data.center_type as Center);
    const lastUser = [...data.messages].reverse().find((m) => m.role === "user");

    // Deterministic safety override BEFORE any model call
    const override = lastUser ? safetyOverride(lastUser.content, lang) : null;
    if (override) {
      return {
        reply: override,
        bot_name: "Aqla Assistant",
        language: lang,
        suggested_route: ROUTES.help_pathway,
        is_safety_critical: true,
      };
    }

    // First-turn approved opening if the conversation has just one user message and no assistant turn
    const hasAssistantTurn = data.messages.some((m) => m.role === "assistant");
    if (!hasAssistantTurn && (lastUser?.content ?? "").trim().length < 2) {
      const opening =
        APPROVED_OPENINGS[center][lang] ??
        APPROVED_OPENINGS[center].ar ??
        APPROVED_OPENINGS.general.ar!;
      return {
        reply: opening,
        bot_name: "Aqla Assistant",
        language: lang,
        suggested_route: null,
        buttons: openingButtonsFor(center, lang),
        is_safety_critical: false,
      };
    }


    const system = buildSystem(center, lang);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          ...data.messages,
        ],
      }),
    });

    if (res.status === 429) {
      return {
        reply:
          lang === "ar"
            ? "الخدمة مزدحمة حاليًا. حاول مرة أخرى بعد قليل."
            : "The assistant is busy right now. Please try again shortly.",
        bot_name: "Aqla Assistant",
        language: lang,
        suggested_route: null,
        is_safety_critical: false,
      };
    }
    if (res.status === 402) {
      return {
        reply:
          lang === "ar"
            ? "تم استنفاد رصيد المساعد مؤقتًا. الرجاء المحاولة لاحقًا."
            : "Assistant credits are temporarily exhausted. Please try again later.",
        bot_name: "Aqla Assistant",
        language: lang,
        suggested_route: null,
        is_safety_critical: false,
      };
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Lovable AI Gateway error", res.status, text);
      throw new Error(`Assistant request failed (${res.status}).`);
    }

    const json = (await res.json()) as GatewayResponse;
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
    const parsed = tryParseJson(raw);

    const allowedRoutes = new Set<string>(Object.values(ROUTES));
    const suggested =
      parsed?.suggested_route && allowedRoutes.has(parsed.suggested_route)
        ? parsed.suggested_route
        : null;

    return {
      // bot_name is enforced by code, never trusted from model
      bot_name: "Aqla Assistant",
      language: lang,
      reply: (parsed?.reply ?? raw ?? "").trim() || (lang === "ar" ? "تعذّر توليد ردّ الآن." : "Couldn't generate a reply."),
      suggested_route: suggested,
      is_safety_critical: false,
    };
  });
