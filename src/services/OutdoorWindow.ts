import type { Forecast } from "../model/Weather";

export type OutdoorOutlook = {
  window: {
    start: string;
    end: string;
    rain: number;
    wind: number;
    feelsMin: number;
    feelsMax: number;
  } | null;
  reason?: "missing" | "daylight" | "conditions";
};

// These are product comfort preferences, not a weather warning or safety model.
export const OUTDOOR_LIMITS = {
  rain: 30,
  wind: 25,
  feelsMin: 10,
  feelsMax: 28,
};
const HOUR = 3_600_000;
// API strings already use the destination's local clock. UTC here is only a
// calendar-arithmetic device; never interpret them in the browser's time zone.
const localClock = (value: string) => Date.parse(`${value}Z`);
const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function bestTimeOutside(data: Forecast): OutdoorOutlook {
  const h = data.hourly;
  const now = localClock(data.current.time);
  if (!Number.isFinite(now)) return { window: null, reason: "missing" };
  let best: OutdoorOutlook["window"] = null;
  let bestScore = Infinity;
  let daylightWindows = 0;
  let completeWindows = 0;

  for (let i = 0; i < h.time.length - 2; i++) {
    const indices = [i, i + 1, i + 2];
    const times = indices.map((index) => localClock(h.time[index]));
    if (times[0] < now || times[2] > now + 24 * HOUR) continue;
    // Check both boundaries and the middle of the two-hour window. Never join
    // missing hours, sunset, or duplicate clock times during DST transitions.
    if (times[1] - times[0] !== HOUR || times[2] - times[1] !== HOUR) continue;
    if (!indices.every((index) => h.is_day[index] === 1)) continue;
    daylightWindows++;
    const feels = indices.map((index) => h.apparent_temperature?.[index]);
    const winds = indices.map((index) => h.wind_speed_10m?.[index]);
    // Precipitation probability describes the hour preceding its timestamp.
    const rain = [
      h.precipitation_probability[i + 1],
      h.precipitation_probability[i + 2],
    ];
    const codes = indices.map((index) => h.weather_code[index]);
    if (
      !feels.every(finite) ||
      !winds.every(finite) ||
      !rain.every(finite) ||
      !codes.every(finite)
    )
      continue;
    completeWindows++;
    if (!codes.every((code) => [0, 1, 2, 3].includes(code))) continue;
    const peakRain = Math.max(...rain),
      peakWind = Math.max(...winds);
    const feelsMin = Math.min(...feels),
      feelsMax = Math.max(...feels);
    if (
      peakRain < 0 ||
      peakRain > OUTDOOR_LIMITS.rain ||
      Math.min(...winds) < 0 ||
      peakWind > OUTDOOR_LIMITS.wind ||
      feelsMin < OUTDOOR_LIMITS.feelsMin ||
      feelsMax > OUTDOOR_LIMITS.feelsMax
    )
      continue;
    // Balance rain, wind, and closeness to 20°C, weighting rain most heavily.
    // Stable iteration prefers the earlier window when scores tie.
    const score =
      peakRain * 2 +
      peakWind +
      feels.reduce((sum, value) => sum + Math.abs(value - 20), 0) /
        feels.length;
    if (score < bestScore) {
      bestScore = score;
      best = {
        start: h.time[i],
        end: h.time[i + 2],
        rain: peakRain,
        wind: peakWind,
        feelsMin,
        feelsMax,
      };
    }
  }
  if (best) return { window: best };
  return {
    window: null,
    reason: !daylightWindows
      ? "daylight"
      : !completeWindows
        ? "missing"
        : "conditions",
  };
}
