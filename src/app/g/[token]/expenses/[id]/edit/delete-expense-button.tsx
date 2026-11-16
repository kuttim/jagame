"use client";

export function DeleteExpenseButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Kas kustutad selle kulu? Seda ei saa tagasi võtta.")) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="cursor-pointer text-sm text-red-600 underline-offset-4 hover:underline dark:text-red-400"
      >
        Kustuta kulu
      </button>
    </form>
  );
}
