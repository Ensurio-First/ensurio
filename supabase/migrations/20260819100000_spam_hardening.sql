-- Spam hardening: forensic columns, a quarantine status, and the index the
-- per-IP rate limit needs.
--
-- The Aug 2026 spam wave could not be traced to a source because a lead row
-- records nothing about where it came from. These columns close that gap and
-- are what the rate limit in submit-lead counts against.

alter table public.leads
  add column if not exists ip text,
  add column if not exists user_agent text,
  add column if not exists origin text,
  add column if not exists spam_reason text;

comment on column public.leads.ip is
  'First hop of x-forwarded-for as seen by submit-lead. Forensics and rate limiting.';
comment on column public.leads.user_agent is
  'User-Agent header at submission.';
comment on column public.leads.origin is
  'Origin header at submission — which page the browser said it was on.';
comment on column public.leads.spam_reason is
  'Why submit-lead quarantined this row (null on clean leads). Comma-separated signal names, kept so the heuristics can be tuned against real traffic.';

-- 'spam' joins the workflow statuses. Quarantined rows keep all their data so
-- a false positive is one status click in the portal, not a lost client. The
-- public reference lookup masks this value (lead-status reports 'received').
alter table public.leads
  drop constraint if exists leads_lead_status_check;

alter table public.leads
  add constraint leads_lead_status_check
  check (lead_status in ('received', 'contacted', 'in-review', 'advising', 'closed', 'spam'));

comment on column public.leads.lead_status is
  'Workflow stage: received | contacted | in-review | advising | closed | spam (quarantined — hidden from the portal''s default view, masked in the public lookup)';

-- The rate limit is "count this IP''s rows in the last hour".
create index if not exists leads_ip_created_at_idx on public.leads (ip, created_at desc);
