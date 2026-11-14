import { describe, expect, it } from "vitest";
import { assertCents, formatEuro } from "./money";

describe("formatEuro", () => {
  it("formats cents as euros with a comma and two decimals", () => {
    expect(formatEuro(1250)).toBe("12,50 €");
    expect(formatEuro(100000)).toBe("1000,00 €");
  });

  it("pads single-digit cents with a zero", () => {
    expect(formatEuro(5)).toBe("0,05 €");
    expect(formatEuro(0)).toBe("0,00 €");
    expect(formatEuro(101)).toBe("1,01 €");
  });

  it("shows negative amounts with a minus sign", () => {
    expect(formatEuro(-1250)).toBe("-12,50 €");
    expect(formatEuro(-5)).toBe("-0,05 €");
  });

  it("rejects floating-point amounts", () => {
    expect(() => formatEuro(12.5)).toThrow(RangeError);
  });
});

describe("assertCents", () => {
  it("accepts integers", () => {
    expect(() => assertCents(0)).not.toThrow();
    expect(() => assertCents(-300)).not.toThrow();
  });

  it("rejects fractions, NaN and Infinity", () => {
    expect(() => assertCents(0.1 + 0.2)).toThrow(RangeError);
    expect(() => assertCents(NaN)).toThrow(RangeError);
    expect(() => assertCents(Infinity)).toThrow(RangeError);
  });
});
