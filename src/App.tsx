import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SAMPLE_PARTS, TEST_PART } from "./data/samples";
import { computePart, getR, isPartArray, makePart, type Part } from "./lib/parts";
import type { Currency } from "./lib/format";
import { usePersistentState } from "./hooks/usePersistentState";
import { navigate, useHashRoute } from "./hooks/useHashRoute";
import PartPanel from "./components/PartPanel";
import PartResults, { type PartView } from "./components/PartResults";
import Summary, { type SummaryView } from "./components/Summary";
import ModelInfo from "./components/ModelInfo";
import { IconArrow, IconAuto, IconBook, IconCalc, IconChart, IconMoon, IconSun, Logo } from "./components/icons";

type Theme = "auto" | "light" | "dark";
interface Settings {
  sel: number;
  cur: Currency;
  theme?: Theme;
}

interface Page {
  path: string;
  label: string;
}
interface Section {
  label: string;
  base: string;
  icon: React.ReactNode;
  pages: Page[];
}

const THEMES: { id: Theme; label: string; icon: React.ReactNode }[] = [
  { id: "auto", label: "Tizim mavzusi", icon: <IconAuto /> },
  { id: "light", label: "Yorugʻ mavzu", icon: <IconSun /> },
  { id: "dark", label: "Qorongʻi mavzu", icon: <IconMoon /> },
];

// Navbar: bo'limlar (yuqori qator) va har bo'lim ichidagi sahifalar (pastki qator)
const SECTIONS: Section[] = [
  {
    label: "Qism boʻyicha hisob",
    base: "/qism",
    icon: <IconCalc />,
    pages: [
      { path: "/qism/kiritish", label: "Maʼlumotlar" },
      { path: "/qism/natija", label: "Natija" },
      { path: "/qism/tor", label: "Atsiklik toʻr" },
      { path: "/qism/hisob", label: "Bellman hisobi" },
      { path: "/qism/solishtirish", label: "Strategiyalar" },
    ],
  },
  {
    label: "Apparat boʻyicha xulosa",
    base: "/apparat",
    icon: <IconChart />,
    pages: [
      { path: "/apparat/xulosa", label: "Umumiy xulosa" },
      { path: "/apparat/yillik", label: "Yillik xarajatlar" },
      { path: "/apparat/ulush", label: "Qismlar ulushi" },
    ],
  },
  { label: "Matematik model", base: "/model", icon: <IconBook />, pages: [{ path: "/model", label: "Model" }] },
];
const PATHS = SECTIONS.flatMap((s) => s.pages.map((p) => p.path));
const HOME = PATHS[0];

const defaultParts = () => SAMPLE_PARTS.map((s) => makePart(s));
const isSettings = (x: unknown): x is Settings =>
  !!x &&
  typeof (x as Settings).sel === "number" &&
  ((x as Settings).cur === "$" || (x as Settings).cur === "soʻm") &&
  ((x as Settings).theme === undefined || THEMES.some((t) => t.id === (x as Settings).theme));

