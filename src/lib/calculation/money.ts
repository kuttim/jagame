/** A money amount as an integer number of cents (1 € = 100). Never use floats. */
export type Cents = number;

/** Throws if the value is not a safe integer. */
export function assertCents(value: number, name = "amount"): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(
      `${name} must be an integer number of cents, got ${String(value)}`,
    );
  }
}

/** Formats cents for the Estonian UI: 1250 -> "12,50 €", -5 -> "-0,05 €". */
export function formatEuro(cents: Cents): string {
  assertCents(cents);
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const euros = Math.floor(abs / 100);
  const rest = String(abs % 100).padStart(2, "0");
  return `${sign}${euros},${rest} €`;
}

/**
 * Like formatEuro, but with an explicit sign for balances: 6000 -> "+60,00 €",
 * -1500 -> "−15,00 €" (a real minus sign), 0 -> "0,00 €".
 */
export function formatSignedEuro(cents: Cents): string {
  assertCents(cents);
  if (cents === 0) return formatEuro(0);
  const sign = cents > 0 ? "+" : "−";
  return `${sign}${formatEuro(Math.abs(cents))}`;
}
