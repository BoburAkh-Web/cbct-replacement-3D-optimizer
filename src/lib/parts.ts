import type { SampleSource } from "../data/samples";
import { cumulativeRiskCost, fixedInterval, solve, yearlyBreakdown, type Solution, type YearRow } from "./model";

export const MIN_YEARS = 2;
export const MAX_YEARS = 15;

export type RMode = "direct" | "ext";

/** Kiritish katakchalari string sifatida saqlanadi — foydalanuvchi "12." kabi oraliq qiymat yozishi mumkin. */
export interface Part {
  id: string;
  name: string;
  N: number;
  P: string[];
  V: string[];
  R: string[];
  mode: RMode;
  ext: { r: string[]; pf: string[]; Cf: string; Cd: string; td: string };
  sample: SampleSource | null;
  test: boolean;
}

const roundTo = (x: number, s: number) => Math.round(x / s) * s;

/** Yillar soni oshirilganda massivni MAX_YEARS gacha mantiqiy davom ettirish */
function extend(arr: number[], kind: "P" | "V" | "R"): number[] {
  const a = arr.slice();
  const step = a[0] >= 1000 ? 50 : 5;
  while (a.length < MAX_YEARS) {
    const L = a[a.length - 1];
    const L2 = a.length > 1 ? a[a.length - 2] : L * 0.9;
    if (kind === "P") a.push(roundTo(L * (L2 ? L / L2 : 1.02), step) || L);
    else if (kind === "V") a.push(Math.max(0, roundTo(L * 0.75, step)));
    else a.push(roundTo(L + (L - L2) * 1.35, step));
  }
  return a;
}

const newId = () => "p" + Math.random().toString(36).slice(2, 9);
const str = (a: number[]) => a.map(String);

export function makePart(src: SampleSource, keepSample = true): Part {
  const P = extend(src.P, "P");
  const V = extend(src.V, "V");
  const R = extend(src.R, "R");
  const r = R.map((x, i) => (i ? x - R[i - 1] : x));
  const pf = r.map((_, i) => +Math.min(0.9, 0.03 * Math.pow(1.35, i)).toFixed(3));
  return {
    id: newId(),
    name: src.name,
    N: src.N,
    P: str(P),
    V: str(V),
    R: str(R),
    mode: "direct",
    ext: {
      r: str(r),
      pf: str(pf),
      Cf: String(roundTo(src.P[0] * 0.08, src.P[0] >= 1000 ? 50 : 5)),
      Cd: String(src.test ? 10 : 150),
      td: String(src.td || 2),
    },
    sample: keepSample ? src : null,
    test: !!src.test,
  };
}

const isNum = (s: string) => s.trim() !== "" && Number.isFinite(Number(s));

export function validate(p: Part): string | null {
  const N = p.N;
  const arrs = p.mode === "direct" ? [p.P, p.V, p.R] : [p.P, p.V, p.ext.r, p.ext.pf];
  for (const a of arrs) for (let i = 0; i < N; i++) if (!isNum(a[i] ?? "")) return "Barcha katakchalarga son kiriting (boʻsh yoki notoʻgʻri qiymat bor).";
  if (p.mode === "ext") {
    if (![p.ext.Cf, p.ext.Cd, p.ext.td].every(isNum)) return "Cf, Cd va td maydonlariga son kiriting.";
    for (let i = 0; i < N; i++) {
      const v = Number(p.ext.pf[i]);
      if (v < 0 || v > 1) return "Nosozlik ehtimoli 0 va 1 oraligʻida boʻlishi kerak.";
    }
  }
  return null;
}

export function getR(p: Part): number[] {
  const N = p.N;
  if (p.mode === "direct") return p.R.slice(0, N).map(Number);
  return cumulativeRiskCost(p.ext.r.map(Number), p.ext.pf.map(Number), Number(p.ext.Cf), Number(p.ext.Cd), Number(p.ext.td), N);
}

export interface PartResult extends Solution {
  P: number[];
  V: number[];
  R: number[];
  years: YearRow[];
  /** Butun davr almashtirmasdan ishlatish xarajati: c(0, N) */
  noReplace: number;
  intervals: { T: number; cost: number; path: number[] }[];
}

export type Computed = { error: string } | { error: null; result: PartResult };

export function computePart(p: Part): Computed {
  const err = validate(p);
  if (err) return { error: err };
  const N = p.N;
  const P = p.P.slice(0, N).map(Number);
  const V = p.V.slice(0, N).map(Number);
  const R = getR(p);
  const s = solve(P, V, R, N);
  const intervals = [];
  for (let T = 1; T <= N; T++) intervals.push({ T, ...fixedInterval(T, s.C, N) });
  return {
    error: null,
    result: { ...s, P, V, R, years: yearlyBreakdown(s.paths[0], P, V, R), noReplace: s.C[0][N], intervals },
  };
}

/** localStorage dan o'qilgan ma'lumot to'g'ri tuzilganligini tekshirish */
export function isPartArray(x: unknown): x is Part[] {
  return (
    Array.isArray(x) &&
    x.length > 0 &&
    x.every(
      (p) =>
        p && typeof p.name === "string" && typeof p.N === "number" && Array.isArray(p.P) && Array.isArray(p.V) && Array.isArray(p.R) && p.ext && Array.isArray(p.ext.r) && Array.isArray(p.ext.pf),
    )
  );
}
