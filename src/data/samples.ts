/**
 * NAMUNAVIY ma'lumotlar (so'mda). Bular klinika ma'lumotlari EMAS —
 * dasturni ko'rsatish uchun tuzilgan taxminiy qiymatlar: dollardagi bozor
 * narxlari USD_UZS kursi bo'yicha so'mga o'girilgan. Haqiqiy ma'lumot
 * olinganda dasturning o'zida katakchalarga yoziladi yoki shu fayl yangilanadi.
 *
 * Mo'ljal: o'rta sinf stomatologik CBCT apparati (~$60 000, yangi apparatlar
 * bozorda taxminan $30 000–150 000). Qismlar narxi apparat narxidan ancha past
 * (jami ~$25 000), har yili ~2–3% qimmatlashadi; ta'mir xarajati yosh bilan tez o'sadi.
 * Rentgen naychasi odatda 5–7 yil, detektor 10 yil va undan ko'p ishlaydi.
 *
 * P — i-yil boshida yangi qism narxi
 * V — k yil ishlatilgandagi qoldiq qiymat
 * R — ketma-ket k yil ishlatishdagi JAMI (yig'ma) ta'mir xarajati
 * td — nosozlikda apparat bekor turadigan kunlar (kengaytirilgan rejim uchun)
 */
export interface SampleSource {
  name: string;
  nameRu: string;
  N: number;
  P: number[];
  V: number[];
  R: number[];
  td: number;
  /** Apparat bekor turgan 1 kundagi yo'qotish */
  Cd: number;
  test?: boolean;
}

/** Namunalarni tuzishda ishlatilgan kurs: 1 AQSh dollari ≈ 11 800 so'm (Markaziy bank, 2026-yil sentabr) */
export const USD_UZS = 11_800;
const som = (a: number[]) => a.map((x) => Math.round((x * USD_UZS) / 10_000) * 10_000);
// Bekor turish yo'qotishi: kuniga ~$150 (bir necha tekshiruvdan tushmagan daromad)
const fromUsd = (s: Omit<SampleSource, "Cd">): SampleSource => ({ ...s, P: som(s.P), V: som(s.V), R: som(s.R), Cd: 150 * USD_UZS });

// Qiymatlar dollarda yozilgan, fromUsd ularni so'mga o'giradi
export const SAMPLE_PARTS: SampleSource[] = [
  fromUsd({ name: "Rentgen naychasi", nameRu: "Рентгеновская трубка", N: 10, P: [5500, 5650, 5800, 5950, 6100, 6250, 6400, 6550, 6700, 6850], V: [2200, 1500, 1000, 650, 400, 250, 150, 100, 50, 0], R: [150, 350, 650, 1100, 1800, 2800, 4200, 6100, 8600, 11800], td: 7 }),
  fromUsd({ name: "Detektor (flat-panel)", nameRu: "Детектор (плоскопанельный)", N: 10, P: [12000, 12300, 12600, 12900, 13200, 13500, 13800, 14100, 14400, 14700], V: [6000, 4500, 3400, 2600, 2000, 1500, 1100, 800, 600, 400], R: [100, 250, 500, 900, 1500, 2400, 3700, 5500, 7900, 11000], td: 10 }),
  fromUsd({ name: "Aylanish mexanizmi va podshipniklar", nameRu: "Механизм вращения и подшипники", N: 8, P: [900, 920, 950, 970, 1000, 1020, 1050, 1080], V: [450, 320, 220, 150, 100, 70, 50, 30], R: [40, 100, 190, 320, 500, 750, 1090, 1540], td: 4 }),
  fromUsd({ name: "Elektr dvigateli", nameRu: "Электродвигатель", N: 8, P: [650, 670, 690, 710, 730, 750, 770, 790], V: [320, 230, 160, 110, 80, 50, 40, 30], R: [30, 75, 145, 245, 385, 575, 835, 1185], td: 3 }),
  fromUsd({ name: "Elektron plata va quvvat manbai", nameRu: "Электронная плата и блок питания", N: 10, P: [2400, 2450, 2500, 2550, 2600, 2650, 2700, 2750, 2800, 2850], V: [1200, 850, 600, 420, 300, 200, 150, 100, 70, 50], R: [60, 150, 290, 500, 800, 1220, 1800, 2590, 3640, 5020], td: 5 }),
  fromUsd({ name: "Kolimator va nur cheklash mexanizmi", nameRu: "Коллиматор и механизм ограничения пучка", N: 8, P: [1200, 1230, 1260, 1290, 1320, 1350, 1380, 1410], V: [650, 470, 340, 250, 180, 130, 90, 60], R: [40, 100, 190, 320, 510, 780, 1160, 1680], td: 3 }),
  fromUsd({ name: "Pozitsiyalash sensorlari", nameRu: "Датчики позиционирования", N: 6, P: [300, 310, 320, 330, 340, 350], V: [140, 90, 55, 35, 20, 10], R: [20, 50, 95, 160, 255, 390], td: 2 }),
  fromUsd({ name: "Sovutish tizimi", nameRu: "Система охлаждения", N: 6, P: [450, 460, 475, 490, 500, 515], V: [220, 140, 90, 55, 35, 20], R: [25, 70, 150, 290, 520, 880], td: 2 }),
  fromUsd({ name: "Kabellar va ulagichlar", nameRu: "Кабели и разъёмы", N: 6, P: [250, 255, 260, 270, 275, 280], V: [100, 60, 35, 20, 10, 5], R: [15, 45, 105, 215, 395, 675], td: 1 }),
  fromUsd({ name: "Kompyuter va tasvirni qayta ishlash tizimi", nameRu: "Компьютер и система обработки изображений", N: 7, P: [1800, 1800, 1750, 1750, 1700, 1700, 1650], V: [1000, 650, 400, 250, 150, 80, 40], R: [60, 170, 350, 630, 1050, 1670, 2570], td: 2 }),
];

/** Darslik (BMI namunasi) misoli — algoritmni tekshirish uchun. Kutilgan javob: 335, yo'l 0 → 2 → 6 → 10. */
export const TEST_PART: SampleSource = {
  name: "Tekshiruv: darslik misoli (javob 335)",
  nameRu: "Проверка: пример из учебника (ответ 335)",
  N: 10,
  P: [115, 120, 125, 130, 135, 140, 150, 155, 165, 170],
  V: [85, 80, 65, 55, 50, 40, 35, 20, 5, 0],
  R: [20, 25, 40, 55, 100, 140, 170, 240, 280, 370],
  td: 1,
  Cd: 10,
  test: true,
};
