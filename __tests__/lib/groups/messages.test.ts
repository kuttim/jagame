import { describe, expect, it } from "vitest";
import { groupNameMessage, memberNameMessage } from "@/lib/groups/messages";

describe("group messages", () => {
  it("explains a missing name", () => {
    expect(groupNameMessage("required")).toBe("Sisesta grupi nimi.");
    expect(memberNameMessage("required")).toBe("Sisesta liikme nimi.");
  });

  it("mentions the limit when a name is too long", () => {
    expect(groupNameMessage("too_long")).toContain("60");
    expect(memberNameMessage("too_long")).toContain("50");
  });
});
