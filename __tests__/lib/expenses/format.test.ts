import { describe, expect, it } from "vitest";
import {
  centsToInput,
  formatDateEt,
  hundredthsToInput,
  sharesToPercentHundredths,
} from "@/lib/expenses/format";
import { parseEuros } from "@/lib/expenses/parse";

describe("centsToInput", () => {
  it("formats with a decimal comma and always two decimals", () => {
    expect(centsToInput(1250)).toBe("12,50");
    expect(centsToInput(5)).toBe("0,05");
    expect(centsToInput(100000)).toBe("1000,00");
  });

  it("round-trips with parseEuros", () => {
    for (const cents of [1, 99, 100, 1234, 99999999]) {
      expect(parseEuros(centsToInput(cents))).toBe(cents);
    }
  });
});

describe("hundredthsToInput", () => {
  it("drops trailing zeros", () => {
    expect(hundredthsToInput(10000)).toBe("100");
    expect(hundredthsToInput(3333)).toBe("33,33");
    expect(hundredthsToInput(5050)).toBe("50,5");
    expect(hundredthsToInput(5005)).toBe("50,05");
  });
});

describe("formatDateEt", () => {
  it("turns an ISO date into day.month.year", () => {
    expect(formatDateEt("2026-11-16")).toBe("16.11.2026");
  });
});

describe("sharesToPercentHundredths", () => {
  it("always adds up to exactly 10000", () => {
    const result = sharesToPercentHundredths({ a: 34, b: 33, c: 33 }, 100);
    expect(Object.values(result).reduce((x, y) => x + y, 0)).toBe(10000);
    expect(result).toEqual({ a: 3400, b: 3300, c: 3300 });
  });

  it("handles shares that do not divide evenly", () => {
    const result = sharesToPercentHundredths({ a: 1, b: 1, c: 1 }, 3);
    expect(Object.values(result).reduce((x, y) => x + y, 0)).toBe(10000);
    expect(result).toEqual({ a: 3334, b: 3333, c: 3333 });
  });
});
