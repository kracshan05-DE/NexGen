import { describe, expect, it, vi } from "vitest";

// These modules are marked server-only; that guard is a build-time concern.
vi.mock("server-only", () => ({}));

import { REFERENCE_PATTERN, toSearchPattern } from "./enquiries";
import { csvCell, formatReceived, toCsv } from "./format";
import { isStatus, parseView, pipeline, statusLabel } from "./statuses";

describe("toSearchPattern", () => {
  it("wraps a plain term for a contains search, lower-cased", () => {
    expect(toSearchPattern("  Harbour Logistics ")).toBe("%harbour logistics%");
  });

  it("escapes SQL wildcards so they match literally", () => {
    expect(toSearchPattern("50%")).toBe("%50\\%%");
    expect(toSearchPattern("a_b")).toBe("%a\\_b%");
    expect(toSearchPattern("back\\slash")).toBe("%back\\\\slash%");
  });

  it("drops '*', which the API would otherwise treat as a wildcard", () => {
    expect(toSearchPattern("ab*cd")).toBe("%ab cd%");
    expect(toSearchPattern("*")).toBeNull();
  });

  it("returns null for an empty search and caps the length", () => {
    expect(toSearchPattern("   ")).toBeNull();
    expect(toSearchPattern("x".repeat(500))).toHaveLength(82);
  });
});

describe("reference pattern", () => {
  it("accepts generated references only", () => {
    expect(REFERENCE_PATTERN.test("NX-7K2M9Q")).toBe(true);
    for (const bad of ["NX-7K2M9", "nx-7k2m9q", "NX-7K2M9Q1", "NX-0O1IL0", "../etc", "NX-7K2M9Q?x=1"]) {
      expect(REFERENCE_PATTERN.test(bad)).toBe(false);
    }
  });
});

describe("CSV export", () => {
  it("neutralises cells a spreadsheet would run as a formula", () => {
    expect(csvCell("=SUM(A1:A9)")).toBe("'=SUM(A1:A9)");
    expect(csvCell("+61 412 345 678")).toBe("'+61 412 345 678");
    expect(csvCell("-1")).toBe("'-1");
    expect(csvCell("@cmd")).toBe("'@cmd");
    expect(csvCell('=HYPERLINK("http://x","y")')).toBe(`"'=HYPERLINK(""http://x"",""y"")"`);
  });

  it("quotes commas, quotes and line breaks, and blanks out nulls", () => {
    expect(csvCell("Smith, Jo")).toBe('"Smith, Jo"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line one\nline two")).toBe('"line one\nline two"');
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
    expect(csvCell(1200)).toBe("1200");
  });

  it("builds a file Excel reads as UTF-8", () => {
    expect(toCsv(["A", "B"], [["1", "x,y"]])).toBe('﻿A,B\r\n1,"x,y"\r\n');
  });
});

describe("formatReceived", () => {
  // 6 Oct 2026 03:00 UTC is 2:00 pm on 6 Oct in Sydney (daylight saving time).
  const now = new Date("2026-10-06T03:00:00Z");

  it("uses the business's time zone, not UTC", () => {
    // 5 Oct 14:30 UTC is already 1:30 am on 6 Oct in Sydney: "today", not "yesterday".
    expect(formatReceived("2026-10-05T14:30:00Z", now)).toMatch(/^Today, 1:30\s?am$/i);
    expect(formatReceived("2026-10-05T02:00:00Z", now)).toMatch(/^Yesterday, 1:00\s?pm$/i);
  });

  it("falls back to the date for anything older", () => {
    expect(formatReceived("2026-09-30T02:00:00Z", now)).toMatch(/^30 Sept? 2026$/);
  });
});

describe("statuses", () => {
  it("validates values and falls back to the 'all' view", () => {
    expect(isStatus("quoted")).toBe(true);
    expect(isStatus("banana")).toBe(false);
    expect(parseView("won")).toBe("won");
    expect(parseView("banana")).toBe("all");
    expect(parseView(undefined)).toBe("all");
  });

  it("keeps the pipeline in working order", () => {
    expect(pipeline).toEqual(["new", "contacted", "quoted", "won"]);
    expect(statusLabel("contacted")).toBe("Contacted");
  });
});
