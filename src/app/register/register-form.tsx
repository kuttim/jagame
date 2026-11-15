"use client";

import { useActionState } from "react";
import { TextField } from "@/components/text-field";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";
import { register } from "./actions";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <TextField
        name="name"
        label="Nimi"
        autoComplete="name"
        defaultValue={state?.values.name}
        error={state?.errors.name}
        hint="Seda nime näevad teised grupi liikmed."
      />
      <TextField
        name="email"
        label="E-post"
        type="email"
        autoComplete="email"
        defaultValue={state?.values.email}
        error={state?.errors.email}
      />
      <TextField
        name="password"
        label="Parool"
        type="password"
        autoComplete="new-password"
        error={state?.errors.password}
        hint={`Vähemalt ${MIN_PASSWORD_LENGTH} tähemärki.`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "Registreerin…" : "Registreeru"}
      </button>
    </form>
  );
}
