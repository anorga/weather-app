import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Landscape from "./Landscape";
describe("weather scenery", () => {
  it.each([
    [0, "sun"],
    [2, "cloud"],
    [3, "cloud"],
    [61, "rain"],
    [75, "snow"],
    [45, "fog"],
    [95, "storm"],
  ])("reflects weather code %s", (code, kind) => {
    for (const night of [true, false]) {
      const html = renderToStaticMarkup(
        <Landscape code={Number(code)} night={night} />,
      );
      expect(html).toContain(`data-scene="${kind}-${night ? "night" : "day"}"`);
      if (![0, 2].includes(Number(code)))
        expect(html).not.toContain('class="scene-orb"');
      expect(html).toContain('aria-hidden="true"');
    }
  });
});
