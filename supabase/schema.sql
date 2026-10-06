-- ============================================================================
-- Nexgen website: database setup
--
-- Run this whole file once in the Supabase SQL editor
-- (Dashboard → SQL Editor → New query → paste → Run).
-- It is safe to run again: every statement checks before it creates.
--
-- The security model, in one paragraph:
--   The website server saves enquiries using the SECRET key, which bypasses
--   row level security. People read enquiries through the admin dashboard
--   using their OWN login, and the policies below let a login see anything
--   only if its row in `public.users` has role = 'admin'. Signing up creates
--   a row with role = 'user'. Nobody can change their own role from the
--   website; it is changed here, in Supabase. So the database itself, not
--   just the website code, decides who can see enquiries.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 1. Enquiries
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id            bigint generated always as identity primary key,
  reference     text        not null unique,
  received_at   timestamptz not null default now(),
  name          text        not null,
  company       text,
  email         text        not null,
  phone         text        not null,
  facility_type text        not null,
  location      text,
  message       text,
  -- Present when the visitor used the estimator; recalculated on the server.
  estimate      jsonb,
  status        text        not null default 'new'
                check (status in ('new', 'contacted', 'quoted', 'won', 'lost', 'spam'))
);

-- Columns added for the admin dashboard.
alter table public.enquiries
  add column if not exists notes text check (char_length(notes) <= 5000);

alter table public.enquiries
  add column if not exists updated_at timestamptz not null default now();

-- One lower-cased column holding everything the dashboard search looks at.
-- The database keeps it up to date; the app searches a single column.
alter table public.enquiries
  add column if not exists search_text text generated always as (
    lower(
      name || ' ' || coalesce(company, '') || ' ' || email || ' ' || phone
      || ' ' || reference || ' ' || coalesce(location, '')
    )
  ) stored;

create index if not exists enquiries_received_at_idx
  on public.enquiries (received_at desc);

create index if not exists enquiries_status_idx
  on public.enquiries (status, received_at desc);

comment on table public.enquiries is
  'Website enquiries. Written by the site server using the secret key; read by admins only. Contains personal information.';


-- ---------------------------------------------------------------------------
-- 2. Users and roles
--    One row per login, created automatically when someone signs up.
--    role = 'user'  : a normal signed-in account. Sees nothing special.
--    role = 'admin' : can open the enquiry dashboard.
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  role       text        not null default 'user'
             check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

comment on table public.users is
  'One row per login. Set role to admin here in Supabase to give dashboard access; the website cannot change roles.';

-- Keeps public.users in step with Supabase's own auth.users table.
-- Deliberately minimal: if this function ever failed, sign-up itself would fail.
create or replace function public.handle_auth_user_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.users (id, email)
    values (new.id, new.email)
    on conflict (id) do nothing;
  else
    update public.users set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.handle_auth_user_change() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_change();

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row execute function public.handle_auth_user_change();

