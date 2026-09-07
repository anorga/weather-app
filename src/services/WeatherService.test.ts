import { describe, expect, it } from "vitest";
import {
  clockTime,
  condition,
  temperature,
  upcomingHours,
} from "./WeatherService";
import type { Forecast } from "../model/Weather";
describe("weather presentation", () => {
  it("converts temperatures including freezing and negative values", () => {
    expect(temperature(0, "F")).toBe(32);
    expect(temperature(-40, "F")).toBe(-40);
    expect(temperature(22.6, "C")).toBe(23);
  });
  it("keeps local API times independent of the browser time zone", () => {
    expect(clockTime("2026-09-06T00:05")).toBe("12:05 AM");
    expect(clockTime("2026-09-06T12:30")).toBe("12:30 PM");
    expect(clockTime("2026-09-06T23:45")).toBe("11:45 PM");
  });
  it("distinguishes snow showers, storms, and freezing fog", () => {
    expect(condition(85).kind).toBe("snow");
    expect(condition(95).kind).toBe("storm");
    expect(condition(48).kind).toBe("fog");
  });
  it("includes the current hour and rolls into the following day", () => {
    const data = {
      current: { time: "2026-09-06T23:15" },
      hourly: {
        time: ["2026-09-06T22:00", "2026-09-06T23:00", "2026-09-07T00:00"],
      },
    } as Forecast;
    expect(upcomingHours(data)).toEqual([1, 2]);
  });
});
