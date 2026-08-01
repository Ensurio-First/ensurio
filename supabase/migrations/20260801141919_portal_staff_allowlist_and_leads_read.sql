-- Internal staff portal: authorisation.
--
-- Authentication (Supabase Auth) only proves someone controls an email address.
-- It does not make them staff. This allowlist is the authorisation half: a
-- signed-up address that is not listed here reads zero rows, so leaving public
-- signups on is survivable rather than fatal.

create table if not exists public.portal_staff (
  email      text primary key,
  full_name  text,
  role       text not null default 'advisor'
             check (role in ('advisor', 'admin')),
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.portal_staff is
  'Allowlist of email addresses permitted to use the internal portal. Authentication proves identity; membership here grants access.';

-- Emails from the JWT arrive exactly as the user typed them at sign-in, so a
-- capitalised address would silently miss a lowercase allowlist row.
create unique index if not exists portal_staff_email_lower_idx
  on public.portal_staff (lower(email));

/*
 * security definer so the policy can read portal_staff without every caller
 * needing its own select policy — otherwise the policy on leads would recurse
 * into a policy on portal_staff.
 *
 * search_path is pinned: a security definer function that resolves unqualified
 * names through the caller's search_path can be tricked into running an
 * attacker's table.
 */
create or replace function public.is_portal_staff()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.portal_staff s
    where lower(s.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and s.active
  );
$$;

comment on function public.is_portal_staff() is
  'True when the current JWT belongs to an active allowlisted staff member.';

revoke execute on function public.is_portal_staff() from anon;
grant execute on function public.is_portal_staff() to authenticated;

-- leads: staff read.
--
-- RLS on this table has had no policies at all, which closed the public write
-- path the site used to rely on. That stays closed: this adds read for
-- authenticated staff only, and nothing for anon.
alter table public.leads enable row level security;

drop policy if exists "staff read leads" on public.leads;
create policy "staff read leads"
  on public.leads
  for select
  to authenticated
  using (public.is_portal_staff());

-- portal_staff: staff may see the roster.
--
-- No insert/update/delete policy anywhere in this migration, deliberately. The
-- roster is the thing that grants access to every lead in the table, so it is
-- changed with the service-role key (Supabase dashboard, or a future admin
-- edge function) and never from the browser. A staff account that could edit
-- the allowlist could grant access to anyone.
alter table public.portal_staff enable row level security;

drop policy if exists "staff read roster" on public.portal_staff;
create policy "staff read roster"
  on public.portal_staff
  for select
  to authenticated
  using (public.is_portal_staff());
