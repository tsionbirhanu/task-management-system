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

/** Accepts any string Date can parse; stored as ISO 8601. */
const dueDateSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Enter a valid date, like 2026-09-01.",
  });

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Give the ticket a title so you can find it later.")
    .max(120, "Titles are capped at 120 characters - try trimming it down."),
  description: z
    .string()
    .trim()
    .max(2000, "Descriptions are capped at 2000 characters.")
    .nullish(),
  status: taskStatusSchema.default("todo"),
  priority: taskPrioritySchema.default("medium"),
  due_date: dueDateSchema.nullish(),
});

export const updateTaskSchema = createTaskSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Include at least one field to update.",
  });

/** Drag-and-drop moves: the status, plus where it landed in the column. */
export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
  position: z.number().finite().optional(),
});

/** Query string for GET /api/tasks. */
export const taskQuerySchema = z.object({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  q: z.string().trim().max(120).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;
