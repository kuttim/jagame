import { describe, expect, it } from "vitest";
import {
  canAddMember,
  canLeave,
  canRemoveMember,
  type Viewer,
} from "@/lib/groups/permissions";

const owner: Viewer = { role: "owner" };
const member: Viewer = { role: "member", memberId: "m1" };
const visitor: Viewer = { role: "visitor" };

describe("canAddMember", () => {
  it("is only for the owner", () => {
    expect(canAddMember(owner)).toBe(true);
    expect(canAddMember(member)).toBe(false);
    expect(canAddMember(visitor)).toBe(false);
  });
});

describe("canRemoveMember", () => {
  it("lets the owner remove anyone", () => {
    expect(canRemoveMember(owner, "m1")).toBe(true);
    expect(canRemoveMember(owner, "m2")).toBe(true);
  });

  it("lets a member remove only themselves", () => {
    expect(canRemoveMember(member, "m1")).toBe(true);
    expect(canRemoveMember(member, "m2")).toBe(false);
  });

  it("never lets a visitor remove anyone", () => {
    expect(canRemoveMember(visitor, "m1")).toBe(false);
  });
});

describe("canLeave", () => {
  it("is for members only, not the owner or visitors", () => {
    expect(canLeave(member)).toBe(true);
    expect(canLeave(owner)).toBe(false);
    expect(canLeave(visitor)).toBe(false);
  });
});
