import {
  FOLD_AFTER,
  formatEntry,
  LABELS,
  type BlockKind,
} from "@/lib/devlog-format";
import type { DevlogEntry } from "@/lib/devlog";
import { EntryText } from "./entry-text";

const LABEL_CLASS: Record<BlockKind, string> = {
  decision:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  error: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  lesson: "bg-amber-100 text-amber-800 dark:bg-amber-400/20 dark:text-amber-200",
  check:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  note: "bg-zinc-200 text-zinc-700 dark:bg-zinc-700/60 dark:text-zinc-200",
};

/** One diary entry: a headline, then labelled paragraphs, folded when long. */
export function Entry({ entry }: { entry: DevlogEntry }) {
  const { headline, blocks, bodyLength } = formatEntry(entry.text);

  const body = (
    <div className="space-y-3 leading-7 text-zinc-700 dark:text-zinc-300">
      {blocks.map((block, i) => (
        <p key={i}>
          {block.kind && (
            <span
              className={`mr-2 inline-block rounded-md px-2 py-0.5 align-middle text-xs font-semibold uppercase tracking-wide ${LABEL_CLASS[block.kind]}`}
            >
              {LABELS[block.kind]}
            </span>
          )}
          <EntryText text={block.text} />
        </p>
      ))}
    </div>
  );

  return (
    <>
      {blocks.length === 0 ? (
        <p className="mt-1 text-lg font-medium leading-7">
          <EntryText text={headline} />
        </p>
      ) : bodyLength > FOLD_AFTER ? (
        <details className="group mt-1">
          <summary className="cursor-pointer list-none py-1 text-lg font-medium leading-7 [&::-webkit-details-marker]:hidden">
            <EntryText text={headline} />
            <span className="ml-2 whitespace-nowrap text-sm font-normal text-indigo-600 group-open:hidden dark:text-indigo-400">
              Loe edasi ↓
            </span>
            <span className="ml-2 hidden whitespace-nowrap text-sm font-normal text-zinc-500 group-open:inline">
              Peida ↑
            </span>
          </summary>
          <div className="mt-3">{body}</div>
        </details>
      ) : (
        <>
          <p className="mt-1 text-lg font-medium leading-7">
            <EntryText text={headline} />
          </p>
          <div className="mt-3">{body}</div>
        </>
      )}

      {entry.idea && (
        <aside className="mt-3 rounded-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:bg-amber-400/10 dark:text-amber-100">
          <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
            Idee
          </span>
          <EntryText text={entry.idea} />
        </aside>
      )}
    </>
  );
}
