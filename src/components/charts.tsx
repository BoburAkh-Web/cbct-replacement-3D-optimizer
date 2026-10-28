import type { YearRow } from "../lib/model";
import { fmt, fmtShort, niceMax } from "../lib/format";
import { useT } from "../i18n";
import { useElementWidth } from "../hooks/useElementWidth";

/* Barcha grafiklar konteyner kengligida (px) chiziladi: viewBox = haqiqiy o'lcham, yozuvlar kichraymaydi */

/* ---------- Yillik xarajatlar: xarid + ta'mir yuqoriga, qoldiq qiymat pastga ---------- */
export function YearChart({ rows }: { rows: YearRow[] }) {
  const t = useT();
  const [ref, W] = useElementWidth<HTMLDivElement>();
  const narrow = W < 520;
  const H = narrow ? 220 : 260, L = narrow ? 54 : 64, Rm = 8, T = 14, B = 30, n = rows.length;
  const up = Math.max(...rows.map((r) => r.buy + r.repair), 1);
  const dn = Math.max(...rows.map((r) => r.salvage), 0);
  const top = niceMax(up);
  const bot = dn > 0 ? niceMax(dn) : 0;
  const span = top + bot;
  const y = (v: number) => T + ((top - v) / span) * (H - T - B);
  const bw = (W - L - Rm) / n;
  const ticks = [0, 1, 2, 3, 4].map((k) => (top * k) / 4);
  if (bot) ticks.push(-bot);

  return (
    <div ref={ref}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.aYearChart}>
        {ticks.map((v) => (
          <g key={v}>
            <line className="grid" x1={L} x2={W - Rm} y1={y(v)} y2={y(v)} />
            <text x={L - 8} y={y(v) + 4} textAnchor="end">{fmtShort(v, t.units)}</text>
          </g>
        ))}
        <line x1={L} x2={W - Rm} y1={y(0)} y2={y(0)} style={{ stroke: "var(--fg-3)" }} />
        {rows.map((r, i) => {
          const x = L + i * bw + bw * 0.18, w = bw * 0.64;
          const delay = { animationDelay: `${i * 30}ms` };
          return (
            <g key={r.year}>
              {r.repair > 0 && (
                <rect className="bar" x={x} y={y(r.repair)} width={w} height={y(0) - y(r.repair)} style={{ fill: "var(--rep)", ...delay }}>
                  <title>{t.tipRep(r.year, fmt(r.repair))}</title>
                </rect>
              )}
              {r.buy > 0 && (
                <rect className="bar" x={x} y={y(r.repair + r.buy)} width={w} height={y(r.repair) - y(r.repair + r.buy)} style={{ fill: "var(--buy)", ...delay }}>
                  <title>{t.tipBuy(r.year, fmt(r.buy))}</title>
                </rect>
              )}
              {r.salvage > 0 && (
                <rect className="bar dn" x={x} y={y(0)} width={w} height={y(-r.salvage) - y(0)} style={{ fill: "var(--sell)", ...delay }}>
                  <title>{t.tipSalv(r.year, fmt(r.salvage))}</title>
                </rect>
              )}
              <text x={x + w / 2} y={H - 10} textAnchor="middle">{r.year}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Muntazam almashtirish oralig'i T bo'yicha jami xarajat ---------- */
export function IntervalChart({ items, min }: { items: { T: number; cost: number }[]; min: number }) {
  const t = useT();
  const [ref, W] = useElementWidth<HTMLDivElement>();
  const narrow = W < 520;
  const H = narrow ? 210 : 230, L = narrow ? 54 : 64, Rm = 8, T = 14, B = 34, n = items.length;
  const top = niceMax(Math.max(...items.map((o) => o.cost), min));
  const y = (v: number) => T + ((top - v) / top) * (H - T - B);
  const bw = (W - L - Rm) / n;
  // Tor ekranda "T=10" sig'maydi — faqat raqam, "T" esa o'q boshida bir marta
  const shortLbl = bw < 38;
  return (
    <div ref={ref}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.aIntervalChart}>
        {[0, 1, 2, 3, 4].map((k) => {
          const v = (top * k) / 4;
          return (
            <g key={k}>
              <line className="grid" x1={L} x2={W - Rm} y1={y(v)} y2={y(v)} />
              <text x={L - 8} y={y(v) + 4} textAnchor="end">{fmtShort(v, t.units)}</text>
            </g>
          );
        })}
        {shortLbl && <text x={L - 8} y={H - 16} textAnchor="end">T</text>}
        {items.map((o, i) => {
          const x = L + i * bw + bw * 0.2, w = bw * 0.6;
          const hit = Math.abs(o.cost - min) < 1e-9;
          return (
            <g key={o.T}>
              <rect className="bar" x={x} y={y(o.cost)} width={w} height={y(0) - y(o.cost)} style={{ fill: hit ? "var(--opt)" : "var(--rep)", animationDelay: `${i * 30}ms` }}>
                <title>{`T=${o.T}: ${fmt(o.cost)}`}</title>
              </rect>
              <text x={x + w / 2} y={H - 16} textAnchor="middle">{shortLbl ? o.T : `T=${o.T}`}</text>
            </g>
          );
        })}
        <line x1={L} x2={W - Rm} y1={y(min)} y2={y(min)} style={{ stroke: "var(--opt)", strokeDasharray: "5 4", strokeWidth: 1.5 }} />
        {/* Fon rangidagi kontur: yozuv ustunlar ustiga tushsa ham o'qiladi */}
        <text x={W - Rm} y={y(min) - 6} textAnchor="end" style={{ fill: "var(--opt)", fontWeight: 600, paintOrder: "stroke", stroke: "var(--surface)", strokeWidth: 4, strokeLinejoin: "round" }}>
          {t.optLabel}: {narrow ? fmtShort(min, t.units) : fmt(min)}
        </text>
      </svg>
    </div>
  );
}

/* ---------- Atsiklik to'r (DAG) ---------- */
export function DagChart({ N, C, optEdges, optNodes }: { N: number; C: number[][]; optEdges: Set<string>; optNodes: Set<number> }) {
  const t = useT();
  const [ref, box] = useElementWidth<HTMLDivElement>();
  // Tugunlar orasi kamida 52px: tor ekranda to'r konteyner ichida gorizontal suriladi, lekin kichraymaydi
  const W = Math.max(box, N * 52 + 60);
  const Hh = Math.min(box < 520 ? 220 : 300, 40 + N * 24);
  const base = Hh + 20, H = base + 22, pad = 30, dx = (W - 2 * pad) / N;
  const X = (i: number) => pad + i * dx;

  type Arc = { d: string; i: number; j: number; mx: number; my: number };
  const plain: Arc[] = [], opt: Arc[] = [];
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j <= N; j++) {
      const x1 = X(i), x2 = X(j), h = ((j - i) / N) * Hh;
      const d = j === i + 1 ? `M${x1},${base} L${x2},${base}` : `M${x1},${base} C${x1},${base - h * 1.33} ${x2},${base - h * 1.33} ${x2},${base}`;
      const arc = { d, i, j, mx: (x1 + x2) / 2, my: j === i + 1 ? base - 6 : base - h };
      (optEdges.has(`${i}-${j}`) ? opt : plain).push(arc);
    }

  return (
    <div ref={ref}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} style={{ width: W, maxWidth: "none" }} role="img" aria-label={t.aNet}>
        {plain.map((a) => (
          <path key={`p${a.i}-${a.j}`} d={a.d} style={{ fill: "none", stroke: "var(--line)", strokeWidth: 1 }}>
            <title>{`c(${a.i}, ${a.j}) = ${fmt(C[a.i][a.j])}`}</title>
          </path>
        ))}
        {opt.map((a) => (
          <path key={`o${a.i}-${a.j}`} className="draw" pathLength={1} d={a.d} style={{ fill: "none", stroke: "var(--opt)", strokeWidth: 3 }}>
            <title>{`c(${a.i}, ${a.j}) = ${fmt(C[a.i][a.j])}`}</title>
          </path>
        ))}
        {opt.map((a) => {
          const lbl = fmtShort(C[a.i][a.j], t.units), w = lbl.length * 7 + 10;
          return (
            <g key={`l${a.i}-${a.j}`} className="fade-late">
              <rect x={a.mx - w / 2} y={a.my - 17} width={w} height={16} rx={3} style={{ fill: "var(--surface)", stroke: "var(--opt)" }} />
              <text x={a.mx} y={a.my - 5} textAnchor="middle" style={{ fill: "var(--opt)", fontWeight: 600 }}>{lbl}</text>
            </g>
          );
        })}
        {Array.from({ length: N + 1 }, (_, i) => {
          const o = optNodes.has(i);
          return (
            <g key={`n${i}`}>
              <circle cx={X(i)} cy={base} r={13} style={{ fill: o ? "var(--opt)" : "var(--surface)", stroke: o ? "var(--opt)" : "var(--fg-3)", strokeWidth: 1.5 }} />
              <text x={X(i)} y={base + 4} textAnchor="middle" style={{ fill: o ? "var(--surface)" : "var(--fg)", fontWeight: 600 }}>{i}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ---------- Qismlar ulushi (gorizontal ustunlar) ---------- */
export function ShareChart({ items, total }: { items: { name: string; value: number }[]; total: number }) {
  const t = useT();
  const [ref, W] = useElementWidth<HTMLDivElement>();
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const mx = Math.max(...sorted.map((i) => i.value), 1);
  const label = (v: number) => `${fmtShort(v, t.units)} · ${fmt((v / (total || 1)) * 100)}%`;
  const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const nameStyle = { fontFamily: "var(--f-body)", fontSize: 12.5, fill: "var(--fg)" };

  // Tor ekran: nom va qiymat bir qatorda, ustun ostida to'liq kenglikda
  if (W < 560) {
    const rowH = 40, H = sorted.length * rowH;
    const maxChars = Math.max(10, Math.floor((W - 130) / 6.6));
    return (
      <div ref={ref}>
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.aShare}>
          {sorted.map((it, i) => {
            const y = i * rowH;
            return (
              <g key={it.name + i}>
                <text x={0} y={y + 15} style={nameStyle}>{cut(it.name, maxChars)}</text>
                <text x={W} y={y + 15} textAnchor="end">{label(it.value)}</text>
                <rect x={0} y={y + 22} width={W} height={8} rx={4} style={{ fill: "var(--surface-2)" }} />
                <rect className="bar-x" x={0} y={y + 22} width={Math.max((W * it.value) / mx, 2)} height={8} rx={4} style={{ fill: "var(--accent)", animationDelay: `${i * 30}ms` }}>
                  <title>{fmt(it.value)}</title>
                </rect>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  const rowH = 26, L = Math.min(280, W * 0.32), Rm = 130, H = sorted.length * rowH + 10;
  return (
    <div ref={ref}>
      <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.aShare}>
        {sorted.map((it, i) => {
          const y = 5 + i * rowH, w = ((W - L - Rm) * it.value) / mx;
          return (
            <g key={it.name + i}>
              <text x={L - 10} y={y + 16} textAnchor="end" style={nameStyle}>{cut(it.name, Math.floor((L - 14) / 6.6))}</text>
              <rect className="bar-x" x={L} y={y + 4} width={Math.max(w, 1)} height={rowH - 10} rx={2} style={{ fill: "var(--accent)", animationDelay: `${i * 30}ms` }}>
                <title>{fmt(it.value)}</title>
              </rect>
              <text x={L + w + 8} y={y + 16}>{label(it.value)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
