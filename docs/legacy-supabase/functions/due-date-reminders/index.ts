import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

type ReminderTask = {
  id: string;
  ticket_no: number;
  title: string;
  due_date: string;
};

type ReminderRecipient = {
  user_id: string;
  email: string;
  tasks: ReminderTask[];
};

const resendApiKey = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const fromEmail =
  Deno.env.get("REMINDER_FROM_EMAIL") ?? "Workbench <reminders@example.com>";

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  if (!resendApiKey || !supabaseUrl || !serviceRoleKey) {
    return json(
      {
        error:
          "Missing RESEND_API_KEY, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY.",
      },
      500,
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.rpc("due_date_reminder_recipients");

  if (error) {
    return json({ error: error.message }, 500);
  }

  const recipients = (data ?? []) as ReminderRecipient[];
  const results = await Promise.allSettled(
    recipients.map((recipient) => sendReminderEmail(recipient)),
  );

  const failed = results.filter((result) => result.status === "rejected");

  return json({
    recipients: recipients.length,
    sent: results.length - failed.length,
    failed: failed.length,
  });
});

async function sendReminderEmail(recipient: ReminderRecipient) {
  const count = recipient.tasks.length;
  const subject = `${count} ${count === 1 ? "ticket is" : "tickets are"} due within 24h`;
  const taskList = recipient.tasks
    .map(
      (task) =>
        `#TM-${String(task.ticket_no).padStart(4, "0")} - ${task.title} (${new Date(
          task.due_date,
        ).toLocaleString("en-US", { timeZone: "UTC" })} UTC)`,
    )
    .join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: recipient.email,
      subject,
      text: `Heads up: these Workbench tickets are due soon.\n\n${taskList}`,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
