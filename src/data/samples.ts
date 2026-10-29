/**
 * NAMUNAVIY ma'lumotlar (so'mda) — klinikadagi real apparat asosida BAHOLANGAN qiymatlar.
 * Apparat: Eighteeth FinScan F350 (Changzhou Finno Medical, FDA 510(k) K242805),
 * ichida Canon rentgen naychasi va CsI + TFT flat-panel detektor. 35 000 $ ga yangi olingan,
 * shuning uchun hisob har bir qism uchun "yangi qism" holatidan boshlanadi.
 *
 * Qiymatlar qanday tuzilgan:
 *  - Asos: apparat narxi 35 000 $. Qism narxlari bozor ma'lumotlaridagi ulushlar bo'yicha baholangan:
 *    naycha bloki ~17%, detektor ~28%, qolganlari 1–6%. Qismlar jami ~24 250 $ (~69%).
 *  - P — yiliga 2,5% oshadi.
 *  - V — qism turiga qarab eksponensial pasayadi.
 *  - R — yig'ma qiymat. Birinchi 2 yil kafolat davri deb olingan (faqat rejali xizmat),
 *    keyin yillik ta'mir har yili 38–60% ga o'sadi.
 *  - Bu qiymatlar ochiq manbalar asosidagi baholash, ishlab chiqaruvchining rasmiy narx ro'yxati emas.
 *    Manbalar ro'yxati "Matematik model" sahifasida (ModelInfo → DataSources).
 * Dollardagi qiymatlar USD_UZS kursi bo'yicha so'mga o'giriladi. Haqiqiy ma'lumot olinganda
 * dasturning o'zida katakchalarga yoziladi yoki shu fayl yangilanadi.
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
  fromUsd({ name: "Rentgen naychasi", nameRu: "Рентгеновская трубка", N: 10, P: [6000, 6150, 6300, 6450, 6600, 6800, 6950, 7150, 7300, 7500], V: [3600, 2590, 1865, 1345, 965, 695, 500, 360, 260, 185], R: [60, 120, 370, 745, 1310, 2150, 3415, 5315, 8165, 12435], td: 7 }),
  fromUsd({ name: "Detektor (flat-panel)", nameRu: "Детектор (плоскопанельный)", N: 10, P: [10000, 10250, 10500, 10750, 11050, 11300, 11600, 11900, 12200, 12500], V: [6500, 5200, 4160, 3330, 2660, 2130, 1705, 1365, 1090, 870], R: [80, 160, 410, 755, 1230, 1890, 2795, 4045, 5775, 8155], td: 10 }),
  fromUsd({ name: "Aylanish mexanizmi va podshipniklar", nameRu: "Механизм вращения и подшипники", N: 8, P: [1400, 1450, 1450, 1500, 1550, 1600, 1600, 1650], V: [770, 540, 375, 265, 185, 130, 90, 65], R: [30, 60, 150, 280, 470, 745, 1140, 1720], td: 4 }),
  fromUsd({ name: "Elektr dvigateli", nameRu: "Электродвигатель", N: 8, P: [900, 920, 950, 970, 990, 1000, 1050, 1050], V: [495, 355, 255, 185, 135, 95, 70, 50], R: [20, 40, 100, 185, 315, 495, 760, 1145], td: 3 }),
  fromUsd({ name: "Elektron plata va quvvat manbai", nameRu: "Электронная плата и блок питания", N: 10, P: [2100, 2150, 2200, 2250, 2300, 2400, 2450, 2500, 2550, 2600], V: [1155, 865, 650, 485, 365, 275, 205, 155, 115, 85], R: [30, 60, 170, 325, 550, 865, 1310, 1945, 2845, 4130], td: 5 }),
  fromUsd({ name: "Kolimator va nur cheklash mexanizmi", nameRu: "Коллиматор и механизм ограничения пучка", N: 8, P: [1000, 1000, 1050, 1100, 1100, 1150, 1150, 1200], V: [600, 450, 340, 255, 190, 140, 105, 80], R: [20, 40, 100, 185, 315, 495, 760, 1145], td: 3 }),
  fromUsd({ name: "Pozitsiyalash sensorlari va lazer", nameRu: "Датчики позиционирования и лазер", N: 6, P: [350, 360, 370, 380, 390, 400], V: [175, 115, 75, 50, 30, 20], R: [10, 20, 50, 95, 160, 265], td: 2 }),
  fromUsd({ name: "Sovutish tizimi", nameRu: "Система охлаждения", N: 6, P: [400, 410, 420, 430, 440, 450], V: [200, 130, 85, 55, 35, 25], R: [15, 30, 70, 130, 220, 355], td: 2 }),
  fromUsd({ name: "Kabellar va ulagichlar", nameRu: "Кабели и разъёмы", N: 6, P: [300, 310, 320, 320, 330, 340], V: [120, 70, 45, 25, 15, 10], R: [10, 20, 50, 95, 160, 265], td: 1 }),
  fromUsd({ name: "Kompyuter (ishchi stansiya)", nameRu: "Компьютер (рабочая станция)", N: 7, P: [1800, 1850, 1900, 1950, 2000, 2050, 2100], V: [990, 615, 380, 235, 145, 90, 55], R: [40, 80, 230, 470, 855, 1470, 2450], td: 2 }),
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
