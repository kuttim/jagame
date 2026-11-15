import bcrypt from "bcryptjs";

/** Minimum password length, in characters. */
export const MIN_PASSWORD_LENGTH = 8;

/**
 * Maximum password length, in UTF-8 bytes. bcrypt only reads the first 72
 * bytes, so a longer password would silently be cut off and two different
 * passwords could be accepted as the same one. We reject them instead.
 */
export const MAX_PASSWORD_BYTES = 72;

/** bcrypt work factor: each +1 doubles the time a guess takes. */
export const BCRYPT_COST = 12;

/** Why a password was rejected. The UI translates these into Estonian. */
export type PasswordProblem = "too_short" | "too_long";

/** Normalizes Unicode so the same visible password always hashes the same way. */
function prepare(password: string): string {
  return password.normalize("NFKC");
}

function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

/** Returns the first problem with the password, or null if it is acceptable. */
export function validatePassword(password: string): PasswordProblem | null {
  const prepared = prepare(password);
  if ([...prepared].length < MIN_PASSWORD_LENGTH) return "too_short";
  if (byteLength(prepared) > MAX_PASSWORD_BYTES) return "too_long";
  return null;
}

/**
 * Hashes a password for storage. The result contains the salt and cost, so
 * `verifyPassword` needs nothing else. `cost` is only lowered in tests.
 */
export async function hashPassword(
  password: string,
  cost: number = BCRYPT_COST,
): Promise<string> {
  const problem = validatePassword(password);
  if (problem) throw new RangeError(`Invalid password: ${problem}`);
  return bcrypt.hash(prepare(password), cost);
}

/** Checks a password against a stored hash. Never throws; bad input is false. */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const prepared = prepare(password);
  if (byteLength(prepared) > MAX_PASSWORD_BYTES) return false;
  try {
    return await bcrypt.compare(prepared, storedHash);
  } catch {
    return false;
  }
}
