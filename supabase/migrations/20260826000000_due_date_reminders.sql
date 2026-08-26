-- Opt-in email reminder scaffold for Supabase projects.
-- Run this only after the tasks table exists in Supabase and auth.users owns
-- the user accounts whose ids match public.tasks.user_id.

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

create or replace function public.due_date_reminder_recipients()
returns table (
  user_id text,
  email text,
  tasks jsonb
)
language sql
security definer
set search_path = public, auth
as $$
  select
    t.user_id,
    u.email,
    jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'ticket_no', t.ticket_no,
        'title', t.title,
        'due_date', t.due_date
      )
      order by t.due_date asc
    ) as tasks
  from public.tasks t
  join auth.users u on u.id::text = t.user_id
  where t.status <> 'done'
    and t.due_date >= now()
    and t.due_date < now() + interval '24 hours'
    and u.email is not null
  group by t.user_id, u.email;
$$;

revoke all on function public.due_date_reminder_recipients() from public;
grant execute on function public.due_date_reminder_recipients() to service_role;

-- Schedule this in the Supabase SQL editor after replacing the placeholders.
-- Keep service-role credentials in Vault or Supabase secrets; do not commit
-- real project URLs, anon keys, or service-role keys here.
--
-- select cron.schedule(
--   'due-date-reminders-hourly',
--   '0 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://<project-ref>.supabase.co/functions/v1/due-date-reminders',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer <service-role-or-function-invoke-token>'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
