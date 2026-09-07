import type { Forecast, Place } from "../model/Weather";

export const DEFAULT_PLACES: Place[] = [
  {
    id: 5391959,
    name: "San Francisco",
    latitude: 37.7749,
    longitude: -122.4194,
    country: "United States",
    admin1: "California",
  },
  {
    id: 5128581,
    name: "New York",
    latitude: 40.7143,
    longitude: -74.006,
    country: "United States",
    admin1: "New York",
  },
  {
    id: 2643743,
    name: "London",
    latitude: 51.5085,
    longitude: -0.1257,
    country: "United Kingdom",
  },
];

async function request<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
  });
  if (!response.ok)
    throw new Error("The weather service is unavailable. Please try again.");
  return response.json();
}

export async function searchPlaces(
  query: string,
  signal: AbortSignal,
): Promise<Place[]> {
  const params = new URLSearchParams({
    name: query.trim(),
    count: "6",
    language: "en",
    format: "json",
  });
  const data = await request<{ results?: Place[] }>(
    `https://geocoding-api.open-meteo.com/v1/search?${params}`,
    signal,
  );
  return data.results ?? [];
}

export function readForecast(
  place: Place,
  signal: AbortSignal,
): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    timezone: "auto",
    forecast_days: "7",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m",
    hourly:
      "temperature_2m,weather_code,precipitation_probability,is_day,apparent_temperature,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
  });
  return request<Forecast>(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    signal,
  );
}

export function condition(code: number): {
  label: string;
  kind: "sun" | "cloud" | "rain" | "snow" | "storm" | "fog";
} {
  if (code === 0) return { label: "Clear skies", kind: "sun" };
  if (code <= 2) return { label: "Partly cloudy", kind: "cloud" };
  if (code === 3) return { label: "Overcast", kind: "cloud" };
  if (code === 45 || code === 48) return { label: "Foggy", kind: "fog" };
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return { label: "Snowfall", kind: "snow" };
  if (code >= 95) return { label: "Thunderstorms", kind: "storm" };
  return { label: "Rainy", kind: "rain" };
}

export function temperature(value: number, unit: "C" | "F") {
  return Math.round(unit === "F" ? (value * 9) / 5 + 32 : value);
}
export function clockTime(value: string) {
  const hour = Number(value.slice(11, 13));
  return `${hour % 12 || 12}:${value.slice(14, 16)} ${hour >= 12 ? "PM" : "AM"}`;
}
export function upcomingHours(data: Forecast): number[] {
  const currentHour = data.current.time.slice(0, 13);
  return data.hourly.time
    .map((_, i) => i)
    .filter((i) => data.hourly.time[i].slice(0, 13) >= currentHour)
    .slice(0, 12);
}
