import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-24">
      <h1 className="text-5xl font-semibold tracking-tight">Jagame</h1>
      <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Ühiste kulude jagamise rakendus sõpradele, korterikaaslastele ja
        reisikaaslastele. Rakendus on veel tegemisel.
      </p>
      <p className="mt-8">
        <Link
          href="/diary"
          className="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Loe arenduspäevikut →
        </Link>
      </p>
    </main>
  );
}
