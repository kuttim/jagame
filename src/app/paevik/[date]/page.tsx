import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  formatDate,
  getDay,
  getDays,
  getNeighbours,
  weekday,
} from "@/lib/logi";
import { EntryText } from "../entry-text";

export function generateStaticParams() {
  return getDays().map((day) => ({ date: day.date }));
}

export async function generateMetadata(
  props: PageProps<"/paevik/[date]">,
): Promise<Metadata> {
  const { date } = await props.params;
  const day = getDay(date);
  if (!day) return {};
  return { title: `${formatDate(day.date)} – Jagame arenduspäevik` };
}

export default function PaevPage(props: PageProps<"/paevik/[date]">) {
  return (
    <Suspense fallback={<p className="text-zinc-500">Laen päeva…</p>}>
      <Paev params={props.params} />
    </Suspense>
  );
}

async function Paev({ params }: Pick<PageProps<"/paevik/[date]">, "params">) {
  const { date } = await params;
  const day = getDay(date);
  if (!day) notFound();

  const { older, newer } = getNeighbours(day.date);

  return (
    <article>
      <Link
        href="/paevik"
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Kõik päevad
      </Link>

      <header className="mb-10 mt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
          {weekday(day.date)}
        </p>
        <h1 className="mt-1 text-4xl font-semibold tracking-tight">
          {formatDate(day.date)}
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          {day.entries.length} kirjet
        </p>
      </header>

      <ol className="relative ml-2 border-l border-zinc-200 dark:border-zinc-800">
        {day.entries.map((entry, i) => (
          <li key={i} className="relative pb-8 pl-8 last:pb-0">
            <span
              aria-hidden
              className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-zinc-400 ring-4 ring-white dark:bg-zinc-600 dark:ring-[#0a0a0a]"
            />
            <time className="font-mono text-sm text-zinc-500">
              {entry.time}
            </time>
            <p className="mt-1 leading-7">
              <EntryText text={entry.text} />
            </p>
            {entry.idea && (
              <aside className="mt-3 rounded-lg border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950 dark:bg-amber-400/10 dark:text-amber-100">
                <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Idee
                </span>
                <EntryText text={entry.idea} />
              </aside>
            )}
          </li>
        ))}
      </ol>

      <nav className="mt-14 grid grid-cols-2 gap-4 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800">
        {older ? (
          <Link
            href={`/paevik/${older.date}`}
            className="group rounded-lg p-3 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <span className="block text-xs text-zinc-500">← Eelmine päev</span>
            <span className="font-medium">{formatDate(older.date)}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link
            href={`/paevik/${newer.date}`}
            className="group rounded-lg p-3 text-right transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <span className="block text-xs text-zinc-500">Järgmine päev →</span>
            <span className="font-medium">{formatDate(newer.date)}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
