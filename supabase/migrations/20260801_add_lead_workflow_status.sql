-- A workflow status the team maintains by hand in the table editor, so a lead
-- can look up where their enquiry stands using the reference we gave them.
--
-- Deliberately a plain text column with a check constraint rather than an enum:
-- the team will want to add stages, and altering an enum is more friction than
-- this is worth.

alter table public.leads
  add column if not exists lead_status text not null default 'received';

alter table public.leads
  drop constraint if exists leads_lead_status_check;

alter table public.leads
  add constraint leads_lead_status_check
  check (lead_status in ('received', 'contacted', 'in-review', 'advising', 'closed'));

comment on column public.leads.lead_status is
  'Workflow stage shown to the lead via reference lookup: received | contacted | in-review | advising | closed';

create index if not exists leads_lead_status_idx on public.leads (lead_status);
