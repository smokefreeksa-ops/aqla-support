import { useEffect, useRef, useState } from "react";

type CursorState = "default" | "hovering" | "clicking" | "text";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number>(0);
  const [state, setState] = useState<CursorState>("default");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    document.documentElement.style.cursor = "none";

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const target = e.target as HTMLElement;
      const isClickable =
        target.closest(
          "a, button, [role='button'], [data-cursor='pointer'], select, label, input[type='checkbox'], input[type='radio']",
        ) !== null;
      const isText =
        !isClickable &&
        target.closest("p, span, h1, h2, h3, h4, h5, h6, li, td, th, blockquote") !== null;

      if (isClickable) setState("hovering");
      else if (isText) setState("text");
      else setState("default");
    };

    const onMouseDown = () => setState("clicking");
    const onMouseUp = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = target.closest("a, button, [role='button']") !== null;
      setState(isClickable ? "hovering" : "default");
    };
    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    const LERP = 0.28;
    const animate = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * LERP;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * LERP;
      if (dotRef.current)
        dotRef.current.style.transform = `translate(${mousePos.current.x}px, ${mousePos.current.y}px)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px)`;
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.documentElement.style.cursor = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      cancelAnimationFrame(rafId.current);
    };
  }, [visible]);

  const dotSize =
    state === "clicking" ? 4 : state === "hovering" ? 8 : state === "text" ? 0 : 5;
  const ringSize = state === "clicking" ? 20 : state === "hovering" ? 34 : 22;
  const ringOpacity = state === "hovering" ? 0.55 : state === "clicking" ? 0.75 : 0.45;
  const isTextState = state === "text";

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: isTextState ? 2 : dotSize,
          height: isTextState ? 18 : dotSize,
          marginLeft: isTextState ? -1 : -(dotSize / 2),
          marginTop: isTextState ? -9 : -(dotSize / 2),
          borderRadius: isTextState ? 1 : "50%",
          backgroundColor: "rgba(255,255,255,0.95)",
          boxShadow: "0 0 6px rgba(255,255,255,0.35)",
          pointerEvents: "none",
          zIndex: 99999,
          opacity: visible ? 1 : 0,
          transition:
            "width 200ms ease, height 200ms ease, margin 200ms ease, border-radius 200ms ease, opacity 250ms ease",
          willChange: "transform",
          mixBlendMode: "difference",
        }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: ringSize,
          height: ringSize,
          marginLeft: -(ringSize / 2),
          marginTop: -(ringSize / 2),
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.55)",
          backgroundColor:
            state === "hovering" ? "rgba(255,255,255,0.06)" : "transparent",
          pointerEvents: "none",
          zIndex: 99998,
          opacity: visible ? ringOpacity : 0,
          transition:
            "width 260ms cubic-bezier(0.22,1,0.36,1), height 260ms cubic-bezier(0.22,1,0.36,1), margin 260ms cubic-bezier(0.22,1,0.36,1), opacity 250ms ease, background-color 250ms ease",
          willChange: "transform",
          mixBlendMode: "difference",
        }}
      />
    </>
  );
}
