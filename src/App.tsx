import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { SAMPLE_PARTS, TEST_PART } from "./data/samples";
import { computePart, getR, isPartArray, makePart, type Part } from "./lib/parts";
import type { Currency } from "./lib/format";
import { withTransition } from "./lib/transition";
import { usePersistentState } from "./hooks/usePersistentState";
import { navigate, useHashRoute } from "./hooks/useHashRoute";
import { useSlidingPill } from "./hooks/useSlidingPill";
import { DICTS, I18nProvider, LANGS, type Dict, type Lang } from "./i18n";
import PartPanel from "./components/PartPanel";
import PartResults, { type PartView } from "./components/PartResults";
import Summary, { type SummaryView } from "./components/Summary";
import ModelInfo from "./components/ModelInfo";
import { IconArrow, IconAuto, IconBook, IconCalc, IconChart, IconMoon, IconSun, Logo } from "./components/icons";

type Theme = "auto" | "light" | "dark";
interface Settings {
  sel: number;
  cur: Currency;
  theme: Theme;
  lang: Lang;
}

/** Lug'atdagi oddiy matn kalitlari (funksiyalar emas) */
type TextKey = { [K in keyof Dict]: Dict[K] extends string ? K : never }[keyof Dict];

interface Page {
  path: string;
  label: TextKey;
}
interface Section {
  label: TextKey;
  base: string;
  icon: React.ReactNode;
  pages: Page[];
}

const THEMES: { id: Theme; label: TextKey; icon: React.ReactNode }[] = [
  { id: "auto", label: "themeAuto", icon: <IconAuto /> },
  { id: "light", label: "themeLight", icon: <IconSun /> },
  { id: "dark", label: "themeDark", icon: <IconMoon /> },
];

// Navbar: bo'limlar (yuqori qator) va har bo'lim ichidagi sahifalar (pastki qator)
const SECTIONS: Section[] = [
  {
    label: "secPart",
    base: "/qism",
    icon: <IconCalc />,
    pages: [
      { path: "/qism/kiritish", label: "pgInput" },
      { path: "/qism/natija", label: "pgResult" },
      { path: "/qism/tor", label: "pgNet" },
      { path: "/qism/hisob", label: "pgBellman" },
      { path: "/qism/solishtirish", label: "pgCompare" },
    ],
  },
  {
    label: "secDevice",
    base: "/apparat",
    icon: <IconChart />,
    pages: [
      { path: "/apparat/xulosa", label: "pgSummary" },
      { path: "/apparat/yillik", label: "pgYearly" },
      { path: "/apparat/ulush", label: "pgShare" },
    ],
  },
  { label: "secModel", base: "/model", icon: <IconBook />, pages: [{ path: "/model", label: "pgModel" }] },
];
const PATHS = SECTIONS.flatMap((s) => s.pages.map((p) => p.path));
const HOME = PATHS[0];

// v2: asosiy pul birligi so'm, namunalar so'mda (v1 dagi dollar ma'lumotlari brauzerda tegilmay qoladi)
const defaultParts = () => SAMPLE_PARTS.map((s) => makePart(s));
const defaultSettings = (): Settings => ({ sel: 0, cur: "soʻm", theme: "auto", lang: "uz" });
const isSettings = (x: unknown): x is Settings => {
  const s = x as Settings;
  return (
    !!s &&
    typeof s.sel === "number" &&
    (s.cur === "$" || s.cur === "soʻm") &&
    THEMES.some((t) => t.id === s.theme) &&
    LANGS.some((l) => l.id === s.lang)
  );
};

