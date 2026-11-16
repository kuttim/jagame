"use client";

import Link from "next/link";
import { useActionState, useState, startTransition, type FormEvent } from "react";
import type { ExpenseFormState } from "./actions";

export type FormMember = { id: string; name: string };

type ExpenseFormProps = {
  /** A Server Action with the group token (and expense id) already bound */
  action: (previous: ExpenseFormState, formData: FormData) => Promise<ExpenseFormState>;
  members: FormMember[];
  /** What the fields start with (field name -> text), e.g. today's date */
  initialValues: Record<string, string>;
  submitLabel: string;
  cancelHref: string;
};

const SPLIT_OPTIONS = [
  { value: "EQUAL", label: "Võrdselt" },
  { value: "AMOUNTS", label: "Summadena" },
  { value: "PERCENT", label: "Protsentidena" },
] as const;

const inputClass = (invalid: boolean) =>
  `w-full rounded-lg border bg-white px-3 py-2 text-base outline-none transition-colors focus:ring-2 dark:bg-zinc-900 ${
    invalid
      ? "border-red-500 focus:ring-red-500/40"
      : "border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500/40 dark:border-zinc-700"
  }`;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}

/** Used for adding and editing an expense. */
export function ExpenseForm({
  action,
  members,
  initialValues,
  submitLabel,
  cancelHref,
}: ExpenseFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const values = state?.values ?? initialValues;

  // React resets a form after a <form action> finishes, which would put the
  // split type and ticks back to what the markup started with while the screen
  // still shows the typed ones. Sending the form ourselves avoids the reset.
  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }
  const errors = state?.errors ?? {};

  const [splitType, setSplitType] = useState(values.splitType ?? "EQUAL");
  const [ticked, setTicked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(members.map((m) => [m.id, values[`in-${m.id}`] === "on"])),
  );

  const valueLabel =
    splitType === "AMOUNTS" ? "Summa (€)" : splitType === "PERCENT" ? "Osa (%)" : "";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      {errors.general && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {errors.general}
        </p>
      )}

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
          Mille eest?
        </label>
        <input
          id="description"
          name="description"
          autoComplete="off"
          defaultValue={values.description}
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? "description-error" : undefined}
          placeholder="Nt õhtusöök"
          className={inputClass(!!errors.description)}
        />
        <FieldError id="description-error" message={errors.description} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="amount" className="mb-1.5 block text-sm font-medium">
            Summa (€)
          </label>
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            autoComplete="off"
            defaultValue={values.amount}
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby={errors.amount ? "amount-error" : undefined}
            placeholder="12,50"
            className={inputClass(!!errors.amount)}
          />
          <FieldError id="amount-error" message={errors.amount} />
        </div>
        <div>
          <label htmlFor="date" className="mb-1.5 block text-sm font-medium">
            Kuupäev
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={values.date}
            aria-invalid={errors.date ? true : undefined}
            aria-describedby={errors.date ? "date-error" : undefined}
            className={inputClass(!!errors.date)}
          />
          <FieldError id="date-error" message={errors.date} />
        </div>
      </div>

      <div>
        <label htmlFor="payerId" className="mb-1.5 block text-sm font-medium">
          Kes maksis?
        </label>
        <select
          id="payerId"
          name="payerId"
          defaultValue={values.payerId}
          aria-invalid={errors.payer ? true : undefined}
          aria-describedby={errors.payer ? "payer-error" : undefined}
          className={inputClass(!!errors.payer)}
        >
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
        <FieldError id="payer-error" message={errors.payer} />
      </div>

      <fieldset className="min-w-0">
        <legend className="mb-2 block text-sm font-medium">Kuidas jagada?</legend>
        <div className="flex flex-wrap gap-2">
          {SPLIT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                splitType === option.value
                  ? "border-indigo-600 bg-indigo-600 text-white"
                  : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              }`}
            >
              <input
                type="radio"
                name="splitType"
                value={option.value}
                checked={splitType === option.value}
                onChange={() => setSplitType(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </div>

        <ul className="mt-4 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name={`in-${member.id}`}
                  checked={ticked[member.id] ?? false}
                  onChange={(event) =>
                    setTicked((previous) => ({ ...previous, [member.id]: event.target.checked }))
                  }
                  className="h-4 w-4 accent-indigo-600"
                />
                <span className="truncate font-medium">{member.name}</span>
              </label>
              {splitType !== "EQUAL" && (
                <input
                  name={`value-${member.id}`}
                  inputMode="decimal"
                  autoComplete="off"
                  aria-label={`${valueLabel}: ${member.name}`}
                  placeholder={splitType === "PERCENT" ? "%" : "€"}
                  defaultValue={values[`value-${member.id}`]}
                  disabled={!ticked[member.id]}
                  className="w-28 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-right outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
                />
              )}
            </li>
          ))}
        </ul>
        <FieldError id="split-error" message={errors.split} />
      </fieldset>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:opacity-60"
        >
          {pending ? "Salvestan…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="-mx-2 inline-flex min-h-10 items-center px-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Tühista
        </Link>
      </div>
    </form>
  );
}
