import { NextResponse } from "next/server";

/**
 * The drag-and-drop endpoint.
 *
 *   PATCH /api/tasks/:id/status   { status, position? }
 *
 * Split out from the general PATCH on purpose: a card drop is the highest-churn
 * write in the app, it carries a fixed two-field payload (updateTaskStatusSchema),
 * and keeping it separate lets the optimistic update on the client target one
 * narrow mutation instead of the full edit form.
 *
 * `position` is a fractional rank -- the midpoint between the neighbours the
 * card landed between -- so a drop rewrites one row, not the whole column.
 *
 * Scaffold: 501 until the data layer lands.
 */

const NOT_READY =
  "This endpoint is not built yet. Moving tickets between columns lands in the next phase.";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(_request: Request, _context: RouteContext) {
  return NextResponse.json({ error: NOT_READY }, { status: 501 });
}
