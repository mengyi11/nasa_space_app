import fetch from "node-fetch";

export async function fetchAirNow(lat, lon) {
  const apiKey = process.env.AIRNOW_API_KEY;
  if (!apiKey) return null;

  const url = `https://www.airnowapi.org/aq/observation/latLong/current/`;
  const params = `?format=application/json&latitude=${lat}&longitude=${lon}&distance=25&API_KEY=${apiKey}`;

  try {
    const resp = await fetch(url + params);
    const data = await resp.json();
    if (!Array.isArray(data) || !data.length) return null;

    let highestAQI = null;
    let dominant = null;
    const pollutant_levels = {};
    data.forEach((obs) => {
      const name = obs.ParameterName;
      const aqi = obs.AQI;
      const conc = obs.Concentration;
      const unit = obs.Unit;
      pollutant_levels[name] = { aqi, conc, unit };
      if (aqi !== null && (highestAQI === null || aqi > highestAQI)) {
        highestAQI = aqi;
        dominant = name;
      }
    });
    return { aqi: highestAQI, dominant_pollutant: dominant, pollutant_levels, raw_observations: data };
  } catch (err) {
    console.error("AirNow fetch error:", err);
    return null;
  }
}