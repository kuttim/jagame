import { describe, expect, it } from "vitest";
import { expensesCsv } from "@/lib/expenses/csv";
import { centsToInput, hundredthsToInput } from "@/lib/expenses/format";
import {
  computeGroupSummary,
  type StoredExpense,
  type StoredPayment,
} from "@/lib/expenses/summary";
import { validateExpense, type ExpenseInput } from "@/lib/expenses/validation";
import { randomInt, seededRandom } from "../helpers/random";

// These tests follow the whole path a real trip takes: what a person types
// into the expense form -> validation and splitting -> balances -> suggested
// transfers -> payments. The expected numbers in the first test were worked
// out by hand, not by running the code.

const members = [
  { id: "mari", name: "Mari" },
  { id: "karl", name: "Karl" },
  { id: "liis", name: "Liis" },
  { id: "jaan", name: "Jaan" },
];
const memberIds = members.map((m) => m.id);

/** Runs a form input through validation and returns the expense as it would be stored. */
function record(input: Omit<ExpenseInput, "memberIds">): StoredExpense {
  const result = validateExpense({ ...input, memberIds });
  if (!result.ok) throw new Error(`invalid expense: ${JSON.stringify(result.errors)}`);
  return {
    payerId: result.value.payerId,
    amount: result.value.amount,
    shares: Object.entries(result.value.shares).map(([memberId, amount]) => ({
      memberId,
      amount,
    })),
  };
}

const common = { date: "2026-11-14", splitType: "EQUAL" };

function swedenTrip(): StoredExpense[] {
  return [
    // 240,00 € ferry tickets, equal among four: 60,00 € each
    record({
      ...common,
      description: "Laevapiletid",
      amount: "240,00",
      payerId: "mari",
      participants: { mari: "", karl: "", liis: "", jaan: "" },
    }),
    // 450,00 € lodging by fixed amounts: Jaan had the smaller room
    record({
      ...common,
      description: "Majutus",
      amount: "450",
      payerId: "karl",
      splitType: "AMOUNTS",
      participants: { mari: "120", karl: "120", liis: "120", jaan: "90" },
    }),
    // 87,35 € groceries equally: 8735 / 4 does not divide, so three people get 21,84 € and one 21,83 €
    record({
      ...common,
      description: "Toit",
      amount: "87,35",
      payerId: "liis",
      participants: { mari: "", karl: "", liis: "", jaan: "" },
    }),
    // 199,99 € car hire by percent; Jaan did not ride
    record({
      ...common,
      description: "Autorent",
      amount: "199,99",
      payerId: "jaan",
      splitType: "PERCENT",
      participants: { mari: "40", karl: "30", liis: "30" },
    }),
    // 12,00 € ice cream for two
    record({
      ...common,
      description: "Jäätis",
      amount: "12",
      payerId: "mari",
      participants: { mari: "", liis: "" },
    }),
  ];
}

describe("a trip to Sweden, worked out by hand", () => {
  it("splits each expense into exactly its total", () => {
    const [ferry, lodging, groceries, car, iceCream] = swedenTrip();
    const byMember = (e: StoredExpense) =>
      Object.fromEntries(e.shares.map((s) => [s.memberId, s.amount]));

    expect(byMember(ferry)).toEqual({ mari: 6000, karl: 6000, liis: 6000, jaan: 6000 });
    expect(byMember(lodging)).toEqual({ mari: 12000, karl: 12000, liis: 12000, jaan: 9000 });
    // The three leftover cents go to the first three people
    expect(byMember(groceries)).toEqual({ mari: 2184, karl: 2184, liis: 2184, jaan: 2183 });
    // 40 % / 30 % / 30 % of 199,99 €: the two leftover cents go to the largest remainders
    expect(byMember(car)).toEqual({ mari: 7999, karl: 6000, liis: 6000 });
    expect(byMember(iceCream)).toEqual({ mari: 600, liis: 600 });
  });

  it("gives the balances calculated by hand", () => {
    const summary = computeGroupSummary(members, swedenTrip());
    const rows = Object.fromEntries(summary.rows.map((r) => [r.id, r]));

    // paid, owed, balance = paid - owed
    expect(rows.mari).toMatchObject({ paid: 25200, owed: 28783, balance: -3583 });
    expect(rows.karl).toMatchObject({ paid: 45000, owed: 26184, balance: 18816 });
    expect(rows.liis).toMatchObject({ paid: 8735, owed: 26784, balance: -18049 });
    expect(rows.jaan).toMatchObject({ paid: 19999, owed: 17183, balance: 2816 });
    expect(summary.total).toBe(98934);
    expect(summary.rows.reduce((sum, r) => sum + r.balance, 0)).toBe(0);
  });

  it("suggests fewer transfers than there are people, and they add up", () => {
    const summary = computeGroupSummary(members, swedenTrip());
    expect(summary.transfers.length).toBeLessThan(4);
    expect(summary.transfers).toContainEqual({ fromId: "liis", toId: "karl", amount: 18049 });
    expect(summary.transfers).toContainEqual({ fromId: "mari", toId: "jaan", amount: 2816 });
    expect(summary.transfers).toContainEqual({ fromId: "mari", toId: "karl", amount: 767 });
  });

  it("is settled once the suggested transfers have been paid one by one", () => {
    const expenses = swedenTrip();
    const payments: StoredPayment[] = [];
    let summary = computeGroupSummary(members, expenses, payments);

    let steps = 0;
    while (summary.transfers.length > 0) {
      const next = summary.transfers[0];
      payments.push({ fromMemberId: next.fromId, toMemberId: next.toId, amount: next.amount });
      summary = computeGroupSummary(members, expenses, payments);
      expect(++steps).toBeLessThan(10);
    }

    expect(payments).toHaveLength(3);
    expect(summary.rows.every((r) => r.balance === 0)).toBe(true);
    // Paying never changes how much was spent
    expect(summary.total).toBe(98934);
  });

  it("recalculates correctly after an expense is deleted", () => {
    const withoutIceCream = swedenTrip().slice(0, 4);
    const summary = computeGroupSummary(members, withoutIceCream);
    const balances = Object.fromEntries(summary.rows.map((r) => [r.id, r.balance]));

    // Mari paid 600 less and owes 600 less than before, Liis owes 600 less
    expect(balances).toEqual({ mari: -4183, karl: 18816, liis: -17449, jaan: 2816 });
    expect(summary.rows.reduce((sum, r) => sum + r.balance, 0)).toBe(0);
  });

  it("exports the trip as CSV that matches the screen", () => {
    const rows = swedenTrip().map((e, i) => ({
      date: "2026-11-14",
      description: ["Laevapiletid", "Majutus", "Toit", "Autorent", "Jäätis"][i],
      amount: e.amount,
      payerName: members.find((m) => m.id === e.payerId)!.name,
      splitType: ["EQUAL", "AMOUNTS", "EQUAL", "PERCENT", "EQUAL"][i],
      shares: e.shares,
    }));
    const lines = expensesCsv(members, rows).replace(/^﻿/, "").split("\r\n");
    expect(lines[4]).toBe("14.11.2026;Autorent;199,99;Jaan;Protsentidena;79,99;60,00;60,00;0,00");
  });
});

