import { and, count, desc, eq, ilike, max, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  jsonError,
  parseJson,
  serializeTask,
  validationError,
} from "@/lib/api/tasks";
import { getCurrentUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db";
import { createTaskSchema, listTasksQuerySchema } from "@/lib/validation/task";

const { tasks } = schema;

function orderBy(sort: "due_date" | "created_at" | "priority") {
  if (sort === "due_date") {
    return [sql`${tasks.due_date} asc nulls last`, desc(tasks.created_at)];
  }

  if (sort === "priority") {
    return [
      sql`case ${tasks.priority} when 'high' then 1 when 'medium' then 2 else 3 end`,
      desc(tasks.created_at),
    ];
  }

  return [desc(tasks.created_at)];
}

export async function GET(request: Request) {
  try {
    // Parse
    const params = Object.fromEntries(new URL(request.url).searchParams);
    const query = listTasksQuerySchema.parse(params);

    // Authorize
    const user = await getCurrentUser();
    if (!user) return jsonError(401, "Sign in to manage your tasks.");

    // Query
    const db = getDb();
    const filters = [
      eq(tasks.user_id, user.id),
      query.search ? ilike(tasks.title, `%${query.search}%`) : undefined,
      query.status ? eq(tasks.status, query.status) : undefined,
      query.priority ? eq(tasks.priority, query.priority) : undefined,
    ].filter(Boolean);
    const where = and(...filters);

    const [rows, totals] = await Promise.all([
      db.select().from(tasks).where(where).orderBy(...orderBy(query.sort)),
      db.select({ count: count() }).from(tasks).where(where),
    ]);

    // Respond
    return NextResponse.json({
      tasks: rows.map(serializeTask),
      count: totals[0]?.count ?? 0,
    });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    return jsonError(500, "Something went wrong while loading tasks.");
  }
}

export async function POST(request: Request) {
  try {
    // Parse
    const body = await parseJson(request);
    const input = createTaskSchema.parse(body);

    // Authorize
    const user = await getCurrentUser();
    if (!user) return jsonError(401, "Sign in to create tasks.");

    // Query
    const db = getDb();
    const [{ nextTicketNo }] = await db
      .select({ nextTicketNo: sql<number>`coalesce(${max(tasks.ticket_no)}, 0) + 1` })
      .from(tasks)
      .where(eq(tasks.user_id, user.id));

    const [created] = await db
      .insert(tasks)
      .values({
        user_id: user.id,
        ticket_no: nextTicketNo,
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        priority: input.priority,
        due_date: input.due_date ? new Date(input.due_date) : null,
      })
      .returning();

    // Respond
    return NextResponse.json({ task: serializeTask(created) }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return validationError(error);
    return jsonError(500, "Something went wrong while creating the task.");
  }
}
