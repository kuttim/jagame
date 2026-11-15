import { describe, expect, it } from "vitest";
import {
  cleanName,
  isDuplicateName,
  validateName,
} from "@/lib/groups/validation";

describe("cleanName", () => {
  it("trims and collapses whitespace", () => {
    expect(cleanName("  Rootsi   \t reis ")).toBe("Rootsi reis");
  });

  it("returns an empty string for non-strings", () => {
    expect(cleanName(null)).toBe("");
    expect(cleanName(42)).toBe("");
    expect(cleanName(undefined)).toBe("");
  });
});

describe("validateName", () => {
  it("accepts a normal name and returns the cleaned value", () => {
    expect(validateName("  Mari  Maasikas ", 50)).toEqual({
      ok: true,
      value: "Mari Maasikas",
    });
  });

  it("rejects empty and whitespace-only names", () => {
    expect(validateName("", 50)).toEqual({ ok: false, problem: "required" });
    expect(validateName("   ", 50)).toEqual({ ok: false, problem: "required" });
    expect(validateName(null, 50)).toEqual({ ok: false, problem: "required" });
  });

  it("allows exactly the maximum length and rejects one more", () => {
    expect(validateName("a".repeat(10), 10).ok).toBe(true);
    expect(validateName("a".repeat(11), 10)).toEqual({
      ok: false,
      problem: "too_long",
    });
  });

  it("counts characters, not UTF-16 units (emoji are one character)", () => {
    expect(validateName("😀".repeat(10), 10).ok).toBe(true);
    expect(validateName("😀".repeat(11), 10).ok).toBe(false);
  });
});

describe("isDuplicateName", () => {
  it("ignores case, including Estonian letters", () => {
    expect(isDuplicateName("mari", ["Mari", "Karl"])).toBe(true);
    expect(isDuplicateName("ÕNNE", ["õnne"])).toBe(true);
  });

  it("is false for different names and an empty list", () => {
    expect(isDuplicateName("Liis", ["Mari", "Karl"])).toBe(false);
    expect(isDuplicateName("Liis", [])).toBe(false);
  });
});
