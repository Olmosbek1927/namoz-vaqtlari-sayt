const $ = (selector) => document.querySelector(selector);

const weeklyTimesBody = $("#weekly-times");
const citySelect = $("#region");
const weekRange = $("#week-range");

const regions = [
  "Toshkent", "Farg'ona", "Samarqand", "Xorazm", "Navoiy",
  "Qashqadaryo", "Surxondaryo", "Andijon", "Namangan",
  "Jizzax", "Buxoro", "Sirdaryo"
];

// API orqali haftalik ma'lumotni olish uchun:
// IslomAPI da bevosita haftalik endpoint bo'lmasligi mumkin, shuning uchun 
// 7 kunlik ma'lumotni kunma-kun so‘rab olish lozim.
// Misol uchun, bugungi kundan boshlab 7 kun uchun ma'lumot so‘rash.

function renderRegions() {
  regions.forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    citySelect.appendChild(option);
  });
}

// Sana formatlash uchun yordamchi funksiyalar
function formatDate(date) {
  return date.toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getWeekRange(startDate) {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  return `${startDate.toLocaleDateString('uz-UZ', {day: 'numeric', month: 'short'})} — ${endDate.toLocaleDateString('uz-UZ', {day: 'numeric', month: 'short'})}`;
}

async function fetchPrayerTimesForDate(region, date) {
  // API faqat 'today' va 'tomorrow' kabi endpoints bor, haftalik uchun API dokumentatsiyasiga qarab
  // 7 kunlik ma'lumot olish uchun 7 marta alohida so‘rov jo‘natish kerak bo‘ladi.
  // date formatini yyyy-mm-dd ko‘rinishida beramiz.

  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const dateStr = `${y}-${m}-${d}`;

  const url = `https://islomapi.uz/api/present/day?region=${region}&date=${dateStr}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("API dan javob kelmadi");
    const data = await response.json();
    return data.times;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function updateWeeklyTimes() {
  const region = citySelect.value;
  if (!region) return;

  weeklyTimesBody.innerHTML = "<tr><td colspan='7'>Yuklanmoqda...</td></tr>";

  const today = new Date();
  const startOfWeek = new Date(today);
  // Hafta boshini dushanba qilib olish uchun (agar kerak bo‘lsa)
  const dayOfWeek = today.getDay(); // Yakshanba = 0, Dushanba = 1 ...
  const diffToMonday = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(today.getDate() - diffToMonday);

  // Haftaning sana oraliqini ko‘rsatish
  weekRange.textContent = getWeekRange(startOfWeek);

  let html = "";
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);

    const dayName = currentDate.toLocaleDateString('uz-UZ', { weekday: 'long' });

    const times = await fetchPrayerTimesForDate(region, currentDate);

    if (times) {
      html += `<tr>
        <td>${dayName}, ${currentDate.getDate()}-${currentDate.getMonth() + 1}</td>
        <td>${times.tong_saharlik}</td>
        <td>${times.quyosh}</td>
        <td>${times.peshin}</td>
        <td>${times.asr}</td>
        <td>${times.shom_iftor}</td>
        <td>${times.hufton}</td>
      </tr>`;
    } else {
      html += `<tr>
        <td>${dayName}, ${currentDate.getDate()}-${currentDate.getMonth() + 1}</td>
        <td colspan="6">Ma'lumot yo'q</td>
      </tr>`;
    }
  }

  weeklyTimesBody.innerHTML = html;
}

window.addEventListener("DOMContentLoaded", () => {
  renderRegions();
  citySelect.selectedIndex = 0;
  updateWeeklyTimes();
  citySelect.addEventListener("change", updateWeeklyTimes);
});
