# 🛠️ Workbench Task Manager

<p align="center">
  <strong>A quiet, focused ticket board for personal work orders.</strong>
</p>

<p align="center">
  Create, organize, search, filter, sort, and move your work orders through a clean interactive workspace.
</p>

<p align="center">
  <a href="#-features">Features</a>
  ·
  <a href="#-tech-stack">Tech Stack</a>
  ·
  <a href="#-getting-started">Getting Started</a>
  ·
  <a href="#-architecture">Architecture</a>
  ·
  <a href="#-how-it-works">How It Works</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql" alt="Neon Postgres" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=for-the-badge" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/React_Query-Data_Fetching-FF4154?style=for-the-badge&logo=reactquery" alt="React Query" />
  <img src="https://img.shields.io/badge/Neon-Auth-00E599?style=for-the-badge" alt="Neon Auth" />
</p>

---

## ✨ Overview

**Workbench** is a personal task management system built around the idea of a quiet, focused ticket board.

Instead of overwhelming the user with unnecessary complexity, Workbench keeps the core workflow simple:

```text
Create → Organize → Work → Complete
```

Tickets can be:

* ✏️ Created and edited
* 🗑️ Deleted
* 🖱️ Dragged between columns
* 🔎 Searched
* 🎯 Filtered
* ↕️ Sorted
* 📋 Viewed as a board or list
* 🔔 Tracked through due-date reminders

Every ticket receives a **per-user work-order number**.

```text
#TM-0001
#TM-0002
#TM-0003
...
```

Your first ticket is `#TM-0001`, and another user's first ticket can also be `#TM-0001`.

---

## 🎯 Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication

* Neon Auth
* Sign up
* Sign in
* Email confirmation
* Protected application surface
* Session-aware route handlers

</td>
<td width="50%">

### 🎫 Ticket Management

* Create tickets
* Edit tickets
* Delete tickets
* Status management
* Priority
* Due dates
* Per-user ticket numbers

</td>
</tr>

<tr>
<td>

### 🖱️ Interactive Board

* Drag-and-drop
* Optimistic updates
* Column-based workflow
* Gap-based ordering
* Instant UI feedback

</td>
<td>

### 🔎 Powerful Navigation

* Search
* Filtering
* Sorting
* Board view
* List view
* URL-persisted state
* Shareable board URLs

</td>
</tr>

<tr>
<td>

### 🔔 Notifications

* Overdue ticket detection
* Due-soon detection
* Notification bell
* Due-soon toast
* Unfiltered notification counts

</td>
<td>

### 📧 Email Reminders

* Optional Resend integration
* Daily reminder digest
* Vercel Cron
* Idempotent delivery
* Automatic reminder re-arming

</td>
</tr>
</table>

---

# 🧰 Tech Stack

| Category       | Technology                  |
| -------------- | --------------------------- |
| Framework      | **Next.js 14 — App Router** |
| Language       | **TypeScript**              |
| Styling        | **Tailwind CSS**            |
| Database       | **Neon Postgres**           |
| ORM            | **Drizzle ORM**             |
| Authentication | **Neon Auth**               |
| Data Fetching  | **TanStack React Query**    |
| Validation     | **Zod**                     |
| Forms          | **React Hook Form**         |
| Email          | **Resend**                  |
| Scheduling     | **Vercel Cron**             |

---

# 🚀 Getting Started

## 1. Clone & Install

```bash
git clone <repo-url>
cd task-manager
npm install
```

> **Important:** `.npmrc` sets `legacy-peer-deps=true`.
>
> This is currently required because `@neondatabase/auth` declares a peer dependency on `next >= 16`, while Workbench is running on Next.js 14.
>
> See [`docs/neon-auth-notes.md`](docs/neon-auth-notes.md) before removing it.

---

## 2. Create a Neon Project

Create a project in Neon and run:

```text
db/schema.sql
```

inside the **Neon SQL Editor**.

This file is the database **DDL source of truth**.

All statements are guarded so the schema can safely be re-run when changes are introduced.

---

## 3. Enable Neon Auth

Open your Neon Console:

```text
Auth → Configuration
```

and enable authentication.

---

## 4. Configure Environment Variables

Create your local environment file:

```bash
cp .env.example .env.local
```

Then configure:

| Variable                  | Required | Purpose                               |
| ------------------------- | :------: | ------------------------------------- |
| `DATABASE_URL`            |     ✅    | Pooled Neon connection string         |
| `NEON_AUTH_BASE_URL`      |     ✅    | Neon Auth configuration URL           |
| `NEON_AUTH_COOKIE_SECRET` |     ✅    | Session cookie secret, 32+ characters |
| `RESEND_API_KEY`          |     —    | Email reminders                       |
| `REMINDER_FROM_EMAIL`     |     —    | Reminder sender address               |
| `CRON_SECRET`             |     —    | Protects the reminder endpoint        |
| `APP_URL`                 |     —    | Application URL in reminder emails    |

