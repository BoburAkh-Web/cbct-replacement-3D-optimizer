export type Currency = "$" | "soʻm";

const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

/** 23650 → "23 650" */
export function fmt(x: number): string {
  return nf.format(Math.round(x * 100) / 100).replace(/ | /g, " ");
}

export function money(x: number, cur: Currency): string {
  return cur === "$" ? `$${fmt(x)}` : `${fmt(x)} soʻm`;
}

export const pathStr = (p: number[]) => p.join(" → ");

export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const e = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / e;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10) * e;
}

/** Jadvalni Excelga joylashtirish uchun tab bilan ajratilgan matn sifatida nusxalash */
export async function copyTSV(rows: (string | number)[][]): Promise<boolean> {
  const txt = rows.map((r) => r.join("\t")).join("\n");
  try {
    await navigator.clipboard.writeText(txt);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}
