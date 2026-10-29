# CBCT optimizator — Claude Code bajargan ishlar hisoboti

> Bu hujjat boshqa yordamchi (masalan, brauzerdagi Claude) loyihani tez tushunishi uchun yozilgan.
> Unda bitta chat davomida (2026-yil 28–29-oktyabr) Claude Code loyihada nima qilgani bayon etilgan:
> qaysi fayllar 0 dan yaratildi, qaysilari oʻzgartirildi, qaysi kodlar oʻchirildi, qanday logika qoʻshildi
> va qanday cheklovlar qoldi. Fayl yoʻllari loyiha ildiziga nisbatan berilgan.

---

## 1. Loyiha haqida qisqacha

- **Maqsad:** stomatologik 3D rentgen (CBCT) apparati qismlarini almashtirish va taʼmirlash strategiyasini
  **dinamik dasturlash (Bellman)** asosida optimallashtiruvchi web-dastur (magistrlik dissertatsiyasi uchun).
- **Model:** `c(i, j) = P(i+1) + R(j−i) − V(j−i)`; `f(N) = 0`, `f(i) = min_{j>i} [c(i, j) + f(j)]`; minimal xarajat = `f(0)`.
  P — yangi qism narxi, V — qoldiq qiymat, R — yigʻma taʼmir xarajati. Kengaytma: R ni nosozlik ehtimoli orqali hisoblash.
- **Stack:** React 18 + TypeScript 5.6 + Vite 5 + oddiy CSS (framework yoʻq) + qoʻlda yozilgan SVG grafiklar + Vitest.
  Tashqi kutubxona **qoʻshilmagan** (router, i18n, UI kit — hammasi oʻzimizniki).
- **Maʼlumotlar** brauzerning `localStorage` ida saqlanadi (server yoʻq).
- **Algoritm** (`src/lib/model.ts`) va uning testlari (`src/lib/model.test.ts`, 6 ta test) chat davomida **oʻzgartirilmadi**.
  Darslik misoli: javob 335, yoʻl 0 → 2 → 6 → 10.

## 2. Chat boshidagi holat

Chat boshida bitta sahifali ilova bor edi. Yuqorida katta sarlavha, ostida uchta yorliq boʻlib, ular holat (`settings.tab`) orqali almashardi:
- "Qism boʻyicha hisob": kiritish jadvali va barcha natija bloklari **ustma-ust**;
- "Apparat boʻyicha xulosa";
- "Matematik model".

Boshqa xususiyatlari:
- Faqat oʻzbek tili.
- Namunaviy narxlar dollarda, `$ / soʻm` tanlovi faqat yorliqni almashtirardi.
- Shriftlar: IBM Plex Sans / IBM Plex Mono / Source Serif 4.
- Mobil moslashuv deyarli yoʻq edi.

Mavjud fayllar: `main.tsx`, `App.tsx`, `styles.css`, `components/{PartPanel, PartResults, Summary, ModelInfo, charts}.tsx`,
`data/samples.ts`, `hooks/usePersistentState.ts`, `lib/{format, model, parts}.ts`, `lib/model.test.ts`.

## 3. Bajarilgan ishlar — xronologik tartibda

| # | Soʻrov | Natija (qisqa) |
|---|---|---|
| 1 | `main.tsx` da `import "./styles.css"` xato beryapti | `src/vite-env.d.ts` yaratildi (sabab pastda) |
| 2 | Har bir boʻlim alohida sahifada, navbar bilan | Hash-router, 9 ta sahifa, ikki darajali navbar |
| 3 | Konsolda `destroy is not a function` | `useEffect` dan Promise qaytayotgan edi — tuzatildi |
| 4 | Dizaynni kuchaytirish | Yangi appbar, shriftlar, mavzu tugmasi, qadamlar, oldingi/keyingi, CSS qayta yozildi |
| 5 | Asosiy valyuta soʻm, rus tili, animatsiyalar | Namunalar soʻmga, toʻliq i18n (uz/ru), View Transitions va CSS animatsiyalar |
| 6 | Mobilga toʻliq moslashtirish | Pastki navigatsiya, sozlamalar oynasi, moslashuvchan grafiklar, kartali jadvallar |
| 7 | Narxlarni realroq qilish | Oʻrta sinf (~$60 000) apparat asosida yangi namunalar, kurs 11 800 |
| 8 | Ranglar, asosiy mavzu qorongʻi | Qorongʻi mavzu standart, 4 palitra taklif qilindi, kontrast tuzatildi |
| 9 | c(i, j) va Bellman jadvallari ustma-ust | Toʻliq kenglik, scroll yoʻq, nomzodlar koʻchadigan boʻldi |
| 10 | "1-ning foni + 2-ning aksenti" | Firuza fon + indigo aksent qoʻllandi (hozirgi holat) |

