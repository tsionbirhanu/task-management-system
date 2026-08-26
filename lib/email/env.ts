/**
 * Email reminder settings.
 *
 * All optional. With them missing the app still builds, deploys and runs -- the
 * cron endpoint reports itself unconfigured rather than failing at send time --
 * which keeps reminders opt-in the way the rest of the env handling here is.
 *
 * RESEND_API_KEY       Resend dashboard -> API Keys.
 * REMINDER_FROM_EMAIL  A verified sender, e.g. "Workbench <no-reply@your.dev>".
 * CRON_SECRET          Guards /api/cron/reminders. Vercel sends it for you as
 *                      an Authorization: Bearer header once the project has it.
 * APP_URL              Absolute base URL used for the "open the board" link.
 */
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
export const REMINDER_FROM_EMAIL = process.env.REMINDER_FROM_EMAIL ?? "";
export const CRON_SECRET = process.env.CRON_SECRET ?? "";
export const APP_URL = (process.env.APP_URL ?? "").replace(/\/+$/, "");

export function isReminderEmailConfigured(): boolean {
  return RESEND_API_KEY.length > 0 && REMINDER_FROM_EMAIL.length > 0;
}
