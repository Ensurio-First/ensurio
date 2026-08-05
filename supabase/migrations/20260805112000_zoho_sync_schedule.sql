-- Scheduled CRM sync.
--
-- The manual "Sync now" button authenticates with the pressing staff member's
-- JWT and needs none of this. Cron has no user, so it presents a shared secret
-- instead — kept in the vault rather than in the job definition, so `cron.job`
-- stays readable and rotating the secret needs no schedule change.
--
-- Requires a vault secret named `zoho_sync_secret` whose value matches the
-- ZOHO_SYNC_SECRET edge function secret. The function raises if it is missing,
-- because the alternative is a cron entry quietly posting an empty header and
-- collecting a 401 three times a day where nobody is looking.

create extension if not exists pg_net;
create extension if not exists pg_cron;

create or replace function public.trigger_zoho_sync(p_mode text default 'incremental')
returns bigint
language plpgsql
security definer
set search_path = public, net, vault, pg_temp
as $$
declare
  v_secret text;
  v_request bigint;
begin
  select decrypted_secret into v_secret
  from vault.decrypted_secrets where name = 'zoho_sync_secret';

  if v_secret is null or v_secret = '' then
    raise exception 'zoho_sync_secret is missing from the vault';
  end if;

  select net.http_post(
    url     := 'https://vyymqfvfaslzyongjpna.supabase.co/functions/v1/zoho-sync',
    headers := jsonb_build_object(
                 'Content-Type', 'application/json',
                 'x-sync-secret', v_secret),
    body    := jsonb_build_object('mode', p_mode),
    timeout_milliseconds := 240000
  ) into v_request;

  return v_request;
end
$$;

/*
 * Nobody but the scheduler needs this. A staff member who wants a sync presses
 * the button, which goes through the edge function's own allowlist check; this
 * carries the machine credential and must not be reachable from a browser.
 */
revoke execute on function public.trigger_zoho_sync(text) from public;
revoke execute on function public.trigger_zoho_sync(text) from anon, authenticated;

/* Dubai is UTC+4 and cron runs in UTC: 06:00 / 12:00 / 18:00 local. */
select cron.unschedule('zoho-sync-incremental')
where exists (select 1 from cron.job where jobname = 'zoho-sync-incremental');

select cron.schedule(
  'zoho-sync-incremental',
  '0 2,8,14 * * *',
  $job$ select public.trigger_zoho_sync('incremental') $job$
);

/*
 * A weekly full pass, because deletions are invisible to an incremental one:
 * Zoho stops returning a deleted record rather than reporting it, so only a
 * full run can tell that a policy is gone. Sunday 05:00 Dubai.
 */
select cron.unschedule('zoho-sync-full-weekly')
where exists (select 1 from cron.job where jobname = 'zoho-sync-full-weekly');

select cron.schedule(
  'zoho-sync-full-weekly',
  '0 1 * * 0',
  $job$ select public.trigger_zoho_sync('full') $job$
);
