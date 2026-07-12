export function useHaptics() {
  const supported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function";

  function vibrate(pattern: number | number[]) {
    if (!supported) return;
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }

  return {
    start: () => vibrate(40),
    stepTransition: () => vibrate([30, 40, 30]),
    complete: () => vibrate([40, 50, 80]),
    tick: () => vibrate(15),
  };
}
