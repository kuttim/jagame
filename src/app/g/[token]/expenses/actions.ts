"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  EXPENSE_NOT_FOUND_MESSAGE,
  expenseMessages,
  type ExpenseMessages,
} from "@/lib/expenses/messages";
import { validateExpense } from "@/lib/expenses/validation";
import { GROUP_NOT_FOUND_MESSAGE, NOT_ALLOWED_MESSAGE } from "@/lib/groups/messages";
import { canManageExpenses } from "@/lib/groups/permissions";
import { getViewer } from "@/lib/groups/viewer";

export type ExpenseFormState =
  | {
      errors: ExpenseMessages & { general?: string };
      /** Everything the person typed, to refill the form (field name -> text) */
      values: Record<string, string>;
    }
  | undefined;

function loadGroup(token: string) {
  return db.group.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      ownerId: true,
      members: { select: { id: true } },
    },
  });
}

function typedValues(formData: FormData): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/**
 * Creates an expense (`expenseId` is null) or updates one. The form sends a
 * checkbox `in-<memberId>` and a number `value-<memberId>` for each member;
 * only ticked members take part in the split.
 */
export async function saveExpense(
  token: string,
  expenseId: string | null,
  _previous: ExpenseFormState,
  formData: FormData,
): Promise<ExpenseFormState> {
  const values = typedValues(formData);
  const fail = (general: string): ExpenseFormState => ({
    errors: { general },
    values,
  });

  const group = await loadGroup(token);
  if (!group) return fail(GROUP_NOT_FOUND_MESSAGE);
  if (!canManageExpenses(await getViewer(group))) {
    return fail(NOT_ALLOWED_MESSAGE);
  }

  const memberIds = group.members.map((m) => m.id);
  const participants: Record<string, string> = {};
  for (const id of memberIds) {
    if (formData.get(`in-${id}`) === "on") {
      participants[id] = text(formData, `value-${id}`);
    }
  }

  const result = validateExpense({
    description: formData.get("description"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    payerId: formData.get("payerId"),
    splitType: formData.get("splitType"),
    participants,
    memberIds,
  });
  if (!result.ok) return { errors: expenseMessages(result.errors), values };

  const { description, amount, date, payerId, splitType, shares } = result.value;
  const data = {
    description,
    amount,
    date: new Date(`${date}T00:00:00.000Z`),
    payerId,
    splitType,
  };
  const shareRows = Object.entries(shares).map(([memberId, shareAmount]) => ({
    memberId,
    amount: shareAmount,
  }));

  if (expenseId === null) {
    await db.expense.create({
      data: { ...data, groupId: group.id, shares: { create: shareRows } },
    });
  } else {
    // The group condition stops anyone editing an expense of another group.
    const existing = await db.expense.findFirst({
      where: { id: expenseId, groupId: group.id },
      select: { id: true },
    });
    if (!existing) return fail(EXPENSE_NOT_FOUND_MESSAGE);

    await db.$transaction([
      db.expenseShare.deleteMany({ where: { expenseId } }),
      db.expense.update({
        where: { id: expenseId },
        data: { ...data, shares: { create: shareRows } },
      }),
    ]);
  }

  revalidatePath(`/g/${token}`);
  redirect(`/g/${token}`);
}

export async function deleteExpense(token: string, expenseId: string) {
  const group = await loadGroup(token);
  if (!group) return;
  if (!canManageExpenses(await getViewer(group))) return;

  // Its shares are removed with it (ON DELETE CASCADE).
  await db.expense.deleteMany({ where: { id: expenseId, groupId: group.id } });
  revalidatePath(`/g/${token}`);
  redirect(`/g/${token}`);
}
