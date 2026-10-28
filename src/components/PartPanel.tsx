import { useState } from "react";
import { getR, MAX_YEARS, MIN_YEARS, validate, type Part, type PartError } from "../lib/parts";
import { fmt } from "../lib/format";
import { useT } from "../i18n";

interface Props {
  parts: Part[];
  sel: number;
  error: PartError | null;
  onSelect: (i: number) => void;
  onChange: (updater: (p: Part) => Part) => void;
  onAdd: () => void;
  onDelete: () => void;
  onReset: () => void;
  notify: (msg: string) => void;
}

type ArrKey = "P" | "V" | "R" | "r" | "pf";

// Bo'shliqlar olib tashlanadi: xonalarga ajratilgan "115 200 000" ham, nusxalangan qiymat ham to'g'ri o'qiladi
const clean = (v: string) => v.replace(/s/g, "").replace(",", ".");
const isNum = (v: string) => v !== "" && Number.isFinite(Number(v));

type NumInputProps = { value: string; onValue: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

/** Fokusda xom qiymat, aks holda xonalarga ajratilgan: 115200000 → "115 200 000" */
function NumInput({ value, onValue, className = "", ...rest }: NumInputProps) {
  const [focused, setFocused] = useState(false);
  const ok = isNum(value);
  return (
    <input
      {...rest}
      className={`${className} ${ok ? "" : "err"}`.trim()}
      inputMode="decimal"
      value={focused || !ok ? value : fmt(Number(value))}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(e) => onValue(e.target.value)}
    />
  );
}

