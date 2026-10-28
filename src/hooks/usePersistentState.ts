import { useEffect, useState } from "react";

/** useState + localStorage. Saqlash ishlamasa (yashirin oyna va h.k.) oddiy state sifatida ishlayveradi. */
export function usePersistentState<T>(key: string, initial: () => T, isValid: (x: unknown) => x is T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (isValid(parsed)) return parsed;
      }
    } catch {
      /* e'tiborsiz */
    }
    return initial();
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* e'tiborsiz */
    }
  }, [key, value]);

  return [value, setValue];
}
