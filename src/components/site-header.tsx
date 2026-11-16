import Link from "next/link";
import { Suspense } from "react";
import { signOutAction } from "@/app/sign-out-action";
import { getCurrentUser } from "@/lib/auth/session";

const linkClass =
  "inline-flex min-h-10 items-center text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-1 text-sm sm:px-6">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
          >
            Jagame
          </Link>
          <Link href="/diary" className={linkClass}>
            Päevik
          </Link>
        </div>
        {/* The session is read at request time, so this part streams in
            behind a boundary and the rest of the page can be prerendered. */}
        <Suspense fallback={<span className="h-10 w-32" aria-hidden />}>
          <AccountNav />
        </Suspense>
      </nav>
    </header>
  );
}

async function AccountNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/login" className={linkClass}>
          Logi sisse
        </Link>
        <Link
          href="/register"
          className="rounded-full bg-indigo-600 px-4 py-1.5 font-medium text-white transition-colors hover:bg-indigo-500"
        >
          Registreeru
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/groups" className={linkClass}>
        Minu grupid
      </Link>
      <span className="hidden text-zinc-500 sm:inline">{user.name}</span>
      <form action={signOutAction}>
        <button type="submit" className={`${linkClass} cursor-pointer`}>
          Logi välja
        </button>
      </form>
    </div>
  );
}
