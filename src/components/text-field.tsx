type TextFieldProps = {
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  defaultValue?: string;
  /** Error message; when set, the field is marked invalid */
  error?: string;
  /** Help text shown under the field */
  hint?: string;
};

/** A labelled input with an optional hint and error message. */
export function TextField({
  name,
  label,
  type = "text",
  autoComplete,
  defaultValue,
  error,
  hint,
}: TextFieldProps) {
  const id = `field-${name}`;
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border bg-white px-3 py-2 text-base outline-none transition-colors focus:ring-2 dark:bg-zinc-900 ${
          error
            ? "border-red-500 focus:ring-red-500/40"
            : "border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500/40 dark:border-zinc-700"
        }`}
      />
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-zinc-500">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}
