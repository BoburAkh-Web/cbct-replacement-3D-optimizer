import { useEffect, useState } from "react";

const read = () => window.location.hash.replace(/^#/, "") || "/";

/** Oddiy hash-router: "#/qism/natija" → "/qism/natija". Statik hostingda ham sahifa yangilanganda ishlaydi. */
export function useHashRoute(): string {
  const [path, setPath] = useState(read);

  useEffect(() => {
    const onChange = () => setPath(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return path;
}

export const navigate = (path: string, replace = false) => {
  if (replace) window.location.replace(`#${path}`);
  else window.location.hash = path;
};
