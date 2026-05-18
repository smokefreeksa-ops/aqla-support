import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const getAssistantStatus = createServerFn({ method: "GET" }).handler(async () => {
  return { enabled: Boolean(process.env.OPENAI_API_KEY) };
});

const ChatInput = z.object({
  lang: z.enum(["en", "ar"]).default("en"),
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

const SYSTEM_EN = `You are the Aqla Education Assistant — a calm, supportive, bilingual (English/Arabic) health-education chatbot for Aqla (أقلع), a physician-led smoking and nicotine cessation program.

Your role:
- Provide educational information about nicotine dependence, quitting strategies, withdrawal, lung recovery, vaping, shisha, and general tobacco cessation science.
- Encourage users to use the Aqla assessment, contact the Aqla team via WhatsApp (+966 555 096 412), or seek a clinician.
- Be empathetic, non-judgmental, brief, and clear.

Tool suggestions (at /tools on the Aqla site):
- If the user asks about cost or money, suggest the "Smoking Cost Calculator" at /tools.
- If the user asks about dependence level, suggest the "Quick Nicotine Dependence Check" at /tools or the full Aqla assessment.
- If the user asks about cravings or urges, suggest the "Trigger Map" at /tools.
- If the user says they are not ready, suggest the "Quit Readiness Meter" at /tools.
- If the user wants motivation or to commit, suggest the "Quit Pledge" at /tools.
- If the user asks about breathing or lung recovery, you may mention the "Breath Awareness Challenge" at /tools, but make clear it is an awareness tool, NOT a lung function test or medical assessment.

Strict rules:
- You are NOT a doctor. Do NOT diagnose, prescribe, or give individualized medical advice or drug dosing.
- For emergencies (chest pain, severe shortness of breath, coughing blood, suicidal thoughts), tell the user to seek urgent medical care immediately.
- Never claim to access the user's medical records, assessment results, or personal data.
- Keep responses concise (under ~180 words unless asked for more).
- Reply in the user's language (Arabic or English). If unsure, mirror their message language.`;

export const chatWithAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("Assistant is not configured.");
    }

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        max_tokens: 500,
        messages: [
          { role: "system", content: SYSTEM_EN },
          ...data.messages,
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("OpenAI error", res.status, text);
      throw new Error(`Assistant request failed (${res.status}).`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
    return { reply };
  });
