"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  GROUP_FULL_MESSAGE,
  GROUP_NOT_FOUND_MESSAGE,
  MEMBER_EXISTS_MESSAGE,
  NOT_ALLOWED_MESSAGE,
  memberNameMessage,
} from "@/lib/groups/messages";
import { canAddMember, canLeave, canRemoveMember } from "@/lib/groups/permissions";
import {
  isDuplicateName,
  MAX_MEMBER_NAME_LENGTH,
  MAX_MEMBERS,
  validateName,
} from "@/lib/groups/validation";
import { forgetMember, getViewer, rememberMember } from "@/lib/groups/viewer";

export type NameFormState =
  | { error: string; values: { name: string } }
  | undefined;

// Access to a group is the secret token from its link (README), so every
// action looks the group up by token and never trusts an id on its own. What
// the visitor may do is decided on the server (permissions.ts), not by which
// buttons the page happens to show.

function loadGroup(token: string) {
  return db.group.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      ownerId: true,
      members: { select: { id: true, name: true } },
    },
  });
}

/** The owner adds someone by name. */
export async function addMember(
  token: string,
  _previous: NameFormState,
  formData: FormData,
): Promise<NameFormState> {
  const raw = formData.get("name");
  const values = { name: typeof raw === "string" ? raw : "" };

  const result = validateName(raw, MAX_MEMBER_NAME_LENGTH);
  if (!result.ok) return { error: memberNameMessage(result.problem), values };

  const group = await loadGroup(token);
  if (!group) return { error: GROUP_NOT_FOUND_MESSAGE, values };
  if (!canAddMember(await getViewer(group))) {
    return { error: NOT_ALLOWED_MESSAGE, values };
  }
  if (group.members.length >= MAX_MEMBERS) return { error: GROUP_FULL_MESSAGE, values };
  if (isDuplicateName(result.value, group.members.map((m) => m.name))) {
    return { error: MEMBER_EXISTS_MESSAGE, values };
  }

  await db.member.create({ data: { groupId: group.id, name: result.value } });
  revalidatePath(`/g/${token}`);
  return undefined;
}

/** A visitor opens the invitation and says who they are. */
export async function joinGroup(
  token: string,
  _previous: NameFormState,
  formData: FormData,
): Promise<NameFormState> {
  const raw = formData.get("name");
  const values = { name: typeof raw === "string" ? raw : "" };

  const result = validateName(raw, MAX_MEMBER_NAME_LENGTH);
  if (!result.ok) return { error: memberNameMessage(result.problem), values };

  const group = await loadGroup(token);
  if (!group) return { error: GROUP_NOT_FOUND_MESSAGE, values };
  if ((await getViewer(group)).role !== "visitor") return undefined;

  if (group.members.length >= MAX_MEMBERS) return { error: GROUP_FULL_MESSAGE, values };
  if (isDuplicateName(result.value, group.members.map((m) => m.name))) {
    return { error: MEMBER_EXISTS_MESSAGE, values };
  }

  const member = await db.member.create({
    data: { groupId: group.id, name: result.value },
    select: { id: true },
  });
  await rememberMember(group.id, member.id);
  revalidatePath(`/g/${token}`);
  return undefined;
}

/** A visitor says "I am one of the names already in the list". */
export async function claimMember(token: string, memberId: string) {
  const group = await loadGroup(token);
  if (!group) return;
  if ((await getViewer(group)).role !== "visitor") return;
  if (!group.members.some((m) => m.id === memberId)) return;

  await rememberMember(group.id, memberId);
  revalidatePath(`/g/${token}`);
}

export async function removeMember(token: string, memberId: string) {
  const group = await loadGroup(token);
  if (!group) return;
  const viewer = await getViewer(group);
  if (!canRemoveMember(viewer, memberId)) return;

  // The group condition makes sure a member id from another group is ignored.
  await db.member.deleteMany({ where: { id: memberId, groupId: group.id } });
  if (viewer.role === "member") await forgetMember(group.id);
  revalidatePath(`/g/${token}`);
}

export async function leaveGroup(token: string) {
  const group = await loadGroup(token);
  if (!group) return;
  const viewer = await getViewer(group);
  if (!canLeave(viewer)) return;

  await db.member.deleteMany({ where: { id: viewer.memberId, groupId: group.id } });
  await forgetMember(group.id);
  revalidatePath(`/g/${token}`);
}
