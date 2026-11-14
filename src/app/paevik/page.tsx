import type { Metadata } from "next";
import Link from "next/link";
import { formatDate, getDays, summarize, weekday } from "@/lib/devlog";

export const metadata: Metadata = {
  title: "Arenduspäevik – Jagame",
  description: "Jagame arenduse päevik: mis tehti, miks ja mis ebaõnnestus.",
};

export default function DiaryIndexPage() {
  const days = getDays();
  const entryCount = days.reduce((n, d) => n + d.entries.length, 0);

  return (
    <>
      <header className="mb-12">
        <h1 className="text-4xl font-semibold tracking-tight">
          Arenduspäevik
        </h1>
        <p className="mt-3 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Kuidas Jagame valmib: mis tehti, miks ja mis ebaõnnestus. Päevik
          koostatakse automaatselt projekti tegevuslogist.
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          {days.length} {days.length === 1 ? "päev" : "päeva"} · {entryCount}{" "}
          kirjet
        </p>
      </header>

      <ol className="relative ml-2 border-l border-zinc-200 dark:border-zinc-800">
        {days.map((day) => (
          <li key={day.date} className="relative pb-10 pl-8 last:pb-0">
            <span
              aria-hidden
              className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#0a0a0a]"
            />
            <Link
              href={`/paevik/${day.date}`}
              className="group block rounded-xl border border-zinc-200 p-5 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-zinc-800 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-500/5"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                {weekday(day.date)}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">
                {formatDate(day.date)}
              </h2>
              <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
                {summarize(day)}
              </p>
              <p className="mt-3 text-sm text-zinc-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {day.entries.length} kirjet →
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
