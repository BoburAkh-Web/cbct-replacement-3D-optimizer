import { useState } from "react";
import { getR, MAX_YEARS, MIN_YEARS, validate, type Part } from "../lib/parts";
import { fmt } from "../lib/format";

interface Props {
  parts: Part[];
  sel: number;
  error: string | null;
  onSelect: (i: number) => void;
  onChange: (updater: (p: Part) => Part) => void;
  onAdd: () => void;
  onDelete: () => void;
  onReset: () => void;
  notify: (msg: string) => void;
}

type ArrKey = "P" | "V" | "R" | "r" | "pf";

const clean = (v: string) => v.replace(",", ".").trim();
const isNum = (v: string) => v !== "" && Number.isFinite(Number(v));

export default function PartPanel({ parts, sel, error, onSelect, onChange, onAdd, onDelete, onReset, notify }: Props) {
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
    setNameDraft(part.name);
    setRenaming(true);
  };
  const saveRename = () => {
    const v = nameDraft.trim();
    if (v) onChange((p) => ({ ...p, name: v }));
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
          <input
            id={`in-${key}-${i}`}
            className={isNum(arr[i] ?? "") ? "" : "err"}
            value={arr[i] ?? ""}
            inputMode="decimal"
            aria-label={`${key} ${i + 1}`}
            onChange={(e) => setCell(key, i, e.target.value)}
          />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="card">
      <div className="controls">
        <div className="field grow">
          <label htmlFor="partSel">Apparat qismi</label>
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
                {i + 1}. {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="nSel">Yillar soni (reja davri)</label>
          <select id="nSel" value={N} onChange={(e) => onChange((p) => ({ ...p, N: Number(e.target.value) }))}>
            {Array.from({ length: MAX_YEARS - MIN_YEARS + 1 }, (_, k) => k + MIN_YEARS).map((n) => (
              <option key={n} value={n}>
                {n} yil
              </option>
            ))}
          </select>
        </div>
        <div className="btnrow">
          <button className="btn" onClick={() => { onAdd(); setConfirmDel(false); setNameDraft(""); setRenaming(true); }}>+ Yangi qism</button>
          <button className="btn" onClick={startRename}>Nomini oʻzgartirish</button>
          {part.sample && (
            <button className="btn ghost" onClick={onReset}>Namunaviy qiymatlar</button>
          )}
          <button
            className="btn ghost danger"
            onClick={() => {
              if (parts.length < 2) return notify("Kamida bitta qism qolishi kerak");
              setRenaming(false);
              setConfirmDel(true);
            }}
          >
            Oʻchirish
          </button>
        </div>
      </div>

      {renaming && (
        <div className="controls">
          <div className="field grow">
            <label htmlFor="renameInp">Qism nomi</label>
            <input
              type="text"
              id="renameInp"
              autoFocus
              placeholder={part.name}
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveRename();
                if (e.key === "Escape") setRenaming(false);
              }}
            />
          </div>
          <div className="btnrow">
            <button className="btn primary" onClick={saveRename}>Saqlash</button>
            <button className="btn" onClick={() => setRenaming(false)}>Bekor qilish</button>
          </div>
        </div>
      )}

      {confirmDel && (
        <div className="confirm">
          <span>“{part.name}” oʻchirilsinmi?</span>
          <button className="btn danger" onClick={() => { setConfirmDel(false); onDelete(); }}>Ha, oʻchirish</button>
          <button className="btn" onClick={() => setConfirmDel(false)}>Bekor qilish</button>
        </div>
      )}

      <div className="head">
        <h2>Boshlangʻich maʼlumotlar</h2>
        <div className="field fieldrow">
          <span>R qatorini</span>
          <div className="seg" role="group" aria-label="R rejimi">
            <button aria-pressed={part.mode === "direct"} onClick={() => onChange((p) => ({ ...p, mode: "direct" }))}>toʻgʻridan-toʻgʻri kiritish</button>
            <button aria-pressed={part.mode === "ext"} onClick={() => onChange((p) => ({ ...p, mode: "ext" }))}>nosozlik xavfi bilan hisoblash</button>
          </div>
        </div>
      </div>

      <div className="tw">
        <table className="inp">
          <thead>
            <tr>
              <th className="l rowh">Koʻrsatkich</th>
              {cols.map((i) => (
                <th key={i} className="n">{i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {row("P", <>P<sub>i</sub></>, "i-yil boshida yangi qism narxi", part.P)}
            {row("V", <>V<sub>k</sub></>, "k yil ishlatilgandagi qoldiq qiymat", part.V)}
            {part.mode === "direct" ? (
              row("R", <>R<sub>k</sub></>, "k yil ishlatishdagi jami taʼmir xarajati", part.R)
            ) : (
              <>
                {row("r", <>r<sub>m</sub></>, "m-yildagi rejali xizmat xarajati", part.ext.r)}
                {row("pf", <>P<sub>f</sub>(m)</>, "m-yilda nosozlik ehtimoli (0–1)", part.ext.pf)}
                <tr>
                  <th className="rowh">
                    <b>R<sub>k</sub></b>
                    <span>hisoblangan jami xarajat</span>
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
            <label htmlFor="cf">C<sub>f</sub> — bitta nosozlikni bartaraf etish</label>
            <input type="text" id="cf" className="num ext-input" value={part.ext.Cf} onChange={(e) => setExt("Cf", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cd">C<sub>d</sub> — bekor turgan 1 kun yoʻqotishi</label>
            <input type="text" id="cd" className="num ext-input" value={part.ext.Cd} onChange={(e) => setExt("Cd", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="td">t<sub>d</sub> — nosozlikda bekor turish (kun)</label>
            <input type="text" id="td" className="num ext-input" value={part.ext.td} onChange={(e) => setExt("td", e.target.value)} />
          </div>
          <p className="sub" style={{ flex: "1 1 260px" }}>
            R(k) = Σ [ r<sub>m</sub> + P<sub>f</sub>(m) · (C<sub>f</sub> + C<sub>d</sub>·t<sub>d</sub>) ], m = 1…k. Taʼmir xarajatiga kutilayotgan nosozlik va bekor turish yoʻqotishi qoʻshiladi.
          </p>
        </div>
      )}

      {error && <p className="msg">{error}</p>}
      {!part.test && <p className="note">Qiymatlar namunaviy: klinika maʼlumotlari olinganda ularni katakchalarga yozing, natijalar darhol qayta hisoblanadi.</p>}
    </div>
  );
}