Har bir bosqich batafsil quyida, 4–6-boʻlimlarda.

---

## 4. Fayllar boʻyicha toʻliq roʻyxat

### 4.1. 0 dan yaratilgan fayllar

| Fayl | Vazifasi |
|---|---|
| `src/vite-env.d.ts` | `/// <reference types="vite/client" />` — `.css` importlari uchun tiplar |
| `src/hooks/useHashRoute.ts` | Oddiy hash-router: `useHashRoute()` joriy yoʻlni qaytaradi, `navigate(path, replace?)` |
| `src/hooks/useSlidingPill.ts` | Navbardagi faol havola ostida siljiydigan fon ("pill") uchun oʻlcham/joylashuv |
| `src/hooks/useElementWidth.ts` | Element kengligini `ResizeObserver` bilan oʻlchaydi (grafiklar uchun) |
| `src/lib/transition.ts` | `withTransition(update, kind)` — View Transitions API oʻrami |
| `src/i18n/index.ts` | `Dict`, `Lang`, `DICTS`, `LANGS`, `I18nProvider`, `useT()` |
| `src/i18n/uz.ts` | Oʻzbekcha lugʻat — asosiy manba (170 kalit, matn va funksiyalar) |
| `src/i18n/ru.ts` | Ruscha lugʻat, `Dict` tipiga majburiy mos (kalit tushib qolsa TS xato beradi) |
| `src/components/icons.tsx` | SVG ikonkalar: `Logo`, `IconCalc`, `IconChart`, `IconBook`, `IconSun`, `IconMoon`, `IconAuto`, `IconSliders`, `IconArrow` |
| `CLAUDE_ISHLAR_HISOBOTI.md` | Shu hujjat |

### 4.2. Kuchli oʻzgartirilgan / deyarli qayta yozilgan fayllar

- **`src/App.tsx`** — toʻliq qayta yozildi (pastda 5.1-boʻlim).
- **`src/styles.css`** — toʻliq qayta yozildi (145 → ~390 qator; 5.9-boʻlim).
- **`src/components/charts.tsx`** — barcha grafiklar konteyner kengligida chiziladigan qilib qayta yozildi (5.6).
- **`src/components/ModelInfo.tsx`** — ikki tilli boʻldi: `ModelUz` va `ModelRu`, formulalar umumiy konstantalarda.
- **`src/data/samples.ts`** — namunalar ikki marta qayta tuzildi; hozirgisi: real narxlarga yaqin, soʻmda (5.8).

### 4.3. Oʻzgartirilgan fayllar (qoʻshimchalar)

- **`src/components/PartResults.tsx`**:
  - `view` prop qoʻshildi (`"natija" | "tor" | "hisob" | "solishtirish"`), har sahifada faqat oʻz bloki chiqadi.
  - Barcha matnlar `useT()` ga ulandi.
  - Jadvallarga `sticky1`, `cards`, `math` klasslari va `data-label` atributlari qoʻshildi.
  - Bellman "Hisob" ustuni `<span class="cand">` boʻlaklariga ajratildi.
  - DAG izohi SVG tashqarisiga chiqarildi.
- **`src/components/Summary.tsx`**:
  - `view` prop qoʻshildi (`"xulosa" | "yillik" | "ulush"`) va `useT()`.
  - Strategiya jadvali telefonda kartalarga aylanadi (`cards`, `data-label`).
  - Matritsa jadvalida qism nomi ustuni qotadi va uzun nomlar qisqartiriladi (`.clip`).
