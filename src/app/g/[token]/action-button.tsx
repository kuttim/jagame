"use client";

import { useActionState } from "react";
import type { ActionResult } from "./actions";

type ActionButtonProps = {
  /** A Server Action with its arguments already bound */
  action: (previous: ActionResult, formData: FormData) => Promise<ActionResult>;
  label: string;
  ariaLabel?: string;
  className?: string;
};

/** A small button that runs an action and shows its error message, if any, next to it. */
export function ActionButton({ action, label, ariaLabel, className }: ActionButtonProps) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="text-right">
      <button
        type="submit"
        disabled={pending}
        aria-label={ariaLabel}
        className={className}
      >
        {label}
      </button>
      {state?.error && (
        <p role="alert" className="mt-1 max-w-xs text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
