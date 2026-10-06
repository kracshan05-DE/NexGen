import { beforeEach, describe, expect, it } from "vitest";
import { rateLimit, resetRateLimit } from "./rate-limit";

const options = { limit: 3, windowMs: 1000 };

describe("rateLimit", () => {
  beforeEach(resetRateLimit);

  it("allows up to the limit, then blocks", () => {
    expect(rateLimit("a", options, 0).allowed).toBe(true);
    expect(rateLimit("a", options, 1).allowed).toBe(true);
    expect(rateLimit("a", options, 2)).toEqual({ allowed: true, remaining: 0 });
    expect(rateLimit("a", options, 3).allowed).toBe(false);
  });

  it("tracks each key separately", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", options, i);
    expect(rateLimit("a", options, 10).allowed).toBe(false);
    expect(rateLimit("b", options, 10).allowed).toBe(true);
  });

  it("lets requests through again once the window has passed", () => {
    for (let i = 0; i < 3; i++) rateLimit("a", options, i);
    expect(rateLimit("a", options, 500).allowed).toBe(false);
    expect(rateLimit("a", options, 1003).allowed).toBe(true);
  });
});
