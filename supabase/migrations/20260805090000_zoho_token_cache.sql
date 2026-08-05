-- A shared home for the Zoho access token.
--
-- Zoho rate-limits how many access tokens one refresh token may mint in a
-- rolling ten-minute window, and answers `Access Denied` for the rest of it
-- once the limit is passed. The Clients tab tripped that in about a minute:
-- the token cache lived in an edge function module variable, so every cold
-- isolate minted its own, and within an isolate five concurrent module reads
-- all missed the empty cache and minted five more.
--
-- One row, shared by every isolate. A token now costs one mint an hour for the
-- whole project rather than one per isolate per burst.
create schema if not exists private;

create table if not exists private.zoho_token (
  id           smallint    primary key default 1 check (id = 1),
  access_token text        not null,
  expires_at   timestamptz not null,
  updated_at   timestamptz not null default now()
);

comment on table private.zoho_token is
  'Single shared Zoho access token. Written by edge functions via zoho_token_put(), never from a browser.';

-- Belt and braces. `private` is not in PostgREST's exposed schema list, so the
-- table has no REST surface at all; RLS with no policies means that even if the
-- schema were exposed one day, nothing could read it but the service role.
alter table private.zoho_token enable row level security;

/*
 * The only two doors in. security definer so the caller needs no rights on the
 * private schema, and search_path is pinned so an unqualified name cannot be
 * resolved through a caller-controlled path.
 */
create or replace function public.zoho_token_get()
returns table (access_token text, expires_at timestamptz)
language sql
stable
security definer
set search_path = private, pg_temp
as $$
  select t.access_token, t.expires_at from zoho_token t where t.id = 1;
$$;

create or replace function public.zoho_token_put(p_token text, p_expires_at timestamptz)
returns void
language sql
volatile
security definer
set search_path = private, pg_temp
as $$
  insert into zoho_token (id, access_token, expires_at, updated_at)
  values (1, p_token, p_expires_at, now())
  on conflict (id) do update
    set access_token = excluded.access_token,
        expires_at   = excluded.expires_at,
        updated_at   = now();
$$;

/*
 * A bearer token for the whole CRM is not something a signed-in advisor should
 * be able to read out of the database and replay against Zoho directly. Postgres
 * grants EXECUTE to PUBLIC on new functions, so PUBLIC has to be revoked first
 * -- revoking anon and authenticated alone would leave the inherited grant.
 */
revoke execute on function public.zoho_token_get() from public;
revoke execute on function public.zoho_token_get() from anon, authenticated;
grant  execute on function public.zoho_token_get() to service_role;

revoke execute on function public.zoho_token_put(text, timestamptz) from public;
revoke execute on function public.zoho_token_put(text, timestamptz) from anon, authenticated;
grant  execute on function public.zoho_token_put(text, timestamptz) to service_role;
