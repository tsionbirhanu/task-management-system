import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import type { TaskInsertRow, TaskRow } from "@/lib/db/schema";
import type { Task } from "@/lib/types";
import type { UpdateTaskInput } from "@/lib/validation/task";

export type ApiErrorCode = 400 | 401 | 404 | 500 | 503;

export function jsonError(
  status: ApiErrorCode,
  message: string,
  field?: string,
) {
  return NextResponse.json(
    { error: { message, ...(field ? { field } : {}) } },
    { status },
  );
}

export function validationError(error: ZodError) {
  const issue = error.issues[0];
  return jsonError(
    400,
    issue?.message ?? "Invalid request.",
    issue?.path.join(".") || undefined,
  );
}

/**
 * An unexpected failure: log the real cause, return a vague message.
 *
 * The caller deliberately learns nothing specific -- a database error text can
 * name columns, constraints, and query shape. But swallowing it entirely turns
 * every fault into an opaque 500 with nothing to go on, so the actual reason
 * goes to the server log, which is where an operator can read it.
 */
export function serverError(
  context: string,
  error: unknown,
  message: string,
) {
  console.error(`[api] ${context} failed:`, error);
  return jsonError(500, message);
}

export async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** Shared by every /api/tasks/[id] route so the id is validated identically. */
export const taskIdParamsSchema = z.object({
  id: z.string().uuid("Enter a valid task id."),
});

export interface TaskRouteContext {
  params: { id: string };
}

export function serializeTask(task: TaskRow): Task {
  return {
    ...task,
    due_date: task.due_date?.toISOString() ?? null,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
  };
}

/**
 * The columns a PATCH should actually write.
 *
 * A key that is absent means "not sent, leave it alone", while an explicit null
 * means "clear it". Those are different intentions and the distinction has to
 * survive: spreading the parsed body straight into the update would write
 * `undefined` over columns the caller never mentioned.
 */
export function taskUpdateValues(input: UpdateTaskInput): Partial<TaskInsertRow> {
  const values: Partial<TaskInsertRow> = {};

  if (input.title !== undefined) values.title = input.title;
  if (input.status !== undefined) values.status = input.status;
  if (input.priority !== undefined) values.priority = input.priority;
  if (input.description !== undefined) {
    values.description = input.description ?? null;
  }
  if (input.due_date !== undefined) {
    values.due_date = input.due_date ? new Date(input.due_date) : null;
  }

  return values;
}