Generate a cookie secret:

```bash
openssl rand -base64 32
```

### 🧪 Preview Mode

Workbench can run in **preview mode** when the first three required environment variables are missing.

In preview mode:

```text
┌─────────────────────────────────┐
│          PREVIEW MODE           │
├─────────────────────────────────┤
│                                 │
│  ✓ Board renders                │
│  ✓ UI can be developed          │
│  ✓ Authentication guard stands  │
│    down                         │
│  ✓ Preview banner is shown      │
│                                 │
└─────────────────────────────────┘
```

This is intentional.

It allows the UI to be developed before the complete backend infrastructure has been provisioned.

---

## 5. Start Development

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

# 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │       Browser        │
                         │                      │
                         │ Board / List / Auth  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     Next.js 14       │
                         │     App Router       │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
              ┌──────────┐   ┌────────────┐   ┌────────────┐
              │  Neon    │   │  API Routes│   │   Cron     │
              │   Auth   │   │            │   │ Reminders  │
              └──────────┘   └─────┬──────┘   └──────┬─────┘
                                   │                 │
                                   ▼                 ▼
                            ┌──────────────────────────┐
                            │       Drizzle ORM        │
                            └────────────┬─────────────┘
                                         │
                                         ▼
                               ┌──────────────────┐
                               │   Neon Postgres  │
                               └──────────────────┘
```

---

# 📁 Project Structure

```text
app/
├── (app)/
│   └── board/                 # Signed-in application surface
│
├── (auth)/
│   ├── login/                 # Login
│   ├── signup/                # Signup
│   └── confirm-email/         # Email confirmation
│
└── api/
    ├── tasks/                 # Task CRUD + drag/drop status
    ├── auth/                  # Neon Auth REST + sign-out
    └── cron/                  # Due-date reminder job

components/
├── auth/                      # Authentication forms
├── layout/                    # TopBar, notifications, theme, user menu
├── tasks/                     # Board, columns, cards, filters, list, modals
└── ui/                        # Generic reusable UI primitives

hooks/
├── useTasks.ts                # React Query task cache + mutations
└── useBoardParams.ts          # URL-driven board state

lib/
├── api/                       # Route-handler helpers
├── auth/                      # Neon Auth wiring
├── db/                        # Drizzle client + database logic
├── email/                     # Reminder digest + Resend delivery
├── validation/                # Shared Zod schemas
├── reminders.ts               # Due/overdue definitions
└── types.ts                   # Domain types + URL guards

db/
└── schema.sql                 # PostgreSQL DDL source of truth
```

### Component boundaries

`components/ui/` is intentionally generic.

It contains primitives such as:

```text
Button
Input
Modal
Badge
...
```

These components know nothing about tasks.

Task-specific UI belongs inside:

```text
components/tasks/
```

For example:

```text
DueBadge
PriorityBadge
TaskCard
TaskColumn
TaskFilters
```

This keeps the UI system reusable and prevents task-specific logic from leaking into generic components.

---

# 🧠 How It Works

## 🔗 1. The URL Is the State

Filters, search, sorting, and board/list mode live inside the URL query string.

`useBoardParams` reads and writes the state.

For example:

```text
/board?status=in-progress&priority=high&sort=due-date
```

This makes the current board state:

* 🔖 Bookmarkable
* 🔗 Shareable
* 🔄 Reload-safe
* 📑 Easy to reproduce
* 🧭 Navigation-friendly

When default options are active, they are omitted so the normal URL stays clean:

```text
/board
```

---

## 🔐 2. Ownership Is Enforced in Route Handlers

Workbench does not use PostgreSQL Row-Level Security.

The Neon connection authenticates as one database role, meaning an RLS policy would not have a database-level user identity to compare against.

Instead, every database query is explicitly scoped to the authenticated user:

```sql
WHERE user_id = <session user>
```

The browser never talks directly to Postgres.

```text
Browser
   │
   ▼
Next.js API
   │
   ├── Authenticate
   ├── Validate
   ├── Check ownership
   │
   ▼
Drizzle
   │
   ▼
Neon Postgres
```

The API layer is therefore the application's single data boundary.

---

# 🛡️ 3. Validation Runs Twice

Validation intentionally happens on both sides.

### Client

Forms use:

```text
React Hook Form
       │
       ▼
      Zod
```

This gives users immediate feedback.

### Server

Every route handler parses incoming data again:

```text
Request
   │
   ▼
Zod
   │
   ▼
Business Logic
   │
   ▼