- **`src/components/PartPanel.tsx`**:
  - `useT()` qoʻshildi.
  - Yangi ichki komponent `NumInput`: fokusda boʻlmaganda raqamni xonalarga ajratib koʻrsatadi.
  - Telefon uchun belgilar izohi (`.sym-legend`) qoʻshildi.
  - Xatolar endi kalit sifatida keladi (`t[error]`).
  - Nom oʻzgartirishda tarjima qilingan nom oʻzgarmasdan saqlanmaydi.
- **`src/lib/parts.ts`**:
  - `stepFor()`: yaxlitlash qadami qiymat kattaligiga qarab tanlanadi.
  - `Cd` endi namunadan olinadi.
  - `validate()` matn oʻrniga xato kalitini (`PartError`) qaytaradi.
- **`src/lib/format.ts`**:
  - `fmtShort()` qoʻshildi: "115,2 mln".
  - `nb()` qoʻshildi: raqam guruhlari orasida qatorni boʻlmaydigan boʻshliq.
  - `money()` oʻchirildi (lugʻatga koʻchdi).
- **`index.html`**:
  - Shriftlar almashtirildi.
  - Mavzuni oldindan qoʻyadigan inline skript qoʻshildi.
  - `theme-color` meta teglari qoʻshildi.
  - Favicon indigo rangga oʻtdi.
- **`README.md`**: imkoniyatlar roʻyxatidagi valyuta va til qatorlari yangilandi.

### 4.4. Oʻzgartirilmagan fayllar

`src/main.tsx`, `src/lib/model.ts`, `src/lib/model.test.ts`, `src/hooks/usePersistentState.ts`,
`package.json`, `vite.config.ts`, `tsconfig.json`. **Yangi npm paket oʻrnatilmagan.**

### 4.5. Oʻchirilgan kodlar

- `App.tsx`:
  - eski `type Tab`, `TABS` massivi, `settings.tab` va yorliq tugmalari (`role="tab"`);
  - eski katta sarlavha (`header.top` ichidagi eyebrow, h1 va tavsif paragrafi).
- `format.ts`: `money()` funksiyasi (endi `t.money(x, cur)` lugʻatda).
- `parts.ts`: oʻzbekcha xato matnlari (endi `errNum`, `errExt`, `errPf` kalitlari).
- `samples.ts`: dollardagi eski namunaviy qiymatlar (ikki marta almashtirildi).
- `charts.tsx`: qatʼiy `W = 900` oʻlchamlar; DAG ichidagi `<text>` izoh.
- `styles.css`:
  - eski `.top`, `.toprow`, `.titlebox`, `.cur`, `.eyebrow` va `nav.tabs button` uslublari;
  - `.grid2` (ikki ustunli joylashuv);
  - `@media (max-width:420px)` KPI qoidasi;
  - oraliq bosqichdagi `.navbar`;
  - IBM Plex shriftlari.

---

## 5. Qoʻshilgan logika — batafsil

### 5.1. `App.tsx` — ilova skeleti, routing, sozlamalar

**Sahifalar (hash-router):**

| Boʻlim | Yoʻl | Komponent |
|---|---|---|
| Qism boʻyicha hisob | `#/qism/kiritish` | `PartPanel` |
| | `#/qism/natija` | `PartResults view="natija"`: KPI + yillik grafik + jadval |
| | `#/qism/tor` | `PartResults view="tor"`: atsiklik toʻr (DAG) |
| | `#/qism/hisob` | `PartResults view="hisob"`: c(i, j) + Bellman |
| | `#/qism/solishtirish` | `PartResults view="solishtirish"` |
| Apparat boʻyicha xulosa | `#/apparat/xulosa`, `#/apparat/yillik`, `#/apparat/ulush` | `Summary view=…` |
| Matematik model | `#/model` | `ModelInfo` |

- `SECTIONS` massivida har boʻlim uchun `label`, `short` (telefon menyusi uchun), `base`, `icon`, `pages`; matnlar lugʻat kaliti (`TextKey`).
- Nomaʼlum manzil `HOME` (`/qism/kiritish`) ga `replace` bilan yoʻnaltiriladi; sahifa almashganda `scrollTo(0)`.
- `<main key={path}>` — sahifa almashganda kontent qayta mount boʻladi (kirish animatsiyasi uchun).
- Natija sahifalarida qadamlar yonida **qism tanlagich** (`#pickSel`) chiqadi.
- Boʻlim ichida **Oldingi / Keyingi** tugmalari (`nav.pager`) bor.

