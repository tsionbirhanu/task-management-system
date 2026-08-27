/**
 * db/schema.sql is the DDL you run by hand in the Neon SQL editor. This config
 * is here for when you would rather generate migrations from lib/db/schema.ts:
 *   npx drizzle-kit generate --config drizzle.config.ts
 *   npx drizzle-kit push --config drizzle.config.ts
 */
const config = {
  schema: "./lib/db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
};

export default config;
