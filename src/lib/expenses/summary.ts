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

/** A transfer that has really been made between two members. */
export type StoredPayment = {
  fromMemberId: string;
  toMemberId: string;
  amount: Cents;
};

export type MemberRow = {
  id: string;
  name: string;
  /** What the member has paid for expenses */
  paid: Cents;
  /** The member's share of all expenses */
  owed: Cents;
  /** Transfers the member has sent (+) minus transfers they have received (-) */
  settled: Cents;
  /** paid - owed + settled: positive means the group owes them, negative means they owe */
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
 * Balances and suggested transfers for a group. Payments that were already
 * made count towards the balances, so the suggestions only cover what is
 * still owed. Throws if the data is inconsistent (for example an expense whose
 * shares do not add up), because showing wrong balances would be worse than
 * showing an error.
 */
export function computeGroupSummary(
  members: readonly { id: string; name: string }[],
  stored: readonly StoredExpense[],
  payments: readonly StoredPayment[] = [],
): GroupSummary {
  const memberIds = members.map((m) => m.id);
  const expenses = toCalculationExpenses(stored);
  const transfers: Transfer[] = payments.map((payment) => ({
    fromId: payment.fromMemberId,
    toId: payment.toMemberId,
    amount: payment.amount,
  }));
  const summaries = computeSummaries(memberIds, expenses, transfers);

  const rows = members.map((member) => {
    const { paid, owed, settled, balance } = summaries[member.id];
    return { id: member.id, name: member.name, paid, owed, settled, balance };
  });

  const balances = Object.fromEntries(rows.map((row) => [row.id, row.balance]));
  return {
    rows,
    transfers: settle(balances),
    total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
  };
}

/** True if `transfer` is exactly one of the currently suggested transfers. */
export function isSuggestedTransfer(
  suggested: readonly Transfer[],
  transfer: Transfer,
): boolean {
  return suggested.some(
    (t) =>
      t.fromId === transfer.fromId &&
      t.toId === transfer.toId &&
      t.amount === transfer.amount,
  );
}