describe("random trips (invariants that must always hold)", () => {
  /** Random cents that add up to exactly `total`, one per participant. */
  function randomParts(random: () => number, total: number, count: number): number[] {
    const cuts = Array.from({ length: count - 1 }, () => randomInt(random, 0, total)).sort((a, b) => a - b);
    return [...cuts, total].map((cut, i) => cut - (i === 0 ? 0 : [...cuts, total][i - 1]));
  }

  function randomExpense(random: () => number, ids: string[]): ExpenseInput {
    const total = randomInt(random, 1, 500_000);
    const payerId = ids[randomInt(random, 0, ids.length - 1)];
    const count = randomInt(random, 1, ids.length);
    const chosen = [...ids].sort(() => random() - 0.5).slice(0, count);
    const kind = ["EQUAL", "AMOUNTS", "PERCENT"][randomInt(random, 0, 2)];

    const participants: Record<string, string> = {};
    if (kind === "EQUAL") for (const id of chosen) participants[id] = "";
    if (kind === "AMOUNTS") {
      randomParts(random, total, count).forEach((part, i) => (participants[chosen[i]] = centsToInput(part)));
    }
    if (kind === "PERCENT") {
      randomParts(random, 10000, count).forEach((part, i) => (participants[chosen[i]] = hundredthsToInput(part)));
    }

    return {
      description: "Juhuslik kulu",
      amount: centsToInput(total),
      date: "2026-11-14",
      payerId,
      splitType: kind,
      participants,
      memberIds: ids,
    };
  }

  it("keeps every invariant over 400 random trips", () => {
    const random = seededRandom(2026);

    for (let trip = 0; trip < 400; trip++) {
      const size = randomInt(random, 2, 7);
      const ids = Array.from({ length: size }, (_, i) => `m${i}`);
      const people = ids.map((id) => ({ id, name: id }));

      const stored: StoredExpense[] = [];
      for (let n = randomInt(random, 1, 12); n > 0; n--) {
        const result = validateExpense(randomExpense(random, ids));
        if (!result.ok) throw new Error(`generated an invalid expense: ${JSON.stringify(result.errors)}`);

        // 1. the shares always add up to exactly the amount
        const shareSum = Object.values(result.value.shares).reduce((a, b) => a + b, 0);
        expect(shareSum).toBe(result.value.amount);

        stored.push({
          payerId: result.value.payerId,
          amount: result.value.amount,
          shares: Object.entries(result.value.shares).map(([memberId, amount]) => ({ memberId, amount })),
        });
      }

      const summary = computeGroupSummary(people, stored);

      // 2. balances add up to exactly zero
      expect(summary.rows.reduce((sum, r) => sum + r.balance, 0)).toBe(0);

      // 3. fewer transfers than people with a balance
      const withBalance = summary.rows.filter((r) => r.balance !== 0).length;
      expect(summary.transfers.length).toBeLessThanOrEqual(Math.max(0, withBalance - 1));

      // 4. paying the suggested transfers settles everyone
      const payments = summary.transfers.map((t) => ({
        fromMemberId: t.fromId,
        toMemberId: t.toId,
        amount: t.amount,
      }));
      const settled = computeGroupSummary(people, stored, payments);
      expect(settled.rows.every((r) => r.balance === 0)).toBe(true);
      expect(settled.transfers).toEqual([]);
    }
  });
});
