/** Who is looking at a group page. */
export type Viewer =
  /** Signed in as the account that created the group */
  | { role: "owner" }
  /** Joined through the link; `memberId` is who they said they are */
  | { role: "member"; memberId: string }
  /** Has the link but has not joined yet */
  | { role: "visitor" };

/** Only the owner adds other people by name. Everyone else joins through the link. */
export function canAddMember(viewer: Viewer): boolean {
  return viewer.role === "owner";
}

/** The owner can remove anyone; a member can only remove themselves. */
export function canRemoveMember(viewer: Viewer, memberId: string): boolean {
  if (viewer.role === "owner") return true;
  return viewer.role === "member" && viewer.memberId === memberId;
}

/** The owner stays in their own group; members can leave. */
export function canLeave(viewer: Viewer): viewer is { role: "member"; memberId: string } {
  return viewer.role === "member";
}

/** The owner and joined members keep the expense list; visitors only see the invitation. */
export function canManageExpenses(viewer: Viewer): boolean {
  return viewer.role === "owner" || viewer.role === "member";
}
