import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type { Task } from "@/lib/types";
import type { TaskRow } from "@/lib/db/schema";

export type ApiErrorCode = 400 | 401 | 404 | 500;

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

export async function parseJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function serializeTask(task: TaskRow): Task {
  return {
    ...task,
    due_date: task.due_date?.toISOString() ?? null,
    created_at: task.created_at.toISOString(),
    updated_at: task.updated_at.toISOString(),
  };
}
