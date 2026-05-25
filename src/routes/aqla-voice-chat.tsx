import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, MicOff, Volume2, VolumeX, Loader2, Sparkles } from "lucide-react";
import { voiceChat } from "@/lib/voice-assistant.functions";
import { Button } from "@/components/ui/button";
import { appRoutes } from "@/lib/app-routes";

export const Route = createFileRoute("/aqla-voice-chat")({
  component: AqlaVoiceChatPage,
  head: () => ({
    meta: [
      { title: "أقلع — المساعد الصوتي | Aqla Voice Assistant" },
      {
        name: "description",
        content:
          "مساعد أقلع الصوتي بالعربية: دعم لحظات الرغبة، تنفس 4-7-8، وتوجيه فوري لمحرّك أقلع الشخصي.",
      },
    ],
  }),
});

type Msg = { role: "user" | "assistant"; content: string };

type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SR;
    webkitSpeechRecognition?: new () => SR;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function pickArabicVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang?.toLowerCase().startsWith("ar")) ||
    voices.find((v) => v.lang?.toLowerCase().includes("ar")) ||
    null
  );
}

function AqlaVoiceChatPage() {
  const chatFn = useServerFn(voiceChat);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "يا هلا 👋 أنا مساعد أقلع الصوتي. اضغط على المايك وتكلم معي عن الرغبة أو الإقلاع. خطتك الكاملة تُبنى في محرّك أقلع الشخصي.",
    },
  ]);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const [supported, setSupported] = useState(true);
  const [transcript, setTranscript] = useState("");
  const recRef = useRef<SR | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SR = getSpeechRecognition();
    if (!SR) setSupported(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      // Warm up voice list
      window.speechSynthesis.onvoiceschanged = () => {
        /* trigger voice load */
      };
    }
    return () => {
      try {
        recRef.current?.stop();
      } catch {
        /* noop */
      }
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const speak = useCallback(
    (text: string) => {
      if (muted || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "ar-SA";
      const v = pickArabicVoice();
      if (v) u.voice = v;
      u.rate = 1;
      u.pitch = 1;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [muted],
  );

  const sendToAssistant = useCallback(
    async (userText: string) => {
      const next: Msg[] = [...messages, { role: "user", content: userText }];
      setMessages(next);
      setTranscript("");
      setThinking(true);
      try {
        const res = (await chatFn({
          data: { lang: "ar", messages: next.map(({ role, content }) => ({ role, content })) },
        })) as { reply: string };
        const reply = res.reply || "حاضر.";
        setMessages([...next, { role: "assistant", content: reply }]);
        speak(reply);
      } catch (e) {
        console.error(e);
        const fallback = "تعذّر الاتصال. حاول بعد لحظات من فضلك.";
        setMessages([...next, { role: "assistant", content: fallback }]);
        speak(fallback);
      } finally {
        setThinking(false);
      }
    },
    [messages, chatFn, speak],
  );

  function startListening() {
    const SR = getSpeechRecognition();
    if (!SR) {
      setSupported(false);
      return;
    }
    try {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      const rec = new SR();
      rec.lang = "ar-SA";
      rec.interimResults = true;
      rec.continuous = false;
      let finalText = "";
      rec.onresult = (e) => {
        let interim = "";
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i] as ArrayLike<{ transcript: string }> & { isFinal?: boolean };
          const t = r[0].transcript;
          if ((r as { isFinal?: boolean }).isFinal) finalText += t;
          else interim += t;
        }
        setTranscript(finalText || interim);
      };
      rec.onerror = (err) => {
        console.error("[STT]", err);
        setListening(false);
      };
      rec.onend = () => {
        setListening(false);
        const text = (finalText || "").trim();
        if (text) void sendToAssistant(text);
      };
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch (e) {
      console.error(e);
      setListening(false);
    }
  }

  function stopListening() {
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }

  function toggleMute() {
    setMuted((m) => {
      const next = !m;
      if (next && typeof window !== "undefined") window.speechSynthesis?.cancel();
      return next;
    });
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-6 text-right">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            تجريبي — تحدّث معي بالعربية
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            مساعد أقلع الصوتي
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            دعم سريع للرغبة وتمارين تنفّس. لا يُغني عن{" "}
            <Link
              to={appRoutes.aqlaQuitEngine}
              className="font-medium text-primary underline-offset-2 hover:underline"
            >
              محرّك أقلع الشخصي
            </Link>
            ، ولا يصف أدوية، ولا يقيس درجة الاعتماد.
          </p>
        </header>

        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div
            ref={scrollRef}
            className="max-h-[55vh] min-h-[40vh] space-y-3 overflow-y-auto p-4"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                dir="rtl"
                className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "mr-auto bg-primary text-primary-foreground"
                    : "ml-auto bg-muted text-foreground"
                }`}
                style={{ textAlign: "right" }}
              >
                {m.content}
              </div>
            ))}
            {transcript && (
              <div className="mr-auto max-w-[88%] rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-2 text-sm text-muted-foreground">
                {transcript}…
              </div>
            )}
            {thinking && (
              <div className="ml-auto inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> يفكّر…
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border bg-background/60 p-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              aria-label={muted ? "تشغيل الصوت" : "كتم الصوت"}
              title={muted ? "تشغيل الصوت" : "كتم الصوت"}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>

            <div className="flex flex-1 items-center justify-center">
              <button
                type="button"
                onClick={listening ? stopListening : startListening}
                disabled={!supported || thinking}
                aria-label={listening ? "إيقاف التسجيل" : "ابدأ التحدّث"}
                className={`relative inline-flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 ${
                  listening
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground hover:scale-105"
                }`}
              >
                {listening && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" />
                )}
                {listening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
              </button>
            </div>

            <div className="w-10 text-center text-[10px] text-muted-foreground">
              {speaking ? "يتحدّث…" : listening ? "أستمع…" : "جاهز"}
            </div>
          </div>
        </div>

        {!supported && (
          <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 p-3 text-right text-xs text-amber-900">
            متصفحك لا يدعم التعرّف الصوتي. استخدم Chrome على أندرويد أو ديسكتوب، أو Safari على iOS
            للحصول على أفضل تجربة.
          </p>
        )}

        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-right text-xs leading-relaxed text-muted-foreground">
          <p className="mb-2 font-semibold text-foreground">إرشادات الأمان</p>
          <ul className="list-inside list-disc space-y-1">
            <li>المساعد للدعم التثقيفي فقط ولا يقدّم تشخيصًا أو وصفة دوائية.</li>
            <li>للطوارئ (ألم صدر شديد، ضيق تنفس، أفكار إيذاء): اتصل بـ 997 فورًا.</li>
            <li>
              لبناء خطة كاملة افتح{" "}
              <Link to={appRoutes.aqlaQuitEngine} className="text-primary underline-offset-2 hover:underline">
                محرّك أقلع الشخصي
              </Link>
              .
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
