"use client";

import { useActionState } from "react";
import type { NameFormState } from "./actions";

type NameFormProps = {
  /** A Server Action with the group token already bound */
  action: (previous: NameFormState, formData: FormData) => Promise<NameFormState>;
  label: string;
  placeholder: string;
  submitLabel: string;
  pendingLabel: string;
  /** Distinguishes several forms on one page */
  id: string;
};

/** One text field with a submit button, used to add a member or to join a group. */
export function NameForm({
  action,
  label,
  placeholder,
  submitLabel,
  pendingLabel,
  id,
}: NameFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} noValidate>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name="name"
          autoComplete="off"
          placeholder={placeholder}
          defaultValue={state?.values.name}
          aria-invalid={state?.error ? true : undefined}
          aria-describedby={state?.error ? `${id}-error` : undefined}
          className={`min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-base outline-none transition-colors focus:ring-2 dark:bg-zinc-900 ${
            state?.error
              ? "border-red-500 focus:ring-red-500/40"
              : "border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500/40 dark:border-zinc-700"
          }`}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {pending ? pendingLabel : submitLabel}
        </button>
      </div>
      {state?.error && (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
