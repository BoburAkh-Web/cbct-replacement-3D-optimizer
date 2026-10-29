import { USD_UZS } from "../data/samples";
import type { Currency } from "./format";
import type { Computed, PartResult } from "./parts";

/**
 * Valyuta faqat ko'rsatish va kiritish chegarasida: ichki ma'lumot va barcha hisoblar so'mda.
 * Ko'rsatilgan = so'm / kurs; kiritilgan qiymat → so'm = qiymat × kurs. So'm uchun kurs 1.
 */
export const rateOf = (cur: Currency) => (cur === "$" ? USD_UZS : 1);

/**
 * Natijadagi barcha pul qiymatlarini ko'rsatish valyutasiga o'tkazadi.
 * Hisob chiziqli (xarajatlar yig'indisi), shuning uchun yo'llar va tanlangan j lar o'zgarmaydi — faqat summalar bo'linadi.
 */
export function scaleResult(res: PartResult, rate: number): PartResult {
  if (rate === 1) return res;
  const k = (x: number) => x / rate;
  return {
    ...res,
    C: res.C.map((row) => row.map(k)),
    f: res.f.map(k),
    candidates: res.candidates.map((cs) => cs.map((c) => ({ ...c, value: k(c.value) }))),
    min: k(res.min),
    noReplace: k(res.noReplace),
    intervals: res.intervals.map((o) => ({ ...o, cost: k(o.cost) })),
    years: res.years.map((r) => ({ ...r, buy: k(r.buy), repair: k(r.repair), salvage: k(r.salvage), net: k(r.net), cumulative: k(r.cumulative) })),
    P: res.P.map(k),
    V: res.V.map(k),
    R: res.R.map(k),
  };
}

export const scaleComputed = (c: Computed, rate: number): Computed => (c.error === null ? { error: null, result: scaleResult(c.result, rate) } : c);
