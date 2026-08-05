-- The renewal book: contact, view, and the trigger that keeps them in step.
--
-- The renewal contact lives on the POLICY, not the client. Zoho's Accounts
-- module carries no email at all in this org — all 323 clients have none — but
-- 337 of 341 live future policies carry `Renewal_Receiver` and every one
-- carries `Secondary_Email`. That is the brokerage's actual practice: each
-- policy names the person to chase, which is right when one company's motor
-- fleet and medical scheme go to different people.
--
-- Promoted out of `raw` into a column so it can be indexed, counted and shown,
-- and backfilled from `raw` rather than re-synced, because the sync already
-- stored the whole record.

alter table public.crm_policies add column if not exists renewal_email text;

update public.crm_policies
set renewal_email = nullif(trim(coalesce(
      nullif(trim(raw->>'Renewal_Receiver'), ''),
      nullif(trim(raw->>'Secondary_Email'), ''),
      '')), '')
where renewal_email is null and raw is not null;

create index if not exists crm_policies_renewal_email_idx
  on public.crm_policies (renewal_email) where renewal_email is not null;

/*
 * Derive it on the way in too.
 *
 * The backfill filled existing rows, but a policy synced tomorrow would land
 * with the column empty until the edge function is redeployed — and a column
 * that is right for 3,187 rows and silently wrong for the newest ones is worse
 * than one that is obviously missing. Coalesces rather than overwrites, so once
 * the function sends the value that wins and this becomes a no-op.
 */
create or replace function public.crm_policies_set_renewal_email()
returns trigger
language plpgsql
as $$
begin
  if new.renewal_email is null and new.raw is not null then
    new.renewal_email := nullif(trim(coalesce(
      nullif(trim(new.raw->>'Renewal_Receiver'), ''),
      nullif(trim(new.raw->>'Secondary_Email'), ''),
      '')), '');
  end if;
  return new;
end
$$;

drop trigger if exists crm_policies_renewal_email on public.crm_policies;
create trigger crm_policies_renewal_email
  before insert or update on public.crm_policies
  for each row execute function public.crm_policies_set_renewal_email();

/*
 * Current cover with a real expiry, one row per policy, joined to its client.
 * Legacy modules are excluded: an endorsement ledger row with no expiry and a
 * 2021 archive entry are not renewals and would only inflate every count.
 */
create or replace view public.crm_renewals
with (security_invoker = true) as
select
  p.id,
  p.module,
  p.module_label,
  p.policy_number,
  p.policy_type,
  p.insurer,
  p.status,
  p.premium,
  p.issued_on,
  p.expires_on,
  (p.expires_on - current_date)::int                as days_to_expiry,
  p.renewal_email,
  -- Renewal_Receiver is a free-text field, so some of it is names or notes
  -- rather than addresses. Saying which is which here keeps the UI honest
  -- about how many of these could actually be contacted.
  (p.renewal_email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
                                                    as renewal_email_valid,
  c.id    as client_id,
  c.name  as client_name,
  c.phone as client_phone,
  c.city  as client_city
from public.crm_policies p
join public.crm_clients c on c.id = p.client_id
where p.legacy = false
  and p.expires_on is not null;

comment on view public.crm_renewals is
  'Live-book policies with a real expiry, joined to their client, with the per-policy renewal contact.';

/*
 * The client list showed a blank Email column for every row, because Accounts
 * has none. The useful stand-in is the renewal contact on their most recent
 * policy — who you would actually write to. Appended rather than slotted in
 * beside `email`: CREATE OR REPLACE VIEW can only add columns at the end.
 */
create or replace view public.crm_client_summary
with (security_invoker = true) as
select
  c.id,
  c.name,
  c.email,
  c.phone,
  c.city,
  c.synced_at,
  count(p.id)                                                        as policy_count,
  count(p.id) filter (where not p.legacy)                            as live_policy_count,
  count(p.id) filter (where not p.legacy
                        and p.expires_on >= current_date)            as active_policy_count,
  min(p.expires_on) filter (where not p.legacy
                              and p.expires_on >= current_date)      as next_expiry,
  (select pp.renewal_email
     from public.crm_policies pp
    where pp.client_id = c.id and pp.renewal_email is not null
    order by pp.expires_on desc nulls last
    limit 1)                                                         as contact_email
from public.crm_clients c
left join public.crm_policies p on p.client_id = c.id
group by c.id, c.name, c.email, c.phone, c.city, c.synced_at;
