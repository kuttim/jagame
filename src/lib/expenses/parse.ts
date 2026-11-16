/**
 * Parses what a person types into a form. Numbers are handled as integers
 * (hundredths), never as floats, so 0,1 + 0,2 style errors cannot happen.
 */

/** "12,50", "12.5", "1 000" -> 1250, 1250, 100000 (hundredths). Null if not a plain non-negative number with at most 2 decimals. */
export function parseHundredths(text: unknown): number | null {
  if (typeof text !== "string") return null;
  const cleaned = text.replace(/[\s ]/g, "").replace(",", ".");
  const match = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? "").padEnd(2, "0") || "0");
  return whole * 100 + fraction;
}

/** A euro amount in cents: "12,50" -> 1250. */
export const parseEuros = parseHundredths;

/** A percentage in hundredths of a percent: "33,33" -> 3333, "100" -> 10000. */
export const parsePercentHundredths = parseHundredths;

/** "2026-11-16" -> "2026-11-16" if it is a real calendar date, otherwise null. */
export function parseIsoDate(text: unknown): string | null {
  if (typeof text !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  const real =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;
  return real ? text.trim() : null;
}