**Sozlamalar** (`Settings = { sel, cur, theme, lang }`):
- Standart qiymatlar: `{ sel: 0, cur: "soʻm", theme: "dark", lang: "uz" }`.
- `localStorage` kalitlari: `cbct-opt:parts:v3` va `cbct-opt:settings:v3`. Eski `v1`/`v2` maʼlumotlar oʻchirilmagan, ilova ularni oʻqimaydi.
- **Mavzu:** `THEMES` = auto / light / dark.
  - `useLayoutEffect` `<html data-theme>` ni qoʻyadi va `meta[name=theme-color]` ni `THEME_BG` boʻyicha yangilaydi.
  - `THEME_BG` qiymatlari `--bg` bilan bir xil boʻlishi shart: light `#f2f5f7`, dark `#0b1218`.
- **Til:** `t = DICTS[settings.lang]`, butun daraxt `<I18nProvider value={t}>` bilan oʻralgan. `document.title` va `<html lang>` til bilan almashadi.
- Mavzu va til almashinuvi `withTransition(..., "theme" | "lang")` orqali silliq oʻtadi.

**Navigatsiya elementlari:**
- **Desktop / planshet:** `header.appbar` (sticky, blur) ichida quyidagilar bor:
  - brend;
  - `nav.tabs` boʻlimlar, siljiydigan pill bilan;
  - `.tools`: UZ/RU segment, valyuta select, mavzu tugmasi.
