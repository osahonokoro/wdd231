// ===============================
// Footer: Year and Last Modified
// ===============================
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("lastModified").textContent = document.lastModified;

document.addEventListener("DOMContentLoaded", () => {
  const ts = document.getElementById("timestamp");
  if (ts) ts.value = new Date().toISOString();
});

// ===============================
// Weather Section (Calabar)
// ===============================
const lat = 4.95;
const lon = 8.33;
const apiKey = "04e4508e4b94fcc5631b8a32bdb0b8cb";
const weatherURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

async function getWeather() {
  try {
    const response = await fetch(weatherURL);
    const data = await response.json();

    const currentTemp = data.list[0].main.temp.toFixed(1);
    const description = data.list[0].weather[0].description;
    const icon = data.list[0].weather[0].icon;

    document.getElementById("current-weather").innerHTML = `
      <p><strong>${currentTemp}°C</strong> - ${description}</p>
      <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
    `;

    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    const forecastDays = data.list.filter((item, index) => index % 8 === 0).slice(1, 4);

    forecastDays.forEach(day => {
      const date = new Date(day.dt_txt).toDateString();
      const temp = day.main.temp.toFixed(1);
      const desc = day.weather[0].description;
      const icon = day.weather[0].icon;

      forecastContainer.innerHTML += `
        <div class="forecast-day">
          <p><strong>${date}</strong></p>
          <p>${temp}°C - ${desc}</p>
          <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}">
        </div>
      `;
    });
  } catch (error) {
    console.error("Weather data error:", error);
    document.getElementById("current-weather").textContent = "Unable to load weather data.";
  }
}
getWeather();

// ===============================
// Member Spotlights Section
// ===============================
async function loadSpotlights() {
  try {
    const response = await fetch("data/members.json");
    const members = await response.json();

    const spotlightMembers = members.filter(m => m.level === "Gold" || m.level === "Silver");
    const selected = spotlightMembers.sort(() => 0.5 - Math.random()).slice(0, 3);

    const container = document.getElementById("spotlight-container");
    container.innerHTML = selected.map(member => `
      <div class="card">
        <img src="images/${member.logo}" alt="${member.name} Logo">
        <h3>${member.name}</h3>
        <p>${member.phone}</p>
        <p>${member.address}</p>
        <a href="${member.website}" target="_blank">Visit Website</a>
        <p>Membership: ${member.level}</p>
      </div>
    `).join("");
  } catch (error) {
    console.error("Spotlight data error:", error);
    document.getElementById("spotlight-container").textContent = "Unable to load member spotlights.";
  }
}
loadSpotlights();

//