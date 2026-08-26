# Workbench Task Manager

Workbench is a quiet ticket board for personal work orders. Tickets can be
created, edited, dragged between columns, filtered, searched, sorted, and read
in either board or list view. Every ticket gets a per-user work order number —
your first is `#TM-0001`, and so is everyone else's.

Built with Next.js 14 (App Router), TypeScript, Tailwind, Drizzle, React Query,
and Neon Postgres + Neon Auth.

## Setup

**1. Install.**

```bash
git clone <repo-url>
cd task-manager
npm install
```

> `.npmrc` sets `legacy-peer-deps=true`. It is required: `@neondatabase/auth`
> declares a peer of `next >= 16` and this project is on Next 14. See
> `docs/neon-auth-notes.md` before removing it.

**2. Create a Neon project** and run `db/schema.sql` in the Neon SQL editor.
That file is the DDL source of truth — every statement is guarded, so it is safe
to re-run whenever it changes.

**3. Enable Auth** in the Neon console (Auth → Configuration).

**4. Configure the environment.**

```bash
cp .env.example .env.local
```

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | The **pooled** Neon string (host contains `-pooler`). |
| `NEON_AUTH_BASE_URL` | yes | Neon console → Auth → Configuration. |
| `NEON_AUTH_COOKIE_SECRET` | yes | 32+ chars: `openssl rand -base64 32`. |
| `RESEND_API_KEY` | no | Email reminders only. |
| `REMINDER_FROM_EMAIL` | no | Email reminders only. |
| `CRON_SECRET` | no | Guards the reminder endpoint. |
| `APP_URL` | no | Link target in reminder emails. |

With the first three missing the app still boots in **preview mode**: the board
renders, the sign-in guard stands down, and a banner says so. That is deliberate
— it means the UI can be worked on before anyone has provisioned anything.

**5. Run it.**

```bash
npm run dev
```

## Project structure

```
app/
  (app)/            board — the signed-in surface, guarded in its layout
  (auth)/           login, signup, confirm-email
  api/tasks/        task CRUD + the drag-and-drop status route
  api/auth/         Neon Auth REST surface + sign-out
  api/cron/         due-date reminder job
components/
  auth/             login, signup, confirmation forms
  layout/           TopBar, Notifications, ThemeToggle, UserMenu
  tasks/            board, columns, cards, filters, list view, modals
  ui/               generic primitives — Button, Input, Modal, Badge, …
hooks/
  useTasks.ts       React Query task cache: fetch, mutate, optimistic moves
  useBoardParams.ts board state read from and written back to the URL
lib/
  api/              route-handler helpers (errors, serialization, shared parsing)
  auth/             Neon Auth wiring, session reads, env guards
  db/               Drizzle client, typed schema, owner-email upsert
  email/            reminder digest builder + Resend delivery
  validation/       zod schemas, parsed on both the client and the server
  reminders.ts      one definition of "overdue" and "due soon"
  types.ts          domain types, enums, and URL-param guards
db/schema.sql       Postgres DDL — the source of truth
```

`components/ui/` is strictly generic: nothing in it knows what a task is.
Anything task-shaped (`DueBadge`, `PriorityBadge`) lives in `components/tasks/`.

## How it works

**The URL is the state.** Filters, search, sort, and board/list view all live in
the query string, read and written through `useBoardParams`. A filtered board is
therefore a link you can bookmark, share, or reload without losing your place.
Defaults are omitted so the common case stays a clean `/board`.

**Ownership is enforced in the route handlers.** There is no row-level security:
a plain Neon connection string authenticates as one role for the whole app, so
an RLS policy would have nothing to compare against. Instead every query is
scoped with `where user_id = <session user>`. That is a smaller loss than it
sounds, because the browser never talks to the database — `app/api/*` is the
only data path, so there is exactly one place to get it right.

**Validation runs twice.** The zod schemas in `lib/validation/` back the forms
via `@hookform/resolvers` and are parsed again in every route handler. The
client copy is a convenience; the server copy is the rule.

**Drag-and-drop is optimistic.** A card lands in its new column on the frame the
pointer lifts: `useUpdateTaskStatus` patches every cached list first, then
reconciles, and restores from a snapshot if the server disagrees. Positions use
a gap strategy, so a reorder writes one row instead of renumbering the column.

**Ticket numbers are assigned in the database.** A `BEFORE INSERT` trigger takes
a per-user advisory lock and claims the next number, with a unique index as the
backstop, so two tickets can never share one.

## Due date reminders

### In-app

On by default. A dedicated **unfiltered** query counts open tickets that are
overdue or due within 24 hours, so the counts describe every ticket you own
rather than whatever the board's filters happen to show. That feeds the
notification bell and one due-soon toast per browser session.

The stat row above the board is deliberately the other way round: it reports on
the tickets currently in view, because it describes the board you are looking
at. Cards carry a due badge and an overdue edge treatment.

### Email

A once-daily digest of everything due in the next 24 hours, sent through Resend
and triggered by Vercel Cron. **Entirely optional** — with the variables blank
`/api/cron/reminders` reports itself unconfigured and nothing else changes.

1. Re-run `db/schema.sql` (adds `task_owners` and `tasks.reminder_sent_for`).
2. Create a Resend account, verify a sending domain, create an API key.
3. Fill in `RESEND_API_KEY`, `REMINDER_FROM_EMAIL`, `APP_URL`, `CRON_SECRET`.
4. Deploy. `vercel.json` schedules the job daily at 08:00 UTC.

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://your-app/api/cron/reminders
```

**Why addresses live in this database.** Neon Auth keeps user records in its own
service. Unlike legacy Neon Auth there is no `neon_auth.users_sync` table to
join against, and the beta SDK's only user listing sits behind a
session-authorized admin route — neither is reachable from a background job. So
every authenticated page view records `user_id → email` into `task_owners`, and
the job joins against that. Only verified addresses are stored, because the
write happens after the layout's verification guard.

**Why daily.** Vercel's Hobby plan allows one cron run per day and fails the
deployment on anything more frequent, which is why the window is 24 hours.
Delivery is best-effort — runs can be missed *or* repeated — so the job is
idempotent: each ticket records the `due_date` it was last emailed about. A
repeat run sends nothing, a missed run is caught by the next one, and moving a
deadline re-arms the reminder on its own.

Not on Vercel? Delete `vercel.json` and point any scheduler at the same URL once
a day with the same `Authorization` header.

## Notes

`supabase/` holds an earlier Supabase-targeted version of the reminder job. It
cannot run against this project — it joins `auth.users`, and needs `pg_net`,
which Neon does not offer — and is kept only as a record of that approach.

`docs/neon-auth-notes.md` covers running `@neondatabase/auth` on Next 14: why
there is no Edge middleware, and what to re-check on any upgrade.

## Checks

```bash
npm run lint
npm run build
```
