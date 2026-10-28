import { replacementYears } from "../lib/model";
import { computePart, type Part, type PartResult } from "../lib/parts";
import { copyTSV, fmt, money, pathStr, type Currency } from "../lib/format";
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
  const repStr = (res: PartResult) => replacementYears(res.paths[0]).map((y) => `${y}-yil`).join(", ") || "—";

  const copy = async (data: (string | number)[][]) => notify((await copyTSV(data)) ? "Nusxa olindi — Excelga joylashtiring (Ctrl+V)" : "Nusxa olib boʻlmadi");

  const copySummary = () =>
    copy([
      ["№", "Qism", "Reja davri (yil)", "Optimal yoʻl", "Almashtirish yillari", "Minimal xarajat", "Almashtirmaslik", "Tejov"],
      ...ok.map(({ p, idx, res }) => [idx + 1, p.name, res.N, res.paths.map(pathStr).join(" | "), repStr(res), res.min, res.noReplace, res.noReplace - res.min]),
      ["", "Jami", "", "", "", total, totalNone, totalNone - total],
    ]);

  const copyMatrix = () =>
    copy([
      ["Qism", ...yearCols.map((y) => `${y}-yil`), "Jami"],
      ...ok.map(({ p, res }) => [p.name, ...yearCols.map((y) => res.years[y - 1]?.net ?? ""), res.min]),
      ["Apparat boʻyicha", ...colSum, total],
    ]);

  return (
    <div className="stack">
      {view === "xulosa" && (
        <>
          <div className="kpis">
            <div className="kpi">
              <span className="k">Qismlar soni</span>
              <span className="v">{rows.length}</span>
              <span className="d">{ok.length < rows.length ? `${rows.length - ok.length} tasida maʼlumot toʻliq emas` : "hammasi hisoblandi"}</span>
            </div>
            <div className="kpi main">
              <span className="k">Jami minimal xarajat</span>
              <span className="v">{money(total, cur)}</span>
              <span className="d">barcha qismlar, oʻz reja davrlari boʻyicha</span>
            </div>
            <div className="kpi">
              <span className="k">Rejali almashtirishlar</span>
              <span className="v">{nRep} ta</span>
              <span className="d">eng uzun reja davri — {maxN} yil</span>
            </div>
            <div className="kpi">
              <span className="k">Jami tejov</span>
              <span className="v">{money(totalNone - total, cur)}</span>
              <span className="d">almashtirmaslikka nisbatan{totalNone > 0 ? ` · ${fmt(((totalNone - total) / totalNone) * 100)}%` : ""}</span>
            </div>
          </div>

          <div className="card">
            <div className="head">
              <h2>Qismlar boʻyicha optimal strategiya</h2>
              <button className="btn" onClick={copySummary}>Excel uchun nusxa olish</button>
            </div>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th className="n">№</th><th className="l">Qism</th><th className="n">Reja davri</th><th className="l">Optimal yoʻl</th>
                    <th className="l">Almashtirish yillari</th><th className="n">Minimal xarajat</th><th className="n">Almashtirmaslik</th><th className="n">Tejov</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ p, idx, c }) => (
                    <tr key={p.id}>
                      <td className="n">{idx + 1}</td>
                      <td className="l">
                        <a href="#" className="link" onClick={(e) => { e.preventDefault(); onOpen(idx); }}>{p.name}</a>
                      </td>
                      {c.error !== null ? (
                        <>
                          <td className="n">{p.N}</td>
                          <td className="l dim" colSpan={5}>maʼlumot toʻliq emas</td>
                        </>
                      ) : (
                        <>
                          <td className="n">{c.result.N}</td>
                          <td className="l num">{c.result.paths.map(pathStr).join(" | ")}</td>
                          <td className="l">{repStr(c.result)}</td>
                          <td className="n"><b>{fmt(c.result.min)}</b></td>
                          <td className="n">{fmt(c.result.noReplace)}</td>
                          <td className="n">{fmt(c.result.noReplace - c.result.min)}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td /><td className="l" colSpan={4}>Jami</td>
                    <td className="n">{fmt(total)}</td><td className="n">{fmt(totalNone)}</td><td className="n">{fmt(totalNone - total)}</td>
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
            <h2>Apparat boʻyicha yillik xarajatlar jadvali</h2>
            <button className="btn" onClick={copyMatrix}>Excel uchun nusxa olish</button>
          </div>
          <p className="sub">Har bir qismning optimal strategiyasi boʻyicha yillik sof xarajati. Chap chiziqli kataklar — shu yil boshida qism yangisiga almashtiriladi.</p>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th className="l">Qism</th>
                  {yearCols.map((y) => <th key={y} className="n">{y}-yil</th>)}
                  <th className="n">Jami</th>
                </tr>
              </thead>
              <tbody>
                {ok.map(({ p, res }) => (
                  <tr key={p.id}>
                    <td className="l">{p.name}</td>
                    {yearCols.map((y) => {
                      const r = res.years[y - 1];
                      if (!r) return <td key={y} className="n dim">—</td>;
                      return (
                        <td key={y} className={`n ${r.isPurchase && y > 1 ? "buy" : ""}`} title={r.isPurchase ? "yangi qism" : "taʼmirlab ishlatish"}>
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
                  <td className="l">Apparat boʻyicha</td>
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
          <h2>Qismlar ulushi</h2>
          <p className="sub">Reja davridagi minimal xarajat boʻyicha qismlar solishtirmasi.</p>
          <ShareChart items={ok.map(({ p, res }) => ({ name: p.name, value: res.min }))} total={total} />
        </div>
      )}
    </div>
  );
}
