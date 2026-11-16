import { describe, expect, it } from "vitest";
import {
  parseEuros,
  parseIsoDate,
  parsePercentHundredths,
} from "@/lib/expenses/parse";

describe("parseEuros", () => {
  it.each([
    ["12,50", 1250],
    ["12.50", 1250],
    ["12,5", 1250],
    ["12", 1200],
    ["0,05", 5],
    ["0", 0],
    ["  7,00  ", 700],
    ["1 000,25", 100025],
    ["1 000", 100000],
  ])("parses %j as %i cents", (text, cents) => {
    expect(parseEuros(text)).toBe(cents);
  });

  it("avoids floating-point errors", () => {
    expect(parseEuros("0,1")).toBe(10);
    expect(parseEuros("0,29")).toBe(29);
    expect(parseEuros("1,15")).toBe(115);
  });

  it.each([
    "",
    " ",
    "abc",
    "-5",
    "+5",
    "1,234",
    "1.2.3",
    "12,",
    ",5",
    "1e3",
    "5 €",
    "NaN",
    "9999999999",
  ])("rejects %j", (text) => {
    expect(parseEuros(text)).toBeNull();
  });

  it("rejects non-strings", () => {
    expect(parseEuros(null)).toBeNull();
    expect(parseEuros(12)).toBeNull();
    expect(parseEuros(undefined)).toBeNull();
  });
});

describe("parsePercentHundredths", () => {
  it("parses whole and fractional percentages", () => {
    expect(parsePercentHundredths("100")).toBe(10000);
    expect(parsePercentHundredths("33,33")).toBe(3333);
    expect(parsePercentHundredths("0,5")).toBe(50);
  });
});

describe("parseIsoDate", () => {
  it("accepts real dates, including a leap day", () => {
    expect(parseIsoDate("2026-11-16")).toBe("2026-11-16");
    expect(parseIsoDate("2028-02-29")).toBe("2028-02-29");
  });

  it.each([
    "2026-02-30",
    "2027-02-29",
    "2026-13-01",
    "2026-00-10",
    "2026-1-1",
    "16.11.2026",
    "",
    "x",
  ])("rejects %j", (text) => {
    expect(parseIsoDate(text)).toBeNull();
  });

  it("rejects non-strings", () => {
    expect(parseIsoDate(null)).toBeNull();
  });
});
