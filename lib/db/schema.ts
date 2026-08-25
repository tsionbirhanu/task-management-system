import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Typed mirror of db/schema.sql. That file is the DDL source of truth -- this
 * one exists so queries are type-checked. Change one, change the other.
 *
 * Columns keep their snake_case names as TypeScript keys on purpose. The board
 * components already read task.ticket_no and task.due_date, and the API returns
 * JSON in the same shape, so one naming convention runs from Postgres through
 * the route handlers to the browser.
 */

export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "done",
]);

export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
]);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Text, not uuid: Better Auth issues string user ids.
    user_id: text("user_id").notNull(),
    ticket_no: integer("ticket_no").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("medium"),
    due_date: timestamp("due_date", { withTimezone: true }),
    position: integer("position").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("tasks_user_status_position_idx").on(
      table.user_id,
      table.status,
      table.position,
    ),
    uniqueIndex("tasks_user_id_ticket_no_key").on(table.user_id, table.ticket_no),
    check(
      "tasks_title_check",
      sql`char_length(${table.title}) between 1 and 200`,
    ),
  ],
);

/**
 * A row as Postgres returns it: timestamps are Date objects here, whereas the
 * Task type in lib/types.ts carries ISO strings because it crosses JSON.
 */
export type TaskRow = typeof tasks.$inferSelect;
export type TaskInsertRow = typeof tasks.$inferInsert;
