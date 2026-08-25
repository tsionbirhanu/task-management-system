import type { Config } from "drizzle-kit";

/**
 * db/schema.sql is the DDL you run by hand in the Neon SQL editor. This config
 * is here for when you would rather generate migrations from lib/db/schema.ts:
 *   npx drizzle-kit generate   -- write SQL from the Drizzle schema
 *   npx drizzle-kit push       -- apply it straight to the database
 */
export default {
  schema: "./lib/db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
} satisfies Config;
