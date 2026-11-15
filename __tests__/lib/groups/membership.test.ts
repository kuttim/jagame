import { describe, expect, it } from "vitest";
import {
  membershipCookieName,
  readMembership,
  signMembership,
} from "@/lib/groups/membership";

const SECRET = "test-secret-one";

describe("signMembership / readMembership", () => {
  it("round-trips the member id", () => {
    const value = signMembership("group1", "member1", SECRET);
    expect(readMembership(value, "group1", SECRET)).toBe("member1");
  });

  it("rejects a cookie issued for another group", () => {
    const value = signMembership("group1", "member1", SECRET);
    expect(readMembership(value, "group2", SECRET)).toBeNull();
  });

  it("rejects a cookie signed with another secret", () => {
    const value = signMembership("group1", "member1", "another-secret");
    expect(readMembership(value, "group1", SECRET)).toBeNull();
  });

  it("rejects a forged member id with the old signature", () => {
    const signature = signMembership("group1", "member1", SECRET).split(".")[1];
    expect(readMembership(`member2.${signature}`, "group1", SECRET)).toBeNull();
  });

  it("rejects missing, empty and malformed values", () => {
    expect(readMembership(undefined, "group1", SECRET)).toBeNull();
    expect(readMembership("", "group1", SECRET)).toBeNull();
    expect(readMembership("nodot", "group1", SECRET)).toBeNull();
    expect(readMembership(".onlysignature", "group1", SECRET)).toBeNull();
    expect(readMembership("member1.", "group1", SECRET)).toBeNull();
    expect(readMembership("member1.short", "group1", SECRET)).toBeNull();
  });

  it("rejects everything when the secret is empty, and refuses to sign with it", () => {
    const value = signMembership("group1", "member1", SECRET);
    expect(readMembership(value, "group1", "")).toBeNull();
    expect(() => signMembership("group1", "member1", "")).toThrow();
  });
});

describe("membershipCookieName", () => {
  it("is different for each group", () => {
    expect(membershipCookieName("a")).not.toBe(membershipCookieName("b"));
  });
});
