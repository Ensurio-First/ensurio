-- Renewals grouped by one of three dimensions, for a window.
--
-- A function rather than a view because the window and the dimension are
-- parameters, and rather than grouping in the browser because that would mean
-- shipping every row to count them — a thousand records to render twenty
-- numbers, on every change of window.
--
-- The three questions — which line, which product, which insurer — are the same
-- shape of question, so they are one function. Three would be three places to
-- fix when the window logic changes.
--
-- security invoker, so the caller's RLS on crm_policies and crm_clients still
-- decides what is counted. A definer function here would quietly become a way
-- to read the whole book without an allowlist row.

drop function if exists public.crm_renewal_breakdown(integer, integer);

create or replace function public.crm_renewal_breakdown(
  p_from      integer default 0,
  p_to        integer default null,
  p_dimension text    default 'type'
)
returns table (
  label       text,
  parent      text,
  total       bigint,
  contactable bigint
)
language sql
stable
security invoker
set search_path = public, pg_temp
as $$
  select
    -- Blank is a real answer: a policy with no type or no insurer recorded
    -- still renews, and hiding it would make the breakdown disagree with the
    -- window count above it.
    case p_dimension
      when 'line'    then r.module_label
      when 'insurer' then coalesce(nullif(trim(r.insurer), ''),     '(unspecified)')
      else                coalesce(nullif(trim(r.policy_type), ''), '(unspecified)')
    end                                             as label,
    -- Only the type breakdown nests: a product belongs to a line, whereas an
    -- insurer spans them and would be wrong to file under one.
    case when p_dimension = 'type' then r.module_label else null end as parent,
    count(*)                                        as total,
    count(*) filter (where r.renewal_email_valid)   as contactable
  from public.crm_renewals r
  where (p_from is null or r.days_to_expiry >= p_from)
    and (p_to   is null or r.days_to_expiry <= p_to)
  group by 1, 2
  order by count(*) desc, 1;
$$;

comment on function public.crm_renewal_breakdown(integer, integer, text) is
  'Renewal counts within a day-offset window, grouped by line, policy type or insurer.';

revoke execute on function public.crm_renewal_breakdown(integer, integer, text) from anon;
grant  execute on function public.crm_renewal_breakdown(integer, integer, text) to authenticated;
