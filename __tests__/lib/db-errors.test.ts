import { describe, expect, it } from "vitest";
import { isUniqueViolation } from "@/lib/db-errors";

describe("isUniqueViolation", () => {
  it("recognizes Prisma's unique constraint error code", () => {
    expect(isUniqueViolation({ code: "P2002" })).toBe(true);
    expect(
      isUniqueViolation(Object.assign(new Error("x"), { code: "P2002" })),
    ).toBe(true);
  });

  it("ignores other errors and non-errors", () => {
    expect(isUniqueViolation({ code: "P2003" })).toBe(false);
    expect(isUniqueViolation(new Error("P2002"))).toBe(false);
    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation("P2002")).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
  });
});
