import { useLayoutEffect, useRef, useState } from "react";

/**
 * Element kengligi (px). Grafiklar viewBox'ni shu kenglikka teng qilib chizadi —
 * 1 birlik = 1 px, shuning uchun telefonda ham yozuvlar 11px bo'lib qoladi, kichrayib ketmaydi.
 */
export function useElementWidth<T extends HTMLElement>(fallback = 900) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(Math.round(el.clientWidth) || fallback);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);

  return [ref, width] as const;
}
