-- Phase 0b: extend `leads` so interactive tools can store their answers,
-- a computed report, and the outcome of the confirmation email.
--
-- `details` (already present) keeps the raw answer payload for back-compat.
-- `report`  holds the computed result (score, findings, benchmark).
-- `score`/`tool_id` are denormalised out of `report` so the team can sort and
-- filter leads in the Supabase table editor without digging through JSON.

alter table public.leads
  add column if not exists tool_id      text,
  add column if not exists score        integer,
  add column if not exists report       jsonb,
  add column if not exists reference    text,
  add column if not exists email_status text;

comment on column public.leads.tool_id      is 'Identifier of the interactive tool that produced this lead, e.g. policy-fitness-check';
comment on column public.leads.score        is 'Computed diagnostic score 0-100 (null for plain contact forms)';
comment on column public.leads.report       is 'Computed result: { score, band, findings[], benchmark }';
comment on column public.leads.reference    is 'Human-readable reference shown to the lead and quoted in the email, e.g. IF-7K2M9X';
comment on column public.leads.email_status is 'sent | lead-only | team-only | failed | skipped (no provider configured) | direct-insert (edge function unreachable)';

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_tool_id_idx    on public.leads (tool_id) where tool_id is not null;
create unique index if not exists leads_reference_key on public.leads (reference) where reference is not null;
