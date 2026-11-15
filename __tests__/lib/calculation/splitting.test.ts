import { describe, expect, it } from "vitest";
import { splitByAmounts, splitByPercent, splitEqual } from "@/lib/calculation/splitting";
import { randomInt, seededRandom } from "../../helpers/random";

const sum = (shares: Record<string, number>) =>
  Object.values(shares).reduce((a, b) => a + b, 0);

describe("splitEqual", () => {
  it("splits an evenly divisible amount equally", () => {
    expect(splitEqual(1000, ["a", "b"])).toEqual({ a: 500, b: 500 });
  });

  it("gives the rounding cents to the members listed first", () => {
    expect(splitEqual(100, ["a", "b", "c"])).toEqual({ a: 34, b: 33, c: 33 });
    expect(splitEqual(101, ["a", "b", "c"])).toEqual({ a: 34, b: 34, c: 33 });
  });

  it("splits one cent among three so that exactly one member gets it", () => {
    expect(splitEqual(1, ["a", "b", "c"])).toEqual({ a: 1, b: 0, c: 0 });
  });

  it("gives a single participant the whole amount", () => {
    expect(splitEqual(777, ["a"])).toEqual({ a: 777 });
  });

  it("gives everyone zero for a zero total", () => {
    expect(splitEqual(0, ["a", "b"])).toEqual({ a: 0, b: 0 });
  });

  it("rejects an empty participant list and duplicates", () => {
    expect(() => splitEqual(100, [])).toThrow(RangeError);
    expect(() => splitEqual(100, ["a", "a"])).toThrow(RangeError);
  });

  it("rejects floating-point and negative totals", () => {
    expect(() => splitEqual(10.5, ["a", "b"])).toThrow(RangeError);
    expect(() => splitEqual(-100, ["a", "b"])).toThrow(RangeError);
  });

  it("always adds up to the total and shares differ by at most 1 cent", () => {
    const random = seededRandom(1);
    for (let i = 0; i < 500; i++) {
      const total = randomInt(random, 0, 1_000_000);
      const n = randomInt(random, 1, 12);
      const ids = Array.from({ length: n }, (_, k) => `m${k}`);
      const shares = splitEqual(total, ids);
      const values = Object.values(shares);
      expect(sum(shares)).toBe(total);
      expect(Math.max(...values) - Math.min(...values)).toBeLessThanOrEqual(1);
    }
  });
});

describe("splitByAmounts", () => {
  it("returns the fixed amounts", () => {
    expect(splitByAmounts(1000, { a: 700, b: 300 })).toEqual({
      a: 700,
      b: 300,
    });
  });

  it("allows a zero share", () => {
    expect(splitByAmounts(500, { a: 500, b: 0 })).toEqual({ a: 500, b: 0 });
  });

  it("rejects amounts that do not add up to the total", () => {
    expect(() => splitByAmounts(1000, { a: 700, b: 200 })).toThrow(RangeError);
    expect(() => splitByAmounts(1000, { a: 700, b: 400 })).toThrow(RangeError);
  });

  it("rejects negative and fractional amounts", () => {
    expect(() => splitByAmounts(1000, { a: 1500, b: -500 })).toThrow(
      RangeError,
    );
    expect(() => splitByAmounts(1000, { a: 500.5, b: 499.5 })).toThrow(
      RangeError,
    );
  });

  it("does not mutate the input object", () => {
    const input = { a: 600, b: 400 };
    const result = splitByAmounts(1000, input);
    result.a = 0;
    expect(input.a).toBe(600);
  });
});

describe("splitByPercent", () => {
  it("splits 50/50", () => {
    expect(splitByPercent(1000, { a: 50, b: 50 })).toEqual({ a: 500, b: 500 });
  });

  it("splits 70/30", () => {
    expect(splitByPercent(1000, { a: 70, b: 30 })).toEqual({ a: 700, b: 300 });
  });

  it("rounds so that the shares add up to the total", () => {
    // 33.33 % / 33.33 % / 33.34 % of one euro: 33 + 33 + 33 is one cent short,
    // and the member with the largest fractional part (the third) gets it
    expect(splitByPercent(100, { a: 33.33, b: 33.33, c: 33.34 })).toEqual({
      a: 33,
      b: 33,
      c: 34,
    });
  });

  it("gives the extra cent to the first member on a tie", () => {
    expect(splitByPercent(1001, { a: 50, b: 50 })).toEqual({ a: 501, b: 500 });
  });

  it("allows 0 % for one member and 100 % for another", () => {
    expect(splitByPercent(999, { a: 100, b: 0 })).toEqual({ a: 999, b: 0 });
  });

  it("rejects percentages that do not add up to 100", () => {
    expect(() => splitByPercent(1000, { a: 50, b: 40 })).toThrow(RangeError);
    expect(() => splitByPercent(1000, { a: 60, b: 50 })).toThrow(RangeError);
  });

  it("rejects more than two decimals and negative percentages", () => {
    expect(() => splitByPercent(1000, { a: 33.333, b: 66.667 })).toThrow(
      RangeError,
    );
    expect(() => splitByPercent(1000, { a: 120, b: -20 })).toThrow(RangeError);
  });

  it("always adds up to the total and each share is within 1 cent of exact", () => {
    const random = seededRandom(2);
    for (let i = 0; i < 500; i++) {
      const total = randomInt(random, 0, 1_000_000);
      const n = randomInt(random, 1, 8);

      // Random hundredths of a percent that add up to 10000
      const cuts = Array.from({ length: n - 1 }, () =>
        randomInt(random, 0, 10000),
      ).sort((x, y) => x - y);
      const bps = [...cuts, 10000].map((cut, k) => cut - (cuts[k - 1] ?? 0));

      const percents: Record<string, number> = {};
      bps.forEach((bp, k) => (percents[`m${k}`] = bp / 100));

      const shares = splitByPercent(total, percents);
      expect(sum(shares)).toBe(total);

      bps.forEach((bp, k) => {
        const exact = (total * bp) / 10000;
        expect(Math.abs(shares[`m${k}`] - exact)).toBeLessThan(1);
      });
    }
  });
});
