import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import {
  jsonError,
  parseJson,
  serializeTask,
  validationError,
} from "@/lib/api/tasks";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { updateTaskSchema } from "@/lib/validation/task";

const { tasks } = schema;
const paramsSchema = z.object({ id: z.string().uuid("Enter a valid task id.") });

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    // Parse
    const { id } = paramsSchema.parse(context.params);

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
    return jsonError(500, "Something went wrong while loading the task.");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    // Parse
    const { id } = paramsSchema.parse(context.params);
    const body = await parseJson(request);
    const input = updateTaskSchema.parse(body);

    // Authorize
    const user = await getCurrentUser();
    if (!user) return jsonError(401, "Sign in to update this task.");

    // Query
    const [updated] = await getDb()
      .update(tasks)
      .set({
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined
          ? { description: input.description ?? null }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.priority !== undefined ? { priority: input.priority } : {}),
        ...(input.due_date !== undefined
          ? { due_date: input.due_date ? new Date(input.due_date) : null }
          : {}),
      })
      .where(and(eq(tasks.id, id), eq(tasks.user_id, user.id)))
      .returning();

    if (!updated) return jsonError(404, "Task not found.");

    // Respond
    return NextResponse.json({ task: serializeTask(updated) });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    return jsonError(500, "Something went wrong while updating the task.");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    // Parse
    const { id } = paramsSchema.parse(context.params);

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
    return jsonError(500, "Something went wrong while deleting the task.");
  }
}
