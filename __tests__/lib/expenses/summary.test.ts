import { describe, expect, it } from "vitest";
import {
  computeGroupSummary,
  isSuggestedTransfer,
  toCalculationExpenses,
  type StoredExpense,
} from "@/lib/expenses/summary";

const members = [
  { id: "mari", name: "Mari" },
  { id: "karl", name: "Karl" },
  { id: "liis", name: "Liis" },
];

/** The example on the landing page: 180 € in total, split equally. */
const lisbon: StoredExpense[] = [
  {
    payerId: "mari",
    amount: 12000,
    shares: [
      { memberId: "mari", amount: 4000 },
      { memberId: "karl", amount: 4000 },
      { memberId: "liis", amount: 4000 },
    ],
  },
  {
    payerId: "karl",
    amount: 4500,
    shares: [
      { memberId: "mari", amount: 1500 },
      { memberId: "karl", amount: 1500 },
      { memberId: "liis", amount: 1500 },
    ],
  },
  {
    payerId: "liis",
    amount: 1500,
    shares: [
      { memberId: "mari", amount: 500 },
      { memberId: "karl", amount: 500 },
      { memberId: "liis", amount: 500 },
    ],
  },
];

describe("toCalculationExpenses", () => {
  it("turns share rows into a member -> cents record", () => {
    expect(toCalculationExpenses([lisbon[2]])).toEqual([
      { payerId: "liis", amount: 1500, shares: { mari: 500, karl: 500, liis: 500 } },
    ]);
  });
});

describe("computeGroupSummary", () => {
  it("matches the landing page example: Liis -> Mari 45 €, Karl -> Mari 15 €", () => {
    const summary = computeGroupSummary(members, lisbon);

    expect(summary.total).toBe(18000);
    expect(summary.rows).toEqual([
      { id: "mari", name: "Mari", paid: 12000, owed: 6000, settled: 0, balance: 6000 },
      { id: "karl", name: "Karl", paid: 4500, owed: 6000, settled: 0, balance: -1500 },
      { id: "liis", name: "Liis", paid: 1500, owed: 6000, settled: 0, balance: -4500 },
    ]);
    expect(summary.transfers).toHaveLength(2);
    expect(summary.transfers).toContainEqual({ fromId: "liis", toId: "mari", amount: 4500 });
    expect(summary.transfers).toContainEqual({ fromId: "karl", toId: "mari", amount: 1500 });
  });

  it("always has balances adding up to zero, also with uneven cents", () => {
    const uneven: StoredExpense[] = [
      {
        payerId: "mari",
        amount: 100,
        shares: [
          { memberId: "mari", amount: 34 },
          { memberId: "karl", amount: 33 },
          { memberId: "liis", amount: 33 },
        ],
      },
    ];
    const summary = computeGroupSummary(members, uneven);
    expect(summary.rows.reduce((sum, row) => sum + row.balance, 0)).toBe(0);
    expect(summary.transfers.reduce((sum, t) => sum + t.amount, 0)).toBe(66);
  });

  it("applying the suggested transfers brings everyone to zero", () => {
    const summary = computeGroupSummary(members, lisbon);
    const after = Object.fromEntries(summary.rows.map((row) => [row.id, row.balance]));
    for (const t of summary.transfers) {
      after[t.fromId] += t.amount;
      after[t.toId] -= t.amount;
    }
    expect(Object.values(after)).toEqual([0, 0, 0]);
  });

  it("handles a payer who is not part of the split", () => {
    const summary = computeGroupSummary(members, [
      {
        payerId: "mari",
        amount: 1000,
        shares: [
          { memberId: "karl", amount: 500 },
          { memberId: "liis", amount: 500 },
        ],
      },
    ]);
    expect(summary.rows.map((row) => row.balance)).toEqual([1000, -500, -500]);
  });

  it("has no transfers and zero balances for a group without expenses", () => {
    const summary = computeGroupSummary(members, []);
    expect(summary.total).toBe(0);
    expect(summary.transfers).toEqual([]);
    expect(summary.rows.every((row) => row.balance === 0)).toBe(true);
  });

  it("has no transfers when everyone paid exactly their own share", () => {
    const summary = computeGroupSummary(members, [
      { payerId: "mari", amount: 100, shares: [{ memberId: "mari", amount: 100 }] },
      { payerId: "karl", amount: 200, shares: [{ memberId: "karl", amount: 200 }] },
    ]);
    expect(summary.transfers).toEqual([]);
  });

  it("keeps the order of the members it is given", () => {
    const summary = computeGroupSummary([...members].reverse(), lisbon);
    expect(summary.rows.map((row) => row.id)).toEqual(["liis", "karl", "mari"]);
  });

  it("throws instead of showing wrong balances when shares do not add up", () => {
    expect(() =>
      computeGroupSummary(members, [
        { payerId: "mari", amount: 100, shares: [{ memberId: "karl", amount: 90 }] },
      ]),
    ).toThrow(RangeError);
  });

  it("throws for an expense that points at an unknown member", () => {
    expect(() =>
      computeGroupSummary(members, [
        { payerId: "ghost", amount: 100, shares: [{ memberId: "karl", amount: 100 }] },
      ]),
    ).toThrow(RangeError);
  });
});