Database
```

The client validation improves UX.

**The server validation is the rule.**

---

# 🖱️ 4. Drag-and-Drop Is Optimistic

When a ticket is moved, the UI updates immediately.

```text
        User drags card
              │
              ▼
        Pointer released
              │
              ▼
     ┌────────────────────┐
     │ Update UI instantly│
     └─────────┬──────────┘
               │
               ▼
       Patch React Query
               │
               ▼
          API request
          /         \
       Success      Failure
          │            │
          ▼            ▼
     Reconcile      Restore
```

`useUpdateTaskStatus` patches cached lists before the server responds.

If the server rejects the change, the previous snapshot is restored.

### Gap-based ordering

Ticket positions use a gap strategy.

Instead of renumbering an entire column after every reorder, the application assigns a position between neighboring tickets.

Therefore:

```text
Move 1 card
     ↓
Update 1 row
```

instead of:

```text
Move 1 card
     ↓
Renumber entire column
     ↓
Update many rows
```

---

# 🔢 5. Ticket Numbers Are Database-Generated

Every ticket receives a per-user work-order number:

```text
#TM-0001
#TM-0002
#TM-0003
```

Two different users can therefore both have:

```text
User A → #TM-0001

User B → #TM-0001
```

The number is generated by a PostgreSQL `BEFORE INSERT` trigger.

The trigger:

1. Acquires a per-user advisory lock
2. Finds the next available number
3. Assigns it to the ticket
4. Inserts the record
5. Uses a unique index as the final safety net

This prevents concurrent ticket creation from producing duplicate numbers.

---

# 🔔 Due-Date Reminders

Workbench has two reminder layers:

```text
                 Due-Date System
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
      🔔 In-App              📧 Email
      Notifications          Reminders
```

---

## 🔔 In-App Reminders

In-app reminders are enabled by default.

A dedicated **unfiltered query** counts open tickets that are:

* overdue
* due within 24 hours

This means notification counts describe **every ticket owned by the user**, regardless of the filters currently active on the board.

The notification system powers:

* 🔔 Notification bell
* ⚠️ Overdue count
* ⏰ Due-soon count
* 💬 One due-soon toast per browser session

Cards also display:

* Due badges
* Overdue indicators
* Overdue edge treatment

### Board statistics vs notifications

These intentionally behave differently.

| System              | Scope                     |
| ------------------- | ------------------------- |
| 🔔 Notifications    | All relevant tickets      |
| 📊 Board statistics | Tickets currently visible |
| 🎫 Task cards       | Current board view        |

This prevents filtering the board from accidentally hiding important reminders.

---

# 📧 Email Reminders

Email reminders are completely optional.

Workbench can send a daily digest containing tickets due within the next 24 hours.

```text
Workbench
    │
    ▼
Vercel Cron
    │
    ▼
/api/cron/reminders
    │
    ▼
Resend
    │
    ▼
📧 User
```

If the email environment variables are blank, the endpoint simply reports itself as unconfigured.

Nothing else changes.

---

## ⚙️ Email Setup

### 1. Update the database

Re-run:

```text
db/schema.sql
```

This adds:

```text
task_owners
tasks.reminder_sent_for
```

### 2. Create Resend account

Create a Resend account, verify a sending domain, and generate an API key.

### 3. Configure environment

```env
RESEND_API_KEY=
REMINDER_FROM_EMAIL=
APP_URL=
CRON_SECRET=
```

### 4. Deploy

`vercel.json` schedules the reminder job daily at:

```text
08:00 UTC
```

You can manually trigger the endpoint:

```bash
curl \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app/api/cron/reminders
```

---

# 📮 Why Email Addresses Are Stored

Neon Auth keeps user records inside its own service.

Unlike the legacy Neon Auth setup, there is no:

```text
neon_auth.users_sync
```

table available for this application to join against.

The beta SDK's user listing is also behind a session-authorized admin route, which is not suitable for a background job.

Therefore, Workbench maintains:

```text
user_id → email
```

inside:

```text
task_owners
```

Every authenticated page view records the verified user's email.

The reminder job then joins against this local mapping.

Only verified addresses are stored because the write occurs after the authentication verification guard.

---

# ⏰ Why the Reminder Job Runs Daily

Vercel's Hobby plan allows one cron execution per day.

Therefore, Workbench uses a 24-hour reminder window.

The job is intentionally **idempotent**.

Each task records the `due_date` for which a reminder was last sent.

```text
                 Ticket
                   │
                   ▼
            Due within 24h?
               /       \
             No         Yes
             │           │
             ▼           ▼
           Skip       Already sent?
                       /       \
                     Yes        No
                      │          │
                      ▼          ▼
                    Skip       Send
