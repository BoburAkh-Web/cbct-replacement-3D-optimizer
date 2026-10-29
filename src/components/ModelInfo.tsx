import { useT } from "../i18n";
import { USD_UZS } from "../data/samples";
import { fmt } from "../lib/format";

/* Formulalar ikkala tilda bir xil */
const segFormula = <div className="formula">c(i, j) = P<sub>i+1</sub> + R<sub>j−i</sub> − V<sub>j−i</sub>, &nbsp;&nbsp; 0 ≤ i &lt; j ≤ N</div>;
const bellmanFormula = <div className="formula">f(N) = 0, &nbsp;&nbsp; f(i) = min<sub>i&lt;j≤N</sub> {"{"} c(i, j) + f(j) {"}"}, &nbsp;&nbsp; i = N−1, N−2, …, 0</div>;
const riskFormula = <div className="formula">R<sub>k</sub> = Σ<sub>m=1..k</sub> [ r<sub>m</sub> + P<sub>f</sub>(m) · (C<sub>f</sub> + C<sub>d</sub> · t<sub>d</sub>) ]</div>;

/* Namunaviy ma'lumotlar manbalari (samples.ts dagi baholash shularga tayanadi); nomlari lug'atda */
const SOURCES = [
  { key: "srcFda", url: "https://fda.innolitics.com/device/K242805" },
  { key: "srcCatalog", url: "https://goldident.ru/upload/iblock/c75/4g4338g927gteraacpw8qt03xqlqsoey/FinScan-F350-Catalog-ENG_compressed.pdf" },
  { key: "srcTube", url: "https://www.dentalti.com/post/how-much-does-a-cbct-machine-cost-a-buyer-s-guide-for-dental-practices" },
  { key: "srcDetector", url: "https://www.intraoralscanners.cn/cbct-machine-cost/" },
  { key: "srcService", url: "https://biologyinsights.com/how-much-does-a-cbct-machine-actually-cost/" },
  { key: "srcContract", url: "https://www.duraprohealth.com/blog/dental-news-1/2025-dental-cbct-costs-what-you-need-to-know-before-buying-530" },
  { key: "srcLifetime", url: "https://www.umymedical.com/the-ultimate-dental-cbct-machine-buying-guide-costs-fov-specs-roi/" },
] as const;

export default function ModelInfo() {
  const t = useT();
  return (
    <>
      {t.lang === "ru" ? <ModelRu /> : <ModelUz />}
      <DataSources />
    </>
  );
}