-- Logins that existed before this file was run.
insert into public.users (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- Upgrade path from the first version of this file, which kept admins in a
-- separate table: carry those people over as admins, then remove the table.
do $$
begin
  if to_regclass('public.admins') is not null then
    update public.users set role = 'admin'
    where id in (select user_id from public.admins);
    drop table public.admins;
  end if;
end $$;

-- True when the person making the request has role = 'admin'.
-- "security definer" lets the function read the role without giving anyone
-- access to other people's rows; it only ever answers about the caller.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;


-- ---------------------------------------------------------------------------
-- 3. Change history
--    Written by a database trigger, so it cannot be skipped or edited from
--    the website. It records who did what, never the enquirer's details.
-- ---------------------------------------------------------------------------
create table if not exists public.enquiry_events (
  id          bigint generated always as identity primary key,
  -- Not a foreign key on purpose: the record must survive the enquiry being deleted.
  enquiry_id  bigint      not null,
  reference   text        not null,
  action      text        not null
              check (action in ('status_changed', 'notes_changed', 'deleted')),
  from_status text,
  to_status   text,
  actor_id    uuid,
  actor_email text,
  at          timestamptz not null default now()
);

create index if not exists enquiry_events_enquiry_idx
  on public.enquiry_events (enquiry_id, at desc);

create or replace function public.record_enquiry_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  actor_mail text := (select auth.jwt() ->> 'email');
begin
  if tg_op = 'DELETE' then
    insert into public.enquiry_events (enquiry_id, reference, action, from_status, actor_id, actor_email)
    values (old.id, old.reference, 'deleted', old.status, actor, actor_mail);
    return old;
  end if;

  if new.status is distinct from old.status then
    insert into public.enquiry_events (enquiry_id, reference, action, from_status, to_status, actor_id, actor_email)
    values (new.id, new.reference, 'status_changed', old.status, new.status, actor, actor_mail);
  end if;

  if new.notes is distinct from old.notes then
    insert into public.enquiry_events (enquiry_id, reference, action, actor_id, actor_email)
    values (new.id, new.reference, 'notes_changed', actor, actor_mail);
  end if;

  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.record_enquiry_event() from public, anon, authenticated;

drop trigger if exists enquiries_record_update on public.enquiries;
create trigger enquiries_record_update
  before update on public.enquiries
  for each row execute function public.record_enquiry_event();

drop trigger if exists enquiries_record_delete on public.enquiries;
create trigger enquiries_record_delete
  after delete on public.enquiries
  for each row execute function public.record_enquiry_event();


-- ---------------------------------------------------------------------------
-- 4. Counts per status, for the dashboard's pipeline strip.
--    "security invoker" means the caller's own permissions apply, so a
--    non-admin gets an empty result.
-- ---------------------------------------------------------------------------
create or replace function public.enquiry_status_counts()
returns table (status text, total bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select e.status, count(*) from public.enquiries e group by e.status;
$$;

revoke all on function public.enquiry_status_counts() from public, anon;
grant execute on function public.enquiry_status_counts() to authenticated;


-- ---------------------------------------------------------------------------
-- 5. Row level security and privileges
-- ---------------------------------------------------------------------------
alter table public.enquiries      enable row level security;
alter table public.users          enable row level security;
alter table public.enquiry_events enable row level security;

-- Start from nothing, then grant only what the dashboard needs.
revoke all on public.enquiries      from anon, authenticated;
revoke all on public.users          from anon, authenticated;
revoke all on public.enquiry_events from anon, authenticated;

grant select, delete          on public.enquiries      to authenticated;
-- Admins can change the status and notes, and nothing else.
grant update (status, notes)  on public.enquiries      to authenticated;
grant select                  on public.enquiry_events to authenticated;
-- A signed-in person may read their own row, and change nothing in it.
grant select                  on public.users          to authenticated;

drop policy if exists "Admins can read enquiries"   on public.enquiries;
drop policy if exists "Admins can update enquiries" on public.enquiries;
drop policy if exists "Admins can delete enquiries" on public.enquiries;
drop policy if exists "Admins can read history"     on public.enquiry_events;
drop policy if exists "People can read their own row" on public.users;

create policy "Admins can read enquiries"
  on public.enquiries for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can update enquiries"
  on public.enquiries for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete enquiries"
  on public.enquiries for delete to authenticated
  using ((select public.is_admin()));

create policy "Admins can read history"
  on public.enquiry_events for select to authenticated
  using ((select public.is_admin()));

create policy "People can read their own row"
  on public.users for select to authenticated
  using (id = (select auth.uid()));

-- There is no insert, update or delete policy on public.users, and no such
-- privilege is granted. Roles can only be changed here, in Supabase.


-- ============================================================================
-- HOW TO MAKE SOMEONE AN ADMIN
--
-- 1. The person creates a login on the website at /admin/signup.
-- 2. Either open Table Editor → users and change their role to admin,
--    or run this with their email address:
--
--      update public.users set role = 'admin'
--      where email = 'person@nexgenfm.com.au';
--
-- To remove access, set the role back to user:
--
--      update public.users set role = 'user'
--      where email = 'person@nexgenfm.com.au';
-- ============================================================================
