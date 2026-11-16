import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { canManageExpenses } from "@/lib/groups/permissions";
import { getGroupByToken } from "@/lib/groups/queries";
import { getViewer } from "@/lib/groups/viewer";
import { saveExpense } from "../actions";
import { ExpenseForm } from "../expense-form";

export const metadata: Metadata = {
  title: "Lisa kulu – Jagame",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function NewExpensePage(props: PageProps<"/g/[token]/expenses/new">) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <Suspense fallback={<p className="text-zinc-500">Laen…</p>}>
        <NewExpense params={props.params} />
      </Suspense>
    </main>
  );
}

async function NewExpense({
  params,
}: Pick<PageProps<"/g/[token]/expenses/new">, "params">) {
  const { token } = await params;
  const group = await getGroupByToken(token);
  if (!group) notFound();

  const viewer = await getViewer(group);
  if (!canManageExpenses(viewer)) redirect(`/g/${token}`);

  // Default payer: the viewer themselves, or the group's first member (the owner).
  const payerId =
    viewer.role === "member" ? viewer.memberId : (group.members[0]?.id ?? "");
  // Today's date in Estonia, as YYYY-MM-DD
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Tallinn" });

  const initialValues: Record<string, string> = {
    description: "",
    amount: "",
    date: today,
    payerId,
    splitType: "EQUAL",
  };
  for (const member of group.members) initialValues[`in-${member.id}`] = "on";

  return (
    <>
      <Link
        href={`/g/${token}`}
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← {group.name}
      </Link>
      <h1 className="mb-8 mt-4 text-3xl font-semibold tracking-tight">Lisa kulu</h1>
      <ExpenseForm
        action={saveExpense.bind(null, token, null)}
        members={group.members}
        initialValues={initialValues}
        submitLabel="Lisa kulu"
        cancelHref={`/g/${token}`}
      />
    </>
  );
}
