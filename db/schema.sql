-- ===========================================================================
-- Workbench -- Postgres schema (Neon)
--
-- Paste into the Neon SQL editor (Console -> your project -> SQL Editor) and
-- run. Wrapped in a transaction, every statement guarded, safe to re-run.
--
-- This file is the DDL source of truth. lib/db/schema.ts mirrors it as typed
-- Drizzle tables for querying -- change one and you must change the other.
--
-- Ticket numbers are per user: your first work order is #TM-0001 and so is
-- everyone else's. ticket_no holds the integer, the app pads it for display.
-- ===========================================================================

begin;

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
-- Powers the ILIKE '%term%' search on titles.
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- 2. Enums
-- ---------------------------------------------------------------------------
-- CREATE TYPE has no IF NOT EXISTS, hence the catalog check.
do $$
begin
  if not exists (
    select 1
      from pg_type t
      join pg_namespace n on n.oid = t.typnamespace
     where t.typname = 'task_status' and n.nspname = 'public'
  ) then
    create type public.task_status as enum ('todo', 'in_progress', 'done');
  end if;

  if not exists (
    select 1
      from pg_type t
      join pg_namespace n on n.oid = t.typnamespace
     where t.typname = 'task_priority' and n.nspname = 'public'
  ) then
    create type public.task_priority as enum ('low', 'medium', 'high');
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 3. Tables
-- ---------------------------------------------------------------------------
create table if not exists public.tasks (
  id          uuid primary key default gen_random_uuid(),

  -- Text, not uuid: Better Auth issues string user ids. Deliberately NOT a
  -- foreign key into the auth schema -- see the note at the bottom of this file.
  user_id     text not null,

  -- Filled by assign_ticket_no() below. NOT NULL is safe: BEFORE INSERT
  -- triggers run ahead of constraint checks.
  ticket_no   integer not null,

  title       text not null check (char_length(title) between 1 and 200),
  description text,
  status      public.task_status   not null default 'todo',
  priority    public.task_priority not null default 'medium',
  due_date    timestamptz,

  -- The due_date we last emailed a reminder about, null if we never have.
  -- Comparing it against due_date is the whole dedupe mechanism: a second run
  -- on the same day finds nothing left to send, and moving a deadline re-arms
  -- the reminder on its own with no extra bookkeeping.
  reminder_sent_for timestamptz,

  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on column public.tasks.ticket_no is
  'Per-user work order number. Displayed as #TM-0001.';
comment on column public.tasks.position is
  'Sort order within a status column. Lower sorts first.';
comment on column public.tasks.reminder_sent_for is
  'due_date value a reminder email was last sent for. Makes the job idempotent.';

-- Databases created before reminders shipped get the column here.
alter table public.tasks
  add column if not exists reminder_sent_for timestamptz;

-- Where to email each user.
--
-- Neon Auth keeps its user records in its own service. Unlike legacy Neon Auth
-- (Stack Auth) there is no neon_auth.users_sync table in this database, and the
-- current SDK exposes no service-key lookup -- so a background job has no way
-- to turn a user_id into an address. The app does know the address on every
-- authenticated request, so it records it here and the reminder job joins
-- against this table instead of against the auth provider.
--
-- Deliberately not a foreign key into the auth schema, for the same reason
-- tasks.user_id is not one: see the note at the bottom of this file.
create table if not exists public.task_owners (
  user_id    text primary key,
  email      text not null,
  updated_at timestamptz not null default now()
);

comment on table public.task_owners is
  'user_id -> email, recorded from live sessions so background jobs can send mail.';

-- ---------------------------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------------------------
-- The board query is "my tickets, in this column, in order". The leading
-- (user_id, status) prefix serves plain status filters too, so this one index
-- covers both shapes.
create index if not exists tasks_user_status_position_idx
  on public.tasks (user_id, status, position);

-- Trigram index for substring search: WHERE title ILIKE '%belt%'.
create index if not exists tasks_title_trgm_idx
  on public.tasks using gin (title gin_trgm_ops);

-- Backstop for ticket numbering: if two inserts ever raced past the advisory
-- lock, the second fails loudly instead of duplicating a number.
create unique index if not exists tasks_user_id_ticket_no_key
  on public.tasks (user_id, ticket_no);

-- The reminder job scans "open, due in the next 24h" across every user, which
-- is the one query in the app with no user_id in front of it. Partial, so the
-- index only carries rows that could ever be reminded about.
create index if not exists tasks_due_reminder_idx
  on public.tasks (due_date)
  where status <> 'done' and due_date is not null;

-- ---------------------------------------------------------------------------
-- 5. Triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.assign_ticket_no()
returns trigger
language plpgsql
as $$
begin
  -- Respect an explicit number (data import, restore).
  if new.ticket_no is not null then
    return new;
  end if;

  -- Serialize concurrent inserts for this one user so two tickets can never
  -- claim the same number. Transaction-scoped, released on commit, and keyed
  -- per user -- two different people inserting at once never block each other.
  perform pg_advisory_xact_lock(hashtext(new.user_id)::bigint);

  select coalesce(max(t.ticket_no), 0) + 1
    into new.ticket_no
    from public.tasks t
   where t.user_id = new.user_id;

  return new;
end;
$$;

drop trigger if exists tasks_assign_ticket_no on public.tasks;
create trigger tasks_assign_ticket_no
  before insert on public.tasks
  for each row execute function public.assign_ticket_no();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

commit;

-- ===========================================================================
-- Notes on what changed coming from Supabase
--
-- 1. No Row Level Security. Supabase gave every request a JWT that Postgres
--    could read through auth.uid(), so RLS could enforce ownership in the
--    database. A plain Neon connection string authenticates as one role for
--    the whole app, so an RLS policy here would have nothing to compare
--    against. Ownership is enforced in the route handlers instead: every query
--    is scoped with `where user_id = <session user>`.
--
--    That is a smaller loss than it sounds, because this app never queries the
--    database from the browser -- /app/api/* is the only data path, so there is
--    exactly one place to get it right. If you later want the database itself
--    to enforce it again, Neon RLS can pass a verified JWT into Postgres.
--
-- 2. No foreign key to the auth user table. Better Auth owns its own schema and
--    may migrate it; pointing a foreign key at another system's internal table
--    couples your data to their implementation detail. The trade is that
--    deleting a user no longer cascades their tickets -- that cleanup has to be
--    explicit. Once auth is running, confirm the real table name with:
--
--      select table_schema, table_name from information_schema.tables
--       where table_schema not in ('public','information_schema','pg_catalog');
--
--    and we can add the constraint deliberately if you want the cascade back.
-- ===========================================================================
