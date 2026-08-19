-- Staff can delete leads from the portal (bulk selection UI).
--
-- Deletion is the destructive endpoint of the spam pipeline: quarantining as
-- 'spam' stays the default, reversible action; delete exists to purge what
-- nobody will ever restore — bot waves and test entries. The portal asks for
-- confirmation before calling this, and the policy restricts it to the same
-- staff allowlist that gates reading.

grant delete on public.leads to authenticated;

drop policy if exists "staff delete leads" on public.leads;
create policy "staff delete leads"
  on public.leads
  for delete
  to authenticated
  using (public.is_portal_staff());
