import { assertCents, type Cents } from "./money";

/** How much each member owes for one expense, in cents. */
export type Shares = Record<string, Cents>;

/**
 * Distributes `total` by integer weights so that the shares always add up to
 * exactly `total` (largest remainder method).
 *
 * Each share is either its exact part rounded down, or that plus 1 cent. The
 * extra cents go to the members with the largest fractional parts; ties go to
 * whoever comes first in the input.
 */
function allocate(total: Cents, ids: string[], weights: number[]): Shares {
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const parts = ids.map((id, index) => {
    const product = total * weights[index];
    return {
      id,
      index,
      base: Math.floor(product / weightSum),
      remainder: product % weightSum,
    };
  });

  let leftover = total - parts.reduce((sum, p) => sum + p.base, 0);

  const byRemainder = [...parts].sort(
    (a, b) => b.remainder - a.remainder || a.index - b.index,
  );
  for (const part of byRemainder) {
    if (leftover === 0) break;
    part.base += 1;
    leftover -= 1;
  }

  // The result keeps the input order
  const result: Shares = {};
  for (const p of parts) result[p.id] = p.base;
  return result;
}

function assertValidTotal(total: Cents): void {
  assertCents(total, "expense total");
  if (total < 0) throw new RangeError("Expense total cannot be negative");
}

function assertUniqueIds(ids: string[]): void {
  if (ids.length === 0) {
    throw new RangeError("An expense needs at least one participant");
  }
  if (new Set(ids).size !== ids.length) {
    throw new RangeError("A participant is listed more than once");
  }
}

/** Splits equally. 100 cents among three members -> 34, 33, 33. */
export function splitEqual(total: Cents, memberIds: string[]): Shares {
  assertValidTotal(total);
  assertUniqueIds(memberIds);
  return allocate(
    total,
    memberIds,
    memberIds.map(() => 1),
  );
}

/** Splits by fixed amounts; the amounts must add up to the expense total. */
export function splitByAmounts(total: Cents, amounts: Shares): Shares {
  assertValidTotal(total);
  const ids = Object.keys(amounts);
  assertUniqueIds(ids);

  let sum = 0;
  for (const id of ids) {
    assertCents(amounts[id], `amount for member ${id}`);
    if (amounts[id] < 0) {
      throw new RangeError(`Amount for member ${id} cannot be negative`);
    }
    sum += amounts[id];
  }
  if (sum !== total) {
    throw new RangeError(
      `Amounts add up to ${sum}, which is not the expense total ${total}`,
    );
  }
  return { ...amounts };
}

/**
 * Splits by percentages (at most 2 decimals, exactly 100 in total).
 * Percentages are converted to integer hundredths of a percent to avoid
 * floating-point errors.
 */
export function splitByPercent(
  total: Cents,
  percents: Record<string, number>,
): Shares {
  assertValidTotal(total);
  const ids = Object.keys(percents);
  assertUniqueIds(ids);

  const weights = ids.map((id) => {
    const scaled = percents[id] * 100;
    const rounded = Math.round(scaled);
    if (!Number.isFinite(scaled) || Math.abs(scaled - rounded) > 1e-6) {
      throw new RangeError(
        `Percentage for member ${id} can have at most 2 decimals, got ${percents[id]}`,
      );
    }
    if (rounded < 0) {
      throw new RangeError(`Percentage for member ${id} cannot be negative`);
    }
    return rounded;
  });

  if (weights.reduce((a, b) => a + b, 0) !== 10000) {
    throw new RangeError("Percentages must add up to exactly 100");
  }
  return allocate(total, ids, weights);
}
