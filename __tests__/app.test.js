/**
 * @jest-environment jsdom
 */

const { fetchWeatherData, displayWeather, displayError } = require('../src/app');

global.fetch = jest.fn();

function setupDOM() {
  document.body.innerHTML = `
    <input id="state-input" type="text" />
    <button id="fetch-btn">Get Alerts</button>
    <div id="error-display"></div>
    <div id="weather-display"></div>
  `;
}

beforeEach(() => {
  setupDOM();
  fetch.mockClear();
});

// ---------------------------------------------------------------------------
// fetchWeatherData – successful API call
// ---------------------------------------------------------------------------
describe('fetchWeatherData – successful API call', () => {
  test('calls the NWS API with the uppercased state code', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ features: [] })
    });

    await fetchWeatherData('ca');

    expect(fetch).toHaveBeenCalledWith(
      'https://api.weather.gov/alerts/active?area=CA'
    );
  });

  test('renders alert headlines returned by the API', async () => {
    const mockData = {
      features: [
        {
          properties: {
            headline: 'Tornado Warning in Effect',
            event: 'Tornado Warning',
            areaDesc: 'Central Oklahoma',
            severity: 'Extreme',
            description: 'A tornado warning is in effect until 9 PM.'
          }
        }
      ]
    };

    fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });

    await fetchWeatherData('OK');

    expect(document.getElementById('weather-display').innerHTML).toContain(
      'Tornado Warning in Effect'
    );
  });

  test('shows "no alerts" message when features array is empty', async () => {
    fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ features: [] }) });

    await fetchWeatherData('CA');

    expect(document.getElementById('weather-display').innerHTML).toContain(
      'No active weather alerts'
    );
  });
});

// ---------------------------------------------------------------------------
// fetchWeatherData – invalid input
// ---------------------------------------------------------------------------
describe('fetchWeatherData – invalid input', () => {
  test('displays error and does not fetch when input is empty string', async () => {
    await fetchWeatherData('');

    expect(fetch).not.toHaveBeenCalled();
    expect(document.getElementById('error-display').textContent).toBeTruthy();
  });

  test('displays error and does not fetch when input is whitespace only', async () => {
    await fetchWeatherData('   ');

    expect(fetch).not.toHaveBeenCalled();
    expect(document.getElementById('error-display').textContent).toBeTruthy();
  });

  test('displays error and does not fetch when abbreviation is longer than 2 letters', async () => {
    await fetchWeatherData('INVALID');

    expect(fetch).not.toHaveBeenCalled();
    expect(document.getElementById('error-display').textContent).toBeTruthy();
  });

  test('displays error and does not fetch for unrecognized state code', async () => {
    await fetchWeatherData('ZZ');

    expect(fetch).not.toHaveBeenCalled();
    expect(document.getElementById('error-display').textContent).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// fetchWeatherData – failed API responses
// ---------------------------------------------------------------------------
describe('fetchWeatherData – failed API responses', () => {
  test('displays error when the API returns a non-OK status', async () => {
    fetch.mockResolvedValueOnce({ ok: false, status: 500 });

    await fetchWeatherData('TX');

    expect(document.getElementById('error-display').textContent).toBeTruthy();
    expect(document.getElementById('weather-display').innerHTML).toBe('');
  });

  test('displays error on network failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network failure'));

    await fetchWeatherData('CA');

    expect(document.getElementById('error-display').textContent).toBeTruthy();
  });

  test('does not throw an unhandled promise rejection on network failure', async () => {
    fetch.mockRejectedValueOnce(new Error('Network failure'));

    await expect(fetchWeatherData('CA')).resolves.toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// displayWeather – DOM updates
// ---------------------------------------------------------------------------
describe('displayWeather – DOM updates', () => {
  test('renders all alert cards when features are present', () => {
    const mockData = {
      features: [
        {
          properties: {
            headline: 'Flash Flood Watch',
            event: 'Flash Flood Watch',
            areaDesc: 'Southern Texas',
            severity: 'Moderate',
            description: 'Heavy rain expected through Sunday.'
          }
        },
        {
          properties: {
            headline: 'Heat Advisory',
            event: 'Heat Advisory',
            areaDesc: 'Northern Texas',
            severity: 'Minor',
            description: 'High temperatures expected.'
          }
        }
      ]
    };

    displayWeather(mockData);

    const html = document.getElementById('weather-display').innerHTML;
    expect(html).toContain('Flash Flood Watch');
    expect(html).toContain('Heat Advisory');
  });

  test('shows "no alerts" message for empty features array', () => {
    displayWeather({ features: [] });

    expect(document.getElementById('weather-display').innerHTML).toContain(
      'No active weather alerts'
    );
  });

  test('clears any existing error message when displaying weather', () => {
    document.getElementById('error-display').textContent = 'Previous error';

    displayWeather({ features: [] });

    expect(document.getElementById('error-display').textContent).toBe('');
  });
});

// ---------------------------------------------------------------------------
// displayError – DOM updates
// ---------------------------------------------------------------------------
describe('displayError – DOM updates', () => {
  test('sets the error element text to the provided message', () => {
    displayError('Invalid state abbreviation');

    expect(document.getElementById('error-display').textContent).toBe(
      'Invalid state abbreviation'
    );
  });

  test('clears weather display when an error is shown', () => {
    document.getElementById('weather-display').innerHTML = '<p>Some weather data</p>';

    displayError('An error occurred');

    expect(document.getElementById('weather-display').innerHTML).toBe('');
  });

  test('replaces a previous error message with the new one', () => {
    displayError('First error');
    displayError('Second error');

    expect(document.getElementById('error-display').textContent).toBe('Second error');
  });
});
