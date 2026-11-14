import type { Shares } from "./splitting";
import { assertCents, type Cents } from "./money";

/** One expense: the payer paid `amount`, which was split into `shares`. */
export type Expense = {
  payerId: string;
  amount: Cents;
  /** Each member's share; must add up to `amount` (see splitting.ts). */
  shares: Shares;
};

/** A money transfer between two members (suggested or already made). */
export type Transfer = {
  fromId: string;
  toId: string;
  amount: Cents;
};

export type MemberSummary = {
  /** How much the member has paid for expenses */
  paid: Cents;
  /** The member's share of all expenses */
  owed: Cents;
  /** Transfers sent to others (+) minus transfers received (−) */
  settled: Cents;
  /** paid − owed + settled. Positive: is owed money, negative: owes money. */
  balance: Cents;
};

/** Member id -> balance in cents. Balances always add up to 0. */
export type Balances = Record<string, Cents>;

/** Computes what each member paid, owes and has settled, plus the balance. */
export function computeSummaries(
  memberIds: string[],
  expenses: Expense[],
  transfers: Transfer[] = [],
): Record<string, MemberSummary> {
  const summaries: Record<string, MemberSummary> = {};
  for (const id of memberIds) {
    summaries[id] = { paid: 0, owed: 0, settled: 0, balance: 0 };
  }

  const get = (id: string): MemberSummary => {
    const summary = summaries[id];
    if (!summary) throw new RangeError(`Unknown member: ${id}`);
    return summary;
  };

  for (const expense of expenses) {
    assertCents(expense.amount, "expense amount");
    get(expense.payerId).paid += expense.amount;

    let shareSum = 0;
    for (const [id, share] of Object.entries(expense.shares)) {
      assertCents(share, `share of member ${id}`);
      get(id).owed += share;
      shareSum += share;
    }
    if (shareSum !== expense.amount) {
      throw new RangeError(
        `Shares add up to ${shareSum}, which is not the expense amount ${expense.amount}`,
      );
    }
  }

  for (const transfer of transfers) {
    assertCents(transfer.amount, "transfer amount");
    get(transfer.fromId).settled += transfer.amount;
    get(transfer.toId).settled -= transfer.amount;
  }

  for (const summary of Object.values(summaries)) {
    summary.balance = summary.paid - summary.owed + summary.settled;
  }
  return summaries;
}

/** Balances only: positive is owed money, negative owes money. */
export function computeBalances(
  memberIds: string[],
  expenses: Expense[],
  transfers: Transfer[] = [],
): Balances {
  const summaries = computeSummaries(memberIds, expenses, transfers);
  const balances: Balances = {};
  for (const id of memberIds) balances[id] = summaries[id].balance;
  return balances;
}
