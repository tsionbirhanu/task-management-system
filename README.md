# 🛠️ Workbench Task Manager

A modern task management system for creating, organizing, and tracking personal work.

## ✨ Features

* 🔐 **Authentication** — Sign up, sign in, email confirmation, and protected routes
* 🎯 **Task CRUD** — Create, edit, delete, and manage tasks
* 🖱️ **Drag & Drop** — Move tasks between columns with optimistic updates
* 🔎 **Search & Filters** — Quickly find and organize tasks
* ↕️ **Sorting** — Sort tasks by available board options
* 📋 **Board & List Views** — Switch between Kanban and list layouts
* 🔢 **Task Numbers** — Per-user numbers such as `#TM-0001`
* 🔔 **Notifications** — Overdue and due-soon task alerts
* 📧 **Email Reminders** — Optional daily reminders with Resend and Vercel Cron
* 🔗 **URL State** — Search, filters, sorting, and view mode persist in the URL

---

## 🧰 Tech Stack

| Category       | Technology              |
| -------------- | ----------------------- |
| Framework      | Next.js 14 — App Router |
| Language       | TypeScript              |
| Styling        | Tailwind CSS            |
| Database       | Neon Postgres           |
| ORM            | Drizzle                 |
| Authentication | Neon Auth               |
| Data Fetching  | TanStack React Query    |
| Validation     | Zod                     |
| Forms          | React Hook Form         |
| Email          | Resend                  |
| Scheduling     | Vercel Cron             |

---

## 🚀 Getting Started

### 1. Install

```bash
git clone <repo-url>
cd task-manager
npm install
```

> `.npmrc` uses `legacy-peer-deps=true` because `@neondatabase/auth` currently declares a peer dependency on `next >= 16`, while this project uses Next.js 14.
>
> See [`docs/neon-auth-notes.md`](docs/neon-auth-notes.md) before changing it.

### 2. Configure Neon

Create a Neon project and run:

```text
db/schema.sql
```

in the Neon SQL Editor.

Then enable:

```text
Auth → Configuration
```

### 3. Configure Environment Variables

```bash
cp .env.example .env.local
```

| Variable                  | Required | Description                   |
| ------------------------- | :------: | ----------------------------- |
| `DATABASE_URL`            |     ✅    | Pooled Neon connection string |
| `NEON_AUTH_BASE_URL`      |     ✅    | Neon Auth configuration URL   |
| `NEON_AUTH_COOKIE_SECRET` |     ✅    | 32+ character secret          |
| `RESEND_API_KEY`          |     —    | Email reminders               |
| `REMINDER_FROM_EMAIL`     |     —    | Reminder sender               |
| `CRON_SECRET`             |     —    | Protects reminder endpoint    |
| `APP_URL`                 |     —    | Application URL for emails    |

Generate a cookie secret:

```bash
openssl rand -base64 32
```

The application also supports **preview mode** when the first three required variables are missing, allowing the UI to be developed before the backend is fully configured.

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## 📁 Project Structure

```text
app/
├── (app)/board/              # Protected task board
├── (auth)/                   # Login, signup, confirmation
└── api/
    ├── tasks/                # Task CRUD + status updates
    ├── auth/                 # Neon Auth + sign-out
    └── cron/                 # Reminder job

components/
├── auth/                     # Authentication forms
├── layout/                   # Header, notifications, theme, user menu
├── tasks/                    # Board, columns, cards, filters, lists
└── ui/                       # Generic UI components

hooks/
├── useTasks.ts               # React Query cache + mutations
└── useBoardParams.ts         # URL-based board state

lib/
├── api/                      # API helpers
├── auth/                     # Neon Auth
├── db/                       # Drizzle + database
├── email/                    # Reminder emails
├── validation/               # Zod schemas
├── reminders.ts              # Due-date logic
└── types.ts                  # Domain types

db/
└── schema.sql                # PostgreSQL source of truth
```

`components/ui/` contains only generic components. Task-specific components such as `DueBadge` and `PriorityBadge` live inside `components/tasks/`.

---

## 🧠 How It Works

### 🔗 URL as State

Search, filters, sorting, and board/list mode are stored in the URL through `useBoardParams`.

Example:

```text
/board?status=in-progress&priority=high&sort=due-date
```

This makes board views bookmarkable, shareable, and reload-safe.

---

### 🔐 Ownership

The browser never connects directly to the database.

Every API request:

1. Authenticates the user
2. Validates the request
3. Scopes database queries to the authenticated `user_id`
4. Executes through Drizzle

```text
Browser → Next.js API → Drizzle → Neon Postgres
```

---

### 🛡️ Validation

Zod validation runs on both the client and server.

```text
React Hook Form → Zod → User Input
                         ↓
                    API Request
                         ↓
                    Zod → Database
```

Client validation improves the experience; server validation is the actual rule.

---

### 🖱️ Optimistic Drag & Drop

When a task is moved, the UI updates immediately.

`useUpdateTaskStatus` updates the React Query cache first, then reconciles with the server. If the request fails, the previous state is restored.

Task positions use a **gap strategy**, so reordering generally updates only one database row.

---

### 🔢 Task Numbers

Tasks receive a per-user sequential number:

```text
#TM-0001
#TM-0002
#TM-0003
```

Numbers are generated by a PostgreSQL `BEFORE INSERT` trigger using a per-user advisory lock and a unique index as a final safeguard.

---

## 🔔 Due-Date Reminders

### In-App

A dedicated unfiltered query tracks tasks that are:

* Overdue
* Due within 24 hours

This powers the notification bell and due-soon toast.

Board statistics remain filtered to the tasks currently visible.

### Email

Email reminders are optional and use:

**Resend + Vercel Cron**

The daily job sends tasks due within the next 24 hours.

Configure:

```env
RESEND_API_KEY=
REMINDER_FROM_EMAIL=
APP_URL=
CRON_SECRET=
```

The cron job runs daily at **08:00 UTC**.

To trigger it manually:

```bash
curl \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://your-app/api/cron/reminders
```

The reminder system is idempotent, so repeated runs do not send duplicate reminders. Changing a task's due date automatically re-arms its reminder.

---

## 📝 Notes

### Neon Auth

See [`docs/neon-auth-notes.md`](docs/neon-auth-notes.md) for Next.js 14 compatibility details and authentication implementation notes.

### Legacy Supabase Code

The `supabase/` directory contains an older reminder implementation built for Supabase.

It is **not used by the current Neon implementation** and is kept only for reference.

---

## 🧪 Checks

Run linting:

```bash
npm run lint
```

Run the production build:

```bash
npm run build
```

---

<p align="center">
  Built with Next.js · TypeScript · Tailwind · Drizzle · React Query · Neon
</p>
