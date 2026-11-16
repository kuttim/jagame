import { connection } from "next/server";
import { db } from "@/lib/db";

/** Groups owned by a user, newest first. Call inside <Suspense>. */
export async function listGroupsOwnedBy(userId: string) {
  await connection();
  return db.group.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      shareToken: true,
      _count: { select: { members: true } },
    },
  });
}

/**
 * A group and its members, found by the secret token from the share link.
 * Returns null for an unknown token. Call inside <Suspense>.
 */
export async function getGroupByToken(token: string) {
  await connection();
  return db.group.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      name: true,
      ownerId: true,
      shareToken: true,
      members: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true },
      },
      expenses: {
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          description: true,
          amount: true,
          date: true,
          payerId: true,
          payer: { select: { name: true } },
          shares: {
            orderBy: { member: { createdAt: "asc" } },
            select: { memberId: true, amount: true, member: { select: { name: true } } },
          },
        },
      },
    },
  });
}

/** One expense with its shares, but only if it belongs to the group with this token. */
export async function getExpenseInGroup(token: string, expenseId: string) {
  await connection();
  return db.group.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      ownerId: true,
      shareToken: true,
      members: {
        orderBy: { createdAt: "asc" },
        select: { id: true, name: true },
      },
      expenses: {
        where: { id: expenseId },
        select: {
          id: true,
          description: true,
          amount: true,
          date: true,
          payerId: true,
          splitType: true,
          shares: { select: { memberId: true, amount: true } },
        },
      },
    },
  });
}
