import { describe, expect, it } from "vitest";
import { isFailedSignIn } from "@/lib/auth/sign-in-result";

describe("isFailedSignIn", () => {
  it("treats a URL with an error parameter as a failure", () => {
    expect(isFailedSignIn("/login?error=CredentialsSignin")).toBe(true);
    expect(
      isFailedSignIn(
        "http://localhost:3000/login?error=CredentialsSignin&code=credentials",
      ),
    ).toBe(true);
  });

  it("treats a normal redirect as a success", () => {
    expect(isFailedSignIn("/groups")).toBe(false);
    expect(isFailedSignIn("http://localhost:3000/")).toBe(false);
    expect(isFailedSignIn("https://jagame.vercel.app/groups?tab=1")).toBe(
      false,
    );
  });

  it("treats a missing or non-string result as a failure", () => {
    expect(isFailedSignIn(undefined)).toBe(true);
    expect(isFailedSignIn(null)).toBe(true);
    expect(isFailedSignIn({ error: "x" })).toBe(true);
    expect(isFailedSignIn(42)).toBe(true);
  });
});
