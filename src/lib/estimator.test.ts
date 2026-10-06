import { describe, expect, it } from "vitest";
import {
  MAX_AREA_SQM,
  calculateEstimate,
  describeEstimate,
  formatRange,
} from "./estimator";

describe("calculateEstimate", () => {
  it("matches the client's original formula", () => {
    // 1,200 sqm office, weekly: 1200 × 0.18 = 216 and 1200 × 0.24 = 288 per visit;
    // weekly is 4.3 visits a month → 929 and 1,238.
    const estimate = calculateEstimate({ area: 1200, type: "office", frequency: "weekly" });
    expect(estimate).toMatchObject({
      perVisit: { low: 216, high: 288 },
      monthly: { low: 929, high: 1238 },
    });
  });

  it("uses the rate band for each facility type", () => {
    const dc = calculateEstimate({ area: 1000, type: "datacentre", frequency: "daily" });
    expect(dc?.perVisit).toEqual({ low: 350, high: 480 });
    expect(dc?.monthly).toEqual({ low: 7700, high: 10560 });

    const strata = calculateEstimate({ area: 1000, type: "strata", frequency: "fortnightly" });
    expect(strata?.perVisit).toEqual({ low: 120, high: 160 });
    expect(strata?.monthly).toEqual({ low: 264, high: 352 });
  });

  it.each([0, -5, Number.NaN, Number.POSITIVE_INFINITY, MAX_AREA_SQM + 1])(
    "rejects area %s",
    (area) => {
      expect(calculateEstimate({ area, type: "office", frequency: "weekly" })).toBeNull();
    },
  );

  it("rejects unknown facility types and frequencies", () => {
    expect(calculateEstimate({ area: 100, type: "castle", frequency: "weekly" })).toBeNull();
    expect(calculateEstimate({ area: 100, type: "office", frequency: "hourly" })).toBeNull();
    // "other" is valid on the enquiry form but has no rate, so no estimate.
    expect(calculateEstimate({ area: 100, type: "other", frequency: "weekly" })).toBeNull();
  });
});

describe("formatting", () => {
  it("formats ranges as whole Australian dollars", () => {
    expect(formatRange({ low: 216, high: 1288 })).toBe("$216 – $1,288");
  });

  it("describes an estimate in one line", () => {
    const estimate = calculateEstimate({ area: 1200, type: "office", frequency: "weekly" })!;
    expect(describeEstimate(estimate)).toBe(
      "1,200 sqm · Office & commercial · Weekly · $216 – $288 per visit",
    );
  });
});
