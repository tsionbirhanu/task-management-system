import { getAuth } from "@/lib/auth/neon-auth";
import { isAuthConfigured } from "@/lib/auth/env";

export { isAuthConfigured };

export interface SessionUser {
  /** Text, not uuid -- matches tasks.user_id. */
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
}

/**
 * Next signals "this route cannot be prerendered" by throwing. Swallowing that
 * would let a route be baked static with no session, freezing the guard into
 * the HTML, so it has to travel back up to the framework.
 */
function isFrameworkControlFlow(error: unknown): boolean {
  const digest = (error as { digest?: unknown } | null)?.digest;
  return (
    typeof digest === "string" &&
    (digest.startsWith("DYNAMIC_SERVER_USAGE") || digest.startsWith("NEXT_"))
  );
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
      emailVerified: user.emailVerified,
      name: user.name ?? null,
    };
  } catch (error) {
    if (isFrameworkControlFlow(error)) throw error;

    // A network blip reaching the auth service reads as "not signed in" rather
    // than a 500. The guard bounces them to /login and they can retry.
    return null;
  }
}
