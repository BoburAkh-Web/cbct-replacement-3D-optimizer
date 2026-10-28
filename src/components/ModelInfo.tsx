export default function ModelInfo() {
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
      <div className="formula">c(i, j) = P<sub>i+1</sub> + R<sub>j−i</sub> − V<sub>j−i</sub>, &nbsp;&nbsp; 0 ≤ i &lt; j ≤ N</div>

      <h3>2-qadam. Bellman tenglamasi (atsiklik toʻrda eng qisqa yoʻl)</h3>
      <div className="formula">f(N) = 0, &nbsp;&nbsp; f(i) = min<sub>i&lt;j≤N</sub> {"{"} c(i, j) + f(j) {"}"}, &nbsp;&nbsp; i = N−1, N−2, …, 0</div>
      <p>
        f(0) — minimal umumiy xarajat. Har bir i uchun minimumni bergan j lar saqlanadi; 0 dan boshlab ular boʻyicha yurilsa optimal yoʻl (masalan, 0 → 2 → 6 → 10) hosil boʻladi.
        Yoʻldagi oraliq tugunlar — qism almashtiriladigan yillar.
      </p>

      <h3>Kengaytma: nosozlik xavfini hisobga olish</h3>
      <p>Klassik modelda R<sub>k</sub> toʻgʻridan-toʻgʻri beriladi. Dasturda uni nosozlik ehtimoli va apparat bekor turishining iqtisodiy yoʻqotishi orqali hisoblash imkoniyati ham bor:</p>
      <div className="formula">R<sub>k</sub> = Σ<sub>m=1..k</sub> [ r<sub>m</sub> + P<sub>f</sub>(m) · (C<sub>f</sub> + C<sub>d</sub> · t<sub>d</sub>) ]</div>
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
