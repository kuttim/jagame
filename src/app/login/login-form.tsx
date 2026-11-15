"use client";

import { useActionState } from "react";
import { TextField } from "@/components/text-field";
import { login } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      {state?.error && (
        <p
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300"
        >
          {state.error}
        </p>
      )}
      <TextField
        name="email"
        label="E-post"
        type="email"
        autoComplete="email"
        defaultValue={state?.email}
      />
      <TextField
        name="password"
        label="Parool"
        type="password"
        autoComplete="current-password"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "Login sisse…" : "Logi sisse"}
      </button>
    </form>
  );
}
