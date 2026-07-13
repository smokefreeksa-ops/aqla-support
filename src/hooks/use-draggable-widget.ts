import { useCallback, useEffect, useRef, useState } from "react";

type Pos = { x: number; y: number };
type Side = "left" | "right";

export type DraggableWidgetState = {
  ref: React.RefObject<HTMLDivElement | null>;
  style: React.CSSProperties;
  onPointerDown: (e: React.PointerEvent) => void;
  reset: () => void;
  dragging: boolean;
};

/**
 * Draggable floating widget with localStorage persistence.
 * Position is stored as distance from viewport edges (so resizing the window keeps it visible).
 * Default position is anchored to a corner (bottom + side).
 */
export function useDraggableWidget(opts: {
  storageKey: string;
  defaultSide?: Side; // which side to anchor by default
  defaultBottom?: number;
  defaultSideOffset?: number;
}): DraggableWidgetState {
  const {
    storageKey,
    defaultSide = "left",
    defaultBottom = 24,
    defaultSideOffset = 24,
  } = opts;

  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragEnabled, setDragEnabled] = useState(false);
  const dragState = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);

  const clampToViewport = useCallback((p: Pos): Pos => {
    if (typeof window === "undefined") return p;
    const el = ref.current;
    const w = el?.offsetWidth ?? 56;
    const h = el?.offsetHeight ?? 56;
    const margin = 8;
    return {
      x: Math.min(Math.max(margin, p.x), window.innerWidth - w - margin),
      y: Math.min(Math.max(margin, p.y), window.innerHeight - h - margin),
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const finePointer = window.matchMedia("(pointer: fine)");
    const hoverPointer = window.matchMedia("(hover: hover)");
    const update = () => {
      const enabled = finePointer.matches && hoverPointer.matches;
      setDragEnabled(enabled);
      if (!enabled) setPos(null);
    };
    update();
    finePointer.addEventListener?.("change", update);
    hoverPointer.addEventListener?.("change", update);
    return () => {
      finePointer.removeEventListener?.("change", update);
      hoverPointer.removeEventListener?.("change", update);
    };
  }, []);

  // Load saved position on desktop pointers only. On phones, dragging a fixed
  // widget competes with page scrolling and can feel like the page is shaking.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!dragEnabled) return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Pos;
      if (
        typeof parsed?.x === "number" &&
        typeof parsed?.y === "number" &&
        parsed.x >= 0 &&
        parsed.y >= 0 &&
        parsed.x < window.innerWidth &&
        parsed.y < window.innerHeight
      ) {
        setPos(parsed);
      } else {
        localStorage.removeItem(storageKey);
      }
    } catch {
      /* ignore */
    }
  }, [dragEnabled, storageKey]);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const ds = dragState.current;
      if (!ds) return;
      const dx = e.clientX - ds.startX;
      const dy = e.clientY - ds.startY;
      if (!ds.moved && Math.hypot(dx, dy) < 4) return;
      ds.moved = true;
      const next = clampToViewport({ x: ds.origX + dx, y: ds.origY + dy });
      setPos(next);
    },
    [clampToViewport],
  );

  const onPointerUp = useCallback(() => {
    const ds = dragState.current;
    dragState.current = null;
    setDragging(false);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    if (ds?.moved) {
      // persist final position
      setPos((p) => {
        if (p) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(p));
          } catch {
            /* ignore */
          }
        }
        return p;
      });
    }
  }, [onPointerMove, storageKey]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!dragEnabled) return;
      // only left button / touch / pen
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: rect.left,
        origY: rect.top,
        moved: false,
      };
      setDragging(true);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    },
    [dragEnabled, onPointerMove, onPointerUp],
  );

  // Reclamp on resize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      setPos((p) => (p ? clampToViewport(p) : p));
    };
      if (!dragEnabled) return;
      window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [clampToViewport, dragEnabled]);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
    setPos(null);
  }, [storageKey]);

  const style: React.CSSProperties = pos
    ? {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        right: "auto",
        bottom: "auto",
        touchAction: dragEnabled ? "none" : "manipulation",
        userSelect: dragEnabled ? "none" : "auto",
        cursor: dragging ? "grabbing" : "grab",
      }
    : {
        position: "fixed",
        bottom: `calc(${defaultBottom}px + env(safe-area-inset-bottom, 0px))`,
        [defaultSide]: defaultSideOffset,
        touchAction: dragEnabled ? "none" : "manipulation",
        userSelect: dragEnabled ? "none" : "auto",
        cursor: dragEnabled ? (dragging ? "grabbing" : "grab") : "auto",
      };

  return { ref, style, onPointerDown, reset, dragging };
}
