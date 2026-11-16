import type { Cents } from "@/lib/calculation/money";
import type { Shares } from "@/lib/calculation/splitting";

/** Cents for an input field: 1250 -> "12,50" (no currency sign). */
export function centsToInput(cents: Cents): string {
  const euros = Math.floor(cents / 100);
  return `${euros},${String(cents % 100).padStart(2, "0")}`;
}

/** Hundredths of a percent for an input field: 3333 -> "33,33", 5000 -> "50". */
export function hundredthsToInput(hundredths: number): string {
  const whole = Math.floor(hundredths / 100);
  const fraction = hundredths % 100;
  if (fraction === 0) return String(whole);
  return `${whole},${String(fraction).padStart(2, "0")}`.replace(/0$/, "");
}

/** "2026-11-16" -> "16.11.2026" */
export function formatDateEt(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

/**
 * Each member's share as hundredths of a percent, adding up to exactly 10000
 * (largest remainder). Used to refill the form when editing a percentage split,
 * because only the amounts in cents are stored.
 */
export function sharesToPercentHundredths(shares: Shares, total: Cents): Shares {
  const ids = Object.keys(shares);
  const parts = ids.map((id, index) => ({
    id,
    index,
    base: Math.floor((shares[id] * 10000) / total),
    remainder: (shares[id] * 10000) % total,
  }));
  let leftover = 10000 - parts.reduce((sum, p) => sum + p.base, 0);
  const byRemainder = [...parts].sort(
    (a, b) => b.remainder - a.remainder || a.index - b.index,
  );
  for (const part of byRemainder) {
    if (leftover <= 0) break;
    part.base += 1;
    leftover -= 1;
  }
  const result: Shares = {};
  for (const p of parts) result[p.id] = p.base;
  return result;
}
