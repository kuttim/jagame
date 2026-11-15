/** Renders a log entry's text; the parts between backticks are shown as code. */
export function EntryText({ text }: { text: string }) {
  const parts = text.split(/`([^`]+)`/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="rounded-md bg-zinc-900/[.06] px-1.5 py-0.5 font-mono text-[0.85em] dark:bg-white/10"
          >
            {part}
          </code>
        ) : (
          part
        ),
      )}
    </>
  );
}
