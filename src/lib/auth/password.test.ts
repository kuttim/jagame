import { describe, expect, it } from "vitest";
import {
  BCRYPT_COST,
  MAX_PASSWORD_BYTES,
  MIN_PASSWORD_LENGTH,
  hashPassword,
  validatePassword,
  verifyPassword,
} from "./password";

// bcrypt's minimum cost keeps the tests fast; one test checks the real cost.
const TEST_COST = 4;

describe("validatePassword", () => {
  it("accepts a password at the minimum length", () => {
    expect(validatePassword("a".repeat(MIN_PASSWORD_LENGTH))).toBeNull();
  });

  it("rejects a password that is too short", () => {
    expect(validatePassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toBe(
      "too_short",
    );
    expect(validatePassword("")).toBe("too_short");
  });

  it("counts characters, not bytes, for the minimum", () => {
    // 8 emoji are 8 characters (32 bytes), so they are long enough
    expect(validatePassword("😀".repeat(8))).toBeNull();
    expect(validatePassword("😀".repeat(7))).toBe("too_short");
  });

  it("accepts a password at the maximum of 72 bytes", () => {
    expect(validatePassword("a".repeat(MAX_PASSWORD_BYTES))).toBeNull();
  });

  it("rejects a password over 72 bytes", () => {
    expect(validatePassword("a".repeat(MAX_PASSWORD_BYTES + 1))).toBe(
      "too_long",
    );
  });

  it("counts bytes, not characters, for the maximum", () => {
    // "õ" is 2 bytes in UTF-8: 37 of them are 74 bytes
    expect(validatePassword("õ".repeat(36))).toBeNull();
    expect(validatePassword("õ".repeat(37))).toBe("too_long");
  });

  it("does not trim spaces", () => {
    expect(validatePassword("        ")).toBeNull();
  });
});

describe("hashPassword and verifyPassword", () => {
  it("verifies the right password", async () => {
    const hash = await hashPassword("correct horse", TEST_COST);
    expect(await verifyPassword("correct horse", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct horse", TEST_COST);
    expect(await verifyPassword("correct horsf", hash)).toBe(false);
    expect(await verifyPassword("Correct horse", hash)).toBe(false);
    expect(await verifyPassword("", hash)).toBe(false);
  });

  it("never stores the password in the hash", async () => {
    const hash = await hashPassword("correct horse", TEST_COST);
    expect(hash).not.toContain("correct horse");
  });

  it("gives a different hash each time (random salt)", async () => {
    const a = await hashPassword("correct horse", TEST_COST);
    const b = await hashPassword("correct horse", TEST_COST);
    expect(a).not.toBe(b);
    expect(await verifyPassword("correct horse", a)).toBe(true);
    expect(await verifyPassword("correct horse", b)).toBe(true);
  });

  it("uses bcrypt's format with the default cost", async () => {
    const hash = await hashPassword("correct horse");
    expect(hash).toMatch(new RegExp(`^\\$2[aby]\\$${BCRYPT_COST}\\$`));
    expect(hash).toHaveLength(60);
    expect(await verifyPassword("correct horse", hash)).toBe(true);
  });

  it("treats the same visible text in different Unicode forms as equal", async () => {
    const composed = "café-password"; // é as one character
    const decomposed = "café-password"; // e + combining accent
    const hash = await hashPassword(composed, TEST_COST);
    expect(await verifyPassword(decomposed, hash)).toBe(true);
  });

  it("refuses to hash an invalid password", async () => {
    await expect(hashPassword("short", TEST_COST)).rejects.toThrow(RangeError);
    await expect(
      hashPassword("a".repeat(MAX_PASSWORD_BYTES + 1), TEST_COST),
    ).rejects.toThrow(RangeError);
  });

  it("does not accept a too-long password that only differs after byte 72", async () => {
    const base = "a".repeat(MAX_PASSWORD_BYTES);
    const hash = await hashPassword(base, TEST_COST);
    // bcrypt alone would see these as identical because it cuts at 72 bytes
    expect(await verifyPassword(base + "different", hash)).toBe(false);
  });

  it("returns false (and does not throw) for a malformed hash", async () => {
    expect(await verifyPassword("correct horse", "")).toBe(false);
    expect(await verifyPassword("correct horse", "not-a-hash")).toBe(false);
    expect(await verifyPassword("correct horse", "$2b$12$tooshort")).toBe(
      false,
    );
  });
});
