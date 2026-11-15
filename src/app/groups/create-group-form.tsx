"use client";

import { useActionState } from "react";
import { TextField } from "@/components/text-field";
import { createGroup } from "./actions";

export function CreateGroupForm() {
  const [state, action, pending] = useActionState(createGroup, undefined);

  return (
    <form action={action} noValidate className="flex flex-col gap-4">
      <TextField
        name="name"
        label="Grupi nimi"
        defaultValue={state?.values.name}
        error={state?.error}
        hint="Näiteks „Rootsi reis” või „Korter”."
      />
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
      >
        {pending ? "Loon…" : "Loo grupp"}
      </button>
    </form>
  );
}
