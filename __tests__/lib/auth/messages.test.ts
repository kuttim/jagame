import { describe, expect, it } from "vitest";
import {
  EMAIL_TAKEN_MESSAGE,
  LOGIN_FAILED_MESSAGE,
  registrationMessages,
} from "@/lib/auth/messages";

describe("registrationMessages", () => {
  it("returns nothing when there are no errors", () => {
    expect(registrationMessages({})).toEqual({});
  });

  it("gives an Estonian message for every error code", () => {
    const messages = registrationMessages({
      name: "too_long",
      email: "invalid",
      password: "too_short",
    });
    expect(messages.name).toContain("liiga pikk");
    expect(messages.email).toContain("e-posti");
    expect(messages.password).toContain("vähemalt 8");

    expect(registrationMessages({ name: "required" }).name).toBeTruthy();
    expect(registrationMessages({ password: "too_long" }).password).toContain(
      "72",
    );
  });

  it("only returns messages for fields that have an error", () => {
    expect(Object.keys(registrationMessages({ email: "invalid" }))).toEqual([
      "email",
    ]);
  });
});

describe("login and sign-up messages", () => {
  it("does not reveal which part of the login was wrong", () => {
    expect(LOGIN_FAILED_MESSAGE).not.toMatch(/ei leitud|ei eksisteeri/i);
  });

  it("points an existing user to the sign-in page", () => {
    expect(EMAIL_TAKEN_MESSAGE).toContain("sisse logida");
  });
});
