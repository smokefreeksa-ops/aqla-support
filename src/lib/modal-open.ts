import { useEffect, useState } from "react";

const EVENT = "aqla:modal-open-change";
let count = 0;

/** Ref-counted "a modal is open" flag shared across the app. */
export function setModalOpen(open: boolean) {
  if (typeof window === "undefined") return;
  count = open ? count + 1 : Math.max(0, count - 1);
  if (count > 0) document.documentElement.dataset.aqlaModalOpen = "1";
  else delete document.documentElement.dataset.aqlaModalOpen;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { open: count > 0 } }));
}

export function useModalOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setOpen(count > 0);
    const h = (e: Event) => setOpen(Boolean((e as CustomEvent<{ open: boolean }>).detail?.open));
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, []);
  return open;
}
