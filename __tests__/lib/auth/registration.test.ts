import { describe, expect, it } from "vitest";
import { MAX_NAME_LENGTH, validateRegistration } from "@/lib/auth/registration";

const valid = {
  name: "Mari Tamm",
  email: "mari@example.com",
  password: "correct horse",
};

describe("validateRegistration", () => {
  it("accepts valid input", () => {
    expect(validateRegistration(valid)).toEqual({ ok: true, value: valid });
  });

  it("trims the name and normalizes the email, but leaves the password alone", () => {
    const result = validateRegistration({
      name: "  Mari Tamm  ",
      email: "  Mari@Example.COM ",
      password: "  spaces count  ",
    });
    expect(result).toEqual({
      ok: true,
      value: {
        name: "Mari Tamm",
        email: "mari@example.com",
        password: "  spaces count  ",
      },
    });
  });

  it("requires a name", () => {
    for (const name of ["", "   ", undefined, null, 42]) {
      const result = validateRegistration({ ...valid, name });
      expect(result).toEqual({ ok: false, errors: { name: "required" } });
    }
  });

  it("limits the name length in characters, not bytes", () => {
    expect(
      validateRegistration({ ...valid, name: "õ".repeat(MAX_NAME_LENGTH) }).ok,
    ).toBe(true);
    expect(
      validateRegistration({ ...valid, name: "a".repeat(MAX_NAME_LENGTH + 1) }),
    ).toEqual({ ok: false, errors: { name: "too_long" } });
  });

  it("rejects an invalid email", () => {
    for (const email of ["", "mari", "mari@", "mari@example", undefined]) {
      const result = validateRegistration({ ...valid, email });
      expect(result, String(email)).toEqual({
        ok: false,
        errors: { email: "invalid" },
      });
    }
  });

  it("rejects a password that is too short or too long", () => {
    expect(validateRegistration({ ...valid, password: "short" })).toEqual({
      ok: false,
      errors: { password: "too_short" },
    });
    expect(validateRegistration({ ...valid, password: "a".repeat(73) })).toEqual(
      { ok: false, errors: { password: "too_long" } },
    );
    expect(validateRegistration({ ...valid, password: undefined })).toEqual({
      ok: false,
      errors: { password: "too_short" },
    });
  });

  it("reports every problem at once", () => {
    expect(validateRegistration({})).toEqual({
      ok: false,
      errors: { name: "required", email: "invalid", password: "too_short" },
    });
  });
});
