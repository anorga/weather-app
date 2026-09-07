import { describe, expect, it } from "vitest";
import { bestTimeOutside } from "./OutdoorWindow";
import type { Forecast } from "../model/Weather";

function forecast(): Forecast {
  const time = Array.from({ length: 48 }, (_, i) =>
    new Date(Date.UTC(2026, 8, 7, i)).toISOString().slice(0, 16),
  );
  return {
    current: { time: "2026-09-07T08:15" },
    hourly: {
      time,
      is_day: time.map((t) =>
        Number(t.slice(11, 13)) >= 7 && Number(t.slice(11, 13)) < 19 ? 1 : 0,
      ),
      apparent_temperature: time.map(() => 20),
      temperature_2m: time.map(() => 20),
      wind_speed_10m: time.map(() => 10),
      precipitation_probability: time.map(() => 10),
      weather_code: time.map(() => 1),
    },
  } as Forecast;
}

describe("best time outside", () => {
  it("uses future full hours and prefers the earliest tied window", () => {
    const result = bestTimeOutside(forecast()).window!;
    expect(result.start).toBe("2026-09-07T09:00");
    expect(result.end).toBe("2026-09-07T11:00");
  });
  it("ranks a drier window above a wetter one", () => {
    const data = forecast();
    data.hourly.precipitation_probability[13] = 0;
    data.hourly.precipitation_probability[14] = 0;
    expect(bestTimeOutside(data).window?.start).toBe("2026-09-07T12:00");
  });
  it("does not recommend across a thunderstorm or sunset", () => {
    const data = forecast();
    data.current.time = "2026-09-07T15:30";
    data.hourly.weather_code[17] = 95;
    expect(bestTimeOutside(data).window?.start).toBe("2026-09-08T07:00");
  });
  it("handles midnight and destination dates independently of browser timezone", () => {
    const data = forecast();
    data.current.time = "2026-09-07T23:45";
    expect(bestTimeOutside(data).window?.start).toBe("2026-09-08T07:00");
  });
  it.each(["wind", "heat", "rain", "snow", "fog"])(
    "declines unsuitable %s instead of recommending the least bad window",
    (scenario) => {
      const data = forecast();
      if (scenario === "wind") data.hourly.wind_speed_10m.fill(45);
      if (scenario === "heat") data.hourly.apparent_temperature.fill(36);
      if (scenario === "rain") data.hourly.precipitation_probability.fill(90);
      if (scenario === "snow") data.hourly.weather_code.fill(85);
      if (scenario === "fog") data.hourly.weather_code.fill(45);
      expect(bestTimeOutside(data)).toEqual({
        window: null,
        reason: "conditions",
      });
    },
  );
  it("does not treat missing measurements as zero", () => {
    const data = forecast();
    data.hourly.apparent_temperature.fill(null);
    expect(bestTimeOutside(data)).toEqual({ window: null, reason: "missing" });
  });
  it("does not invent daylight in polar night", () => {
    const data = forecast();
    data.hourly.is_day.fill(0);
    expect(bestTimeOutside(data)).toEqual({ window: null, reason: "daylight" });
  });
  it("does not extend beyond the next 24 hours", () => {
    const data = forecast();
    data.current.time = "2026-09-07T17:30";
    data.hourly.is_day.fill(0);
    data.hourly.is_day.fill(1, 40, 44);
    expect(bestTimeOutside(data).window).toBeNull();
  });
  it("requires consecutive local hours", () => {
    const data = forecast();
    data.hourly.time = data.hourly.time.map((t, i) =>
      i % 2 ? t.replace(":00", ":30") : t,
    );
    expect(bestTimeOutside(data).window).toBeNull();
  });
});
