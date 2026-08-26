import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  jsonError,
  parseJson,
  serializeTask,
  serverError,
  taskIdParamsSchema,
  validationError,
  type TaskRouteContext,
} from "@/lib/api/tasks";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { updateTaskStatusSchema } from "@/lib/validation/task";

const { tasks } = schema;

export async function PATCH(request: Request, context: TaskRouteContext) {
  try {
    // Parse
    const { id } = taskIdParamsSchema.parse(context.params);
    const body = await parseJson(request);
    const input = updateTaskStatusSchema.parse(body);

    // Authorize
    const user = await getCurrentUser();
    if (!user) return jsonError(401, "Sign in to move this task.");

    // Query
    const [updated] = await getDb()
      .update(tasks)
      .set({
        status: input.status,
        ...(input.position !== undefined ? { position: input.position } : {}),
      })
      .where(and(eq(tasks.id, id), eq(tasks.user_id, user.id)))
      .returning();

    if (!updated) return jsonError(404, "Task not found.");

    // Respond
    return NextResponse.json({ task: serializeTask(updated) });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    return serverError(
      "PATCH /api/tasks/[id]/status",
      error,
      "Something went wrong while moving the task.",
    );
  }
}
