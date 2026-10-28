import { replacementYears } from "../lib/model";
import type { PartResult } from "../lib/parts";
import { copyTSV, fmt, money, pathStr, type Currency } from "../lib/format";
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
      ["Yil", "Qaror", "Qism yoshi", "Xarid", "Taʼmirlash", "Qoldiq qiymat", "Yillik xarajat", "Yigʻma"],
      ...years.map((r) => [r.year, r.isPurchase ? "yangi qism" : "taʼmirlab ishlatish", r.age, r.buy, r.repair, -r.salvage, r.net, r.cumulative]),
      ["Jami", "", "", sum("buy"), sum("repair"), -sum("salvage"), sum("net"), ""],
    ]);
    notify(ok ? "Nusxa olindi — Excelga joylashtiring (Ctrl+V)" : "Nusxa olib boʻlmadi");
  };

  return (
    <div className={`stack ${dimmed ? "dimmed" : ""}`}>
      {view === "natija" && (
        <>
          {/* Asosiy ko'rsatkichlar */}
          <div className="kpis">
            <div className="kpi main">
              <span className="k">Minimal xarajat</span>
              <span className="v">{money(min, cur)}</span>
              <span className="d">{N} yillik reja davri uchun</span>
            </div>
            <div className="kpi">
              <span className="k">Optimal yoʻl{paths.length > 1 ? "lar" : ""}</span>
              <span className="v path">
                {paths.map((p) => (
                  <span key={p.join("-")} style={{ display: "block" }}>{pathStr(p)}</span>
                ))}
              </span>
              <span className="d">{paths.length > 1 ? `${paths.length} ta teng optimal strategiya` : "yagona optimal strategiya"}</span>
            </div>
            <div className="kpi">
              <span className="k">Almashtirish</span>
              <span className="v">{repYears.length ? repYears.map((y) => `${y}-yil`).join(", ") : "kerak emas"}</span>
              <span className="d">{repYears.length ? "shu yillar boshida yangi qism olinadi" : "qism butun davr ishlatiladi"}</span>
            </div>
            <div className="kpi">
              <span className="k">Tejov</span>
              <span className="v">{money(saving, cur)}</span>
              <span className="d">
                almashtirmasdan ishlatishga ({money(noReplace, cur)}) nisbatan
                {noReplace > 0 ? ` · ${fmt((saving / noReplace) * 100)}%` : ""}
              </span>
            </div>
          </div>

          {/* Yillar bo'yicha xarajatlar */}
          <div className="card">
            <div className="head">
              <h2>Yillar boʻyicha xarajatlar</h2>
              <button className="btn" onClick={copyYears}>Excel uchun nusxa olish</button>
            </div>
            <p className="sub">
              Optimal strategiya boʻyicha har bir yilda qancha sarflanishi. Yangi qism yil boshida olinadi, eski qism shu paytda qoldiq qiymatida sotiladi (hisobdan chiqariladi).
            </p>
            <div className="legend">
              <span><i style={{ background: "var(--buy)" }} />Xarid</span>
              <span><i style={{ background: "var(--rep)" }} />Taʼmirlash</span>
              <span><i style={{ background: "var(--sell)" }} />Qoldiq qiymat (kamaytiradi)</span>
            </div>
            <YearChart rows={years} />
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th className="n">Yil</th><th className="l">Qaror</th><th className="n">Qism yoshi</th><th className="n">Xarid</th>
                    <th className="n">Taʼmirlash</th><th className="n">Qoldiq qiymat</th><th className="n">Yillik xarajat</th><th className="n">Yigʻma</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((r) => (
                    <tr key={r.year}>
                      <td className="n">{r.year}</td>
                      <td className="l">{r.isPurchase ? <span className="tag buy">yangi qism</span> : <span className="tag rep">taʼmirlab ishlatish</span>}</td>
                      <td className="n">{r.age}</td>
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
                    <td className="l" colSpan={3}>Jami</td>
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
            <h2>Atsiklik toʻr</h2>
            <span className="sub">Tugun: yil chegarasi · yoy: bitta qism ishlatiladigan davr</span>
          </div>
          <p className="sub">
            Har bir yoy c(i, j) xarajatiga ega: i-yil oxirida yangi qism olinib, j-yilgacha ishlatiladi. 0 dan N gacha eng arzon yoʻl optimal strategiyani beradi.
          </p>
          <div className="tw" style={{ border: 0 }}>
            <DagChart N={N} C={C} optEdges={optEdges} optNodes={optNodes} />
          </div>
        </div>
      )}

      {view === "hisob" && (
        <div className="grid2">
          {/* c(i,j) */}
          <div className="card">
            <h2>Segment xarajatlari c(i, j)</h2>
            <p className="sub">c(i, j) = P<sub>i+1</sub> + R<sub>j−i</sub> − V<sub>j−i</sub>. Optimal yoʻlga kirgan kataklar ajratilgan.</p>
            <div className="tw">
              <table>
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
            <h2>Bellman rekurrent hisobi</h2>
            <p className="sub">f(N) = 0, &nbsp; f(i) = min<sub>j&gt;i</sub> [ c(i, j) + f(j) ], i = N−1, …, 0. Minimal xarajat — f(0).</p>
            <div className="tw">
              <table>
                <thead>
                  <tr><th className="n">i</th><th className="n">f(i)</th><th className="n">Eng yaxshi j</th><th className="l">Hisob: c(i,j) + f(j)</th></tr>
                </thead>
                <tbody>
                  <tr><td className="n">{N}</td><td className="n">0</td><td className="n">—</td><td className="l dim">reja davri oxiri</td></tr>
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
          <h2>Strategiyalarni solishtirish</h2>
          <p className="sub">Qismni har T yilda muntazam almashtirish (rejali almashtirish) va almashtirmasdan ishlatish xarajatlari optimal strategiya bilan taqqoslanadi.</p>
          <IntervalChart items={intervals} min={min} />
          <div className="tw">
            <table>
              <thead>
                <tr><th className="l">Strategiya</th><th className="l">Yoʻl</th><th className="n">Jami xarajat</th><th className="n">Optimaldan farq</th></tr>
              </thead>
              <tbody>
                <tr className="best">
                  <td className="l"><span className="tag opt">Optimal (dinamik dasturlash)</span></td>
                  <td className="l num">{pathStr(best)}</td>
                  <td className="n">{fmt(min)}</td>
                  <td className="n">0</td>
                </tr>
                {intervals.map((o) => {
                  const d = o.cost - min;
                  return (
                    <tr key={o.T}>
                      <td className="l">{o.T === N ? "Almashtirmaslik" : `Har ${o.T} yilda almashtirish`}</td>
                      <td className="l num">{pathStr(o.path)}</td>
                      <td className="n">{fmt(o.cost)}</td>
                      <td className="n">{d < 1e-9 ? <span className="tag good">0</span> : `+${fmt(d)}`}</td>
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
