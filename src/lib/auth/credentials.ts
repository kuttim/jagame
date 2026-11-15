import { hashPassword, verifyPassword } from "./password";

/** Emails are compared case-insensitively by always using the lowercase form. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// A structural check only. We cannot confirm that an address exists, because
// the app does not send email (see README).
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  return normalized.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(normalized);
}

/** What the rest of the app may know about a signed-in user. */
export type AuthUser = { id: string; email: string; name: string };

/** A user as stored in the database, including the password hash. */
export type StoredUser = AuthUser & { passwordHash: string };

export type FindUserByEmail = (email: string) => Promise<StoredUser | null>;

let dummyHash: Promise<string> | undefined;

/** A real hash of a throwaway password, created once on first use. */
function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword("not-a-real-password");
  return dummyHash;
}

/**
 * Checks an email and password. Returns the user, or null for any failure.
 *
 * The caller learns nothing about *why* it failed (unknown email or wrong
 * password). We also always run one bcrypt comparison, even for unknown
 * emails, so the response time does not reveal whether an account exists.
 */
export async function authenticate(
  input: { email?: unknown; password?: unknown },
  findUserByEmail: FindUserByEmail,
): Promise<AuthUser | null> {
  if (typeof input.email !== "string" || typeof input.password !== "string") {
    return null;
  }

  const email = normalizeEmail(input.email);
  const user = isValidEmail(email) ? await findUserByEmail(email) : null;

  const hash = user?.passwordHash ?? (await getDummyHash());
  const passwordMatches = await verifyPassword(input.password, hash);

  if (!user || !passwordMatches) return null;
  return { id: user.id, email: user.email, name: user.name };
}
