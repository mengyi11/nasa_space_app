import fetch from "node-fetch";

export async function geocodeLocation(city, state, country) {
  if (!city && !state && !country) return null;
  const query = [city, state, country].filter(Boolean).join(", ");
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    query
  )}&format=json&limit=1`;

  try {
    const resp = await fetch(url, {
      headers: { "User-Agent": "aqi-recommender/1.0" },
    });
    const data = await resp.json();
    if (!data || !data.length) return null;
    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch (err) {
    console.error("Geocode error:", err);
    return null;
  }
}