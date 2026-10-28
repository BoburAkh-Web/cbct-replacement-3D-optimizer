import { replacementYears } from "../lib/model";
import { computePart, type Part, type PartResult } from "../lib/parts";
import { copyTSV, fmt, pathStr, type Currency } from "../lib/format";
import { useT } from "../i18n";
import { ShareChart } from "./charts";

export type SummaryView = "xulosa" | "yillik" | "ulush";

interface Props {
  view: SummaryView;
  parts: Part[];
  cur: Currency;
  onOpen: (index: number) => void;
  notify: (msg: string) => void;
}

export default function Summary({ view, parts, cur, onOpen, notify }: Props) {
  const t = useT();
  // Tekshiruv (darslik) misoli apparat xulosasiga kirmaydi
  const rows = parts
    .map((p, idx) => ({ p, idx, c: computePart(p) }))
    .filter((r) => !r.p.test);
  const ok = rows.flatMap((r) => (r.c.error === null ? [{ p: r.p, idx: r.idx, res: r.c.result as PartResult }] : []));

  const total = ok.reduce((a, r) => a + r.res.min, 0);
  const totalNone = ok.reduce((a, r) => a + r.res.noReplace, 0);
  const maxN = Math.max(...ok.map((r) => r.res.N), 1);
  const nRep = ok.reduce((a, r) => a + replacementYears(r.res.paths[0]).length, 0);
  const yearCols = Array.from({ length: maxN }, (_, i) => i + 1);
  const colSum = yearCols.map((y) => ok.reduce((a, r) => a + (r.res.years[y - 1]?.net ?? 0), 0));
  const repStr = (res: PartResult) => replacementYears(res.paths[0]).map(t.yearN).join(", ") || "—";

  const copy = async (data: (string | number)[][]) => notify((await copyTSV(data)) ? t.toastCopied : t.toastCopyFail);

  const copySummary = () =>
    copy([
      ["№", t.thPart, t.thPeriodYears, t.thOptPath, t.thReplYears, t.kMin, t.noReplace, t.kSaving],
      ...ok.map(({ p, idx, res }) => [idx + 1, t.partName(p), res.N, res.paths.map(pathStr).join(" | "), repStr(res), res.min, res.noReplace, res.noReplace - res.min]),
      ["", t.total, "", "", "", total, totalNone, totalNone - total],
    ]);

  const copyMatrix = () =>
    copy([
      [t.thPart, ...yearCols.map(t.yearN), t.total],
      ...ok.map(({ p, res }) => [t.partName(p), ...yearCols.map((y) => res.years[y - 1]?.net ?? ""), res.min]),
      [t.byDevice, ...colSum, total],
    ]);

  return (
    <div className="stack">
      {view === "xulosa" && (
        <>
          <div className="kpis">
            <div className="kpi">
              <span className="k">{t.kCount}</span>
              <span className="v">{rows.length}</span>
              <span className="d">{ok.length < rows.length ? t.dIncomplete(rows.length - ok.length) : t.dAllOk}</span>
            </div>
            <div className="kpi main">
              <span className="k">{t.kTotal}</span>
              <span className="v">{t.money(total, cur)}</span>
              <span className="d">{t.dTotal}</span>
            </div>
            <div className="kpi">
              <span className="k">{t.kRepls}</span>
              <span className="v">{t.vCount(nRep)}</span>
              <span className="d">{t.dMaxN(maxN)}</span>
            </div>
            <div className="kpi">
              <span className="k">{t.kTotalSave}</span>
              <span className="v">{t.money(totalNone - total, cur)}</span>
              <span className="d">{t.dTotalSave}{totalNone > 0 ? ` · ${fmt(((totalNone - total) / totalNone) * 100)}%` : ""}</span>
            </div>
          </div>

          <div className="card">
            <div className="head">
              <h2>{t.stratTitle}</h2>
              <button className="btn" onClick={copySummary}>{t.copyExcel}</button>
            </div>
            <div className="tw">
              <table className="cards">
                <thead>
                  <tr>
                    <th className="n">№</th><th className="l">{t.thPart}</th><th className="n">{t.thPeriod}</th><th className="l">{t.thOptPath}</th>
                    <th className="l">{t.thReplYears}</th><th className="n">{t.kMin}</th><th className="n">{t.noReplace}</th><th className="n">{t.kSaving}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ p, idx, c }) => (
                    <tr key={p.id}>
                      <td className="n idx">{idx + 1}</td>
                      <td className="l cardhead">
                        <a href="#" className="link" onClick={(e) => { e.preventDefault(); onOpen(idx); }}>{t.partName(p)}</a>
                      </td>
                      {c.error !== null ? (
                        <>
                          <td className="n" data-label={t.thPeriod}>{p.N}</td>
                          <td className="l dim" colSpan={5}>{t.incomplete}</td>
                        </>
                      ) : (
                        <>
                          <td className="n" data-label={t.thPeriod}>{c.result.N}</td>
                          <td className="l num" data-label={t.thOptPath}>{c.result.paths.map(pathStr).join(" | ")}</td>
                          <td className="l" data-label={t.thReplYears}>{repStr(c.result)}</td>
                          <td className="n" data-label={t.kMin}><b>{fmt(c.result.min)}</b></td>
                          <td className="n" data-label={t.noReplace}>{fmt(c.result.noReplace)}</td>
                          <td className="n" data-label={t.kSaving}>{fmt(c.result.noReplace - c.result.min)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td /><td className="l cardhead" colSpan={4}>{t.total}</td>
                    <td className="n" data-label={t.kMin}>{fmt(total)}</td>
                    <td className="n" data-label={t.noReplace}>{fmt(totalNone)}</td>
                    <td className="n" data-label={t.kSaving}>{fmt(totalNone - total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}

      {view === "yillik" && (
        <div className="card">
          <div className="head">
            <h2>{t.matrixTitle}</h2>
            <button className="btn" onClick={copyMatrix}>{t.copyExcel}</button>
          </div>
          <p className="sub">{t.matrixSub}</p>
          <div className="tw">
            <table className="sticky1">
              <thead>
                <tr>
                  <th className="l">{t.thPart}</th>
                  {yearCols.map((y) => <th key={y} className="n">{t.yearN(y)}</th>)}
                  <th className="n">{t.total}</th>
                </tr>
              </thead>
              <tbody>
                {ok.map(({ p, res }) => (
                  <tr key={p.id}>
                    <td className="l" title={t.partName(p)}><span className="clip">{t.partName(p)}</span></td>
                    {yearCols.map((y) => {
                      const r = res.years[y - 1];
                      if (!r) return <td key={y} className="n dim">—</td>;
                      return (
                        <td key={y} className={`n ${r.isPurchase && y > 1 ? "buy" : ""}`} title={r.isPurchase ? t.tagNew : t.tagRep}>
                          {fmt(r.net)}
                        </td>
                      );
                    })}
                    <td className="n"><b>{fmt(res.min)}</b></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="l">{t.byDevice}</td>
                  {colSum.map((v, i) => <td key={i} className="n">{fmt(v)}</td>)}
                  <td className="n">{fmt(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {view === "ulush" && (
        <div className="card">
          <h2>{t.shareTitle}</h2>
          <p className="sub">{t.shareSub}</p>
          <ShareChart items={ok.map(({ p, res }) => ({ name: t.partName(p), value: res.min }))} total={total} />
        </div>
      )}
    </div>
  );
}
