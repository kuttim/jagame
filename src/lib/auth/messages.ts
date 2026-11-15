// User-facing texts (Estonian) for the sign-up and sign-in forms.

import { MAX_NAME_LENGTH, type RegistrationErrors } from "./registration";
import { MAX_PASSWORD_BYTES, MIN_PASSWORD_LENGTH } from "./password";

export const EMAIL_TAKEN_MESSAGE =
  "See e-post on juba kasutusel. Proovi sisse logida.";

/** Deliberately vague: it must not reveal whether the email has an account. */
export const LOGIN_FAILED_MESSAGE = "E-post või parool on vale.";

export type RegistrationMessages = {
  name?: string;
  email?: string;
  password?: string;
};

/** Turns validation error codes into Estonian messages for each field. */
export function registrationMessages(
  errors: RegistrationErrors,
): RegistrationMessages {
  const messages: RegistrationMessages = {};

  if (errors.name === "required") messages.name = "Sisesta oma nimi.";
  if (errors.name === "too_long") {
    messages.name = `Nimi on liiga pikk (kuni ${MAX_NAME_LENGTH} tähemärki).`;
  }

  if (errors.email === "invalid") {
    messages.email = "Sisesta korrektne e-posti aadress.";
  }

  if (errors.password === "too_short") {
    messages.password = `Parool peab olema vähemalt ${MIN_PASSWORD_LENGTH} tähemärki pikk.`;
  }
  if (errors.password === "too_long") {
    messages.password = `Parool on liiga pikk (kuni ${MAX_PASSWORD_BYTES} baiti; täpitähed ja emojid võtavad rohkem ruumi).`;
  }

  return messages;
}