export default function App() {
  const [parts, setParts] = usePersistentState<Part[]>("cbct-opt:parts:v2", defaultParts, isPartArray);
  const [settings, setSettings] = usePersistentState<Settings>("cbct-opt:settings:v2", defaultSettings, isSettings);
  const [toast, setToast] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const toastTimer = useRef<number>();
  const t = DICTS[settings.lang];

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

  // Mavzu va til <html> ga commit paytida yoziladi — View Transition yangi holatni darhol ko'radi
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (settings.theme === "auto") delete root.dataset.theme;
    else root.dataset.theme = settings.theme;
  }, [settings.theme]);
  useLayoutEffect(() => {
    document.documentElement.lang = t.lang;
    document.title = t.docTitle;
  }, [t]);

  const themeIdx = THEMES.findIndex((x) => x.id === settings.theme);
  const curTheme = THEMES[themeIdx];
  const nextTheme = THEMES[(themeIdx + 1) % THEMES.length];

  const [tabsRef, tabsPill] = useSlidingPill<HTMLElement>([path, settings.lang]);
  const [subRef, subPill] = useSlidingPill<HTMLElement>([path, settings.lang]);

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
    const name = t.newPart(parts.length + 1);
    const src = {
      name,
      nameRu: name,
      N: part.N,
      P: part.P.slice(0, part.N).map(Number),
      V: part.V.slice(0, part.N).map(Number),
      R: computed.error === null ? getR(part).map(Math.round) : part.R.slice(0, part.N).map(Number),
      td: 2,
      Cd: Number(part.ext.Cd) || 0,
    };
    setParts((ps) => [...ps, makePart(src, false)]);
    setSel(parts.length);
  };

  const deletePart = () => {
    setParts((ps) => ps.filter((_, i) => i !== sel));
    setSel(Math.max(0, sel - 1));
    notify(t.toastDeleted);
  };

  const resetPart = () => {
    if (!part.sample) return;
    const fresh = { ...makePart(part.sample), id: part.id };
    setParts((ps) => ps.map((p, i) => (i === sel ? fresh : p)));
    notify(t.toastSample);
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
    notify(c.error === null && c.result.min === 335 ? t.toastTestOk : t.toastTestBad);
  };

  const resetAll = () => {
    setParts(defaultParts());
    setSel(0);
    setConfirmAll(false);
    notify(t.toastAllReset);
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
              {t[computed.error]} · <a href="#/qism/kiritish" className="link">{t.fixData}</a>
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
    <I18nProvider value={t}>
      <header className="appbar">
        <div className="appbar-in">
          <a className="brand" href={`#${HOME}`} title={t.brandFull}>
            <Logo />
            <span>
              <h1>{t.brand}</h1>
              <small>{t.brandSub}</small>
            </span>
          </a>
          <nav className="tabs" aria-label={t.navSections} ref={tabsRef}>
            <span className="pill" style={tabsPill} aria-hidden="true" />
            {SECTIONS.map((s) => (
              <a key={s.base} href={`#${s.pages[0].path}`} aria-current={s === section ? "page" : undefined}>
                {s.icon}
                {t[s.label]}
              </a>
            ))}
          </nav>
          <div className="tools">
            <div className="seg lang" role="group" aria-label={t.langAria}>
              {LANGS.map((l) => (
                <button
                  key={l.id}
                  aria-pressed={settings.lang === l.id}
                  onClick={() => settings.lang !== l.id && withTransition(() => setSettings((s) => ({ ...s, lang: l.id })), "lang")}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <select aria-label={t.curAria} value={settings.cur} onChange={(e) => setSettings((s) => ({ ...s, cur: e.target.value as Currency }))}>
              <option value="soʻm">{t.curSom}</option>
              <option value="$">{t.curUsd}</option>
            </select>
            <button
              className="iconbtn"
              title={t.themeTitle(t[curTheme.label], t[nextTheme.label])}
              aria-label={t.themeAria(t[curTheme.label])}
              onClick={() => withTransition(() => setSettings((s) => ({ ...s, theme: nextTheme.id })), "theme")}
            >
              {curTheme.icon}
            </button>
          </div>
        </div>
      </header>

      <div className="wrap">
        {(section.pages.length > 1 || isResultPage) && (
          <div className="subbar">
            {section.pages.length > 1 && (
              <nav className="subnav" aria-label={t.navPages} ref={subRef}>
                <span className="pill" style={subPill} aria-hidden="true" />
                {section.pages.map((p, i) => (
                  <a key={p.path} href={`#${p.path}`} aria-current={p.path === path ? "page" : undefined}>
                    <i>{i + 1}</i>
                    {t[p.label]}
                  </a>
                ))}
              </nav>
            )}
            {isResultPage && (
              <div className="picker">
                <label htmlFor="pickSel">{t.picker}</label>
                <select id="pickSel" value={sel} onChange={(e) => setSel(Number(e.target.value))}>
                  {parts.map((p, i) => (
                    <option key={p.id} value={i}>
                      {i + 1}. {t.partName(p)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* key: sahifa almashganda kontent qayta chiqadi va kirish animatsiyasi ishlaydi */}
        <main className="stack" key={path}>
          {renderPage()}
        </main>

        {(prevPage || nextPage) && (
          <nav className="pager" aria-label={t.navPager}>
            {prevPage ? (
              <a href={`#${prevPage.path}`}>
                <IconArrow dir="left" />
                <span><small>{t.prev}</small>{t[prevPage.label]}</span>
              </a>
            ) : <span />}
            {nextPage && (
              <a href={`#${nextPage.path}`} className="next">
                <span><small>{t.next}</small>{t[nextPage.label]}</span>
                <IconArrow />
              </a>
            )}
          </nav>
        )}

        <footer className="foot">
          <span>{t.stored(parts.filter((p) => !p.test).length)}</span>
          <div className="btnrow">
            <button className="btn ghost" onClick={runTest}>{t.runTest}</button>
            <button className="btn ghost danger" onClick={() => setConfirmAll(true)}>{t.resetAll}</button>
          </div>
        </footer>
        {confirmAll && (
          <div className="confirm">
            <span>{t.confirmResetAll}</span>
            <button className="btn danger" onClick={resetAll}>{t.yesReset}</button>
            <button className="btn" onClick={() => setConfirmAll(false)}>{t.cancel}</button>
          </div>
        )}

        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </div>
    </I18nProvider>
  );
}
