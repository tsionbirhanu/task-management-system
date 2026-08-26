import { addHours } from "date-fns";
import { and, eq, gte, inArray, isNotNull, lt, ne, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api/tasks";
import { getDb, schema } from "@/lib/db";
import { CRON_SECRET, isReminderEmailConfigured } from "@/lib/email/env";
import {
  sendReminderEmail,
  type ReminderRecipient,
} from "@/lib/email/reminders";
import { DUE_SOON_HOURS } from "@/lib/reminders";

/** Sends mail and writes to the database, so it must never be prerendered. */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const { tasks, taskOwners } = schema;

/**
 * Closed when CRON_SECRET is unset: an unconfigured deployment should not
 * expose an endpoint that emails every user on request. On Vercel this header
 * is sent automatically once the project has the variable.
 */
function isAuthorized(request: Request): boolean {
  if (!CRON_SECRET) return false;
  return request.headers.get("authorization") === `Bearer ${CRON_SECRET}`;
}

/**
 * Daily due-date digest.
 *
 * Idempotent by construction, which the schedule requires: Vercel documents
 * cron delivery as best effort, so a run can be missed or repeated. Each
 * ticket carries the due_date it was last emailed about, so a second run the
 * same day selects nothing, a missed run is picked up by the next one, and
 * moving a deadline re-arms the reminder without any extra state.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return jsonError(401, "Not authorized to run reminders.");
  }

  if (!isReminderEmailConfigured()) {
    return jsonError(
      503,
      "Email reminders are not configured. Set RESEND_API_KEY and REMINDER_FROM_EMAIL.",
    );
  }

  try {
    const db = getDb();
    const now = new Date();
    const windowEnd = addHours(now, DUE_SOON_HOURS);

    // The one query in the app deliberately not scoped to a single user.
    const rows = await db
      .select({
        id: tasks.id,
        ticket_no: tasks.ticket_no,
        title: tasks.title,
        due_date: tasks.due_date,
        user_id: tasks.user_id,
        email: taskOwners.email,
      })
      .from(tasks)
      .innerJoin(taskOwners, eq(taskOwners.user_id, tasks.user_id))
      .where(
        and(
          ne(tasks.status, "done"),
          isNotNull(tasks.due_date),
          gte(tasks.due_date, now),
          lt(tasks.due_date, windowEnd),
          // "is distinct from" rather than <> so a null (never reminded)
          // counts as different instead of dropping the row.
          sql`${tasks.reminder_sent_for} is distinct from ${tasks.due_date}`,
        ),
      )
      .orderBy(tasks.due_date);

    // One digest per person, not one email per ticket.
    const byRecipient = new Map<string, ReminderRecipient>();
    for (const row of rows) {
      if (!row.due_date) continue;

      const task = {
        id: row.id,
        ticket_no: row.ticket_no,
        title: row.title,
        due_date: row.due_date,
      };
      const existing = byRecipient.get(row.user_id);

      if (existing) existing.tasks.push(task);
      else
        byRecipient.set(row.user_id, {
          user_id: row.user_id,
          email: row.email,
          tasks: [task],
        });
    }

    const recipients = Array.from(byRecipient.values());
    const results = await Promise.allSettled(
      recipients.map((recipient) => sendReminderEmail(recipient)),
    );

    // Only stamp what actually went out. A failed send leaves those tickets
    // unstamped so tomorrow's run retries them.
    const sentIds: string[] = [];
    let failed = 0;

    results.forEach((result, index) => {
      if (result.status === "fulfilled") {
        sentIds.push(...recipients[index].tasks.map((task) => task.id));
      } else {
        failed += 1;
        console.error(
          `Reminder email failed for ${recipients[index].user_id}:`,
          result.reason,
        );
      }
    });

    if (sentIds.length > 0) {
      await db
        .update(tasks)
        .set({ reminder_sent_for: sql`${tasks.due_date}` })
        .where(inArray(tasks.id, sentIds));
    }

    return NextResponse.json({
      window_hours: DUE_SOON_HOURS,
      tickets: rows.length,
      recipients: recipients.length,
      sent: recipients.length - failed,
      failed,
    });
  } catch (error) {
    console.error("Reminder run failed:", error);
    return jsonError(500, "The reminder run did not finish.");
  }
}
