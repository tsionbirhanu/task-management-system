import { z } from "zod";

import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/types";

/**
 * One set of schemas, parsed on both sides: react-hook-form via
 * @hookform/resolvers on the client, and again in every route handler before
 * anything touches the database. The client copy is a convenience; the server
 * copy is the rule.
 */

export const taskStatusSchema = z.enum(TASK_STATUSES);
export const taskPrioritySchema = z.enum(TASK_PRIORITIES);
export const taskSortSchema = z.enum(["due_date", "created_at", "priority"]);

/** Accepts ISO calendar dates or datetimes; stored as timestamptz. */
const dueDateStringSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid date, like 2026-09-01.",
  });

const dueDateSchema = z.preprocess(
  (value) => (value === "" ? undefined : value),
  dueDateStringSchema.nullish(),
);

function isNotPastDate(value: string): boolean {
  const due = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due.getTime() >= today.getTime();
}

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the task a title so you can find it later.")
    .max(200, "Titles are capped at 200 characters - try trimming it down."),
  description: z
    .string()
    .trim()
    .max(2000, "Descriptions are capped at 2000 characters.")
    .nullish(),
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium"),
  due_date: dueDateSchema.refine((value) => !value || isNotPastDate(value), {
      message: "Due date cannot be in the past.",
    }),
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Include at least one field to update.",
  });

/** Drag-and-drop moves: the status, plus where it landed in the column. */
export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
  position: z.number().int().finite().optional(),
});

/** Query string for GET /api/tasks. */
export const listTasksQuerySchema = z
  .object({
    search: z.string().trim().max(120).optional(),
    q: z.string().trim().max(120).optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    sort: taskSortSchema.default("created_at"),
  })
  .transform(({ q, search, ...query }) => ({
    ...query,
    search: search || q || undefined,
  }));

export const taskQuerySchema = listTasksQuerySchema;

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskQuery = z.infer<typeof listTasksQuerySchema>;
