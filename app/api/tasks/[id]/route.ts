import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  jsonError,
  parseJson,
  serializeTask,
  serverError,
  taskIdParamsSchema,
  taskUpdateValues,
  validationError,
  type TaskRouteContext,
} from "@/lib/api/tasks";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validation/task";

const { tasks } = schema;

export async function GET(_request: Request, context: TaskRouteContext) {
  try {
    // Parse
    const { id } = taskIdParamsSchema.parse(await context.params);

    // Authorize
    const user = await getCurrentUser();
    if (!user) return jsonError(401, "Sign in to view this task.");

    // Query
    const [task] = await getDb()
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.user_id, user.id)))
      .limit(1);

    if (!task) return jsonError(404, "Task not found.");

    // Respond
    return NextResponse.json({ task: serializeTask(task) });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    return serverError(
      "GET /api/tasks/[id]",
      error,
      "Something went wrong while loading the task.",
    );
  }
}

export async function PATCH(request: Request, context: TaskRouteContext) {
  try {
    // Parse
    const { id } = taskIdParamsSchema.parse(await context.params);
    const body = await parseJson(request);
    const input = updateTaskSchema.parse(body);

    // Authorize
    const user = await getCurrentUser();
    if (!user) return jsonError(401, "Sign in to update this task.");

    // Query
    const [updated] = await getDb()
      .update(tasks)
      .set(taskUpdateValues(input))
      .where(and(eq(tasks.id, id), eq(tasks.user_id, user.id)))
      .returning();

    if (!updated) return jsonError(404, "Task not found.");

    // Respond
    return NextResponse.json({ task: serializeTask(updated) });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    return serverError(
      "PATCH /api/tasks/[id]",
      error,
      "Something went wrong while updating the task.",
    );
  }
}

export async function DELETE(_request: Request, context: TaskRouteContext) {
  try {
    // Parse
    const { id } = taskIdParamsSchema.parse(await context.params);

    // Authorize
    const user = await getCurrentUser();
    if (!user) return jsonError(401, "Sign in to delete this task.");

    // Query
    const [deleted] = await getDb()
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.user_id, user.id)))
      .returning({ id: tasks.id });

    if (!deleted) return jsonError(404, "Task not found.");

    // Respond
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    return serverError(
      "DELETE /api/tasks/[id]",
      error,
      "Something went wrong while deleting the task.",
    );
  }
}
