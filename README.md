# Atmos

A calm, responsive weather dashboard. Built with React, TypeScript, and Vite, with an original SVG landscape, Lucide icons, and a warm editorial interface.

## Run locally

Use Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No API key or environment file is needed.

## Features

- Worldwide city search with disambiguated results and debounced requests
- Current conditions, 12 hourly forecasts, and a seven-day outlook
- Weather-aware landscapes for clear, cloudy, rainy, snowy, foggy, and stormy conditions, with day/night variants
- A "Best time outside" card comparing two-hour daylight windows in the next 24 hours, with visible forecast evidence and an expandable explanation
- Celsius/Fahrenheit switching, humidity, wind, UV, sunrise and sunset
- Up to eight saved places persisted locally; optional browser geolocation
- Responsive layouts, keyboard controls, reduced-motion support, and explicit loading/error states
- Abortable requests and request timeouts; location changes cancel outdated forecasts

```sh
npm test       # Forecast, outdoor recommendation, and scenery tests
npm run build # Type checking and production bundle
npm run preview
```

Deploy the generated `dist/` folder to a static host. Geolocation requires HTTPS or localhost. The app requests public Open-Meteo APIs directly from the browser. Forecast times use the selected location's time zone; displayed data is model output, not a weather-station observation. Network errors are shown explicitly; no simulated weather is substituted.

## Data and credits

[Open-Meteo](https://open-meteo.com/) supplies weather data; [GeoNames](https://www.geonames.org/) supplies location data via Open-Meteo. The public Open-Meteo API is for non-commercial use and has usage limits; review their terms before commercial deployment. Location coordinates are sent to Open-Meteo only when the user requests local weather. Saved cities stay in this browser's local storage. Fonts are DM Sans and Manrope via Google Fonts, with system fallbacks. Icons are from Lucide.

Development branch: `staging`. Production branch: `master`.

## Outdoor recommendation

This is a transparent comfort heuristic, not a safety assessment. It requires clear/cloudy weather codes, a maximum precipitation probability of 30%, wind at or below 25 km/h, and feels-like temperatures between 10°C and 28°C at both boundaries and the middle of a two-hour daylight window. It ranks eligible windows by `2 × peak rain probability + peak wind speed + mean distance from 20°C`, preferring earlier times on ties. Precipitation probability uses the two ending timestamps because Open-Meteo defines it for the preceding hour. Incomplete measurements, missing hours, and unsuitable conditions produce an explicit unavailable state. UV, air quality, and weather alerts are not included.
