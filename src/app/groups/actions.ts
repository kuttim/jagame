"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { groupNameMessage } from "@/lib/groups/messages";
import { MAX_GROUP_NAME_LENGTH, validateName } from "@/lib/groups/validation";

export type CreateGroupState =
  | { error: string; values: { name: string } }
  | undefined;

export async function createGroup(
  _previous: CreateGroupState,
  formData: FormData,
): Promise<CreateGroupState> {
  const user = await requireUser();

  const raw = formData.get("name");
  const result = validateName(raw, MAX_GROUP_NAME_LENGTH);
  if (!result.ok) {
    return {
      error: groupNameMessage(result.problem),
      values: { name: typeof raw === "string" ? raw : "" },
    };
  }

  // The creator is the group's first member, under their account name.
  const group = await db.group.create({
    data: {
      name: result.value,
      ownerId: user.id,
      members: { create: { name: user.name } },
    },
    select: { shareToken: true },
  });

  redirect(`/g/${group.shareToken}`);
}
