import { describe, expect, it } from "vitest";
import { splitEqual } from "./splitting";
import { formatEuro } from "./money";
import { computeBalances, type Balances, type Transfer } from "./balances";
import { settle } from "./settlement";
import { randomInt, seededRandom } from "./test-utils";

/** Applies transfers to balances, as a real payment would. */
function apply(balances: Balances, transfers: Transfer[]): Balances {
  const result = { ...balances };
  for (const t of transfers) {
    result[t.fromId] += t.amount;
    result[t.toId] -= t.amount;
  }
  return result;
}

describe("settle", () => {
  it("returns an empty plan when everyone is settled", () => {
    expect(settle({})).toEqual([]);
    expect(settle({ a: 0, b: 0 })).toEqual([]);
  });

  it("makes one transfer for one debtor and one creditor", () => {
    expect(settle({ mari: 1250, jaan: -1250 })).toEqual([
      { fromId: "jaan", toId: "mari", amount: 1250 },
    ]);
  });

  it("handles several debtors paying one creditor", () => {
    const transfers = settle({ mari: 2000, jaan: -1000, kati: -1000 });
    expect(transfers).toHaveLength(2);
    expect(transfers).toContainEqual({
      fromId: "jaan",
      toId: "mari",
      amount: 1000,
    });
    expect(transfers).toContainEqual({
      fromId: "kati",
      toId: "mari",
      amount: 1000,
    });
  });

  it("matches exact pairs directly to keep the transfer count low", () => {
    const balances = { a: 500, b: 300, c: -500, d: -300 };
    const transfers = settle(balances);
    expect(transfers).toHaveLength(2);
    expect(transfers).toContainEqual({ fromId: "c", toId: "a", amount: 500 });
    expect(transfers).toContainEqual({ fromId: "d", toId: "b", amount: 300 });
  });

  it("splits a debt across several creditors when there is no exact pair", () => {
    // a is owed 700, b is owed 300, c owes 1000
    const transfers = settle({ a: 700, b: 300, c: -1000 });
    expect(transfers).toHaveLength(2);
    expect(apply({ a: 700, b: 300, c: -1000 }, transfers)).toEqual({
      a: 0,
      b: 0,
      c: 0,
    });
  });

  it("leaves members with a zero balance out of the plan", () => {
    const transfers = settle({ a: 100, b: 0, c: -100 });
    expect(transfers).toEqual([{ fromId: "c", toId: "a", amount: 100 }]);
  });

  it("returns the same result for the same input", () => {
    const balances = { a: 300, b: 300, c: -200, d: -200, e: -200 };
    expect(settle(balances)).toEqual(settle({ ...balances }));
  });

  it("does not mutate the input", () => {
    const balances = { a: 700, b: 300, c: -1000 };
    settle(balances);
    expect(balances).toEqual({ a: 700, b: 300, c: -1000 });
  });

  it("rejects balances that do not add up to 0", () => {
    expect(() => settle({ a: 100, b: -50 })).toThrow(RangeError);
  });

  it("rejects floating-point balances", () => {
    expect(() => settle({ a: 0.5, b: -0.5 })).toThrow(RangeError);
  });

  it("settles every balance with fewer transfers than non-zero members (random balances)", () => {
    const random = seededRandom(4);
    for (let i = 0; i < 500; i++) {
      const n = randomInt(random, 1, 10);
      const ids = Array.from({ length: n }, (_, k) => `m${k}`);

      // Random balances that add up to 0
      const balances: Balances = {};
      let running = 0;
      ids.forEach((id, k) => {
        if (k === n - 1) {
          balances[id] = 0 - running; // not -running, which would give -0
        } else {
          balances[id] = randomInt(random, -50_000, 50_000);
          running += balances[id];
        }
      });

      const transfers = settle(balances);
      const nonZero = Object.values(balances).filter((b) => b !== 0).length;

      expect(apply(balances, transfers)).toEqual(
        Object.fromEntries(ids.map((id) => [id, 0])),
      );
      expect(transfers.length).toBeLessThanOrEqual(Math.max(nonZero - 1, 0));
      for (const t of transfers) {
        expect(t.amount).toBeGreaterThan(0);
        expect(t.fromId).not.toBe(t.toId);
      }
    }
  });
});

describe("expenses -> balances -> settlement", () => {
  it("trip example: all balances are 0 after the suggested transfers", () => {
    const members = ["mari", "jaan", "kati"];
    const expenses = [
      // Mari paid 123.45 € for food for everyone (rounding by 0 cents here)
      { payerId: "mari", amount: 12345, shares: splitEqual(12345, members) },
      // Jaan paid 60.00 € for petrol for Mari and Jaan
      {
        payerId: "jaan",
        amount: 6000,
        shares: splitEqual(6000, ["mari", "jaan"]),
      },
      // Kati paid 0.01 € (rounding edge case): split three ways
      { payerId: "kati", amount: 1, shares: splitEqual(1, members) },
    ];

    const balances = computeBalances(members, expenses);
    expect(Object.values(balances).reduce((a, b) => a + b, 0)).toBe(0);

    const transfers = settle(balances);
    const after = computeBalances(members, expenses, transfers);
    expect(after).toEqual({ mari: 0, jaan: 0, kati: 0 });
  });

  it("README example: Mari pays Jaan 12,50 €", () => {
    const members = ["mari", "jaan"];
    const expenses = [
      { payerId: "jaan", amount: 2500, shares: splitEqual(2500, members) },
    ];
    const [transfer] = settle(computeBalances(members, expenses));
    expect(
      `${transfer.fromId} pays ${transfer.toId} ${formatEuro(transfer.amount)}`,
    ).toBe("mari pays jaan 12,50 €");
  });
});
