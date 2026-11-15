"use server";

import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { EMAIL_TAKEN_MESSAGE, registrationMessages } from "@/lib/auth/messages";
import type { RegistrationMessages } from "@/lib/auth/messages";
import { hashPassword } from "@/lib/auth/password";
import { validateRegistration } from "@/lib/auth/registration";
import { db } from "@/lib/db";
import { isUniqueViolation } from "@/lib/db-errors";

export type RegisterState =
  | {
      errors: RegistrationMessages;
      /** What the user typed (never the password), to refill the form */
      values: { name: string; email: string };
    }
  | undefined;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export async function register(
  _previous: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const values = { name: text(formData.get("name")), email: text(formData.get("email")) };

  const result = validateRegistration({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!result.ok) {
    return { errors: registrationMessages(result.errors), values };
  }

  const { name, email, password } = result.value;

  try {
    await db.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });
  } catch (error) {
    // Two people can register the same email at the same moment; the unique
    // index in the database is what decides, so handle it here.
    if (isUniqueViolation(error)) {
      return { errors: { email: EMAIL_TAKEN_MESSAGE }, values };
    }
    throw error;
  }

  // Sign the new user in right away. redirect: false returns the result
  // instead of redirecting, and we send them on ourselves.
  await signIn("credentials", { email, password, redirect: false });
  redirect("/groups");
}