export default function App() {
  const [parts, setParts] = usePersistentState<Part[]>("cbct-opt:parts:v1", defaultParts, isPartArray);
  const [settings, setSettings] = usePersistentState<Settings>("cbct-opt:settings:v1", () => ({ sel: 0, cur: "$" }), isSettings);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const toastTimer = useRef<number>();

  const route = useHashRoute();
  const path = PATHS.includes(route) ? route : HOME;
  const section = SECTIONS.find((s) => path.startsWith(s.base))!;

  // Noma'lum manzil — bosh sahifaga; sahifa almashganda yuqoriga
  useEffect(() => {
    if (route !== path) navigate(path, true);
  }, [route, path]);
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [path]);

  // Mavzu: "auto" — tizim sozlamasi (prefers-color-scheme), aks holda data-theme bilan majburlanadi
  const theme = settings.theme ?? "auto";
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "auto") delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);
  const themeIdx = THEMES.findIndex((t) => t.id === theme);
  const nextTheme = THEMES[(themeIdx + 1) % THEMES.length];

  const sel = Math.min(settings.sel, parts.length - 1);
  const part = parts[sel];
  const computed = useMemo(() => computePart(part), [part]);

  // Oxirgi muvaffaqiyatli natija: xato kiritilganda natijalar o'chib ketmasdan xira ko'rinadi
  const lastGood = useRef(computed.error === null ? computed.result : null);
  if (computed.error === null) lastGood.current = computed.result;
  if (lastGood.current && lastGood.current.N !== part.N && computed.error !== null) lastGood.current = null;

  const notify = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  }, []);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const setSel = (i: number) => setSettings((s) => ({ ...s, sel: i }));

  const updatePart = (updater: (p: Part) => Part) => setParts((ps) => ps.map((p, i) => (i === sel ? updater(p) : p)));

  const addPart = () => {
    const src = {
      name: `Yangi qism ${parts.length + 1}`,
      N: part.N,
      P: part.P.slice(0, part.N).map(Number),
      V: part.V.slice(0, part.N).map(Number),
      R: computed.error === null ? getR(part).map(Math.round) : part.R.slice(0, part.N).map(Number),
      td: 2,
    };
    setParts((ps) => [...ps, makePart(src, false)]);
    setSel(parts.length);
  };

  const deletePart = () => {
    setParts((ps) => ps.filter((_, i) => i !== sel));
    setSel(Math.max(0, sel - 1));
    notify("Qism oʻchirildi");
  };

  const resetPart = () => {
    if (!part.sample) return;
    const fresh = { ...makePart(part.sample), id: part.id };
    setParts((ps) => ps.map((p, i) => (i === sel ? fresh : p)));
    notify("Namunaviy qiymatlar tiklandi");
  };

  const runTest = () => {
    let idx = parts.findIndex((p) => p.test);
    if (idx < 0) {
      setParts((ps) => [...ps, makePart(TEST_PART)]);
      idx = parts.length;
    }
    setSel(idx);
    navigate("/qism/natija");
    const c = computePart(makePart(TEST_PART));
    notify(c.error === null && c.result.min === 335 ? "Natija 335, yoʻl 0 → 2 → 6 → 10 — darslik bilan mos" : "Natija darslikdan farq qildi");
  };

  const resetAll = () => {
    setParts(defaultParts());
    setSel(0);
    setConfirmAll(false);
    notify("Barcha qismlar namunaga qaytarildi");
  };

  const shown = computed.error === null ? computed.result : lastGood.current;
  const isResultPage = section.base === "/qism" && path !== "/qism/kiritish";
  const pageIdx = section.pages.findIndex((p) => p.path === path);
  const prevPage = section.pages[pageIdx - 1];
  const nextPage = section.pages[pageIdx + 1];

  const renderPage = () => {
    if (path === "/qism/kiritish")
      return (
        <PartPanel
          parts={parts}
          sel={sel}
          error={computed.error}
          onSelect={setSel}
          onChange={updatePart}
          onAdd={addPart}
          onDelete={deletePart}
          onReset={resetPart}
          notify={notify}
        />
      );

    if (section.base === "/qism")
      return (
        <section className="stack">
          {computed.error && (
            <p className="msg">
              {computed.error} · <a href="#/qism/kiritish" className="link">Maʼlumotlarni tuzatish</a>
            </p>
          )}
          {shown && (
            <PartResults view={path.slice("/qism/".length) as PartView} res={shown} cur={settings.cur} dimmed={computed.error !== null} notify={notify} />
          )}
        </section>
      );

    if (section.base === "/apparat")
      return (
        <Summary
          view={path.slice("/apparat/".length) as SummaryView}
          parts={parts}
          cur={settings.cur}
          notify={notify}
          onOpen={(i) => {
            setSel(i);
            navigate("/qism/natija");
          }}
        />
      );

    return <ModelInfo />;
  };

  return (
    <>
      <header className="appbar">
        <div className="appbar-in">
          <a className="brand" href={`#${HOME}`} title="Stomatologik 3D rentgen (CBCT) jihozlarini almashtirish va taʼmirlash strategiyasini optimallashtirish">
            <Logo />
            <span>
              <h1>CBCT optimizator</h1>
              <small>Almashtirish strategiyasi · dinamik dasturlash</small>
            </span>
          </a>
          <nav className="tabs" aria-label="Boʻlimlar">
            {SECTIONS.map((s) => (
              <a key={s.base} href={`#${s.pages[0].path}`} aria-current={s === section ? "page" : undefined}>
                {s.icon}
                {s.label}
              </a>
            ))}
          </nav>
          <div className="tools">
            <select aria-label="Pul birligi" value={settings.cur} onChange={(e) => setSettings((s) => ({ ...s, cur: e.target.value as Currency }))}>
              <option value="$">$ dollar</option>
              <option value="soʻm">soʻm</option>
            </select>
            <button
              className="iconbtn"
              title={`${THEMES[Math.max(themeIdx, 0)].label} · bosing: ${nextTheme.label.toLowerCase()}`}
              aria-label={`Mavzu: ${THEMES[Math.max(themeIdx, 0)].label}`}
              onClick={() => setSettings((s) => ({ ...s, theme: nextTheme.id }))}
            >
              {THEMES[Math.max(themeIdx, 0)].icon}
            </button>
          </div>
        </div>
      </header>

      <div className="wrap">
        {(section.pages.length > 1 || isResultPage) && (
          <div className="subbar">
            {section.pages.length > 1 && (
              <nav className="subnav" aria-label="Sahifalar">
                {section.pages.map((p, i) => (
                  <a key={p.path} href={`#${p.path}`} aria-current={p.path === path ? "page" : undefined}>
                    <i>{i + 1}</i>
                    {p.label}
                  </a>
                ))}
              </nav>
            )}
            {isResultPage && (
              <div className="picker">
                <label htmlFor="pickSel">Qism</label>
                <select id="pickSel" value={sel} onChange={(e) => setSel(Number(e.target.value))}>
                  {parts.map((p, i) => (
                    <option key={p.id} value={i}>
                      {i + 1}. {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <main className="stack">{renderPage()}</main>

        {(prevPage || nextPage) && (
          <nav className="pager" aria-label="Oldingi va keyingi sahifa">
            {prevPage ? (
              <a href={`#${prevPage.path}`}>
                <IconArrow dir="left" />
                <span><small>Oldingi</small>{prevPage.label}</span>
              </a>
            ) : <span />}
            {nextPage && (
              <a href={`#${nextPage.path}`} className="next">
                <span><small>Keyingi</small>{nextPage.label}</span>
                <IconArrow />
              </a>
            )}
          </nav>
        )}

        <footer className="foot">
          <span>Maʼlumotlar shu brauzerda saqlanadi · {parts.filter((p) => !p.test).length} ta qism</span>
          <div className="btnrow">
            <button className="btn ghost" onClick={runTest}>Algoritmni darslik misolida tekshirish</button>
            <button className="btn ghost danger" onClick={() => setConfirmAll(true)}>Barcha qismlarni namunaga qaytarish</button>
          </div>
        </footer>
        {confirmAll && (
          <div className="confirm">
            <span>Barcha qismlar namunaviy qiymatlarga qaytariladi, kiritilgan maʼlumotlar oʻchadi.</span>
            <button className="btn danger" onClick={resetAll}>Ha, qaytarish</button>
            <button className="btn" onClick={() => setConfirmAll(false)}>Bekor qilish</button>
          </div>
        )}

        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </div>
    </>
  );
}
