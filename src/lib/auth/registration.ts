import { isValidEmail, normalizeEmail } from "./credentials";
import { validatePassword, type PasswordProblem } from "./password";

export const MAX_NAME_LENGTH = 100;

export type RegistrationInput = {
  name: string;
  email: string;
  password: string;
};

/** Error codes only; the UI turns them into Estonian messages (messages.ts). */
export type RegistrationErrors = {
  name?: "required" | "too_long";
  email?: "invalid";
  password?: PasswordProblem;
};

export type RegistrationResult =
  | { ok: true; value: RegistrationInput }
  | { ok: false; errors: RegistrationErrors };

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * Validates the sign-up form. On success returns the cleaned values: the name
 * is trimmed and the email is normalized (trimmed, lowercase). The password is
 * returned untouched, because spaces can be part of a password.
 */
export function validateRegistration(input: {
  name?: unknown;
  email?: unknown;
  password?: unknown;
}): RegistrationResult {
  const name = asString(input.name).trim();
  const email = normalizeEmail(asString(input.email));
  const password = asString(input.password);

  const errors: RegistrationErrors = {};

  if (name.length === 0) errors.name = "required";
  else if ([...name].length > MAX_NAME_LENGTH) errors.name = "too_long";

  if (!isValidEmail(email)) errors.email = "invalid";

  const passwordProblem = validatePassword(password);
  if (passwordProblem) errors.password = passwordProblem;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, email, password } };
}
