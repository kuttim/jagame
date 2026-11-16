import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import {
  entriesNewestFirst,
  formatDate,
  getDay,
  getDays,
  getNeighbours,
  weekday,
} from "@/lib/devlog";
import { Entry } from "../entry";

export function generateStaticParams() {
  return getDays().map((day) => ({ date: day.date }));
}

export async function generateMetadata(
  props: PageProps<"/diary/[date]">,
): Promise<Metadata> {
  const { date } = await props.params;
  const day = getDay(date);
  if (!day) return {};
  return { title: `${formatDate(day.date)} – Jagame arenduspäevik` };
}

export default function DayPage(props: PageProps<"/diary/[date]">) {
  return (
    <Suspense fallback={<p className="text-zinc-500">Laen päeva…</p>}>
      <Day params={props.params} />
    </Suspense>
  );
}

async function Day({ params }: Pick<PageProps<"/diary/[date]">, "params">) {
  const { date } = await params;
  const day = getDay(date);
  if (!day) notFound();

  const { older, newer } = getNeighbours(day.date);

  return (
    <article>
      <Link
        href="/diary"
        className="-mx-2 inline-flex min-h-10 items-center px-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
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
        {entriesNewestFirst(day).map((entry) => (
          <li key={`${entry.time}-${entry.text.slice(0, 40)}`} className="relative pb-8 pl-8 last:pb-0">
            <span
              aria-hidden
              className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-zinc-400 ring-4 ring-white dark:bg-zinc-600 dark:ring-[#0a0a0a]"
            />
            <time className="font-mono text-sm text-zinc-500">
              {entry.time}
            </time>
            <Entry entry={entry} />
          </li>
        ))}
      </ol>

      <nav className="mt-14 grid grid-cols-2 gap-4 border-t border-zinc-200 pt-6 text-sm dark:border-zinc-800">
        {older ? (
          <Link
            href={`/diary/${older.date}`}
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
            href={`/diary/${newer.date}`}
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
