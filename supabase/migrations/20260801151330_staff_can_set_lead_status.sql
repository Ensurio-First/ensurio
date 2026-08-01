-- Let portal staff move a lead through its workflow -- and nothing else.
--
-- An RLS policy cannot restrict which COLUMNS an update touches; it only decides
-- which rows. Supabase grants UPDATE on every column to `authenticated` by
-- default, so an UPDATE policy on its own would let any staff account rewrite a
-- lead's name, email, report, or its reference number. The column grant is what
-- actually scopes this, and the policy decides who.

revoke update on public.leads from authenticated;
revoke update on public.leads from anon;

grant update (lead_status) on public.leads to authenticated;

-- Who moved it, and when. The team shares mailboxes (webservices@, consult@),
-- so "it says contacted" is not much use without knowing who said so.
alter table public.leads
  add column if not exists lead_status_updated_at timestamptz,
  add column if not exists lead_status_updated_by text;

comment on column public.leads.lead_status_updated_by is
  'Email from the JWT of whoever last changed lead_status. Set by trigger -- staff have no grant on this column, so it cannot be forged from the client.';

/*
 * Stamped by a trigger rather than by the client, precisely because staff must
 * not be able to write these columns. There is no grant on them, so the only
 * way they change is through this function.
 */
create or replace function public.stamp_lead_status_change()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.lead_status is distinct from old.lead_status then
    new.lead_status_updated_at := now();
    new.lead_status_updated_by := nullif(auth.jwt() ->> 'email', '');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_stamp_lead_status_change on public.leads;
create trigger trg_stamp_lead_status_change
  before update on public.leads
  for each row
  execute function public.stamp_lead_status_change();

drop policy if exists "staff update lead status" on public.leads;
create policy "staff update lead status"
  on public.leads
  for update
  to authenticated
  using (public.is_portal_staff())
  with check (public.is_portal_staff());

/*
 * Verified against the live database before shipping:
 *   staff sets lead_status                -> ok, stamped with their email
 *   staff sets name                       -> permission denied for table leads
 *   staff sets lead_status_updated_by     -> permission denied for table leads
 *   non-staff sets lead_status            -> 0 rows
 */
