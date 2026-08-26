import { sql } from "drizzle-orm";

import type { SessionUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";

const { taskOwners } = schema;

/**
 * Record where to email this user.
 *
 * Neon Auth keeps its user records in its own service: unlike legacy Neon Auth
 * there is no users_sync table in this database to join against, and the beta
 * SDK's only user listing sits behind a session-authorized admin route. So the
 * reminder job would have no way to turn a user_id into an address.
 *
 * The one moment the address is reliably in hand is a request that already
 * carries the session, which is what this captures. Callers must be past the
 * email-verification guard, so only deliverable addresses land here.
 *
 * Fail-soft on purpose: remembering an address is not worth failing a page
 * render over, and the next navigation will try again.
 */
export async function rememberOwner(user: SessionUser): Promise<void> {
  try {
    await getDb()
      .insert(taskOwners)
      .values({ user_id: user.id, email: user.email })
      .onConflictDoUpdate({
        target: taskOwners.user_id,
        set: { email: user.email, updated_at: sql`now()` },
      });
  } catch {
    // Deliberately swallowed -- see above.
  }
}