- **Telefon (≤760px):**
  - appbar'da brend va ⚙ (`.settings-btn`) tugmasi qoladi;
  - boʻlimlar ekran pastidagi `nav.bottomnav` da (ikonka + qisqa nom, oʻz pill'i bilan);
  - sozlamalar pastdan chiqadigan oynada (`.sheet` + `.backdrop`, Escape bilan yopiladi). Unda til, valyuta va mavzu (3 tugmali segment) bor.
- `langSeg` va `curSelect(id)` bir marta yozilgan va ikki joyda ishlatiladi (appbar va sozlamalar oynasi).
- Uchta `useSlidingPill` mavjud: `tabs`, `subnav`, `bottomnav`.

**Biznes logikasi oʻzgarmagan:** `addPart`, `deletePart`, `resetPart`, `runTest`, `resetAll`, `lastGood` (xato kiritilganda natija xira koʻrinadi).
Faqat matnlar lugʻatga oʻtdi. `addPart` endi `nameRu` va `Cd` ni ham beradi.

### 5.2. i18n (oʻzbek / rus)

- `uz.ts` — manba. `Dict = typeof uz`, `ru: Dict` — tiplar orqali kalitlar mosligi kafolatlanadi.
- Lugʻatda oddiy matnlardan tashqari funksiyalar ham bor:
  - `money(x, cur)` — `nb()` bilan;
  - `years(n)` — rus tilida koʻplik shakli: 1 год / 2 года / 5 лет;
  - `yearN(y)`, `everyT(T)` ("Har yili" / "Замена каждый год"), `dMin(n)`, `confirmDel(name)`, `tipBuy(y, v)` va boshqalar;
  - `units` — "ming/mln/mlrd" va "тыс./млн/млрд" (`fmtShort` uchun);
  - `partName(p)` — namunaviy qism nomini tarjima qiladi (`sample.nameRu`). Foydalanuvchi bergan nom oʻzgarmaydi.
- **Xatolar:** `parts.ts` dagi `validate()` `"errNum" | "errExt" | "errPf"` qaytaradi, UI uni `t[error]` bilan koʻrsatadi.
- **Yangi matn qoʻshish qoidasi:** kalitni avval `uz.ts` ga, keyin `ru.ts` ga qoʻshish kerak. Aks holda TypeScript xato beradi.

### 5.3. Hash-router (`useHashRoute.ts`)

- `read()` → `location.hash` dan yoʻl. `hashchange` hodisasi `withTransition(() => setPath(...))` ni chaqiradi.
- `navigate(path, replace)` → `location.hash = path` yoki `location.replace("#...")`.
- Hash tanlanishining sababi: statik hostingda (masalan, Vercel) qoʻshimcha sozlamasiz ishlaydi va sahifa yangilanganda ham toʻgʻri ochiladi.

### 5.4. Animatsiyalar va oʻtishlar

- **`withTransition(update, kind)`** (`lib/transition.ts`):
  - `document.startViewTransition(() => flushSync(update))` chaqiriladi;
  - `<html data-vt="page|theme|lang">` belgilanadi;
  - brauzer API'ni qoʻllamasa yoki `prefers-reduced-motion` yoqilgan boʻlsa, oddiy yangilanish boʻladi.
- **CSS:** `data-vt="page"` paytida appbar, subbar va bottomnav'ga `view-transition-name` beriladi va ularning eski surati yashiriladi. Natijada sahifa almashganda faqat kontent oʻtadi, pill esa oʻzi siljiydi.
- **`useSlidingPill(deps)`:**
  - nav ichidagi `[aria-current="page"]` havolani oʻlchaydi va pill'ga `width/height/transform` beradi;
  - birinchi joylashuvda animatsiya boʻlmaydi;
  - `ResizeObserver` oʻlchamni yangilab turadi;
  - gorizontal suriladigan qatorda faol havolani oʻrtaga suradi.
- **CSS animatsiyalar** (`prefers-reduced-motion: no-preference` ichida, faqat `transform`/`opacity`):
  - kartalar va KPI'lar ketma-ket koʻtariladi (`rise`);
  - grafik ustunlari oʻsadi (`.bar`, `.bar.dn`, `.bar-x`);
  - optimal yoʻl chiziladi (`.draw`, `pathLength=1`);
  - DAG yorliqlari kechikib chiqadi (`.fade-late`);
  - tugma bosilganda `scale(.96)`;
  - sozlamalar oynasi pastdan chiqadi;
  - toast silliq chiqadi.
- Hover effektlari `@media (hover:hover)` ichida, telefonda "yopishib" qolmaydi.
- Animatsiyalar `animation-fill-mode: backwards` bilan yozilgan, hover `transform` bilan toʻqnashmaydi.

### 5.5. Valyuta va raqam formatlash

- Asosiy valyuta — **soʻm**. `$` tanlovi **faqat yorliqni** almashtiradi, kurs boʻyicha hisoblamaydi (ataylab shunday qoldirilgan).
- `fmt()` — `ru-RU` formatida "23 650".
- `nb()` raqam ichidagi boʻshliqlarni NBSP ga almashtiradi. Shunda "302 720 000 soʻm" faqat "soʻm" oldidan qatorga koʻchadi.
- `fmtShort(x, units)` — grafik oʻqlari, DAG yorliqlari va ulush grafigi uchun ("150 mln").
- `NumInput` (PartPanel): fokusda xom qiymat, aks holda "115 200 000". `clean()` boʻshliqlarni olib tashlaydi va vergulni nuqtaga almashtiradi.

### 5.6. Grafiklar (`charts.tsx`)

- Hamma grafik `useElementWidth()` bilan konteyner kengligini oladi va `viewBox` ni shu kenglikda chizadi: 1 birlik = 1 px.
  Shuning uchun telefonda ham yozuvlar 11px boʻlib qoladi. Avval 900px dan kichraytirilardi va telefonda 3.7px chiqardi.
- **`YearChart`:**
  - tor ekranda (<520px) balandlik va chap chegara kichrayadi;
  - pastki manfiy belgi faqat "0" dan ≥14px uzoq boʻlsa chiziladi.
- **`IntervalChart`:**
  - joy yetmasa yorliq "T=10" oʻrniga "10" boʻladi, oʻq boshida "T" chiqadi;
  - "optimal: …" yozuvi fon rangidagi konturga ega (`paint-order: stroke`).
- **`DagChart`:**
  - kenglik `max(konteyner, N·52+60)` px va SVG haqiqiy oʻlchamda chiziladi;
  - tor ekranda `.tw` ichida suriladi, kichraymaydi;
  - yorliqlar `fmtShort`.
- **`ShareChart`:**
  - <560px da "nom + qiymat bir qatorda, ostida toʻliq kenglikdagi chiziq" koʻrinishi;
  - kengda chapda nom, oʻngda ustun.

### 5.7. Mobil moslashuv (CSS, `≤760px`)

- **KPI:** asosiy KPI toʻliq kenglikda (`order:-1`), qolganlari 2 ustunda, toq qolgani toʻliq kenglikda.
- **Kartali jadvallar** (`table.cards`): `thead` yashirinadi, har qator karta boʻladi, `td::before { content: attr(data-label) }`.
  Ishlatiladi: apparat strategiya jadvali va strategiyalar solishtirmasi.
- **Qotgan birinchi ustun** (`table.sticky1`): gorizontal surilganda birinchi ustun joyida qoladi (`colspan` li katak bundan mustasno).
  Ishlatiladi: kiritish, yillar, c(i, j), Bellman va matritsa jadvallari. Bu klass desktop'da ham ishlaydi.
- **Yillar jadvali:** telefonda "Qaror" va "Qism yoshi" yashiriladi (`.hide-m`). Yangi qism yili "Yil" katagida chap chiziq bilan belgilanadi.
- **Kiritish jadvali:** telefonda qotgan ustunda faqat belgi (P, V, R) qoladi, izohlar jadval ustidagi `.sym-legend` roʻyxatida.
- **iOS:** inputlar va select'lar 16px, aks holda fokusda sahifa zoom boʻladi.
- **Tugmalar:** telefon va sensorli ekranda ≥40–44px balandlik.
- **Planshet (≤900px):** boʻlimlar appbar'ning ikkinchi qatorida.
- Tuzatilgan toshib chiqishlar:
  - `.subbar` da `flex-wrap: nowrap`, aks holda ustunli flex qatorni kontent kengligiga choʻzardi;
  - qism tanlagichi select'iga `min-width: 0`.

### 5.8. Namunaviy maʼlumotlar (`samples.ts`)

- **`SampleSource` maydonlari:** `name`, `nameRu`, `N`, `P[]`, `V[]`, `R[]` (yigʻma), `td` (bekor turish kunlari), `Cd` (1 kunlik yoʻqotish), `test?`.
- Qiymatlar dollarda yozilgan. `fromUsd()` ularni `USD_UZS = 11 800` kursi boʻyicha soʻmga oʻgirib, 10 000 ga yaxlitlaydi. `Cd = $150 × kurs`.
- **Moʻljal:** oʻrta sinf CBCT apparati (~$60 000; bozorda yangi apparatlar ~$30 000–150 000).
  Qismlar jami ~$25 000 (~300 mln soʻm), narxlar yiliga ~2–3% oshadi.
- 10 ta qism va ularning optimal strategiyasi:

| Qism | Narx | Strategiya |
|---|---|---|
| Rentgen naychasi | $5 500 | 6-yilda almashtiriladi |
| Detektor | $12 000 | almashtirilmaydi |
| Aylanish mexanizmi | $900 | 4-yilda |
| Elektr dvigateli | $650 | 5-yilda |
| Elektron plata | $2 400 | 6-yilda |
| Kolimator | $1 200 | 5-yilda |
| Sensorlar | $300 | almashtirilmaydi |
| Sovutish | $450 | 4-yilda |
| Kabellar | $250 | 4-yilda |
| Kompyuter | $1 800 | 5-yilda |

- **Jami minimal xarajat ≈ 660 mln soʻm.** Eski namunalarda 1.07 mlrd edi.
- `TEST_PART` (darslik misoli) oʻzgarmagan, faqat `nameRu` va `Cd: 10` qoʻshilgan.
- **Diqqat:** qismlar narxi taxminiy, ochiq manba topilmadi. Apparat narxi va kurs manbalarga tayanadi. Haqiqiy klinika maʼlumotlari keyin kiritiladi.

### 5.9. `styles.css` tuzilishi va ranglar

**Boʻlimlar ketma-ketligi:**
1. rang tokenlari;
2. asosiy qoidalar;
3. appbar va pill;
4. planshet;
5. sahifa, qadamlar, pager;
6. kartalar, boshqaruv, tugmalar;
7. jadvallar (`sticky1`, `clip`, `math`, `calc`, teglar);
8. KPI;
9. grafiklar;
10. matn;
11. pastki qism;
12. **telefon bloki (≤760px)**;
13. sensorli ekran bloki;
14. planshet navigatsiyasi;
15. animatsiyalar va View Transitions.

**Ranglar faqat CSS oʻzgaruvchilarida.** Komponentlar rangni toʻgʻridan-toʻgʻri yozmaydi. Uchta blok bor: yorugʻ (`:root`), tizim qorongʻi rejimi (`prefers-color-scheme: dark`), qoʻlda tanlangan qorongʻi rejim (`[data-theme="dark"]`).
Ataylab qattiq yozilgan ranglar: soyalar, sozlamalar oynasi ortidagi qora parda va `App.tsx` dagi `THEME_BG`.

**Hozirgi palitra — "firuza foni + indigo aksent":**

| Token | Qorongʻi (asosiy) | Yorugʻ |
|---|---|---|
| `--bg` / `--surface` / `--surface-2` | `#0b1218` / `#121c24` / `#18252f` | `#f2f5f7` / `#ffffff` / `#eef3f5` |
| `--line` / `--line-2` | `#24343f` / `#1d2b35` | `#d6e0e5` / `#e5ecef` |
| `--fg` / `--fg-2` / `--fg-3` | `#e4ecf1` / `#a3b3bf` / `#73858f` | `#13202a` / `#475866` / `#6b7c88` |
| `--accent` / `--accent-2` | `#8b9dff` / `#a7b4ff` | `#4352c9` / `#5463db` |
| `--accent-soft` / `--accent-fg` | `#212a4e` / `#0b0e24` | `#e6e9fb` / `#ffffff` |
| `--opt` / `--opt-soft` (optimal yoʻl, kahrabo) | `#f0a24a` / `#3a2a15` | `#a35406` / `#fdf1e3` |
| `--good` / `--bad` (+ `-soft`) | `#5cc08a` / `#e8776e` | `#1f7a4a` / `#b4372f` |
| `--buy` / `--rep` / `--sell` (grafik) | `#8b9dff` / `#5f7886` / `#f0a24a` | `#4352c9` / `#7790a0` / `#c46f1c` |

- Barcha juftliklar WCAG boʻyicha tekshirilgan: matn ≥ 4.5:1, izohlar ≥ 3.5:1, grafik ustunlari ≥ 3:1.
- Avvalgi toza firuza aksenti: qorongʻi `#4fb8c3`, yorugʻ `#0b6e79`.
- **Shriftlar:** Inter (matn), JetBrains Mono (raqamlar), Source Serif 4 (sarlavhalar).
  IBM Plex oʻzbekcha `ʻ ʼ` belgilarini chiqara olmagani uchun almashtirildi ("bo ʻ yicha" kabi boʻshliqlar chiqardi).
- **Asosiy mavzu qorongʻi.** `index.html` dagi inline skript `localStorage` dan mavzuni oʻqib, React yuklanishidan oldin `data-theme` ni qoʻyadi, shuning uchun yorugʻ mavzu "miltillab" ketmaydi.

---

## 6. Topilgan va tuzatilgan xatolar

1. **TS2882** `Cannot find module or type declarations for side-effect import of './styles.css'`.
   - Sabab: VS Code yangi TypeScript bilan ishlaydi, unda `noUncheckedSideEffectImports` sukut boʻyicha yoqilgan. Loyihada esa `vite/client` tiplari ulanmagan edi.
   - Yechim: `src/vite-env.d.ts`.
2. **`Uncaught TypeError: destroy is not a function`**, ilova qora ekran boʻlib qolgan.
   - Sabab: `useEffect(() => window.scrollTo(...))` qisqa shaklda yozilgan edi. Chrome'da `scrollTo` Promise qaytaradi va React uni cleanup deb chaqirmoqchi boʻladi.
   - Yechim: effekt tanasi `{}` ichiga olindi.
3. **Mobil toshib chiqish:** `.subbar` ning `flex-wrap: wrap` qoidasi va qism tanlagichi select'ining `min-width` qiymati sahifani 436–624px gacha kengaytirardi.
4. **`<td className="head">`** global `.head { display: flex }` qoidasi bilan toʻqnashdi, natijada `colSpan` ishlamay "Jami" qatori surilib ketdi.
   - Yechim: klass `cardhead` ga oʻzgartirildi.
5. **Jadval sarlavhalari** `text-transform: uppercase` tufayli `f(i)` → `F(I)` boʻlib ketardi.
   - Yechim: `table.math` uchun bu oʻchirildi.
6. **Grafik oʻqida** "0" va "−5 mln" ustma-ust tushardi. Yechim: pastki belgi faqat yetarli masofa boʻlsa chiziladi.
7. **Tarjima xatolari:** "Замена каждые год" → "каждый год", "Har 1 yilda" → "Har yili".
   Toʻr izohi kursorga bogʻliq boʻlmagan matnga almashtirildi, chunki telefonda kursor yoʻq.

## 7. Tekshiruv usullari

- Har bosqichdan keyin `tsc -p . --noEmit`, `vitest run` (6/6 test) va `vite build` ishga tushirildi. Hammasi xatosiz.
- Vizual tekshiruv headless Chrome orqali qilindi. Chrome DevTools Protocol bilan telefon emulyatsiyasi: 320, 375, 768, 1280 va 1600px; uz/ru; light/dark.
  Skript har bir sahifa uchun quyidagilarni avtomatik oʻlchadi:
  - viewport'dan chiqib ketgan elementlar;
  - 40px dan kichik tugmalar;
  - 16px dan kichik inputlar;
  - grafiklardagi haqiqiy shrift oʻlchami.
- Ranglar kontrastini WCAG formulasi bilan hisoblaydigan skript ishlatildi. 5 ta palitra namunasi sahifasi ham shu skript bilan yasaldi.
- Bu yordamchi skriptlar (`mcheck.mjs`, `palettes.mjs`, `samples-check.mjs`) **loyihaga kirmaydi**, Claude Code'ning vaqtinchalik papkasida qolgan.
- **Haqiqiy iPhone yoki Android qurilmada sinalmagan.** Animatsiyalar harakatda koʻrilmagan, faqat statik skrinshotlar olingan.

## 8. Maʼlum cheklovlar va ochiq masalalar

- **`$` tanlovi** konvertatsiya qilmaydi, faqat yorliq. Kerak boʻlsa kursli konvertatsiya qoʻshish mumkin.
- **Namunaviy narxlar** taxminiy. Kurs 11 800 soʻm (2026-yil sentabr) — `samples.ts` dagi `USD_UZS` da bitta raqam.
- **c(i, j) jadvali** N > ~11 yoki telefonda gorizontal suriladi (birinchi ustun qotgan holda).
- **SVG `<title>` tooltip'lari** sensorli ekranda chiqmaydi.
- **View Transitions** faqat qoʻllaydigan brauzerlarda ishlaydi, boshqalarida oddiy almashinuv.
- **Testlar** faqat `model.ts` ni qamraydi. UI uchun avtomatik test yoʻq.
- **`localStorage` kalitlari** `v3` ga koʻtarilgan. Eski `v1`/`v2` maʼlumotlar brauzerda qoladi, lekin oʻqilmaydi.
- **`THEME_BG`** (`App.tsx`) `--bg` bilan qoʻlda bir xil saqlanishi kerak.

## 9. Kelgusi ish uchun koʻrsatmalar

- **Yangi matn:** kalitni `src/i18n/uz.ts` ga, keyin `ru.ts` ga qoʻshing, komponentda `const t = useT(); t.kalit` deb ishlating.
- **Yangi sahifa:**
  1. `App.tsx` dagi `SECTIONS` ga `{ path, label }` qoʻshing (label — lugʻat kaliti);
  2. `renderPage()` da render qiling;
  3. kerak boʻlsa `PartView`/`SummaryView` tipini kengaytiring.
- **Rangni oʻzgartirish:** faqat `styles.css` boshidagi uchta token blokida, qorongʻi blok ikki marta takrorlangan. Fon oʻzgarsa, `App.tsx` dagi `THEME_BG` ni ham yangilang.
- **Telefon uslublari** `styles.css` dagi `/* ---------- Telefon (≤760px) */` blokida.
- **Grafik qoʻshish:** `useElementWidth()` dan foydalaning va `viewBox` ni oʻlchangan kenglikda chizing.
- **Saqlash formati** oʻzgarsa, `usePersistentState` kalitining versiyasini oshiring (`…:v4`).
