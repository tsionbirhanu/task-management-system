# Workbench Task Manager

Workbench is a quiet ticket board for personal work orders. The board is the primary surface: tickets can be created, edited, moved between columns, filtered, searched, sorted, and reviewed in either board or list view.

## Setup

1. Clone the repository and enter the app directory.

```bash
git clone <repo-url>
cd task-manager
```

2. Install dependencies.

```bash
npm install
```

3. Create a Postgres project.

The app uses plain Postgres through Drizzle. A Supabase project works for the database: create a Supabase project, open the SQL editor, and run `db/schema.sql`.

The existing auth layer expects Neon Auth settings. If you keep Neon Auth, create or connect a Neon project and enable Auth in the Neon console. If you move auth fully to Supabase Auth, update the auth client/session code before relying on Supabase users in production.

4. Create `.env.local` from `.env.example`.

```bash
cp .env.example .env.local
```

Fill in:

```bash
DATABASE_URL=<your pooled Postgres connection string>
NEON_AUTH_BASE_URL=<Neon Auth base URL>
NEON_AUTH_COOKIE_SECRET=<32+ character random secret>
```

For Supabase Postgres, use a pooled connection string from the Supabase project settings. For `NEON_AUTH_COOKIE_SECRET`, generate a value with `openssl rand -base64 32` or another secure random source.

5. Start the development server.

```bash
npm run dev
```

Open `http://localhost:3000`.

## Project Structure

`app/` contains Next.js routes, layouts, providers, and API route handlers.

`components/auth/` contains signup, login, and email confirmation forms.

`components/tasks/` contains the board, columns, ticket cards, filters, list view, task form modal, and delete confirmation dialog.

`components/ui/` contains shared UI primitives such as buttons, inputs, selects, modals, badges, empty states, and the Sonner toaster.

`hooks/` contains React Query task hooks and auth helpers.

`lib/` contains shared types, validation schemas, auth/session helpers, database setup, and API serialization helpers.

`db/schema.sql` is the Postgres DDL source of truth for the tasks table and indexes.

`supabase/functions/` and `supabase/migrations/` contain the opt-in email reminder scaffold.

## Due Date Reminders

In-app reminders are enabled out of the box on the board. The already-loaded task list is checked in the browser for open tickets that are overdue or due within the next 24 hours. The board shows dismissible overdue and due-soon banners, card-level due badges, subtle overdue card edge treatment, and one due-soon toast per browser session after the first board load.

Email reminders are scaffolded as an opt-in Supabase bonus. They are intentionally not wired to run automatically until you provide your own email delivery setup.

To activate email reminders:

1. Create a Resend account, verify a sending domain, and create an API key.
2. Deploy `supabase/functions/due-date-reminders/index.ts` as a Supabase Edge Function.
3. Add `RESEND_API_KEY` as a Supabase Edge Function secret.
4. Optionally add `REMINDER_FROM_EMAIL` with a verified sender such as `Workbench <reminders@yourdomain.com>`.
5. Enable `pg_cron` and `pg_net` in your Supabase project.
6. Run `supabase/migrations/20260826000000_due_date_reminders.sql`.
7. In the Supabase SQL editor, use the commented `cron.schedule` block from that migration and replace the placeholder project URL and invoke token. This schedules the Edge Function hourly.

The Supabase reminder scaffold assumes `public.tasks.user_id` matches `auth.users.id`. If production auth remains on Neon Auth, adapt the recipient lookup before enabling the cron job.

## Checks

```bash
npm run lint
npm run build
```
