/**
 * NAMUNAVIY ma'lumotlar (so'mda). Bular klinika ma'lumotlari EMAS —
 * dasturni ko'rsatish uchun tuzilgan taxminiy qiymatlar: dollardagi bozor
 * narxlari USD_UZS kursi bo'yicha so'mga o'girilgan. Haqiqiy ma'lumot
 * olinganda dasturning o'zida katakchalarga yoziladi yoki shu fayl yangilanadi.
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

/** Namunalarni tuzishda ishlatilgan kurs: 1 AQSh dollari = 12 800 so'm */
export const USD_UZS = 12_800;
const som = (a: number[]) => a.map((x) => Math.round((x * USD_UZS) / 10_000) * 10_000);
const fromUsd = (s: Omit<SampleSource, "Cd">): SampleSource => ({ ...s, P: som(s.P), V: som(s.V), R: som(s.R), Cd: 150 * USD_UZS });

// Qiymatlar dollarda yozilgan, fromUsd ularni so'mga o'giradi
export const SAMPLE_PARTS: SampleSource[] = [
  fromUsd({ name: "Rentgen naychasi", nameRu: "Рентгеновская трубка", N: 10, P: [9000, 9250, 9550, 9850, 10150, 10450, 10750, 11050, 11400, 11750], V: [5600, 4000, 2900, 2100, 1500, 1100, 800, 550, 400, 300], R: [300, 750, 1350, 2300, 3600, 5550, 8300, 12350, 18200, 26700], td: 7 }),
  fromUsd({ name: "Detektor (flat-panel)", nameRu: "Детектор (плоскопанельный)", N: 10, P: [16000, 16300, 16650, 17000, 17300, 17650, 18000, 18400, 18750, 19100], V: [11200, 8950, 7150, 5750, 4600, 3650, 2950, 2350, 1900, 1500], R: [350, 900, 1650, 2850, 4600, 7250, 11250, 17250, 26200, 39650], td: 10 }),
  fromUsd({ name: "Aylanish mexanizmi va podshipniklar", nameRu: "Механизм вращения и подшипники", N: 8, P: [1400, 1450, 1500, 1550, 1600, 1600, 1650, 1700], V: [750, 550, 400, 250, 200, 150, 100, 50], R: [100, 200, 400, 650, 1000, 1450, 2150, 3100], td: 4 }),
  fromUsd({ name: "Elektr dvigateli", nameRu: "Электродвигатель", N: 8, P: [1100, 1150, 1150, 1200, 1250, 1300, 1300, 1350], V: [600, 450, 300, 250, 150, 100, 100, 50], R: [50, 150, 250, 450, 700, 1050, 1500, 2200], td: 3 }),
  fromUsd({ name: "Elektron plata va quvvat manbai", nameRu: "Электронная плата и блок питания", N: 10, P: [2600, 2650, 2700, 2750, 2800, 2850, 2950, 3000, 3050, 3100], V: [1550, 1150, 900, 650, 500, 350, 300, 200, 150, 100], R: [100, 300, 500, 850, 1300, 1950, 2850, 4150, 5900, 8400], td: 5 }),
  fromUsd({ name: "Kolimator va nur cheklash mexanizmi", nameRu: "Коллиматор и механизм ограничения пучка", N: 8, P: [1800, 1850, 1900, 1950, 2050, 2100, 2150, 2200], V: [1100, 800, 600, 450, 350, 250, 200, 150], R: [100, 200, 350, 600, 900, 1350, 2050, 2950], td: 3 }),
  fromUsd({ name: "Pozitsiyalash sensorlari", nameRu: "Датчики позиционирования", N: 6, P: [450, 465, 475, 490, 505, 520], V: [225, 145, 95, 60, 40, 25], R: [35, 85, 160, 265, 420, 645], td: 2 }),
  fromUsd({ name: "Sovutish tizimi", nameRu: "Система охлаждения", N: 6, P: [700, 720, 745, 765, 790, 810], V: [350, 230, 150, 95, 60, 40], R: [50, 120, 230, 380, 600, 920], td: 2 }),
  fromUsd({ name: "Kabellar va ulagichlar", nameRu: "Кабели и разъёмы", N: 6, P: [320, 330, 340, 350, 360, 370], V: [130, 75, 45, 30, 15, 10], R: [25, 60, 120, 205, 330, 520], td: 1 }),
  fromUsd({ name: "Kompyuter va tasvirni qayta ishlash tizimi", nameRu: "Компьютер и система обработки изображений", N: 7, P: [2200, 2200, 2200, 2200, 2200, 2200, 2200], V: [1200, 750, 450, 300, 200, 100, 50], R: [100, 250, 500, 850, 1300, 2050, 3050], td: 2 }),
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
