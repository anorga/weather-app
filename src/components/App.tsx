import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  Compass,
  Droplets,
  LocateFixed,
  MapPin,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Wind,
  X,
  RefreshCw,
} from "lucide-react";
import type { Forecast, Place } from "../model/Weather";
import {
  clockTime,
  condition,
  DEFAULT_PLACES,
  readForecast,
  searchPlaces,
  temperature,
  upcomingHours,
} from "../services/WeatherService";
import WeatherIcon from "./WeatherIcon";
import Landscape from "./Landscape";
import OutdoorCard from "./OutdoorCard";
import "./App.css";

function loadSaved(): Place[] {
  try {
    const value: unknown = JSON.parse(
      localStorage.getItem("atmos-places") ?? "null",
    );
    if (Array.isArray(value))
      return value
        .filter(
          (p): p is Place =>
            p &&
            typeof p.id === "number" &&
            typeof p.name === "string" &&
            typeof p.country === "string" &&
            Number.isFinite(p.latitude) &&
            Number.isFinite(p.longitude),
        )
        .slice(0, 8);
  } catch {
    /* Storage may be disabled. */
  }
  return DEFAULT_PLACES;
}

export default function App() {
  const [saved, setSaved] = useState(loadSaved);
  const [place, setPlace] = useState<Place>(
    () => saved[0] ?? DEFAULT_PLACES[0],
  );
  const [unit, setUnit] = useState<"C" | "F">("C");
  const [data, setData] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const geoRequest = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setData(null);
    readForecast(place, controller.signal)
      .then(setData)
      .catch(() => {
        if (!controller.signal.aborted)
          setError(
            "We couldn’t reach the forecast. Check your connection and give it another try.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [place, retry]);

  useEffect(() => {
    try {
      localStorage.setItem("atmos-places", JSON.stringify(saved));
    } catch {
      /* Keep working in memory. */
    }
  }, [saved]);

  useEffect(() => {
    const controller = new AbortController();
    setResults([]);
    setSearchError("");
    if (query.trim().length < 2) {
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = window.setTimeout(() => {
      searchPlaces(query, controller.signal)
        .then((found) => {
          if (!controller.signal.aborted) setResults(found);
        })
        .catch(() => {
          if (!controller.signal.aborted)
            setSearchError("Search is unavailable. Please try again.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  function select(next: Place) {
    geoRequest.current++;
    setLocating(false);
    setPlace(next);
    setQuery("");
    setLocationError("");
  }
  function locate() {
    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support location. Search for a city instead.",
      );
      return;
    }
    const request = ++geoRequest.current;
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (request !== geoRequest.current) return;
        select({
          id: -Date.now(),
          name: "Your location",
          country: `${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        if (request !== geoRequest.current) return;
        setLocating(false);
        setLocationError(
          "Location access is unavailable. You can search for your city above.",
        );
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }

  const temp = (value: number) => `${temperature(value, unit)}°`;
  const isSaved = saved.some((p) => p.id === place.id);
  const current = data?.current;
  const today = data?.daily;
  const now = current
    ? new Date(`${current.time.slice(0, 10)}T12:00:00`)
    : new Date();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#forecast">
        Skip to forecast
      </a>
      <header className="site-header">
        <a className="brand" href="/" aria-label="Atmos home">
          <Sun size={30} strokeWidth={1.6} />
          <span>
            atmos<span className="brand-dot">.</span>
          </span>
        </a>
        <span className="header-tagline">
          A little perspective on your day.
        </span>
        <div className="unit-toggle" role="group" aria-label="Temperature unit">
          {(["C", "F"] as const).map((value) => (
            <button
              key={value}
              aria-pressed={unit === value}
              onClick={() => setUnit(value)}
            >
              °{value}
            </button>
          ))}
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-top">
            <span className="eyebrow">YOUR DAILY OUTLOOK</span>
            <p className="sidebar-title">
              Weather,
              <br />
              <em>with perspective.</em>
            </p>
            <p>
              Wherever you are.
              <br />
              Whatever’s on the horizon.
            </p>
          </div>
          <div className="search-area">
            <div className="search-field">
              <Search size={18} />
              <input
                ref={searchRef}
                aria-label="Search for a city"
                placeholder="Find a city…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setQuery("");
                }}
              />
              {query && (
                <button aria-label="Clear search" onClick={() => setQuery("")}>
                  <X size={16} />
                </button>
              )}
            </div>
            {query.trim().length >= 2 && (
              <div className="search-results" aria-label="City search results">
                <p role="status">
                  {searching
                    ? "Finding your place…"
                    : searchError ||
                      (results.length
                        ? "CHOOSE A LOCATION"
                        : "No cities found. Try another name.")}
                </p>
                {results.map((result) => (
                  <button key={result.id} onClick={() => select(result)}>
                    <MapPin size={15} />
                    <span>
                      {result.name}
                      <small>
                        {[result.admin1, result.country]
                          .filter(Boolean)
                          .join(", ")}
                      </small>
                    </span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="location-button"
            onClick={locate}
            disabled={locating}
          >
            <LocateFixed size={16} />
            {locating ? "Locating you…" : "Use my location"}
            <ArrowUpRight size={15} />
          </button>
          {locationError && (
            <p className="inline-error" role="alert">
              {locationError}
            </p>
          )}
          <div className="places-title">
            <span className="eyebrow">SAVED PLACES</span>
            <span>{String(saved.length).padStart(2, "0")}</span>
          </div>
          <nav className="saved-places" aria-label="Saved places">
            {saved.map((p) => (
              <div
                className={`saved-place ${place.id === p.id ? "selected" : ""}`}
                key={p.id}
              >
                <button
                  className="place-select"
                  onClick={() => select(p)}
                  aria-current={place.id === p.id ? "location" : undefined}
                >
                  <MapPin size={18} />
                  <span>
                    {p.name}
                    <small>{p.country}</small>
                  </span>
                </button>
                <button
                  className="remove-place"
                  aria-label={`Remove ${p.name} from saved places`}
                  onClick={() =>
                    setSaved((list) => list.filter((item) => item.id !== p.id))
                  }
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </nav>
          {!saved.length && (
            <p className="empty-places">
              A world of places awaits. Search for a city and save it here.
            </p>
          )}
          <div className="sidebar-note">
            <Compass size={25} strokeWidth={1.3} />
            <p>
              A big world.
              <br />
              <strong>A little more clarity.</strong>
            </p>
            <span>Make a little room for the outdoors.</span>
          </div>
        </aside>

        <main id="forecast" className="main-content" aria-busy={loading}>
          <div className="page-heading">
            <div>
              <div className="eyebrow">THE FORECAST, AT A GLANCE</div>
              <h1>
                {place.name}
                <span className="location-dot" />
              </h1>
              <p>
                <MapPin size={13} />
                {[place.admin1, place.country].filter(Boolean).join(", ")}
              </p>
            </div>
            <div className="date-label">
              {now.toLocaleDateString("en-US", { weekday: "long" })}
              <span>
                {now.toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          {loading && (
            <div className="loading-card" role="status">
              <Sun className="loading-sun" size={44} />
              <h2>A fresh look at the sky.</h2>
              <p>Gathering the forecast for {place.name}…</p>
            </div>
          )}
          {error && (
            <div className="error-card" role="alert">
              <CloudOffIcon />
              <h2>A little cloud in the connection.</h2>
              <p>{error}</p>
              <button
                className="primary-button"
                onClick={() => setRetry((r) => r + 1)}
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          )}
          {data && current && today && (
            <>
              <section
                className={`current-card ${current.is_day ? "" : "night"}`}
                aria-label="Current weather"
              >
                <Landscape
                  night={!current.is_day}
                  code={current.weather_code}
                />
                <div className="current-content">
                  <span className="live-label">
                    <i />
                    CURRENT CONDITIONS
                  </span>
                  <div className="current-temperature">
                    {temp(current.temperature_2m)}
                    <span>{unit}</span>
                  </div>
                  <div className="current-condition">
                    <WeatherIcon
                      code={current.weather_code}
                      day={!!current.is_day}
                    />
                    {condition(current.weather_code).label}
                  </div>
                  <p>
                    Feels like {temp(current.apparent_temperature)}
                    <span>
                      H: {temp(today.temperature_2m_max[0])} &nbsp; L:{" "}
                      {temp(today.temperature_2m_min[0])}
                    </span>
                  </p>
                </div>
                <button
                  className="save-button"
                  aria-label={
                    isSaved
                      ? "Remove current city from saved places"
                      : "Save current city"
                  }
                  aria-pressed={isSaved}
                  disabled={!isSaved && saved.length >= 8}
                  onClick={() =>
                    setSaved((list) =>
                      isSaved
                        ? list.filter((p) => p.id !== place.id)
                        : [...list, place],
                    )
                  }
                >
                  {isSaved ? <Check size={16} /> : <Bookmark size={16} />}{" "}
                  {isSaved
                    ? "Saved"
                    : saved.length >= 8
                      ? "8 places saved"
                      : "Save place"}
                </button>
                <div className="landscape-caption">
                  {condition(current.weather_code).kind === "sun"
                    ? current.is_day
                      ? "A moment under the open sky."
                      : "A quieter kind of outlook."
                    : {
                        cloud: "A sky with a little texture.",
                        rain: "A different rhythm to the day.",
                        snow: "The world, a little softer.",
                        fog: "A little mystery on the horizon.",
                        storm: "A restless sky overhead.",
                        sun: "",
                      }[condition(current.weather_code).kind]}
                  <span>{clockTime(current.time)} local time</span>
                </div>
              </section>

              <OutdoorCard data={data} unit={unit} />

              <section className="hourly-section">
                <div className="section-heading">
                  <h2>The next 12 hours</h2>
                  <span>One hour at a time</span>
                </div>
                <div
                  className="hourly-strip"
                  tabIndex={0}
                  role="region"
                  aria-label="Hourly forecast, scroll for more hours"
                >
                  {upcomingHours(data).map((i, n) => (
                    <div className={`hour ${n === 0 ? "now" : ""}`} key={i}>
                      <span>
                        {n === 0
                          ? "Now"
                          : clockTime(data.hourly.time[i]).replace(":00", "")}
                      </span>
                      <WeatherIcon
                        code={data.hourly.weather_code[i]}
                        day={!!data.hourly.is_day[i]}
                      />
                      <strong>{temp(data.hourly.temperature_2m[i])}</strong>
                      <small>
                        <Droplets size={11} />
                        {data.hourly.precipitation_probability[i]}%
                      </small>
                    </div>
                  ))}
                </div>
              </section>

              <div className="details-grid">
                <section className="week-section">
                  <div className="section-heading">
                    <h2>Ahead this week</h2>
                    <span>7-day forecast</span>
                  </div>
                  <div className="week-card">
                    {today.time.map((date, i) => {
                      const min = Math.min(...today.temperature_2m_min),
                        max = Math.max(...today.temperature_2m_max),
                        range = max - min || 1;
                      return (
                        <div className="day-row" key={date}>
                          <strong>
                            {i === 0
                              ? "Today"
                              : new Date(`${date}T12:00:00`).toLocaleDateString(
                                  "en-US",
                                  { weekday: "short" },
                                )}
                          </strong>
                          <WeatherIcon code={today.weather_code[i]} size={23} />
                          <span className="day-rain">
                            {today.precipitation_probability_max[i]}%
                          </span>
                          <span className="low-temp">
                            {temp(today.temperature_2m_min[i])}
                          </span>
                          <div className="temp-track">
                            <i
                              style={{
                                left: `${((today.temperature_2m_min[i] - min) / range) * 100}%`,
                                width: `${Math.max(3, ((today.temperature_2m_max[i] - today.temperature_2m_min[i]) / range) * 100)}%`,
                              }}
                            />
                          </div>
                          <span>{temp(today.temperature_2m_max[i])}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
                <section className="highlights-section">
                  <div className="section-heading">
                    <h2>The finer details</h2>
                    <span>Today</span>
                  </div>
                  <div className="highlights-grid">
                    <article className="metric">
                      <div>
                        <Wind size={17} />
                        <span>WIND</span>
                      </div>
                      <strong>
                        {Math.round(current.wind_speed_10m)}
                        <small> km/h</small>
                      </strong>
                      <p>
                        From{" "}
                        {
                          ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
                            Math.round(current.wind_direction_10m / 45) % 8
                          ]
                        }{" "}
                        <span
                          className="wind-arrow"
                          style={{
                            transform: `rotate(${current.wind_direction_10m + 180}deg)`,
                          }}
                        >
                          ↑
                        </span>
                      </p>
                    </article>
                    <article className="metric">
                      <div>
                        <Droplets size={17} />
                        <span>HUMIDITY</span>
                      </div>
                      <strong>
                        {current.relative_humidity_2m}
                        <small>%</small>
                      </strong>
                      <div className="humidity-track">
                        <i
                          style={{ width: `${current.relative_humidity_2m}%` }}
                        />
                      </div>
                    </article>
                    <article className="metric">
                      <div>
                        <Sun size={17} />
                        <span>UV INDEX</span>
                      </div>
                      <strong>
                        {today.uv_index_max[0].toFixed(1)}
                        <small> peak</small>
                      </strong>
                      <p>
                        {today.uv_index_max[0] < 3
                          ? "Low"
                          : today.uv_index_max[0] < 6
                            ? "Moderate"
                            : today.uv_index_max[0] < 8
                              ? "High"
                              : today.uv_index_max[0] < 11
                                ? "Very high"
                                : "Extreme"}
                      </p>
                    </article>
                    <article className="metric daylight">
                      <div>
                        <Sunrise size={17} />
                        <span>SUN & SKY</span>
                      </div>
                      <p>
                        <Sunrise size={18} />
                        <strong>
                          {today.sunrise[0] ? clockTime(today.sunrise[0]) : "—"}
                        </strong>
                      </p>
                      <p>
                        <Sunset size={18} />
                        <strong>
                          {today.sunset[0] ? clockTime(today.sunset[0]) : "—"}
                        </strong>
                      </p>
                    </article>
                  </div>
                </section>
              </div>
              <div className="forecast-note">
                <span className="status-dot" />
                Forecast updated for {clockTime(current.time)}. Times are local
                to {place.name}.
              </div>
            </>
          )}
        </main>
      </div>
      <footer>
        <span>
          <Sun size={15} /> A little more in tune with the world.
        </span>
        <span>
          Weather by{" "}
          <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
            Open-Meteo <ArrowUpRight size={12} />
          </a>
          <span className="footer-divider">/</span>Places by{" "}
          <a href="https://www.geonames.org/" target="_blank" rel="noreferrer">
            GeoNames
          </a>
        </span>
      </footer>
    </div>
  );
}

function CloudOffIcon() {
  return <Compass size={40} strokeWidth={1.2} />;
}
