export type Currency = "$" | "soʻm";

const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

/** 23650 → "23 650" */
export function fmt(x: number): string {
  return nf.format(Math.round(x * 100) / 100).replace(/ | /g, " ");
}

/** Grafik o'qlari uchun qisqa yozuv: 115 200 000 → "115,2 mln" (birliklar tilga qarab beriladi) */
export function fmtShort(x: number, u: { k: string; m: string; b: string }): string {
  const a = Math.abs(x);
  if (a >= 1e9) return `${fmt(+(x / 1e9).toFixed(2))} ${u.b}`;
  if (a >= 1e6) return `${fmt(+(x / 1e6).toFixed(1))} ${u.m}`;
  if (a >= 1e4) return `${fmt(+(x / 1e3).toFixed(0))} ${u.k}`;
  return fmt(x);
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
