import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { DATABASE_URL, assertDatabaseConfigured } from "@/lib/db/env";
import * as schema from "@/lib/db/schema";

/**
 * Neon's HTTP driver: one round trip per query, no connection to hold open,
 * which is what you want from route handlers that may run on cold starts.
 *
 * Cached on globalThis so Next's dev-mode module reloading does not open a new
 * client on every edit.
 */
const globalForDb = globalThis as unknown as {
  db?: ReturnType<typeof createDb>;
};

function createDb() {
  assertDatabaseConfigured();
  return drizzle(neon(DATABASE_URL), { schema });
}

export function getDb() {
  globalForDb.db ??= createDb();
  return globalForDb.db;
}

export { schema };
