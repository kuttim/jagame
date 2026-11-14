import Link from "next/link";

export default function PaevikLayout({ children }: LayoutProps<"/paevik">) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pb-20 pt-8 sm:px-6">
      <nav className="mb-12 flex items-center justify-between text-sm">
        <Link
          href="/"
          className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100"
        >
          Jagame
        </Link>
        <Link
          href="/paevik"
          className="text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          Arenduspäevik
        </Link>
      </nav>
      {children}
    </div>
  );
}
