import { describe, expect, it } from "vitest";
import {
  MAX_AMOUNT,
  validateExpense,
  type ExpenseInput,
} from "@/lib/expenses/validation";

const memberIds = ["a", "b", "c"];

function input(overrides: Partial<ExpenseInput> = {}): ExpenseInput {
  return {
    description: "Õhtusöök",
    amount: "30,00",
    date: "2026-11-16",
    payerId: "a",
    splitType: "EQUAL",
    participants: { a: "", b: "", c: "" },
    memberIds,
    ...overrides,
  };
}

function errorsOf(overrides: Partial<ExpenseInput>) {
  const result = validateExpense(input(overrides));
  if (result.ok) throw new Error("expected validation to fail");
  return result.errors;
}

function sum(values: Record<string, number>) {
  return Object.values(values).reduce((x, y) => x + y, 0);
}

describe("validateExpense: success", () => {
  it("splits equally and cleans the values", () => {
    const result = validateExpense(input({ description: "  Õhtu   söök " }));
    expect(result).toEqual({
      ok: true,
      value: {
        description: "Õhtu söök",
        amount: 3000,
        date: "2026-11-16",
        payerId: "a",
        splitType: "EQUAL",
        shares: { a: 1000, b: 1000, c: 1000 },
      },
    });
  });

  it("splits an amount that does not divide evenly without losing a cent", () => {
    const result = validateExpense(input({ amount: "1,00" }));
    expect(result.ok && sum(result.value.shares)).toBe(100);
  });

  it("lets the payer stay out of the split", () => {
    const result = validateExpense(input({ participants: { b: "", c: "" } }));
    expect(result.ok && result.value.shares).toEqual({ b: 1500, c: 1500 });
  });

  it("accepts fixed amounts that add up to the total", () => {
    const result = validateExpense(
      input({
        splitType: "AMOUNTS",
        participants: { a: "10", b: "5,50", c: "14,50" },
      }),
    );
    expect(result.ok && result.value.shares).toEqual({
      a: 1000,
      b: 550,
      c: 1450,
    });
  });

  it("accepts percentages that add up to 100", () => {
    const result = validateExpense(
      input({
        splitType: "PERCENT",
        participants: { a: "50", b: "25", c: "25" },
      }),
    );
    expect(result.ok && result.value.shares).toEqual({
      a: 1500,
      b: 750,
      c: 750,
    });
  });

  it("accepts percentages with decimals, rounding by largest remainder", () => {
    const result = validateExpense(
      input({
        amount: "1,00",
        splitType: "PERCENT",
        participants: { a: "33,34", b: "33,33", c: "33,33" },
      }),
    );
    expect(result.ok && sum(result.value.shares)).toBe(100);
  });
});

describe("validateExpense: fields", () => {
  it("requires a description of reasonable length", () => {
    expect(errorsOf({ description: "  " }).description).toBe("required");
    expect(errorsOf({ description: "x".repeat(101) }).description).toBe(
      "too_long",
    );
  });

  it("rejects bad amounts", () => {
    expect(errorsOf({ amount: "abc" }).amount).toBe("invalid");
    expect(errorsOf({ amount: "" }).amount).toBe("invalid");
    expect(errorsOf({ amount: "-5" }).amount).toBe("invalid");
    expect(errorsOf({ amount: "0" }).amount).toBe("zero");
    expect(errorsOf({ amount: "0,00" }).amount).toBe("zero");
  });

  it("accepts the largest amount and rejects one cent more", () => {
    expect(validateExpense(input({ amount: "1000000,00" })).ok).toBe(true);
    expect(MAX_AMOUNT).toBe(100_000_000);
    expect(errorsOf({ amount: "1000000,01" }).amount).toBe("too_large");
  });

  it("rejects impossible and out-of-range dates", () => {
    expect(errorsOf({ date: "2026-02-30" }).date).toBe("invalid");
    expect(errorsOf({ date: "" }).date).toBe("invalid");
    expect(errorsOf({ date: "1999-12-31" }).date).toBe("invalid");
    expect(errorsOf({ date: "2101-01-01" }).date).toBe("invalid");
  });

  it("requires the payer to be a member of the group", () => {
    expect(errorsOf({ payerId: "zzz" }).payer).toBe("invalid");
    expect(errorsOf({ payerId: undefined }).payer).toBe("invalid");
  });

  it("reports several problems at once", () => {
    const errors = errorsOf({ description: "", amount: "x", date: "no" });
    expect(Object.keys(errors).sort()).toEqual([
      "amount",
      "date",
      "description",
    ]);
  });
});

describe("validateExpense: split", () => {
  it("needs at least one participant", () => {
    expect(errorsOf({ participants: {} }).split).toEqual({
      code: "no_participants",
    });
  });

  it("needs at least one participant even when the amount is invalid", () => {
    expect(errorsOf({ amount: "x", participants: {} }).split).toEqual({
      code: "no_participants",
    });
  });

  it("rejects an unknown split type", () => {
    expect(errorsOf({ splitType: "WEIRD" }).split).toEqual({
      code: "invalid_type",
    });
    expect(errorsOf({ splitType: undefined }).split).toEqual({
      code: "invalid_type",
    });
  });

  it("rejects participants who are not in the group", () => {
    expect(errorsOf({ participants: { a: "", x: "" } }).split).toEqual({
      code: "unknown_participant",
    });
  });

  it("rejects amounts that do not add up, and says by how much", () => {
    expect(
      errorsOf({
        splitType: "AMOUNTS",
        participants: { a: "10", b: "10", c: "9" },
      }).split,
    ).toEqual({ code: "amount_sum", sum: 2900, total: 3000 });
  });

  it("rejects percentages that do not add up to 100", () => {
    expect(
      errorsOf({
        splitType: "PERCENT",
        participants: { a: "50", b: "30", c: "10" },
      }).split,
    ).toEqual({ code: "percent_sum", sum: 9000 });
  });

  it("rejects a missing or malformed number for a participant", () => {
    expect(
      errorsOf({
        splitType: "AMOUNTS",
        participants: { a: "10", b: "", c: "20" },
      }).split,
    ).toEqual({ code: "invalid_value" });
    expect(
      errorsOf({
        splitType: "PERCENT",
        participants: { a: "50", b: "abc", c: "50" },
      }).split,
    ).toEqual({ code: "invalid_value" });
  });

  it("ignores typed numbers for an equal split", () => {
    const result = validateExpense(
      input({ participants: { a: "junk", b: "", c: "" } }),
    );
    expect(result.ok).toBe(true);
  });
});
