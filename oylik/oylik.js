const $ = (selector) => document.querySelector(selector);

const monthTimes = $("#month-times");
const citySelect = $("#region");
const monthSelect = $("#month");

const regions = [
  "Toshkent", "Farg'ona", "Samarqand", "Xorazm", "Navoiy",
  "Qashqadaryo", "Surxondaryo", "Andijon", "Namangan",
  "Jizzax", "Buxoro", "Sirdaryo"
];

// Regionlarni select elementiga joylash
function renderRegions() {
  regions.forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    citySelect.appendChild(option);
  });
}

// API orqali oylik namoz vaqtlarini olish
async function fetchMonthlyPrayerTimes(region, month) {
  const url = `https://islomapi.uz/api/monthly?region=${encodeURIComponent(region)}&month=${month}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("API javobi xato");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Xatolik:", error);
    return null;
  }
}

// Jadvalga ma'lumot chiqarish
function displayMonthlyPrayerTimes(data) {
  if (!data || data.length === 0) {
    monthTimes.innerHTML = "<tr><td colspan='7'>Ma'lumot topilmadi.</td></tr>";
    return;
  }

  let html = "";
  data.forEach((item, index) => {
    html += `
      <tr>
        <td>${index + 1}</td>
        <td>${item.times.tong_saharlik}</td>
        <td>${item.times.quyosh}</td>
        <td>${item.times.peshin}</td>
        <td>${item.times.asr}</td>
        <td>${item.times.shom_iftor}</td>
        <td>${item.times.hufton}</td>
      </tr>
    `;
  });

  monthTimes.innerHTML = html;
}

// Tanlangan region va oy bo‘yicha ma'lumotni yangilash
async function updateMonthlyPrayerTimes() {
  const region = citySelect.value;
  const month = monthSelect.value;

  if (!region || !month) return;

  monthTimes.innerHTML = "<tr><td colspan='7'>Yuklanmoqda...</td></tr>";

  const data = await fetchMonthlyPrayerTimes(region, month);
  displayMonthlyPrayerTimes(data);
}

// Dastlab sahifa yuklanganda
window.addEventListener("DOMContentLoaded", () => {
  renderRegions();

  // Dastlabki qiymatlar
  const currentMonth = new Date().getMonth() + 1; // 1-indexed
  monthSelect.value = currentMonth;

  citySelect.selectedIndex = 0;
  updateMonthlyPrayerTimes();

  citySelect.addEventListener("change", updateMonthlyPrayerTimes);
  monthSelect.addEventListener("change", updateMonthlyPrayerTimes);
});
