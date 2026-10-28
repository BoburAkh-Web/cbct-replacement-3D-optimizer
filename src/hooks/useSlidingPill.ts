import { useLayoutEffect, useRef, useState } from "react";

/**
 * Navbardagi faol havola ostida siljiydigan fon (pill) uchun o'lcham va joylashuv.
 * Faqat transform/width o'zgaradi — animatsiya GPU'da, sahifa qayta chizilmaydi.
 */
export function useSlidingPill<T extends HTMLElement>(deps: unknown[]) {
  const ref = useRef<T>(null);
  const placed = useRef(false);
  const [style, setStyle] = useState<React.CSSProperties>({ opacity: 0 });

  useLayoutEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    const place = () => {
      const a = nav.querySelector<HTMLElement>('[aria-current="page"]');
      if (!a) return setStyle({ opacity: 0 });
      setStyle({
        width: a.offsetWidth,
        height: a.offsetHeight,
        transform: `translate(${a.offsetLeft}px, ${a.offsetTop}px)`,
        // Birinchi joylashuv animatsiyasiz — pill chapdan "uchib" kelmasin
        transition: placed.current ? undefined : "none",
      });
      // Tor ekranda qator gorizontal suriladi — faol havola o'rtaga keltiriladi
      if (nav.scrollWidth > nav.clientWidth)
        nav.scrollTo({ left: a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2, behavior: placed.current ? "smooth" : "auto" });
      placed.current = true;
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(nav);
    return () => ro.disconnect();
  }, deps);

  return [ref, style] as const;
}
