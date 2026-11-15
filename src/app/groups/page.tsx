import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";
import { listGroupsOwnedBy } from "@/lib/groups/queries";
import { CreateGroupForm } from "./create-group-form";

export const metadata: Metadata = {
  title: "Minu grupid – Jagame",
};

export default function MyGroupsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Minu grupid</h1>
      <Suspense fallback={<p className="mt-8 text-zinc-500">Laen…</p>}>
        <MyGroups />
      </Suspense>
    </main>
  );
}

async function MyGroups() {
  const user = await requireUser();
  const groups = await listGroupsOwnedBy(user.id);

  return (
    <>
      {groups.length === 0 ? (
        <p className="mt-6 text-zinc-600 dark:text-zinc-400">
          Sul pole veel ühtegi gruppi. Loo esimene allpool.
        </p>
      ) : (
        <ul className="mt-8 grid gap-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/g/${group.shareToken}`}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4 transition hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-indigo-500/40"
              >
                <span className="font-medium">{group.name}</span>
                <span className="text-sm text-zinc-500">
                  {group._count.members}{" "}
                  {group._count.members === 1 ? "liige" : "liiget"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-12 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Loo uus grupp</h2>
        <div className="mt-4">
          <CreateGroupForm />
        </div>
      </section>
    </>
  );
}
