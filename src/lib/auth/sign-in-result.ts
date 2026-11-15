/**
 * Auth.js does not throw when the email or password is wrong. `signIn` with
 * `redirect: false` returns the URL it would have sent the user to, and for a
 * failed sign-in that URL carries an `error` parameter, for example
 * `/login?error=CredentialsSignin`. This tells the two outcomes apart.
 */
export function isFailedSignIn(result: unknown): boolean {
  if (typeof result !== "string") return true;
  try {
    // The base only lets us parse relative URLs such as "/login?error=..."
    return new URL(result, "http://localhost").searchParams.has("error");
  } catch {
    return true;
  }
}
