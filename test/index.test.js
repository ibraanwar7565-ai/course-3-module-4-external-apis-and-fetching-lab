require('../index.js');

describe("Weather Alerts App", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <h1>Weather Alerts App</h1>
      <input type="text" id="city-input" placeholder="Enter state abbreviation">
      <button id="fetch-weather">Get Weather Alerts</button>
      <div id="alerts-display"></div>
      <div id="error-message" class="hidden"></div>
    `;

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("fetches data from the correct API endpoint", async () => {
    const mockAlerts = [
      { headline: "Winter Storm Warning" },
      { headline: "Wind Advisory" }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ features: mockAlerts })
    });

    const input = document.getElementById("city-input");
    const button = document.getElementById("fetch-weather");

    input.value = "NY";
    button.click();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(global.fetch).toHaveBeenCalledWith("https://api.weather.gov/alerts/active?area=NY");
  });

  test("displays fetched alerts in the DOM", async () => {
    const mockAlerts = [
      { headline: "Winter Storm Warning" },
      { headline: "Wind Advisory" }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ features: mockAlerts })
    });

    const input = document.getElementById("city-input");
    const button = document.getElementById("fetch-weather");

    input.value = "NY";
    button.click();

    await new Promise(resolve => setTimeout(resolve, 100));

    const display = document.getElementById("alerts-display");
    expect(display.textContent).toContain("Winter Storm Warning");
    expect(display.textContent).toContain("Wind Advisory");
  });

  test("clears the input field after fetching", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ features: [] })
    });

    const input = document.getElementById("city-input");
    const button = document.getElementById("fetch-weather");

    input.value = "CA";
    button.click();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(input.value).toBe("");
  });

  test("displays error message on fetch failure", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    const input = document.getElementById("city-input");
    const button = document.getElementById("fetch-weather");

    input.value = "TX";
    button.click();

    await new Promise(resolve => setTimeout(resolve, 100));

    const errorDiv = document.getElementById("error-message");
    expect(errorDiv.classList.contains("hidden")).toBe(false);
    expect(errorDiv.textContent).toContain("Network error");
  });

  test("clears error message on successful fetch", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce({ features: [] })
    });

    const errorDiv = document.getElementById("error-message");
    errorDiv.classList.remove("hidden");
    errorDiv.textContent = "Previous error";

    const input = document.getElementById("city-input");
    const button = document.getElementById("fetch-weather");

    input.value = "FL";
    button.click();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(errorDiv.classList.contains("hidden")).toBe(true);
    expect(errorDiv.textContent).toBe("");
  });
});
