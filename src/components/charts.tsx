import type { YearRow } from "../lib/model";
import { fmt, niceMax } from "../lib/format";

/* ---------- Yillik xarajatlar: xarid + ta'mir yuqoriga, qoldiq qiymat pastga ---------- */
export function YearChart({ rows }: { rows: YearRow[] }) {
  const W = 900, H = 260, L = 64, Rm = 12, T = 14, B = 30, n = rows.length;
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
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Yillik xarajatlar grafigi">
      {ticks.map((v) => (
        <g key={v}>
          <line className="grid" x1={L} x2={W - Rm} y1={y(v)} y2={y(v)} />
          <text x={L - 8} y={y(v) + 4} textAnchor="end">{fmt(v)}</text>
        </g>
      ))}
      <line x1={L} x2={W - Rm} y1={y(0)} y2={y(0)} style={{ stroke: "var(--fg-3)" }} />
      {rows.map((r, i) => {
        const x = L + i * bw + bw * 0.18, w = bw * 0.64;
        return (
          <g key={r.year}>
            {r.repair > 0 && (
              <rect x={x} y={y(r.repair)} width={w} height={y(0) - y(r.repair)} style={{ fill: "var(--rep)" }}>
                <title>{`${r.year}-yil taʼmir: ${fmt(r.repair)}`}</title>
              </rect>
            )}
            {r.buy > 0 && (
              <rect x={x} y={y(r.repair + r.buy)} width={w} height={y(r.repair) - y(r.repair + r.buy)} style={{ fill: "var(--buy)" }}>
                <title>{`${r.year}-yil xarid: ${fmt(r.buy)}`}</title>
              </rect>
            )}
            {r.salvage > 0 && (
              <rect x={x} y={y(0)} width={w} height={y(-r.salvage) - y(0)} style={{ fill: "var(--sell)" }}>
                <title>{`${r.year}-yil qoldiq qiymat: −${fmt(r.salvage)}`}</title>
              </rect>
            )}
            <text x={x + w / 2} y={H - 10} textAnchor="middle">{r.year}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------- Muntazam almashtirish oralig'i T bo'yicha jami xarajat ---------- */
export function IntervalChart({ items, min }: { items: { T: number; cost: number }[]; min: number }) {
  const W = 900, H = 230, L = 64, Rm = 12, T = 14, B = 34, n = items.length;
  const top = niceMax(Math.max(...items.map((o) => o.cost), min));
  const y = (v: number) => T + ((top - v) / top) * (H - T - B);
  const bw = (W - L - Rm) / n;
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Almashtirish oraligʻi boʻyicha xarajat">
      {[0, 1, 2, 3, 4].map((k) => {
        const v = (top * k) / 4;
        return (
          <g key={k}>
            <line className="grid" x1={L} x2={W - Rm} y1={y(v)} y2={y(v)} />
            <text x={L - 8} y={y(v) + 4} textAnchor="end">{fmt(v)}</text>
          </g>
        );
      })}
      {items.map((o, i) => {
        const x = L + i * bw + bw * 0.2, w = bw * 0.6;
        const hit = Math.abs(o.cost - min) < 1e-9;
        return (
          <g key={o.T}>
            <rect x={x} y={y(o.cost)} width={w} height={y(0) - y(o.cost)} style={{ fill: hit ? "var(--opt)" : "var(--rep)" }}>
              <title>{`T=${o.T}: ${fmt(o.cost)}`}</title>
            </rect>
            <text x={x + w / 2} y={H - 16} textAnchor="middle">T={o.T}</text>
          </g>
        );
      })}
      <line x1={L} x2={W - Rm} y1={y(min)} y2={y(min)} style={{ stroke: "var(--opt)", strokeDasharray: "5 4", strokeWidth: 1.5 }} />
      <text x={W - Rm} y={y(min) - 6} textAnchor="end" style={{ fill: "var(--opt)" }}>optimal: {fmt(min)}</text>
    </svg>
  );
}

/* ---------- Atsiklik to'r (DAG) ---------- */
export function DagChart({ N, C, optEdges, optNodes }: { N: number; C: number[][]; optEdges: Set<string>; optNodes: Set<number> }) {
  const W = Math.max(640, N * 78);
  const Hh = Math.min(300, 40 + N * 24);
  const base = Hh + 20, H = base + 34, pad = 30, dx = (W - 2 * pad) / N;
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
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} style={{ minWidth: Math.min(W, 620) }} role="img" aria-label="Atsiklik toʻr">
      {plain.map((a) => (
        <path key={`p${a.i}-${a.j}`} d={a.d} style={{ fill: "none", stroke: "var(--line)", strokeWidth: 1 }}>
          <title>{`c(${a.i}, ${a.j}) = ${fmt(C[a.i][a.j])}`}</title>
        </path>
      ))}
      {opt.map((a) => (
        <path key={`o${a.i}-${a.j}`} d={a.d} style={{ fill: "none", stroke: "var(--opt)", strokeWidth: 3 }}>
          <title>{`c(${a.i}, ${a.j}) = ${fmt(C[a.i][a.j])}`}</title>
        </path>
      ))}
      {opt.map((a) => {
        const t = fmt(C[a.i][a.j]), w = t.length * 7 + 10;
        return (
          <g key={`l${a.i}-${a.j}`}>
            <rect x={a.mx - w / 2} y={a.my - 17} width={w} height={16} rx={3} style={{ fill: "var(--surface)", stroke: "var(--opt)" }} />
            <text x={a.mx} y={a.my - 5} textAnchor="middle" style={{ fill: "var(--opt)", fontWeight: 600 }}>{t}</text>
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
      <text x={pad} y={H - 4} style={{ fill: "var(--fg-3)" }}>Yoyning ustiga kursor olib borilsa c(i, j) koʻrinadi; ajratilgan yoylar — optimal yoʻl.</text>
    </svg>
  );
}

/* ---------- Qismlar ulushi (gorizontal ustunlar) ---------- */
export function ShareChart({ items, total }: { items: { name: string; value: number }[]; total: number }) {
  const sorted = [...items].sort((a, b) => b.value - a.value);
  const W = 900, rowH = 26, L = 280, Rm = 110, H = sorted.length * rowH + 10;
  const mx = Math.max(...sorted.map((i) => i.value), 1);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Qismlar ulushi">
      {sorted.map((it, i) => {
        const y = 5 + i * rowH, w = ((W - L - Rm) * it.value) / mx;
        const nm = it.name.length > 40 ? it.name.slice(0, 39) + "…" : it.name;
        return (
          <g key={it.name + i}>
            <text x={L - 10} y={y + 16} textAnchor="end" style={{ fontFamily: "var(--f-body)", fontSize: 12, fill: "var(--fg)" }}>{nm}</text>
            <rect x={L} y={y + 4} width={Math.max(w, 1)} height={rowH - 10} rx={2} style={{ fill: "var(--accent)" }} />
            <text x={L + w + 8} y={y + 16}>{`${fmt(it.value)} · ${fmt((it.value / (total || 1)) * 100)}%`}</text>
          </g>
        );
      })}
    </svg>
  );
}
