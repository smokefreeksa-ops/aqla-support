/**
 * @react-pdf/renderer expects Node's Buffer/process globals. Browsers don't
 * provide them, so PDF generation silently hangs ("Buffer is not defined").
 * Call this before importing @react-pdf/renderer in the browser.
 */
export async function ensurePdfRuntime() {
  if (typeof window === "undefined") return;
  const g = globalThis as unknown as { Buffer?: unknown; process?: { env?: Record<string, string> } };
  if (!g.Buffer) {
    const { Buffer } = await import("buffer");
    g.Buffer = Buffer;
  }
  if (!g.process) g.process = { env: {} };
  else if (!g.process.env) g.process.env = {};
}
