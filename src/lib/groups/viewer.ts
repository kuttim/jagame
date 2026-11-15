import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/session";
import { membershipCookieName, readMembership, signMembership } from "./membership";
import type { Viewer } from "./permissions";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function secret(): string {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return value;
}

/**
 * Works out who is looking at a group: its owner (signed in), a member who
 * joined through the link (signed cookie), or a visitor. Call inside <Suspense>
 * or a Server Action: it reads cookies and the session.
 */
export async function getViewer(group: {
  id: string;
  ownerId: string;
  members: readonly { id: string }[];
}): Promise<Viewer> {
  const user = await getCurrentUser();
  if (user?.id === group.ownerId) return { role: "owner" };

  const store = await cookies();
  const memberId = readMembership(
    store.get(membershipCookieName(group.id))?.value,
    group.id,
    secret(),
  );
  // A removed member's cookie still verifies, so check they are still in the group.
  if (memberId && group.members.some((m) => m.id === memberId)) {
    return { role: "member", memberId };
  }
  return { role: "visitor" };
}

/** Remembers in this browser that the visitor is `memberId`. Server Actions only. */
export async function rememberMember(groupId: string, memberId: string) {
  const store = await cookies();
  store.set(membershipCookieName(groupId), signMembership(groupId, memberId, secret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
}

export async function forgetMember(groupId: string) {
  const store = await cookies();
  store.delete(membershipCookieName(groupId));
}
