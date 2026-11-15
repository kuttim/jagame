import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";

export type CurrentUser = { id: string; name: string; email: string };

/**
 * The signed-in user, or null. Reads the session cookie, so with Cache
 * Components it must be called inside a <Suspense> boundary.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // auth() uses random values before it reads the request. Cache Components
  // refuses that during prerendering, so wait until a real request arrives.
  await connection();
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email) return null;
  return { id: user.id, name: user.name ?? user.email, email: user.email };
}

/** Like getCurrentUser, but sends visitors who are not signed in to the sign-in page. */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
