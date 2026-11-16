"use client";

import Link from "next/link";
import { useEffect } from "react";

// In this version of Next.js the recovery function is called `retry`.
export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">
        Midagi läks valesti
      </h1>
      <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-400">
        Selle lehe laadimine ebaõnnestus. Sinu andmed on alles. Proovi uuesti
        ja kui viga kordub, tule hiljem tagasi.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex min-h-10 cursor-pointer items-center rounded-full bg-indigo-600 px-5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Proovi uuesti
        </button>
        <Link
          href="/"
          className="inline-flex min-h-10 items-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Avalehele
        </Link>
      </div>
    </main>
  );
}
