import { assertCents } from "./money";
import type { Balances, Transfer } from "./balances";

type Side = { id: string; amount: number };

/** Largest amount first; ties by id so the result is stable. */
function byAmountDesc(a: Side, b: Side): number {
  return b.amount - a.amount || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
}

/**
 * Suggests transfers that bring every balance to zero.
 *
 * The true minimum number of transfers is NP-hard, so this uses a practical
 * heuristic:
 * 1. Equal amounts are matched directly (one debtor pays one creditor exactly
 *    what they owe), which saves the most transfers.
 * 2. For the rest, the largest debtor pays the largest creditor. Every step
 *    zeroes at least one side, so there are fewer transfers than members with
 *    a non-zero balance.
 */
export function settle(balances: Balances): Transfer[] {
  const creditors: Side[] = [];
  const debtors: Side[] = [];
  let sum = 0;

  for (const [id, balance] of Object.entries(balances)) {
    assertCents(balance, `balance of member ${id}`);
    sum += balance;
    if (balance > 0) creditors.push({ id, amount: balance });
    if (balance < 0) debtors.push({ id, amount: -balance });
  }
  if (sum !== 0) {
    throw new RangeError(`Balances must add up to 0, got ${sum}`);
  }

  const transfers: Transfer[] = [];

  // Step 1: exact pairs
  creditors.sort(byAmountDesc);
  debtors.sort(byAmountDesc);
  const remainingDebtors: Side[] = [];
  for (const debtor of debtors) {
    const match = creditors.findIndex((c) => c.amount === debtor.amount);
    if (match === -1) {
      remainingDebtors.push(debtor);
      continue;
    }
    const [creditor] = creditors.splice(match, 1);
    transfers.push({
      fromId: debtor.id,
      toId: creditor.id,
      amount: debtor.amount,
    });
  }

  // Step 2: largest debtor -> largest creditor
  let c = 0;
  let d = 0;
  while (c < creditors.length && d < remainingDebtors.length) {
    const creditor = creditors[c];
    const debtor = remainingDebtors[d];
    const amount = Math.min(creditor.amount, debtor.amount);

    transfers.push({ fromId: debtor.id, toId: creditor.id, amount });
    creditor.amount -= amount;
    debtor.amount -= amount;

    if (creditor.amount === 0) c++;
    if (debtor.amount === 0) d++;
  }

  return transfers;
}
