import { NextResponse } from "next/server";

/**
 * Single work order.
 *
 *   GET    /api/tasks/:id   read one ticket
 *   PATCH  /api/tasks/:id   partial update, validated with updateTaskSchema
 *   DELETE /api/tasks/:id   remove the ticket for good
 *
 * Ownership is enforced by RLS, not by a filter in application code: a request
 * for someone else's ticket returns no rows, which these handlers surface as a
 * 404 rather than leaking that the row exists.
 *
 * Scaffold: 501 until the data layer lands.
 */

const NOT_READY =
  "This endpoint is not built yet. Ticket reads, edits, and deletes land in the next phase.";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: Request, _context: RouteContext) {
  return NextResponse.json({ error: NOT_READY }, { status: 501 });
}

export async function PATCH(_request: Request, _context: RouteContext) {
  return NextResponse.json({ error: NOT_READY }, { status: 501 });
}

export async function DELETE(_request: Request, _context: RouteContext) {
  return NextResponse.json({ error: NOT_READY }, { status: 501 });
}
