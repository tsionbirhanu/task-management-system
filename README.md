# Workbench Task Manager

Workbench is a responsive task management system for creating, organizing, and
tracking personal work. It includes authentication, task CRUD, filtering,
search, drag-and-drop status updates, and due-date reminders.

The project is built with Next.js 16 App Router, TypeScript, Tailwind CSS,
Drizzle ORM, TanStack React Query, Neon Postgres, and Neon Auth.

## Challenge Coverage

| Requirement | Status | Implementation |
| --- | --- | --- |
| User authentication | Complete | Signup, login, email confirmation, forgot password, reset password, and protected routes |
| Secure session management | Complete | Neon Auth session cookies handled through server-side route protection |
| Task CRUD | Complete | Users can create, view, edit, and delete their own tasks |
| Task attributes | Complete | Title, description, status, priority, due date, position, and per-user task number |
| Filtering and search | Complete | Search by title, filter by status and priority, and sort tasks |
| API/backend | Complete | REST endpoints with Zod validation and user-scoped database queries |
| UI/UX | Complete | Clean light theme, responsive layout, board/list views, and polished auth screens |
| Drag-and-drop bonus | Complete | Kanban drag-and-drop with optimistic UI updates |
| Reminder bonus | Complete | In-app due-soon/overdue notifications and optional scheduled email reminders |

## Features

* Authentication with signup, login, email confirmation, forgot password, and reset password.
* Protected task board scoped to the signed-in user.
* Create, edit, delete, search, filter, sort, and move tasks.
* Board view for Kanban workflow and list view for table-style scanning.
* Drag-and-drop status updates with optimistic cache updates.
* Mobile-friendly board tabs and mobile card layouts.
* Task attributes for title, description, status, priority, due date, and task number.
* In-app notifications for overdue tasks and tasks due within 24 hours.
* Optional daily email reminders through Resend and Vercel Cron.
* URL-based board state, so search/filter/sort/view settings survive reloads.
* Centralized validation shared by client forms and API routes.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Neon Postgres |
| ORM | Drizzle ORM |
| Authentication | Neon Auth |
| Data fetching | TanStack React Query |
| Validation | Zod |
| Forms | React Hook Form |
| Drag and drop | dnd kit |
| Toasts | Sonner |
| Tests | Vitest |
| Deployment | Vercel |

## Getting Started

### 1. Install Dependencies

```bash
git clone <repo-url>
cd task-manager
npm install
```

### 2. Configure Neon

Create a Neon project, then run the SQL in `db/schema.sql` from the Neon SQL
editor.

`db/schema.sql` is the database source of truth. It creates the task tables,
indexes, enums, and triggers used by the app. The statements are guarded so the
file can be re-run safely after schema updates.

After the database is ready, enable Neon Auth in the Neon dashboard.

### 3. Configure Environment Variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Fill in the required values:

| Variable | Required | Purpose |
| --- | :---: | --- |
| `DATABASE_URL` | Yes | Pooled Neon Postgres connection string |
| `NEON_AUTH_BASE_URL` | Yes | Neon Auth project URL |
| `NEON_AUTH_COOKIE_SECRET` | Yes | Secret used to sign auth cookies |
| `RESEND_API_KEY` | No | Sends scheduled reminder emails |
| `REMINDER_FROM_EMAIL` | No | Verified sender used for reminder emails |
| `CRON_SECRET` | No | Protects the reminder cron endpoint |
| `APP_URL` | No | Absolute app URL used in auth and email links |

Generate a strong cookie secret:

```bash
openssl rand -base64 32
```

If the required backend variables are missing, the app can still run in preview
mode so the UI can be reviewed without a configured database.

### 4. Run Locally

```bash
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev      # Start the local development server
npm run build    # Create a production build
npm run start    # Start the production server after building
npm run lint     # Run ESLint
npm run test     # Run Vitest tests
npm audit        # Check dependency vulnerabilities
```

## Project Structure

