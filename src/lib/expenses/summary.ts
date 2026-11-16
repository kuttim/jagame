import {
  computeSummaries,
  type Expense,
  type Transfer,
} from "@/lib/calculation/balances";
import type { Cents } from "@/lib/calculation/money";
import { settle } from "@/lib/calculation/settlement";

/** An expense as the database returns it: shares are a list of rows. */
export type StoredExpense = {
  payerId: string;
  amount: Cents;
  shares: readonly { memberId: string; amount: Cents }[];
};

export type MemberRow = {
  id: string;
  name: string;
  /** What the member has paid for expenses */
  paid: Cents;
  /** The member's share of all expenses */
  owed: Cents;
  /** paid - owed: positive means the group owes them, negative means they owe */
  balance: Cents;
};

export type GroupSummary = {
  /** In the order the members were given */
  rows: MemberRow[];
  /** The fewest transfers found that bring everyone to zero */
  transfers: Transfer[];
  total: Cents;
};

/** Turns the stored form into what the calculation functions expect. */
export function toCalculationExpenses(stored: readonly StoredExpense[]): Expense[] {
  return stored.map((expense) => ({
    payerId: expense.payerId,
    amount: expense.amount,
    shares: Object.fromEntries(
      expense.shares.map((share) => [share.memberId, share.amount]),
    ),
  }));
}

/**
 * Balances and suggested transfers for a group. Throws if the data is
 * inconsistent (for example an expense whose shares do not add up), because
 * showing wrong balances would be worse than showing an error.
 */
export function computeGroupSummary(
  members: readonly { id: string; name: string }[],
  stored: readonly StoredExpense[],
): GroupSummary {
  const memberIds = members.map((m) => m.id);
  const expenses = toCalculationExpenses(stored);
  const summaries = computeSummaries(memberIds, expenses);

  const rows = members.map((member) => {
    const { paid, owed, balance } = summaries[member.id];
    return { id: member.id, name: member.name, paid, owed, balance };
  });

  const balances = Object.fromEntries(rows.map((row) => [row.id, row.balance]));
  return {
    rows,
    transfers: settle(balances),
    total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
  };
}
