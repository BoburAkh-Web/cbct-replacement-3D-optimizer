import { replacementYears } from "../lib/model";
import type { PartResult } from "../lib/parts";
import { copyTSV, fmt, pathStr, type Currency } from "../lib/format";
import { useT } from "../i18n";
import { DagChart, IntervalChart, YearChart } from "./charts";

export type PartView = "natija" | "tor" | "hisob" | "solishtirish";

interface Props {
  view: PartView;
  res: PartResult;
  cur: Currency;
  dimmed: boolean;
  notify: (msg: string) => void;
}

export default function PartResults({ view, res, cur, dimmed, notify }: Props) {
  const t = useT();
  const { N, C, f, next, candidates, paths, min, years, noReplace, intervals } = res;
  const best = paths[0];
  const saving = noReplace - min;
  const repYears = replacementYears(best);

  const optEdges = new Set<string>();
  paths.forEach((pt) => pt.slice(0, -1).forEach((a, s) => optEdges.add(`${a}-${pt[s + 1]}`)));
  const optNodes = new Set(paths.flat());

  const sum = (k: "buy" | "repair" | "salvage" | "net") => years.reduce((a, r) => a + r[k], 0);

  const copyYears = async () => {
    const ok = await copyTSV([
      [t.thYear, t.thDecision, t.thAge, t.thBuy, t.thRep, t.thSalv, t.thNet, t.thCum],
      ...years.map((r) => [r.year, r.isPurchase ? t.tagNew : t.tagRep, r.age, r.buy, r.repair, -r.salvage, r.net, r.cumulative]),
      [t.total, "", "", sum("buy"), sum("repair"), -sum("salvage"), sum("net"), ""],
    ]);
    notify(ok ? t.toastCopied : t.toastCopyFail);
  };

  return (
    <div className={`stack ${dimmed ? "dimmed" : ""}`}>
      {view === "natija" && (
        <>
          {/* Asosiy ko'rsatkichlar */}
          <div className="kpis">
            <div className="kpi main">
              <span className="k">{t.kMin}</span>
              <span className="v">{t.money(min, cur)}</span>
              <span className="d">{t.dMin(N)}</span>
            </div>
            <div className="kpi">
              <span className="k">{t.kPath(paths.length > 1)}</span>
              <span className="v path">
                {paths.map((p) => (
                  <span key={p.join("-")} style={{ display: "block" }}>{pathStr(p)}</span>
                ))}
              </span>
              <span className="d">{paths.length > 1 ? t.dPaths(paths.length) : t.dPath1}</span>
            </div>
            <div className="kpi">
              <span className="k">{t.kRepl}</span>
              <span className="v">{repYears.length ? repYears.map(t.yearN).join(", ") : t.noNeed}</span>
              <span className="d">{repYears.length ? t.dRepl : t.dNoRepl}</span>
            </div>
            <div className="kpi">
              <span className="k">{t.kSaving}</span>
              <span className="v">{t.money(saving, cur)}</span>
              <span className="d">
                {t.dSaving(t.money(noReplace, cur))}
                {noReplace > 0 ? ` · ${fmt((saving / noReplace) * 100)}%` : ""}
              </span>
            </div>
          </div>

          {/* Yillar bo'yicha xarajatlar */}
          <div className="card">
            <div className="head">
              <h2>{t.yearsTitle}</h2>
              <button className="btn" onClick={copyYears}>{t.copyExcel}</button>
            </div>
            <p className="sub">
              {t.yearsSub}
            </p>
            <div className="legend">
              <span><i style={{ background: "var(--buy)" }} />{t.legBuy}</span>
              <span><i style={{ background: "var(--rep)" }} />{t.legRep}</span>
              <span><i style={{ background: "var(--sell)" }} />{t.legSell}</span>
            </div>
            <YearChart rows={years} />
            <div className="tw">
              <table className="sticky1">
                <thead>
                  <tr>
                    <th className="n">{t.thYear}</th><th className="l hide-m">{t.thDecision}</th><th className="n hide-m">{t.thAge}</th><th className="n">{t.thBuy}</th>
                    <th className="n">{t.thRep}</th><th className="n">{t.thSalv}</th><th className="n">{t.thNet}</th><th className="n">{t.thCum}</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((r) => (
                    <tr key={r.year}>
                      {/* Telefonda "Qaror" ustuni yashiriladi — yangi qism yili chap chiziq bilan belgilanadi */}
                      <td className={`n ${r.isPurchase ? "buy" : ""}`} title={r.isPurchase ? t.tagNew : t.tagRep}>{r.year}</td>
                      <td className="l hide-m">{r.isPurchase ? <span className="tag buy">{t.tagNew}</span> : <span className="tag rep">{t.tagRep}</span>}</td>
                      <td className="n hide-m">{r.age}</td>
                      <td className={`n ${r.buy ? "" : "dim"}`}>{r.buy ? fmt(r.buy) : "—"}</td>
                      <td className="n">{fmt(r.repair)}</td>
                      <td className={`n ${r.salvage ? "" : "dim"}`}>{r.salvage ? `−${fmt(r.salvage)}` : "—"}</td>
                      <td className="n">{fmt(r.net)}</td>
                      <td className="n">{fmt(r.cumulative)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td className="l">{t.total}</td>
                    <td className="hide-m" />
                    <td className="hide-m" />
                    <td className="n">{fmt(sum("buy"))}</td>
                    <td className="n">{fmt(sum("repair"))}</td>
                    <td className="n">−{fmt(sum("salvage"))}</td>
                    <td className="n">{fmt(sum("net"))}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Atsiklik to'r */}
      {view === "tor" && (
        <div className="card">
          <div className="head">
            <h2>{t.netTitle}</h2>
            <span className="sub">{t.netHead}</span>
          </div>
          <p className="sub">
            {t.netSub}
          </p>
          <div className="tw" style={{ border: 0 }}>
            <DagChart N={N} C={C} optEdges={optEdges} optNodes={optNodes} />
          </div>
          <p className="sub">{t.netHint}</p>
        </div>
      )}

      {view === "hisob" && (
        <div className="grid2">
          {/* c(i,j) */}
          <div className="card">
            <h2>{t.segTitle}</h2>
            <p className="sub">c(i, j) = P<sub>i+1</sub> + R<sub>j−i</sub> − V<sub>j−i</sub>. {t.segSub}</p>
            <div className="tw">
              <table className="sticky1">
                <thead>
                  <tr>
                    <th className="n">i \ j</th>
                    {Array.from({ length: N }, (_, k) => <th key={k} className="n">{k + 1}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: N }, (_, i) => (
                    <tr key={i}>
                      <th className="n">{i}</th>
                      {Array.from({ length: N }, (_, k) => {
                        const j = k + 1;
                        if (j <= i) return <td key={j} />;
                        return <td key={j} className={`n ${optEdges.has(`${i}-${j}`) ? "opt" : ""}`}>{fmt(C[i][j])}</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bellman */}
          <div className="card">
            <h2>{t.bellTitle}</h2>
            <p className="sub">f(N) = 0, &nbsp; f(i) = min<sub>j&gt;i</sub> [ c(i, j) + f(j) ], i = N−1, …, 0. {t.bellSub}</p>
            <div className="tw">
              <table className="sticky1">
                <thead>
                  <tr><th className="n">i</th><th className="n">f(i)</th><th className="n">{t.thBest}</th><th className="l">{t.thCalc}</th></tr>
                </thead>
                <tbody>
                  <tr><td className="n">{N}</td><td className="n">0</td><td className="n">—</td><td className="l dim">{t.periodEnd}</td></tr>
                  {Array.from({ length: N }, (_, k) => N - 1 - k).map((i) => {
                    const shown = [...candidates[i]].sort((a, b) => a.value - b.value).slice(0, 3);
                    return (
                      <tr key={i} className={optNodes.has(i) ? "best" : ""}>
                        <td className="n">{i}</td>
                        <td className="n"><b>{fmt(f[i])}</b></td>
                        <td className="n">{next[i].join(", ")}</td>
                        <td className="num calc">
                          {shown.map((o) => `j=${o.j}: ${fmt(C[i][o.j])}+${fmt(f[o.j])}=${fmt(o.value)}`).join("; ")}
                          {candidates[i].length > 3 ? " …" : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Strategiyalarni solishtirish */}
      {view === "solishtirish" && (
        <div className="card">
          <h2>{t.cmpTitle}</h2>
          <p className="sub">{t.cmpSub}</p>
          <IntervalChart items={intervals} min={min} />
          <div className="tw">
            <table className="cards">
              <thead>
                <tr><th className="l">{t.thStrategy}</th><th className="l">{t.thPath}</th><th className="n">{t.thTotal}</th><th className="n">{t.thDiff}</th></tr>
              </thead>
              <tbody>
                <tr className="best">
                  <td className="l cardhead"><span className="tag opt">{t.optimalDP}</span></td>
                  <td className="l num" data-label={t.thPath}>{pathStr(best)}</td>
                  <td className="n" data-label={t.thTotal}>{fmt(min)}</td>
                  <td className="n" data-label={t.thDiff}>0</td>
                </tr>
                {intervals.map((o) => {
                  const d = o.cost - min;
                  return (
                    <tr key={o.T}>
                      <td className="l cardhead">{o.T === N ? t.noReplace : t.everyT(o.T)}</td>
                      <td className="l num" data-label={t.thPath}>{pathStr(o.path)}</td>
                      <td className="n" data-label={t.thTotal}>{fmt(o.cost)}</td>
                      <td className="n" data-label={t.thDiff}>{d < 1e-9 ? <span className="tag good">0</span> : `+${fmt(d)}`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
