import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  authenticate,
  isValidEmail,
  normalizeEmail,
  type StoredUser,
} from "./credentials";
import { hashPassword } from "./password";

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Mari@Example.COM ")).toBe("mari@example.com");
  });
});

describe("isValidEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(isValidEmail("mari@example.com")).toBe(true);
    expect(isValidEmail("mari.tamm+jagame@mail.ee")).toBe(true);
    expect(isValidEmail("  Mari@Example.com  ")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    for (const bad of ["", "mari", "mari@", "@example.com", "mari@example", "a b@example.com", "a@@example.com"]) {
      expect(isValidEmail(bad), bad).toBe(false);
    }
  });

  it("rejects addresses longer than 254 characters", () => {
    expect(isValidEmail("a".repeat(250) + "@b.ee")).toBe(false);
  });
});

describe("authenticate", () => {
  let mari: StoredUser;
  let findUser: ReturnType<typeof vi.fn<(email: string) => Promise<StoredUser | null>>>;

  beforeAll(async () => {
    mari = {
      id: "u1",
      email: "mari@example.com",
      name: "Mari",
      passwordHash: await hashPassword("correct horse", 4),
    };
    findUser = vi.fn(async (email: string) =>
      email === mari.email ? mari : null,
    );
  });

  it("returns the user, without the password hash, for correct credentials", async () => {
    const user = await authenticate(
      { email: "mari@example.com", password: "correct horse" },
      findUser,
    );
    expect(user).toEqual({ id: "u1", email: "mari@example.com", name: "Mari" });
    expect(user).not.toHaveProperty("passwordHash");
  });

  it("finds the user regardless of email case and spaces", async () => {
    const user = await authenticate(
      { email: "  MARI@Example.com ", password: "correct horse" },
      findUser,
    );
    expect(user?.id).toBe("u1");
    expect(findUser).toHaveBeenLastCalledWith("mari@example.com");
  });

  it("returns null for a wrong password", async () => {
    expect(
      await authenticate({ email: "mari@example.com", password: "wrong horse" }, findUser),
    ).toBeNull();
  });

  it("returns null for an unknown email", async () => {
    expect(
      await authenticate({ email: "nobody@example.com", password: "correct horse" }, findUser),
    ).toBeNull();
  });

  it("returns null, without querying, for a malformed email", async () => {
    const lookup = vi.fn(async () => mari);
    expect(
      await authenticate({ email: "not-an-email", password: "correct horse" }, lookup),
    ).toBeNull();
    expect(lookup).not.toHaveBeenCalled();
  });

  it("returns null for missing or non-string input", async () => {
    for (const input of [
      { email: undefined, password: "correct horse" },
      { email: "mari@example.com", password: undefined },
      { email: 123, password: "correct horse" },
      { email: "mari@example.com", password: ["correct horse"] },
      { email: null, password: null },
    ]) {
      expect(await authenticate(input, findUser)).toBeNull();
    }
  });

  it("returns null for a password over 72 bytes that starts like the real one", async () => {
    const long = await hashPassword("a".repeat(72), 4);
    const lookup = async () => ({ ...mari, passwordHash: long });
    expect(
      await authenticate(
        { email: "mari@example.com", password: "a".repeat(72) + "x" },
        lookup,
      ),
    ).toBeNull();
  });
});
