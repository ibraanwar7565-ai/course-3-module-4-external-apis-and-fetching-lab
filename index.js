// index.js
const weatherApi = "https://api.weather.gov/alerts/active?area=";

async function fetchWeatherData(city) {
  const errorDiv = document.getElementById("error-message");
  const alertsDisplay = document.getElementById("alerts-display");

  errorDiv.classList.add("hidden");
  errorDiv.textContent = "";
  alertsDisplay.innerHTML = "";

  try {
    const response = await fetch(weatherApi + city);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    displayError(error.message);
  }
}

function displayWeather(data) {
  const alertsDisplay = document.getElementById("alerts-display");
  const errorDiv = document.getElementById("error-message");

  errorDiv.classList.add("hidden");
  errorDiv.textContent = "";

  if (!data.features || data.features.length === 0) {
    alertsDisplay.textContent = "No active weather alerts for this area.";
    return;
  }

  const count = data.features.length;
  const headlines = data.features
    .map((feature) => {
      const headline = (feature.properties && feature.properties.headline)
        || feature.headline
        || "Unknown Alert";
      return `<p>${headline}</p>`;
    })
    .join("");

  alertsDisplay.innerHTML = `<p>Weather Alerts: ${count}</p>${headlines}`;
}

function displayError(message) {
  const errorDiv = document.getElementById("error-message");
  const alertsDisplay = document.getElementById("alerts-display");

  errorDiv.classList.remove("hidden");
  errorDiv.textContent = message;
  alertsDisplay.innerHTML = "";
}

// Use event delegation on document so the listener survives DOM resets in tests
document.addEventListener("click", (event) => {
  if (event.target && event.target.id === "fetch-weather") {
    const input = document.getElementById("city-input");
    const city = input.value.trim();
    input.value = "";
    if (city) {
      fetchWeatherData(city);
    }
  }
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { fetchWeatherData, displayWeather, displayError };
}