```

This provides three useful guarantees:

* Repeated runs do not send duplicate emails.
* Missed runs can be recovered by the next run.
* Moving a deadline re-arms the reminder automatically.

Delivery is still best-effort because scheduled jobs can occasionally be missed or repeated.

---

# 🌍 Running Without Vercel

Workbench does not depend on Vercel for the application itself.

If you use another scheduler:

1. Delete `vercel.json`.
2. Schedule the endpoint once per day.
3. Send the same authorization header.

```http
Authorization: Bearer $CRON_SECRET
```

---

# 🗄️ Database Source of Truth

The canonical database definition lives at:

```text
db/schema.sql
```

It contains the PostgreSQL DDL used by Workbench.

All statements are guarded, allowing the schema to be safely re-run as the project evolves.

---

# ⚠️ Legacy Supabase Code

The:

```text
supabase/
```

directory contains an earlier Supabase-targeted version of the reminder system.

It **cannot run against the current Neon implementation**.

The old implementation depends on:

```text
auth.users
pg_net
Supabase-specific database behavior
```

Neon does not provide those same capabilities.

The directory is retained only as a record of the previous implementation.

---

# 📝 Neon Auth Notes

For details about running:

```text
@neondatabase/auth
```

with Next.js 14, see:

[`docs/neon-auth-notes.md`](docs/neon-auth-notes.md)

It documents:

* Why Edge Middleware is not used
* Next.js 14 compatibility considerations
* The current authentication setup
* What to re-check during future upgrades

---

# 🧪 Checks

Before committing or deploying, run:

```bash
npm run lint
```

and:

```bash
npm run build
```

A clean lint and production build should be treated as the baseline verification for the project.

---

# 🔄 Ticket Lifecycle

The primary workflow is intentionally simple:

```text
             ┌──────────────┐
             │    CREATE    │
             │    TICKET    │
             └──────┬───────┘
                    │
                    ▼
             ┌──────────────┐
             │    TO DO     │
             └──────┬───────┘
                    │
                    │ Drag
                    ▼
             ┌──────────────┐
             │ IN PROGRESS  │
             └──────┬───────┘
                    │
                    │ Complete
                    ▼
             ┌──────────────┐
             │     DONE     │
             └──────────────┘
```

At any point, a ticket can be:

```text
Edit
  ↓
Search
  ↓
Filter
  ↓
Sort
  ↓
Reorder
  ↓
Move
  ↓
Complete
```

---

# 📊 System at a Glance

| Capability       | Implementation                |
| ---------------- | ----------------------------- |
| Authentication   | Neon Auth                     |
| Session handling | Server-side session reads     |
| Task CRUD        | Next.js API routes            |
| Database         | Neon Postgres                 |
| ORM              | Drizzle                       |
| Client cache     | React Query                   |
| Validation       | Zod                           |
| Forms            | React Hook Form               |
| Drag-and-drop    | Optimistic mutations          |
| Ordering         | Gap-based positions           |
| Ticket numbering | PostgreSQL trigger            |
| Ownership        | Server-side `user_id` scoping |
| Notifications    | React Query + reminder logic  |
| Email            | Resend                        |
| Scheduled jobs   | Vercel Cron                   |
| Board state      | URL query parameters          |

---

# 💡 Design Principles

Workbench is built around one simple principle:

> **The task manager should stay quiet so the work can stay loud.**

The application prioritizes:

* Clear information hierarchy
* Fast interactions
* Minimal visual noise
* Predictable navigation
* Immediate feedback
* Reliable server-side validation
* Shareable application state
* Strong ownership boundaries

The board remains the center of the experience while authentication, notifications, reminders, and infrastructure stay out of the user's way.

---

# 🗺️ What's Inside

```text
Workbench
│
├── 🔐 Authentication
│   ├── Login
│   ├── Signup
│   └── Email confirmation
│
├── 🎫 Tasks
│   ├── CRUD
│   ├── Status
│   ├── Priority
│   ├── Due dates
│   └── Ticket numbers
│
├── 📋 Views
│   ├── Board
│   └── List
│
├── 🔎 Organization
│   ├── Search
│   ├── Filters
│   └── Sorting
│
├── 🔔 Notifications
│   ├── Overdue
│   └── Due soon
│
├── 📧 Email
│   ├── Resend
│   └── Vercel Cron
│
└── 🗄️ Infrastructure
    ├── Neon Postgres
    ├── Drizzle ORM
    └── Neon Auth
```

---

## 📄 License

Add your preferred license here if this repository is intended to be publicly distributed.

---

<p align="center">
  Built with Next.js, TypeScript, Tailwind, Drizzle, React Query, Neon Postgres, and Neon Auth.
</p>

<p align="center">
  <strong>Workbench — Focus on the work.</strong>
</p>
