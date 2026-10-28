# CBCT xarajat optimizatori

Stomatologik 3D rentgen (CBCT) apparati qismlarini **almashtirish va taʼmirlash strategiyasini** dinamik dasturlash (Bellman) asosida optimallashtiruvchi web-dastur.

Magistrlik dissertatsiyasi: *“Korxonalarda jihozlarni almashtirish va taʼmirlash strategiyalarini optimallashtirishning matematik modeli va dasturiy taʼminoti”*.

## Imkoniyatlar

- Apparatning har bir qismi (rentgen naychasi, detektor, podshipniklar va h.k.) uchun alohida hisob, har biri oʻz reja davri bilan (2–15 yil)
- P / V / R maʼlumotlarini kiritish, natijalar darhol qayta hisoblanadi
- Optimal almashtirish yoʻli va minimal xarajat (teng optimal yoʻllar ham koʻrsatiladi)
- Yillar boʻyicha xarajatlar jadvali va grafigi
- Atsiklik toʻr (DAG), segment xarajatlari c(i, j) va Bellman hisobi jadvallari
- Muntazam (har T yilda) almashtirish va almashtirmaslik bilan solishtirish
- Kengaytma: R ni nosozlik ehtimoli va bekor turish yoʻqotishi orqali hisoblash
- Butun apparat boʻyicha xulosa va yillik xarajatlar matritsasi
- Jadvallarni Excelga nusxalash; asosiy pul birligi — soʻm (namunalar 1 $ ≈ 11 800 soʻm kursida, oʻrta sinf ~$60 000 lik apparat asosida), $ ham tanlanadi
- Interfeys tili: oʻzbekcha va ruscha (appbar dagi UZ / RU)
- Maʼlumotlar brauzerda (localStorage) saqlanadi

## Matematik model

```
c(i, j) = P(i+1) + R(j−i) − V(j−i),        0 ≤ i < j ≤ N
f(N) = 0,   f(i) = min over j>i [ c(i, j) + f(j) ]
Minimal xarajat = f(0)
```

- **P(i)** — i-yil boshida yangi qism narxi
- **V(k)** — k yil ishlatilgan qismning qoldiq qiymati
- **R(k)** — ketma-ket k yil ishlatishdagi **jami (yigʻma)** taʼmir xarajati

Kengaytma: `R(k) = Σ [ r(m) + Pf(m) · (Cf + Cd · td) ]`, m = 1…k.

Algoritm darslik misolida tekshirilgan: natija **335**, yoʻl **0 → 2 → 6 → 10** (`npm test`).

## Texnologiyalar

React 18 · TypeScript · Vite · oddiy CSS (framework yoʻq) · grafiklar qoʻlda SVG · Vitest

## Ishga tushirish

Kerak: [Node.js](https://nodejs.org) 18 yoki undan yangi.

```bash
npm install      # bogʻliqliklarni oʻrnatish (bir marta)
npm run dev      # http://localhost:5173 da ochiladi
npm test         # algoritm testlari
npm run build    # production build → dist/
```

## Loyiha tuzilishi

```
src/
  lib/model.ts          # matematik model (React'ga bogʻliq emas)
  lib/model.test.ts     # testlar (darslik misoli: 335)
  lib/parts.ts          # qism maʼlumotlari, validatsiya, hisobni yigʻish
  lib/format.ts         # sonlarni formatlash, Excelga nusxalash
  data/samples.ts       # NAMUNAVIY maʼlumotlar (klinika maʼlumoti emas)
  hooks/usePersistentState.ts
  components/
    PartPanel.tsx       # qism tanlash, yillar soni, kiritish jadvali
    PartResults.tsx     # koʻrsatkichlar, jadvallar, grafiklar
    Summary.tsx         # apparat boʻyicha xulosa
    ModelInfo.tsx       # formulalar sahifasi
    charts.tsx          # SVG grafiklar
  App.tsx
  styles.css
```

## GitHub va Vercel

```bash
git init
git add .
git commit -m "CBCT xarajat optimizatori: birinchi versiya"
git branch -M main
git remote add origin https://github.com/<username>/cbct-optimizator.git
git push -u origin main
```

Vercel: **Add New → Project → GitHub repo'ni tanlash → Deploy**. Vite avtomatik aniqlanadi (Build: `npm run build`, Output: `dist`), qoʻshimcha sozlash kerak emas.

> Eslatma: `src/data/samples.ts` dagi barcha raqamlar namunaviy. Klinika maʼlumotlari olinganda shu faylni yangilang yoki qiymatlarni dasturning oʻzida kiriting.
