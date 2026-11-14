import { describe, expect, it } from "vitest";
import { splitEqual } from "./splitting";
import { computeBalances, computeSummaries, type Expense } from "./balances";
import { randomInt, seededRandom } from "./test-utils";

const members = ["mari", "jaan", "kati"];

function equalExpense(
  payerId: string,
  amount: number,
  among: string[],
): Expense {
  return { payerId, amount, shares: splitEqual(amount, among) };
}

describe("computeBalances", () => {
  it("gives every member a zero balance when there are no expenses", () => {
    expect(computeBalances(members, [])).toEqual({
      mari: 0,
      jaan: 0,
      kati: 0,
    });
  });

  it("handles one expense where the payer is also a participant", () => {
    const balances = computeBalances(members, [
      equalExpense("mari", 3000, members),
    ]);
    expect(balances).toEqual({ mari: 2000, jaan: -1000, kati: -1000 });
  });

  it("gives a payer who is not a participant the full amount back", () => {
    const balances = computeBalances(members, [
      equalExpense("mari", 1000, ["jaan", "kati"]),
    ]);
    expect(balances).toEqual({ mari: 1000, jaan: -500, kati: -500 });
  });

  it("adds up several expenses", () => {
    const balances = computeBalances(members, [
      equalExpense("mari", 3000, members), // mari +2000, jaan -1000, kati -1000
      equalExpense("jaan", 900, members), //  jaan +600,  mari -300,  kati -300
    ]);
    expect(balances).toEqual({ mari: 1700, jaan: -400, kati: -1300 });
  });

  it("keeps balances adding up to zero despite a rounding cent", () => {
    const balances = computeBalances(members, [
      equalExpense("mari", 100, members),
    ]);
    // 34 + 33 + 33; mari paid 100 and her share is 34
    expect(balances).toEqual({ mari: 66, jaan: -33, kati: -33 });
  });

  it("reduces the debt for the sender and the credit for the receiver", () => {
    const expenses = [equalExpense("mari", 3000, members)];
    const balances = computeBalances(members, expenses, [
      { fromId: "jaan", toId: "mari", amount: 1000 },
    ]);
    expect(balances).toEqual({ mari: 1000, jaan: 0, kati: -1000 });
  });

  it("settles every balance to zero once all transfers are made", () => {
    const expenses = [equalExpense("mari", 3000, members)];
    const balances = computeBalances(members, expenses, [
      { fromId: "jaan", toId: "mari", amount: 1000 },
      { fromId: "kati", toId: "mari", amount: 1000 },
    ]);
    expect(balances).toEqual({ mari: 0, jaan: 0, kati: 0 });
  });

  it("rejects unknown members", () => {
    expect(() =>
      computeBalances(members, [equalExpense("mari", 100, ["mari", "liis"])]),
    ).toThrow(RangeError);
    expect(() =>
      computeBalances(members, [equalExpense("liis", 100, members)]),
    ).toThrow(RangeError);
    expect(() =>
      computeBalances(members, [], [{ fromId: "liis", toId: "mari", amount: 1 }]),
    ).toThrow(RangeError);
  });

  it("rejects shares that do not add up to the expense amount", () => {
    const bad: Expense = {
      payerId: "mari",
      amount: 1000,
      shares: { mari: 500, jaan: 400 },
    };
    expect(() => computeBalances(members, [bad])).toThrow(RangeError);
  });

  it("rejects floating-point amounts", () => {
    const bad: Expense = {
      payerId: "mari",
      amount: 10.5,
      shares: { mari: 10.5 },
    };
    expect(() => computeBalances(members, [bad])).toThrow(RangeError);
  });

  it("always adds up to zero (random expenses and transfers)", () => {
    const random = seededRandom(3);
    for (let i = 0; i < 300; i++) {
      const n = randomInt(random, 2, 8);
      const ids = Array.from({ length: n }, (_, k) => `m${k}`);
      const expenses = Array.from(
        { length: randomInt(random, 0, 15) },
        () => {
          const among = ids.filter(() => random() < 0.6);
          const participants = among.length > 0 ? among : [ids[0]];
          return equalExpense(
            ids[randomInt(random, 0, n - 1)],
            randomInt(random, 0, 500_000),
            participants,
          );
        },
      );
      const transfers = Array.from({ length: randomInt(random, 0, 5) }, () => ({
        fromId: ids[randomInt(random, 0, n - 1)],
        toId: ids[randomInt(random, 0, n - 1)],
        amount: randomInt(random, 0, 10_000),
      }));

      const balances = computeBalances(ids, expenses, transfers);
      const total = Object.values(balances).reduce((a, b) => a + b, 0);
      expect(total).toBe(0);
    }
  });
});

describe("computeSummaries", () => {
  it("shows what each member paid, owes and their balance", () => {
    const summaries = computeSummaries(members, [
      equalExpense("mari", 3000, members),
    ]);
    expect(summaries.mari).toEqual({
      paid: 3000,
      owed: 1000,
      settled: 0,
      balance: 2000,
    });
    expect(summaries.jaan).toEqual({
      paid: 0,
      owed: 1000,
      settled: 0,
      balance: -1000,
    });
  });

  it("shows transfers separately", () => {
    const summaries = computeSummaries(
      members,
      [equalExpense("mari", 3000, members)],
      [{ fromId: "jaan", toId: "mari", amount: 1000 }],
    );
    expect(summaries.jaan.settled).toBe(1000);
    expect(summaries.mari.settled).toBe(-1000);
    expect(summaries.jaan.balance).toBe(0);
  });
});
