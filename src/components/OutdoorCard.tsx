import {
  ArrowUpRight,
  CloudSun,
  Droplets,
  Thermometer,
  Wind,
} from "lucide-react";
import type { Forecast } from "../model/Weather";
import { bestTimeOutside, OUTDOOR_LIMITS } from "../services/OutdoorWindow";
import { clockTime, temperature } from "../services/WeatherService";

export default function OutdoorCard({
  data,
  unit,
}: {
  data: Forecast;
  unit: "C" | "F";
}) {
  const outlook = bestTimeOutside(data);
  const window = outlook.window;
  const degrees = (value: number) => `${temperature(value, unit)}°`;
  const day =
    window?.start.slice(0, 10) === data.current.time.slice(0, 10)
      ? "Today"
      : "Tomorrow";
  return (
    <section
      className={`outdoor-card ${window ? "" : "outdoor-unavailable"}`}
      aria-labelledby="outdoor-title"
    >
      <div className="outdoor-intro">
        <span className="outdoor-mark">
          <CloudSun size={26} strokeWidth={1.5} />
        </span>
        <div>
          <span className="eyebrow">MAKE ROOM FOR THE OUTDOORS</span>
          <h2 id="outdoor-title">Best time outside</h2>
        </div>
      </div>
      {window ? (
        <>
          <div className="outdoor-window">
            <span>{day} · local time</span>
            <p>
              <time dateTime={window.start}>
                {clockTime(window.start).replace(":00", "")}
              </time>
              <span>–</span>
              <time dateTime={window.end}>
                {clockTime(window.end).replace(":00", "")}
              </time>
              <ArrowUpRight size={20} />
            </p>
          </div>
          <p className="outdoor-description">
            A two-hour daylight window with a low rain chance and comfortable
            conditions.
          </p>
          <ul className="outdoor-reasons">
            <li>
              <Droplets size={16} />
              <span>
                Rain chance <strong>up to {window.rain}%</strong>
              </span>
            </li>
            <li>
              <Thermometer size={16} />
              <span>
                Feels like{" "}
                <strong>
                  {degrees(window.feelsMin)}–{degrees(window.feelsMax)}
                  {unit}
                </strong>
              </span>
            </li>
            <li>
              <Wind size={16} />
              <span>
                Wind <strong>up to {Math.round(window.wind)} km/h</strong>
              </span>
            </li>
          </ul>
        </>
      ) : (
        <p className="outdoor-description">
          {outlook.reason === "missing"
            ? "Some hourly details are missing, so we can’t compare outdoor windows just yet."
            : outlook.reason === "daylight"
              ? "No complete two-hour daylight window in the next 24 hours. Check back for the next outlook."
              : "No window meets our comfort preferences in the next 24 hours. The hourly forecast can help you plan around the conditions."}
        </p>
      )}
      <details className="outdoor-method">
        <summary>{window ? "Why this window?" : "What we look for"}</summary>
        <p>
          We compare two-hour daylight windows in the next 24 hours. Each needs
          clear or cloudy skies, rain chances no higher than{" "}
          {OUTDOOR_LIMITS.rain}%, wind no higher than {OUTDOOR_LIMITS.wind}{" "}
          km/h, and feels-like temperatures of{" "}
          {degrees(OUTDOOR_LIMITS.feelsMin)}–{degrees(OUTDOOR_LIMITS.feelsMax)}
          {unit}. We balance rain chance, wind, and closeness to {degrees(20)}
          {unit}, giving rain chance the most weight. Equal scores favor the
          earlier window.
        </p>
        <p>
          A comfort guide from the hourly forecast; conditions can change. It
          doesn’t assess UV, air quality, or local weather alerts.
        </p>
      </details>
    </section>
  );
}
