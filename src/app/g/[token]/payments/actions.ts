"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PAYMENT_CHANGED_MESSAGE } from "@/lib/expenses/messages";
import { computeGroupSummary, isSuggestedTransfer } from "@/lib/expenses/summary";
import { GROUP_NOT_FOUND_MESSAGE, NOT_ALLOWED_MESSAGE } from "@/lib/groups/messages";
import { canManageExpenses } from "@/lib/groups/permissions";
import { getViewer } from "@/lib/groups/viewer";
import type { ActionResult } from "../actions";

/**
 * Marks one of the suggested transfers as paid. The server works out the
 * suggestions itself and accepts only an exact match, so nobody can record a
 * payment that was never suggested or with a different amount, and a page that
 * has gone out of date cannot record a stale one.
 */
export async function markPaid(
  token: string,
  fromId: string,
  toId: string,
  amount: number,
): Promise<ActionResult> {
  const group = await db.group.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      ownerId: true,
      members: { orderBy: { createdAt: "asc" }, select: { id: true, name: true } },
      expenses: {
        select: {
          payerId: true,
          amount: true,
          shares: { select: { memberId: true, amount: true } },
        },
      },
      payments: { select: { fromMemberId: true, toMemberId: true, amount: true } },
    },
  });
  if (!group) return { error: GROUP_NOT_FOUND_MESSAGE };
  if (!canManageExpenses(await getViewer(group))) return { error: NOT_ALLOWED_MESSAGE };

  const summary = computeGroupSummary(group.members, group.expenses, group.payments);
  if (!isSuggestedTransfer(summary.transfers, { fromId, toId, amount })) {
    return { error: PAYMENT_CHANGED_MESSAGE };
  }

  await db.payment.create({
    data: { groupId: group.id, fromMemberId: fromId, toMemberId: toId, amount },
  });
  revalidatePath(`/g/${token}`);
  return undefined;
}

/** Takes a payment back, for example if it was marked by mistake. */
export async function undoPayment(
  token: string,
  paymentId: string,
): Promise<ActionResult> {
  const group = await db.group.findUnique({
    where: { shareToken: token },
    select: { id: true, ownerId: true, members: { select: { id: true } } },
  });
  if (!group) return { error: GROUP_NOT_FOUND_MESSAGE };
  if (!canManageExpenses(await getViewer(group))) return { error: NOT_ALLOWED_MESSAGE };

  // The group condition stops anyone removing a payment of another group.
  await db.payment.deleteMany({ where: { id: paymentId, groupId: group.id } });
  revalidatePath(`/g/${token}`);
  return undefined;
}
