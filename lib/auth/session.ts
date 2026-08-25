import { getAuth } from "@/lib/auth/neon-auth";
import { isAuthConfigured } from "@/lib/auth/env";

export { isAuthConfigured };

export interface SessionUser {
  /** Text, not uuid -- matches tasks.user_id. */
  id: string;
  email: string;
  name: string | null;
}

/**
 * The signed-in user, or null. Server-side only.
 *
 * Route handlers scope every query with the id this returns -- that is what
 * enforces ownership now that no RLS policy does it in the database.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!isAuthConfigured()) return null;

  try {
    const { data } = await getAuth().getSession();
    const user = data?.user;
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
    };
  } catch {
    // A network blip reaching the auth service reads as "not signed in" rather
    // than a 500. The guard will bounce them to /login and they can retry.
    return null;
  }
}
