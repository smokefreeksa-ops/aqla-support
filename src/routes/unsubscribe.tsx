import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubscribePage,
});

type State =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "already" }
  | { kind: "ready" }
  | { kind: "success" }
  | { kind: "error"; msg: string };

function UnsubscribePage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (!t) {
      setState({ kind: "invalid" });
      return;
    }
    setToken(t);
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setState({ kind: "invalid" });
          return;
        }
        if (data.valid) setState({ kind: "ready" });
        else if (data.reason === "already_unsubscribed") setState({ kind: "already" });
        else setState({ kind: "invalid" });
      })
      .catch(() => setState({ kind: "error", msg: "Network error" }));
  }, []);

  async function confirm() {
    if (!token) return;
    setState({ kind: "loading" });
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await r.json().catch(() => ({}));
      if (data.success) setState({ kind: "success" });
      else if (data.reason === "already_unsubscribed") setState({ kind: "already" });
      else setState({ kind: "error", msg: data.error || "Failed" });
    } catch {
      setState({ kind: "error", msg: "Network error" });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-lg font-bold text-ink-secondary mb-1">أقلع · Aqla</div>
        <div className="text-xs text-gray-500 mb-6">Email preferences · إدارة البريد</div>

        {state.kind === "loading" && (
          <p className="text-gray-600">Loading… · جارٍ التحميل…</p>
        )}
        {state.kind === "invalid" && (
          <>
            <h1 className="text-xl font-bold text-gray-900">Invalid link</h1>
            <p className="mt-2 text-sm text-gray-600"dir="rtl">
              الرابط غير صالح أو منتهي الصلاحية.
            </p>
          </>
        )}
        {state.kind === "already" && (
          <>
            <h1 className="text-xl font-bold text-gray-900">Already unsubscribed</h1>
            <p className="mt-2 text-sm text-gray-600"dir="rtl">
              تم إلغاء الاشتراك مسبقًا.
            </p>
          </>
        )}
        {state.kind === "ready" && (
          <>
            <h1 className="text-xl font-bold text-gray-900">Unsubscribe from Aqla emails?</h1>
            <p className="mt-2 text-sm text-gray-600"dir="rtl">
              هل تريد إلغاء الاشتراك من رسائل أقلع؟
            </p>
            <button
              onClick={confirm}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-brand hover:bg-ink-secondary px-6 py-2.5 text-sm font-semibold text-white"
            >
              Confirm unsubscribe · تأكيد
            </button>
          </>
        )}
        {state.kind === "success" && (
          <>
            <h1 className="text-xl font-bold text-ink-secondary">You've been unsubscribed</h1>
            <p className="mt-2 text-sm text-gray-600"dir="rtl">
              تم إلغاء اشتراكك بنجاح. لن تصلك رسائل أخرى.
            </p>
          </>
        )}
        {state.kind === "error" && (
          <>
            <h1 className="text-xl font-bold text-red-700">Something went wrong</h1>
            <p className="mt-2 text-sm text-gray-600">{state.msg}</p>
          </>
        )}
      </div>
    </div>
  );
}
