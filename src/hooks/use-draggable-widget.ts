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

  // Load saved position
  useEffect(() => {
    if (typeof window === "undefined") return;
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
  }, [storageKey]);

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
    [onPointerMove, onPointerUp],
  );

  // Reclamp on resize
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      setPos((p) => (p ? clampToViewport(p) : p));
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, [clampToViewport]);

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
        touchAction: "none",
        userSelect: "none",
        cursor: dragging ? "grabbing" : "grab",
      }
    : {
        position: "fixed",
        bottom: `calc(${defaultBottom}px + env(safe-area-inset-bottom, 0px))`,
        [defaultSide]: defaultSideOffset,
        touchAction: "none",
        userSelect: "none",
        cursor: dragging ? "grabbing" : "grab",
      };

  return { ref, style, onPointerDown, reset, dragging };
}
