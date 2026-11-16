import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import {
  centsToInput,
  hundredthsToInput,
  sharesToPercentHundredths,
} from "@/lib/expenses/format";
import { canManageExpenses } from "@/lib/groups/permissions";
import { getExpenseInGroup } from "@/lib/groups/queries";
import { getViewer } from "@/lib/groups/viewer";
import { deleteExpense, saveExpense } from "../../actions";
import { ExpenseForm } from "../../expense-form";
import { DeleteExpenseButton } from "./delete-expense-button";

export const metadata: Metadata = {
  title: "Muuda kulu – Jagame",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

type Props = PageProps<"/g/[token]/expenses/[id]/edit">;

export default function EditExpensePage(props: Props) {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <Suspense fallback={<p className="text-zinc-500">Laen…</p>}>
        <EditExpense params={props.params} />
      </Suspense>
    </main>
  );
}

async function EditExpense({ params }: Pick<Props, "params">) {
  const { token, id } = await params;
  const group = await getExpenseInGroup(token, id);
  if (!group) notFound();

  const viewer = await getViewer(group);
  if (!canManageExpenses(viewer)) redirect(`/g/${token}`);

  const expense = group.expenses[0];
  if (!expense) notFound();

  const sharesById = Object.fromEntries(
    expense.shares.map((share) => [share.memberId, share.amount]),
  );
  const percents =
    expense.splitType === "PERCENT"
      ? sharesToPercentHundredths(sharesById, expense.amount)
      : {};

  const initialValues: Record<string, string> = {
    description: expense.description,
    amount: centsToInput(expense.amount),
    date: expense.date.toISOString().slice(0, 10),
    payerId: expense.payerId,
    splitType: expense.splitType,
  };
  for (const share of expense.shares) {
    initialValues[`in-${share.memberId}`] = "on";
    if (expense.splitType === "AMOUNTS") {
      initialValues[`value-${share.memberId}`] = centsToInput(share.amount);
    }
    if (expense.splitType === "PERCENT") {
      initialValues[`value-${share.memberId}`] = hundredthsToInput(percents[share.memberId]);
    }
  }

  return (
    <>
      <Link
        href={`/g/${token}`}
        className="-mx-2 inline-flex min-h-10 items-center px-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Tagasi gruppi
      </Link>
      <h1 className="mb-8 mt-4 text-3xl font-semibold tracking-tight">Muuda kulu</h1>
      <ExpenseForm
        action={saveExpense.bind(null, token, expense.id)}
        members={group.members}
        initialValues={initialValues}
        submitLabel="Salvesta"
        cancelHref={`/g/${token}`}
      />
      <div className="mt-12 border-t border-zinc-200 pt-6 dark:border-zinc-800">
        <DeleteExpenseButton action={deleteExpense.bind(null, token, expense.id)} />
      </div>
    </>
  );
}
