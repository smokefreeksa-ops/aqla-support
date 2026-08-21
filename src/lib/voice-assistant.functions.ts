import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// =====================================================================
// Aqla Voice Assistant — OpenAI-backed (production)
// Arabic-first, short, warm. Routes users to /aqla-quit-engine.
// Never scores dependence. Never prescribes medication or doses.
// Triggers emergency safety responses. Does not replace the quit-plan engine.
// =====================================================================

const Msg = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const Input = z.object({
  lang: z.enum(["ar", "en"]).default("ar"),
  messages: z.array(Msg).min(1).max(40),
});

const SYSTEM_AR = `أنت "مساعد أقلع الصوتي"، مساعد تثقيفي قصير ودافئ لمنصة أقلع لدعم الإقلاع عن التدخين والنيكوتين.

القواعد الصارمة:
- تكلّم بالعربية أولًا. اجعل الردود قصيرة جدًا (1-3 جمل) ودافئة ومحترمة، تناسب التحدث الصوتي.
- وجّه المستخدم بلطف إلى رابط "محرّك أقلع الشخصي" على المسار /aqla-quit-engine لبناء خطة الإقلاع الكاملة.
- ادعم لحظات الرغبة الشديدة (السيجارة/الفيب/الشيشة) بتمارين تنفس 4-7-8، وقاعدة الـ180 ثانية، وHALT (جوع/غضب/وحدة/إرهاق).
- لا تصف أو تقترح أي دواء أو جرعة أو منتج نيكوتين بديل بأي شكل. إذا سُئلت عن جرعات: اعتذر بلطف ووجّه لمراجعة الطبيب أو الصيدلي.
- لا تحسب أي درجة اعتماد على النيكوتين، ولا تجري تقييم Fagerström أو HSI. التقييم يتم فقط داخل /aqla-quit-engine.
- لا تشخّص ولا تعالج ولا تستبدل المختص.
- في حال أي إشارة لإيذاء النفس أو الانتحار أو ألم صدر شديد أو ضيق تنفس حاد أو نزيف: ردّ فورًا برسالة طوارئ:
  "هذا يبدو طارئًا. الرجاء الاتصال بالإسعاف 997 الآن أو التوجه لأقرب طوارئ. أنت لست وحدك."- لا تذكر أنك نموذج لغوي أو OpenAI. عرّف نفسك كـ"مساعد أقلع الصوتي".
- إذا طلب المستخدم خطة شاملة، أجب: "خطتك الكاملة تُبنى في محرّك أقلع الشخصي. افتح /aqla-quit-engine وسأرشدك."`;

const SYSTEM_EN = `You are "Aqla Voice Assistant", a short, warm educational companion for the Aqla quit-smoking platform.

Strict rules:
- Speak Arabic first when possible; switch to English only if the user clearly writes in English.
- Keep replies very short (1-3 sentences), warm, voice-friendly.
- Guide users to the full plan engine at /aqla-quit-engine.
- Support cravings with 4-7-8 breathing, the 180-second rule, and HALT (Hungry/Angry/Lonely/Tired).
- Never suggest, name, or dose any medication or nicotine-replacement product. If asked for doses: decline and refer to a physician or pharmacist.
- Never score nicotine dependence. Never run Fagerström/HSI. Assessment happens only inside /aqla-quit-engine.
- Do not diagnose, treat, or replace a clinician.
- For any sign of self-harm, suicide, severe chest pain, severe breathing trouble, or bleeding, reply immediately:
  "This sounds like an emergency. Please call 997 now or go to the nearest ER. You are not alone."- Do not mention you are an AI/OpenAI. Identify as "Aqla Voice Assistant".
- If asked for a full plan, reply: "Your full plan is built in the Aqla Quit Engine. Open /aqla-quit-engine and I'll guide you."`;

export const voiceChatStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { enabled: Boolean(process.env.OPENAI_API_KEY) };
});

export const voiceChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        reply:
          data.lang === "ar"? "المساعد الصوتي غير متاح حاليًا. الرجاء المحاولة لاحقًا.": "Voice assistant is unavailable right now. Please try later.",
      };
    }

    const system = data.lang === "en" ? SYSTEM_EN : SYSTEM_AR;

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.6,
          max_tokens: 220,
          messages: [{ role: "system", content: system }, ...data.messages],
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.error("[voiceChat] OpenAI error", res.status, errText);
        return {
          reply:
            data.lang === "ar"? "تعذّر الاتصال بالمساعد الآن. حاول بعد قليل.": "Couldn't reach the assistant right now. Please try again shortly.",
        };
      }

      const json = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const reply =
        json.choices?.[0]?.message?.content?.trim() ||
        (data.lang === "ar"? "حاضر، كيف أقدر أساعدك؟": "I'm here. How can I help?");
      return { reply };
    } catch (e) {
      console.error("[voiceChat] error", e);
      return {
        reply:
          data.lang === "ar"? "صار خطأ بسيط. حاول مرة ثانية من فضلك.": "Something went wrong. Please try again.",
      };
    }
  });