function DataSources() {
  const t = useT();
  return (
    <div className="card prose">
      <h2>{t.srcTitle}</h2>
      <p>{t.srcDevice}</p>
      <h3>{t.srcMethodTitle}</h3>
      <ul>
        <li>{t.srcM1}</li>
        <li>{t.srcM2}</li>
        <li>{t.srcM3}</li>
        <li>{t.srcM4(fmt(USD_UZS))}</li>
      </ul>
      <p className="note">{t.srcWarn}</p>
      <h3>{t.srcListTitle}</h3>
      <ol className="sources">
        {SOURCES.map((s) => (
          <li key={s.url}>
            <a className="link" href={s.url} target="_blank" rel="noopener">
              {t[s.key]}
            </a>
            <small>{new URL(s.url).hostname.replace(/^www\./, "")}</small>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ModelUz() {
  return (
    <div className="card prose">
      <h2>Masalaning qoʻyilishi</h2>
      <p>
        Reja davri N yil. Har yil boshida qism boʻyicha ikki qarordan biri qabul qilinadi: eski qismni taʼmirlab ishlatishda davom etish yoki uni yangisiga almashtirish.
        Reja davri oxirida qism qoldiq qiymatida hisobdan chiqariladi. Maqsad — reja davridagi umumiy xarajatni minimallashtiruvchi almashtirish yillarini topish.
      </p>

      <h3>Belgilashlar</h3>
      <ul>
        <li><b>P<sub>i</sub></b> — i-yil boshida yangi qismning xarid narxi;</li>
        <li><b>V<sub>k</sub></b> — k yil ishlatilgan qismning qoldiq (sotish) qiymati;</li>
        <li><b>R<sub>k</sub></b> — yangi qismni ketma-ket k yil ishlatish uchun jami taʼmirlash va xizmat xarajati (yigʻma qiymat).</li>
      </ul>

      <h3>1-qadam. Segment xarajatlari</h3>
      <p>i-yil oxirida (i+1-yil boshida) olingan qism j-yil oxirigacha, yaʼni k = j − i yil ishlatilsa:</p>
      {segFormula}

      <h3>2-qadam. Bellman tenglamasi (atsiklik toʻrda eng qisqa yoʻl)</h3>
      {bellmanFormula}
      <p>
        f(0) — minimal umumiy xarajat. Har bir i uchun minimumni bergan j lar saqlanadi; 0 dan boshlab ular boʻyicha yurilsa optimal yoʻl (masalan, 0 → 2 → 6 → 10) hosil boʻladi.
        Yoʻldagi oraliq tugunlar — qism almashtiriladigan yillar.
      </p>

      <h3>Kengaytma: nosozlik xavfini hisobga olish</h3>
      <p>Klassik modelda R<sub>k</sub> toʻgʻridan-toʻgʻri beriladi. Dasturda uni nosozlik ehtimoli va apparat bekor turishining iqtisodiy yoʻqotishi orqali hisoblash imkoniyati ham bor:</p>
      {riskFormula}
      <p>
        bu yerda r<sub>m</sub> — m-yildagi rejali xizmat xarajati, P<sub>f</sub>(m) — m-yilda nosozlik ehtimoli, C<sub>f</sub> — nosozlikni bartaraf etish xarajati,
        C<sub>d</sub> — apparat bekor turgan bir kundagi yoʻqotish, t<sub>d</sub> — taʼmir davomida bekor turish kunlari.
      </p>

      <h3>Koʻp komponentli yondashuv</h3>
      <p>
        CBCT apparati yagona jihoz emas, eskirish surʼati va narxi har xil boʻlgan qismlardan iborat. Shuning uchun masala har bir qism uchun alohida, oʻz reja davri bilan
        yechiladi va natijalar apparat boʻyicha umumiy yillik xarajat jadvaliga birlashtiriladi.
      </p>
    </div>
  );
}

function ModelRu() {
  return (
    <div className="card prose">
      <h2>Постановка задачи</h2>
      <p>
        Плановый период — N лет. В начале каждого года по узлу принимается одно из двух решений: продолжить эксплуатацию старого узла с ремонтом или заменить его новым.
        В конце планового периода узел списывается по остаточной стоимости. Цель — найти годы замены, минимизирующие суммарные затраты за плановый период.
      </p>

      <h3>Обозначения</h3>
      <ul>
        <li><b>P<sub>i</sub></b> — цена покупки нового узла в начале i-го года;</li>
        <li><b>V<sub>k</sub></b> — остаточная (продажная) стоимость узла, проработавшего k лет;</li>
        <li><b>R<sub>k</sub></b> — суммарные затраты на ремонт и обслуживание нового узла за k лет непрерывной работы (нарастающим итогом).</li>
      </ul>

      <h3>Шаг 1. Затраты сегментов</h3>
      <p>Если узел, купленный в конце i-го года (в начале (i+1)-го), работает до конца j-го года, то есть k = j − i лет:</p>
      {segFormula}

      <h3>Шаг 2. Уравнение Беллмана (кратчайший путь в ациклической сети)</h3>
      {bellmanFormula}
      <p>
        f(0) — минимальные суммарные затраты. Для каждого i сохраняются значения j, дающие минимум; проходя по ним от 0, получаем оптимальный путь (например, 0 → 2 → 6 → 10).
        Промежуточные вершины пути — годы замены узла.
      </p>

      <h3>Расширение: учёт риска отказа</h3>
      <p>В классической модели R<sub>k</sub> задаётся напрямую. Программа позволяет также рассчитать его через вероятность отказа и экономические потери от простоя аппарата:</p>
      {riskFormula}
      <p>
        где r<sub>m</sub> — плановые затраты на обслуживание в m-м году, P<sub>f</sub>(m) — вероятность отказа в m-м году, C<sub>f</sub> — затраты на устранение отказа,
        C<sub>d</sub> — потери за один день простоя аппарата, t<sub>d</sub> — число дней простоя на время ремонта.
      </p>

      <h3>Многокомпонентный подход</h3>
      <p>
        Аппарат КЛКТ (CBCT) — не единое устройство, а набор узлов с разной скоростью износа и стоимостью. Поэтому задача решается для каждого узла отдельно, со своим плановым
        периодом, а результаты объединяются в общую таблицу годовых затрат по аппарату.
      </p>
    </div>
  );
}
