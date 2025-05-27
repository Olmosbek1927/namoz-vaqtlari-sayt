// 12 ta viloyatlar ro‘yxati
const regions = [
  "Toshkent", "Andijon", "Buxoro", "Farg'ona", "Jizzax", "Namangan",
  "Navoiy", "Qashqadaryo", "Samarqand", "Sirdaryo", "Surxondaryo", "Xorazm"
];

// DOM elementlar
const regionSelect = document.getElementById("region");
const todayTable = document.getElementById("today-times");
const cardTimes = document.querySelectorAll(".cards .card .time");

// Select bo‘limini to‘ldirish
regions.forEach(region => {
  const option = document.createElement("option");
  option.value = region;
  option.textContent = region;
  regionSelect.appendChild(option);
});

// Default: Toshkent
regionSelect.value = "Toshkent";
loadPrayerTimes("Toshkent");

// Select o‘zgarganda ishlovchi funksiya
regionSelect.addEventListener("change", () => {
  const selectedRegion = regionSelect.value;
  loadPrayerTimes(selectedRegion);
});

// API orqali ma’lumot yuklash va ko‘rsatish
async function loadPrayerTimes(region) {
  const apiUrl = `https://islomapi.uz/api/present/day?region=${region}`;
  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const times = data.times;

    // Jadvalga joylash
    todayTable.innerHTML = `
      <tr><td>Tong (Saharlik)</td><td>${times.tong_saharlik}</td></tr>
      <tr><td>Quyosh</td><td>${times.quyosh}</td></tr>
      <tr><td>Peshin</td><td>${times.peshin}</td></tr>
      <tr><td>Asr</td><td>${times.asr}</td></tr>
      <tr><td>Shom (Iftor)</td><td>${times.shom_iftor}</td></tr>
      <tr><td>Xufton</td><td>${times.hufton}</td></tr>
    `;

    // Kartochkalarga vaqtlar joylash
    const allTimes = [
      times.tong_saharlik,
      times.quyosh,
      times.peshin,
      times.asr,
      times.shom_iftor,
      times.hufton
    ];
    cardTimes.forEach((el, i) => {
      el.textContent = allTimes[i];
    });

  } catch (err) {
    todayTable.innerHTML = `<tr><td colspan="2">Xatolik yuz berdi. Qayta urinib ko‘ring.</td></tr>`;
    cardTimes.forEach(el => el.textContent = "--:--");
    console.error("API dan ma'lumot olishda xatolik:", err);
  }
}
