export const MAX_GROUP_NAME_LENGTH = 60;
export const MAX_MEMBER_NAME_LENGTH = 50;
/** Anyone with the link can add members, so the size of a group is capped. */
export const MAX_MEMBERS = 50;

export type NameProblem = "required" | "too_long";

export type NameResult =
  | { ok: true; value: string }
  | { ok: false; problem: NameProblem };

/** Trims the name and collapses runs of whitespace into single spaces. */
export function cleanName(raw: unknown): string {
  return typeof raw === "string" ? raw.trim().replace(/\s+/g, " ") : "";
}

/** Validates a group or member name; length is counted in characters, not UTF-16 units. */
export function validateName(raw: unknown, maxLength: number): NameResult {
  const value = cleanName(raw);
  if (value.length === 0) return { ok: false, problem: "required" };
  if ([...value].length > maxLength) return { ok: false, problem: "too_long" };
  return { ok: true, value };
}

/** True if a member with the same name (ignoring case) is already in the list. */
export function isDuplicateName(name: string, existing: readonly string[]): boolean {
  const key = name.toLocaleLowerCase("et");
  return existing.some((other) => other.toLocaleLowerCase("et") === key);
}
