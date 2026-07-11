import { useEffect, useState } from "react";

export function useTypewriter(
  text: string,
  speed = 60,
  delay = 400,
): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    let interval: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          if (interval) clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, delay);
    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [text, speed, delay]);

  return { displayed, done };
}
