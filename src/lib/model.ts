/**
 * Jihozni almashtirish va ta'mirlash masalasi — dinamik dasturlash (Bellman).
 *
 * Belgilashlar (indekslar 0 dan boshlanadi, matematik yozuvda 1 dan):
 *   P[i]   — (i+1)-yil boshida yangi qism narxi            (P_{i+1})
 *   V[k-1] — k yil ishlatilgan qismning qoldiq qiymati      (V_k)
 *   R[k-1] — ketma-ket k yil ishlatishdagi jami ta'mir xarajati (R_k, yig'ma)
 *
 * Segment xarajati:  c(i, j) = P_{i+1} + R_{j-i} − V_{j-i},   0 ≤ i < j ≤ N
 * Bellman:           f(N) = 0,  f(i) = min_{j>i} [ c(i, j) + f(j) ]
 * Minimal xarajat:   f(0)
 */

const EPS = 1e-9;
const MAX_PATHS = 24;

export interface Candidate {
  j: number;
  value: number; // c(i,j) + f(j)
}

export interface Solution {
  N: number;
  /** C[i][j] — segment xarajati, j > i */
  C: number[][];
  /** f[i] — i-tugundan reja oxirigacha minimal xarajat */
  f: number[];
  /** next[i] — minimumni beradigan barcha j lar */
  next: number[][];
  /** candidates[i] — i uchun barcha j variantlari */
  candidates: Candidate[][];
  /** Barcha teng optimal yo'llar (0 → … → N) */
  paths: number[][];
  min: number;
}

export function segmentCost(P: number[], V: number[], R: number[], i: number, j: number): number {
  const k = j - i;
  return P[i] + R[k - 1] - V[k - 1];
}

export function solve(P: number[], V: number[], R: number[], N: number): Solution {
  const C: number[][] = [];
  for (let i = 0; i < N; i++) {
    C[i] = [];
    for (let j = i + 1; j <= N; j++) C[i][j] = segmentCost(P, V, R, i, j);
  }

  const f = new Array<number>(N + 1).fill(Infinity);
  const next: number[][] = [];
  const candidates: Candidate[][] = [];
  f[N] = 0;
  next[N] = [];

  for (let i = N - 1; i >= 0; i--) {
    candidates[i] = [];
    next[i] = [];
    for (let j = i + 1; j <= N; j++) {
      const value = C[i][j] + f[j];
      candidates[i].push({ j, value });
      if (value < f[i] - EPS) {
        f[i] = value;
        next[i] = [j];
      } else if (Math.abs(value - f[i]) < EPS) {
        next[i].push(j);
      }
    }
  }

  const paths: number[][] = [];
  const walk = (n: number, path: number[]) => {
    if (paths.length >= MAX_PATHS) return;
    if (n === N) {
      paths.push(path);
      return;
    }
    for (const j of next[n]) walk(j, [...path, j]);
  };
  walk(0, [0]);

  return { N, C, f, next, candidates, paths, min: f[0] };
}

export interface YearRow {
  year: number; // 1..N
  age: number; // shu yildagi qism yoshi (1 = yangi)
  buy: number;
  repair: number;
  salvage: number; // qoldiq qiymat (xarajatni kamaytiradi)
  net: number;
  cumulative: number;
  isPurchase: boolean;
}

/** Berilgan yo'l bo'yicha xarajatlarni yillarga taqsimlash. Yig'indisi c(i,j) lar yig'indisiga teng. */
export function yearlyBreakdown(path: number[], P: number[], V: number[], R: number[]): YearRow[] {
  const rows: YearRow[] = [];
  for (let s = 0; s < path.length - 1; s++) {
    const a = path[s];
    const b = path[s + 1];
    for (let y = a + 1; y <= b; y++) {
      const age = y - a;
      const buy = y === a + 1 ? P[a] : 0;
      const repair = R[age - 1] - (age > 1 ? R[age - 2] : 0);
      const salvage = y === b ? V[b - a - 1] : 0;
      rows.push({ year: y, age, buy, repair, salvage, net: buy + repair - salvage, cumulative: 0, isPurchase: y === a + 1 });
    }
  }
  let cum = 0;
  for (const r of rows) {
    cum += r.net;
    r.cumulative = cum;
  }
  return rows;
}

/** Har T yilda muntazam almashtirish strategiyasi (oxirgi segment qisqaroq bo'lishi mumkin). */
export function fixedInterval(T: number, C: number[][], N: number): { cost: number; path: number[] } {
  let i = 0;
  let cost = 0;
  const path = [0];
  while (i < N) {
    const j = Math.min(N, i + T);
    cost += C[i][j];
    i = j;
    path.push(j);
  }
  return { cost, path };
}

/**
 * Kengaytma: R_k ni nosozlik xavfi orqali hisoblash.
 * R_k = Σ_{m=1..k} [ r_m + Pf(m) · (Cf + Cd · td) ]
 */
export function cumulativeRiskCost(r: number[], pf: number[], Cf: number, Cd: number, td: number, N: number): number[] {
  const failureCost = Cf + Cd * td;
  const out: number[] = [];
  let acc = 0;
  for (let m = 0; m < N; m++) {
    acc += r[m] + pf[m] * failureCost;
    out.push(Math.round(acc * 100) / 100);
  }
  return out;
}

/** Almashtirish yillari: yo'ldagi oraliq tugunlar (tugun n → (n+1)-yil boshida yangi qism). */
export function replacementYears(path: number[]): number[] {
  return path.slice(1, -1).map((n) => n + 1);
}
