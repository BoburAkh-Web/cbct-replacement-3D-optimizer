import { describe, expect, it } from "vitest";
import { cumulativeRiskCost, fixedInterval, replacementYears, solve, yearlyBreakdown } from "./model";

// Darslik (BMI namunasi) misoli: kutilgan javob 335, yo'l 0 → 2 → 6 → 10
const P = [115, 120, 125, 130, 135, 140, 150, 155, 165, 170];
const V = [85, 80, 65, 55, 50, 40, 35, 20, 5, 0];
const R = [20, 25, 40, 55, 100, 140, 170, 240, 280, 370];

describe("solve — dinamik dasturlash", () => {
  const s = solve(P, V, R, 10);

  it("darslikdagi segment xarajatlari jadvalini takrorlaydi", () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((j) => s.C[0][j])).toEqual([50, 60, 90, 115, 165, 215, 250, 335, 390, 485]);
    expect(s.C[2][6]).toBe(125);
    expect(s.C[6][10]).toBe(150);
    expect(s.C[9][10]).toBe(105);
  });

  it("minimal xarajat 335 va yagona optimal yo'l 0 → 2 → 6 → 10", () => {
    expect(s.min).toBe(335);
    expect(s.paths).toEqual([[0, 2, 6, 10]]);
    expect(replacementYears(s.paths[0])).toEqual([3, 7]);
  });

  it("yillik taqsimot yig'indisi minimal xarajatga teng", () => {
    const rows = yearlyBreakdown(s.paths[0], P, V, R);
    expect(rows).toHaveLength(10);
    expect(rows[rows.length - 1].cumulative).toBe(335);
  });

  it("muntazam almashtirish optimaldan arzon bo'lmaydi", () => {
    for (let T = 1; T <= 10; T++) expect(fixedInterval(T, s.C, 10).cost).toBeGreaterThanOrEqual(335);
    expect(fixedInterval(10, s.C, 10).cost).toBe(485);
  });

  it("teng optimal yo'llarning hammasini topadi", () => {
    // ikki yil: almashtirish va almashtirmaslik teng bo'ladigan holat
    // c(0,1)=c(1,2)=60, c(0,2)=120 → 0→1→2 va 0→2 ikkalasi ham 120
    const t = solve([100, 100], [50, 0], [10, 20], 2);
    expect(t.min).toBe(120);
    expect(t.paths).toEqual([[0, 1, 2], [0, 2]]);
  });
});

describe("cumulativeRiskCost — nosozlik xavfi kengaytmasi", () => {
  it("R_k = Σ [ r_m + Pf(m)·(Cf + Cd·td) ]", () => {
    expect(cumulativeRiskCost([10, 20], [0.1, 0.5], 100, 10, 2, 2)).toEqual([22, 102]);
  });
});
