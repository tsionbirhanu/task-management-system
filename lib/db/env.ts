/**
 * The app has to boot before anyone has provisioned a Neon project, so database
 * env access goes through here. With DATABASE_URL missing, the app runs in
 * preview mode: the shell renders, the auth guard stands down, and no
 * connection is opened against an empty URL.
 */
export const DATABASE_URL = process.env.DATABASE_URL ?? "";

export function isDatabaseConfigured(): boolean {
  return DATABASE_URL.length > 0;
}

export function assertDatabaseConfigured(): void {
  if (!isDatabaseConfigured()) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and paste the " +
        "pooled connection string from your Neon project dashboard.",
    );
  }
}
