-- Close the default PUBLIC execute grant on is_portal_staff().
--
-- The previous migration revoked execute from `anon`, which does nothing on its
-- own: Postgres grants EXECUTE on new functions to PUBLIC, and anon inherits it
-- through that rather than through a direct grant. The function had to be
-- revoked from PUBLIC first, then granted back to the one role that needs it.
--
-- Low impact -- an anon caller has no JWT email, so it returned false -- but it
-- was reachable at /rest/v1/rpc/is_portal_staff by anyone with the anon key.
revoke execute on function public.is_portal_staff() from public;
revoke execute on function public.is_portal_staff() from anon;
grant  execute on function public.is_portal_staff() to authenticated;
