import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Put this on pages that only make sense for visitors who are not signed in
 * (sign-in and sign-up). It renders nothing, and sends signed-in users to
 * their groups. It reads the session, so use it inside <Suspense>.
 */
export async function RedirectIfSignedIn() {
  const user = await getCurrentUser();
  if (user) redirect("/groups");
  return null;
}