export default function PartPanel({ parts, sel, error, onSelect, onChange, onAdd, onDelete, onReset, notify }: Props) {
  const t = useT();
  const part = parts[sel];
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [confirmDel, setConfirmDel] = useState(false);

  const setCell = (key: ArrKey, i: number, value: string) =>
    onChange((p) => {
      const v = clean(value);
      if (key === "r" || key === "pf") {
        const arr = p.ext[key].slice();
        arr[i] = v;
        return { ...p, ext: { ...p.ext, [key]: arr } };
      }
      const arr = p[key].slice();
      arr[i] = v;
      return { ...p, [key]: arr };
    });

  const setExt = (key: "Cf" | "Cd" | "td", value: string) => onChange((p) => ({ ...p, ext: { ...p.ext, [key]: clean(value) } }));

  const startRename = () => {
    setConfirmDel(false);
    setNameDraft(t.partName(part));
    setRenaming(true);
  };
  const saveRename = () => {
    const v = nameDraft.trim();
    if (v && v !== t.partName(part)) onChange((p) => ({ ...p, name: v }));
    setRenaming(false);
  };

  const N = part.N;
  const cols = Array.from({ length: N }, (_, i) => i);
  const computedR = part.mode === "ext" && !validate(part) ? getR(part) : null;

  const row = (key: ArrKey, label: React.ReactNode, hint: string, arr: string[]) => (
    <tr key={key}>
      <th className="rowh">
        <b>{label}</b>
        <span>{hint}</span>
      </th>
      {cols.map((i) => (
        <td key={i}>
          <NumInput id={`in-${key}-${i}`} value={arr[i] ?? ""} aria-label={`${key} ${i + 1}`} onValue={(v) => setCell(key, i, v)} />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="card">
      <div className="controls">
        <div className="field grow">
          <label htmlFor="partSel">{t.partLabel}</label>
          <select
            id="partSel"
            value={sel}
            onChange={(e) => {
              setRenaming(false);
              setConfirmDel(false);
              onSelect(Number(e.target.value));
            }}
          >
            {parts.map((p, i) => (
              <option key={p.id} value={i}>
                {i + 1}. {t.partName(p)}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="nSel">{t.yearsLabel}</label>
          <select id="nSel" value={N} onChange={(e) => onChange((p) => ({ ...p, N: Number(e.target.value) }))}>
            {Array.from({ length: MAX_YEARS - MIN_YEARS + 1 }, (_, k) => k + MIN_YEARS).map((n) => (
              <option key={n} value={n}>
                {t.years(n)}
              </option>
            ))}
          </select>
        </div>
        <div className="btnrow">
          <button className="btn" onClick={() => { onAdd(); setConfirmDel(false); setNameDraft(""); setRenaming(true); }}>{t.addPart}</button>
          <button className="btn" onClick={startRename}>{t.rename}</button>
          {part.sample && (
            <button className="btn ghost" onClick={onReset}>{t.sampleVals}</button>
          )}
          <button
            className="btn ghost danger"
            onClick={() => {
              if (parts.length < 2) return notify(t.toastMinOne);
              setRenaming(false);
              setConfirmDel(true);
            }}
          >
            {t.del}
          </button>
        </div>
      </div>

      {renaming && (
        <div className="controls">
          <div className="field grow">
            <label htmlFor="renameInp">{t.partNameLabel}</label>
            <input
              type="text"
              id="renameInp"
              autoFocus
              placeholder={t.partName(part)}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRename();
                if (e.key === "Escape") setRenaming(false);
              }}
            />
          </div>
          <div className="btnrow">
            <button className="btn primary" onClick={saveRename}>{t.save}</button>
            <button className="btn" onClick={() => setRenaming(false)}>{t.cancel}</button>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="confirm">
          <span>{t.confirmDel(t.partName(part))}</span>
          <button className="btn danger" onClick={() => { setConfirmDel(false); onDelete(); }}>{t.yesDel}</button>
          <button className="btn" onClick={() => setConfirmDel(false)}>{t.cancel}</button>
        </div>
      )}

      <div className="head">
        <h2>{t.inputTitle}</h2>
        <div className="field fieldrow">
          <span>{t.rRow}</span>
          <div className="seg" role="group" aria-label={t.rModeAria}>
            <button aria-pressed={part.mode === "direct"} onClick={() => onChange((p) => ({ ...p, mode: "direct" }))}>{t.rDirect}</button>
            <button aria-pressed={part.mode === "ext"} onClick={() => onChange((p) => ({ ...p, mode: "ext" }))}>{t.rExt}</button>
          </div>
        </div>
      </div>

      <div className="tw">
        <table className="inp">
          <thead>
            <tr>
              <th className="l rowh">{t.indicator}</th>
              {cols.map((i) => (
                <th key={i} className="n">{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {row("P", <>P<sub>i</sub></>, t.hP, part.P)}
            {row("V", <>V<sub>k</sub></>, t.hV, part.V)}
            {part.mode === "direct" ? (
              row("R", <>R<sub>k</sub></>, t.hR, part.R)
            ) : (
              <>
                {row("r", <>r<sub>m</sub></>, t.hr, part.ext.r)}
                {row("pf", <>P<sub>f</sub>(m)</>, t.hpf, part.ext.pf)}
                <tr>
                  <th className="rowh">
                    <b>R<sub>k</sub></b>
                    <span>{t.hRcalc}</span>
                  </th>
                  {cols.map((i) => (
                    <td key={i} className="ro">{computedR ? fmt(computedR[i]) : "—"}</td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {part.mode === "ext" && (
        <div className="controls">
          <div className="field">
            <label htmlFor="cf">C<sub>f</sub> — {t.lCf}</label>
            <NumInput type="text" id="cf" className="num ext-input" value={part.ext.Cf} onValue={(v) => setExt("Cf", v)} />
          </div>
          <div className="field">
            <label htmlFor="cd">C<sub>d</sub> — {t.lCd}</label>
            <NumInput type="text" id="cd" className="num ext-input" value={part.ext.Cd} onValue={(v) => setExt("Cd", v)} />
          </div>
          <div className="field">
            <label htmlFor="td">t<sub>d</sub> — {t.ltd}</label>
            <NumInput type="text" id="td" className="num ext-input" value={part.ext.td} onValue={(v) => setExt("td", v)} />
          </div>
          <p className="sub" style={{ flex: "1 1 260px" }}>
            R(k) = Σ [ r<sub>m</sub> + P<sub>f</sub>(m) · (C<sub>f</sub> + C<sub>d</sub>·t<sub>d</sub>) ], m = 1…k. {t.extNote}
          </p>
        </div>
      )}

      {error && <p className="msg">{t[error]}</p>}
      {!part.test && <p className="note">{t.sampleNote}</p>}
    </div>
  );
}
