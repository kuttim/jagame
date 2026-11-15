import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Minu grupid – Jagame",
};

export default function MyGroupsPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <Suspense fallback={<p className="text-zinc-500">Laen…</p>}>
        <MyGroups />
      </Suspense>
    </main>
  );
}

async function MyGroups() {
  const user = await requireUser();

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Minu grupid</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Tere, {user.name}!
      </p>
      <p className="mt-8 text-zinc-500">Sul pole veel ühtegi gruppi.</p>
    </>
  );
}
