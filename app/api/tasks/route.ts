import { NextResponse } from "next/server";

/**
 * Collection endpoint for work orders.
 *
 *   GET  /api/tasks   list the signed-in user's tickets, filtered by
 *                     ?status= &priority= &q= (validated with taskQuerySchema)
 *   POST /api/tasks   create a ticket from a createTaskSchema body, assigning
 *                     the next ticket_no and a position at the top of the
 *                     To Do column
 *
 * Scaffold: both handlers answer 501 until the Supabase schema and RLS policies
 * exist. Every handler here re-parses its input with the same zod schemas the
 * client forms use -- client-side validation is a convenience, this is the rule.
 */

const NOT_READY =
  "This endpoint is not built yet. The tasks table and its RLS policies land in the next phase.";

export async function GET() {
  return NextResponse.json({ error: NOT_READY }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ error: NOT_READY }, { status: 501 });
}
