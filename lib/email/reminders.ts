import { formatDistanceToNowStrict } from "date-fns";

import {
  APP_URL,
  REMINDER_FROM_EMAIL,
  RESEND_API_KEY,
} from "@/lib/email/env";
import { formatTicketNumber } from "@/lib/types";

export interface ReminderTask {
  id: string;
  ticket_no: number;
  title: string;
  due_date: Date;
}

export interface ReminderRecipient {
  user_id: string;
  email: string;
  /** Never empty, and ordered soonest deadline first. */
  tasks: ReminderTask[];
}

/**
 * "in 5 hours (27 Aug 14:00 UTC)".
 *
 * Relative first on purpose. We do not know the reader's timezone -- nothing in
 * the app collects it -- so an absolute time alone is ambiguous at best and
 * wrong at worst. The relative phrase is correct for everyone; the UTC stamp
 * follows for anyone who wants the exact instant.
 */
function describeDue(due: Date): string {
  const relative = formatDistanceToNowStrict(due, { addSuffix: true });
  // Explicitly UTC rather than date-fns format(), which would render in the
  // server's zone -- right on Vercel, wrong on a laptop, and the label would
  // be lying either way.
  const absolute = due.toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${relative} (${absolute} UTC)`;
}

function buildSubject(count: number): string {
  return count === 1
    ? "1 ticket is due in the next 24 hours"
    : `${count} tickets are due in the next 24 hours`;
}

function buildText(recipient: ReminderRecipient): string {
  const lines = recipient.tasks.map(
    (task) =>
      `${formatTicketNumber(task.ticket_no)}  ${task.title}\n    due ${describeDue(task.due_date)}`,
  );

  return [
    "These Workbench tickets are due soon:",
    "",
    ...lines,
    "",
    APP_URL ? `Open the board: ${APP_URL}/board` : "Open the board in Workbench.",
  ].join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildHtml(recipient: ReminderRecipient): string {
  const rows = recipient.tasks
    .map(
      (task) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #e6e4dd;">
          <div style="font:600 12px ui-monospace,SFMono-Regular,Menlo,monospace;color:#6b6f80;">
            ${escapeHtml(formatTicketNumber(task.ticket_no))}
          </div>
          <div style="margin-top:4px;font:600 15px ui-sans-serif,system-ui,sans-serif;color:#1b1d26;">
            ${escapeHtml(task.title)}
          </div>
          <div style="margin-top:4px;font:400 13px ui-sans-serif,system-ui,sans-serif;color:#6b6f80;">
            due ${escapeHtml(describeDue(task.due_date))}
          </div>
        </td>
      </tr>`,
    )
    .join("");

  const link = APP_URL
    ? `<p style="margin:24px 0 0;font:400 14px ui-sans-serif,system-ui,sans-serif;">
         <a href="${escapeHtml(APP_URL)}/board" style="color:#3a5bd9;">Open the board</a>
       </p>`
    : "";

  return `<div style="max-width:560px;margin:0 auto;padding:24px;background:#ffffff;">
    <h1 style="margin:0 0 16px;font:700 18px ui-sans-serif,system-ui,sans-serif;color:#1b1d26;">
      ${escapeHtml(buildSubject(recipient.tasks.length))}
    </h1>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;">
      ${rows}
    </table>
    ${link}
  </div>`;
}

/**
 * Send one recipient their digest. Throws on a non-2xx from Resend so the
 * caller can leave those tickets unstamped and retry them on the next run.
 */
export async function sendReminderEmail(
  recipient: ReminderRecipient,
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: REMINDER_FROM_EMAIL,
      to: recipient.email,
      subject: buildSubject(recipient.tasks.length),
      text: buildText(recipient),
      html: buildHtml(recipient),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Resend rejected the reminder (${response.status}): ${detail.slice(0, 200)}`,
    );
  }
}