```text
__tests__/
  lib/                         Unit tests for reminders and validation
app/
  (app)/                       Authenticated app shell
  (auth)/                      Login, signup, confirmation, forgot/reset pages
  api/
    auth/                      Neon Auth route handling and sign-out
    cron/                      Reminder email cron endpoint
    tasks/                     Task CRUD and status update endpoints
components/
  auth/                        Authentication forms
  layout/                      Top bar, user menu, theme toggle, notifications
  tasks/                       Board, task cards, filters, lists, calendar
  ui/                          Reusable UI primitives
db/
  schema.sql                   Neon Postgres DDL source of truth
docs/
  legacy-supabase/             Archived Supabase reminder implementation
  neon-auth-notes.md           Neon Auth implementation notes
hooks/
  useBoardParams.ts            URL state for filters, sorting, and view mode
  useTasks.ts                  React Query task fetching and mutations
lib/
  api/                         Shared API parsing, responses, and task helpers
  auth/                        Auth client/server wiring and environment checks
  db/                          Drizzle client and typed schema
  email/                       Reminder email rendering and delivery
  validation/                  Zod schemas for auth and task data
  reminders.ts                 Shared due-date reminder logic
  types.ts                     Domain types and metadata
```

## API Overview

| Route | Method | Purpose |
| --- | --- | --- |
| `/api/tasks` | `GET` | List the signed-in user's tasks with optional search, filter, and sort params |
| `/api/tasks` | `POST` | Create a task |
| `/api/tasks/[id]` | `PATCH` | Update a task |
| `/api/tasks/[id]` | `DELETE` | Delete a task |
| `/api/tasks/[id]/status` | `PATCH` | Update status and position for drag-and-drop moves |
| `/api/cron/reminders` | `GET` | Send due-soon reminder emails when configured |
| `/api/auth/[...path]` | `GET/POST` | Neon Auth handler |
| `/api/auth/signout` | `POST` | Server-side sign-out |

All task routes require an authenticated session. Database queries are scoped by
the session user id, so one user cannot read or mutate another user's tasks.

## Important Implementation Details

### Validation

Zod schemas live in `lib/validation`. They are used by React Hook Form on the
client and by the API routes on the server. Server-side validation remains the
source of truth.

### Task Numbers

Each user gets their own sequence of task numbers:

```text
#TM-0001
#TM-0002
#TM-0003
```

The database assigns `ticket_no` with a `BEFORE INSERT` trigger and a per-user
advisory lock. This prevents race conditions when multiple tasks are created at
the same time.

### Partial Updates

Task update validation avoids applying create-time defaults during `PATCH`
requests. Updating only the title will not silently reset status or priority.

### Reminders

In-app reminders are calculated from unfiltered task data:

* Overdue tasks have a due date in the past and are not done.
* Due-soon tasks have a future due date within 24 hours and are not done.
* Done tasks are ignored by reminder logic.

Email reminders are optional. If Resend and cron variables are not configured,
the rest of the app still works normally.

### Responsive UI

The interface is designed for phone, tablet, and desktop screens:

* Auth pages use a single centered card.
* Filters stack on small screens and become denser on larger screens.
* Board view shows one active status column on mobile and three columns on desktop.
* List view uses mobile cards below `sm` and a horizontally protected table above `sm`.
* Modals behave like mobile bottom sheets and desktop dialogs.

## Quality Checks

The current project includes linting, unit tests, production build validation,
and dependency auditing.

```bash
npm run lint
npm run test
npm run build
npm audit
```

## Deployment

The app is ready for Vercel deployment.

Before deploying, add the production environment variables in Vercel and add the
deployed domain to Neon Auth trusted domains. This is required for login,
signup, email confirmation, and password reset redirects to work correctly.

Set `APP_URL` to the production URL, for example:

```env
APP_URL=https://your-project.vercel.app
```

For scheduled email reminders, configure `RESEND_API_KEY`,
`REMINDER_FROM_EMAIL`, and `CRON_SECRET`.

## Notes

`docs/legacy-supabase/` contains an older Supabase-targeted reminder approach.
It is kept only for reference and is not used by the current Neon-based app.

`docs/neon-auth-notes.md` contains details about the current Neon Auth setup.

---

Built with Next.js, TypeScript, Tailwind CSS, Drizzle ORM, React Query, Neon,
and a steady respect for finishing the small details.
