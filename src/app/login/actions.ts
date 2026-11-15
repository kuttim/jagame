"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { LOGIN_FAILED_MESSAGE } from "@/lib/auth/messages";
import { isFailedSignIn } from "@/lib/auth/sign-in-result";

export type LoginState =
  | {
      error: string;
      /** What the user typed (never the password), to refill the form */
      email: string;
    }
  | undefined;

function text(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = text(formData.get("email"));
  const password = text(formData.get("password"));
  const failed: LoginState = { error: LOGIN_FAILED_MESSAGE, email };

  let result: unknown;
  try {
    result = await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) return failed;
    throw error;
  }

  if (isFailedSignIn(result)) return failed;
  redirect("/groups");
}
