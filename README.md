# Workbench Task Manager

A modern task management system for creating, organizing, and tracking personal work.

Built with Next.js 16 App Router, TypeScript, Tailwind CSS, Drizzle, React Query,
Neon Postgres, and Neon Auth.

## Features

* Authentication: signup, login, email confirmation, forgot password, reset password, and protected routes.
* Task CRUD: create, view, edit, delete, and manage tasks.
* Task attributes: title, description, status, priority, due date, and per-user task number.
* Search and filters: search by title and filter by status or priority.
* Sorting: sort tasks by newest, due date, or priority.
* Board and list views: switch between Kanban and list layouts.
* Drag and drop: move tasks between status columns with optimistic updates.
* In-app reminders: overdue and due-soon alerts in the notification bell.
* Email reminders: optional scheduled reminder emails through Resend and Vercel Cron.
* Responsive UI: mobile cards, mobile board tabs, tablet layouts, and desktop board/table views.
* URL state: search, filters, sorting, and view mode persist in the URL.

## Tech Stack

| Category       | Technology           |
| -------------- | -------------------- |
| Framework      | Next.js 16 App Router |
| Language       | TypeScript           |
| Styling        | Tailwind CSS         |
| Database       | Neon Postgres        |
| ORM            | Drizzle              |
| Authentication | Neon Auth            |
| Data Fetching  | TanStack React Query |
| Validation     | Zod                  |
| Forms          | React Hook Form      |
| Email          | Resend               |
| Scheduling     | Vercel Cron          |
| Tests          | Vitest               |

## Getting Started

### 1. Install

```bash
git clone <repo-url>
cd task-manager
npm install
```

### 2. Configure Neon

Create a Neon project and run `db/schema.sql` in the Neon SQL editor.

That file is the database DDL source of truth. The statements are guarded so it
is safe to re-run whenever the schema changes.

Then enable Neon Auth in the Neon dashboard.

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

| Variable                  | Required | Description                   |
| ------------------------- | :------: | ----------------------------- |
| `DATABASE_URL`            | Yes      | Pooled Neon connection string |
| `NEON_AUTH_BASE_URL`      | Yes      | Neon Auth configuration URL   |
| `NEON_AUTH_COOKIE_SECRET` | Yes      | 32+ character secret          |
| `RESEND_API_KEY`          | No       | Email reminder delivery       |
| `REMINDER_FROM_EMAIL`     | No       | Reminder sender address       |
| `CRON_SECRET`             | No       | Protects reminder endpoint    |
| `APP_URL`                 | No       | Application URL for emails    |

Generate a cookie secret:

```bash
openssl rand -base64 32
```

The application also supports preview mode when the first three required
variables are missing, so the UI can be developed before the backend is fully
configured.

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Project Structure

```text
__tests__/                  Unit tests for domain logic and validation
app/
  (app)/board/              Protected task board
  (auth)/                   Login, signup, confirmation, forgot/reset password
  api/
    auth/                   Neon Auth and sign-out
    cron/                   Reminder job
    tasks/                  Task CRUD and status updates
components/
  auth/                     Authentication forms
  layout/                   Header, notifications, theme, user menu
  tasks/                    Board, columns, cards, filters, lists
  ui/                       Generic UI components
db/
  schema.sql                PostgreSQL DDL source of truth
docs/
  legacy-supabase/          Supabase reference implementation, not active
  neon-auth-notes.md        Neon Auth implementation notes
hooks/
  useBoardParams.ts         URL-based board state
  useTasks.ts               React Query cache and mutations
lib/
  api/                      Route-handler helpers
  auth/                     Neon Auth wiring, session reads, env guards
  db/                       Drizzle client, typed schema, owner-email upsert
  email/                    Reminder digest builder and Resend delivery
  validation/               Zod schemas for client and server parsing
  reminders.ts              Due-date logic
  types.ts                  Domain types, enums, and URL-param guards
```

`components/ui/` contains only generic components. Task-specific components such
as `DueBadge` and `PriorityBadge` live inside `components/tasks/`.

## How It Works

### URL as State

Search, filters, sorting, and board/list mode are stored in the URL through
`useBoardParams`.

Example:

```text
/board?status=in_progress&priority=high&sort=due_date
```

This makes board views bookmarkable, shareable, and reload-safe.

### Ownership

The browser never connects directly to the database.

Every API request:

1. Authenticates the user.
2. Validates the request.
3. Scopes database queries to the authenticated `user_id`.
4. Executes through Drizzle.

```text
Browser -> Next.js API -> Drizzle -> Neon Postgres
```

### Validation

Zod validation runs on both the client and server.

```text
React Hook Form -> Zod -> User Input
                         |
                    API Request
                         |
                    Zod -> Database
```

Client validation improves the experience. Server validation is the actual rule.

### Optimistic Drag and Drop

When a task is moved, the UI updates immediately.

`useUpdateTaskStatus` updates the React Query cache first, then reconciles with
the server. If the request fails, the previous state is restored.

Task positions use a gap strategy, so reordering generally updates only one
database row.

### Task Numbers

Tasks receive a per-user sequential number:

```text
#TM-0001
#TM-0002
#TM-0003
```

Numbers are generated by a PostgreSQL `BEFORE INSERT` trigger using a per-user
advisory lock and a unique index as a final safeguard.

## Due-Date Reminders

### In-App

A dedicated unfiltered query tracks tasks that are:

* Overdue.
* Due within 24 hours.

This powers the notification bell and due-soon toast.

Board statistics remain filtered to the tasks currently visible.

### Email

Email reminders are optional and use Resend plus Vercel Cron.

The daily job sends tasks due within the next 24 hours.

Configure:

```env
RESEND_API_KEY=
REMINDER_FROM_EMAIL=
APP_URL=
CRON_SECRET=
```

The cron job runs daily at 08:00 UTC.

To trigger it manually:

```bash
curl \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app/api/cron/reminders
```

The reminder system is idempotent, so repeated runs do not send duplicate
reminders. Changing a task's due date automatically re-arms its reminder.

`docs/legacy-supabase/` holds an earlier Supabase-targeted version of the
reminder job. It cannot run against this project because it joins `auth.users`
and needs `pg_net`, which Neon does not offer. It is kept only as a record of
that approach.

`docs/neon-auth-notes.md` covers the current Neon Auth and Next.js setup.

## Checks

Run the local quality checks:

```bash
npm run lint
npm run test
npm run build
npm audit
```

## Deployment

Deploy on Vercel with the environment variables above. Add the deployed app URL
to Neon Auth trusted domains so authentication redirects are allowed.

For password reset and email confirmation, make sure `APP_URL` points to the
production deployment URL.

---

Built with Next.js, TypeScript, Tailwind, Drizzle, React Query, and Neon.
