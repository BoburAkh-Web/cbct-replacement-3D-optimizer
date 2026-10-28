import { flushSync } from "react-dom";

type VTDocument = Document & { startViewTransition?: (update: () => void) => { finished: Promise<void> } };

/**
 * Holat o'zgarishini View Transitions API bilan silliq almashtiradi.
 * kind <html data-vt> ga yoziladi: "page" da appbar joyida qoladi, faqat kontent almashadi;
 * "theme"/"lang" da butun sahifa bir tekis o'tadi (styles.css ga qarang).
 * Brauzer qo'llamasa yoki foydalanuvchi animatsiyani o'chirgan bo'lsa — oddiy yangilanish.
 */
export function withTransition(update: () => void, kind: "page" | "theme" | "lang" = "page") {
  const doc = document as VTDocument;
  if (!doc.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return update();
  const root = document.documentElement;
  root.dataset.vt = kind;
  doc
    .startViewTransition(() => flushSync(update))
    .finished.finally(() => {
      if (root.dataset.vt === kind) delete root.dataset.vt;
    });
}
