-- A local mirror of the CRM, so the portal stops reading Zoho on every render.
--
-- The Clients tab was reading live: one list call plus eight COQL aggregates
-- per view, two to five seconds, repeated every time someone switched tabs.
-- Zoho meters credits per org and caps token mints per ten minutes, so the cost
-- of that is not just latency -- it is an integration that falls over when the
-- tab is used the way a tab gets used.
--
-- Mirroring also buys something the live version could not do at all: ordering
-- and filtering by renewal date across the WHOLE book. Expiry lives on the
-- policy modules, so Zoho cannot sort a client query by it; Postgres can.

/* ── Clients ──────────────────────────────────────────────────────────── */

create table if not exists public.crm_clients (
  id          text primary key,          -- Zoho record id, not a local uuid
  name        text not null,
  email       text,
  phone       text,
  city        text,
  raw         jsonb,
  modified_at timestamptz,               -- Zoho Modified_Time; drives incremental sync
  synced_at   timestamptz not null default now()
);

comment on table public.crm_clients is
  'Mirror of the Zoho client module (Accounts). Written only by the zoho-sync function.';

create index if not exists crm_clients_name_idx on public.crm_clients (lower(name));
create index if not exists crm_clients_modified_idx on public.crm_clients (modified_at desc);

/* ── Policies ─────────────────────────────────────────────────────────── */

/*
 * All five modules flattened into one table. They disagree about field names
 * but not about what a policy is, and one table is what makes "every policy
 * expiring this month, across the book" a single query instead of five.
 *
 * `raw` keeps the untouched record. The resolved columns are the ones an
 * advisor reads; the rest of a Zoho policy is long, sparse and module-specific,
 * and throwing it away would mean a re-sync every time we wanted one more field.
 */
create table if not exists public.crm_policies (
  id            text primary key,        -- Zoho record id
  module        text not null,           -- Motor_Policies, Policy_Details, …
  module_label  text not null,
  legacy        boolean not null default false,
  /*
   * Deliberately NOT a foreign key. A policy can point at a client that the
   * Accounts pass has not reached yet, or at one deleted in Zoho, and a sync
   * that fails halfway because of referential integrity is worse than a row
   * that is briefly an orphan. The join is by index, and orphans are visible.
   */
  client_id     text,
  policy_number text,
  policy_type   text,
  insurer       text,
  status        text,
  premium       text,
  issued_on     date,
  expires_on    date,
  raw           jsonb,
  modified_at   timestamptz,
  synced_at     timestamptz not null default now()
);

comment on table public.crm_policies is
  'Mirror of every Zoho policy module, flattened. Written only by the zoho-sync function.';

create index if not exists crm_policies_client_idx  on public.crm_policies (client_id);
create index if not exists crm_policies_expires_idx on public.crm_policies (expires_on);
create index if not exists crm_policies_module_idx  on public.crm_policies (module);
-- The renewal query is "live cover, not yet expired, soonest first" and is run
-- on every page of the Clients tab, so it gets its own partial index.
create index if not exists crm_policies_live_expiry_idx
  on public.crm_policies (expires_on)
  where legacy = false and expires_on is not null;

/* ── Sync log ─────────────────────────────────────────────────────────── */

/*
 * When the last sync ran, whether it worked, and what it touched. The portal
 * shows this: a mirror with no visible freshness is a screen that quietly goes
 * stale, and an advisor cannot tell the difference between "no policies" and
 * "nothing has synced since Tuesday".
 */
create table if not exists public.crm_sync_runs (
  id            bigint generated always as identity primary key,
  started_at    timestamptz not null default now(),
  finished_at   timestamptz,
  ok            boolean,
  mode          text not null default 'incremental',   -- incremental | full
  clients_seen  integer not null default 0,
  policies_seen integer not null default 0,
  api_calls     integer not null default 0,
  error         text,
  detail        jsonb
);

create index if not exists crm_sync_runs_started_idx on public.crm_sync_runs (started_at desc);

/* ── Summary view ─────────────────────────────────────────────────────── */

/*
 * The Clients table in one query: the policy count spanning all five modules
 * (the choice made when this was built -- a record linked to the client is a
 * record linked to the client), and the next renewal from the live modules
 * only, because an archive that expired in 2022 is not a renewal.
 *
 * security_invoker so the view is subject to the CALLER'S RLS on the base
 * tables rather than the view owner's. Without it a view is a hole straight
 * through the policies below.
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
  count(p.id)                                                          as policy_count,
  count(p.id) filter (where not p.legacy)                              as live_policy_count,
  count(p.id) filter (where not p.legacy
                        and p.expires_on >= current_date)              as active_policy_count,
  min(p.expires_on) filter (where not p.legacy
                              and p.expires_on >= current_date)        as next_expiry
from public.crm_clients c
left join public.crm_policies p on p.client_id = c.id
group by c.id, c.name, c.email, c.phone, c.city, c.synced_at;

comment on view public.crm_client_summary is
  'One row per client with policy totals and the next renewal date. Counts span all modules; next_expiry considers live modules only.';

/* ── Access ───────────────────────────────────────────────────────────── */

/*
 * Read for allowlisted staff, writes for nobody.
 *
 * There is no insert/update/delete policy anywhere here on purpose. These
 * tables are a mirror: the CRM is the system of record, and a row edited in the
 * portal would be silently overwritten by the next sync while looking like it
 * had been saved. Only the sync function writes, with the service-role key,
 * which bypasses RLS.
 */
alter table public.crm_clients    enable row level security;
alter table public.crm_policies   enable row level security;
alter table public.crm_sync_runs  enable row level security;

drop policy if exists "staff read crm clients" on public.crm_clients;
create policy "staff read crm clients"
  on public.crm_clients for select to authenticated
  using (public.is_portal_staff());

drop policy if exists "staff read crm policies" on public.crm_policies;
create policy "staff read crm policies"
  on public.crm_policies for select to authenticated
  using (public.is_portal_staff());

drop policy if exists "staff read sync runs" on public.crm_sync_runs;
create policy "staff read sync runs"
  on public.crm_sync_runs for select to authenticated
  using (public.is_portal_staff());

-- Supabase grants these to anon/authenticated by default on new public tables.
-- Read is governed by the policies above; write must not be reachable at all.
revoke insert, update, delete on public.crm_clients   from anon, authenticated;
revoke insert, update, delete on public.crm_policies  from anon, authenticated;
revoke insert, update, delete on public.crm_sync_runs from anon, authenticated;
revoke all on public.crm_clients   from anon;
revoke all on public.crm_policies  from anon;
revoke all on public.crm_sync_runs from anon;