describe("computeGroupSummary with payments", () => {
  it("counts a made payment: the debt disappears from the suggestions", () => {
    const summary = computeGroupSummary(members, lisbon, [
      { fromMemberId: "liis", toMemberId: "mari", amount: 4500 },
    ]);
    const byId = Object.fromEntries(summary.rows.map((row) => [row.id, row]));
    expect(byId.liis).toMatchObject({ paid: 1500, owed: 6000, settled: 4500, balance: 0 });
    expect(byId.mari).toMatchObject({ settled: -4500, balance: 1500 });
    expect(summary.transfers).toEqual([{ fromId: "karl", toId: "mari", amount: 1500 }]);
  });

  it("is all settled once every suggested transfer has been paid", () => {
    const first = computeGroupSummary(members, lisbon);
    const payments = first.transfers.map((t) => ({
      fromMemberId: t.fromId,
      toMemberId: t.toId,
      amount: t.amount,
    }));
    const after = computeGroupSummary(members, lisbon, payments);
    expect(after.transfers).toEqual([]);
    expect(after.rows.every((row) => row.balance === 0)).toBe(true);
  });

  it("handles a partial payment: only the rest is still suggested", () => {
    const summary = computeGroupSummary(members, lisbon, [
      { fromMemberId: "liis", toMemberId: "mari", amount: 2000 },
    ]);
    expect(summary.transfers).toContainEqual({ fromId: "liis", toId: "mari", amount: 2500 });
  });

  it("keeps balances adding up to zero with payments, and does not change the total spent", () => {
    const summary = computeGroupSummary(members, lisbon, [
      { fromMemberId: "karl", toMemberId: "liis", amount: 999 },
    ]);
    expect(summary.rows.reduce((sum, row) => sum + row.balance, 0)).toBe(0);
    expect(summary.total).toBe(18000);
  });

  it("an overpayment makes the payer a creditor instead of breaking", () => {
    // Liis owes 45 € but sends 50 €, so she is owed 5 € and Karl pays both Mari and her.
    const summary = computeGroupSummary(members, lisbon, [
      { fromMemberId: "liis", toMemberId: "mari", amount: 5000 },
    ]);
    const byId = Object.fromEntries(summary.rows.map((row) => [row.id, row.balance]));
    expect(byId).toEqual({ mari: 1000, karl: -1500, liis: 500 });
    expect(summary.transfers).toContainEqual({ fromId: "karl", toId: "mari", amount: 1000 });
    expect(summary.transfers).toContainEqual({ fromId: "karl", toId: "liis", amount: 500 });
  });

  it("throws for a payment that involves an unknown member", () => {
    expect(() =>
      computeGroupSummary(members, lisbon, [
        { fromMemberId: "ghost", toMemberId: "mari", amount: 100 },
      ]),
    ).toThrow(RangeError);
  });
});

describe("isSuggestedTransfer", () => {
  const suggested = [{ fromId: "liis", toId: "mari", amount: 4500 }];

  it("accepts exactly a suggested transfer", () => {
    expect(isSuggestedTransfer(suggested, { fromId: "liis", toId: "mari", amount: 4500 })).toBe(true);
  });

  it("rejects a different amount, direction or people", () => {
    expect(isSuggestedTransfer(suggested, { fromId: "liis", toId: "mari", amount: 4499 })).toBe(false);
    expect(isSuggestedTransfer(suggested, { fromId: "mari", toId: "liis", amount: 4500 })).toBe(false);
    expect(isSuggestedTransfer(suggested, { fromId: "karl", toId: "mari", amount: 4500 })).toBe(false);
    expect(isSuggestedTransfer([], { fromId: "liis", toId: "mari", amount: 4500 })).toBe(false);
  });
});
