import { describe, expect, it } from "vitest";
import { entriesNewestFirst, getDays, type DevlogDay } from "@/lib/devlog";

const day: DevlogDay = {
  date: "2026-11-16",
  entries: [
    { time: "09:00", text: "Esimene", idea: null },
    { time: "12:30", text: "Teine", idea: null },
    { time: "18:27", text: "Kolmas", idea: null },
  ],
};

describe("entriesNewestFirst", () => {
  it("puts the last entry of the file first", () => {
    expect(entriesNewestFirst(day).map((e) => e.text)).toEqual([
      "Kolmas",
      "Teine",
      "Esimene",
    ]);
  });

  it("does not change the day it is given", () => {
    entriesNewestFirst(day);
    expect(day.entries.map((e) => e.text)).toEqual(["Esimene", "Teine", "Kolmas"]);
  });

  it("handles a day with one entry and an empty day", () => {
    expect(entriesNewestFirst({ date: "x", entries: [day.entries[0]] })).toHaveLength(1);
    expect(entriesNewestFirst({ date: "x", entries: [] })).toEqual([]);
  });

  it("keeps all entries of the real diary", () => {
    for (const real of getDays()) {
      const reversed = entriesNewestFirst(real);
      expect(reversed).toHaveLength(real.entries.length);
      expect(reversed[0]).toBe(real.entries[real.entries.length - 1]);
    }
  });
});
