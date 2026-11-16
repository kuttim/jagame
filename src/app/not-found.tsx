import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Lehte ei leitud – Jagame",
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24">
      <p className="text-sm font-medium uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
        404
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Seda lehte ei leitud
      </h1>
      <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-400">
        Link võib olla vigane, aadress valesti kirjutatud või grupp kustutatud.
        Kui sa kopeerisid grupi lingi, kontrolli, et see on täielik.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-full bg-indigo-600 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Avalehele
        </Link>
        <Link
          href="/groups"
          className="inline-flex min-h-10 items-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Minu grupid
        </Link>
      </div>
    </main>
  );
}
