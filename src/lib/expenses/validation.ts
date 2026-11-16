import type { Cents } from "@/lib/calculation/money";
import {
  splitByAmounts,
  splitByPercent,
  splitEqual,
  type Shares,
} from "@/lib/calculation/splitting";
import { cleanName } from "@/lib/groups/validation";
import { parseEuros, parseHundredths, parseIsoDate } from "./parse";

export const MAX_DESCRIPTION_LENGTH = 100;
/** 1 000 000 € in cents; far above any real shared expense, far below integer limits. */
export const MAX_AMOUNT: Cents = 100_000_000;
export const MIN_YEAR = 2000;
export const MAX_YEAR = 2100;

export const SPLIT_TYPES = ["EQUAL", "AMOUNTS", "PERCENT"] as const;
export type SplitType = (typeof SPLIT_TYPES)[number];

export type ExpenseInput = {
  description: unknown;
  /** The amount as typed, e.g. "12,50" */
  amount: unknown;
  /** "YYYY-MM-DD" */
  date: unknown;
  payerId: unknown;
  splitType: unknown;
  /**
   * The members taking part, with what was typed for each (an amount or a
   * percentage; ignored for an equal split).
   */
  participants: Record<string, string>;
  /** The ids of everyone in the group; payer and participants must be among them. */
  memberIds: readonly string[];
};

export type SplitProblem =
  | { code: "invalid_type" }
  | { code: "no_participants" }
  | { code: "unknown_participant" }
  | { code: "invalid_value" }
  | { code: "amount_sum"; sum: Cents; total: Cents }
  /** `sum` is in hundredths of a percent (10000 = 100 %) */
  | { code: "percent_sum"; sum: number };

/** Error codes only; the UI turns them into Estonian text (messages.ts). */
export type ExpenseErrors = {
  description?: "required" | "too_long";
  amount?: "invalid" | "zero" | "too_large";
  date?: "invalid";
  payer?: "invalid";
  split?: SplitProblem;
};

export type ValidExpense = {
  description: string;
  amount: Cents;
  date: string;
  payerId: string;
  splitType: SplitType;
  shares: Shares;
};

export type ExpenseResult =
  | { ok: true; value: ValidExpense }
  | { ok: false; errors: ExpenseErrors };

function isSplitType(value: unknown): value is SplitType {
  return (SPLIT_TYPES as readonly unknown[]).includes(value);
}

/** Works out each participant's share. Returns shares or the reason it is not possible. */
function computeShares(
  splitType: SplitType,
  total: Cents,
  participants: Record<string, string>,
): { shares: Shares } | { problem: SplitProblem } {
  const ids = Object.keys(participants);
  if (ids.length === 0) return { problem: { code: "no_participants" } };

  if (splitType === "EQUAL") return { shares: splitEqual(total, ids) };

  const parsed: Record<string, number> = {};
  for (const id of ids) {
    const value = parseHundredths(participants[id]);
    if (value === null) return { problem: { code: "invalid_value" } };
    parsed[id] = value;
  }

  if (splitType === "AMOUNTS") {
    const sum = Object.values(parsed).reduce((a, b) => a + b, 0);
    if (sum !== total) return { problem: { code: "amount_sum", sum, total } };
    return { shares: splitByAmounts(total, parsed) };
  }

  const sum = Object.values(parsed).reduce((a, b) => a + b, 0);
  if (sum !== 10000) return { problem: { code: "percent_sum", sum } };
  const percents: Record<string, number> = {};
  for (const id of ids) percents[id] = parsed[id] / 100;
  return { shares: splitByPercent(total, percents) };
}

/**
 * Validates the expense form. On success returns clean values and each
 * member's share in cents (adding up to exactly the total).
 */
export function validateExpense(input: ExpenseInput): ExpenseResult {
  const errors: ExpenseErrors = {};

  const description = cleanName(input.description);
  if (description.length === 0) errors.description = "required";
  else if ([...description].length > MAX_DESCRIPTION_LENGTH) {
    errors.description = "too_long";
  }

  const amount = parseEuros(input.amount);
  if (amount === null) errors.amount = "invalid";
  else if (amount === 0) errors.amount = "zero";
  else if (amount > MAX_AMOUNT) errors.amount = "too_large";

  const date = parseIsoDate(input.date);
  const year = date ? Number(date.slice(0, 4)) : 0;
  if (date === null || year < MIN_YEAR || year > MAX_YEAR) errors.date = "invalid";

  const payerId = typeof input.payerId === "string" ? input.payerId : "";
  if (!input.memberIds.includes(payerId)) errors.payer = "invalid";

  const splitType = input.splitType;
  if (!isSplitType(splitType)) {
    errors.split = { code: "invalid_type" };
  } else if (
    Object.keys(input.participants).some((id) => !input.memberIds.includes(id))
  ) {
    errors.split = { code: "unknown_participant" };
  } else if (amount !== null && amount > 0 && amount <= MAX_AMOUNT) {
    const result = computeShares(splitType, amount, input.participants);
    if ("problem" in result) errors.split = result.problem;
    else if (Object.keys(errors).length === 0) {
      return {
        ok: true,
        value: {
          description,
          amount,
          date: date as string,
          payerId,
          splitType,
          shares: result.shares,
        },
      };
    }
  } else if (Object.keys(input.participants).length === 0) {
    errors.split = { code: "no_participants" };
  }

  return { ok: false, errors };
}
