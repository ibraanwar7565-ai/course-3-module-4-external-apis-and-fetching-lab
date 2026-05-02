const BASE_URL = 'https://api.weather.gov/alerts/active';

const VALID_STATES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC','PR','VI','GU','AS','MP'
]);

async function fetchWeatherData(state) {
  if (!state || typeof state !== 'string' || state.trim() === '') {
    displayError('Please enter a state abbreviation.');
    return;
  }

  const stateCode = state.trim().toUpperCase();

  if (stateCode.length !== 2) {
    displayError('Please enter a valid 2-letter state abbreviation (e.g. CA).');
    return;
  }

  if (!VALID_STATES.has(stateCode)) {
    displayError(`"${stateCode}" is not a recognized U.S. state abbreviation.`);
    return;
  }

  const btn = document.getElementById('fetch-btn');
  if (btn) btn.disabled = true;

  try {
    const response = await fetch(`${BASE_URL}?area=${stateCode}`);

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    displayWeather(data);
  } catch (error) {
    displayError(`Failed to fetch weather data: ${error.message}`);
  } finally {
    if (btn) btn.disabled = false;
  }
}

function displayWeather(data) {
  const weatherDisplay = document.getElementById('weather-display');
  const errorDisplay = document.getElementById('error-display');

  errorDisplay.textContent = '';

  if (!data.features || data.features.length === 0) {
    weatherDisplay.innerHTML = '<div class="no-alerts"><p>No active weather alerts for this state.</p></div>';
    return;
  }

  const alertsHTML = data.features.map((feature) => {
    const props = feature.properties || {};
    const severity = (props.severity || '').toLowerCase();
    return `
      <div class="alert-card severity-${severity}">
        <h3>
          ${props.headline || 'Weather Alert'}
          <span class="badge">${props.severity || 'Unknown'}</span>
        </h3>
        <p><strong>Event:</strong> ${props.event || 'N/A'}</p>
        <p><strong>Area:</strong> ${props.areaDesc || 'N/A'}</p>
        <p><strong>Description:</strong> ${props.description || 'N/A'}</p>
      </div>
    `;
  }).join('');

  weatherDisplay.innerHTML = alertsHTML;
}

function displayError(message) {
  const errorDisplay = document.getElementById('error-display');
  const weatherDisplay = document.getElementById('weather-display');

  errorDisplay.textContent = message;
  weatherDisplay.innerHTML = '';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { fetchWeatherData, displayWeather, displayError };
}
