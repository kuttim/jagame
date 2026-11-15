import { createHmac, timingSafeEqual } from "node:crypto";

// Visitors have no account, so "who am I in this group" is remembered in a
// cookie. The cookie is signed with a server secret so nobody can forge it by
// typing another member's id.

export function membershipCookieName(groupId: string): string {
  return `member-${groupId}`;
}

function mac(secret: string, groupId: string, memberId: string): string {
  return createHmac("sha256", secret)
    .update(`${groupId}:${memberId}`)
    .digest("base64url");
}

/** The cookie value that says "this browser is member `memberId` of `groupId`". */
export function signMembership(
  groupId: string,
  memberId: string,
  secret: string,
): string {
  if (!secret) throw new Error("A non-empty secret is required to sign a membership");
  return `${memberId}.${mac(secret, groupId, memberId)}`;
}

/**
 * Returns the member id from a cookie value, or null if the value is missing,
 * malformed, signed with another secret or issued for another group.
 */
export function readMembership(
  value: string | undefined,
  groupId: string,
  secret: string,
): string | null {
  if (!value || !secret) return null;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return null;

  const memberId = value.slice(0, dot);
  const given = Buffer.from(value.slice(dot + 1));
  const expected = Buffer.from(mac(secret, groupId, memberId));
  if (given.length !== expected.length) return null;
  return timingSafeEqual(given, expected) ? memberId : null;
}
